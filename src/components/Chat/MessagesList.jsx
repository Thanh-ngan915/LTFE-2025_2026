import React from 'react';

function MessagesList({ messages, currentUser, currentChat, messagesEndRef }) {
  return (
    <div className="messages-container">
      {messages.length === 0 ? (
        <div className="no-messages">
          <p>Start conversation with {currentChat}</p>
        </div>
      ) : (
        messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.from === currentUser.name ? 'own' : 'other'}`}
          >
            <div className="message-bubble">
              <p className="message-from">{msg.from}</p>
              <p className="message-text">{msg.mes || msg}</p>
              <p className="message-time">
                {msg.time || new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default MessagesList;
