import React, {useState, useEffect} from 'react';
import axios from 'axios';

const JoinChatroom = ({setIsInRoom, keyPair, setCurrChatroom}) => {
    const [chatroomID, setChatroomID] = useState('');
    const [password, setPassword] = useState('');

    const joinChatroom = async (event) => {
        event.preventDefault(); // Prevent the default form submission behavior

        try {
            const publicKeyBase64 = btoa(String.fromCharCode.apply(null, keyPair.publicKey));

            const response = await axios.get('http://localhost:4000/room', {
                params: {
                    password: password,
                    id: chatroomID
                }
            });
            console.log(response.data);
            setCurrChatroom(response.data);
            setIsInRoom(true);
        } catch (error) {
            console.error('Failed to create chatroom:', error.response ? error.response.data : error.message);
        }
    };
    return (
        <>
            <h3>Join a Chatroom</h3>
            <form onSubmit={joinChatroom}>
                <input 
                    type="text" 
                    value={chatroomID} 
                    onChange={(e) => setChatroomID(e.target.value)} 
                    placeholder="Chatroom ID" 
                />
                <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="Password" 
                />
                <button type="submit">Join Chatroom</button>
            </form>
        </>
    )
}

export default JoinChatroom;