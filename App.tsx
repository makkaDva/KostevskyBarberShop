import 'react-native-url-polyfill/auto';
import React, { useState, useEffect } from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider, useAuth } from './AuthContext';
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/auth/HomeScreen';
import BarbersScreen from './screens/auth/BarbersScreen';
import AppointmentsSelectionScreen from './screens/auth/AppointmentsSelectionScreen';
import MojiTermini from './screens/auth/MojiTermini';
import LoyaltyScreen from './screens/auth/LoyaltyScreen';
import MojProfil from './screens/auth/MojProfil';
import ProductsScreen from './screens/auth/ProductsScreen';
import { StatusBar, Platform, View, ActivityIndicator, LogBox } from 'react-native';
import { supabase } from './supabaseClient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import TimeSelectionScreen from './screens/auth/TimeSelectionScreen';
import BarberHomeScreen from './screens/auth/BarberHome';
import BarberScheduleScreen from './screens/auth/BarberScheduleScreen';
import BarberDaysOff from './screens/auth/BarberDaysOff';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Dimensions } from 'react-native';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

const { width } = Dimensions.get('window');

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const BookingStack = createStackNavigator();
const BarberStack = createStackNavigator();

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#121212',
    card: '#121212',
    text: '#FFFFFF',
    border: '#121212',
    primary: '#FFFFFF', // promenjeno na belo
    notification: '#FFFFFF',
  },
};

function BookingStackScreen() {
  return (
    <BookingStack.Navigator 
      initialRouteName="Barbers"
      screenOptions={{ 
        headerShown: false,
        gestureEnabled: Platform.OS === 'ios'
      }}
    >
      <BookingStack.Screen 
        name="Barbers" 
        component={BarbersScreen} 
        initialParams={{ showToast: false }}
      />
      <BookingStack.Screen 
        name="AppointmentSelection" 
        component={AppointmentsSelectionScreen} 
      />
      <BookingStack.Screen 
        name="TimeSelection" 
        component={TimeSelectionScreen} 
      />
    </BookingStack.Navigator>
  );
}

function BarberStackScreen() {
  return (
    <BarberStack.Navigator 
      screenOptions={{ 
        headerShown: false,
        gestureEnabled: Platform.OS === 'ios'
      }}
    >
      <BarberStack.Screen name="BarberHome" component={BarberHomeScreen} />
      <BarberStack.Screen name="BarberSchedule" component={BarberScheduleScreen} />
      <BarberStack.Screen name="AddDaysOff" component={BarberDaysOff} />
    </BarberStack.Navigator>
  );
}

function MainTabs() {
  const { session, loading: authLoading, isAuthInitialized, isOnline } = useAuth();
  const [isLoyaltyMember, setIsLoyaltyMember] = useState(false);
  const [loyaltyLoading, setLoyaltyLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkLoyaltyStatus = async () => {
      if (!authLoading && isAuthInitialized && session?.user?.id && isOnline) {
        try {
          const { data, error } = await supabase.rpc('check_loyalty_member', {
            user_id: session.user.id
          });

          if (!isMounted) return;

          if (error) {
            console.error('Loyalty check error:', error);
            setIsLoyaltyMember(false);
          } else {
            setIsLoyaltyMember(data);
          }
        } catch (error) {
          console.error('Unexpected error:', error);
          setIsLoyaltyMember(false);
        } finally {
          if (isMounted) {
            setLoyaltyLoading(false);
          }
        }
      } else {
        setLoyaltyLoading(false);
      }
    };

    checkLoyaltyStatus();

    return () => {
      isMounted = false;
    };
  }, [session, authLoading, isAuthInitialized, isOnline]);

  if (authLoading || !isAuthInitialized || loyaltyLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName = '';

            if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
            else if (route.name === 'Book') iconName = 'content-cut';
            else if (route.name === 'MojiTermini') iconName = 'format-list-checks';
            else if (route.name === 'Loyalty') iconName = focused ? 'credit-card' : 'credit-card-outline';
            else if (route.name === 'Profile') iconName = focused ? 'account' : 'account-outline';
            // else if (route.name === 'Products') iconName = focused ? 'spray' : 'spray';

            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#FFFFFF', // belo za aktivni tab
          tabBarInactiveTintColor: '#888',
          tabBarStyle: {
            backgroundColor: '#1A1A1A',
            borderTopColor: '#333',
            height: Platform.OS === 'ios' ? (width >= 768 ? 90 : 85) : 60,
            paddingBottom: Platform.OS === 'ios' ? (width >= 768 ? 20 : 15) : 5,
            width: '100%',
            maxWidth: 1024,
            alignSelf: 'center'
          },
          tabBarLabelStyle: {
            fontSize: 12,
            marginTop: 6,
            fontWeight: '500'
          },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Početna' }} />
        <Tab.Screen
          name="Book"
          component={BookingStackScreen}
          options={{ tabBarLabel: 'Zakaži' }}
        />
        <Tab.Screen name="MojiTermini" component={MojiTermini} options={{ tabBarLabel: 'Moji termini' }} />
        {/* <Tab.Screen name="Products" component={ProductsScreen} options={{ tabBarLabel: 'Proizvodi' }} /> */}
        {isLoyaltyMember && (
          <Tab.Screen name="Loyalty" component={LoyaltyScreen} options={{ tabBarLabel: 'Loyalty' }} />
        )}
        <Tab.Screen name="Profile" component={MojProfil} options={{ tabBarLabel: 'Profil' }} />
      </Tab.Navigator>
    </View>
  );
}

function RootNavigator() {
  const { session, loading, isBarber, isAuthInitialized, isOnline } = useAuth();
  const [cleanupDone, setCleanupDone] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const runCleanupCheck = async () => {
      if (!isOnline) return;

      try {
        const today = new Date().toISOString().split('T')[0];
        const { error } = await supabase.rpc('clean_past_appointments', {
          request_date: today
        });

        if (!isMounted) return;

        if (error) {
          console.error('Cleanup error:', error);
        } else {
          setCleanupDone(true);
        }
      } catch (error) {
        console.error('Unexpected cleanup error:', error);
      }
    };

    if (!loading && isAuthInitialized && session && !cleanupDone) {
      runCleanupCheck();
    }

    return () => {
      isMounted = false;
    };
  }, [loading, session, isAuthInitialized, isOnline, cleanupDone]);

  if (loading || !isAuthInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        gestureEnabled: Platform.OS === 'ios'
      }}
    >
      {session ? (
        isBarber ? (
          <Stack.Screen name="BarberRoot" component={BarberStackScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="TimeSelection"
              component={TimeSelectionScreen}
              options={{ gestureEnabled: false }}
            />
          </>
        )
      ) : (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  if (!appIsReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <NavigationContainer theme={MyTheme}>
          <View style={{ 
            flex: 1,
            backgroundColor: '#121212',
            width: '100%',
            maxWidth: 1024,
            alignSelf: 'center'
          }}>
            <RootNavigator />
          </View>
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
