import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import * as Location from 'expo-location';
import MapViewComponent from '../components/MapViewComponent'; 

const MapScreen = ({ route }) => {
  // State to hold location coordinates, loading status, and any error messages
  const [locationCoords, setLocationCoords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    // Fetch coordinates based on the provided location name from route parameters
    const getCoordinates = async () => {
      if (route.params && route.params.location) {
        const { name, description } = route.params.location;
        try {
          // Convert the location name to geographic coordinates
          const geocodeResults = await Location.geocodeAsync(name);
          if (geocodeResults && geocodeResults.length > 0) {
            const { latitude, longitude } = geocodeResults[0];
            setLocationCoords({ latitude, longitude, name, description });
          } else {
            setErrorMsg('Location not found.');
          }
        } catch (error) {
          setErrorMsg('Error retrieving coordinates.');
        } finally {
          setLoading(false);
        }
      } else {
        // No location provided, so loading is complete and default values will be used
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

  // Render the map component using either fetched coordinates or default values
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
