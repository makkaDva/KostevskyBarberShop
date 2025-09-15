import * as React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../AuthContext';
import HomeScreen from '../screens/auth/HomeScreen';
import BarbersScreen from '../screens/auth/BarbersScreen';
import DateSelectionScreen from '../screens/auth/DateSelectionScreen';
import TimeSelectionScreen from '../screens/auth/TimeSelectionScreen';
import TreatmentSelectionScreen from '../screens/auth/TreatmentSelectionScreen';
import MojiTermini from '../screens/auth/MojiTermini';
import LoyaltyScreen from '../screens/auth/LoyaltyScreen';
import MojProfil from '../screens/auth/MojProfil';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import { Text, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RootStackParamList, MainTabParamList } from './types/navigation';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

export default function AppNavigator() {
  const { session, loading } = useAuth(); // Use session instead of user

  if (loading) {
    return <Text>Loading...</Text>; // Show a loading spinner while checking auth state
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={session ? 'Home' : 'Welcome'}>
        {/* Public Screens */}
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ headerShown: false }} // Hide header for WelcomeScreen
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: '' }} // Hide title for LoginScreen
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ title: '' }} // Hide title for RegisterScreen
        />

        {/* Protected Screens */}
        {session ? (
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: '', headerLeft: () => null }} // Hide back arrow on HomeScreen
            />
            <Stack.Screen
              name="Barbers"
              component={BarbersScreen}
              options={{ title: '' }} // Hide title for BarbersScreen
            />
            <Stack.Screen
              name="DateSelection"
              component={DateSelectionScreen}
              options={{ title: '' }} // Hide title for DateSelectionScreen
            />
            <Stack.Screen
              name="TimeSelection"
              component={TimeSelectionScreen}
              options={{ title: '' }} // Hide title for TimeSelectionScreen
            />
            <Stack.Screen
              name="Treatment"
              component={TreatmentSelectionScreen}
              options={{ title: '' }} // Hide title for TreatmentSelectionScreen
            />
            <Stack.Screen
              name="MojiTermini"
              component={MojiTermini}
              options={{ title: 'Moji Termini' }} // Add MojiTermini screen
            />
          </>
        ) : null}
      </Stack.Navigator>
    </NavigationContainer>
  );
}