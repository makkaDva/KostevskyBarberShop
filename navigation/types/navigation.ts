import { NavigatorScreenParams } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Define all stack param lists first
export type BookingStackParamList = {
  Barbers: { 
    showToast?: boolean;
    toastMessage?: string;
  };
  AppointmentSelection: { 
    barber: { name: 'Uki' | 'Laki'; uid: string } 
  };
  TimeSelection: {
    barberId: string;
    barberName: string;
    selectedDate: Date;
    treatmentDuration: number;
    treatments: string[];
    totalPrice: number;
  };
};

export type BarberStackParamList = {
  BarberHome: undefined;
  BarberSchedule: undefined;
  AddDaysOff: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Book: NavigatorScreenParams<BookingStackParamList>;
  MojiTermini: undefined;
  Products: undefined;
  Loyalty: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  BarberRoot: NavigatorScreenParams<BarberStackParamList>;
  TimeSelection: {
    barberId: string;
    barberName: string;
    selectedDate: Date;
    treatmentDuration: number;
    treatments: string[];
    totalPrice: number;
  };
};

// Navigation prop types for specific screens
export type TimeSelectionScreenNavigationProp = StackNavigationProp<
  RootStackParamList | BookingStackParamList,
  'TimeSelection'
>;

export type ProfileScreenNavigationProp = StackNavigationProp<
  MainTabParamList,
  'Profile'
>;