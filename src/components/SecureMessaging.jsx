import React, { useEffect, useState } from "react";
import {
  generateKeyPair,
  sendEncryptedMessage,
  decryptReceivedMessage,
  serializeEncryptedMessage,
  deserializeEncryptedMessage,
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

  const testEncryption = async () => {
    const recipientKeyPair = await generateKeyPair();
    console.log("recipient: ", recipientKeyPair);

    const message = "Super secret message";
    let serializedEncryptedMessage = await sendEncryptedMessage(
      message,
      new Set([recipientKeyPair.publicKey])
    );

    console.log(
      "testEncryption - serializedEncryptedMessage: ",
      serializedEncryptedMessage
    );

    // send serializedEncryptedMessage to server

    // ----- server section -----
    const deserializedEncryptedMessage = deserializeEncryptedMessage(
      serializedEncryptedMessage
    );

    const decoder = new TextDecoder();
    const decodedPublicKey = decoder.decode(recipientKeyPair.publicKey);

    // for each recipient
    deserializedEncryptedMessage.encryptedSymmetricKey =
      deserializedEncryptedMessage.recipients[decodedPublicKey];

    delete deserializedEncryptedMessage.recipients;

    serializedEncryptedMessage = serializeEncryptedMessage(
      deserializedEncryptedMessage
    );
    // ----- server section -----

    console.log(
      "testEncryption - serializedEncryptedMessage (from server): ",
      serializedEncryptedMessage
    );

    console.log(
      "testEncryption - recipient privateKey: ",
      recipientKeyPair.privateKey
    );

    const decryptedMessage = await decryptReceivedMessage(
      serializedEncryptedMessage,
      recipientKeyPair
    );

    console.log("testEncryption - decryptedMessage: ", decryptedMessage);
  };

  const addPublicKey = (publicKey) => {
    setPublicKeys((prevKeys) => new Set([...prevKeys, [publicKey]]));
  };

  const sendMessage = async (message) => {
    return await sendEncryptedMessage(message, publicKeys);
  };

  const decryptMessage = async (encryptedMessage) => {
    await decryptReceivedMessage(encryptedMessage, keyPair);
  };

  return (
    <div>
      <h1>Secure Messaging Component</h1>
      <button onClick={testEncryption}>Test</button>
    </div>
  );
};

export default SecureMessaging;
