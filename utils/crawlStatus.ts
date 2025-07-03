/**
 * Format time remaining in a user-friendly way
 * - More than 24 hours: shows as "2d 5h 30m" (days, hours, minutes)
 * - 6 hours or more: shows as "8h 30m" (hours, minutes)
 * - Less than 6 hours but more than 1 hour: shows as "2h 30m 45s" (hours, minutes, seconds)
 * - Less than 1 hour but more than 1 minute: shows as "30:45" (minutes:seconds)
 * - Less than 1 minute: shows as "45s" (just seconds)
 */
export const formatTimeRemaining = (seconds: number): string => {
  const days = Math.floor(seconds / 86400); // 24 * 60 * 60
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours >= 6) {
    return `${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  } else if (minutes > 0) {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else {
    return `${remainingSeconds}s`;
  }
};

export interface CrawlStatus {
  status: 'upcoming' | 'ongoing' | 'completed' | 'unknown';
  timeUntilStart?: string;
  timeSinceStart?: string;
  estimatedEndTime?: Date;
  currentStopIndex?: number;
  stopDurations: { [stopNumber: number]: number }; // Duration in minutes
}

export interface StopTiming {
  stopNumber: number;
  startTime: Date;
  endTime: Date;
  duration: number; // minutes
  isActive: boolean;
  isCompleted: boolean;
}

/**
 * Parse a time string into a Date object
 * Supports formats: "HH:MM", "HH:MM:SS", "YYYY-MM-DD HH:MM"
 */
export const parseTimeString = (timeString: string): Date => {
  const now = new Date();
  
  if (timeString.includes('-')) {
    // Full date format: "YYYY-MM-DD HH:MM"
    return new Date(timeString);
  } else {
    // Time only format: "HH:MM" or "HH:MM:SS"
    const timeParts = timeString.split(':');
    const targetTime = new Date();
    targetTime.setHours(
      parseInt(timeParts[0]), 
      parseInt(timeParts[1]), 
      timeParts.length > 2 ? parseInt(timeParts[2]) : 0, 
      0
    );
    
    // If the time has already passed today, assume it's for tomorrow
    if (targetTime <= now) {
      targetTime.setDate(targetTime.getDate() + 1);
    }
    
    return targetTime;
  }
};

/**
 * Calculate the status of a crawl based on its start time and duration
 */
export const calculateCrawlStatus = (
  startTimeString: string | undefined,
  duration: string,
  stops?: any[]
): CrawlStatus => {
  if (!startTimeString) {
    return {
      status: 'unknown',
      stopDurations: {}
    };
  }

  const startTime = parseTimeString(startTimeString);
  const now = new Date();
  
  // Parse duration (e.g., "2-3 hours" -> 2.5 hours, "1.5 hours" -> 1.5 hours)
  const durationMatch = duration.match(/(\d+(?:\.\d+)?)\s*hours?/);
  const durationHours = durationMatch ? parseFloat(durationMatch[1]) : 2;
  
  const estimatedEndTime = new Date(startTime.getTime() + (durationHours * 60 * 60 * 1000));
  
  // Calculate stop durations (evenly distribute time across stops)
  const stopDurations: { [stopNumber: number]: number } = {};
  if (stops && stops.length > 0) {
    const totalMinutes = durationHours * 60;
    const minutesPerStop = Math.floor(totalMinutes / stops.length);
    const remainingMinutes = totalMinutes % stops.length;
    
    stops.forEach((stop, index) => {
      const stopNumber = stop.stop_number;
      stopDurations[stopNumber] = minutesPerStop + (index < remainingMinutes ? 1 : 0);
    });
  }

  if (now < startTime) {
    // Crawl hasn't started yet
    const timeUntilStartMs = startTime.getTime() - now.getTime();
    const timeUntilStartSeconds = Math.floor(timeUntilStartMs / 1000);
    
    return {
      status: 'upcoming',
      timeUntilStart: `${formatTimeRemaining(timeUntilStartSeconds)} until start`,
      estimatedEndTime,
      stopDurations
    };
  } else if (now >= startTime && now <= estimatedEndTime) {
    // Crawl is ongoing
    const timeSinceStart = now.getTime() - startTime.getTime();
    const hours = Math.floor(timeSinceStart / (1000 * 60 * 60));
    const minutes = Math.floor((timeSinceStart % (1000 * 60 * 60)) / (1000 * 60));
    
    let timeString = '';
    if (hours > 0) {
      timeString = `${hours}h ${minutes}m in`;
    } else {
      timeString = `${minutes}m in`;
    }
    
    // Calculate current stop based on elapsed time
    let currentStopIndex = 0;
    let elapsedMinutes = timeSinceStart / (1000 * 60);
    
    for (let i = 0; i < (stops?.length || 0); i++) {
      const stopDuration = stopDurations[stops![i].stop_number] || 0;
      if (elapsedMinutes <= stopDuration) {
        currentStopIndex = i;
        break;
      }
      elapsedMinutes -= stopDuration;
      currentStopIndex = i + 1;
    }
    
    return {
      status: 'ongoing',
      timeSinceStart: timeString,
      estimatedEndTime,
      currentStopIndex: Math.min(currentStopIndex, (stops?.length || 1) - 1),
      stopDurations
    };
  } else {
    // Crawl has completed
    return {
      status: 'completed',
      estimatedEndTime,
      stopDurations
    };
  }
};

/**
 * Get stop timing information for a specific stop
 */
export const getStopTiming = (
  stopNumber: number,
  crawlStartTime: Date,
  stopDurations: { [stopNumber: number]: number },
  currentStopIndex: number
): StopTiming => {
  let stopStartTime = new Date(crawlStartTime);
  
  // Calculate start time for this stop
  for (let i = 1; i < stopNumber; i++) {
    const duration = stopDurations[i] || 0;
    stopStartTime = new Date(stopStartTime.getTime() + (duration * 60 * 1000));
  }
  
  const duration = stopDurations[stopNumber] || 0;
  const stopEndTime = new Date(stopStartTime.getTime() + (duration * 60 * 1000));
  const now = new Date();
  
  const isActive = stopNumber === (currentStopIndex + 1) && 
                   now >= stopStartTime && 
                   now <= stopEndTime;
  
  const isCompleted = stopNumber < (currentStopIndex + 1);
  
  return {
    stopNumber,
    startTime: stopStartTime,
    endTime: stopEndTime,
    duration,
    isActive,
    isCompleted
  };
};

/**
 * Format a date for display
 */
export const formatTimeForDisplay = (date: Date): string => {
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}; 