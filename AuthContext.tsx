import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { Session } from '@supabase/supabase-js';
import { Alert, Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import EncryptedStorage from 'react-native-encrypted-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthContextType = {
  session: Session | null;
  loading: boolean;
  isBarber: boolean;
  barberData: any | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkBarberStatus: (userId: string) => Promise<void>;
  isOnline: boolean;
  isAuthInitialized: boolean;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
  isBarber: false,
  barberData: null,
  signIn: async () => {},
  signOut: async () => {},
  checkBarberStatus: async () => {},
  isOnline: false,
  isAuthInitialized: false,
});

const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 15000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBarber, setIsBarber] = useState(false);
  const [barberData, setBarberData] = useState<any | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);

  const safeStorageRemove = async (key: string) => {
    try {
      const item = await EncryptedStorage.getItem(key);
      if (item !== null) {
        try {
          await EncryptedStorage.removeItem(key);
        } catch (removeError) {
          if (removeError instanceof Error) {
            const errorMsg = removeError.message.toLowerCase();
            const ignorableErrors = [
              'item not found',
              'key does not exist',
              'error occured while removing',
              'could not find',
              'no item found',
            ];
            if (!ignorableErrors.some(e => errorMsg.includes(e))) {
              console.warn('Storage remove warning:', removeError);
            }
          }
        }
      }
    } catch (error) {
      console.warn('Storage check warning:', error);
    }
  };

  const storeSession = async (session: Session | null) => {
    try {
      if (session) {
        await EncryptedStorage.setItem('supabase.auth.token', JSON.stringify(session));
      } else {
        await safeStorageRemove('supabase.auth.token');
      }
    } catch (error) {
      console.warn('Storage operation warning:', error);
    }
  };

  useEffect(() => {
    const clearStorageOnFirstRun = async () => {
      try {
        const firstRun = await AsyncStorage.getItem('appFirstRun');
        if (!firstRun) {
          await safeStorageRemove('supabase.auth.token');
          await AsyncStorage.setItem('appFirstRun', 'true');
        }
      } catch (error) {
        console.warn('First run check warning:', error);
      }
    };
    clearStorageOnFirstRun();
  }, []);

  useEffect(() => {
    let networkCheckTimeout: NodeJS.Timeout;
    let hasShownAlert = false;

    const unsubscribe = NetInfo.addEventListener(async (state) => {
      clearTimeout(networkCheckTimeout);
      networkCheckTimeout = setTimeout(async () => {
        try {
          const currentState = await NetInfo.fetch();
          const nowOnline = currentState.isConnected ?? false;
          setIsOnline(nowOnline);

          if (!nowOnline && !hasShownAlert) {
            hasShownAlert = true;
            Alert.alert('Connection Error', 'No internet connection detected');
          } else if (nowOnline) {
            hasShownAlert = false;
            if (!session) {
              await restoreSession();
            }
          }
        } catch (error) {
          console.error('Network state error:', error);
        }
      }, Platform.OS === 'ios' ? 2000 : 1000);
    });

    return () => {
      clearTimeout(networkCheckTimeout);
      unsubscribe();
    };
  }, [session]);

  const checkBarberStatus = async (userId: string, retryCount = 0): Promise<void> => {
    if (!isOnline) {
      setIsAuthInitialized(true);
      return;
    }
    try {
      const { data, error } = await supabase.rpc('is_user_barber', { user_id: userId });
      if (error) throw error;

      if (data) {
        const { data: barberData, error: barberError } = await supabase
          .from('barbers')
          .select('*')
          .eq('authenticated_id', userId)
          .single();
        if (barberError) throw barberError;
        setIsBarber(true);
        setBarberData(barberData);
      } else {
        setIsBarber(false);
        setBarberData(null);
      }
    } catch (error: unknown) {
      console.error('Barber status error:', error);
      if (error instanceof Error && error.message.includes('Network request failed') && retryCount < 2) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return checkBarberStatus(userId, retryCount + 1);
      }
      setIsBarber(false);
      setBarberData(null);
    } finally {
      setIsAuthInitialized(true);
    }
  };

  const restoreSession = async (): Promise<void> => {
    try {
      setLoading(true);
      const storedSession = await EncryptedStorage.getItem('supabase.auth.token');
      if (storedSession) {
        const parsedSession = JSON.parse(storedSession) as Session;
        if (parsedSession.expires_at && parsedSession.expires_at * 1000 > Date.now()) {
          setSession(parsedSession);
          if (parsedSession.user?.id) {
            await checkBarberStatus(parsedSession.user.id);
            return;
          }
        } else {
          await storeSession(null);
        }
      }
      if (isOnline) {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (session?.user?.id) {
          setSession(session);
          await checkBarberStatus(session.user.id);
          return;
        }
      }
    } catch (error) {
      console.error('Session restore error:', error);
    } finally {
      setLoading(false);
      setIsAuthInitialized(true);
    }
  };

  // 🚀 Fix: pokreni restoreSession odmah na mount-u
  useEffect(() => {
    restoreSession();
  }, []);

  useEffect(() => {
    let subscription: { unsubscribe: () => void };
    let isMounted = true;

    const setupAuthListener = async () => {
      const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (!isMounted) return;
          setSession(session);
          await storeSession(session);
          if (session?.user?.id) {
            await checkBarberStatus(session.user.id);
          } else {
            setIsBarber(false);
            setBarberData(null);
          }
        }
      );
      subscription = authSubscription;
    };

    setupAuthListener();

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [isOnline]);

  const signIn = async (email: string, password: string, retryCount = 0): Promise<void> => {
    if (!isOnline) {
      throw new Error('No internet connection');
    }
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.includes('Network request failed') && retryCount < 2) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
          return signIn(email, password, retryCount + 1);
        }
        throw error;
      }
      if (data.session?.user?.id) {
        await checkBarberStatus(data.session.user.id);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'Failed to sign in';
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Please confirm your email first';
      } else if (error.message.includes('Network request failed')) {
        errorMessage = 'Network error. Please try again.';
      }
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setSession(null);
      setIsBarber(false);
      setBarberData(null);
      await safeStorageRemove('supabase.auth.token');
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error('Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      session,
      loading,
      isBarber,
      barberData,
      signIn,
      signOut,
      checkBarberStatus,
      isOnline,
      isAuthInitialized
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
