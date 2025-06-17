import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, Database, Bot, User, ExternalLink, BarChart3 } from 'lucide-react';
import { Dataset, ChatMessage } from '../types';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_REACT_APP_BACKEND_URL || 'http://localhost:5000';

interface ChatInterfaceProps {
  dataset: Dataset;
  onBack: () => void;
  onAnalyze?: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ dataset, onBack, onAnalyze }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: `Hello! I'm your AI assistant for the ${dataset.name} dataset. I can help you explore and analyze this data through natural language queries. What would you like to know?`,
      isUser: false,
      timestamp: new Date(),
      sources: [dataset.source]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [vocabulary, setVocabulary] = useState<string[]>([]);
  const [vectors, setVectors] = useState<number[][]>([]);
  const [vectorized, setVectorized] = useState(false);
  const [vectorField, setVectorField] = useState<string | null>(null);
  const [loadingDataset, setLoadingDataset] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Helper to build vocabulary from array of texts
  function buildVocabulary(texts: string[]): string[] {
    const vocabSet = new Set<string>();
    texts.forEach(text => {
      text.split(/\W+/).forEach(word => {
        if (word) vocabSet.add(word.toLowerCase());
      });
    });
    return Array.from(vocabSet);
  }

  // Helper to vectorize a text based on vocabulary
  function vectorize(text: string, vocab: string[]): number[] {
    const words = text.toLowerCase().split(/\W+/);
    return vocab.map(word => words.filter(w => w === word).length);
  }

  useEffect(() => {
    if (dataset.dataRows && dataset.dataRows.length > 0 && !vectorized) {
      const sample = dataset.dataRows[0];
      const textField = Object.keys(sample).find((k: string) => typeof sample[k] === 'string');
      if (!textField) return;
      setVectorField(textField);
      const texts = dataset.dataRows.map((row: any) => row[textField] as string);
      const vocab = buildVocabulary(texts);
      setVocabulary(vocab);
      const vecs = texts.map((text: string) => vectorize(text, vocab));
      setVectors(vecs);
      setVectorized(true);
    }
  }, [dataset, vectorized]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages((prev: ChatMessage[]) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await axios.post(`${BACKEND_URL}/query`, {
        query: inputValue,
        dataset: dataset.id // assumes dataset.id matches backend collection name
      });
      
      const data = response.data;
      
      // Check if we have new format with AI response
      if (data.ai_response) {
        setMessages((prev: ChatMessage[]) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            content: data.ai_response,
            isUser: false,
            timestamp: new Date(),
            sources: data.vector_results ? [dataset.name] : []
          }
        ]);
      } else {
        // Fallback to old format
        const results = Array.isArray(data) ? data : [];
        const sources = results.map((r: any) => r.text).slice(0, 3);
        setMessages((prev: ChatMessage[]) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            content: sources.length > 0 ? `Top results:\n${sources.join('\n\n')}` : 'No relevant results found.',
            isUser: false,
            timestamp: new Date(),
            sources: [dataset.name]
          }
        ]);
      }
    } catch (error) {
      console.error('Query error:', error);
      setMessages((prev: ChatMessage[]) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          content: 'Error connecting to backend. Please try again or make sure the dataset is loaded.',
          isUser: false,
          timestamp: new Date(),
          sources: []
        }
      ]);
    }
    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleLoadDataset = async (datasetKey: string) => {
    setLoadingDataset(datasetKey);
    setIsTyping(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/load/${datasetKey}`);
      setMessages((prev: ChatMessage[]) => [
        ...prev,
        {
          id: (Date.now() + 3).toString(),
          content: response.data.message || 'Dataset loaded.',
          isUser: false,
          timestamp: new Date(),
          sources: ['Backend']
        }
      ]);
    } catch (error) {
      setMessages((prev: ChatMessage[]) => [
        ...prev,
        {
          id: (Date.now() + 4).toString(),
          content: 'Error loading dataset. Please check backend and MongoDB.',
          isUser: false,
          timestamp: new Date(),
          sources: []
        }
      ]);
    }
    setIsTyping(false);
    setLoadingDataset(null);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoadingDataset('custom');
    setIsTyping(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axios.post(`${BACKEND_URL}/load/custom`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessages((prev: ChatMessage[]) => [
        ...prev,
        {
          id: (Date.now() + 5).toString(),
          content: response.data.message || 'Custom dataset loaded.',
          isUser: false,
          timestamp: new Date(),
          sources: ['Backend']
        }
      ]);
    } catch (error) {
      setMessages((prev: ChatMessage[]) => [
        ...prev,
        {
          id: (Date.now() + 6).toString(),
          content: 'Error loading custom dataset. Please check backend and MongoDB.',
          isUser: false,
          timestamp: new Date(),
          sources: []
        }
      ]);
    }
    setIsTyping(false);
    setLoadingDataset(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const suggestedQueries = [
    'What are the latest trends?',
    'Show me statistics for 2023',
    'Compare data across regions',
    'What patterns do you see?'
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${dataset.color} flex items-center justify-center`}>
            <Database className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">{dataset.name}</h2>
            <p className="text-sm text-gray-500">{dataset.recordCount?.toLocaleString?.() || 0} records available</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Vector Search Active</span>
            </div>
            {onAnalyze && (
              <button
                onClick={onAnalyze}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center space-x-2 text-sm"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Analyze</span>
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((message: ChatMessage) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-3 max-w-3xl ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.isUser 
                  ? 'bg-blue-500' 
                  : 'bg-gradient-to-r from-purple-500 to-pink-500'
              }`}>
                {message.isUser ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>
              <div className={`px-4 py-3 rounded-2xl ${
                message.isUser
                  ? 'bg-blue-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-900'
              }`}>
                <p className="text-sm leading-relaxed">{message.content}</p>
                {message.sources && !message.isUser && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <ExternalLink className="w-3 h-3" />
                      <span>Sources: {message.sources.join(', ')}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-3 max-w-3xl">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="px-4 py-3 bg-white border border-gray-200 rounded-2xl">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-0"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {/* Dataset Loader Buttons */}
      <div className="px-6 py-2 bg-white border-t border-b border-gray-200 flex gap-2">
        <button
          onClick={() => handleLoadDataset('olympics')}
          disabled={loadingDataset === 'olympics' || isTyping}
          className="px-3 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded transition-colors text-sm"
        >
          {loadingDataset === 'olympics' ? 'Loading Olympics...' : 'Load Olympics'}
        </button>
        <button
          onClick={() => handleLoadDataset('gdelt')}
          disabled={loadingDataset === 'gdelt' || isTyping}
          className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded transition-colors text-sm"
        >
          {loadingDataset === 'gdelt' ? 'Loading GDELT...' : 'Load GDELT'}
        </button>
        <button
          onClick={() => handleLoadDataset('unsdg')}
          disabled={loadingDataset === 'unsdg' || isTyping}
          className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-800 rounded transition-colors text-sm"
        >
          {loadingDataset === 'unsdg' ? 'Loading UN SDG...' : 'Load UN SDG'}
        </button>
        <label className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded transition-colors text-sm cursor-pointer">
          {loadingDataset === 'custom' ? 'Uploading...' : 'Upload Your Dataset'}
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
            disabled={loadingDataset === 'custom' || isTyping}
          />
        </label>
      </div>
      {/* Suggested Queries */}
      {messages.length === 1 && (
        <div className="px-6 py-4 bg-white border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-3">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQueries.map((query: string) => (
              <button
                key={query}
                onClick={() => setInputValue(query)}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition-colors"
              >
                {query}
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask anything about this dataset..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isTyping}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-xl transition-colors flex items-center space-x-2"
            title="Send"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;