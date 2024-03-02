import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";

import { sendEncryptedMessage, decryptReceivedMessage } from "../secure";
import MessagesView from "./MessagesView";
import MessageInput from "./MessageInput";

const SecureMessaging = ({ keyPair, base64PublicKey, currChatroom }) => {
  // Messages state
  const [messages, setMessages] = useState([]); //existing messages
  const [inputMessage, setInputMessage] = useState(""); //input

  // Base64 Public keys of recipients
  const [publicKeys, setPublicKeys] = useState(new Set());

  // Socket ref
  const socket = useRef(null);

  useEffect(() => {
    //Socket setup
    socket.current = io("http://localhost:4000");

    socket.current.on("connect", () => {
      console.log("Connected to server");
    });

    socket.current.on("new_message", async (res) => {
      console.log("New message received:", res);

      const decryptedMessage = await decryptReceivedMessage(
        res.serializedEncryptedMessage,
        res.serializedEncryptedSymmetricKey,
        keyPair
      );

      console.log("new_message - decryptedMessage: ", decryptedMessage);

      setMessages((prevMessages) => [...prevMessages, decryptedMessage]);
    });

    socket.current.on("new_public_keys", (res) => {
      setPublicKeys((prevKeys) => new Set([...prevKeys, ...res.publicKeys]));
    });

    socket.current.emit(
      "register_public_key",
      { publicKey: base64PublicKey, chatroom: currChatroom },
      (response) => {
        console.log("Connected to server");
      }
    );

    return () => {
      socket.current.off("connect");
      socket.current.off("new_message");
      socket.current.disconnect();
      console.log("Disconnected from server");
    };
  }, []);

  const sendMessage = async (message) => {
    return await sendEncryptedMessage(
      message,
      publicKeys,
      currChatroom,
      base64PublicKey
    );
  };

  const handleMessageInputChange = (e) => {
    setInputMessage(e.target.value);
  };

  const handleSubmitMessage = (e) => {
    e.preventDefault();
    console.log(publicKeys);
    console.log("Sending message:", inputMessage);

    sendMessage(inputMessage);
    setInputMessage(""); // Clear input after sending
  };

  return (
    <div>
      <MessagesView {...{ messages }} />
      <MessageInput
        {...{ inputMessage, handleMessageInputChange, handleSubmitMessage }}
      />
    </div>
  );
};

export default SecureMessaging;
