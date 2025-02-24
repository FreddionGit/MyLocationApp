import React, { useEffect, useState } from 'react';
import { 
  View, Text, TextInput, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import Icon from 'react-native-vector-icons/FontAwesome';
import styles from '../styles/CountrySearchScreenStyles'; // Import der Styles

const CountrySearchScreen = ({ navigation }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savedCountries, setSavedCountries] = useState([]); // Gespeicherte Länder des Benutzers

  // Prüft den Login-Status
  useEffect(() => {
    AsyncStorage.getItem('userToken').then(token => {
      setIsLoggedIn(!!token);
    });
  }, []);

  // Setzt das Icon in der Header-Leiste
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

  // Lädt die gespeicherten Länder aus Firestore
  const fetchSavedCountries = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, 'userCountries'), where('userId', '==', user.uid));
    const snapshot = await getDocs(q);
    const saved = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setSavedCountries(saved);
  };

  useEffect(() => {
    fetchSavedCountries();
  }, []);

  // API-Abfrage für Länderinformationen
  const fetchCountries = async (queryText) => {
    if (!queryText.trim()) {
      setCountries([]);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`https://restcountries.com/v3.1/all`);
      const data = await response.json();
      const filtered = data.filter(country => 
        country.name.common.toLowerCase().includes(queryText.toLowerCase()) || 
        (country.capital && country.capital[0]?.toLowerCase().includes(queryText.toLowerCase()))
      );
      setCountries(filtered);
    } catch (error) {
      console.error('API Fehler:', error);
    }
    setLoading(false);
  };

  // Suchfeld aktualisieren und API-Abfrage auslösen
  const handleSearch = (queryText) => {
    setSearchQuery(queryText);
    fetchCountries(queryText);
  };

  // Fügt ein Land zur eigenen Liste in Firestore hinzu
  const addCountryToList = async (country) => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Fehler', 'Bitte logge dich ein, um Länder zu speichern.');
      return;
    }

    // Überprüfen, ob das Land bereits gespeichert wurde
    if (savedCountries.some(saved => saved.name === country.name.common)) {
      Alert.alert('Info', 'Dieses Land wurde bereits hinzugefügt.');
      return;
    }

    try {
      const docRef = await addDoc(collection(db, 'userCountries'), {
        userId: user.uid,
        name: country.name.common,
        capital: country.capital ? country.capital[0] : 'Keine Hauptstadt',
        flag: country.flags.png,
      });

      setSavedCountries([...savedCountries, { id: docRef.id, name: country.name.common, capital: country.capital ? country.capital[0] : 'Keine Hauptstadt', flag: country.flags.png }]);
      Alert.alert('Erfolg', `${country.name.common} wurde gespeichert.`);
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
    }
  };

  // Entfernt ein Land aus der gespeicherten Liste & Firestore
  const removeCountry = async (countryId) => {
    try {
      await deleteDoc(doc(db, 'userCountries', countryId));
      setSavedCountries(savedCountries.filter(country => country.id !== countryId));
      Alert.alert('Info', 'Das Land wurde entfernt.');
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
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
                <Text style={styles.capital}>{item.capital ? item.capital[0] : 'Keine Hauptstadt'}</Text>
              </View>
              <TouchableOpacity onPress={() => addCountryToList(item)}>
                <Icon name="plus-circle" size={25} color="#28a745" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}

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
