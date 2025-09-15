import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ImageBackground,
} from 'react-native';
import { supabase } from '../../supabaseClient';

// Import images
const barberImages = {
  Uki: require('../../assets/images/Uki.jpg'),
  Laki: require('../../assets/images/Laki.jpg'),
};

const barberDescriptions = {
  Uki: "Uroš, frizer sa 10 godina radnog iskustva, završenom srednjom frizerskom školom i mnogobrojnim edukacijama.",
  Laki: "Lazar, frizer koji je edukaciju završio u Frizerskom Salonu Uky sa Ukijem kao ličnim mentorom."
};

export default function BarbersScreen({ navigation }: { navigation: any }) {
  const [barbers, setBarbers] = useState<any[]>([]);

  useEffect(() => {
    fetchBarbers();
  }, []);

  const fetchBarbers = async () => {
    const { data, error } = await supabase.from('barbers').select('*');
    if (error) {
      console.error('Error fetching barbers:', error);
    } else {
      const filteredBarbers = data
        .filter(barber => ['Uki', 'Laki'].includes(barber.name))
        .sort((a, b) => a.name === 'Uki' ? -1 : 1);
      setBarbers(filteredBarbers);
    }
  };

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5);
  };

  const handleBarberPress = (barber: any) => {
    navigation.navigate('AppointmentSelection', { 
      barber: {
        name: barber.name,
        uid: barber.uid 
      }
    });
  };

  return (
    <View style={styles.container}>
      <ImageBackground 
        source={require('../../assets/images/barberSelectionBackground.jpg')}
        style={styles.background}
        resizeMode="contain"
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>ODABERI FRIZERA</Text>
          
          <View style={styles.barbersContainer}>
            {barbers.map((barber) => (
              <View key={barber.uid} style={styles.cardWrapper}>
                <View style={styles.whiteLine} />
                <TouchableOpacity
                  style={styles.barberCard}
                  onPress={() => handleBarberPress(barber)}
                >
                  <Image
                    source={barberImages[barber.name as keyof typeof barberImages]}
                    style={styles.barberImage}
                  />
                  <View style={styles.barberDetails}>
                    <Text style={styles.barberName}>{barber.name}</Text>
                    <Text style={styles.barberLevel}>
                      {barber.name === 'Uki' ? 'MASTER' : 'SENIOR'}
                    </Text>
                    <Text style={styles.barberHours}>
                      {formatTime(barber.start_time)} - {formatTime(barber.end_time)}
                    </Text>
                    <Text style={styles.barberDescription} numberOfLines={3}>
                      {barberDescriptions[barber.name as keyof typeof barberDescriptions]}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  background: {
    flex: 1,
    width: '105%',
    height: '105%',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 35,
    textAlign: 'center',
    fontFamily: 'HelveticaNeue-Bold',
    textShadowColor: 'rgba(255, 255, 255, 0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    letterSpacing: 2,
  },
  barbersContainer: {
    marginTop: 10,
    width: '100%',
    maxWidth: 520,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardWrapper: {
    width: '100%',
    marginBottom: 30,
    position: 'relative',
  },
  whiteLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    zIndex: 3,
  },
  barberCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(20, 20, 20, 0.9)',
    borderRadius: 14,
    padding: 20,
    alignItems: 'flex-start',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    height: 190,
    width: '100%',
    zIndex: 2,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  barberImage: {
    width: 90,
    height: 150,
    borderRadius: 10,
    marginRight: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    marginLeft: 6, 
  },
  barberDetails: {
    flex: 1,
    height: '100%',
    justifyContent: 'space-between',
  },
  barberName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    fontFamily: 'HelveticaNeue-Bold',
    letterSpacing: 1.5,
  },
  barberLevel: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#FFFFFF',
    marginBottom: 10,
    fontWeight: '600',
    fontFamily: 'HelveticaNeue-Medium',
  },
  barberHours: {
    fontSize: 15,
    color: '#FFFFFF',
    marginBottom: 12,
    fontFamily: 'HelveticaNeue',
    fontWeight: '600',
  },
  barberDescription: {
    fontSize: 12,
    color: '#DDD',
    lineHeight: 17,
    fontFamily: 'HelveticaNeue-Light',
    marginTop: 0,
  },
});
