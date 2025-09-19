import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, 
  ScrollView, ActivityIndicator, Alert, Modal
} from 'react-native';
import { 
  addMonths, format, getDaysInMonth, getDay, 
  isSameDay, isBefore, startOfDay, isSameDay as dateFnsIsSameDay 
} from 'date-fns';
import { sr } from 'date-fns/locale/sr';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Appointment {
  id: string;
  date: string;
  time: string;
  end_time: string;
  user_id: string;
  treatment: string;
  price: number;
}

interface EnhancedAppointment extends Appointment {
  client_name: string;
  phone: string;
  isLoyaltyMember: boolean;
}

const BarberScheduleScreen = ({ navigation }: { navigation: any }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [appointments, setAppointments] = useState<EnhancedAppointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [daysOff, setDaysOff] = useState<Date[]>([]);
  const { session } = useAuth();

  // modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedDate) {
      fetchAppointments(selectedDate);
    }
  }, [selectedDate]);

  const fetchAppointments = async (date: Date) => {
    if (!session?.user?.id) {
      Alert.alert('Greška', 'Niste prijavljeni');
      return;
    }

    setLoading(true);
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .rpc('appointments_by_id_and_date', { selected_date: formattedDate });

      if (appointmentsError) throw appointmentsError;

      const enhancedAppointments = await Promise.all(
        (appointmentsData || []).map(async (appt: any) => {
          const { data: clientData } = await supabase
            .rpc('get_client_info', { user_id: appt.user_id });
          
          const { data: loyaltyData } = await supabase
            .rpc('check_loyalty_member', { user_id: appt.user_id });

          return {
            id: appt.uid,
            date: appt.date,
            time: appt.time.substring(0, 5),
            end_time: appt.end_time.substring(0, 5),
            user_id: appt.user_id,
            treatment: appt.treatment,
            price: appt.price,
            client_name: clientData?.display_name || clientData?.data?.display_name || 'N/A',
            phone: clientData?.phone || clientData?.data?.phone || 'N/A',
            isLoyaltyMember: loyaltyData || false
          };
        })
      );

      setAppointments(enhancedAppointments);
    } catch (error) {
      console.error('Greška:', error);
      Alert.alert('Greška', 'Neuspelo učitavanje termina');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDaysOff = async () => {
    if (!session?.user?.id) return;
    
    try {
      const { data, error } = await supabase
        .rpc('get_barber_days_off', { barber_uid: session.user.id });
      
      if (!error && data) {
        const offDates = data.map((dateStr: string) => new Date(dateStr));
        setDaysOff(offDates);
      }
    } catch (error) {
      console.error('Greška:', error);
    }
  };

  const deleteAppointment = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('uid', appointmentId);
      
      if (error) throw error;

      // update UI instantly
      setAppointments(prev => prev.filter(app => app.id !== appointmentId));
      setModalVisible(false);
      setSelectedAppointmentId(null);
    } catch (error) {
      console.error('Greška pri otkazivanju:', error);
      Alert.alert('Greška', 'Neuspelo otkazivanje termina');
    }
  };

  const handleDeleteConfirmation = (appointmentId: string) => {
    console.log("Opening modal for appointment:", appointmentId);
    setSelectedAppointmentId(appointmentId);
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

  const handleLoyaltyAction = async (userId: string, isLoyaltyMember: boolean) => {
    try {
      if (isLoyaltyMember) {
        await supabase
          .from('loyalty_program')
          .delete()
          .eq('user_id', userId);
      } else {
        await supabase
          .rpc('promote_user_to_loyalty', { user_id_to_promote: userId });
      }
      
      if (selectedDate) fetchAppointments(selectedDate);
    } catch (error) {
      console.error('Greška:', error);
      Alert.alert('Greška', 'Neuspela promena loyalty statusa');
    }
  };

  const isDateDisabled = (date: Date): boolean => {
    if (getDay(date) === 0) return true;
    if (isBefore(date, startOfDay(new Date()))) return true;
    return daysOff.some(offDate => dateFnsIsSameDay(offDate, date));
  };

  const renderDays = () => {
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const daysInMonth = getDaysInMonth(monthStart);
    const startDay = getDay(monthStart) === 0 ? 6 : getDay(monthStart) - 1;
    
    const days = [];
    let day = 1;

    for (let i = 0; i < 6; i++) {
      const week = [];
      
      for (let j = 0; j < 7; j++) {
        if ((i === 0 && j < startDay) || day > daysInMonth) {
          week.push(<View key={`empty-${i}-${j}`} style={styles.dayEmpty} />);
        } else {
          const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
          const disabled = isDateDisabled(date);
          const isToday = isSameDay(date, new Date());
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          
          week.push(
            <TouchableOpacity
              key={`day-${day}`}
              style={[
                styles.dayButton,
                disabled && styles.dayDisabled,
                isToday && styles.todayButton,
                isSelected && styles.selectedDay
              ]}
              onPress={() => !disabled && setSelectedDate(date)}
              disabled={disabled}
            >
              <Text style={[
                styles.dayText,
                disabled && styles.dayTextDisabled,
                isToday && styles.todayText,
                isSelected && styles.selectedText
              ]}>
                {day}
              </Text>
            </TouchableOpacity>
          );
          day++;
        }
      }
      
      days.push(
        <View key={`week-${i}`} style={styles.weekRow}>
          {week}
        </View>
      );
      
      if (day > daysInMonth) break;
    }
    
    return days;
  };

  const renderAppointments = () => {
    if (!selectedDate) {
      return (
        <View style={styles.noSelectionContainer}>
          <Icon name="calendar-search" size={40} color="#FFC72C" />
          <Text style={styles.noSelectionText}>Izaberite datum za pregled termina</Text>
        </View>
      );
    }

    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFC72C" />
        </View>
      );
    }

    if (appointments.length === 0) {
      return (
        <View style={styles.noAppointmentsContainer}>
          <Icon name="calendar-remove" size={40} color="#FFC72C" />
          <Text style={styles.noAppointmentsText}>Nema termina za {format(selectedDate, 'dd.MM.yyyy')}</Text>
        </View>
      );
    }

    return (
      <View style={styles.appointmentsContainer}>
        {appointments.map((appt) => (
          <View key={appt.id} style={styles.appointmentCard}>
            <View style={styles.appointmentHeader}>
              <Text style={styles.appointmentTime}>
                {appt.time} - {appt.end_time}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ime i Prezime:</Text>
              <Text style={styles.infoValue}>{appt.client_name}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Broj telefona:</Text>
              <Text style={styles.infoValue}>{appt.phone}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Frizura:</Text>
              <Text style={styles.infoValue}>{appt.treatment}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Cena:</Text>
              <Text style={styles.infoValue}>{appt.price} RSD</Text>
            </View>

            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={[
                  styles.loyaltyButton,
                  appt.isLoyaltyMember ? styles.loyaltyButtonRemove : styles.loyaltyButtonAdd
                ]}
                onPress={() => handleLoyaltyAction(appt.user_id, appt.isLoyaltyMember)}
              >
                <Text style={styles.buttonText}>
                  {appt.isLoyaltyMember ? '-Loyalty' : '+Loyalty'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => handleDeleteConfirmation(appt.id)}
              >
                <Text style={styles.buttonText}>Otkaži termin</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Moj Raspored</Text>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
          >
            <Icon name="arrow-left" size={24} color="#FFC72C" />
            <Text style={styles.backButtonText}>Nazad</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.calendarContainer}>
          <View style={styles.monthHeader}>
            <TouchableOpacity onPress={() => setCurrentMonth(addMonths(currentMonth, -1))}>
              <Icon name="chevron-left" size={28} color="#FFC72C" />
            </TouchableOpacity>
            
            <Text style={styles.monthText}>
              {format(currentMonth, 'MMMM yyyy')}
            </Text>
            
            <TouchableOpacity onPress={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <Icon name="chevron-right" size={28} color="#FFC72C" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.weekDaysRow}>
            {['Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub', 'Ned'].map((day) => (
              <Text 
                key={day} 
                style={[
                  styles.weekDay,
                  day === 'Ned' && styles.sundayText
                ]}
              >
                {day}
              </Text>
            ))}
          </View>
          
          {renderDays()}
        </View>

        <View style={styles.appointmentsSection}>
          <Text style={styles.sectionTitle}>
            Termini za datum: {selectedDate ? format(selectedDate, 'dd.MM.yyyy') : 'izabrani datum'}
          </Text>
          {renderAppointments()}
        </View>
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCancelDelete}
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
                style={[styles.modalButton, styles.cancelDeleteButton]}
                onPress={handleCancelDelete}
              >
                <Text style={styles.modalButtonText}>Odustani</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // pure black base
    padding: 15,
  },
  headerContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginTop: 10,
    letterSpacing: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 10,
    padding: 8,
    marginLeft: 15,
  },
  backButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 16,
    fontWeight: '600',
  },
  calendarContainer: {
    backgroundColor: '#111', // matte grayish black
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  monthText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  weekDay: {
    color: '#fff',
    width: 40,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
  sundayText: {
    color: '#555',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dayButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  selectedDay: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  todayButton: {
    borderWidth: 1,
    borderColor: '#fff',
  },
  dayDisabled: {
    opacity: 0.25,
  },
  dayText: {
    color: '#fff',
    fontSize: 16,
  },
  selectedText: {
    fontWeight: '700',
    color: '#fff',
  },
  todayText: {
    color: '#fff',
  },
  dayTextDisabled: {
    color: '#555',
  },
  dayEmpty: {
    width: 40,
    height: 40,
  },
  appointmentsSection: {
    flex: 1,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
    textAlign: 'center',
  },
  noSelectionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noSelectionText: {
    color: '#888',
    fontSize: 16,
    marginTop: 15,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noAppointmentsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noAppointmentsText: {
    color: '#888',
    fontSize: 16,
    marginTop: 15,
    textAlign: 'center',
  },
  appointmentsContainer: {
    flex: 1,
  },
  appointmentCard: {
    backgroundColor: '#111',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  appointmentTime: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
  },
  infoValue: {
    color: '#fff',
    fontSize: 14,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  loyaltyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  loyaltyButtonAdd: {
    backgroundColor: '#222', // subtle black box
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  loyaltyButtonRemove: {
    backgroundColor: '#222',
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#222',
    borderWidth: 1,
    borderColor: '#F44336',
    minWidth: 100,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 25,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#222',
    borderWidth: 1,
    borderColor: '#F44336',
  },
  cancelDeleteButton: {
    backgroundColor: '#222',
    borderWidth: 1,
    borderColor: '#FFF',
  },
  modalButtonText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: 'bold',
  },
});


export default BarberScheduleScreen;
