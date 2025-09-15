import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { 
  addMonths, 
  format, 
  getDaysInMonth, 
  getDay, 
  isSameDay, 
  isBefore, 
  startOfDay,
  isSameDay as dateFnsIsSameDay
} from 'date-fns';
import { enUS } from 'date-fns/locale';
import TimeSelectionScreen from './TimeSelectionScreen';
import { supabase } from '../../supabaseClient';

interface CalendarProps {
  barberId: string;
  barberName: 'Uki' | 'Laki';
  selectedTreatments: Array<{ 
    name: string; 
    duration: number; 
    price: number 
  }>;
  navigation: any;
}

const Calendar: React.FC<CalendarProps> = ({ 
  barberId, 
  barberName,
  selectedTreatments,
  navigation
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [daysOff, setDaysOff] = useState<Date[]>([]);
  const today = new Date();
  const currentTime = new Date().toLocaleString('en-US', { timeZone: 'Europe/Belgrade' });
  const currentHour = new Date(currentTime).getHours();

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const totalDuration = selectedTreatments.reduce((sum, t) => sum + t.duration, 0);
  const totalPrice = selectedTreatments.reduce((sum, t) => sum + t.price, 0);
  const treatmentNames = selectedTreatments.map(t => t.name);

  useEffect(() => {
    const fetchDaysOff = async () => {
      const { data, error } = await supabase
        .rpc('get_barber_days_off', { barber_uid: barberId });
      
      if (!error && data) {
        const offDates = data.map((dateStr: string) => new Date(dateStr));
        setDaysOff(offDates);
      }
    };
    
    fetchDaysOff();
  }, [barberId]);

  const isDateDisabled = (date: Date): boolean => {
    if (getDay(date) === 0) return true;
    if (isBefore(date, startOfDay(today))) return true;

    const isDayOff = daysOff.some(offDate => 
      dateFnsIsSameDay(offDate, date)
    );
    if (isDayOff) return true;

    if (isSameDay(date, today)) {
      const endHour = barberName === 'Uki' ? 18 : 16;
      return currentHour >= endHour;
    }
    return false;
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
          const isToday = isSameDay(date, today);
          const isSelected = selectedDate && isSameDay(date, selectedDate);

          week.push(
            <TouchableOpacity
              key={`day-${day}`}
              style={[
                styles.dayButton,
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
                isSelected && styles.selectedDayText
              ]}>
                {day}
              </Text>
              {isSelected && <View style={styles.selectedDot} />}
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

  return (
    <View style={styles.container}>
      <View style={styles.monthHeader}>
        <TouchableOpacity onPress={() => setCurrentMonth(addMonths(currentMonth, -1))}>
          <Text style={styles.navArrow}>‹</Text>
        </TouchableOpacity>
        
        <Text style={styles.monthText}>
          {format(currentMonth, 'MMMM yyyy', { locale: enUS })}
        </Text>
        
        <TouchableOpacity onPress={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          <Text style={styles.navArrow}>›</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.weekDaysRow}>
        {weekDays.map((day, index) => (
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
      
      {renderDays()}

      {selectedDate && (
        <TimeSelectionScreen 
          barberId={barberId}
          barberName={barberName}
          selectedDate={selectedDate}
          treatmentDuration={totalDuration}
          treatments={treatmentNames}
          totalPrice={totalPrice}
          navigation={navigation}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  monthText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  navArrow: {
    color: '#FFF',
    fontSize: 24,
    paddingHorizontal: 20,
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  weekDay: {
    color: '#FFF',
    width: 40,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
  sundayText: {
    color: '#888',
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
  todayButton: {
    borderWidth: 1,
    borderColor: '#FFF',
  },
  selectedDay: {
    backgroundColor: 'transparent',
  },
  dayDisabled: {
    opacity: 0.4,
  },
  dayText: {
    color: '#FFF',
    fontSize: 16,
  },
  todayText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  dayTextDisabled: {
    color: '#666',
  },
  selectedDayText: {
    color: '#000',
    fontWeight: 'bold',
  },
  dayEmpty: {
    width: 40,
    height: 40,
  },
  todayIndicator: {
    display: 'none',
  },
  selectedDot: {
    position: 'absolute',
    bottom: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFF',
  },
});

export default Calendar;
