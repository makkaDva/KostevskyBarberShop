import React, { useState, useEffect } from 'react';
import { 
  View, 
  TouchableOpacity, 
  Image, 
  Text, 
  StyleSheet,
  Platform 
} from 'react-native';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabaseClient';

type NavbarProps = {
  navigation: any;
  showBackButton?: boolean;
};

const Navbar: React.FC<NavbarProps> = ({ navigation, showBackButton = true }) => {
  const { signOut, session } = useAuth();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isLoyaltyMember, setIsLoyaltyMember] = useState(false);

  useEffect(() => {
    const checkLoyaltyStatus = async () => {
      if (session?.user?.id) {
        const { data, error } = await supabase
          .from('loyalty_program')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
        
        if (!error && data) {
          setIsLoyaltyMember(true);
        }
      }
    };
    
    checkLoyaltyStatus();
  }, [session]);

  return (
    <View style={styles.navbar}>
      {/* Left side - Back button and Loyalty badge */}
      <View style={styles.leftContainer}>
        {showBackButton && (
          <View style={styles.leftContent}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
            {isLoyaltyMember && (
              <TouchableOpacity 
                style={styles.loyaltyBadge}
                onPress={() => navigation.navigate('Loyalty')}
              >
                <Text style={styles.loyaltyText}>Loyalty ✓</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Right side - Profile dropdown */}
      <View style={styles.rightContainer}>
        <TouchableOpacity 
          onPress={() => setDropdownVisible(!dropdownVisible)}
          activeOpacity={0.7}
        >
          <Image
            source={require('../assets/images/basicProfilePictureE.jpg')}
            style={styles.profileImage}
          />
        </TouchableOpacity>

        {/* Dropdown menu */}
        {dropdownVisible && (
          <View style={styles.dropdown}>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                navigation.navigate('MojiTermini');
                setDropdownVisible(false);
              }}
            >
              <Text style={styles.dropdownItemText}>Moj termin</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                signOut();
                navigation.navigate('Welcome');
              }}
            >
              <Text style={styles.dropdownItemText}>Odjavi me</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#1F1F1F',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    zIndex: 100,
  },
  leftContainer: {
    flex: 1,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  rightContainer: {
    position: 'relative',
  },
  backArrow: {
    fontSize: 28,
    color: '#FFC72C',
    fontWeight: 'bold',
  },
  loyaltyBadge: {
    backgroundColor: 'rgba(255, 199, 44, 0.2)',
    borderWidth: 1,
    borderColor: '#FFC72C',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  loyaltyText: {
    color: '#FFC72C',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFC72C',
  },
  dropdown: {
    position: 'absolute',
    right: 0,
    top: 50,
    backgroundColor: '#121212',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFC72C',
    width: 160,
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  dropdownItemText: {
    color: '#FFC72C',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default Navbar;