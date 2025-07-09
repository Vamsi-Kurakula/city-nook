// Common synonyms for answers
const SYNONYMS: { [key: string]: string[] } = {
  // Art & Culture Walk
  'museum': ['museums', 'gallery', 'galleries', 'art museum', 'art gallery'],
  'times square': ['timesquare', 'time square', 'broadway', 'theater district'],
  'fountain': ['fountains', 'water fountain', 'bethesda fountain'],
  
  // Foodie Adventure
  'katz': ['katzs', 'katz deli', 'katz delicatessen', 'pastrami'],
  'brooklyn bridge': ['brooklyn', 'bridge', 'brooklynbridge'],
  'grimaldi': ['grimaldis', 'grimaldi pizza', 'coal pizza'],
  
  // Historic Downtown
  'federal hall': ['federal', 'washington', 'first capital'],
  'one world trade center': ['world trade center', 'freedom tower', 'wtc', 'trade center'],
  'wall street': ['wallstreet', 'financial district', 'charging bull'],
  
  // Taste Quest (all riddles)
  'frozen hot chocolate': ['frozen chocolate', 'serendipity', 'hot chocolate'],
  'magnolia bakery': ['magnolia', 'cupcakes', 'sex and the city'],
  'macaron': ['macarons', 'french pastry', 'laduree'],
  'levain cookie': ['levain', 'thick cookie', 'chocolate chip'],
  'croissant': ['croissants', 'french pastry', 'dominique ansel'],
  'big gay ice cream': ['big gay', 'rainbow ice cream', 'lgbt ice cream'],
  
  // Default
  'empire state building': ['empire state', 'empire', 'esb'],
  'central park': ['central', 'park', 'manhattan park'],
  
  // General
  'keyboard': ['keyboards', 'computer keyboard', 'typing'],
  'park': ['parks', 'green space'],
  'building': ['buildings', 'structure', 'architecture'],
  'art': ['arts', 'artwork', 'painting', 'sculpture'],
  'theater': ['theaters', 'theatre', 'theatres', 'broadway theater'],
  'statue': ['statues', 'sculpture', 'monument'],
  'bridge': ['bridges', 'manhattan bridge'],
  'tower': ['towers', 'skyscraper'],
  'library': ['libraries', 'public library', 'reading room'],
};

import { validateUserAnswer, sanitizeInput } from './inputValidation';

export const validateAnswer = (userAnswer: string, correctAnswer: string): boolean => {
  if (!userAnswer || !correctAnswer) return false;
  
  // Validate and sanitize user input first
  if (!validateUserAnswer(userAnswer)) {
    return false;
  }
  
  // Normalize answers (lowercase, trim whitespace)
  const normalizedUser = sanitizeInput(userAnswer.toLowerCase().trim());
  const normalizedCorrect = correctAnswer.toLowerCase().trim();
  
  // Direct match
  if (normalizedUser === normalizedCorrect) {
    return true;
  }
  
  // Check synonyms
  const synonyms = SYNONYMS[normalizedCorrect] || [];
  if (synonyms.includes(normalizedUser)) {
    return true;
  }
  
  // Partial match (user answer contains correct answer or vice versa)
  if (normalizedUser.includes(normalizedCorrect) || normalizedCorrect.includes(normalizedUser)) {
    return true;
  }
  
  // Check if any synonym is a partial match
  for (const synonym of synonyms) {
    if (normalizedUser.includes(synonym) || synonym.includes(normalizedUser)) {
      return true;
    }
  }
  
  return false;
};

export const getAnswerHint = (correctAnswer: string): string => {
  const synonyms = SYNONYMS[correctAnswer.toLowerCase()] || [];
  if (synonyms.length > 0) {
    return `Synonyms: ${synonyms.slice(0, 2).join(', ')}`;
  }
  return '';
}; 