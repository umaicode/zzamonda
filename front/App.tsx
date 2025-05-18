import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import DriveScreen from './src/screens/DriveScreen';
import ResultScreen from './src/screens/ResultScreen';
import RecentScreen from './src/screens/RecentScreen';
import ViewScreen from './src/screens/ViewScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{headerShown: false}}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Drive" component={DriveScreen} />
        <Stack.Screen name="Result" component={ResultScreen} />
        <Stack.Screen name="Recent" component={RecentScreen} />
        <Stack.Screen name="View" component={ViewScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
