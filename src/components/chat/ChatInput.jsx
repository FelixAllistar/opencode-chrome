 export const ChatInput = ({ onSend, status }) => {
   const handleSubmit = (e) => {
     e.preventDefault();
     const input = e.target.elements.input.value.trim();
     if (input) {
       onSend(input);
       e.target.reset();
     }
   };

   const isDisabled = status !== 'ready';
   const buttonText = status === 'submitted' ? 'Submitting...' :
                     status === 'streaming' ? 'Streaming...' :
                     status === 'error' ? 'Retry' : 'Send';

   return (
     <form onSubmit={handleSubmit} className="flex">
       <input
         name="input"
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