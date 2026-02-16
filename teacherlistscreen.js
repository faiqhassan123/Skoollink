import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  Image,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const TeacherListScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [teacher, setTeacher] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Auto-refresh when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadTeachers();
    }, [])
  );

  // Load teachers from storage
  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      setRefreshing(true);
      const storedTeachers = await AsyncStorage.getItem('teachers');
      if (storedTeachers) {
        setTeacher(JSON.parse(storedTeachers));
      } else {
        // Initialize with empty array if no teachers exist
        setTeacher([]);
      }
    } catch (error) {
      console.log('Error loading teachers:', error);
      Alert.alert('Error', 'Failed to load teachers');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };
  
  const onRefresh = useCallback(() => {
    loadTeachers();
  }, []);

  const saveTeachers = async (updatedTeachers) => {
    try {
      await AsyncStorage.setItem('teachers', JSON.stringify(updatedTeachers));
    } catch (error) {
      console.log('Error saving teachers:', error);
      throw error;
    }
  };

  // Calculations
  const totalTeachers = teacher.length;
  const presentTeachers = teacher.filter(teacher => teacher.isPresent).length;
  const absentTeachers = teacher.filter(teacher => !teacher.isPresent).length;
  const averageAttendance = totalTeachers > 0 ? ((presentTeachers / totalTeachers) * 100).toFixed(1) : '0';

  // FIXED: Added null checks for search
  const filteredTeachers = teacher.filter(teacher => {
    const searchLower = searchQuery.toLowerCase();
    const name = teacher.name ? teacher.name.toLowerCase() : '';
    const fatherName = teacher.fatherName ? teacher.fatherName.toLowerCase() : '';
    const qualification = teacher.qualification ? teacher.qualification.toLowerCase() : '';
    
    return (
      name.includes(searchLower) ||
      fatherName.includes(searchLower) ||
      qualification.includes(searchLower)
    );
  });

  const navigateToFeeTeacher = (teacher) => {
    navigation.navigate('Salary', {
      teacher: teacher
    });
  };

  const navigateToAddTeacher = () => {
    navigation.navigate('AddTeacher', { 
      mode: 'add',
      onTeacherAdded: loadTeachers // Callback to refresh after adding
    });
  };

  const navigateToEditTeacher = (teacher) => {
    navigation.navigate('AddTeacher', { 
      mode: 'edit',
      teacher: teacher,
      onTeacherUpdated: loadTeachers // Callback to refresh after editing
    });
  };

  const deleteTeacher = (teacherId, teacherName) => {
    Alert.alert(
      'Delete Teacher',
      `Are you sure you want to delete ${teacherName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedTeachers = teacher.filter(teacher => teacher.id !== teacherId);
              setTeacher(updatedTeachers);
              await saveTeachers(updatedTeachers);
              Alert.alert('Success', 'Teacher deleted successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete teacher');
            }
          }
        }
      ]
    );
  };

  // Add this function to handle teacher status toggle
  const toggleTeacherStatus = async (teacherId, currentStatus, teacherName) => {
    try {
      const updatedTeachers = teachers.map(teacher => {
        if (teacher.id === teacherId) {
          return { ...teacher, isPresent: !currentStatus };
        }
        return teacher;
      });
      
      setTeacher(updatedTeachers);
      await saveTeachers(updatedTeachers);
      
      const newStatus = !currentStatus ? 'present' : 'absent';
      Alert.alert('Success', `${teacherName} marked as ${newStatus}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update teacher status');
    }
  };

  const renderTeacherItem = ({ item }) => {
    // FIXED: Handle null values in display
    const displayName = item.name || 'No Name';
    const displayFatherName = item.fatherName || 'N/A';
    const displayQualification = item.qualification || 'N/A';
    const displayPhone = item.phone || 'N/A';
    const displayAddress = item.address || 'N/A';
    const isPresent = item.isPresent !== undefined ? item.isPresent : true;
    
    return (
      <View style={styles.teacherCard}>
        {/* Teacher Image */}
        <TouchableOpacity 
          style={styles.imageContainer}
          onPress={() => navigateToEditTeacher(item)}
        >
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.teacherImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Image source={require('./Icons/user.png')} style={styles.userIcon} />
            </View>
          )}
        </TouchableOpacity>

        {/* Teacher Info */}
        <View style={styles.teacherInfo}>
          <View style={styles.nameContainer}>
            <Text style={styles.teacherName} numberOfLines={1}>{displayName}</Text>
          </View>
          
          <Text style={styles.teacherDetails} numberOfLines={1}>Father: {displayFatherName}</Text>
          <Text style={styles.teacherDetails} numberOfLines={1}>Qualification: {displayQualification}</Text>
          <Text style={styles.teacherDetails} numberOfLines={1}>Phone: {displayPhone}</Text>
          <Text style={styles.teacherDetails} numberOfLines={2}>Address: {displayAddress}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]}
            onPress={() => navigateToEditTeacher(item)}
          >
            <Image source={require('./Icons/editing.png')} style={styles.actionIcon} />
          </TouchableOpacity> 
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => deleteTeacher(item.id, displayName)}
          >
            <Image source={require('./Icons/bin.png')} style={styles.actionIcon} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.salaryButton]}
            onPress={() => navigateToFeeTeacher(item)}
          >
            <Image source={require('./Icons/send-money.png')} style={styles.actionIcon} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Show loading indicator
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading teachers...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Image source={require('./Icons/find-users.png')} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, father name, or qualification"
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Teachers Count */}
      <View style={styles.resultsInfo}>
        <Text style={styles.resultsText}>
          Showing {filteredTeachers.length} of {totalTeachers} teachers
        </Text>
        <TouchableOpacity 
          style={styles.addTextButton}
          onPress={navigateToAddTeacher}
        >
          <Text style={styles.addTextButtonText}>+ Add Teacher</Text>
        </TouchableOpacity>
      </View>

      {/* Teachers List */}
      <FlatList
        data={filteredTeachers}
        renderItem={renderTeacherItem}
        keyExtractor={item => item.id ? item.id.toString() : Math.random().toString()}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3498db']}
            tintColor="#3498db"
          />
        }
        ListEmptyComponent={
           <View style={styles.emptyContainer}>
                      {/* <Icon name="people-outline" size={70} color="#bdc3c7" /> */}
                      <Text style={styles.emptyText}>No teacher found</Text>
                      <Text style={styles.emptySubtext}>
                        {searchQuery ? 'Try adjusting your search terms' : 'Add your first teacher to get started'}
                      </Text>
                    </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7f8c8d',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 15,
    marginBottom: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    tintColor: '#7f8c8d',
  },
  clearText: {
    color: '#7f8c8d',
    fontSize: 18,
    paddingHorizontal: 5,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2c3e50',
  },
  statsContainer: {
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    minWidth: 100,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 5,
  },
  resultsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 10,
    marginTop: 5,
  },
  resultsText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  addTextButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addTextButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
    paddingHorizontal: 15,
  },
  teacherCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    // padding: 10,
    paddingRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    marginRight: 15,
  },
  teacherImage: {
    width: 100,
    height: 170,
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  placeholderImage: {
     width: 100,
    height: 170,
    borderRadius: 10,
    backgroundColor: '#ecf0f1',
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    borderColor: '#bdc3c7',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems:'center',
  },
  userIcon: {
    width: 40,
    height: 40,
    tintColor: '#7f8c8d',
  },
  teacherInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  teacherName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
    marginRight: 10,
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  teacherDetails: {
    fontSize: 13,
    color: '#7f8c8d',
    marginBottom: 3,
  },
  actionButtons: {
    flexDirection: 'column',
  },
  actionButton: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 5,
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  actionIcon: {
    width: 18,
    height: 18,
    tintColor: 'white',
  },
  editButton: {
    backgroundColor: '#45bbffff',
  },
  deleteButton: {
    backgroundColor: '#ff6e63ff',
  },
  salaryButton: {
    backgroundColor: '#7843ffff',
  },
 emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#7f8c8d',
    fontWeight: 'bold',
    marginTop: 100,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bdc3c7',
    textAlign: 'center',
    marginTop: 5,
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498db',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius:50,
  },
  emptyAddButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default TeacherListScreen;