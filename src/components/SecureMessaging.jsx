import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";

import {
  sendEncryptedMessage,
  decryptReceivedMessage,
} from "../secure";
import MessagesView from './MessagesView';
import MessageInput from './MessageInput';

const SecureMessaging = ({keyPair, currChatroom}) => {
  //Messages state
  const [messages, setMessages] = useState([]); //existing messages
  const [inputMessage, setInputMessage] = useState(""); //input

  //Public keys
  const [publicKeys, setPublicKeys] = useState(new Set());

  //Socket ref
  const socket = useRef(null);

  useEffect(() => {

    const publicKeyBase64 = btoa(String.fromCharCode.apply(null, keyPair.publicKey));

    //Socket setup
    socket.current = io("http://localhost:4000");

    socket.current.on("connect", () => {
      console.log("Connected to server");
    });

    socket.current.on("new_message", (message) => {
      console.log("New message received:", message);
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.current.on("new_public_keys", (res) => {
      console.log("New Public keys: ", res);
      res.publicKeys.forEach((key) => {
        var buffer = new Uint8Array(key)
        var fileString= String.fromCharCode.apply(null, buffer)
        console.log(fileString)
        addPublicKey(fileString)
      });
    })

    socket.current.emit("register_public_key", ({publicKey: publicKeyBase64, chatroom: currChatroom}), (response) => {
      console.log("Connected to server");
    });

    return () => {
      socket.current.off("connect");
      socket.current.off("new_message");
      socket.current.disconnect();
      console.log("Disconnected from server");
    };
  }, []);

  const addPublicKey = (publicKey) => {
    setPublicKeys((prevKeys) => new Set([...prevKeys, publicKey]));
  };

  const sendMessage = async (message) => {
    await sendEncryptedMessage(message, publicKeys, currChatroom, keyPair.publicKey);
  };

  const decryptMessage = async (encryptedMessage) => {
    await decryptReceivedMessage(encryptedMessage, keyPair.privateKey);
  };

  const handleMessageInputChange = (e) => {
    setInputMessage(e.target.value);
  };

  const handleSubmitMessage = (e) => {
    e.preventDefault();
    console.log(publicKeys)
    console.log("Sending message:", inputMessage);
    
    sendMessage(inputMessage);
    setInputMessage(""); // Clear input after sending
  };

  return (
    <div>
      <MessagesView {...{messages}}/>
      <MessageInput {...{inputMessage, handleMessageInputChange, handleSubmitMessage}}/>
    </div>
  );
};

export default SecureMessaging;
