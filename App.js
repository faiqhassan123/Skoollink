import React, { useEffect, useState }  from 'react';
import { StatusBar, View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/Screens/loginscreen';
import RegisterScreen from './src/Screens/registerscreen';
import fee from './src/Screens/fee';
import StudentListScreen from './src/Screens/studentlistscreen';
import TeacherListScreen from './src/Screens/teacherlistscreen';
import AddStudentScreen from './src/Screens/addstudentscreen';
import AddTeacherScreen from './src/Screens/addteacherscreen';
import timetable from './src/Screens/timetable';
import auth from '@react-native-firebase/auth';
import MainScreen from './src/Screens/mainscreen';
import salary from './src/Screens/salary';
import StackRegister from './src/Screens/stackregister';


const Stack = createStackNavigator();

const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
    <ActivityIndicator size="large" color="#3498db" />
    <Text style={{ marginTop: 10, color: '#7f8c8d' }}>Loading School Manager...</Text>
  </View>
);

export default function App() {
   const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {

  try {
      const subscriber = auth().onAuthStateChanged((user) => {
        console.log('Auth state changed:', user ? 'User logged in' : 'No user');
        setUser(user);
        if (initializing) setInitializing(false);
      });

      return subscriber; // unsubscribe on unmount
    } catch (error) {
      console.log('Firebase initialization error:', error);
      setInitializing(false);
    }
  }, [initializing]);

  if (initializing) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen}/>
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name='Main' component={MainScreen}/>
        <Stack.Screen name="timetable" component={timetable} />
        <Stack.Screen name="StackRegister" component={StackRegister} />
        <Stack.Screen name='StudentList' component={StudentListScreen}/> 
        <Stack.Screen name="AddStudent" component={AddStudentScreen} />
        <Stack.Screen name="Fee" component={fee} />
        <Stack.Screen name='TeacherList' component={TeacherListScreen}/> 
        <Stack.Screen name="AddTeacher" component={AddTeacherScreen} />
        <Stack.Screen name="Salary" component={salary} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}