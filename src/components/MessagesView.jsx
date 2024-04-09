import React from "react";
import "./MessagesView.css";

const MessagesView = ({ messages }) => {
  return (
    <div className="messages">
      {messages.map((messageObj, index) => (
        <div
          key={index}
          className="message"
          style={{ backgroundColor: messageObj.clientColor }}
        >
          <div className="username"> {messageObj.userName}</div>
          <div className="message-content"> {messageObj.message}</div>
        </div>
      ))}
    </div>
  );
};

export default MessagesView;
