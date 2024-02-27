import React, { useEffect, useState, useRef } from "react";
import SecureMessaging from "./components/SecureMessaging";
import JoinChatroom from "./components/JoinChatroom";
import NewChatroom from "./components/NewChatroom";
import {
  generateKeyPair,
} from "./secure";

function App() {
  const [isInRoom, setIsInRoom] = useState(false);
  const [keyPair, setKeyPair] = useState();
  const [currChatroom, setCurrChatroom] = useState("")

  useEffect(() => {
    //Key stuff
    // TODO: load pre-exisitng key pair or generate and save it
    generateKeyPair().then((keys) => {
      setKeyPair(keys);
    });

  }, [])
  return (
    <div className="App">
      <h1>Hush Haven</h1>
      <h2>Anonymous Chatting for University Students</h2>
      {
        isInRoom ? 
          (
            <SecureMessaging {...{keyPair, currChatroom}}/> 
          ) : 
          (
            <div>
              <NewChatroom {...{setIsInRoom, keyPair, setCurrChatroom}}/>
              <JoinChatroom {...{setIsInRoom, keyPair, setCurrChatroom}}/>
            </div>
          )
      }
    </div>
  );
}

export default App;