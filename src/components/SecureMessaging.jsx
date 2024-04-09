import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { BACKUP_SERVER1, BACKUP_SERVER2, PRIMARY_SERVER } from "../constants";
import { sendEncryptedMessage, decryptReceivedMessage } from "../secure";
import MessagesView from "./MessagesView";
import MessageInput from "./MessageInput";

// Component for sending and receiving messages (composed of MessagesView and MessageInput)
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

  // Connect to the server
  const connectSocket = (serverUrl, attemptBackup = true) => {
    if (socket.current) {
      socket.current.disconnect();
    }

    let pingInterval;
    socket.current = io(serverUrl, { reconnectionAttempts: 15 });

    // Register a public key for this user
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

    // Handle disconnecting from the server
    socket.current.on("disconnect", () => {
      if (attemptBackup) {
        attemptBackupConnection(serverUrl);
      } else {
        console.log("Failed to connect to both primary and backup servers.");
      }
    });

    // Handle connection errors
    socket.current.on("connect_error", () => {
      if (attemptBackup) {
        attemptBackupConnection(serverUrl);
      } else {
        console.log("Failed to connect to both primary and backup servers.");
      }
    });

    // Receive messages from the server
    socket.current.on("new_message", async (res) => {
      console.log("New message received:", res);

      const decryptedMessage = await decryptReceivedMessage(
        res.serializedEncryptedMessage,
        res.serializedEncryptedSymmetricKey,
        keyPair
      );

      console.log("Decrypted Message: ", decryptedMessage);
    
      const newMessage = { messageIndex: res.messageIndex, message: decryptedMessage, clientColor: res.clientColor, userName: res.userName};
    
      setMessages((prevMessages) => [...prevMessages, newMessage].sort((a, b) => a.messageIndex - b.messageIndex));
    });

    // Receive public keys of the other users connected to the chatroom
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

  // Cleanup whenever the server changes
  useEffect(() => {
    const cleanup = connectSocket(server);
    return cleanup; // Properly cleanup on component unmount or server change
  }, [server, keyPair, base64PublicKey, currChatroom]); // Reconnect whenever these dependencies change

  // Send a message to the server
  const sendMessage = async (message) => {
    return await sendEncryptedMessage(
      message,
      publicKeys,
      currChatroom,
      base64PublicKey,
      server
    );
  };

  // Updates the input box when the user starts typing
  const handleMessageInputChange = (e) => {
    setInputMessage(e.target.value);
  };

  // Called when the user submits the current message
  const handleSubmitMessage = (e) => {
    e.preventDefault();
    console.log("Sending message:", inputMessage);
    sendMessage(inputMessage);
    setInputMessage(""); // Clear input after sending
  };

  // Attempt to connect to a backup server when disconnected from the primary server
  const attemptBackupConnection = (serverUrl) => {
    console.log(
      `Failed to connect to ${serverUrl}. Attempting backup server...`
    );

    let backupServer;
    if (serverUrl === PRIMARY_SERVER) {
      backupServer = BACKUP_SERVER1;
    } else if (serverUrl === BACKUP_SERVER1) {
      backupServer = BACKUP_SERVER2;
    }
      else if(serverUrl ==BACKUP_SERVER2){
        backupServer = PRIMARY_SERVER;
      }
       else {
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
