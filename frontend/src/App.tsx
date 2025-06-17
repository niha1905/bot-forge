import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import DatasetGrid from './components/DatasetGrid';
import ChatInterface from './components/ChatInterface';
import AnalysisDashboard from './components/AnalysisDashboard';
import { Dataset } from './types';
import { datasets as staticDatasets } from './data/datasets';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

type ViewMode = 'datasets' | 'chat' | 'analysis';

function App() {
  const [datasets, setDatasets] = useState<Dataset[]>(staticDatasets);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('datasets');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDatasets = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${BACKEND_URL}/datasets`);
        if (Array.isArray(res.data) && res.data.length > 0) {
          setDatasets(res.data);
        } else {
          setDatasets(staticDatasets);
        }
      } catch (err) {
        setDatasets(staticDatasets);
        setError('Failed to load datasets from backend. Showing example datasets.');
      } finally {
        setLoading(false);
      }
    };
    fetchDatasets();
    const handleAddDataset = (e: any) => {
      setDatasets(prev => [...prev, e.detail]);
    };
    window.addEventListener('addDataset', handleAddDataset);
    return () => window.removeEventListener('addDataset', handleAddDataset);
  }, []);

  useEffect(() => {
    console.log('Datasets state:', datasets);
  }, [datasets]);

  const handleSelectDataset = (dataset: Dataset, mode: ViewMode = 'chat') => {
    setSelectedDataset(dataset);
    setViewMode(mode);
  };

  const handleBackToDatasets = () => {
    setSelectedDataset(null);
    setViewMode('datasets');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {loading && <div className="p-8 text-center">Loading datasets...</div>}
      {error && <div className="p-8 text-center text-red-500">{error}</div>}
      {!loading && !error && viewMode === 'datasets' && (
        <DatasetGrid 
          datasets={datasets} 
          onSelectDataset={handleSelectDataset}
        />
      )}
      {viewMode === 'chat' && selectedDataset && (
        <ChatInterface 
          dataset={selectedDataset} 
          onBack={handleBackToDatasets}
          onAnalyze={() => setViewMode('analysis')}
        />
      )}
      {viewMode === 'analysis' && selectedDataset && (
        <AnalysisDashboard 
          dataset={selectedDataset} 
          onBack={handleBackToDatasets}
        />
      )}
    </div>
  );
}

export default App;