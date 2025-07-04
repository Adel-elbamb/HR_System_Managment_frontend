import React, { useState, useEffect, useRef } from 'react';
import askChatBot from '../../services/chatbot.services.js';

const HRChatbot = () => {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  // Enhanced suggested questions for HR usage
  const suggestedQuestions = [
    "Tell me about employee Ahmed",
    "How do I add a new employee?",
    "How do I calculate overtime pay?",
    "What are the attendance rules?",
    "How do I add a new department?"
  ];

  const sendMessage = async (question = null) => {
    const questionToSend = question || message;
    if (!questionToSend.trim()) return;

    const userMsg = { sender: 'User', text: questionToSend, timestamp: new Date() };
    setChat(prev => [...prev, userMsg]);
    setLoading(true);
    setMessage('');

    try {
      const response = await askChatBot(questionToSend);
      
      const botMessage = {
        sender: 'Bot',
        text: response.data?.answer || 'Sorry, I couldn\'t process your request. Please try again.',
        timestamp: new Date()
      };
      
      setChat(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("❌ Chat error:", error);
      const errorMessage = {
        sender: 'Bot',
        text: '❌ Sorry, I encountered an error. Please check your connection and try again.',
        timestamp: new Date()
      };
      setChat(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSuggestedQuestion = (question) => {
    sendMessage(question);
  };

  // Component to render suggested questions
  const SuggestedQuestions = () => (
    <div className="mb-3">
      <p style={{ fontSize: '12px', color: '#6c757d', marginBottom: '10px' }}>Quick questions:</p>
      <div className="d-flex flex-wrap gap-1 justify-content-center">
        {suggestedQuestions.map((question, index) => (
          <button
            key={index}
            className="btn btn-outline-primary btn-sm"
            style={{ fontSize: '10px', padding: '4px 8px' }}
            onClick={() => handleSuggestedQuestion(question)}
            disabled={loading}
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Floating Chat Icon */}
      <button
        className="btn btn-primary position-fixed bottom-0 end-0 m-4 rounded-circle shadow-lg"
        style={{ 
          width: 60, 
          height: 60, 
          zIndex: 1050,
          fontSize: '24px',
          border: 'none',
          transition: 'transform 0.2s'
        }}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
      >
        💬
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div 
          className="card position-fixed bottom-0 end-0 m-4 shadow-lg border-0" 
          style={{ 
            width: 420, 
            height: 600, 
            zIndex: 1049,
            borderRadius: '15px'
          }}
        >
          {/* Header */}
          <div className="card-header d-flex justify-content-between align-items-center bg-primary text-white" 
               style={{ borderRadius: '15px 15px 0 0', border: 'none' }}>
            <div className="d-flex align-items-center">
              <span style={{ fontSize: '18px', fontWeight: '600' }}>🤖 HR Assistant</span>
            </div>
            <button 
              className="btn-close btn-close-white" 
              onClick={() => setIsOpen(false)}
              style={{ fontSize: '12px' }}
            />
          </div>

          {/* Chat Body */}
          <div className="card-body d-flex flex-column p-0" style={{ height: 'calc(100% - 60px)' }}>
            {/* Messages Area */}
            <div className="flex-grow-1 overflow-auto p-3" style={{ maxHeight: 'calc(100% - 140px)' }}>
              {chat.length === 0 && (
                <div className="text-center text-muted mt-4">
                  <div style={{ fontSize: '48px', marginBottom: '10px' }}>👋</div>
                  <p>Hello! I'm your HR Assistant.</p>
                  <p style={{ fontSize: '14px', marginBottom: '15px' }}>I can help you with:</p>
                  
                  {/* Employee Search Example */}
                  <div className="mb-3 p-2 bg-light rounded">
                    <p style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>🔍 Employee Search:</p>
                    <p style={{ fontSize: '11px', color: '#6c757d' }}>Try: "Tell me about employee [Name]"</p>
                    <p style={{ fontSize: '11px', color: '#6c757d' }}>Example: "Tell me about employee John Smith"</p>
                  </div>
                  
                  {/* Suggested Questions */}
                  <SuggestedQuestions />
                  
                  <div style={{ fontSize: '12px', color: '#6c757d' }}>
                    <p>Or type your own question below!</p>
                  </div>
                </div>
              )}
              
              {chat.map((msg, i) => (
                <div key={i} className={`mb-3 ${msg.sender === 'User' ? 'text-end' : 'text-start'}`}>
                  <div className={`d-inline-block p-2 rounded-3 ${
                    msg.sender === 'User' 
                      ? 'bg-primary text-white' 
                      : 'bg-light text-dark'
                  }`} style={{ maxWidth: '85%', wordWrap: 'break-word' }}>
                    <div style={{ fontSize: '14px', whiteSpace: 'pre-line' }}>{msg.text}</div>
                    <div style={{ 
                      fontSize: '10px', 
                      opacity: 0.7, 
                      marginTop: '4px',
                      textAlign: msg.sender === 'User' ? 'right' : 'left'
                    }}>
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="text-start mb-3">
                  <div className="d-inline-block p-2 rounded-3 bg-light">
                    <div className="d-flex align-items-center">
                      <div className="spinner-border spinner-border-sm me-2" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <span style={{ fontSize: '14px' }}>Searching...</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Show suggested questions after every response */}
              {chat.length > 0 && !loading && (
                <div className="text-center mt-3">
                  <SuggestedQuestions />
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 border-top">
              <div className="input-group">
                <input
                  className="form-control"
                  type="text"
                  placeholder="Ask about employees or HR features..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !loading && sendMessage()}
                  disabled={loading}
                  style={{ borderRadius: '20px 0 0 20px', border: '1px solid #dee2e6' }}
                />
                <button 
                  className="btn btn-primary" 
                  onClick={() => sendMessage()}
                  disabled={loading || !message.trim()}
                  style={{ borderRadius: '0 20px 20px 0', border: 'none' }}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </span>
                  ) : (
                    'Send'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HRChatbot;
