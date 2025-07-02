import React, { useState } from 'react';
import { getAllEmployees } from '../../services/employee.services.js'; 
const HRChatbot = () => {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMsg = { sender: 'HR', text: message };
    setChat(prev => [...prev, userMsg]);
    setLoading(true);
    setMessage('');

    try {
      const nameInput = message.trim().toLowerCase();

      const empData = await getAllEmployees(); // Get all employees
      const matched = empData.data.find(emp => emp.firstName.toLowerCase() === nameInput);

      if (matched) {
        const reply = `📄 Employee Info:
      👤 Name: ${matched.firstName} ${matched.lastName}
      📧 Email: ${matched.email}
        📞 Phone: ${matched.phone}
      🏢 Department: ${matched.department}
`;
        setChat(prev => [...prev, { sender: 'Bot', text: reply }]);
      } else {
        setChat(prev => [...prev, { sender: 'Bot', text: `❌ No employee found with name "${nameInput}"` }]);
      }

    } catch (error) {
      console.error("❌ Chat error:", error);
      setChat(prev => [...prev, { sender: 'Bot', text: '❌ Error retrieving employee data.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Icon */}
      <button
        className="btn btn-primary position-fixed bottom-0 end-0 m-4 rounded-circle"
        style={{ width: 60, height: 60, zIndex: 1050 }}
        onClick={() => setIsOpen(!isOpen)}
      >
        💬
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="card position-fixed bottom-0 end-0 m-4 shadow-lg" style={{ width: 350, height: 500, zIndex: 1049 }}>
          <div className="card-header d-flex justify-content-between align-items-center bg-primary text-white">
            <span>🤖 HR Assistant</span>
            <button className="btn-close btn-close-white" onClick={() => setIsOpen(false)} />
          </div>
          <div className="card-body d-flex flex-column">
            <div className="flex-grow-1 overflow-auto mb-3" style={{ maxHeight: 360 }}>
              {chat.map((msg, i) => (
                <div key={i} className={`mb-2 text-${msg.sender === 'HR' ? 'end' : 'start'}`}>
                  <span className={`badge bg-${msg.sender === 'HR' ? 'primary' : 'secondary'}`}>
                    {msg.sender}: {msg.text}
                  </span>
                </div>
              ))}
              {loading && <div className="text-center">⏳ Loading...</div>}
            </div>
            <div className="input-group">
              <input
                className="form-control"
                type="text"
                placeholder="Type employee name..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button className="btn btn-outline-primary" onClick={sendMessage}>Send</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HRChatbot;
