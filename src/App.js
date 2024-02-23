import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import SecureMessaging from "./components/SecureMessaging";

function App() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState(""); // State to hold input
  const socket = io("http://localhost:4000");

  useEffect(() => {

    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("new_message", (message) => {
      console.log("New message received:", message);
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off("connect");
      socket.off("new_message");
      socket.disconnect();
      console.log("Disconnected from server");
    };
  }, []); // empty array means run on mount

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Sending message:", inputMessage);
    socket.emit("send_message", {
      message: inputMessage,
      user: "User", // Replace with actual user id
      chatroom: "chatroomID" // Replace with actual chatroom ID
    });
    setInputMessage(""); // Clear input after sending
  };

  return (
    <div className="App">
      <h1>React App with WebSocket</h1>
      <div className="messages">
        {messages.map((message, index) => (
          <div key={index} className="message">{message}</div>
        ))}
      </div>
      {/* Input form */}
      <form onSubmit={handleSubmit} className="message-form">
        <input
          type="text"
          value={inputMessage}
          onChange={handleInputChange}
          placeholder="Enter your message here..."
          className="message-input"
        />
        <button type="submit" className="send-button">Send</button>
      </form>
    </div>
  );
}

export default App;
