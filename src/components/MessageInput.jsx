import React, {useState, useEffect} from 'react';

// Input box for sending messages to the chat room
const MessageInput = ({inputMessage, handleMessageInputChange, handleSubmitMessage}) => {

    return (
        <>
            <form onSubmit={handleSubmitMessage} className="message-form">
                <input
                type="text"
                value={inputMessage}
                onChange={handleMessageInputChange}
                placeholder="Enter your message here..."
                className="message-input"
                />
                <button type="submit" className="send-button">Send</button>
            </form>
        </>
    )
}

export default MessageInput;