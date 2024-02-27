import React, {useState, useEffect} from 'react';

const MessagesView = ({messages}) => {

    return (
        <>
            <div className="messages">
            {messages.map((message, index) => (
            <div key={index} className="message">{message.CipherText}</div>
            ))}
            </div>
        </>
    )
}

export default MessagesView;