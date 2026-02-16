import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  Image
} from 'react-native';
import auth, {firebase} from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { initializeApp } from "firebase/app";
// import { initializeApp } from 'firebase/app';

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const unsubscribe = auth().onAuthStateChanged(user => {
      if (user && user.emailVerified) {
        navigation.replace('Main');
      }
    });

    return unsubscribe;
  }, [navigation]);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
  
    setIsLoading(true);
    Keyboard.dismiss();

    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const user = userCredential.user;

      Alert.alert('Success', 'Login successful!');
      navigation.replace('Main');
      
    } catch (error) {
      console.log('Login error:', error);
      handleLoginError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginError = (error) => {
    let errorMessage = 'Login failed. Please try again.';
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email.';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Incorrect password.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address.';
        break;
      case 'auth/user-disabled':
        errorMessage = 'This account has been disabled.';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many failed attempts. Please try again later.';
        break;
      case 'auth/network-request-failed':
        errorMessage = 'Network error. Please check your connection.';
        break;
      default:
        errorMessage = error.message || 'Login failed.';
    }
    
    Alert.alert('Login Failed', errorMessage);
  };

  const handleForgotPassword = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address first');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    Alert.alert(
      'Reset Password',
      `Send password reset instructions to ${email}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: async () => {
            try {
              await auth().sendPasswordResetEmail(email);
              Alert.alert('Success', 'Password reset email sent! Check your inbox.');
            } catch (error) {
              Alert.alert('Error', 'Failed to send reset email.');
            }
          }
        }
      ]
    );
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // firebase.initializeApp(
  const firebaseConfig = {
  apiKey: "AIzaSyA7h8y8iBwhsUV36HBGbQr3-ujpVpBih50",
  authDomain: "skoollink-9f947.firebaseapp.com",
  databaseURL: "https://skoollink-9f947-default-rtdb.firebaseio.com",
  projectId: "skoollink-9f947",
  storageBucket: "skoollink-9f947.firebasestorage.app",
  messagingSenderId: "897815604173",
  appId: "1:897815604173:web:45cd560d05169b8618f284"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyA7h8y8iBwhsUV36HBGbQr3-ujpVpBih50",
//   authDomain: "skoollink-9f947.firebaseapp.com",
//   projectId: "skoollink-9f947",
//   storageBucket: "skoollink-9f947.firebasestorage.app",
//   messagingSenderId: "897815604173",
//   appId: "1:897815604173:web:45cd560d05169b8618f284",
//   measurementId: "G-YEZTZRW1YS"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// // const analytics = getAnalytics(app);

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.container}>
        <KeyboardAvoidingView 
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
                <Image source={require("./Icons/withoutbg.png")} style={{height:270,width:270}}></Image>  
              {/* <Icon name="school" size={80} color="#3498db" /> */}
              <Text style={styles.title}>School Manager</Text>
              <Text style={styles.subtitle}>Sign in to your account</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Image source={require("./Icons/mail.png")} style={{height:22,width:22}}></Image>
                <TextInput
                  style={styles.input}
                  placeholder="Email address"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Image source={require("./Icons/password.png")} style={{height:22,width:22}}></Image>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Image source={require("./Icons/eye.png")} style={{height:20,width:20}}></Image>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={styles.forgotPassword}
                onPress={handleForgotPassword}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]} 
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.loginButtonText}>Sign In</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.registerLink}
                onPress={() => navigation.navigate('Register')}
              >
                <Text style={styles.registerText}>
                  Don't have an account? <Text style={styles.registerLinkText}>Sign Up</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 5,
  },
  form: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 10,
    paddingHorizontal: 15,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
  },
  eyeIcon: {
    padding: 5,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  forgotPasswordText: {
    color: '#3498db',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    // marginBottom: 10,
  },
  loginButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerLink: {
    marginTop: 10,
    alignItems: 'center',
  },
  registerText: {
    color: '#7f8c8d',
  },
  registerLinkText: {
    color: '#3498db',
    fontWeight: 'bold',
  },
});

export default LoginScreen;