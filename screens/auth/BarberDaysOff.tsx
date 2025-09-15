import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { 
  addMonths, 
  format, 
  getDaysInMonth, 
  getDay, 
  isBefore, 
  startOfDay,
  isSameDay as dateFnsIsSameDay
} from 'date-fns';
import { sr } from 'date-fns/locale/sr';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const BarberDaysOff = ({ navigation }: { navigation: any }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [existingDaysOff, setExistingDaysOff] = useState<Date[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [barberId, setBarberId] = useState<string | null>(null);
  const { session } = useAuth();

  useEffect(() => {
    fetchBarberId();
  }, []);

  useEffect(() => {
    if (barberId) {
      fetchExistingDaysOff();
    }
  }, [barberId]);

  const fetchBarberId = async () => {
    if (!session?.user?.id) return;
    
    try {
      const { data, error } = await supabase
        .rpc('get_current_barber_id');
      
      if (error) throw error;
      
      if (data) {
        setBarberId(data);
      }
    } catch (error) {
      console.error('Error fetching barber ID:', error);
      Alert.alert('Greška', 'Došlo je do greške pri učitavanju ID-a frizera');
    }
  };

  const fetchExistingDaysOff = async () => {
    if (!barberId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('get_barber_days_off', { barber_uid: barberId });
      
      if (error) throw error;
      
      if (data) {
        const dates = data.map((dateStr: string) => new Date(dateStr));
        setExistingDaysOff(dates);
        setSelectedDates(dates);
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Greška', 'Došlo je do greške pri učitavanju slobodnih dana');
    } finally {
      setLoading(false);
    }
  };

  const toggleDateSelection = (date: Date) => {
    setSelectedDates(prev => {
      const isSelected = prev.some(d => dateFnsIsSameDay(d, date));
      if (isSelected) {
        return prev.filter(d => !dateFnsIsSameDay(d, date));
      } else {
        return [...prev, date];
      }
    });
  };

  const saveDaysOff = async () => {
    if (!barberId) return;
    
    setSaving(true);
    try {
      const datesToSave = selectedDates.map(date => format(date, 'yyyy-MM-dd'));
      
      const { error } = await supabase
        .rpc('update_barber_days_off', { 
          barber_uid: barberId, 
          days_off: datesToSave 
        });
      
      if (error) throw error;
      
     // Alert.alert('Uspešno', 'Slobodni dani su sačuvani');
      setExistingDaysOff(selectedDates);
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Greška', 'Došlo je do greške pri čuvanju slobodnih dana');
    } finally {
      setSaving(false);
    }
  };

  const isDateDisabled = (date: Date): boolean => {
    // Disable past dates and Sundays (day 0)
    return isBefore(date, startOfDay(new Date())) || getDay(date) === 0;
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
          const isSelected = selectedDates.some(d => dateFnsIsSameDay(d, date));
          const isExisting = existingDaysOff.some(d => dateFnsIsSameDay(d, date));
          const isSunday = getDay(date) === 0;
          
          week.push(
            <TouchableOpacity
              key={`day-${day}`}
              style={[
                styles.dayButton,
                disabled && styles.dayDisabled,
                isSelected && styles.selectedDay,
                isExisting && styles.existingDay,
                isSunday && styles.sundayDay
              ]}
              onPress={() => !disabled && toggleDateSelection(date)}
              disabled={disabled}
            >
              <Text style={[
                styles.dayText,
                disabled && styles.dayTextDisabled,
                (isSelected || isExisting) && styles.selectedDayText,
                isSunday && styles.sundayDayText
              ]}>
                {day}
              </Text>
              {isExisting && <Icon name="check" size={16} color="#4CAF50" style={styles.dayCheckIcon} />}
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

  const renderSelectedDates = () => {
    if (selectedDates.length === 0) {
      return (
        <View style={styles.noDatesSelected}>
          <Icon name="calendar-remove" size={30} color="#FFC72C" />
          <Text style={styles.noDatesText}>Niste izabrali nijedan dan</Text>
        </View>
      );
    }

    return (
      <ScrollView 
        style={styles.selectedDatesContainer}
        contentContainerStyle={styles.selectedDatesContent}
      >
        {selectedDates
          .sort((a, b) => a.getTime() - b.getTime())
          .map((date, index) => (
            <View key={index} style={styles.selectedDateItem}>
              <Icon name="calendar" size={20} color="#FFC72C" />
              <Text style={styles.selectedDateText}>
                {format(date, 'dd.MM.yyyy')}
              </Text>
              <TouchableOpacity 
                onPress={() => toggleDateSelection(date)}
                style={styles.removeDateButton}
              >
                <Icon name="close" size={20} color="#FF5555" />
              </TouchableOpacity>
            </View>
          ))}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dodaj slobodne dane</Text>
      </View>

    <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} color="#FFC72C" />
          <Text style={styles.backButtonText}>Nazad</Text>
        </TouchableOpacity>

      <View style={styles.calendarContainer}>
        <View style={styles.monthHeader}>
          <TouchableOpacity 
            onPress={() => setCurrentMonth(addMonths(currentMonth, -1))}
            style={styles.monthNavButton}
          >
            <Icon name="chevron-left" size={28} color="#FFC72C" />
          </TouchableOpacity>
          
          <Text style={styles.monthText}>
            {format(currentMonth, 'MMMM yyyy', { locale: sr })}
          </Text>
          
          <TouchableOpacity 
            onPress={() => setCurrentMonth(addMonths(currentMonth, 1))}
            style={styles.monthNavButton}
          >
            <Icon name="chevron-right" size={28} color="#FFC72C" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.weekDaysRow}>
          {['Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub', 'Ned'].map((day, index) => (
            <Text 
              key={day} 
              style={[
                styles.weekDay,
                index === 6 && styles.sundayText
              ]}
            >
              {day}
            </Text>
          ))}
        </View>
        
        {loading ? (
          <ActivityIndicator size="large" color="#FFC72C" style={styles.loadingIndicator} />
        ) : (
          renderDays()
        )}
      </View>

      <View style={styles.selectedDatesSection}>
        <Text style={styles.sectionTitle}>Izabrani slobodni dani:</Text>
        {renderSelectedDates()}
      </View>

      <TouchableOpacity 
        style={[
          styles.saveButton,
          (saving || loading) && styles.saveButtonDisabled
        ]}
        onPress={saveDaysOff}
        disabled={saving || loading}
      >
        {saving ? (
          <ActivityIndicator color="#1F1F1F" />
        ) : (
          <View style={styles.saveButtonContent}>
            <Icon name="content-save" size={20} color="#1F1F1F" />
            <Text style={styles.saveButtonText}>Sačuvaj promene</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F1F1F',
    padding: 16,
    paddingTop: 50,
   // marginTop:30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    zIndex: 1,
  },
  backButtonText: {
    color: '#FFC72C',
    fontSize: 16,
    fontWeight:'bold',
  },
  rightSpacer: {
    width: 80,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFC72C',
    textAlign: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 0,
  },
  calendarContainer: {
    backgroundColor: 'rgba(40, 40, 40, 0.7)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthNavButton: {
    padding: 8,
  },
  monthText: {
    color: '#FFC72C',
    fontSize: 18,
    fontWeight: 'bold',
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  weekDay: {
    color: '#FFF',
    width: 40,
    textAlign: 'center',
    fontSize: 14,
  },
  sundayText: {
    color: '#FF5555',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dayButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedDay: {
    backgroundColor: 'rgba(255, 199, 44, 0.3)',
    borderWidth: 1,
    borderColor: '#FFC72C',
  },
  existingDay: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  sundayDay: {
    backgroundColor: 'rgba(255, 85, 85, 0.2)',
  },
  dayDisabled: {
    opacity: 0.3,
  },
  dayText: {
    color: '#FFF',
    fontSize: 16,
  },
  selectedDayText: {
    color: '#FFC72C',
    fontWeight: 'bold',
  },
  sundayDayText: {
    color: '#FF5555',
  },
  dayTextDisabled: {
    color: '#666',
  },
  dayEmpty: {
    width: 40,
    height: 40,
  },
  dayCheckIcon: {
    position: 'absolute',
    bottom: 2,
    right: 2,
  },
  loadingIndicator: {
    marginVertical: 20,
  },
  selectedDatesSection: {
    flex: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#FFC72C',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  noDatesSelected: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noDatesText: {
    color: '#FFC72C',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  selectedDatesContainer: {
    flex: 1,
  },
  selectedDatesContent: {
    paddingBottom: 16,
  },
  selectedDateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(40, 40, 40, 0.7)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  selectedDateText: {
    color: '#FFF',
    fontSize: 16,
    marginLeft: 10,
    flex: 1,
  },
  removeDateButton: {
    padding: 4,
    marginLeft: 8,
  },
  saveButton: {
    backgroundColor: '#FFC72C',
    padding: 16,
    borderRadius: 10,
    marginBottom: Platform.OS === 'ios' ? 30 : 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#1F1F1F',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default BarberDaysOff;