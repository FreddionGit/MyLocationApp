import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const LocationItem = ({ location, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(location)}>
      <Text style={styles.name}>{location.name}</Text>
      <Text>{location.description}</Text>
      <Text>⭐ {location.rating}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#eee',
    marginVertical: 5,
    borderRadius: 5,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LocationItem;