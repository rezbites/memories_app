// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import GalleryScreen from './screens/GalleryScreen';
import PreviewScreen from './screens/PreviewScreen';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ title: 'Year in Review' }}
        />
        <Stack.Screen 
          name="Gallery" 
          component={GalleryScreen}
          options={{ title: 'Select Media' }}
        />
        <Stack.Screen 
          name="Preview" 
          component={PreviewScreen}
          options={{ title: 'Preview Video' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

