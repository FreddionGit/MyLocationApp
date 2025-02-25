import React, { useEffect, useState } from 'react';
import { 
  View, Text, TextInput, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import Icon from 'react-native-vector-icons/FontAwesome';
import styles from '../styles/CountrySearchScreenStyles'; 
const CountrySearchScreen = ({ navigation }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savedCountries, setSavedCountries] = useState([]);

  // Check the login status on component mount by retrieving the user token from AsyncStorage
  useEffect(() => {
    AsyncStorage.getItem('userToken').then(token => {
      setIsLoggedIn(!!token); 
    });
  }, []);

  useEffect(() => {
    navigation.setOptions({
      title: 'Countries',
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

  // Fetch the saved countries for the current user from Firestore
  const fetchSavedCountries = async () => {
    const user = auth.currentUser;
    if (!user) return; 
    const q = query(collection(db, 'userCountries'), where('userId', '==', user.uid));
    const snapshot = await getDocs(q);
    const saved = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setSavedCountries(saved);
  };

  // Load saved countries on component mount
  useEffect(() => {
    fetchSavedCountries();
  }, []);

  // Fetch country information from the API based on the search query
  const fetchCountries = async (queryText) => {
    if (!queryText.trim()) {
      setCountries([]);
      return;
    }
    setLoading(true);
    try {
      // Fetch all countries from the API
      const response = await fetch(`https://restcountries.com/v3.1/all`);
      const data = await response.json();
      const filtered = data.filter(country => 
        country.name.common.toLowerCase().includes(queryText.toLowerCase()) || 
        (country.capital && country.capital[0]?.toLowerCase().includes(queryText.toLowerCase()))
      );
      setCountries(filtered);
    } catch (error) {
      console.error('API error:', error);
    }
    setLoading(false);
  };

  // Update the search query state and trigger the API call to fetch countries
  const handleSearch = (queryText) => {
    setSearchQuery(queryText);
    fetchCountries(queryText);
  };

  // Add a selected country to the user's saved list in Firestore
  const addCountryToList = async (country) => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'Please log in to save countries.');
      return;
    }

    // Check if the country has already been saved to avoid duplicates
    if (savedCountries.some(saved => saved.name === country.name.common)) {
      Alert.alert('Info', 'This country has already been added.');
      return;
    }

    try {
      // Add the country data to the 'userCountries' collection in Firestore
      const docRef = await addDoc(collection(db, 'userCountries'), {
        userId: user.uid,
        name: country.name.common,
        capital: country.capital ? country.capital[0] : 'No capital',
        flag: country.flags.png,
      });

      // Update the local state to include the newly saved country
      setSavedCountries([
        ...savedCountries, 
        { 
          id: docRef.id, 
          name: country.name.common, 
          capital: country.capital ? country.capital[0] : 'No capital', 
          flag: country.flags.png 
        }
      ]);
      Alert.alert('Success', `${country.name.common} has been saved.`);
    } catch (error) {
      console.error('Error saving country:', error);
    }
  };

  // Remove a country from the saved list and delete it from Firestore
  const removeCountry = async (countryId) => {
    try {
      await deleteDoc(doc(db, 'userCountries', countryId));
      setSavedCountries(savedCountries.filter(country => country.id !== countryId));
      Alert.alert('Info', 'The country has been removed.');
    } catch (error) {
      console.error('Error deleting country:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search by country or capital city..."
        placeholderTextColor="#888"
        value={searchQuery}
        onChangeText={handleSearch}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={countries}
          keyExtractor={(item) => item.cca2}
          renderItem={({ item }) => (
            <View style={styles.countryItem}>
              <Image source={{ uri: item.flags.png }} style={styles.flag} />
              <View style={styles.countryInfo}>
                <Text style={styles.countryName}>{item.name.common}</Text>
                <Text style={styles.capital}>{item.capital ? item.capital[0] : 'No capital'}</Text>
              </View>
              <TouchableOpacity onPress={() => addCountryToList(item)}>
                <Icon name="plus-circle" size={25} color="#28a745" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {/* Title for the section displaying the user's saved countries */}
      <Text style={styles.sectionTitle}>My countries</Text>
      <FlatList
        data={savedCountries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.countryItem}>
            <Image source={{ uri: item.flag }} style={styles.flag} />
            <View style={styles.countryInfo}>
              <Text style={styles.countryName}>{item.name}</Text>
              <Text style={styles.capital}>{item.capital}</Text>
            </View>
            <TouchableOpacity onPress={() => removeCountry(item.id)}>
              <Icon name="trash" size={22} color="#dc3545" />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

export default CountrySearchScreen;
