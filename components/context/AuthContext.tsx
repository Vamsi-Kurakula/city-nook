import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { supabase, UserProfile } from '../../utils/database';

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

  // Remove session clearing logic - let users stay signed in
  // React.useEffect(() => {
  //   if (isLoaded && isSignedIn) {
  //     console.log('App started with existing session, clearing...');
  //     clerkSignOut();
  //   }
  // }, [isLoaded]);

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
        .eq('user_profile_id', userId)
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
        console.log('User data for profile creation:', {
          user_id: userId,
          user_email: user?.emailAddresses?.[0]?.emailAddress || '',
          user_full_name: user?.fullName || '',
          user_avatar_url: user?.imageUrl || ''
        });
        
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
          console.error('Error details:', {
            code: createError.code,
            message: createError.message,
            details: createError.details,
            hint: createError.hint
          });
        } else {
          console.log('Created new user profile:', newProfile);
          setUserProfile(newProfile[0]); // Function returns an array, take first element
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