  export const ChatInput = ({ onSend, status, inputValue, setInputValue }) => {
    const handleSubmit = (e) => {
      e.preventDefault();
      const input = inputValue.trim();
      if (input) {
        onSend(input);
        setInputValue('');
      }
    };

    const isDisabled = status !== 'ready';
    const buttonText = status === 'submitted' ? 'Submitting...' :
                      status === 'streaming' ? 'Streaming...' :
                      status === 'error' ? 'Retry' : 'Send';

    return (
      <form onSubmit={handleSubmit} className="flex">
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="flex-1 border p-2 rounded-l"
          placeholder="Type your message..."
          disabled={isDisabled}
        />
        <button type="submit" disabled={isDisabled} className="bg-blue-500 text-white px-4 rounded-r">
          {buttonText}
        </button>
      </form>
    );
  };