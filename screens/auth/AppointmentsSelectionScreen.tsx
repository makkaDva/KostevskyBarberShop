import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Animated } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Calendar from './Calendar';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const AppointmentSelectionScreen = () => {
  type RouteParams = {
    barber: { name: 'Uki'; uid: string };
  };
  const navigation = useNavigation();
  const route = useRoute();
  
  const { barber } = route.params as RouteParams;
  const barber_id = barber.uid;
  const [selectedTreatments, setSelectedTreatments] = useState<Record<string, boolean>>({});
  const [showCalendar, setShowCalendar] = useState(false);

  const treatments = {
    Uki: [
      { name: 'Fade', duration: 40, price: 1200 },
      { name: 'Buzz Cut', duration: 30, price: 1100 },
      { name: 'Do glave', duration: 15, price: 400 },
      { name: 'Brijanje glave', duration: 30, price: 1100 },
      { name: 'Deca', duration: 30, price: 800 },
      { name: 'Klasično oblikovanje brade', duration: 0, price: 500 },
      { name: 'Skidanje brade', duration: 5, price: 200 },
      { name: 'Pranje kose', duration: 10, price: 300 },
      { name: 'Relaks pranje kose', duration: 20, price: 800 },
      { name: 'Depilacija nosa', duration: 15, price: 500 },
      { name: 'Klasično šišanje makazama', duration: 30, price: 1100 },
      { name: 'Design', duration: 10, price: 300 },
      { name: 'Klasično šišanje mašinicom', duration: 20, price: 1000 },
    ],
  };

  const barberDetails = {
    Uki: {
      name: 'Uroš Kocić',
      title: 'Master Barber',
      image: require('../../assets/images/UkiBW.jpg'),
      endTime: 18
    },
  };
  
  const currentBarber = barberDetails[barber.name];
  const currentTreatments = treatments[barber.name];

  const toggleTreatment = (name: string) => {
    setSelectedTreatments(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const handleNextPress = () => setShowCalendar(true);

  const handleBackPress = () => {
    if (showCalendar) setShowCalendar(false);
    else navigation.goBack();
  };

  const selectedCount = Object.values(selectedTreatments).filter(Boolean).length;

  return (
    <ScrollView style={styles.container}>
      <Image source={currentBarber.image} style={styles.barberImage} resizeMode="cover" />

      <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
        <View style={styles.backButtonCircle}>
          <MaterialCommunityIcons name="chevron-left" size={28} color="#FFF" />
        </View>
      </TouchableOpacity>

      {selectedCount > 0 && !showCalendar && (
        <TouchableOpacity style={styles.nextButton} onPress={handleNextPress}>
          <View style={styles.nextButtonCircle}>
            <MaterialCommunityIcons name="chevron-right" size={28} color="#121212" />
          </View>
        </TouchableOpacity>
      )}

      <View style={styles.treatmentsCard}>
        <View style={styles.titleContainer}>
          <View style={styles.barberTitleBadge}>
            <Text style={styles.barberTitleText}>{currentBarber.title}</Text>
          </View>
          <Text style={styles.barberName}>{currentBarber.name}</Text>
        </View>

        {showCalendar ? (
          <Calendar 
            barberId={barber.uid}
            barberName={barber.name}
            selectedTreatments={currentTreatments
              .filter(t => selectedTreatments[t.name])
              .map(t => ({ name: t.name, duration: t.duration, price: t.price }))} 
            navigation={undefined}         
          />
        ) : (
          <ScrollView>
            {currentTreatments.map((treatment, index) => {
              const isActive = selectedTreatments[treatment.name];
              return (
                <View key={index} style={styles.treatmentItem}>
                  <View style={styles.treatmentInfo}>
                    <Text style={styles.treatmentName}>{treatment.name}</Text>
                    <Text style={styles.treatmentDetails}>
                      {treatment.duration} min • {treatment.price} RSD
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.toggleButton, isActive && styles.toggleButtonActive]}
                    onPress={() => toggleTreatment(treatment.name)}
                    activeOpacity={0.8}
                  >
                    <Animated.View
                      style={[
                        styles.toggleCircle,
                        isActive ? styles.toggleCircleActive : null,
                      ]}
                    />
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  barberImage: { width: '100%', height: 420 },
  treatmentsCard: {
    flex: 1,
    backgroundColor: '#000',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  titleContainer: { marginBottom: 20 },
  barberTitleBadge: {
    backgroundColor: '#FFF',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginBottom: 5,
  },
  barberTitleText: { color: '#000', fontWeight: 'bold', fontSize: 12 },
  barberName: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  treatmentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
  },
  treatmentInfo: { flex: 1 },
  treatmentName: { color: '#FFF', fontSize: 16, fontWeight: '500', marginBottom: 5 },
  treatmentDetails: { color: '#FFF', fontSize: 14 },
  toggleButton: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#CCC',
    padding: 2,
    justifyContent: 'center',
  },
  toggleButtonActive: { backgroundColor: '#FFF' },
  toggleCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#888',
    alignSelf: 'flex-start',
  },
  toggleCircleActive: {
    backgroundColor: '#000',
    alignSelf: 'flex-end',
  },
  backButton: { position: 'absolute', top: 50, left: 20, zIndex: 10 },
  backButtonCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButton: { position: 'absolute', top: 50, right: 20, zIndex: 10 },
  nextButtonCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AppointmentSelectionScreen;
