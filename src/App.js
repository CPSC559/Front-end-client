import React, { useEffect, useState } from "react";
import SecureMessaging from "./components/SecureMessaging";
import JoinChatroom from "./components/JoinChatroom";
import NewChatroom from "./components/NewChatroom";
import { generateKeyPair } from "./secure";
import sodium from "libsodium-wrappers";
import {PRIMARY_SERVER, BACKUP_SERVER1, BACKUP_SERVER2} from './constants.js';

function App() {
  const [isInRoom, setIsInRoom] = useState(false);
  const [keyPair, setKeyPair] = useState();
  const [currChatroom, setCurrChatroom] = useState("");
  const [base64PublicKey, setBase64PublicKey] = useState();
  const [server, setServer] = useState(PRIMARY_SERVER);
  const [showRoomCode, setShowRoomCode] = useState(false);

  useEffect(() => {
    // User public key
    generateKeyPair().then((keys) => {
      setKeyPair(keys);
      // Save a base64 version of the user's public key
      setBase64PublicKey(sodium.to_base64(keys.publicKey));
    });
  }, []);
  return (
    <div className="App">
      <h1>Hush Haven</h1>
      <h2>Anonymous Chatting for University Students</h2>
      {isInRoom ? (
        <>
          <h3>
            {"Room Code: "}
            {showRoomCode ? (
              <>
                <span style={{ backgroundColor: "yellow" }}>{currChatroom}</span>
                &nbsp;
              </>
            ) : ("")}
            <button onClick={() => setShowRoomCode(!showRoomCode)}>
              {showRoomCode ? ("Hide") : ("Show")}
            </button>
          </h3>
          <SecureMessaging {...{ keyPair, base64PublicKey, currChatroom, server, setServer }} />
        </>
      ) : (
        <div>
          <NewChatroom
            {...{
              setIsInRoom,
              base64PublicKey,
              setCurrChatroom,
              server,
              setServer
            }}
          />
          <JoinChatroom
            {...{
              setIsInRoom,
              base64PublicKey,
              setCurrChatroom,
              server,
              setServer
            }}
          />
        </div>
      )}
    </div>
  );
}

export default App;
