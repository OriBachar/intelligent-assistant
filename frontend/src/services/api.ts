import axios from 'axios';
import type { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface ChatRequest {
  message: string;
  conversationId?: string;
}

export interface ChatImages {
  covers?: string[];
  screenshots?: string[];
  backgroundImages?: string[];
  trailers?: string[];
}

export interface ChatResponse {
  response: string;
  conversationId: string;
  intent?: string;
  confidence?: string;
  valid?: boolean;
  processingTime?: number;
  metadata?: {
    apiDataUsed?: boolean;
    images?: ChatImages;
  };
}

export interface Conversation {
  _id: string;
  title?: string;
  summary?: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationMessage {
  _id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  intent?: string;
  createdAt: string;
  updatedAt: string;
}

export const chatApi = {
  sendMessage: async (message: string, conversationId?: string): Promise<ChatResponse> => {
    const response = await apiClient.post<ChatResponse>('/chat', {
      message,
      conversationId,
    });
    return response.data;
  },
  
  getAllConversations: async (): Promise<Conversation[]> => {
    const response = await apiClient.get<{ conversations: Conversation[] }>('/conversations');
    return response.data.conversations;
  },
  
  getConversation: async (id: string): Promise<Conversation> => {
    const response = await apiClient.get<Conversation>(`/conversations/${id}`);
    return response.data;
  },
  
  getConversationMessages: async (id: string): Promise<ConversationMessage[]> => {
    const response = await apiClient.get<{ messages: ConversationMessage[] }>(`/conversations/${id}/messages`);
    return response.data.messages;
  },
  
  deleteConversation: async (id: string): Promise<void> => {
    await apiClient.delete(`/conversations/${id}`);
  },
};

export default apiClient;

