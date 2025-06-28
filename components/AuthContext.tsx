import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { supabase } from '../utils/supabase';
import { UserProfile } from '../utils/supabase';

interface AuthContextType {
  isSignedIn: boolean;
  isLoading: boolean;
  user: any;
  userProfile: UserProfile | null;
  signOut: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSignedIn, isLoaded, signOut: clerkSignOut } = useAuth();
  const { user } = useUser();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Debug logging
  useEffect(() => {
    console.log('AuthContext state:', { isLoaded, isSignedIn, userId: user?.id });
  }, [isLoaded, isSignedIn, user?.id]);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching user profile for:', userId);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching user profile:', error);
        return;
      }

      if (data) {
        console.log('Found existing user profile:', data);
        setUserProfile(data);
      } else {
        console.log('Creating new user profile for:', userId);
        // Create user profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            id: userId,
            email: user?.emailAddresses[0]?.emailAddress || '',
            full_name: user?.fullName || '',
            avatar_url: user?.imageUrl || '',
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating user profile:', createError);
        } else {
          console.log('Created new user profile:', newProfile);
          setUserProfile(newProfile);
        }
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  const refreshUserProfile = async () => {
    if (user?.id) {
      await fetchUserProfile(user.id);
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out...');
      await clerkSignOut();
      setUserProfile(null);
      console.log('Sign out successful');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn && user?.id) {
      console.log('User is signed in, fetching profile...');
      fetchUserProfile(user.id);
    } else if (isLoaded) {
      console.log('Auth loaded, user not signed in');
      setIsLoading(false);
    }
  }, [isLoaded, isSignedIn, user?.id]);

  useEffect(() => {
    if (isLoaded) {
      setIsLoading(false);
    }
  }, [isLoaded]);

  const value: AuthContextType = {
    isSignedIn: isSignedIn || false,
    isLoading,
    user,
    userProfile,
    signOut,
    refreshUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 