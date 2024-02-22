import React, { useEffect } from "react";
import io from "socket.io-client";
import SecureMessaging from "./components/SecureMessaging";

function App() {
  useEffect(() => {
    const socket = io("http://localhost:4000");

    socket.on("connect", () => {
      console.log("Connected to server");
    });

    return () => {
      socket.off("connect");
      socket.disconnect();
      console.log("Disconnected from server");
    };
  }, []); // empty array means run on mount

  return (
    <div className="App">
      <h1>React App with WebSocket</h1>
      <SecureMessaging />
    </div>
  );
}

export default App;
