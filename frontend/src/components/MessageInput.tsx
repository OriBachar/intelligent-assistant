import { useState, FormEvent } from 'react';
import './MessageInput.css';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export default function MessageInput({ onSendMessage, disabled }: MessageInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <form className="message-input-form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="message-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask me anything about video games..."
        disabled={disabled}
        autoFocus
      />
      <button
        type="submit"
        className="send-button"
        disabled={disabled || !input.trim()}
      >
        Send
      </button>
    </form>
  );
}

