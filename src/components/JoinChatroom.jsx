import React, {useState, useEffect} from 'react';
import axios from 'axios';

const JoinChatroom = ({setIsInRoom, keyPair, setCurrChatroom}) => {
    const [password, setPassword] = useState('');

    const joinChatroom = async (event) => {
        event.preventDefault(); // Prevent the default form submission behavior

        try {
            const publicKeyBase64 = btoa(String.fromCharCode.apply(null, keyPair.publicKey));

            const response = await axios.get('http://localhost:4000/room', {
                params: {
                    Password: password,
                    publicKey: publicKeyBase64
                }
            });
            console.log(response.data)
            console.log(response.data.password)
            setCurrChatroom(response.data.password);
            setIsInRoom(true);
        } catch (error) {
            console.error('Failed to join chatroom:', error.response ? error.response.data : error.message);
        }
    };
    return (
        <>
            <h3>Join a Chatroom</h3>
            <form onSubmit={joinChatroom}>
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