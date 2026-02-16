import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';

const MainScreen = ({ navigation }) => {
  const [adminName, setAdminName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  // const [role, setRole] = useState('Admin');

  useEffect(() => {
    loadUserData();
    loadProfileImage();
  }, []);

  const loadUserData = async () => {
  try {
    // Load saved data from AsyncStorage
    const savedAdminName = await AsyncStorage.getItem('adminName');
    const savedSchoolName = await AsyncStorage.getItem('schoolName');
    const savedRole = await AsyncStorage.getItem('role');
    
    // Set with actual values or defaults
    setAdminName(savedAdminName || 'Principal Name');
    setSchoolName(savedSchoolName || 'School Name');
    // setRole(savedRole || 'Admin');
    
    console.log("Loaded data:", { savedAdminName, savedSchoolName, savedRole });
  } catch (error) {
    console.error('Error loading user data:', error);
    Alert.alert('Error', 'Failed to load user data');
  }
};

  const loadProfileImage = async () => {
    try {
      const savedImageUri = await AsyncStorage.getItem('profileImage');
      if (savedImageUri) {
        setProfileImage(savedImageUri);
      }
    } catch (error) {
      console.error('Error loading profile image:', error);
    }
  };

  const pickImageFromGallery = async () => {
    try {
      const options = {
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 2000,
        maxWidth: 2000,
        quality: 0.8,
        selectionLimit: 1,
      };

      launchImageLibrary(options, async (response) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.error) {
          console.log('ImagePicker Error: ', response.error);
          Alert.alert('Error', 'Failed to pick image from gallery');
        } else if (response.assets && response.assets[0].uri) {
          const uri = response.assets[0].uri;
          setProfileImage(uri);
          
          // Save to AsyncStorage
          try {
            await AsyncStorage.setItem('profileImage', uri);
            Alert.alert('Success', 'Profile picture updated successfully!');
          } catch (error) {
            console.error('Error saving image:', error);
            Alert.alert('Error', 'Failed to save profile picture');
          }
        }
      });
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to access gallery');
    }
  };

   const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('userToken');
            navigation.replace('Login');
          }
        }
      ]
    );
  };

  const dashboardItems = [
    {
      id: 1,
      title: 'Student List',
      description: 'Manage student information',
      icon: '👨‍🎓',
      screen: 'StudentList',
      row: 1,
    },
    {
      id: 2,
      title: 'Teacher List',
      description: 'Manage teacher information',
      icon: '👨‍🏫',
      screen: 'TeacherList',
      row: 1,
    },
    {
      id: 3,
      title: 'School Assets',
      description: 'View all assets of school',
      icon: '📋',
      screen: 'StackRegister',
      row: 2,
    },
    {
      id: 4,
      title: 'Time table',
      description: 'View class schedule',
      icon: '📅',
      screen: 'timetable',
      row: 2,
    },
    {
      id: 5,
      title: 'Home work',
      description: 'Assign and check homework',
      icon: '📝',
      screen: 'Homework',
      row: 3,
    },
    {
      id: 6,
      title: 'Exam',
      description: 'Exam schedule and results',
      icon: '✒️',
      screen: 'Exam',
      row: 3,
    },
  ];


  // Group items by row
  const row1Items = dashboardItems.filter(item => item.row === 1);
  const row2Items = dashboardItems.filter(item => item.row === 2);
  const row3Items = dashboardItems.filter(item => item.row === 3);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#2b2b2bff" barStyle="light-content" />
      {/* Header Section with Profile */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          {/* Profile Image with Gallery Upload */}
          <TouchableOpacity 
            onPress={pickImageFromGallery} 
            style={styles.profileImageContainer}
            activeOpacity={0.8}
          >
            {profileImage ? (
              <Image 
                source={{ uri: profileImage }} 
                style={styles.profileImage} 
                onError={() => {
                  console.log('Failed to load profile image');
                  setProfileImage(null);
                }}
              />
            ) : (
              <View style={styles.profilePlaceholder}>
                <Text style={styles.profilePlaceholderText}>
                  {adminName
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                    .substring(0, 2)}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          
          <View style={styles.userInfo}>
            {/* <Text style={styles.dashboardTitle}>Dashboard</Text> */}
            <Text style={styles.principalName} numberOfLines={1}>
              {adminName}
            </Text>
            <Text style={styles.schoolName} numberOfLines={1}>
              {schoolName}
            </Text>
            {/* <Text style={styles.userRole}>{role}</Text> */}
          </View>
          
          <TouchableOpacity 
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Image source={require('./Icons/switch.png')} style={{height:25,width:25,marginBottom:80,marginRight:10,}}></Image>
            {/* <Text style={styles.logoutText}>Logout</Text> */}
          </TouchableOpacity>
        </View>
        
        {/* Divider Line */}
        <View style={styles.divider} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Row 1: Student List | Teacher List */}
        <View style={styles.rowContainer}>
          <Text style={styles.rowTitle}>Student List | Teacher List</Text>
          <View style={styles.rowDivider} />
          <View style={styles.row}>
            {row1Items.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                onPress={() => navigation.navigate(item.screen)}
                activeOpacity={0.8}
              >
                <Text style={styles.cardIcon}>{item.icon}</Text>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDescription}>{item.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Row 2: Classes List | Home work */}
        <View style={styles.rowContainer}>
          <Text style={styles.rowTitle}>School Assets | Time Table</Text>
          <View style={styles.rowDivider} />
          <View style={styles.row}>
            {row2Items.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                onPress={() => navigation.navigate(item.screen)}
                activeOpacity={0.8}
              >
                <Text style={styles.cardIcon}>{item.icon}</Text>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDescription}>{item.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Row 3: Time table | Exam */}
        <View style={styles.rowContainer}>
          <Text style={styles.rowTitle}>Home Work | Exam</Text>
          <View style={styles.rowDivider} />
          <View style={styles.row}>
            {row3Items.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                onPress={() => navigation.navigate(item.screen)}
                activeOpacity={0.8}
              >
                <Text style={styles.cardIcon}>{item.icon}</Text>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDescription}>{item.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#3498db',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 20,
    borderRadius: 20,
    margin: 8,
    marginHorizontal: 18,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // paddingHorizontal: 20,
    marginLeft:10,
    marginTop:-10,
    // marginRight:10,
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'white',
    backgroundColor: '#f0f0f0',
  },
  profilePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#2c5282',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  profilePlaceholderText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4a6da7',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  cameraIcon: {
    fontSize: 16,
  },
  userInfo: {
    flex: 1,
    marginLeft: 15,
    marginRight: 10,
  },
  dashboardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  principalName: {
    fontSize: 25,
    fontWeight: '600',
    color: 'white',
    marginBottom: 2,
  },
  schoolName: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontStyle: 'italic',
  },
  logoutText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  divider: {
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 20,
    marginTop: 15,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  rowContainer: {
    marginBottom: 25,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 10,
    textAlign: 'center',
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
    minHeight: 120,
    justifyContent: 'center',
  },
  cardIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 16,
  },
  dashboardFooter: {
    marginTop: 10,
    marginBottom: 30,
    alignItems: 'center',
  },
  dashboardFooterText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4a6da7',
    letterSpacing: 1,
  },
});

export default MainScreen;
