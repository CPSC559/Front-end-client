import React, { useEffect, useState } from "react";
import {
  generateKeyPair,
  sendEncryptedMessage,
  decryptReceivedMessage,
} from "../secure";

const SecureMessaging = () => {
  // both these useStates will probably need to be changed to context
  const [keyPair, setKeyPair] = useState();
  const [publicKeys, setPublicKeys] = useState(new Set());

  useEffect(() => {
    // TODO: load pre-exisitng key pair or generate and save it
    generateKeyPair().then((keys) => {
      setKeyPair(keys);
    });
    console.log(keyPair);
  }, []);

  const addPublicKey = (publicKey) => {
    setPublicKeys((prevKeys) => new Set([...prevKeys, publicKey]));
  };

  const sendMessage = async (message) => {
    await sendEncryptedMessage(message, publicKeys);
  };

  const decryptMessage = async (encryptedMessage) => {
    await decryptReceivedMessage(encryptedMessage, keyPair.privateKey);
  };

  return (
    <div>
      <h1>Secure Messaging Component</h1>
    </div>
  );
};

export default SecureMessaging;
