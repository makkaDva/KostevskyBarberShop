import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../../AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const BarberHomeScreen = ({ navigation }: { navigation: any }) => {
  const { signOut } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Barber nalog</Text>
        <View style={styles.divider} />
      </View>
      
      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={styles.mainButton}
          onPress={() => navigation.navigate('BarberSchedule')}
        >
          <Icon name="calendar-clock" size={24} color="#FFC72C" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Moj raspored</Text>
          <Icon name="chevron-right" size={24} color="#FFC72C" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.mainButton}
          onPress={() => navigation.navigate('AddDaysOff')}
        >
          <Icon name="calendar-remove" size={24} color="#FFC72C" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Dodaj slobodne dane</Text>
          <Icon name="chevron-right" size={24} color="#FFC72C" />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={signOut}
      >
        <Icon name="logout" size={20} color="#FF5555" style={styles.logoutIcon} />
        <Text style={styles.logoutText}>Odjavi se</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // deep black background
    padding: 25,
    paddingTop: 50,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff', // white headline
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)', // subtle white line
    width: '80%',
    alignSelf: 'center',
  },
  buttonsContainer: {
    flex: 1,
    justifyContent: 'center',
    marginTop: -50,
  },
  mainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111', // matte dark gray
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)', // faint border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  buttonIcon: {
    marginRight: 15,
    color: '#fff',
  },
  buttonText: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: 'rgba(255, 85, 85, 0.4)', // subtle red accent
    marginBottom: 20,
  },
  logoutIcon: {
    marginRight: 10,
    color: '#FF5555',
  },
  logoutText: {
    color: '#FF5555',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});


export default BarberHomeScreen;