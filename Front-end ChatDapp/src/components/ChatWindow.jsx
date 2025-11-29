import { useState, useEffect, useRef } from 'react';
import { 
  getMessages, 
  sendMessage, 
  deleteMessage,
  updateMessage,
  createChat,
  getMessageCount
} from '../utils/web3Helper';

const ChatWindow = ({ chatId, otherUser, account }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [chatExists, setChatExists] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editContent, setEditContent] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (chatId && account) {
      loadMessages();
      // Auto refresh every 5 seconds
      const interval = setInterval(loadMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [chatId, account]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    setLoading(true);
    try {
      const count = await getMessageCount(chatId);
      
      if (count > 0) {
        setChatExists(true);
        const msgs = await getMessages(chatId, 0, count);
        setMessages(msgs.map((msg, index) => ({
          ...msg,
          index,
          timestamp: Number(msg.timestamp),
          updatedAt: Number(msg.updatedAt),
          isDeleted: msg.isDeleted
        })));
      } else {
        setChatExists(false);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setChatExists(false);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      if (!chatExists) {
        await createChat(otherUser, account);
        setChatExists(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      await sendMessage(chatId, newMessage, account);
      setNewMessage('');
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      await loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  const handleMessageClick = (index, message) => {
    if (message.sender.toLowerCase() === account.toLowerCase() && !message.isDeleted) {
      setSelectedMessage(selectedMessage === index ? null : index);
    }
  };

  const handleEditClick = (index, message) => {
    setEditingMessage(index);
    setEditContent(message.content);
    setSelectedMessage(null);
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setEditContent('');
  };

  const handleSaveEdit = async (messageIndex) => {
    if (!editContent.trim()) {
      alert('Message cannot be empty');
      return;
    }

    try {
      await updateMessage(chatId, messageIndex, editContent, account);
      setEditingMessage(null);
      setEditContent('');
      await new Promise(resolve => setTimeout(resolve, 2000));
      await loadMessages();
    } catch (error) {
      console.error('Error updating message:', error);
      alert('Failed to update message: ' + error.message);
    }
  };

  const handleDeleteMessage = async (messageIndex) => {
    if (!window.confirm('Delete this message?')) return;

    try {
      await deleteMessage(chatId, messageIndex, account);
      setSelectedMessage(null);
      await new Promise(resolve => setTimeout(resolve, 2000));
      await loadMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message');
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatAddress = (addr) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-header-info">
          <div className="chat-avatar-large">
            {otherUser.substring(2, 4).toUpperCase()}
          </div>
          <div>
            <h3>{formatAddress(otherUser)}</h3>
            <p className="chat-address">{otherUser}</p>
          </div>
        </div>
      </div>

      <div className="chat-messages">
        {loading ? (
          <div className="loading-messages">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="empty-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isSender = msg.sender.toLowerCase() === account.toLowerCase();
            const isEditing = editingMessage === idx;
            
            return (
              <div
                key={idx}
                className={`message ${isSender ? 'message-sent' : 'message-received'} ${
                  msg.isDeleted ? 'message-deleted' : ''
                }`}
                onClick={() => handleMessageClick(idx, msg)}
              >
                {isEditing ? (
                  // Edit Mode
                  <div className="message-edit-container">
                    <textarea
                      className="message-edit-input"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      autoFocus
                    />
                    <div className="message-edit-actions">
                      <button 
                        className="save-edit-btn"
                        onClick={() => handleSaveEdit(idx)}
                      >
                        Save
                      </button>
                      <button 
                        className="cancel-edit-btn"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // Normal Display
                  <>
                    <div className="message-content">
                      {msg.isDeleted ? (
                        <em>Message deleted</em>
                      ) : (
                        msg.content
                      )}
                      {msg.updatedAt > 0 && !msg.isDeleted && (
                        <span className="edited-label"> (edited)</span>
                      )}
                    </div>
                    <div className="message-meta">
                      <span className="message-time">{formatTime(msg.timestamp)}</span>
                    </div>

                    {/* Action Menu */}
                    {selectedMessage === idx && isSender && !msg.isDeleted && (
                      <div className="message-actions">
                        <button
                          className="action-btn edit-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(idx, msg);
                          }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMessage(idx);
                          }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          className="chat-input"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={sending}
        />
        <button 
          type="submit" 
          className="send-btn"
          disabled={sending || !newMessage.trim()}
        >
          {sending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
