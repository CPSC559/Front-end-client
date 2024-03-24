import React from "react";

const MessagesView = ({ messages }) => {
  return (
    <div className="messages">
      {messages.map((messageObj, index) => (
        <div
          key={index}
          className="message"
          style={{ backgroundColor: messageObj.clientColor }}
        >
          {messageObj.message}
        </div>
      ))}
    </div>
  );
};

export default MessagesView;
