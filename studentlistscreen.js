import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  ScrollView,
  Image,
  RefreshControl
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

const { width } = Dimensions.get('window');
// const isTablet = width > 768;

const StudentListScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState([]);
   const [refreshing, setRefreshing] = useState(false);
  
useFocusEffect(
  useCallback(() => {
    let isActive = true;

    const fetchData = async () => {
      if (isActive) {
        await loadStudents();
      }
    };

    fetchData();

    return () => {
      isActive = false;
    };
  }, [])
);

  // Load students from storage
  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setRefreshing(true);
      const storedStudents = await AsyncStorage.getItem('students');
      if (storedStudents) {
        setStudents(JSON.parse(storedStudents));
      } else {
        // Load sample data if no students exist
        const sampleStudents = [
          {
            id: '1',
            name: 'John Smith',
            fatherName: 'Robert Smith',
            grade: '10th Grade',
            rollNumber: '101',
            phone: '+1234567890',
            email: 'john.smith@school.com',
            address: '123 Main Street, City',
            attendance: '95%',
            isPresent: true,
            marks: 85,
            image: null
          },
          {
            id: '2',
            name: 'Sarah Johnson',
            fatherName: 'Michael Johnson',
            grade: '10th Grade',
            rollNumber: '102',
            phone: '+1234567891',
            email: 'sarah.johnson@school.com',
            address: '456 Oak Avenue, Town',
            attendance: '88%',
            isPresent: true,
            marks: 78,
            image: null
          }
        ];
        setStudents(sampleStudents);
        await AsyncStorage.setItem('students', JSON.stringify(sampleStudents));
      }
    } catch (error) {
      console.log('Error loading students:', error);
    } finally {
      setRefreshing(false);
    }
  };
   const onRefresh = () => {
    loadStudents();
  };

  const saveStudents = async (updatedStudents) => {
    try {
      await AsyncStorage.setItem('students', JSON.stringify(updatedStudents));
    } catch (error) {
      console.log('Error saving students:', error);
    }
  };

  // Calculations
  const totalStudents = students.length;
  const presentStudents = students.filter(student => student.isPresent).length;
  const absentStudents = students.filter(student => !student.isPresent).length;
  const averageAttendance = totalStudents > 0 ? ((presentStudents / totalStudents) * 100).toFixed(1) : '0';
  // const averageMarks = totalStudents > 0 ? (students.reduce((sum, student) => sum + student.marks, 0) / totalStudents).toFixed(1) : '0';

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.fatherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.class.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.rollNumber.includes(searchQuery)
  );

  const navigateToFeeStudent = (student) => {
    navigation.navigate('Fee',
      {
        student:student
      }
    )};

  const navigateToAddStudent = () => {
    navigation.navigate('AddStudent', { 
      mode: 'add',
      onStudentAdded: loadStudents
    });
  };

  const navigateToEditStudent = (student) => {
    navigation.navigate('AddStudent', { 
      mode: 'edit',
      student: student,
      // onStudentUpdated: loadStudents
    });
  };
  

  const deleteStudent = (studentId, studentName) => {
    Alert.alert(
      'Delete Student',
      `Are you sure you want to delete ${studentName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedStudents = students.filter(student => student.id !== studentId);
            setStudents(updatedStudents);
            saveStudents(updatedStudents);
            Alert.alert('Success', 'Student deleted successfully!');
          }
        }
      ]
    );
  };

  const renderStudentItem = ({ item }) => (
    <View style={styles.studentCard}>
    <View>
    <TouchableOpacity 
        style={styles.imageContainer}
        onPress={() => navigateToEditStudent(item)}
        >
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.studentImage} />
        ) : (
          <View style={styles.placeholderImage}>
          <Image source={require('./Icons/user.png')} style={{height:40,width:40}}></Image>
          </View>
        )}
      </TouchableOpacity>
    </View>

      <View style={styles.studentInfo}>
        <View style={styles.nameContainer}>
          <Text style={styles.studentName}>{item.name}</Text>
        </View>

        <Text style={styles.studentDetails}>Father: {item.fatherName}</Text>
        <Text style={styles.studentDetails}>Class: {item.class}</Text>
        <Text style={styles.studentDetails}>DOB: {item.dateofbirth}</Text>
        <Text style={styles.studentDetails}>Roll No: {item.rollNumber}</Text>
        <Text style={styles.studentDetails}>Phone: {item.phone}</Text>
        <Text style={styles.studentDetails}>Address: {item.address}</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]}
          onPress={() => navigateToEditStudent(item)}
        >
          <Image source={require('./Icons/editing.png')} style={{height:20,width:20}}></Image>
        </TouchableOpacity> 
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => deleteStudent(item.id, item.name)}
        >
          <Image source={require('./Icons/bin.png')} style={{height:20,width:20}}></Image>
        </TouchableOpacity>
         <TouchableOpacity 
          style={[styles.actionButton, styles.feeButton]}
          onPress={() => navigateToFeeStudent(item)}
        >
          <Image source={require('./Icons/hand.png')} style={{height:20,width:20}}></Image>
          {/* <Text style={{color:'white',paddingHorizontal:7,paddingBottom:10,fontSize:12}}>Check Fee</Text> */}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
<View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Image source={require('./Icons/find-users.png')} style={{height:20,width:20}}></Image>
        {/* <Icon name="search" size={20} color="#7f8c8d" style={styles.searchIcon} /> */}
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            {/* <Icon name="clear" size={20} color="#7f8c8d" /> */}
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Students Count */}
      <View style={styles.resultsInfo}>
        <Text style={styles.resultsText}>
          Showing {filteredStudents.length} of {totalStudents} students
        </Text>
        <TouchableOpacity 
          style={styles.addTextButton}
          onPress={navigateToAddStudent}
        >
          {/* <Icon name="add" size={20} color="#3498db" /> */}
          <Text style={styles.addTextButtonText}>Add Student</Text>
        </TouchableOpacity>
      </View>

      {/* Students List */}
      <FlatList
        data={filteredStudents}
        renderItem={renderStudentItem}
        keyExtractor={item => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
         refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3498db']}
            tintColor="#3498db"
            title="Pull to refresh"
            titleColor="#7f8c8d"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {/* <Icon name="people-outline" size={70} color="#bdc3c7" /> */}
            <Text style={styles.emptyText}>No students found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try adjusting your search terms' : 'Add your first student to get started'}
            </Text>
          {/* <View style={{marginTop:240,marginLeft:240}}>
            <TouchableOpacity 
              style={styles.emptyAddButton}
              onPress={navigateToAddStudent}
              >
              <Image source={require('./Icons/plus.png')} style={{height:60,width:60}}></Image>
            </TouchableOpacity>
          </View> */}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  addButton: {
    backgroundColor: '#3498db',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  statsContainer: {
    paddingVertical: 15,
    backgroundColor: '#f8f9fa',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 6,
    alignItems: 'center',
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#000000ff',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 5,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 15,
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
  searchIcon: { marginRight: 10 },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2c3e50',
  },
  resultsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 10,
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
  studentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    marginRight: 15,
  },
  studentImage: {
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
  studentInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  studentDetails: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  statValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'column',
    // marginLeft: 10,
  },
  actionButton: {
    padding: 8,
    paddingHorizontal:12,
    borderRadius: 8,
    marginRight: 10,
    marginVertical:4,
  },
  editButton: {
    // marginLeft:40,
    backgroundColor: '#45bbffff',
  },
  deleteButton: {
    // marginLeft:40,
    backgroundColor: '#ff6e63ff',
  },
  feeButton: {
    // marginLeft:40,
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
    textAlign: 'center',
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

export default StudentListScreen;