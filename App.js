import { useEffect, useState } from 'react';
import * as Font from 'expo-font';
import { View, ActivityIndicator } from 'react-native';
import StackNavigator from './navigation/StackNavigator';

// Main App component
export default function App() {
  // State to track whether the custom fonts have been loaded
  const [fontLoaded, setFontLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        'FontAwesome': require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/FontAwesome.ttf'),
      });
      setFontLoaded(true);
    }
    loadFonts();
  }, []);

  // While fonts are loading, show a loading indicator
  if (!fontLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  // Once fonts are loaded, render the main navigation container
  return <StackNavigator />;
}
