// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v5.0.0/contracts/proxy/utils/Initializable.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v5.0.0/contracts/proxy/utils/UUPSUpgradeable.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v5.0.0/contracts/access/OwnableUpgradeable.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/v5.0.0/contracts/utils/ReentrancyGuardUpgradeable.sol";


/**
 * @title ChatDApp
 * @notice Smart contract để chat 1:1 với CRUD đầy đủ
 * @dev Upgradeable contract sử dụng UUPS proxy pattern
 */
contract ChatDApp is 
    Initializable, 
    UUPSUpgradeable, 
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable 
{
    /*//////////////////////////////////////////////////////////////
                                 STRUCTS
    //////////////////////////////////////////////////////////////*/

    struct Message {
        address sender;
        uint40 timestamp;
        uint40 updatedAt;
        bool isDeleted;
        string content;
    }

    struct Chat {
        address user1;
        address user2;
        uint32 messageCount;
        bool exists;
    }

    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/

    mapping(bytes32 => Chat) private s_chats;
    mapping(bytes32 => Message[]) private s_messages;
    mapping(address => bytes32[]) private s_userChats;
    uint256 private s_messageFee;

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    event ChatCreated(
        bytes32 indexed chatId,
        address indexed user1,
        address indexed user2,
        uint256 timestamp
    );

    event MessageSent(
        bytes32 indexed chatId,
        address indexed sender,
        uint256 messageIndex,
        uint256 timestamp
    );

    event MessageUpdated(
        bytes32 indexed chatId,
        uint256 indexed messageIndex,
        address indexed sender,
        uint256 timestamp
    );

    event MessageDeleted(
        bytes32 indexed chatId,
        uint256 indexed messageIndex,
        address indexed sender,
        uint256 timestamp
    );

    event ChatDeleted(
        bytes32 indexed chatId,
        address indexed deletedBy,
        uint256 timestamp
    );

    event MessageFeeUpdated(uint256 oldFee, uint256 newFee);

    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/

    error ChatDApp__ChatAlreadyExists();
    error ChatDApp__ChatDoesNotExist();
    error ChatDApp__NotParticipant();
    error ChatDApp__InvalidAddress();
    error ChatDApp__EmptyMessage();
    error ChatDApp__InsufficientFee();
    error ChatDApp__SelfChat();
    error ChatDApp__MessageDoesNotExist();
    error ChatDApp__NotMessageSender();
    error ChatDApp__MessageAlreadyDeleted();

    /*//////////////////////////////////////////////////////////////
                               MODIFIERS
    //////////////////////////////////////////////////////////////*/

    modifier onlyParticipant(bytes32 chatId) {
        Chat storage chat = s_chats[chatId];
        if (msg.sender != chat.user1 && msg.sender != chat.user2) {
            revert ChatDApp__NotParticipant();
        }
        _;
    }

    modifier validAddress(address user) {
        if (user == address(0)) revert ChatDApp__InvalidAddress();
        _;
    }

    /*//////////////////////////////////////////////////////////////
                              INITIALIZER
    //////////////////////////////////////////////////////////////*/

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address initialOwner) external initializer {
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
        s_messageFee = 0;
    }

    /*//////////////////////////////////////////////////////////////
                           EXTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function createChat(address otherUser) 
        external 
        validAddress(otherUser)
        returns (bytes32 chatId) 
    {
        if (otherUser == msg.sender) revert ChatDApp__SelfChat();
        
        chatId = _generateChatId(msg.sender, otherUser);
        
        if (s_chats[chatId].exists) {
            revert ChatDApp__ChatAlreadyExists();
        }

        s_chats[chatId] = Chat({
            user1: msg.sender,
            user2: otherUser,
            messageCount: 0,
            exists: true
        });

        s_userChats[msg.sender].push(chatId);
        s_userChats[otherUser].push(chatId);

        emit ChatCreated(chatId, msg.sender, otherUser, block.timestamp);
    }

    function sendMessage(bytes32 chatId, string calldata content)
        external
        payable
        nonReentrant
        onlyParticipant(chatId)
    {
        if (!s_chats[chatId].exists) {
            revert ChatDApp__ChatDoesNotExist();
        }
        if (bytes(content).length == 0) {
            revert ChatDApp__EmptyMessage();
        }
        if (msg.value < s_messageFee) {
            revert ChatDApp__InsufficientFee();
        }

        Message memory newMessage = Message({
            sender: msg.sender,
            timestamp: uint40(block.timestamp),
            updatedAt: 0,
            isDeleted: false,
            content: content
        });

        s_messages[chatId].push(newMessage);
        
        uint256 messageIndex = s_messages[chatId].length - 1;
        unchecked {
            ++s_chats[chatId].messageCount;
        }

        emit MessageSent(chatId, msg.sender, messageIndex, block.timestamp);
    }

    function updateMessage(
        bytes32 chatId,
        uint256 messageIndex,
        string calldata newContent
    ) external onlyParticipant(chatId) {
        if (!s_chats[chatId].exists) {
            revert ChatDApp__ChatDoesNotExist();
        }
        if (messageIndex >= s_messages[chatId].length) {
            revert ChatDApp__MessageDoesNotExist();
        }
        if (bytes(newContent).length == 0) {
            revert ChatDApp__EmptyMessage();
        }

        Message storage message = s_messages[chatId][messageIndex];
        
        if (message.sender != msg.sender) {
            revert ChatDApp__NotMessageSender();
        }
        if (message.isDeleted) {
            revert ChatDApp__MessageAlreadyDeleted();
        }

        message.content = newContent;
        message.updatedAt = uint40(block.timestamp);

        emit MessageUpdated(chatId, messageIndex, msg.sender, block.timestamp);
    }

    function deleteMessage(bytes32 chatId, uint256 messageIndex)
        external
        onlyParticipant(chatId)
    {
        if (!s_chats[chatId].exists) {
            revert ChatDApp__ChatDoesNotExist();
        }
        if (messageIndex >= s_messages[chatId].length) {
            revert ChatDApp__MessageDoesNotExist();
        }

        Message storage message = s_messages[chatId][messageIndex];
        
        if (message.sender != msg.sender) {
            revert ChatDApp__NotMessageSender();
        }
        if (message.isDeleted) {
            revert ChatDApp__MessageAlreadyDeleted();
        }

        message.isDeleted = true;
        message.content = "";
        message.updatedAt = uint40(block.timestamp);

        emit MessageDeleted(chatId, messageIndex, msg.sender, block.timestamp);
    }

    function deleteChat(bytes32 chatId) 
        external 
        onlyParticipant(chatId) 
    {
        if (!s_chats[chatId].exists) {
            revert ChatDApp__ChatDoesNotExist();
        }

        Chat storage chat = s_chats[chatId];
        
        _removeChatFromUser(chat.user1, chatId);
        _removeChatFromUser(chat.user2, chatId);
        
        delete s_messages[chatId];
        delete s_chats[chatId];

        emit ChatDeleted(chatId, msg.sender, block.timestamp);
    }

    /*//////////////////////////////////////////////////////////////
                            ADMIN FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function setMessageFee(uint256 newFee) external onlyOwner {
        uint256 oldFee = s_messageFee;
        s_messageFee = newFee;
        emit MessageFeeUpdated(oldFee, newFee);
    }

    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdraw failed");
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyOwner
    {}

    /*//////////////////////////////////////////////////////////////
                            VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function getChat(bytes32 chatId) 
        external 
        view 
        returns (Chat memory) 
    {
        return s_chats[chatId];
    }

    function getMessage(bytes32 chatId, uint256 messageIndex)
        external
        view
        onlyParticipant(chatId)
        returns (Message memory)
    {
        if (messageIndex >= s_messages[chatId].length) {
            revert ChatDApp__MessageDoesNotExist();
        }
        return s_messages[chatId][messageIndex];
    }

    function getMessages(
        bytes32 chatId,
        uint256 offset,
        uint256 limit
    ) external view returns (Message[] memory) {
        Message[] storage allMessages = s_messages[chatId];
        uint256 totalMessages = allMessages.length;

        if (offset >= totalMessages) {
            return new Message[](0);
        }

        uint256 end = offset + limit;
        if (end > totalMessages) {
            end = totalMessages;
        }

        uint256 resultLength = end - offset;
        Message[] memory result = new Message[](resultLength);

        for (uint256 i = 0; i < resultLength; ) {
            result[i] = allMessages[offset + i];
            unchecked {
                ++i;
            }
        }

        return result;
    }

    function getMessageCount(bytes32 chatId) 
        external 
        view 
        returns (uint256) 
    {
        return s_messages[chatId].length;
    }

    function getUserChats(address user) 
        external 
        view 
        returns (bytes32[] memory) 
    {
        return s_userChats[user];
    }

    function getChatId(address user1, address user2) 
        external 
        pure 
        returns (bytes32) 
    {
        return _generateChatId(user1, user2);
    }

    function getMessageFee() external view returns (uint256) {
        return s_messageFee;
    }

    function getVersion() external pure returns (string memory) {
        return "1.0.0";
    }

    /*//////////////////////////////////////////////////////////////
                          INTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function _generateChatId(address user1, address user2)
        internal
        pure
        returns (bytes32)
    {
        return user1 < user2
            ? keccak256(abi.encodePacked(user1, user2))
            : keccak256(abi.encodePacked(user2, user1));
    }

    function _removeChatFromUser(address user, bytes32 chatId) internal {
        bytes32[] storage userChats = s_userChats[user];
        uint256 length = userChats.length;
        
        for (uint256 i = 0; i < length; ) {
            if (userChats[i] == chatId) {
                userChats[i] = userChats[length - 1];
                userChats.pop();
                break;
            }
            unchecked {
                ++i;
            }
        }
    }
}