import React, { useEffect, useState } from "react";
import SecureMessaging from "./components/SecureMessaging";
import JoinChatroom from "./components/JoinChatroom";
import NewChatroom from "./components/NewChatroom";
import { generateKeyPair } from "./secure";
import sodium from "libsodium-wrappers";

function App() {
  const [isInRoom, setIsInRoom] = useState(false);
  const [keyPair, setKeyPair] = useState();
  const [currChatroom, setCurrChatroom] = useState("");
  const [base64PublicKey, setBase64PublicKey] = useState();

  useEffect(() => {
    //Key stuff
    // TODO: load pre-exisitng key pair or generate and save it
    generateKeyPair().then((keys) => {
      setKeyPair(keys);
      // save a base64 version of the user's public key
      setBase64PublicKey(sodium.to_base64(keys.publicKey));
    });
  }, []);
  return (
    <div className="App">
      <h1>Hush Haven</h1>
      <h2>Anonymous Chatting for University Students</h2>
      {isInRoom ? (
        <SecureMessaging {...{ keyPair, base64PublicKey, currChatroom }} />
      ) : (
        <div>
          <NewChatroom
            {...{
              setIsInRoom,
              base64PublicKey,
              setCurrChatroom,
            }}
          />
          <JoinChatroom
            {...{
              setIsInRoom,
              base64PublicKey,
              setCurrChatroom,
            }}
          />
        </div>
      )}
    </div>
  );
}

export default App;
