import { useState, useEffect, useRef } from 'react';
import { connectWallet } from '../utils/web3Helper';

function WalletConnect({ onConnected }) {
  const [account, setAccount] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    checkConnection();
    
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());
    }

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const checkConnection = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        onConnected(accounts[0]);
      }
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      setAccount(null);
      onConnected(null);
    } else {
      setAccount(accounts[0]);
      onConnected(accounts[0]);
    }
  };

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const address = await connectWallet();
      setAccount(address);
      onConnected(address);
    } catch (error) {
      alert('Failed to connect wallet: ' + error.message);
    } finally {
      setConnecting(false);
    }
  };

  // ✅ CẬP NHẬT: Disconnect và quay về trang chủ
  const handleDisconnect = () => {
    setAccount(null);
    onConnected(null); // Trigger App.jsx reset state
    setShowDropdown(false);
    // App.jsx sẽ tự động hiển thị trang chủ khi account = null
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(account);
    alert('Address copied to clipboard!');
    setShowDropdown(false);
  };

  const formatAddress = (addr) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <div className="wallet-connect" ref={dropdownRef}>
      {!account ? (
        <button 
          onClick={handleConnect} 
          disabled={connecting}
          className="connect-btn"
        >
          {connecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      ) : (
        <div className="connected-container">
          <div 
            className="account-badge" 
            onClick={toggleDropdown}
          >
            <span className="wallet-icon">👛</span>
            {formatAddress(account)}
            <span className="dropdown-arrow">▼</span>
          </div>
          
          {showDropdown && (
            <div className="wallet-dropdown">
              <div className="dropdown-item wallet-info">
                <div className="full-address">
                  {account}
                </div>
              </div>
              <div 
                className="dropdown-item" 
                onClick={copyAddress}
              >
                <span className="item-icon">📋</span>
                Copy Address
              </div>
              <div 
                className="dropdown-item disconnect" 
                onClick={handleDisconnect}
              >
                <span className="item-icon">🔌</span>
                Disconnect
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default WalletConnect;
