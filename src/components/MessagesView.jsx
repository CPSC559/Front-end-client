import React from "react";

const MessagesView = ({ messages }) => {
  return (
    <>
      <div className="messages">
        {messages.map((message, index) => (
          <div key={index} className="message">
            {message}
          </div>
        ))}
      </div>
    </>
  );
};

export default MessagesView;
