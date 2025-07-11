import React, { useState, useEffect, useRef } from "react";
import askChatBot from "../../services/chatbot.services.js";
import "./HRChatbot.css";

const HRChatbot = () => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  // Enhanced suggested questions for HR usage
  const suggestedQuestions = [
    "I want info about Ahmed",
    "Tell me about Ahmed",
    "How do I add a new employee?",
    "How do I calculate overtime pay?",
    "What are the attendance rules?",
    "How do I add a new department?",
  ];

  const sendMessage = async (question = null) => {
    const questionToSend = question || message;
    if (!questionToSend.trim()) return;

    const userMsg = {
      sender: "User",
      text: questionToSend,
      timestamp: new Date(),
    };
    setChat((prev) => [...prev, userMsg]);
    setLoading(true);
    setMessage("");

    try {
      const response = await askChatBot(questionToSend);
      // Extract the answer string from the response object
      let answer =
        response?.data?.answer ||
        response?.answer ||
        response?.data ||
        "I'm here to help! What would you like to know about?";
      // If answer is an object (e.g., {message, results}), stringify or format it
      if (typeof answer === "object" && answer !== null) {
        if (answer.message) {
          answer = answer.message;
        } else {
          answer = JSON.stringify(answer);
        }
      }
      const botMessage = {
        sender: "Bot",
        text: answer,
        timestamp: new Date(),
      };
      setChat((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("❌ Chat error:", error);
      const errorMessage = {
        sender: "Bot",
        text: `🤖 **I'm here to help!** 

It looks like I couldn't process your request right now. Here are some things I can help you with:

**📋 Employee Management:**
• "I want info about [employee name]"
• "How do I add a new employee?"
• "Show me all employees"

**💰 Payroll & Attendance:**
• "How do I calculate overtime?"
• "What are the attendance rules?"
• "How does payroll work?"

**🏢 Department Management:**
• "How do I add a new department?"
• "How do I assign employees to departments?"

**Try asking your question again, or use one of the suggested questions above!**`,
        timestamp: new Date(),
      };
      setChat((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSuggestedQuestion = (question) => {
    sendMessage(question);
  };

  // Auto-resize textarea
  const handleTextareaChange = (e) => {
    setMessage(e.target.value);
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
  };

  // Component to render suggested questions
  const SuggestedQuestions = () => (
    <div className="suggested-questions">
      <p className="suggestions-label">💡 Quick questions:</p>
      <div className="suggestions-grid">
        {suggestedQuestions.map((question, index) => (
          <button
            key={index}
            className="suggestion-btn"
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
        className={`chat-toggle-btn ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="chat-icon">{isOpen ? "✕" : "💬"}</div>
        <div className="chat-pulse"></div>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-container">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-content">
              <div className="chat-title">
                <div className="bot-avatar">🤖</div>
                <div className="title-text">
                  <h3>HR Assistant</h3>
                  <span className="status">Online</span>
                </div>
              </div>
              <button className="close-btn" onClick={() => setIsOpen(false)}>
                ✕
              </button>
            </div>
          </div>

          {/* Chat Body */}
          <div className="chat-body">
            {/* Messages Area */}
            <div className="messages-container">
              {chat.length === 0 && (
                <div className="welcome-message">
                  <div className="welcome-icon">👋</div>
                  <h2>Hello! I'm your HR Assistant</h2>
                  <p>
                    I can help you with employee management, payroll, and more!
                  </p>

                  {/* Employee Search Example */}
                  <div className="search-example">
                    <h4>🔍 Employee Search</h4>
                    <p>
                      Try: "I want info about [Name]" or "Tell me about employee
                      [Name]"
                    </p>
                    <p>
                      Examples: "I want info about Ahmed" or "Tell me about
                      employee John Smith"
                    </p>
                    <p>
                      For first name only: "Show me only employees with first
                      name Ali"
                    </p>
                  </div>

                  {/* Suggested Questions */}
                  <SuggestedQuestions />

                  <p className="welcome-footer">
                    Or type your own question below!
                  </p>
                </div>
              )}

              {chat.map((msg, i) => (
                <div
                  key={i}
                  className={`message-wrapper ${
                    msg.sender === "User" ? "user-message" : "bot-message"
                  }`}
                >
                  <div className="message-bubble">
                    <div className="message-content">
                      {msg.sender === "Bot" && (
                        <div className="bot-indicator">🤖</div>
                      )}
                      <div className="message-text">{msg.text}</div>
                    </div>
                    <div className="message-time">
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="message-wrapper bot-message">
                  <div className="message-bubble loading-bubble">
                    <div className="message-content">
                      <div className="bot-indicator">🤖</div>
                      <div className="loading-indicator">
                        <div className="typing-dots">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                        <span>Searching...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Show suggested questions after every response */}
              {chat.length > 0 && !loading && (
                <div className="suggestions-after-response">
                  <SuggestedQuestions />
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="chat-input-container">
              <div className="input-wrapper">
                <textarea
                  className="chat-input"
                  placeholder="Ask about employees or HR features..."
                  value={message}
                  onChange={handleTextareaChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && !loading) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  disabled={loading}
                  rows="1"
                />
                <button
                  className="send-btn"
                  onClick={() => sendMessage()}
                  disabled={loading || !message.trim()}
                >
                  {loading ? (
                    <div className="send-loading">
                      <div className="spinner"></div>
                    </div>
                  ) : (
                    <span>Send</span>
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
