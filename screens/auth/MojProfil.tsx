import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Modal, TextInput, Alert } from 'react-native';
import { useNavigation, NavigationProp, CommonActions } from '@react-navigation/native';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../AuthContext';
import { RootStackParamList } from '../../navigation/types/navigation';

const MojProfil = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { signOut } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [processing, setProcessing] = useState(false);

  const serbianMonths = [
    'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun',
    'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserData(user);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        })
      );
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleDeactivate = async () => {
    if (!password) {
      Alert.alert('Greška', 'Unesite lozinku da biste deaktivirali nalog.');
      return;
    }
    try {
      setProcessing(true);
      const { error } = await supabase.rpc('delete_user_account', {
        user_id_to_delete: userData.id,
        user_password: password,
      });

      if (error) {
        console.error('Greška pri deaktivaciji:', error);
        Alert.alert('Greška', error.message || 'Nije moguće deaktivirati nalog.');
        return;
      }

      // Automatski logout
      await signOut();
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        })
      );
    } catch (err) {
      console.error('Deactivate error:', err);
      Alert.alert('Greška', 'Došlo je do greške prilikom deaktivacije.');
    } finally {
      setProcessing(false);
      setModalVisible(false);
      setPassword('');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = serbianMonths[date.getMonth()];
    const year = date.getFullYear();
    return `${month} ${year}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Učitavanje...</Text>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Nije moguće učitati podatke korisnika</Text>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.profileContainer}>
          {/* Profile Picture */}
          <View style={styles.profilePictureContainer}>
            <Image
              source={require('../../assets/images/basicProfilePicture.jpg')}
              style={styles.profilePicture}
            />
          </View>

          {/* User Info */}
          <View style={styles.infoSection}>
            <Text style={styles.label}>Ime i prezime:</Text>
            <Text style={styles.value}>{userData.user_metadata?.display_name || 'Nije postavljeno'}</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{userData.email}</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.label}>Telefon:</Text>
            <Text style={styles.value}>{userData.user_metadata?.phone || 'Nije postavljeno'}</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.label}>Član od:</Text>
            <Text style={styles.value}>{formatDate(userData.created_at)}</Text>
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Odjavi se</Text>
          </TouchableOpacity>

          {/* Deactivate Account Button */}
          <TouchableOpacity
            style={styles.deactivateButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.deactivateButtonText}>Deaktiviraj nalog</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalAlert}>Upozorenje!</Text>
            <Text style={styles.modalWarning}>
              Deaktivacija naloga je trajna. Nakon brisanja, moraćete da kreirate novi nalog da biste ponovo koristili aplikaciju.{"\n\n"}
              Sve vaše buduće i prošle rezervacije će biti obrisane, kao i svi bodovi u loyalty programu ako ih imate.
            </Text>
            <Text style={styles.modalInfo}>Unesite svoju šifru da potvrdite identitet:</Text>

            <TextInput
              style={styles.input}
              placeholder="Šifra"
              placeholderTextColor="#888"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleDeactivate}
              disabled={processing}
            >
              <Text style={styles.confirmButtonText}>
                {processing ? 'Brisanje...' : 'Potvrdi deaktivaciju'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
              disabled={processing}
            >
              <Text style={styles.cancelButtonText}>Odustani</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  loadingText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  errorText: {
    color: '#FF4444',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  profileContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 15,
    padding: 25,
    marginVertical: 20,
  },
  profilePictureContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  profilePicture: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 3,
    borderColor: '#FFF',
  },
  infoSection: {
    marginBottom: 20,
  },
  label: {
    color: '#CCC',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 5,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  value: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  logoutButton: {
    backgroundColor: '#000',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 30,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  logoutButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  deactivateButton: {
    backgroundColor: '#FF4444',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  deactivateButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#1A1A1A',
    padding: 25,
    borderRadius: 15,
    width: '85%',
  },
  modalAlert: {
    color: '#FF4444',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 15,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  modalWarning: {
    color: '#FFF',
    fontSize: 15,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalInfo: {
    color: '#CCC',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#000',
    borderColor: '#FFF',
    borderWidth: 1,
    borderRadius: 10,
    color: '#FFF',
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  confirmButton: {
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  confirmButtonText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 16,
    textTransform: 'uppercase',
  },
  cancelButton: {
    paddingVertical: 14,
    backgroundColor: '#FF4444',
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 16,
    textTransform: 'uppercase',
  },
});

export default MojProfil;
