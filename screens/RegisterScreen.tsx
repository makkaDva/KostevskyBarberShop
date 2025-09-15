import React, { useEffect, useState } from 'react';
import {
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Dimensions,
  View,
} from 'react-native';
import { supabase } from '../supabaseClient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

export default function RegisterScreen({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword || !displayName || !phone) {
      Alert.alert('Greška', 'Molimo popunite sva polja.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Greška', 'Lozinke se ne poklapaju.');
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName, phone },
        },
      });

      if (error) {
        Alert.alert('Greška', error.message);
        return;
      }

      Alert.alert('Uspešno', 'Uspešno ste se registrovali!');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Greška', 'Došlo je do greške prilikom registracije.');
    }
  };

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <Image
          source={require('../assets/images/KostevskyLogo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Title */}
        <Text style={styles.title}>Registracija</Text>

        {/* Input Fields */}
        <TextInput
          style={styles.input}
          placeholder="Ime i prezime"
          placeholderTextColor="#666"
          value={displayName}
          onChangeText={setDisplayName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Telefon"
          placeholderTextColor="#666"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <TextInput
          style={styles.input}
          placeholder="Lozinka"
          placeholderTextColor="#666"
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Potvrdi lozinku"
          placeholderTextColor="#666"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          autoCapitalize="none"
          secureTextEntry
        />

        {/* Register Button */}
        <TouchableOpacity style={styles.primaryButton} onPress={handleRegister} activeOpacity={0.9}>
          <LinearGradient
            colors={['#FFFFFF', '#E0E0E0']}
            style={styles.gradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Icon name="account-plus" size={20} color="#000000" />
            <Text style={styles.primaryButtonText}>Registruj se</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Link to Login */}
        <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.8}>
          <Text style={styles.link}>Već imate nalog? Prijavite se</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  logo: {
    width: width * 0.6,
    height: 120,
    marginBottom: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 25,
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 1,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#FFFFFF',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: '#111111',
    color: '#FFF',
  },
  primaryButton: {
    width: '100%',
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 10,
    letterSpacing: 0.8,
  },
  link: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 5,
    textDecorationLine: 'underline',
  },
});
