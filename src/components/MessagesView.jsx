import React from "react";

const MessagesView = ({ messages, clientColors }) => {
  return (
    <div className="messages">
      {messages.map((messageObj, index) => (
        <div
          key={index}
          className="message"
          style={{ backgroundColor: clientColors[messageObj.senderPublicKey] }}
        >
          {messageObj.message}
        </div>
      ))}
    </div>
  );
};


export default MessagesView;
