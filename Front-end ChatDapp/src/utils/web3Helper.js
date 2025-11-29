import Web3 from 'web3';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contracts/ChatDAppABI';

let web3;
let contract;

// ✅ Export đúng cách
export const initWeb3 = async () => {
  try {
    if (!window.ethereum) {
      console.warn('⚠️ MetaMask not installed');
      throw new Error('Please install MetaMask!');
    }
    
    web3 = new Web3(window.ethereum);
    contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
    
    console.log('✅ Web3 initialized');
    console.log('📍 Contract:', CONTRACT_ADDRESS);
    
    return { web3, contract };
  } catch (error) {
    console.error('❌ Web3 init error:', error);
    throw error;
  }
};

// ✅ Đảm bảo các functions khác cũng export
export const connectWallet = async () => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask not found');
    }
    
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    
    console.log('✅ Wallet connected:', accounts[0]);
    return accounts[0];
  } catch (error) {
    console.error('❌ Wallet connection failed:', error);
    throw error;
  }
};

export const getChatId = async (user1, user2) => {
  try {
    const chatId = await contract.methods.getChatId(user1, user2).call();
    return chatId;
  } catch (error) {
    console.error('❌ getChatId error:', error);
    throw error;
  }
};

export const createChat = async (otherUser, fromAddress) => {
  try {
    const tx = await contract.methods.createChat(otherUser).send({ 
      from: fromAddress
    });
    return tx;
  } catch (error) {
    console.error('❌ createChat error:', error);
    throw error;
  }
};

export const sendMessage = async (chatId, content, fromAddress) => {
  try {
    const fee = await contract.methods.getMessageFee().call();
    const tx = await contract.methods.sendMessage(chatId, content).send({
      from: fromAddress,
      value: fee
    });
    return tx;
  } catch (error) {
    console.error('❌ sendMessage error:', error);
    throw error;
  }
};

export const getMessages = async (chatId, offset = 0, limit = 50) => {
  try {
    const messages = await contract.methods.getMessages(chatId, offset, limit).call();
    return messages;
  } catch (error) {
    console.error('❌ getMessages error:', error);
    throw error;
  }
};

export const getMessageCount = async (chatId) => {
  try {
    const count = await contract.methods.getMessageCount(chatId).call();
    return Number(count);
  } catch (error) {
    console.error('❌ getMessageCount error:', error);
    return 0;
  }
};

export const getUserChats = async (userAddress) => {
  try {
    const chatIds = await contract.methods.getUserChats(userAddress).call();
    return chatIds;
  } catch (error) {
    console.error('❌ getUserChats error:', error);
    return [];
  }
};

export const getChat = async (chatId) => {
  try {
    const chat = await contract.methods.getChat(chatId).call();
    return chat;
  } catch (error) {
    console.error('❌ getChat error:', error);
    throw error;
  }
};

export const deleteMessage = async (chatId, messageIndex, fromAddress) => {
  try {
    const tx = await contract.methods.deleteMessage(chatId, messageIndex).send({
      from: fromAddress
    });
    return tx;
  } catch (error) {
    console.error('❌ deleteMessage error:', error);
    throw error;
  }
};

export const updateMessage = async (chatId, messageIndex, newContent, fromAddress) => {
  try {
    const tx = await contract.methods.updateMessage(chatId, messageIndex, newContent).send({
      from: fromAddress
    });
    return tx;
  } catch (error) {
    console.error('❌ updateMessage error:', error);
    throw error;
  }
};
