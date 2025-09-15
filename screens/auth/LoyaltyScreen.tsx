import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../AuthContext';

const LoyaltyScreen = () => {
  const { session } = useAuth();
  const [appointmentCount, setAppointmentCount] = useState(0);
  useEffect(() => {
    const fetchLoyaltyData = async () => {
      if (session?.user?.id) {
        const { data, error } = await supabase.rpc('get_appointment_count', {
          user_id: session.user.id
        });
        
        if (!error && data !== null) {
          setAppointmentCount(data);
        } else {
          console.error('Error fetching appointment count:', error);
          setAppointmentCount(0); // Default value if no record exists
        }
      }
    };
    
    fetchLoyaltyData();
  }, [session]);

  const renderCoins = () => {
    const coins = [];
    for (let i = 1; i <= 10; i++) {
      const isCompleted = i <= appointmentCount;
      const isCurrent = i === appointmentCount + 1;
      const isLast = i === 10;
      
      coins.push(
        <View key={i} style={styles.coinContainer}>
          {isLast && (
            <View style={styles.freeBadge}>
              <Text style={styles.freeBadgeText}>BESPLATNO</Text>
            </View>
          )}
          <View style={[styles.coin, isCompleted && styles.completedCoin, isCurrent && styles.currentCoin]}>
            {/* <Text style={styles.coinText}>{i}</Text> */}
            {isCompleted && (
              <View style={styles.waxSeal}>
                <Text style={styles.waxSealText}>BOLE</Text>
              </View>
            )}
          </View>
          {i === 5 && (
            <View style={styles.fiftyBadge}>
              <Text style={styles.rewardText}>50% OFF</Text>
            </View>
          )}
          
        </View>
      );
    }
    return coins;
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Kostewsky Jr.</Text>
          <MaterialCommunityIcons name="content-cut" size={32} color="#FFC72C" style={styles.barberIcon} />
        </View>
        <Text style={styles.progressText}>{appointmentCount}/10 popunjenih termina</Text>
        <View style={styles.coinsGrid}>{renderCoins()}</View>
        <View style={styles.cardFooter}>
          <MaterialCommunityIcons name="crown" size={20} color="#FFC72C" />
          <Text style={styles.footerText}>LOYALTY PROGRAM</Text>
          <MaterialCommunityIcons name="crown" size={20} color="#FFC72C" />
        </View>
      </View>
    </View>
  );
};

const { width } = Dimensions.get('window');
const coinSize = (width - 60) / 5 - 10;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // crna pozadina
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#1A1A1A', // tamno siva karta
    borderRadius: 20,
    padding: 25,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 2,
    borderColor: '#FFF', // bela ivica
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    color: '#FFF', // bela boja teksta
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 3,
  },
  barberIcon: {
    marginLeft: 10,
    transform: [{ rotate: '90deg' }],
    color: '#FFF', // ikonica bela
  },
  progressText: {
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
    fontWeight: '500',
  },
  coinsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  coinContainer: {
    width: '20%',
    alignItems: 'center',
    marginBottom: 25,
    position: 'relative',
  },
  coin: {
    width: coinSize,
    height: coinSize,
    borderRadius: coinSize / 2,
    backgroundColor: '#FFF', // bela osnovna boja
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#121212', // crna ivica
    position: 'relative',
    overflow: 'hidden',
  },
  coinText: {
    color: '#121212',
    fontSize: 16,
    fontWeight: 'bold',
    zIndex: 1,
  },
  waxSeal: {
    position: 'absolute',
    width: '70%',
    height: '70%',
    backgroundColor: '#FFF',
    borderRadius: coinSize / 2,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '-15deg' }],
  },
  waxSealText: {
    color: '#121212',
    fontSize: 10,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  completedCoin: {
    backgroundColor: '#121212', // crno kada je popunjeno
    borderColor: '#FFF',
  },
  currentCoin: {
    borderWidth: 3,
    borderColor: '#FFF',
  },
  freeBadge: {
    position: 'absolute',
    top: -15,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#FFF',
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 8,
    zIndex: 2,
    minWidth: 80,
  },
  freeBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    includeFontPadding: false,
    textAlign: 'center',
  },
  fiftyBadge: {
    position: 'absolute',
    top: -15,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#FFF',
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  rewardText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  currentIndicator: {
    position: 'absolute',
    bottom: -18,
    backgroundColor: '#FFF',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  currentIndicatorText: {
    color: '#121212',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#FFF',
    paddingTop: 15,
  },
  footerText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginHorizontal: 10,
    letterSpacing: 1,
  },
});


export default LoyaltyScreen;