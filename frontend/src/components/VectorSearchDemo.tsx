import React, { useState } from 'react';

const DATASETS = [
  { key: 'olympics', label: 'Olympics' },
  { key: 'gdelt', label: 'GDELT' },
  { key: 'unsdg', label: 'UNSDG' }
];

const API_BASE = 'http://localhost:5000'; // Change if backend is hosted elsewhere

const VectorSearchDemo: React.FC = () => {
  const [selectedDataset, setSelectedDataset] = useState('olympics');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadMsg, setLoadMsg] = useState('');

  const handleLoadDataset = async (dataset: string) => {
    setLoadMsg('Loading...');
    try {
      // Automatically create index before loading dataset
      setLoadMsg('Creating vector index...');
      await fetch(`${API_BASE}/create-index/${dataset}`, { method: 'POST' });
      setLoadMsg('Loading dataset...');
      const res = await fetch(`${API_BASE}/load/${dataset}`, { method: 'POST' });
      const data = await res.json();
      setLoadMsg(data.message || 'Loaded!');
    } catch (err) {
      setLoadMsg('Failed to load dataset or create index.');
    }
  };

  const handleQuery = async () => {
    setLoading(true);
    setResults([]);
    try {
      const res = await fetch(`${API_BASE}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, dataset: selectedDataset })
      });
      const data = await res.json();
      setResults(data);
    } catch (err) {
      setResults([{ text: 'Error querying backend.' }]);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow mt-10">
      <h2 className="text-2xl font-bold mb-4">MongoDB Vector Search Demo</h2>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Load Sample Dataset:</label>
        <div className="flex gap-2 mb-2">
          {DATASETS.map(ds => (
            <button
              key={ds.key}
              onClick={() => handleLoadDataset(ds.key)}
              className="px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded text-blue-700 text-sm"
            >
              {ds.label}
            </button>
          ))}
        </div>
        {loadMsg && <div className="text-xs text-gray-600 mb-2">{loadMsg}</div>}
      </div>
      <div className="mb-4">
        <label htmlFor="dataset-select" className="block font-semibold mb-1">Select Dataset to Query:</label>
        <select
          id="dataset-select"
          value={selectedDataset}
          onChange={e => setSelectedDataset(e.target.value)}
          className="border rounded px-2 py-1"
        >
          {DATASETS.map(ds => (
            <option key={ds.key} value={ds.key}>{ds.label}</option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor="query-input" className="block font-semibold mb-1">Enter Query:</label>
        <input
          id="query-input"
          name="query"
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="border rounded px-2 py-1 w-full"
          placeholder="e.g. Which country won the most gold medals?"
        />
      </div>
      <button
        onClick={handleQuery}
        disabled={loading || !query}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
      >
        {loading ? 'Searching...' : 'Search'}
      </button>
      <div className="mt-6">
        <h3 className="font-semibold mb-2">Results:</h3>
        {results.length === 0 && <div className="text-gray-500 text-sm">No results yet.</div>}
        <ul className="space-y-2">
          {results.map((r, i) => (
            <li key={i} className="bg-gray-50 border rounded p-2 text-sm">
              {r.text || JSON.stringify(r)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default VectorSearchDemo;
