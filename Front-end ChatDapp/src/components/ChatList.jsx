import { useState, useEffect } from 'react';
import { getUserChats, getChat, getChatId } from '../utils/web3Helper';

const ChatList = ({ account, onSelectChat }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newChatAddress, setNewChatAddress] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (account) {
      loadChats();
    }
  }, [account]);

  const loadChats = async () => {
    setLoading(true);
    try {
      const chatIds = await getUserChats(account);
      const chatDetails = await Promise.all(
        chatIds.map(async (chatId) => {
          const chat = await getChat(chatId);
          const otherUser = chat.user1.toLowerCase() === account.toLowerCase() 
            ? chat.user2 
            : chat.user1;
          return {
            chatId,
            otherUser,
            messageCount: Number(chat.messageCount)
          };
        })
      );
      
      setChats(chatDetails);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartNewChat = async () => {
    if (!newChatAddress) {
      alert('Please enter a wallet address');
      return;
    }

    if (!newChatAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      alert('Invalid Ethereum address');
      return;
    }

    if (newChatAddress.toLowerCase() === account.toLowerCase()) {
      alert('Cannot chat with yourself!');
      return;
    }

    try {
      const chatId = await getChatId(account, newChatAddress);
      onSelectChat(chatId, newChatAddress);
      setNewChatAddress('');
    } catch (error) {
      console.error('Error starting chat:', error);
      alert('Failed to start chat');
    }
  };

  const formatAddress = (addr) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const filteredChats = chats.filter(chat => 
    chat.otherUser.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="chat-list">
      <div className="chat-list-header">
        <h2>Messages</h2>
        <input
          type="text"
          className="search-input"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="new-chat-section">
        <input
          type="text"
          placeholder="0x..."
          value={newChatAddress}
          onChange={(e) => setNewChatAddress(e.target.value)}
          className="new-chat-input"
        />
        <button onClick={handleStartNewChat} className="new-chat-btn">
          Start Chat
        </button>
      </div>

      <div className="chat-list-items">
        {loading ? (
          <div className="loading">Loading chats...</div>
        ) : filteredChats.length === 0 ? (
          <div className="empty-state">No chats yet. Start a new conversation!</div>
        ) : (
          filteredChats.map((chat) => (
            <div
              key={chat.chatId}
              className="chat-item"
              onClick={() => onSelectChat(chat.chatId, chat.otherUser)}
            >
              <div className="chat-avatar">
                {chat.otherUser.substring(2, 4).toUpperCase()}
              </div>
              <div className="chat-info">
                <div className="chat-name">{formatAddress(chat.otherUser)}</div>
                <div className="chat-preview">{chat.messageCount} messages</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;

