import React, { useState } from "react";
import axios from "axios";
import { BACKUP_SERVER1, BACKUP_SERVER2, PRIMARY_SERVER } from "../constants";

// Component that lets the user enter a code to create a new chat room
const NewChatroom = ({
  setIsInRoom,
  base64PublicKey,
  setCurrChatroom,
  server,
  setServer,
}) => {
  const [password, setPassword] = useState("");

  const createChatroom = async (
    event,
    isRetry = false,
    currentServer = server
  ) => {
    event.preventDefault();

    // Attempt to create a new chat room with the provided password
    try {
      const response = await axios.post(`${currentServer}/chatroom`, {
        password: password,
        userPubKey: base64PublicKey,
        fromClient: true,
      });
      setCurrChatroom(response.data.Password);
      setIsInRoom(true);
    } catch (error) {
      // Handle case where the server is unavailable
      console.error(
        "Failed to create chatroom:",
        error.response ? error.response.data : error.message
      );
      if (!isRetry) {
        // Only attempt a retry if this is the first attempt
        let newServer;
        if (currentServer === PRIMARY_SERVER) {
          newServer = BACKUP_SERVER1;
        } else if (currentServer === BACKUP_SERVER1) {
          newServer = BACKUP_SERVER2;
        } else {
          newServer = PRIMARY_SERVER;
        }
        console.log(`Switching to the ${newServer} server...`);
        setServer(newServer); // Update the server state for future requests
        createChatroom(event, true, newServer); // Pass newServer directly
      } else {
        // If retry also failed, notify the user
        alert("All servers are unavailable. Please try again later.");
      }
    }
  };

  return (
    <>
      <h3>Create a Chatroom</h3>
      <form onSubmit={(e) => createChatroom(e)}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button type="submit">Create Chatroom</button>
      </form>
    </>
  );
};

export default NewChatroom;
