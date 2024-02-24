import React, { useEffect, useState } from "react";
import {
  generateKeyPair,
  sendEncryptedMessage,
  decryptReceivedMessage,
} from "../secure";
import MessagesView from './MessagesView';
import MessageInput from './MessageInput';

const SecureMessaging = () => {
  //Messages state
  const [messages, setMessages] = useState([]); //existing messages
  const [inputMessage, setInputMessage] = useState(""); //input

  //Key state
  const [keyPair, setKeyPair] = useState();
  const [publicKeys, setPublicKeys] = useState(new Set());

  //Socket ref
  const socket = useRef(null);

  useEffect(() => {

    //Key stuff
    // TODO: load pre-exisitng key pair or generate and save it
    generateKeyPair().then((keys) => {
      setKeyPair(keys);
    });
    console.log(keyPair);

    //Socket stuff
    socket.current = io("http://localhost:4000");

    socket.current.on("connect", () => {
      console.log("Connected to server");
    });

    socket.current.on("new_message", (message) => {
      console.log("New message received:", message);
      setMessages((prevMessages) => [...prevMessages, message]);
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
    await sendEncryptedMessage(message, publicKeys);
  };

  const decryptMessage = async (encryptedMessage) => {
    await decryptReceivedMessage(encryptedMessage, keyPair.privateKey);
  };

  const handleMessageInputChange = (e) => {
    setInputMessage(e.target.value);
  };

  const handleSubmitMessage = (e) => {
    e.preventDefault();
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