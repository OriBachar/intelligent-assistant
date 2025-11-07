import { useState, useRef, useEffect } from 'react';
import { chatApi, type ChatResponse } from '../services/api';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import './ChatInterface.css';

export default function ChatInterface() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    // Add user message immediately
    const userMessage = {
      role: 'user' as const,
      content: message,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response: ChatResponse = await chatApi.sendMessage(message, conversationId);
      
      // Update conversation ID if this is a new conversation
      if (response.conversationId && !conversationId) {
        setConversationId(response.conversationId);
      }

      // Add assistant response
      const assistantMessage = {
        role: 'assistant' as const,
        content: response.response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      console.error('Error sending message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-interface">
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="welcome-message">
            <h2>Video Games Intelligent Assistant</h2>
            <p>Ask me anything about video games!</p>
            <p className="examples">
              Examples:
              <br />• "Tell me about The Witcher 3"
              <br />• "What games did CD Projekt Red make?"
              <br />• "What games are on PlayStation 5?"
            </p>
          </div>
        )}
        <MessageList messages={messages} />
        {isLoading && (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <span>Thinking...</span>
          </div>
        )}
        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
            <button onClick={() => setError(null)} className="dismiss-error">×</button>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <MessageInput onSendMessage={handleSendMessage} disabled={isLoading} />
    </div>
  );
}

