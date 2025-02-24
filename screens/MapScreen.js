import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import * as Location from 'expo-location';
import MapViewComponent from '../components/MapViewComponent'; // Pfad ggf. anpassen

const MapScreen = ({ route }) => {
  const [locationCoords, setLocationCoords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const getCoordinates = async () => {
      if (route.params && route.params.location) {
        const { name, description } = route.params.location;
        try {
          // Umwandlung des Ortsnamens in Koordinaten
          const geocodeResults = await Location.geocodeAsync(name);
          if (geocodeResults && geocodeResults.length > 0) {
            const { latitude, longitude } = geocodeResults[0];
            setLocationCoords({ latitude, longitude, name, description });
          } else {
            setErrorMsg('Ort nicht gefunden.');
          }
        } catch (error) {
          setErrorMsg('Fehler beim Abrufen der Koordinaten.');
        } finally {
          setLoading(false);
        }
      } else {
        // Falls kein Ort übergeben wurde, kann ein Standardwert verwendet werden
        setLoading(false);
      }
    };

    getCoordinates();
  }, [route.params]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>{errorMsg}</Text>
      </View>
    );
  }

  return (
    <MapViewComponent
      location={
        locationCoords || {
          latitude: 37.78825,
          longitude: -122.4324,
          name: 'Default Location',
          description: '',
        }
      }
    />
  );
};

export default MapScreen;
