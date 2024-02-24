import React, {useState, useEffect} from 'react';

const JoinChatroom = ({setIsInRoom}) => {
    const [chatroomID, setChatroomID] = useState('');
    const [password, setPassword] = useState('');

    return (
        <>
            <h3>Join a Chatroom</h3>
            <form>
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