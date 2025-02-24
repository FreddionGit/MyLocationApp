import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import styles from '../styles/LocationListScreenStyles'; // Import der Styles

const LocationListScreen = ({ navigation }) => {
  const [locations, setLocations] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Prüft den Login-Status
  useEffect(() => {
    AsyncStorage.getItem('userToken').then(token => {
      setIsLoggedIn(!!token);
    });
  }, []);

  // Setzt das Icon in der Header-Leiste
  useEffect(() => {
    navigation.setOptions({
      title: 'My Locations',
      headerRight: () => (
        <TouchableOpacity onPress={handleAuthPress} style={{ marginRight: 15 }}>
          <Icon name={isLoggedIn ? 'sign-out' : 'sign-in'} size={22} color="#007bff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, isLoggedIn]);

  // Login-/Logout-Funktion
  const handleAuthPress = async () => {
    if (isLoggedIn) {
      await AsyncStorage.removeItem('userToken');
      setIsLoggedIn(false);
      navigation.replace('Login');
    } else {
      navigation.replace('Login');
    }
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      console.log("Kein Nutzer eingeloggt.");
      return;
    }
    const q = query(collection(db, 'locations'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const locationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLocations(locationsData);
    });
    return unsubscribe;
  }, []);

  return (
    <View style={styles.container}>
      {locations.length === 0 && <Text style={styles.noLocations}>No locations added yet.</Text>}
      <FlatList
        data={locations}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.item} 
            onPress={() => navigation.navigate('Map', { location: item })}
          >
            <View style={styles.itemContent}>
              <View style={styles.textContainer}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.description}>{item.description}</Text>
                <Text style={styles.rating}>⭐ {item.rating}</Text>
              </View>
              <Icon name="chevron-right" size={20} color="#888" />
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default LocationListScreen;
