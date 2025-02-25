import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LocationListScreen from '../screens/LocationListScreen';
import AddLocationScreen from '../screens/AddLocationScreen';
import MapScreen from '../screens/MapScreen';
import CountriesScreen from '../screens/CountrySearchScreen';
import Icon from 'react-native-vector-icons/FontAwesome';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          // Define the icon for each tab based on its route name
          tabBarIcon: ({ color, size }) => {
            let iconName;
            // Set the icon name based on the route name
            if (route.name === 'Locations') {
              iconName = 'list';
            } else if (route.name === 'Add Location') {
              iconName = 'plus';
            } else if (route.name === 'Map') {
              iconName = 'map-marker';
            } else if (route.name === 'Countries') {
              iconName = 'globe';
            }
            return <Icon name={iconName} size={size} color={color} />;
          },
         
          tabBarActiveTintColor: '#007bff',
          tabBarInactiveTintColor: 'gray',
          tabBarShowLabel: true,
          tabBarStyle: {
            backgroundColor: '#fff', 
            borderTopWidth: 1,       
            borderTopColor: '#ddd',  
            height: 65,              
            paddingBottom: 10,       
            paddingTop: 8,         
          },
        })}
      >
    
        <Tab.Screen name="Locations" component={LocationListScreen} />
        <Tab.Screen name="Add Location" component={AddLocationScreen} />
        <Tab.Screen name="Map" component={MapScreen} />
        <Tab.Screen name="Countries" component={CountriesScreen} />
      </Tab.Navigator>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,               
    backgroundColor: '#fff',
  },
});

export default TabNavigator;
