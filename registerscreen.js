import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
  Keyboard,
  TouchableWithoutFeedback,
  Image
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage'; // ADD THIS IMPORT

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;
const isTablet = width > 768;

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    fullname: '',
    schoolname: '',
    email: '',
    phonenumber: '',
    password: '',
    confirmpassword: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleRegister = async () => {
    const { fullname, schoolname, email, phonenumber, password, confirmpassword } = formData;

    // Validation
    if (!fullname || fullname.trim() === '') {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }

    if (!schoolname || schoolname.trim() === '') {
      Alert.alert('Error', 'Please enter your school name');
      return;
    }

    if (!email || email.trim() === '') {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (!password) {
      Alert.alert('Error', 'Please enter a password');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmpassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    Keyboard.dismiss();

    try {
      console.log("🚀 Starting registration process...");
      console.log("Email:", email);
      
      // Step 1: Create Firebase Auth user
      console.log("📝 STEP 1: Creating user in Firebase Authentication...");
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      console.log("✅ Firebase Auth user created successfully!");
      console.log("User ID:", user.uid);
      console.log("User Email:", user.email);
      
      // Step 2: Prepare user data
      console.log("📝 STEP 2: Preparing user data for Firestore...");
      const userProfile = {
        uid: user.uid,
        fullname: fullname.trim(),
        schoolname: schoolname.trim(),
        email: email.trim(),
        phonenumber: phonenumber?.trim() || '',
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
        isEmailVerified: false,
        role: 'teacher'
      };
      
      console.log("User profile data:", userProfile);
      
      // Step 3: Save to Firestore
      console.log("📝 STEP 3: Saving user data to Firestore...");
      await firestore().collection('users').doc(user.uid).set(userProfile);
      console.log("✅ User data saved to Firestore successfully!");
      
      // Step 4: Save to AsyncStorage for immediate dashboard access
      console.log("📝 STEP 4: Saving user data to AsyncStorage...");
      await AsyncStorage.setItem('userToken', user.uid);
      await AsyncStorage.setItem('adminName', fullname.trim());
      await AsyncStorage.setItem('schoolName', schoolname.trim());
      await AsyncStorage.setItem('userEmail', email.trim());
      await AsyncStorage.setItem('role', 'Admin');
      console.log("✅ User data saved to AsyncStorage!");
      
      // Step 5: Send email verification
      console.log("📝 STEP 5: Sending verification email...");
      try {
        await user.sendEmailVerification();
        console.log("✅ Verification email sent!");
      } catch (verificationError) {
        console.log("⚠️ Could not send verification email:", verificationError.message);
        // Don't fail registration if verification email fails
      }
      
      // SUCCESS - Clear form and navigate
      console.log("🎉 REGISTRATION COMPLETE! All steps successful!");
      
      // Clear form
      setFormData({
        fullname: '',
        schoolname: '',
        email: '',
        phonenumber: '',
        password: '',
        confirmpassword: '',
      });
      
      // Show success message
      Alert.alert(
        'Success!', 
        'Account created successfully! You can now login.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to Login screen
              navigation.navigate('Login');
            }
          }
        ]
      );

    } catch (error) {
      console.log("❌ REGISTRATION ERROR!");
      console.log("Error Code:", error.code);
      console.log("Error Message:", error.message);
      console.log("Full Error:", error);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      // Handle Firebase Auth errors
      if (error.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'This email address is already registered. Please use a different email or try logging in.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'The email address is not valid. Please enter a valid email address.';
            break;
          case 'auth/weak-password':
            errorMessage = 'The password is too weak. Please use a stronger password (at least 6 characters).';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your internet connection and try again.';
            break;
          case 'auth/operation-not-allowed':
            errorMessage = 'Email/password registration is not enabled. Please contact support.';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Too many requests. Please try again later.';
            break;
          default:
            errorMessage = `Error: ${error.message || 'An unknown error occurred. Please try again.'}`;
        }
      }
      
      // Check if it's a Firestore error
      if (error.message && error.message.includes('permission-denied')) {
        errorMessage = 'Database permission error. Please check Firebase Firestore rules.';
        console.log("🔴 IMPORTANT: Check your Firestore rules in Firebase Console!");
      }
      
      Alert.alert('Registration Failed', errorMessage);
      
      // Clean up: If Firebase Auth user was created but Firestore failed
      try {
        const currentUser = auth().currentUser;
        if (currentUser && currentUser.uid) {
          console.log("Cleaning up: Attempting to delete incomplete user...");
          await currentUser.delete();
          console.log("Incomplete user deleted successfully.");
        }
      } catch (deleteError) {
        console.log("Could not delete user:", deleteError.message);
      }
      
    } finally {
      setIsLoading(false);
      console.log("Loading state reset.");
    }
  };

  const isValidEmail = (email) => {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // Test Firebase connection
  const testFirebaseConnection = async () => {
    try {
      console.log("Testing Firebase connection...");
      const user = auth().currentUser;
      console.log("Current user:", user);
      console.log("Firebase auth object:", auth());
      console.log("Firestore object:", firestore());
    } catch (error) {
      console.log("Firebase connection error:", error);
    }
  };

  // Call this on component mount if needed
  useEffect(() => {
    testFirebaseConnection();
  }, []);

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.container}>
        <KeyboardAvoidingView 
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView 
            contentContainerStyle={[
              styles.scrollContainer,
              keyboardVisible && styles.scrollContainerKeyboard
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={{alignItems:'center',padding:30}}>
              <Text style={styles.title}>Create Account</Text>
            </View>

            {/* Form Section */}
            <View style={styles.form}>
              {/* Full Name */}
              <View style={styles.inputContainer}>
                <Image source={require("./Icons/user.png")} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Full Name *"
                  placeholderTextColor="#999"
                  value={formData.fullname}
                  onChangeText={(text) => updateFormData('fullname', text)}
                  editable={!isLoading}
                  returnKeyType="next"
                />
              </View>

              {/* School Name */}
              <View style={styles.inputContainer}>
                <Image source={require("./Icons/school.png")} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="School Name *"
                  placeholderTextColor="#999"
                  value={formData.schoolname}
                  onChangeText={(text) => updateFormData('schoolname', text)}
                  editable={!isLoading}
                  returnKeyType="next"
                />
              </View>

              {/* Email */}
              <View style={styles.inputContainer}>
                <Image source={require("./Icons/mail.png")} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email Address *"
                  placeholderTextColor="#999"
                  value={formData.email}
                  onChangeText={(text) => updateFormData('email', text)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                  returnKeyType="next"
                />
              </View>

              {/* Phone */}
              <View style={styles.inputContainer}>
                <Image source={require("./Icons/phone.png")} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number (Optional)"
                  placeholderTextColor="#999"
                  value={formData.phonenumber}
                  onChangeText={(text) => updateFormData('phonenumber', text)}
                  keyboardType="phone-pad"
                  editable={!isLoading}
                  returnKeyType="next"
                />
              </View>

              {/* Password */}
              <View style={styles.inputContainer}>
                <Image source={require("./Icons/password.png")} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password *"
                  placeholderTextColor="#999"
                  value={formData.password}
                  onChangeText={(text) => updateFormData('password', text)}
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                  returnKeyType="next"
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                  disabled={isLoading}
                >
                  <Image 
                    source={require("./Icons/eye.png")} 
                    style={{height:22,width:22}} 
                  />
                </TouchableOpacity>
              </View>

              {/* Confirm Password */}
              <View style={styles.inputContainer}>
                <Image source={require("./Icons/password.png")} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password *"
                  placeholderTextColor="#999"
                  value={formData.confirmpassword}
                  onChangeText={(text) => updateFormData('confirmpassword', text)}
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                  returnKeyType="done"
                  onSubmitEditing={handleRegister}
                />
              </View>

              {/* Register Button */}
              <TouchableOpacity 
                style={[
                  styles.registerButton, 
                  isLoading && styles.registerButtonDisabled
                ]} 
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                    <ActivityIndicator size="small" color="#FFFFFF" style={{marginRight: 10}} />
                    <Text style={styles.registerButtonText}>Creating Account...</Text>
                  </View>
                ) : (
                  <Text style={styles.registerButtonText}>Create Account</Text>
                )}
              </TouchableOpacity>

              {/* Login Link */}
              <TouchableOpacity 
                style={styles.loginLink}
                onPress={() => navigation.navigate('Login')}
                disabled={isLoading}
              >
                <Text style={styles.loginText}>
                  Already have an account? <Text style={styles.loginLinkText}>Sign In</Text>
                </Text>
              </TouchableOpacity>

              {/* Requirements */}
              {!keyboardVisible && (
                <View style={styles.requirementsContainer}>
                  <Text style={styles.requirementsTitle}>Password Requirements:</Text>
                  <Text style={styles.requirementItem}>• At least 6 characters long</Text>
                  <Text style={styles.requirementItem}>• Must match confirmation</Text>
                </View>
              )}
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
    paddingHorizontal: isTablet ? 40 : isSmallDevice ? 15 : 25,
    paddingVertical: 20,
  },
  scrollContainerKeyboard: {
    paddingTop: 10,
  },
  title: {
    fontWeight: 'bold',
    color: '#2c3e50',
    fontSize: 30
  },
  form: {
    backgroundColor: '#FFFFFF',
    padding: isTablet ? 30 : isSmallDevice ? 20 : 25,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: isTablet ? 60 : 52,
    backgroundColor: '#fafbfc',
  },
  icon: {
    height: 22,
    width: 22,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: isTablet ? 18 : 16,
    color: '#2c3e50',
    paddingVertical: 0,
  },
  eyeIcon: {
    padding: 4,
  },
  registerButton: {
    backgroundColor: '#3498db',
    paddingVertical: isTablet ? 18 : 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 50,
  },
  registerButtonDisabled: {
    backgroundColor: '#bdc3c7',
    shadowOpacity: 0,
    elevation: 0,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: isTablet ? 20 : 18,
    fontWeight: 'bold',
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#7f8c8d',
    fontSize: isTablet ? 16 : 14,
  },
  loginLinkText: {
    color: '#3498db',
    fontWeight: 'bold',
  },
  requirementsContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#fff9e6',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f39c12',
    borderRightWidth: 4,
    borderRightColor: '#f39c12',
  },
  requirementsTitle: {
    color: '#e67e22',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  requirementItem: {
    color: '#e67e22',
    fontSize: 12,
    lineHeight: 16,
  },
});

export default RegisterScreen;
