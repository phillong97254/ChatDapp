import { useState, useEffect } from 'react';
import WalletConnect from './components/WalletConnect';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import { initWeb3 } from './utils/web3Helper';
import './App.css';

function App() {
  const [account, setAccount] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [web3Ready, setWeb3Ready] = useState(false);

  // ✅ FIX: Thêm useEffect đúng cách
  useEffect(() => {
    const initializeWeb3 = async () => {
      try {
        await initWeb3();
        setWeb3Ready(true);
        console.log('✅ Web3 initialized');
      } catch (error) {
        console.error('❌ Web3 init failed:', error);
        setWeb3Ready(true); // Vẫn cho phép app chạy
      }
    };

    initializeWeb3();
  }, []); // ✅ Empty dependency array - chỉ chạy 1 lần

  const handleWalletConnected = (address) => {
    setAccount(address);
    if (!address) {
      setSelectedChat(null);
      setOtherUser(null);
    }
  };

  const handleSelectChat = (chatId, otherUserAddress) => {
    setSelectedChat(chatId);
    setOtherUser(otherUserAddress);
  };

  if (!web3Ready) {
    return (
      <div className="app loading-app">
        <div className="loading-spinner">
          <p>Initializing Web3...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="app-header">
        <h1>P2P Chat DApp</h1>
        <WalletConnect onConnected={handleWalletConnected} />
      </div>

      {!account ? (
        <div className="connect-prompt">
          <h2>Welcome to P2P Chat</h2>
          <p>Please connect your wallet to start chatting</p>
        </div>
      ) : (
        <div className="app-content">
          <ChatList
            account={account}
            onSelectChat={handleSelectChat}
          />
          {selectedChat && otherUser ? (
            <ChatWindow
              chatId={selectedChat}
              otherUser={otherUser}
              account={account}
            />
          ) : (
            <div className="no-chat-selected">
              <p>Select a chat or start a new conversation</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
