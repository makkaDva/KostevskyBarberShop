import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../AuthContext';

type RootStackParamList = {
  MojiTermini: undefined;
  Home: undefined;
  Login: undefined;
};

type MojiTerminiScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MojiTermini'>;

type Props = {
  navigation: MojiTerminiScreenNavigationProp;
};

type Appointment = {
  uid: string;
  barber_id: string;
  user_id: string;
  date: string;
  time: string;
  treatment: string;
  price: number;
  duration: number;
  created_at: string;
  barber_name?: string;
};

const serbianMonths = [
  'januar', 'februar', 'mart', 'april', 'maj', 'jun',
  'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'
];

const MojiTermini: React.FC<Props> = ({ navigation }) => {
  const { session, isOnline } = useAuth();
  const user = session?.user;
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Nepoznat datum';
      
      const day = date.getDate();
      const month = serbianMonths[date.getMonth()];
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    } catch (e) {
      return 'Nepoznat datum';
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return 'Nepoznato vreme';
    return timeString.substring(0, 5); // Get only HH:MM
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (mins === 0) {
      return `${hours}h`;
    }
    
    return `${hours > 0 ? `${hours}h ` : ''}${mins}m`;
  };

  const fetchAppointments = async () => {
    if (!user || !isOnline) {
      if (!isOnline) {
        Alert.alert('Offline', 'Nema internet veze. Povežite se da biste videli termine.');
      }
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .rpc('get_appointments_for_client');

      if (error) throw error;

      if (!data || data.length === 0) {
        setAppointments([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const barberIds = [...new Set(data.map((app: { barber_id: any; }) => app.barber_id))];
      const { data: barbersData, error: barbersError } = await supabase
        .from('barbers')
        .select('uid, name')
        .in('uid', barberIds);

      if (barbersError) throw barbersError;

      const barberMap = new Map<string, string>();
      barbersData?.forEach(barber => {
        barberMap.set(barber.uid, barber.name);
      });

      const combinedData = data.map((appointment: any) => ({
        uid: appointment.uid,
        barber_id: appointment.barber_id,
        user_id: appointment.user_id,
        date: appointment.date,
        time: appointment.time,
        treatment: appointment.treatment,
        price: appointment.price,
        duration: appointment.duration,
        created_at: appointment.created_at,
        barber_name: barberMap.get(appointment.barber_id) || 'Nepoznat frizer'
      }));

      setAppointments(combinedData);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      Alert.alert('Greška', 'Došlo je do greške pri učitavanju termina.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const deleteAppointment = async (uid: string) => {
  if (!isOnline) {
    Alert.alert('Offline', 'Nema internet veze. Povežite se da biste otkazali termin.');
    return;
  }

  try {
    // Directly call the function
    const { error } = await supabase.rpc('delete_appointment_by_id', {
      appointment_uid: uid
    });

    if (error) throw error;

    // Immediately update UI
    setAppointments(prev => prev.filter(app => app.uid !== uid));
    setModalVisible(false);
    
   // console.log('Successfully deleted appointment:', uid); // Debug log
    
  } catch (error) {
    console.error('Full deletion error:', {
      error,
      appointmentUid: uid,
      time: new Date().toISOString()
    });
    
    Alert.alert(
      'Greška', 
      'Došlo je do greške pri otkazivanju termina. Pokušajte ponovo.'
    );
  }
};

  const handleDeleteConfirmation = (uid: string) => {
    setSelectedAppointmentId(uid);
    setModalVisible(true);
  };

  const handleConfirmDelete = () => {
    if (selectedAppointmentId) {
      deleteAppointment(selectedAppointmentId);
    }
  };

  const handleCancelDelete = () => {
    setModalVisible(false);
    setSelectedAppointmentId(null);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchAppointments();
    });

    return unsubscribe;
  }, [navigation, user, isOnline]);

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFC72C" />
        <Text style={styles.loadingText}>Učitavanje termina...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={['#FFC72C']}
          tintColor="#FFC72C"
        />
      }
    >
      <Text style={styles.title}>Moji Termini</Text>

      {appointments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.noAppointmentsText}>Nemate zakazanih termina.</Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={fetchAppointments}
          >
            <Text style={styles.refreshButtonText}>Osveži</Text>
          </TouchableOpacity>
        </View>
      ) : (
        appointments.map((appointment) => (
          <View key={appointment.uid} style={styles.appointmentCard}>
            <Text style={styles.appointmentText}>
              <Text style={styles.appointmentLabel}>Frizer: </Text>
              <Text style={styles.appointmentValue}>{appointment.barber_name}</Text>
            </Text>
            <Text style={styles.appointmentText}>
              <Text style={styles.appointmentLabel}>Datum: </Text>
              <Text style={styles.appointmentValue}>{formatDate(appointment.date)}</Text>
            </Text>
            <Text style={styles.appointmentText}>
              <Text style={styles.appointmentLabel}>Vreme: </Text>
              <Text style={styles.appointmentValue}>{formatTime(appointment.time)}</Text>
            </Text>
            <Text style={styles.appointmentText}>
              <Text style={styles.appointmentLabel}>Tretman: </Text>
              <Text style={styles.appointmentValue}>{appointment.treatment}</Text>
            </Text>
            <Text style={styles.appointmentText}>
              <Text style={styles.appointmentLabel}>Trajanje: </Text>
              <Text style={styles.appointmentValue}>{formatDuration(appointment.duration)}</Text>
            </Text>
            <Text style={styles.appointmentText}>
              <Text style={styles.appointmentLabel}>Cena: </Text>
              <Text style={styles.appointmentValue}>{appointment.price} RSD</Text>
            </Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteConfirmation(appointment.uid)}
            >
              <Text style={styles.deleteButtonText}>Otkaži termin</Text>
            </TouchableOpacity>
          </View>
        ))
      )}

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Da li ste sigurni da želite da otkažete termin?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleConfirmDelete}
              >
                <Text style={styles.modalButtonText}>Potvrdi</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancelDelete}
              >
                <Text style={styles.modalButtonText}>Odustani</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 30,
    backgroundColor: '#121212',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  loadingText: {
    color: '#FFF',
    marginTop: 15,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 25,
    textAlign: 'center',
    letterSpacing: 1,
  },
  noAppointmentsText: {
    fontSize: 18,
    color: '#CCC',
    textAlign: 'center',
    marginBottom: 20,
  },
  refreshButton: {
    paddingVertical: 14,
    paddingHorizontal: 25,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  refreshButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  appointmentCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
    marginBottom: 18,
    borderLeftWidth: 6,
    borderLeftColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  appointmentText: {
    fontSize: 16,
    marginBottom: 6,
    color: '#FFF',
  },
  appointmentLabel: {
    color: '#CCC',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  appointmentValue: {
    color: '#FFF',
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginTop: 12,
    alignSelf: 'flex-end',
    borderWidth: 1,
    borderColor: '#FFF',
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 3,
    elevation: 5,
  },
  deleteButtonText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: 'bold',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#000',
    borderRadius: 15,
    padding: 25,
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 25,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 14,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 6,
  },
  cancelButton: {
    backgroundColor: '#FF4444',
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 6,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});


export default MojiTermini;