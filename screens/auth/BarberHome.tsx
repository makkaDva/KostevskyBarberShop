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
    backgroundColor: '#1F1F1F',
    padding: 25,
    paddingTop:50,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFC72C',
    textAlign: 'center',
    marginBottom: 10,
  },
  divider: {
    height: 2,
    backgroundColor: 'rgba(255, 199, 44, 0.3)',
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
    backgroundColor: 'rgba(40, 40, 40, 0.9)',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 199, 44, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonIcon: {
    marginRight: 15,
  },
  buttonText: {
    flex: 1,
    color: '#FFC72C',
    fontSize: 18,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    backgroundColor: 'rgba(40, 40, 40, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 85, 85, 0.3)',
    marginBottom: 20,
  },
  logoutIcon: {
    marginRight: 10,
  },
  logoutText: {
    color: '#FF5555',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BarberHomeScreen;