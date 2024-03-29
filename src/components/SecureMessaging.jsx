import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { BACKUP_SERVER1, BACKUP_SERVER2, PRIMARY_SERVER } from "../constants";
import { sendEncryptedMessage, decryptReceivedMessage } from "../secure";
import MessagesView from "./MessagesView";
import MessageInput from "./MessageInput";

const SecureMessaging = ({
  keyPair,
  base64PublicKey,
  currChatroom,
  server,
  setServer,
}) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [publicKeys, setPublicKeys] = useState(new Set());
  const socket = useRef(null);

  const connectSocket = (serverUrl, attemptBackup = true) => {
    if (socket.current) {
      socket.current.disconnect();
    }

    let pingInterval;
    socket.current = io(serverUrl, { reconnectionAttempts: 3 });

    socket.current.on("connect", () => {
      console.log("Connected to server:", serverUrl);
      socket.current.emit(
        "register_public_key",
        { publicKey: base64PublicKey, chatroom: currChatroom },
        (response) => {
          console.log("Registration response:", response);
        }
      );

      // Keep the connection alive by pinging the server every 5 seconds
      pingInterval = setInterval(() => {
        socket.current.emit("ping", {}, (response) => {
          if (response !== "pong") {
            attemptBackupConnection(serverUrl);
          }
        });
      }, 5000);
    });

    socket.current.on("connect_error", () => {
      if (attemptBackup) {
        attemptBackupConnection(serverUrl);
      } else {
        console.log("Failed to connect to both primary and backup servers.");
      }
    });

    socket.current.on("new_message", async (res) => {
      console.log("New message received:", res);

      const decryptedMessage = await decryptReceivedMessage(
        res.serializedEncryptedMessage,
        res.serializedEncryptedSymmetricKey,
        keyPair
      );

      console.log("Decrypted Message: ", decryptedMessage);
    
      const newMessage = { messageIndex: res.messageIndex, message: decryptedMessage, clientColor: res.clientColor };
    
      setMessages((prevMessages) => [...prevMessages, newMessage].sort((a, b) => a.messageIndex - b.messageIndex));
    });

    socket.current.on("new_public_keys", (res) => {
      setPublicKeys((prevKeys) => new Set([...prevKeys, ...res.publicKeys]));
    });

    return () => {
      socket.current.off("connect");
      socket.current.off("connect_error");
      socket.current.off("new_message");
      socket.current.off("new_public_keys");
      socket.current.disconnect();
      clearInterval(pingInterval);
    };
  };

  useEffect(() => {
    const cleanup = connectSocket(server);
    return cleanup; // Properly cleanup on component unmount or server change
  }, [server, keyPair, base64PublicKey, currChatroom]); // Reconnect whenever these dependencies change

  const sendMessage = async (message) => {
    return await sendEncryptedMessage(
      message,
      publicKeys,
      currChatroom,
      base64PublicKey,
      server
    );
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

  const attemptBackupConnection = (serverUrl) => {
    console.log(
      `Failed to connect to ${serverUrl}. Attempting backup server...`
    );

    let backupServer;
    if (serverUrl === PRIMARY_SERVER) {
      backupServer = BACKUP_SERVER1;
    } else if (serverUrl === BACKUP_SERVER1) {
      backupServer = BACKUP_SERVER2;
    } else {
      console.log("Failed to connect to all servers.");
      return;
    }

    setServer(backupServer);
    connectSocket(backupServer, false);
  };

  return (
    <div>
      <MessagesView messages={messages} />
      <MessageInput
        inputMessage={inputMessage}
        handleMessageInputChange={handleMessageInputChange}
        handleSubmitMessage={handleSubmitMessage}
      />
    </div>
  );
};

export default SecureMessaging;
