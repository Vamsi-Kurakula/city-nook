import { useRef, useCallback, useEffect } from 'react';
import { Animated } from 'react-native';

interface AnimationConfig {
  duration: number;
  useNativeDriver?: boolean;
  easing?: any;
}

export function useSafeAnimation(initialValue: number = 0) {
  const animValue = useRef(new Animated.Value(initialValue)).current;
  const isAnimating = useRef(false);
  const animationQueue = useRef<Array<() => void>>([]);

  const animate = useCallback((
    toValue: number, 
    config: AnimationConfig = { duration: 300, useNativeDriver: false },
    callback?: () => void
  ) => {
    // Validate animation value
    if (!animValue || typeof animValue.setValue !== 'function') {
      console.warn('Invalid animation value provided to useSafeAnimation');
      if (callback) callback();
      return;
    }

    // If already animating, queue the animation
    if (isAnimating.current) {
      if (callback) {
        animationQueue.current.push(callback);
      }
      return;
    }

    isAnimating.current = true;
    
    Animated.timing(animValue, {
      toValue,
      duration: config.duration,
      useNativeDriver: config.useNativeDriver ?? false,
      easing: config.easing,
    }).start(() => {
      isAnimating.current = false;
      
      // Execute callback
      if (callback) callback();
      
      // Process queued animations
      const nextAnimation = animationQueue.current.shift();
      if (nextAnimation) {
        nextAnimation();
      }
    });
  }, [animValue]);

  const spring = useCallback((
    toValue: number,
    config: Animated.SpringAnimationConfig = {},
    callback?: () => void
  ) => {
    if (!animValue || typeof animValue.setValue !== 'function') {
      console.warn('Invalid animation value provided to useSafeAnimation');
      if (callback) callback();
      return;
    }

    if (isAnimating.current) {
      if (callback) {
        animationQueue.current.push(callback);
      }
      return;
    }

    isAnimating.current = true;
    
    Animated.spring(animValue, {
      toValue,
      useNativeDriver: config.useNativeDriver ?? false,
      ...config,
    }).start(() => {
      isAnimating.current = false;
      
      if (callback) callback();
      
      const nextAnimation = animationQueue.current.shift();
      if (nextAnimation) {
        nextAnimation();
      }
    });
  }, [animValue]);

  const stopAnimation = useCallback(() => {
    animValue.stopAnimation();
    isAnimating.current = false;
    animationQueue.current = [];
  }, [animValue]);

  const setValue = useCallback((value: number) => {
    animValue.setValue(value);
  }, [animValue]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAnimation();
    };
  }, [stopAnimation]);

  return {
    animValue,
    animate,
    spring,
    stopAnimation,
    setValue,
    isAnimating: isAnimating.current,
  };
} 