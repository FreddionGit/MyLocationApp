import React, { useState } from 'react';
import {View, Text, TextInput, TouchableOpacity, Alert,ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../firebase/config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import styles from '../styles/LoginScreenStyles';

const LoginScreen = ({ navigation }) => {
  // State variables to hold email, password, and loading status
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Function to handle user login
  const handleLogin = async () => {
    setLoading(true); 
    try {
      // Attempt to sign in using Firebase Authentication with email and password
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await AsyncStorage.setItem('userToken', userCredential.user.uid);
      // Navigate to the main screen and replace the current screen in the navigation stack
      navigation.replace('Main');
    } catch (error) {
      Alert.alert('Error', error.message);
      setLoading(false); 
    }
  };

  return (
    // KeyboardAvoidingView prevents the keyboard from covering input fields
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="E-Mail"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Passwort"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* If loading is true, show ActivityIndicator; otherwise, show the login button */}
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Anmelden</Text>
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
