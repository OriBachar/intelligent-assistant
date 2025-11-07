import './MessageList.css';

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

interface MessageListProps {
  messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
  const renderImages = (images?: Message['images']) => {
    if (!images) return null;

    const allImages: string[] = [];
    
    if (images.covers) allImages.push(...images.covers);
    if (images.backgroundImages) allImages.push(...images.backgroundImages);
    if (images.screenshots) allImages.push(...images.screenshots);

    if (allImages.length === 0) return null;

    return (
      <div className="message-images">
        {allImages.slice(0, 3).map((url, idx) => (
          <img
            key={idx}
            src={url}
            alt={`Game image ${idx + 1}`}
            className="message-image"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="message-list">
      {messages.map((message, index) => (
        <div key={index} className={`message message-${message.role}`}>
          {message.role === 'assistant' && renderImages(message.images)}
          <div className="message-content">
            {message.content}
          </div>
          <div className="message-timestamp">
            {message.timestamp.toLocaleTimeString()}
          </div>
        </div>
      ))}
    </div>
  );
}

