import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import './CSS/Chatbot.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCommentDots, faTimes, faPaperPlane } from '@fortawesome/free-solid-svg-icons';

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am here to support you with mental health guidance, diet suggestions, and daily routine activities. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const location = useLocation();
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const path = location.pathname.toLowerCase();
    if (path === '/signup' || path === '/login') {
        return null;
    }

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const conversationHistory = [...messages, userMessage].map(m => ({
                role: m.role,
                content: m.content
            }));

            const response = await axios.post('https://breast-cancer-treatment-prediction.onrender.com/chatbot/chat', {
                messages: conversationHistory
            });

            const botMessage = response.data.choices[0].message;
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'I apologize, but I am having trouble connecting right now. Please try again later.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chatbot-container">
            {!isOpen && (
                <button className="chatbot-launcher" onClick={() => setIsOpen(true)} title="Chat with Us">
                    <FontAwesomeIcon icon={faCommentDots} />
                </button>
            )}

            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <h3>Care Assistant</h3>
                        <button className="close-btn" onClick={() => setIsOpen(false)}>
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.role}`}>
                                {/* Render Markdown only for assistant messages for safety and formatting, or both if desired. 
                     Using ReactMarkdown to handle lists and styles. */}
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="typing-indicator">
                                Typing...
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="chatbot-input" onSubmit={handleSend}>
                        <input
                            type="text"
                            placeholder="Type your message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isLoading}
                        />
                        <button type="submit" className="send-btn" disabled={isLoading || !input.trim()}>
                            <FontAwesomeIcon icon={faPaperPlane} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
