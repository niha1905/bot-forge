import React, { useRef } from 'react';
import { Dataset } from '../types';
import DatasetCard from './DatasetCard';

interface DatasetGridProps {
  datasets: Dataset[];
  onSelectDataset: (dataset: Dataset, mode?: 'chat' | 'analysis') => void;
}

const DatasetGrid: React.FC<DatasetGridProps> = ({ datasets, onSelectDataset }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload and parsing
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let dataRows: any[] = [];
        if (file.name.endsWith('.json')) {
          dataRows = JSON.parse(e.target?.result as string);
        } else if (file.name.endsWith('.csv')) {
          // Simple CSV parsing (assumes header row)
          const text = e.target?.result as string;
          const [header, ...rows] = text.split('\n').filter(Boolean);
          const keys = header.split(',');
          dataRows = rows.map(row => {
            const values = row.split(',');
            return Object.fromEntries(keys.map((k, i) => [k.trim(), values[i]?.trim()]));
          });
        }
        if (dataRows.length > 0) {
          const newDataset = {
            id: `uploaded-${Date.now()}`,
            name: file.name,
            description: 'User uploaded dataset',
            source: 'User Upload',
            recordCount: dataRows.length,
            lastUpdated: new Date().toISOString().slice(0, 10),
            tags: ['Uploaded'],
            icon: 'Database',
            color: 'from-yellow-500 to-orange-500',
            dataRows,
            vectors: [] // To be filled after vectorization
          };
          // Add to datasets (assumes datasets is managed in parent via props)
          if (typeof window !== 'undefined' && window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('addDataset', { detail: newDataset }));
          }
        }
      } catch (err) {
        alert('Failed to parse file. Please upload a valid CSV or JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Upload Section */}
        <div className="mb-8 flex flex-col items-center">
          <label className="mb-2 font-semibold text-gray-700">Upload your own dataset (CSV or JSON):</label>
          <input
            type="file"
            accept=".csv,.json"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
            title="Upload CSV or JSON dataset"
            placeholder="Choose a CSV or JSON file"
          />
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            <span>Powered by MongoDB Vector Search & Google AI</span>
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Turn <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Datasets
            </span> into
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Conversational AI
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Chat with the world's public data using advanced vector search and AI. 
            Transform static datasets into interactive, intelligent conversations.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Vector Search</h3>
            <p className="text-gray-600">MongoDB's advanced vector search finds relevant data patterns instantly</p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-violet-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Natural Queries</h3>
            <p className="text-gray-600">Ask questions in plain English and get intelligent, contextual responses</p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Rich Insights</h3>
            <p className="text-gray-600">Get detailed analysis, trends, and correlations from massive datasets</p>
          </div>
        </div>

        {/* Dataset Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Choose a Dataset to Explore</h2>
          <p className="text-gray-600 mb-8">
            Select from curated public datasets to start your conversational AI experience
          </p>
          {/* Debug: Show datasets count and names */}
          <div className="text-xs text-gray-400 mb-2">Datasets loaded: {datasets.length} [{datasets.map(d => d.name).join(', ')}]</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {datasets.map((dataset) => (
            <DatasetCard
              key={dataset.id}
              dataset={dataset}
              onSelect={onSelectDataset}
            />
          ))}
        </div>

        {/* Technical Stack */}
        <div className="mt-20 bg-white rounded-2xl border border-gray-200 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Built with Modern AI Stack</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.193 9.555c-1.264-5.58-4.252-7.414-4.573-8.115-.28-.394-.53-.954-.735-1.44-.036.495-.055.685-.523 1.184-.723.566-4.438 3.682-4.74 10.02-.282 5.912 4.27 9.435 4.888 9.884l.07.05A73.49 73.49 0 0111.91 24h.481c.114-1.032.284-2.056.51-3.07.417-.296.604-.463.85-.693a11.342 11.342 0 003.639-8.464c.01-.814-.103-1.662-.197-2.218zm-5.336 8.195s0-8.291.275-8.29c.213 0 .49 10.695.49 10.695-.381-.045-.765-1.76-.765-2.405z"/>
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-900">MongoDB</p>
              <p className="text-xs text-gray-500">Vector Search</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-900">Google AI</p>
              <p className="text-xs text-gray-500">Gemini & Vertex</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-900">Vector AI</p>
              <p className="text-xs text-gray-500">Embeddings</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-900">Public Data</p>
              <p className="text-xs text-gray-500">Open Sources</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatasetGrid;