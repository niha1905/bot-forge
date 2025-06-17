export interface Dataset {
  id: string;
  name: string;
  description: string;
  source: string;
  recordCount: number;
  lastUpdated: string;
  tags: string[];
  icon: string;
  color: string;
  // Optional: raw data rows for uploaded datasets
  dataRows?: any[];
  // Optional: vector representations for each row
  vectors?: number[][];
}

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  sources?: string[];
}

export interface ChatSession {
  id: string;
  datasetId: string;
  messages: ChatMessage[];
  createdAt: Date;
}