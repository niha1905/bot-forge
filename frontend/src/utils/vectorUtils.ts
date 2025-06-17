// Simple vectorizer and similarity for demo purposes

// Tokenizes text and returns a bag-of-words vector (for demo, not production)
export function vectorize(text: string, vocabulary: string[]): number[] {
  const tokens = text.toLowerCase().split(/\W+/);
  return vocabulary.map(word => tokens.filter(t => t === word).length);
}

// Builds a vocabulary from an array of texts
export function buildVocabulary(texts: string[]): string[] {
  const vocabSet = new Set<string>();
  texts.forEach(text => {
    text.toLowerCase().split(/\W+/).forEach(token => {
      if (token) vocabSet.add(token);
    });
  });
  return Array.from(vocabSet);
}

// Cosine similarity between two vectors
export function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  return normA && normB ? dot / (normA * normB) : 0;
}

// Find top N most similar rows to a query
export function vectorSearch(query: string, dataRows: any[], vectors: number[][], vocabulary: string[], topN = 3) {
  const queryVec = vectorize(query, vocabulary);
  const scored = vectors.map((vec, i) => ({
    row: dataRows[i],
    score: cosineSimilarity(queryVec, vec)
  }));
  return scored.sort((a, b) => b.score - a.score).slice(0, topN);
}
