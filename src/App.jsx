import { useState, useEffect } from 'react';
import { useStorage } from './hooks/useStorage.js';
import { MODELS } from './utils/constants.js';
import { Message } from './components/chat/Message.jsx';
import { ChatInput } from './components/chat/ChatInput.jsx';
import { ModelSelector } from './components/settings/ModelSelector.jsx';
import { generateResponse } from './services/ai/client.js';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [keyInput, setKeyInput] = useState('');
  const [apiKey, setApiKey] = useStorage('apiKey', '');
  const [selectedModelId, setSelectedModelId] = useStorage('selectedModelId', MODELS[0].id);
  const selectedModel = MODELS.find(m => m.id === selectedModelId) || MODELS[0];
  const [status, setStatus] = useState('ready'); // 'ready', 'submitted', 'streaming', 'error'

  const saveSettings = () => {
    setApiKey(keyInput);
    setSelectedModelId(selectedModel.id);
  };

  const handleSend = async (input) => {
    if (!apiKey || !input.trim() || status !== 'ready') return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      parts: [{ type: 'text', text: input }]
    };

    // Add empty AI message immediately
    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage = {
      id: aiMessageId,
      role: 'assistant',
      parts: [{ type: 'text', text: '' }],
      status: 'submitted' // Track message status
    };

    setMessages(prev => [...prev, userMessage, aiMessage]);
    setStatus('submitted');

    try {
      const result = await generateResponse(
        selectedModel.id,
        selectedModel.type,
        input,
        apiKey
      );

      setStatus('streaming');

      // Stream the response in real-time
      for await (const part of result.textStream) {
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.id === aiMessageId
              ? {
                  ...msg,
                  parts: [{ type: 'text', text: msg.parts[0].text + part }],
                  status: 'streaming'
                }
              : msg
          )
        );
      }

      // Mark as completed
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === aiMessageId
            ? { ...msg, status: 'ready' }
            : msg
        )
      );

      setStatus('ready');
    } catch (error) {
      console.error('Error generating response:', error);
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === aiMessageId
            ? {
                ...msg,
                parts: [{ type: 'text', text: 'Sorry, there was an error generating the response.' }],
                status: 'error'
              }
            : msg
        )
      );
      setStatus('error');
    }
  };

  const changeModel = (modelId) => {
    const model = MODELS.find(m => m.id === modelId);
    if (model) {
      setSelectedModelId(modelId);
    }
  };

  const clearSettings = () => {
    chrome.storage.sync.clear();
    setApiKey('');
    setSelectedModelId(MODELS[0].id);
    setMessages([]);
    setStatus('ready');
  };

  const stopGeneration = () => {
    // For now, just reset status - in a real implementation you'd abort the stream
    setStatus('ready');
    // Mark any streaming message as stopped
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.status === 'streaming'
          ? { ...msg, status: 'ready' }
          : msg
      )
    );
  };

  if (!apiKey) {
    return (
      <div className="flex flex-col h-screen p-4 bg-gray-100">
        <h1 className="text-lg font-bold mb-4">AI Sidebar Setup</h1>
        <p className="mb-4">Enter your OpenCode Zen API key:</p>
        <input
          value={keyInput}
          onChange={e => setKeyInput(e.target.value)}
          className="border p-2 mb-4"
          placeholder="API Key"
          type="password"
        />
        <ModelSelector selectedModel={selectedModel} onChange={changeModel} />
        <button onClick={saveSettings} className="bg-blue-500 text-white px-4 py-2 rounded">
          Save & Start
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen p-4 bg-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-bold">AI Sidebar</h1>
        <div className="flex items-center space-x-2">
          <ModelSelector selectedModel={selectedModel} onChange={changeModel} />
          <button onClick={clearSettings} className="bg-red-500 text-white px-2 py-1 text-sm rounded">
            Clear
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto mb-4">
        {messages.map((msg, i) => (
          <Message key={i} message={msg} />
        ))}
      </div>
      <div className="flex items-center space-x-2">
        <ChatInput onSend={handleSend} status={status} />
        {(status === 'submitted' || status === 'streaming') && (
          <button
            onClick={stopGeneration}
            className="bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600"
          >
            Stop
          </button>
        )}
      </div>
    </div>
  );
}