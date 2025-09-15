import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  Linking,
  ScrollView,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: { navigation: any }) {
  const handlePhonePress = () => {
    Linking.openURL('tel:+381604030083');
  };

  const handleInstagramPress = () => {
    Linking.openURL('https://www.instagram.com/kostewskyjrbarber026?igsh=MWp2aDlwMTNiaXdjbw==');
  };

  const handleMapPress = () => {
    Linking.openURL('https://maps.app.goo.gl/38mQQJKWrTSjDAGW6');
  };

  return (
    <View style={styles.rootContainer}>
      <StatusBar 
        translucent 
        backgroundColor="transparent" 
        barStyle="light-content" 
      />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Logo */}
        <View style={styles.header}>
          <Image
            source={require('../../assets/images/KostevskyLogo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Kostewsky Jr. Barber</Text>
          <Text style={styles.subtitle}>PREMIUM BARBERSHOP EXPERIENCE</Text>
        </View>
        
        {/* CTA Button */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => navigation.navigate('Book')}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#FFFFFF', '#E0E0E0']}
            style={styles.gradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.ctaButtonText}>ZAKAŽI TERMIN</Text>
            <Icon name="scissors-cutting" size={20} color="#000000" style={styles.buttonIcon} />
          </LinearGradient>
        </TouchableOpacity>
        
        {/* Salon image */}
        <View style={styles.imageContainer}>
          <Image
            source={require('../../assets/images/salon_slika.jpg')}
            style={styles.salonImage}
          />
          <View style={styles.imageOverlay} />
          <Text style={styles.imageText}>PREMIUM BARBERSHOP DOŽIVLJAJ</Text>
        </View>
        
        {/* O nama section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="information" size={24} color="#FFFFFF" />
            <Text style={styles.sectionTitle}>O NAMA</Text>
          </View>
          <Text style={styles.sectionText}>
            Frizerski Salon Kostewsky Jr. je osnovan 2023. godine sa ciljem da šišanje i celokupnu barbersku
            uslugu podigne na viši nivo. Naš fokus je na kvalitetu, modernom izgledu i vrhunskom iskustvu.
            Nalazimo se u Smederevu na adresi Ante Protića 7.
          </Text>
        </View>
        
        {/* Kontakt section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="phone" size={24} color="#FFFFFF" />
            <Text style={styles.sectionTitle}>KONTAKT</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.contactItem} 
            onPress={handlePhonePress}
            activeOpacity={0.7}
          >
            <View style={styles.contactIcon}>
              <Icon name="phone" size={20} color="#000000" />
            </View>
            <Text style={styles.contactText}>+381 60 4030083</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.contactItem} 
            onPress={handleInstagramPress}
            activeOpacity={0.7}
          >
            <View style={styles.contactIcon}>
              <Icon name="instagram" size={20} color="#000000" />
            </View>
            <Text style={styles.contactText}>@kostewskyjrbarber026</Text>
          </TouchableOpacity>
          
          <View style={[styles.sectionHeader, { marginTop: 25 }]}>
            <Icon name="clock-outline" size={24} color="#FFFFFF" />
            <Text style={styles.sectionTitle}>RADNO VREME</Text>
          </View>
          
          <View style={styles.hoursContainer}>
            {[
              { day: 'Ponedeljak', time: '11:00-19:00' },
              { day: 'Utorak', time: '11:00-19:00' },
              { day: 'Sreda', time: '11:00-19:00' },
              { day: 'Četvrtak', time: '11:00-19:00' },
              { day: 'Petak', time: '11:00-19:00' },
              { day: 'Subota', time: '11:00-15:00' },
              { day: 'Nedelja', time: 'Ne radimo', closed: true },
            ].map((item, index) => (
              <View key={index} style={styles.hoursRow}>
                <Text style={styles.hoursDay}>{item.day}</Text>
                <Text style={[styles.hoursTime, item.closed && styles.closedText]}>{item.time}</Text>
              </View>
            ))}
          </View>
        </View>
        
        {/* Lokacija section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="map-marker" size={24} color="#FFFFFF" />
            <Text style={styles.sectionTitle}>LOKACIJA</Text>
          </View>
          
          <TouchableOpacity 
            onPress={handleMapPress} 
            style={styles.mapContainer}
            activeOpacity={0.9}
          >
            <Image
              source={require('../../assets/images/lokacija.png')}
              style={styles.locationImage}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.mapGradient}
            >
              <View style={styles.mapButton}>
                <Text style={styles.mapButtonText}>OTVORI MAPU</Text>
                <Icon name="arrow-right" size={16} color="#000000" />
              </View>
            </LinearGradient>
            <View style={styles.mapAddress}>
              <Icon name="map-marker-radius" size={16} color="#FFFFFF" />
              <Text style={styles.mapAddressText}>Ante Protića 7, Smederevo</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Kostewsky Jr. Barber © 2024</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  logo: {
    width: width * 0.5,
    height: 120,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 5,
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#AAAAAA',
    letterSpacing: 2,
    textAlign: 'center',
  },
  ctaButton: {
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  ctaButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
    marginRight: 10,
  },
  buttonIcon: {
    marginLeft: 5,
  },
  imageContainer: {
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 16,
    overflow: 'hidden',
    height: 200,
    position: 'relative',
  },
  salonImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  imageText: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  section: {
    backgroundColor: '#111111',
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 10,
    letterSpacing: 1,
  },
  sectionText: {
    color: '#CCCCCC',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  contactIcon: {
    backgroundColor: '#FFFFFF',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  contactText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  hoursContainer: {
    marginTop: 10,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  hoursDay: {
    color: '#CCCCCC',
    fontSize: 15,
  },
  hoursTime: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  closedText: {
    color: '#FF5555',
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
  },
  locationImage: {
    width: '100%',
    height: '100%',
  },
  mapGradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 15,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  mapButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
    marginRight: 5,
  },
  mapAddress: {
    position: 'absolute',
    top: 15,
    left: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  mapAddressText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 5,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  footerText: {
    color: '#666666',
    fontSize: 12,
  },
});