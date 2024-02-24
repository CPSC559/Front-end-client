import React, {useState, useEffect} from 'react';

const NewChatroom = ({setIsInRoom}) => {
    const [chatroomID, setChatroomID] = useState('');
    const [password, setPassword] = useState('');

    return (
        <>
            <h3>Create a Chatroom</h3>
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
                <button type="submit">Create Chatroom</button>
            </form>
        </>
    )
}

export default NewChatroom;