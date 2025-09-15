import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { sr } from 'date-fns/locale';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../AuthContext';
//import Config from 'react-native-config';
import { StackNavigationProp } from '@react-navigation/stack';
import { BookingStackParamList } from '../../navigation/types/navigation';

interface TimeSelectionScreenProps {
  barberId: string;
  barberName: string;
  selectedDate: Date;
  treatmentDuration: number;
  treatments: string[];
  totalPrice: number;
  onSuccess?: () => void;
}

interface TimeSlot {
  start: string;
  end: string;
}

const TimeSelectionScreen: React.FC<TimeSelectionScreenProps> = ({
  barberId,
  barberName,
  selectedDate,
  treatmentDuration,
  treatments,
  totalPrice,
  onSuccess,
}) => {
  const navigation = useNavigation<StackNavigationProp<BookingStackParamList>>();
  const { session } = useAuth();

  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [processing, setProcessing] = useState(false);

  const fetchAvailableSlots = async () => {
    setLoading(true);
    setError(null);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const { data, error: rpcError } = await supabase.rpc('get_available_slots', {
        barber_uid: barberId,
        target_date: dateStr,
        treatment_duration: treatmentDuration,
      });

      if (rpcError) {
        console.error('RPC Error:', rpcError);
        throw rpcError;
      }

      if (data && data.length > 0) {
        const formattedSlots = data.map((slot: { start_time: string; end_time: string }) => ({
          start: slot.start_time,
          end: slot.end_time,
        }));
        setAvailableSlots(formattedSlots);
      } else {
        setAvailableSlots([]);
      }
    } catch (err) {
      console.error('Error in fetchAvailableSlots:', err);
      setError('Došlo je do greške pri učitavanju termina. Pokušajte ponovo.');
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableSlots();
  }, [barberId, selectedDate, treatmentDuration]);

  const handleTimeSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot.start);
    setModalVisible(true);
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

//   const sendConfirmationEmail = async (email: string) => {
//     try {
//       const emailData = {
//         sender: {
//           name: "Frizerski Salon Uky",
//           email: "noreply@ukybarbershop.org",
//         },
//         to: [{ email }],
//         subject: "Frizerski Salon Uky - Zakazan Termin",
//         htmlContent:
//           `<p>Uspešno si zakazao termin u Frizerskom Salonu Uky!</p>
//            <h3>Pregled termina:</h3>
//            <p><strong>Frizer:</strong> ${barberName}</p>
//            <p><strong>Vreme:</strong> ${formatTime(selectedSlot!)}</p>
//            <p><strong>Datum:</strong> ${formatSerbianDate(selectedDate)}</p>
//            <p><strong>Tretman:</strong> ${treatments.join(' + ')}</p>
//            <p><strong>Cena:</strong> ${totalPrice} RSD</p>
//            <p>U slučaju da ne možeš da dođeš na termin, <strong>OBAVEZNO otkaži putem aplikacije</strong> ili pozivom na broj <strong>+381 60 4030 084</strong>!</p>`,
//         textContent: `Uspešno si zakazao termin u Frizerskom Salonu Uky!
// Pregled termina:
// Frizer: ${barberName}
// Vreme: ${formatTime(selectedSlot!)}
// Datum: ${formatSerbianDate(selectedDate)}
// Tretman: ${treatments.join(' + ')}
// Cena: ${totalPrice} RSD
// U slučaju da ne možeš da dođeš na termin, OBAVEZNO otkaži putem aplikacije ili pozivom na broj +381 60 4030 084!`,
//       };

//       const response = await fetch('https://api.brevo.com/v3/smtp/email', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'api-key': String(Config.BREVO_API_KEY),
//         },
//         body: JSON.stringify(emailData),
//       });

//       const responseData = await response.json();
//       if (!response.ok) {
//         throw new Error(responseData.message || JSON.stringify(responseData));
//       }
//       return responseData;
//     } catch (err) {
//       console.error('Email sending error:', err instanceof Error ? err.message : String(err));
//       throw err;
//     }
//   };

  const handleConfirmAppointment = async () => {
    if (!selectedSlot || !session?.user?.id) return;

    setProcessing(true);
    try {
      const { data: userEmailData, error: emailError } = await supabase.rpc('get_client_email');

      if (emailError || !userEmailData) {
        throw new Error('Failed to get user email');
      }

      const { error } = await supabase.from('appointments').insert([
        {
          barber_id: barberId,
          user_id: session.user.id,
          date: format(selectedDate, 'yyyy-MM-dd'),
          time: selectedSlot,
          treatment: treatments.join(' + '),
          price: totalPrice,
          duration: treatmentDuration,
        },
      ]);

      if (error) throw error;

      // try {
      //   await sendConfirmationEmail(userEmailData);
      //   setModalVisible(false);
      //   navigation.navigate('Barbers', {
      //     showToast: true,
      //     toastMessage: 'Termin je uspešno zakazan! Potvrda je poslata na vaš email.',
      //   });
      // } catch (emailErr) {
      //   console.error('Email sending failed:', emailErr);
        setModalVisible(false);
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'Barbers',
              params: {
                showToast: true,
                toastMessage: 'Termin je zakazan, ali potvrda nije poslata na email.',
              },
            },
          ],
        });
    //   }
    // } catch (err) {
    //   console.error('Appointment creation error:', err);
    //   setError(
    //     err instanceof Error && err.message.includes('email')
    //       ? 'Došlo je do greške pri slanju email potvrde.'
    //       : 'Došlo je do greške pri zakazivanju termina.'
    //   );
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelAppointment = () => {
    setModalVisible(false);
    setSelectedSlot(null);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#FFC72C" />
        <Text style={styles.loadingText}>Učitavanje dostupnih termina...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchAvailableSlots}>
          <Text style={styles.retryButtonText}>Pokušaj ponovo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dostupni termini za {formatSerbianDate(selectedDate)}</Text>
      <Text style={styles.subtitle}>Trajanje termina: {treatmentDuration} minuta</Text>

      {availableSlots.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.slotsContainer}
        >
          {availableSlots.map((slot, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.timeSlot, selectedSlot === slot.start && styles.selectedTimeSlot]}
              onPress={() => handleTimeSelect(slot)}
            >
              <Text
                style={[styles.timeText, selectedSlot === slot.start && styles.selectedTimeText]}
              >
                {formatTime(slot.start)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.noSlotsContainer}>
          <Text style={styles.noSlotsText}>Nema dostupnih termina za ovaj period</Text>
          <Text style={styles.noSlotsHint}>Pokušajte sa drugim datumom ili tretmanom</Text>
        </View>
      )}

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCancelAppointment}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Potvrda termina</Text>
            <View style={styles.modalDetails}>
              <Text style={styles.modalDetailText}>
                <Text style={styles.modalDetailLabel}>Frizer: </Text>
                {barberName}
              </Text>
              <Text style={styles.modalDetailText}>
                <Text style={styles.modalDetailLabel}>Datum: </Text>
                {formatSerbianDate(selectedDate)}
              </Text>
              <Text style={styles.modalDetailText}>
                <Text style={styles.modalDetailLabel}>Vreme: </Text>
                {selectedSlot ? formatTime(selectedSlot) : ''}
              </Text>
              <Text style={styles.modalDetailText}>
                <Text style={styles.modalDetailLabel}>Tretman: </Text>
                {treatments.join(' + ')}
              </Text>
              <Text style={styles.modalDetailText}>
                <Text style={styles.modalDetailLabel}>Trajanje: </Text>
                {treatmentDuration} minuta
              </Text>
              <Text style={styles.modalDetailText}>
                <Text style={styles.modalDetailLabel}>Cena: </Text>
                {totalPrice} RSD
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleConfirmAppointment}
                disabled={processing}
              >
                {processing ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.modalButtonText}>Potvrdi</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancelAppointment}
                disabled={processing}
              >
                <Text style={styles.modalButtonText}>Odustani</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'rgba(20, 20, 20, 0.9)',
    borderRadius: 10,
  },
  title: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    color: '#AAA',
    fontSize: 14,
    marginBottom: 15,
  },
  slotsContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 5,
  },
  timeSlot: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    backgroundColor: '#FFF',
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedTimeSlot: {
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  timeText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  selectedTimeText: {
    color: '#FFF',
  },
  noSlotsContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  noSlotsText: {
    color: '#FFF',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 5,
  },
  noSlotsHint: {
    color: '#AAA',
    fontSize: 12,
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    color: '#AAA',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    gap: 10,
  },
  errorText: {
    color: '#FF4444',
    textAlign: 'center',
  },
  retryButton: {
    padding: 10,
    backgroundColor: '#FFF',
    borderRadius: 5,
    marginTop: 10,
  },
  retryButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#000',
    borderRadius: 10,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FFF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalDetails: {
    marginBottom: 20,
  },
  modalDetailText: {
    color: '#FFF',
    fontSize: 14,
    marginBottom: 8,
  },
  modalDetailLabel: {
    fontWeight: 'bold',
    color: '#FFF',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    borderRadius: 5,
    padding: 12,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#FFF',
  },
  cancelButton: {
    backgroundColor: '#FF4444',
    borderWidth: 1,
    borderColor: '#FFF',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
});

function formatSerbianDate(selectedDate: Date) {
  return format(selectedDate, "d. MMMM yyyy.", { locale: sr });
}

export default TimeSelectionScreen;
