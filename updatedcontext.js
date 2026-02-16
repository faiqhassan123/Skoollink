// src/context/UserContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(async (user) => {
      if (user) {
        // User is signed in
        const userData = await getUserData(user.uid);
        setUser(userData);
        await AsyncStorage.setItem('currentUser', JSON.stringify(userData));
      } else {
        // User is signed out
        setUser(null);
        await AsyncStorage.removeItem('currentUser');
      }
      setIsLoading(false);
    });

    return subscriber; // unsubscribe on unmount
  }, []);

  const getUserData = async (uid) => {
    try {
      const userDoc = await firestore().collection('users').doc(uid).get();
      if (userDoc.exists) {
        return { uid, ...userDoc.data() };
      }
      return null;
    } catch (error) {
      console.log('Error getting user data:', error);
      return null;
    }
  };

  const registerUser = async (userData) => {
    try {
      setIsLoading(true);

      // Create user with email and password
      const userCredential = await auth().createUserWithEmailAndPassword(
        userData.email,
        userData.password
      );

      const { user: firebaseUser } = userCredential;

      // Prepare user data for Firestore
      const userProfile = {
        uid: firebaseUser.uid,
        fullName: userData.fullName,
        email: userData.email,
        phone: userData.phone || '',
        role: userData.role || 'teacher',
        createdAt: firestore.FieldValue.serverTimestamp(),
        isEmailVerified: false
      };

      // Save user data to Firestore
      await firestore().collection('users').doc(firebaseUser.uid).set(userProfile);

      // Send email verification
      await firebaseUser.sendEmailVerification();

      setUser(userProfile);
      await AsyncStorage.setItem('currentUser', JSON.stringify(userProfile));

      return { 
        success: true, 
        user: userProfile,
        message: 'Registration successful! Please verify your email.'
      };
    } catch (error) {
      console.log('Registration error:', error);
      let errorMessage = 'Registration failed. Please try again.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection.';
          break;
        default:
          errorMessage = error.message || 'Registration failed.';
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const loginUser = async (email, password) => {
    try {
      setIsLoading(true);

      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const { user: firebaseUser } = userCredential;

      // Check if email is verified
      if (!firebaseUser.emailVerified) {
        await auth().signOut();
        return { 
          success: false, 
          error: 'Please verify your email before logging in.' 
        };
      }

      const userData = await getUserData(firebaseUser.uid);
      
      if (userData) {
        setUser(userData);
        await AsyncStorage.setItem('currentUser', JSON.stringify(userData));
        return { success: true, user: userData };
      } else {
        await auth().signOut();
        return { success: false, error: 'User data not found.' };
      }
    } catch (error) {
      console.log('Login error:', error);
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
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection.';
          break;
        default:
          errorMessage = error.message || 'Login failed.';
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logoutUser = async () => {
    try {
      setIsLoading(true);
      await auth().signOut();
      setUser(null);
      await AsyncStorage.removeItem('currentUser');
      return { success: true };
    } catch (error) {
      console.log('Logout error:', error);
      return { success: false, error: 'Logout failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email) => {
    try {
      await auth().sendPasswordResetEmail(email);
      return { success: true, message: 'Password reset email sent successfully.' };
    } catch (error) {
      console.log('Password reset error:', error);
      let errorMessage = 'Failed to send reset email.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        default:
          errorMessage = error.message || 'Failed to send reset email.';
      }
    }
  }
}
      return