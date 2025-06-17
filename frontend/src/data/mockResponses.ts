import { ChatMessage } from '../types';

export const generateMockResponse = (userMessage: string, datasetId: string): ChatMessage => {
  const responses: Record<string, Record<string, string>> = {
    gdelt: {
      'crisis': 'Based on GDELT data analysis, the top 3 humanitarian crises in 2023 were: 1) Ukraine conflict with 2.3M displaced persons, 2) Turkey-Syria earthquake affecting 1.8M people, and 3) Sudan conflict with 1.2M internally displaced. The data shows increasing frequency of climate-related disasters.',
      'news': 'GDELT news analysis shows 47% increase in climate-related coverage globally. Top trending topics include renewable energy adoption (+23%), extreme weather events (+31%), and policy changes in major economies.',
      'conflict': 'Current conflict monitoring shows 23 active armed conflicts worldwide. The data indicates a 15% decrease in battle-related deaths compared to 2022, but civilian casualties have increased by 8% in urban conflict zones.'
    },
    'un-climate': {
      'emissions': 'Global CO2 emissions reached 37.4 billion tons in 2023, a 1.1% increase from 2022. China (30.9%), USA (13.5%), and India (7.3%) remain top emitters. However, per-capita emissions in developed countries are still 2.3x higher than developing nations.',
      'temperature': 'Global average temperature has increased by 1.15°C since pre-industrial times. The last decade (2014-2023) includes the 10 warmest years on record. Arctic regions show warming at twice the global average rate.',
      'renewable': 'Renewable energy capacity grew by 13% in 2023, with solar and wind accounting for 73% of new additions. Global renewable share reached 30% of electricity generation, up from 28% in 2022.'
    },
    'who-health': {
      'covid': 'WHO data shows COVID-19 cases have decreased 89% from peak levels. Vaccination coverage remains uneven globally: 79% in high-income countries vs 32% in low-income countries. Long COVID affects an estimated 65 million people worldwide.',
      'malaria': 'Malaria cases increased 5% in 2023 to 249 million cases globally. Sub-Saharan Africa accounts for 94% of cases. However, mortality rates decreased 8% due to improved treatment access and bed net distribution.',
      'vaccination': 'Global vaccination coverage for routine immunizations has recovered to 84% after pandemic disruptions. HPV vaccine coverage increased to 13% globally, but significant gaps remain in low-income countries.'
    }
  };

  const datasetResponses = responses[datasetId] || {};
  const keywords = Object.keys(datasetResponses);
  
  const matchedKeyword = keywords.find(keyword => 
    userMessage.toLowerCase().includes(keyword)
  );

  const response = matchedKeyword 
    ? datasetResponses[matchedKeyword]
    : `I analyzed the ${datasetId} dataset for your query "${userMessage}". Based on the available data patterns, I found relevant information that suggests significant trends and correlations. The vector search identified 12 relevant documents with similarity scores above 0.85.`;

  return {
    id: Date.now().toString(),
    content: response,
    isUser: false,
    timestamp: new Date(),
    sources: [`${datasetId} dataset`, 'MongoDB Vector Search', 'Google Gemini AI']
  };
};