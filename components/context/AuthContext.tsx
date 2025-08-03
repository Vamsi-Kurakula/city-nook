import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { supabase, UserProfile } from '../../utils/database';

// Manual JWT payload decoder (no dependencies)
function decodeJwtPayload(token: string) {
  try {
    const payload = token.split('.')[1];
    // Add padding if needed
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/').padEnd(payload.length + (4 - payload.length % 4) % 4, '=');
    const decoded = atob(base64);
    return JSON.parse(decoded);
  } catch (e) {
    return { error: 'Failed to decode JWT', details: e };
  }
}

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
  const { isSignedIn, isLoaded, signOut: clerkSignOut, getToken } = useAuth();
  const { user } = useUser();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_profile_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching user profile:', error);
        setError(`Database error: ${error.message}`);
        return;
      }

      if (data) {
        setUserProfile(data);
      } else {
        // Use the create_user_profile function instead of direct insert
        const { data: newProfile, error: createError } = await supabase
          .rpc('create_user_profile', {
            clerk_user_id: userId,
            user_email: user?.emailAddresses?.[0]?.emailAddress || '',
            user_full_name: user?.fullName || '',
            user_avatar_url: user?.imageUrl || ''
          });

        if (createError) {
          console.error('Error creating user profile:', createError);
          setError(`Profile creation error: ${createError.message}`);
        } else {
          setUserProfile(newProfile[0]); // Function returns an array, take first element
        }
      }
    } catch (err) {
      console.error('Error in fetchUserProfile:', err);
      setError(`Profile fetch error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const refreshUserProfile = async () => {
    if (user?.id) {
      await fetchUserProfile(user.id);
    }
  };

  const signOut = async () => {
    try {
      await clerkSignOut();
      setUserProfile(null);
      setError(null);
    } catch (error) {
      console.error('Error signing out:', error);
      setError(`Sign out error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  useEffect(() => {
    try {
      if (isLoaded && isSignedIn && user?.id) {
        fetchUserProfile(user.id);
      } else if (isLoaded) {
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error in auth effect:', err);
      setError(`Auth initialization error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  }, [isLoaded, isSignedIn, user?.id]);

  useEffect(() => {
    try {
      if (isLoaded) {
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error in loading effect:', err);
      setIsLoading(false);
    }
  }, [isLoaded]);

  // If there's an error, we should still render the app but log it
  if (error) {
    console.error('AuthContext error:', error);
  }

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