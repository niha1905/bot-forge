import React from 'react';
import { Dataset } from '../types';
import * as LucideIcons from 'lucide-react';
import { MessageCircle, BarChart3 } from 'lucide-react';

interface DatasetCardProps {
  dataset: Dataset;
  onSelect: (dataset: Dataset, mode?: 'chat' | 'analysis') => void;
}

const DatasetCard: React.FC<DatasetCardProps> = ({ dataset, onSelect }) => {
  const IconComponent = (LucideIcons as any)[dataset.icon] || LucideIcons.Database;

  const formatNumber = (num: number): string => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const handleClick = (e: React.MouseEvent, mode: 'chat' | 'analysis' = 'chat') => {
    e.stopPropagation();
    onSelect(dataset, mode);
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${dataset.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
          <IconComponent className="w-6 h-6 text-white" />
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{formatNumber(dataset.recordCount)}</div>
          <div className="text-xs text-gray-500">records</div>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
        {dataset.name}
      </h3>
      
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {dataset.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {dataset.tags.slice(0, 3).map((tag) => (
          <span 
            key={tag}
            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
          >
            {tag}
          </span>
        ))}
        {dataset.tags.length > 3 && (
          <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
            +{dataset.tags.length - 3} more
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
        <span>{dataset.source}</span>
        <span>Updated {new Date(dataset.lastUpdated).toLocaleDateString()}</span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={(e) => handleClick(e, 'chat')}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
        >
          <MessageCircle className="w-4 h-4" />
          Chat
        </button>
        <button
          onClick={(e) => handleClick(e, 'analysis')}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
        >
          <BarChart3 className="w-4 h-4" />
          Analyze
        </button>
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </div>
  );
};

export default DatasetCard;