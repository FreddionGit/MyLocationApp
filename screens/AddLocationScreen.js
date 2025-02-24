import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, Alert, Keyboard, KeyboardAvoidingView, Platform, TouchableWithoutFeedback 
} from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import styles from '../styles/AddLocationScreenStyles'; // Import der separaten Styles

const AddLocationScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState(3); // Default rating set to 3
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Prüft den Login-Status und setzt das Icon in der Header-Leiste
  useEffect(() => {
    AsyncStorage.getItem('userToken').then(token => {
      setIsLoggedIn(!!token);
    });
  }, []);

  useEffect(() => {
    navigation.setOptions({
      title: 'Add Location',
      headerRight: () => (
        <TouchableOpacity onPress={handleAuthPress} style={{ marginRight: 15 }}>
          <Icon name={isLoggedIn ? 'sign-out' : 'sign-in'} size={22} color="#007bff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, isLoggedIn]);

  // Funktion für Login/Logout
  const handleAuthPress = async () => {
    if (isLoggedIn) {
      await AsyncStorage.removeItem('userToken');
      setIsLoggedIn(false);
      navigation.replace('Login');
    } else {
      navigation.replace('Login');
    }
  };

  const handleAddLocation = async () => {
    if (!name || !description) {
      Alert.alert('Error', 'Please fill in all fields!');
      return;
    }

    try {
      const user = auth.currentUser;
      await addDoc(collection(db, 'locations'), {
        name,
        description,
        rating,
        userId: user.uid,
      });

      Alert.alert('Success', 'Location has been saved!');
      setName('');
      setDescription('');
      setRating(3); // Reset rating after saving
      Keyboard.dismiss(); // Tastatur schließen
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <Text style={styles.title}>Add a New Location</Text>
        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor="#888"
          value={name}
          onChangeText={setName}
          onSubmitEditing={Keyboard.dismiss}
          returnKeyType="done"
        />
        <TextInput
          style={styles.input}
          placeholder="Description"
          placeholderTextColor="#888"
          value={description}
          onChangeText={setDescription}
          multiline
          onSubmitEditing={Keyboard.dismiss}
          returnKeyType="done"
        />
        <Text style={styles.label}>Rating</Text>
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)}>
              <Icon
                name={star <= rating ? 'star' : 'star-o'}
                size={30}
                color="#FFD700"
                style={styles.star}
              />
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.button} onPress={handleAddLocation}>
          <Text style={styles.buttonText}>Save Location</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default AddLocationScreen;
