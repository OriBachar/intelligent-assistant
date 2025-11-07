import { useState, useRef, useEffect } from 'react';
import { chatApi, type ChatResponse } from '../services/api';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import './ChatInterface.css';

const CONVERSATION_ID_KEY = 'currentConversationId';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  images?: {
    covers?: string[];
    screenshots?: string[];
    backgroundImages?: string[];
    trailers?: string[];
  };
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | undefined>(() => {
    return localStorage.getItem(CONVERSATION_ID_KEY) || undefined;
  });
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const loadConversationHistory = async () => {
      if (conversationId) {
        setIsLoadingHistory(true);
        try {
          const historyMessages = await chatApi.getConversationMessages(conversationId);
          const formattedMessages = historyMessages.map((msg) => ({
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.createdAt),
            images: (msg as any).metadata?.images,
          }));
          setMessages(formattedMessages);
        } catch (err) {
          console.error('Failed to load conversation history:', err);
          localStorage.removeItem(CONVERSATION_ID_KEY);
          setConversationId(undefined);
        } finally {
          setIsLoadingHistory(false);
        }
      }
    };

    loadConversationHistory();
  }, [conversationId]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

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
      
      if (response.conversationId) {
        if (!conversationId) {
          setConversationId(response.conversationId);
          localStorage.setItem(CONVERSATION_ID_KEY, response.conversationId);
        }
      }

      const assistantMessage: Message = {
        role: 'assistant' as const,
        content: response.response,
        timestamp: new Date(),
        images: response.metadata?.images,
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
        {isLoadingHistory ? (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <span>Loading conversation history...</span>
          </div>
        ) : messages.length === 0 ? (
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
        ) : null}
        {!isLoadingHistory && <MessageList messages={messages} />}
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

