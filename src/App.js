import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import SecureMessaging from "./components/SecureMessaging";
import JoinChatroom from "./components/JoinChatroom";
import NewChatroom from "./components/NewChatroom";

function App() {
  const [isInRoom, setIsInRoom] = useState(false);

  return (
    <div className="App">
      <h1>Hush Haven</h1>
      <h2>Anonymous Chatting for University Students</h2>
      {
        isInRoom ? 
          (
            <SecureMessaging/> 
          ) : 
          (
            <div>
              <NewChatroom {...{setIsInRoom}}/>
              <JoinChatroom {...{setIsInRoom}}/>
            </div>
          )
      }
    </div>
  );
}

export default App;