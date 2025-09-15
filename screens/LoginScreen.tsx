import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useAuth } from '../AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Greška', 'Molimo unesite email i lozinku.');
      return;
    }

    try {
      await signIn(email, password);
    } catch (error) {
      Alert.alert(
        'Greška',
        error instanceof Error ? error.message : 'Došlo je do greške prilikom prijave.'
      );
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
        <Text style={styles.title}>Prijava</Text>

        {/* Input Fields */}
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
          placeholder="Lozinka"
          placeholderTextColor="#666"
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
          secureTextEntry
        />

        {/* Login Button */}
        <TouchableOpacity style={styles.primaryButton} onPress={handleLogin} activeOpacity={0.9}>
          <LinearGradient
            colors={['#FFFFFF', '#E0E0E0']}
            style={styles.gradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Icon name="login" size={20} color="#000000" />
            <Text style={styles.primaryButtonText}>Prijavi se</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Link to Register */}
        <TouchableOpacity onPress={() => navigation.navigate('Register')} activeOpacity={0.8}>
          <Text style={styles.link}>Nemate nalog? Registrujte se</Text>
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
