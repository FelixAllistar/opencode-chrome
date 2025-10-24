import { renderMessage } from '../../utils/renderers.jsx';

export const Message = ({ message }) => {
  const isUser = message.role === 'user';
  const textContent = message.parts
    .filter(part => part.type === 'text')
    .map(part => part.text)
    .join('');

  // Style based on message status for AI messages
  const getMessageStyle = () => {
    if (isUser) {
      return 'bg-blue-200 ml-auto max-w-xs';
    }

    // AI message styling based on status
    switch (message.status) {
      case 'submitted':
        return 'bg-gray-100 max-w-xs opacity-60'; // Grey-ish while waiting
      case 'streaming':
        return 'bg-gray-50 max-w-xs border-l-4 border-blue-400 animate-pulse'; // Streaming indicator
      case 'ready':
        return 'bg-white max-w-xs'; // Normal completed message
      case 'error':
        return 'bg-red-50 max-w-xs border border-red-200'; // Error styling
      default:
        return 'bg-white max-w-xs';
    }
  };

  return (
    <div className={`p-2 mb-2 rounded transition-all duration-200 ${getMessageStyle()}`}>
      <div>{textContent}</div>
      {message.status === 'streaming' && (
        <span className="text-xs text-gray-500 ml-2">typing...</span>
      )}
    </div>
  );
};