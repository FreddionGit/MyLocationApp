import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import styles from '../styles/LocationListScreenStyles'; 

const LocationListScreen = ({ navigation }) => {
  const [locations, setLocations] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check login status on component mount by retrieving the user token from AsyncStorage
  useEffect(() => {
    AsyncStorage.getItem('userToken').then(token => {
      setIsLoggedIn(!!token); 
    });
  }, []);

  // Set header options, including the title and authentication icon, in the navigation bar
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

  // Function to handle login/logout when the auth icon is pressed
  const handleAuthPress = async () => {
    if (isLoggedIn) {
      await AsyncStorage.removeItem('userToken');
      setIsLoggedIn(false);
      navigation.replace('Login');
    } else {
      navigation.replace('Login');
    }
  };

  // Listen for real-time updates in the 'locations' collection for the current user
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      console.log("No user is logged in.");
      return;
    }
    // Create a query to fetch locations where the 'userId' field matches the current user's UID
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
      {/* Show a message if no locations have been added */}
      {locations.length === 0 && <Text style={styles.noLocations}>No locations added yet.</Text>}
      <FlatList
        data={locations} 
        keyExtractor={item => item.id} 
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.item} 
            // Navigate to the Map screen and pass the selected location as a parameter
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
