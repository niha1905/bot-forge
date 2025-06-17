import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { ArrowLeft, BarChart3, TrendingUp, PieChart, Activity, Download, RefreshCw } from 'lucide-react';
import { Dataset } from '../types';
import axios from 'axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

interface AnalysisDashboardProps {
  dataset: Dataset;
  onBack: () => void;
}

interface AnalysisData {
  summary: {
    totalRecords: number;
    uniqueValues: number;
    missingValues: number;
    dataTypes: Record<string, number>;
  };
  trends: {
    labels: string[];
    values: number[];
  };
  distribution: {
    labels: string[];
    values: number[];
  };
  correlations: Array<{
    field1: string;
    field2: string;
    correlation: number;
  }>;
}

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ dataset, onBack }) => {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeChart, setActiveChart] = useState<'line' | 'bar' | 'pie' | 'doughnut'>('bar');

  useEffect(() => {
    fetchAnalysisData();
  }, [dataset]);

  const fetchAnalysisData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Try to fetch from backend, fallback to frontend analysis
      let response;
      try {
        response = await axios.post(`${BACKEND_URL}/analyze`, {
          dataset: dataset.id
        });
        setAnalysisData(response.data);
      } catch (backendError) {
        // Fallback to frontend analysis if backend is not available
        const fallbackData = analyzeFrontendData(dataset);
        setAnalysisData(fallbackData);
      }
    } catch (err) {
      setError('Failed to analyze dataset');
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const analyzeFrontendData = (dataset: Dataset): AnalysisData => {
    const data = dataset.dataRows || [];
    if (data.length === 0) {
      return {
        summary: { totalRecords: 0, uniqueValues: 0, missingValues: 0, dataTypes: {} },
        trends: { labels: [], values: [] },
        distribution: { labels: [], values: [] },
        correlations: []
      };
    }

    const fields = Object.keys(data[0]);
    const summary = {
      totalRecords: data.length,
      uniqueValues: 0,
      missingValues: 0,
      dataTypes: {} as Record<string, number>
    };

    // Calculate data types
    fields.forEach(field => {
      const values = data.map(row => row[field]);
      const nonNullValues = values.filter(v => v != null && v !== '');
      const numberValues = nonNullValues.filter(v => !isNaN(Number(v)));
      
      if (numberValues.length > nonNullValues.length * 0.8) {
        summary.dataTypes[field] = numberValues.length;
      } else {
        summary.uniqueValues += new Set(nonNullValues).size;
      }
      
      summary.missingValues += values.length - nonNullValues.length;
    });

    // Generate trend data (simulate time series if no date field)
    const trendLabels = data.slice(0, 10).map((_, i) => `Data Point ${i + 1}`);
    const numericField = fields.find(field => {
      const values = data.map(row => row[field]);
      return values.some(v => !isNaN(Number(v)));
    });

    const trendValues = numericField 
      ? data.slice(0, 10).map(row => Number(row[numericField]) || 0)
      : Array.from({ length: 10 }, (_, i) => Math.random() * 100);

    // Generate distribution data
    const categoricalField = fields.find(field => {
      const values = data.map(row => row[field]);
      const uniqueValues = new Set(values);
      return uniqueValues.size < data.length * 0.5 && uniqueValues.size > 1;
    });

    let distributionData = { labels: ['Category A', 'Category B', 'Category C'], values: [30, 45, 25] };
    
    if (categoricalField) {
      const counts = data.reduce((acc, row) => {
        const value = row[categoricalField];
        acc[value] = (acc[value] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const sortedEntries = Object.entries(counts) as [string, number][];
      sortedEntries.sort(([, a], [, b]) => b - a);
      const topEntries = sortedEntries.slice(0, 8);
      
      distributionData = {
        labels: topEntries.map(([label]) => label),
        values: topEntries.map(([, count]) => count)
      };
    }

    return {
      summary,
      trends: { labels: trendLabels, values: trendValues },
      distribution: distributionData,
      correlations: []
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${dataset.name} - Data Analysis`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: 'Data Distribution',
      },
    },
  };

  const getChartData = () => {
    if (!analysisData) return null;

    const colors = [
      'rgba(59, 130, 246, 0.8)',
      'rgba(16, 185, 129, 0.8)',
      'rgba(245, 101, 101, 0.8)',
      'rgba(251, 191, 36, 0.8)',
      'rgba(139, 92, 246, 0.8)',
      'rgba(236, 72, 153, 0.8)',
      'rgba(20, 184, 166, 0.8)',
      'rgba(248, 113, 113, 0.8)',
    ];

    switch (activeChart) {
      case 'line':
        return {
          labels: analysisData.trends.labels,
          datasets: [
            {
              label: 'Trend Analysis',
              data: analysisData.trends.values,
              borderColor: 'rgba(59, 130, 246, 1)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderWidth: 2,
              fill: true,
            },
          ],
        };
      case 'bar':
        return {
          labels: analysisData.distribution.labels,
          datasets: [
            {
              label: 'Distribution',
              data: analysisData.distribution.values,
              backgroundColor: colors.slice(0, analysisData.distribution.labels.length),
              borderColor: colors.slice(0, analysisData.distribution.labels.length).map(color => 
                color.replace('0.8', '1')
              ),
              borderWidth: 1,
            },
          ],
        };
      case 'pie':
      case 'doughnut':
        return {
          labels: analysisData.distribution.labels,
          datasets: [
            {
              data: analysisData.distribution.values,
              backgroundColor: colors.slice(0, analysisData.distribution.labels.length),
              borderColor: colors.slice(0, analysisData.distribution.labels.length).map(color => 
                color.replace('0.8', '1')
              ),
              borderWidth: 2,
            },
          ],
        };
      default:
        return null;
    }
  };

  const renderChart = () => {
    const data = getChartData();
    if (!data) return null;

    switch (activeChart) {
      case 'line':
        return <Line data={data} options={chartOptions} />;
      case 'bar':
        return <Bar data={data} options={chartOptions} />;
      case 'pie':
        return <Pie data={data} options={pieOptions} />;
      case 'doughnut':
        return <Doughnut data={data} options={pieOptions} />;
      default:
        return null;
    }
  };

  const downloadReport = () => {
    if (!analysisData) return;
    
    const report = {
      dataset: dataset.name,
      summary: analysisData.summary,
      trends: analysisData.trends,
      distribution: analysisData.distribution,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dataset.name}_analysis_report.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-4">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Back">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">Analysis Dashboard</h2>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Analyzing dataset...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-4">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Back">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">Analysis Dashboard</h2>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={fetchAnalysisData}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Retry Analysis
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${dataset.color} flex items-center justify-center`}>
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Analysis Dashboard</h2>
              <p className="text-sm text-gray-500">{dataset.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchAnalysisData}
              className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <button
              onClick={downloadReport}
              className="px-3 py-2 text-sm bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Records</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analysisData?.summary.totalRecords.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unique Values</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analysisData?.summary.uniqueValues.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Missing Values</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analysisData?.summary.missingValues.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <PieChart className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Data Fields</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Object.keys(analysisData?.summary.dataTypes || {}).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Chart Controls */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Data Visualization</h3>
            <div className="flex space-x-2">
              {[
                { type: 'bar' as const, icon: BarChart3, label: 'Bar Chart' },
                { type: 'line' as const, icon: TrendingUp, label: 'Line Chart' },
                { type: 'pie' as const, icon: PieChart, label: 'Pie Chart' },
                { type: 'doughnut' as const, icon: Activity, label: 'Doughnut Chart' },
              ].map(({ type, icon: Icon, label }) => (
                <button
                  key={type}
                  onClick={() => setActiveChart(type)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2 ${
                    activeChart === type
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  title={label}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Chart */}
          <div className="h-96">
            {renderChart()}
          </div>
        </div>

        {/* Data Types Breakdown */}
        {analysisData?.summary.dataTypes && Object.keys(analysisData.summary.dataTypes).length > 0 && (
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Types Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(analysisData.summary.dataTypes).map(([field, count]) => (
                <div key={field} className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900">{field}</p>
                  <p className="text-sm text-gray-600">{count} numeric values</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisDashboard;