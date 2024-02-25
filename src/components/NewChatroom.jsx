import React, { useState } from 'react';
import axios from 'axios';

const NewChatroom = ({ setIsInRoom, keyPair, setCurrChatroom }) => {
    const [password, setPassword] = useState('');

    const createChatroom = async (event) => {
        event.preventDefault(); // Prevent the default form submission behavior

        try {
            const publicKeyBase64 = btoa(String.fromCharCode.apply(null, keyPair.publicKey));

            const response = await axios.post('http://localhost:4000/chatroom', {
                password: password,
                userPubKey: publicKeyBase64,
            });
            setCurrChatroom(response.data.password);
            setIsInRoom(true);
        } catch (error) {
            console.error('Failed to create chatroom:', error.response ? error.response.data : error.message);
        }
    };

    return (
        <>
            <h3>Create a Chatroom</h3>
            <form onSubmit={createChatroom}> {/* Corrected form submission handler */}
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