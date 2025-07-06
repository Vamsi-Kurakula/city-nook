import React from 'react';
import { CrawlStop } from '../../../types/crawl';
import RiddleStop from './RiddleStop';
import LocationStop from './LocationStop';
import PhotoStop from './PhotoStop';
import ButtonStop from './ButtonStop';

interface StopComponentProps {
  stop: CrawlStop;
  onComplete: (userAnswer: string) => void;
  isCompleted: boolean;
  userAnswer?: string;
  crawlStartTime?: string;
  stopDurations?: { [stopNumber: number]: number };
  currentStopIndex?: number;
  allStops?: CrawlStop[];
}

export default function StopComponent({ 
  stop, 
  onComplete, 
  isCompleted, 
  userAnswer,
  crawlStartTime,
  stopDurations,
  currentStopIndex,
  allStops
}: StopComponentProps) {
  // Determine the stop type based on the stop components
  const stopType = stop.stop_type || 'button'; // Default to button if no type specified

  // Render the appropriate stop component based on type
  switch (stopType) {
    case 'riddle':
      return (
        <RiddleStop
          stop={stop}
          onComplete={onComplete}
          isCompleted={isCompleted}
          userAnswer={userAnswer}
        />
      );
    
    case 'location':
      return (
        <LocationStop
          stop={stop}
          onComplete={onComplete}
          isCompleted={isCompleted}
          userAnswer={userAnswer}
        />
      );
    
    case 'photo':
      return (
        <PhotoStop
          stop={stop}
          onComplete={onComplete}
          isCompleted={isCompleted}
          userAnswer={userAnswer}
        />
      );
    
    case 'button':
    default:
      return (
        <ButtonStop
          stop={stop}
          onComplete={onComplete}
          isCompleted={isCompleted}
          userAnswer={userAnswer}
          crawlStartTime={crawlStartTime}
          currentStopIndex={currentStopIndex}
          allStops={allStops}
        />
      );
  }
} 