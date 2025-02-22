// MapScreen.js
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geocoder from 'react-native-geocoding';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';

// Ersetze 'YOUR_GOOGLE_MAPS_API_KEY' mit deinem tatsächlichen API-Schlüssel
Geocoder.init('YOUR_GOOGLE_MAPS_API_KEY');

const MapScreen = ({ route, navigation }) => {
  const [region, setRegion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Das übergebene Location-Objekt (z. B. Berlin) oder undefined
  const location = route.params?.location;

  // Prüfe den Login-Status
  useEffect(() => {
    AsyncStorage.getItem('userToken').then(token => {
      setIsLoggedIn(!!token);
    });
  }, []);

  // Konfiguriere den Header (Login-/Logout-Icon)
  useEffect(() => {
    navigation.setOptions({
      title: 'Map',
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

  // Ermittele die Region: Falls eine Location übergeben wurde, Geocoding ausführen;
  // ansonsten Standardregion anzeigen.
  useEffect(() => {
    if (location) {
      Geocoder.from(location.name)
        .then(response => {
          const { lat, lng } = response.results[0].geometry.location;
          setRegion({
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
        })
        .catch(error => {
          console.warn('Geocoding Error:', error);
          // Bei Fehler Standardregion verwenden
          setRegion({
            latitude: 37.78825,
            longitude: -122.4324,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
        })
        .finally(() => setLoading(false));
    } else {
      // Keine Location übergeben → Standardregion anzeigen
      setRegion({
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
      setLoading(false);
    }
  }, [location]);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <MapView style={styles.map} region={region}>
          {region && (
            <Marker
              coordinate={{ latitude: region.latitude, longitude: region.longitude }}
              title={location ? location.name : 'Default Location'}
              description={location ? location.description : 'No Description'}
            />
          )}
        </MapView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});

export default MapScreen;
