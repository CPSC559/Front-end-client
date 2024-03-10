import React, { useState } from "react";
import axios from "axios";
import { BACKUP_SERVER1, BACKUP_SERVER2, PRIMARY_SERVER } from "../constants";

const JoinChatroom = ({
  setIsInRoom,
  base64PublicKey,
  setCurrChatroom,
  server,
  setServer,
}) => {
  const [password, setPassword] = useState("");

  // Updated to accept currentServer parameter
  const joinChatroom = async (
    event,
    isRetry = false,
    currentServer = server
  ) => {
    event.preventDefault();

    try {
      const response = await axios.get(`${currentServer}/room`, {
        params: {
          Password: password,
          publicKey: base64PublicKey,
        },
      });
      console.log(response.data);
      setCurrChatroom(response.data.password); // Ensure this matches your actual response structure
      setIsInRoom(true);
    } catch (error) {
      console.error(
        "Failed to join chatroom:",
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
        joinChatroom(event, true, newServer); // Pass newServer directly
      } else {
        // If retry also failed, notify the user
        alert("Failed to join the chatroom. All servers are unavailable.");
      }
    }
  };

  return (
    <>
      <h3>Join a Chatroom</h3>
      <form onSubmit={(e) => joinChatroom(e)}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button type="submit">Join Chatroom</button>
      </form>
    </>
  );
};

export default JoinChatroom;
