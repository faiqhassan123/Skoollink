// // TimetableScreen.js
// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   Modal,
//   TextInput,
//   Alert,
//   FlatList,
//   Dimensions,
// } from 'react-native';

// const { width } = Dimensions.get('window');

// const TimetableScreen = () => {
//   const [timetable, setTimetable] = useState([]);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [editModalVisible, setEditModalVisible] = useState(false);
//   const [currentLecture, setCurrentLecture] = useState(null);
//   const [lectureName, setLectureName] = useState('');
//   const [teacherName, setTeacherName] = useState('');
//   const [lectureTime, setLectureTime] = useState('');
//   const [selectedDay, setSelectedDay] = useState('Monday');
//   const [isSaving, setIsSaving] = useState(false);
//   const [showAssemblyModal, setShowAssemblyModal] = useState(false);
//   const [showOffTimeModal, setShowOffTimeModal] = useState(false);
//   const [assemblyTime, setAssemblyTime] = useState('');
//   const [offTime, setOffTime] = useState('');
//   const [specialTimings, setSpecialTimings] = useState({
//   assembly: '',
//   offTime: ''
//   });

//   // Days without Sunday (only Monday to Saturday)
//   const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

//   // Add new lecture
//   const addLecture = () => {
//     if (!lectureName.trim()) {
//       Alert.alert('Error', 'Please enter lecture name');
//       return;
//     }
//     if (!teacherName.trim()) {
//       Alert.alert('Error', 'Please enter teacher name');
//       return;
//     }
//     if (!lectureTime.trim()) {
//       Alert.alert('Error', 'Please enter lecture time');
//       return;
//     }

//     const newLecture = {
//       id: Date.now().toString(),
//       lectureName: lectureName.trim(),
//       teacherName: teacherName.trim(),
//       time: lectureTime.trim(),
//       day: selectedDay,
//     };

//     setTimetable([...timetable, newLecture]);
//     resetForm();
//     setModalVisible(false);
//   };

//   // Update existing lecture
//   const updateLecture = () => {
//     if (!lectureName.trim() || !teacherName.trim() || !lectureTime.trim()) {
//       Alert.alert('Error', 'Please fill all fields');
//       return;
//     }

//     const updatedTimetable = timetable.map(lecture =>
//       lecture.id === currentLecture.id
//         ? { 
//             ...lecture, 
//             lectureName: lectureName.trim(), 
//             teacherName: teacherName.trim(), 
//             time: lectureTime.trim(), 
//             day: selectedDay 
//           }
//         : lecture
//     );

//     setTimetable(updatedTimetable);
//     resetForm();
//     setEditModalVisible(false);
//   };

//   // Delete lecture
//   const deleteLecture = (id, lectureName) => {
//     Alert.alert(
//       'Delete Lecture',
//       `Are you sure you want to delete "${lectureName}"?`,
//       [
//         { 
//           text: 'Cancel', 
//           style: 'cancel' 
//         },
//         {
//           text: 'Delete',
//           style: 'destructive',
//           onPress: () => {
//             setTimetable(timetable.filter(lecture => lecture.id !== id));
//           },
//         },
//       ]
//     );
//   };

//   // Edit lecture - open modal with current data
//   const editLecture = (lecture) => {
//     setCurrentLecture(lecture);
//     setLectureName(lecture.lectureName);
//     setTeacherName(lecture.teacherName);
//     setLectureTime(lecture.time);
//     setSelectedDay(lecture.day);
//     setEditModalVisible(true);
//   };

//   // Reset form fields
//   const resetForm = () => {
//     setLectureName('');
//     setTeacherName('');
//     setLectureTime('');
//     setSelectedDay('Monday');
//     setCurrentLecture(null);
//   };

//   // Save timetable (simulate saving)
//   const saveTimetable = () => {
//     setIsSaving(true);
    
//     // Simulate API call
//     setTimeout(() => {
//       Alert.alert(
//         'Success',
//         'Timetable saved successfully!',
//         [{ text: 'OK' }]
//       );
//       setIsSaving(false);
//     }, 1000);
//   };

//   // Get lectures for a specific day
//   const getLecturesForDay = (day) => {
//     return timetable
//       .filter(lecture => lecture.day === day)
//       .sort((a, b) => {
//         const timeA = a.time.split(' - ')[0];
//         const timeB = b.time.split(' - ')[0];
//         return timeA.localeCompare(timeB);
//       });
//   };

//   // Render day button
//   const renderDayButton = (day) => {
//     const dayLectures = getLecturesForDay(day);
//     const isSelected = selectedDay === day;

//     return (
//       <View>
//       <TouchableOpacity
//         key={day}
//         style={[
//           styles.dayButton,
//           isSelected && styles.dayButtonSelected,
//           dayLectures.length > 0 && styles.dayButtonHasLectures
//         ]}
//         onPress={() => setSelectedDay(day)}
//       >
//         <Text style={[
//           styles.dayButtonText,
//           isSelected && styles.dayButtonTextSelected
//         ]}>
//           {day}
//         </Text>
//         {/* {dayLectures.length > 0 && (
//           <Text style={styles.lectureCount}>
//             {dayLectures.length}
//           </Text>
//         )} */}
//       </TouchableOpacity>
//       </View>
//     );
//   };

//   // Render lecture item
//   const renderLectureItem = ({ item }) => (
//     <View>
//     <TouchableOpacity
//       style={styles.lectureItem}
//       onPress={() => editLecture(item)}
//       activeOpacity={0.7}
//     >
//       <View style={styles.lectureContent}>
//         <View style={styles.lectureHeader}>
//           <Text style={styles.lectureName} numberOfLines={1}>
//             {item.lectureName}
//           </Text>
//           <Text style={styles.lectureTime}>
//             {item.time}
//           </Text>
//         </View>
        
//         <Text style={styles.teacherName} numberOfLines={1}>
//           {item.teacherName}
//         </Text>
        
//         <View style={styles.lectureActions}>
//           <TouchableOpacity
//             style={styles.editButton}
//             onPress={() => editLecture(item)}
//           >
//             <Text style={styles.editButtonText}>Edit</Text>
//           </TouchableOpacity>
          
//           <TouchableOpacity
//             style={styles.deleteButton}
//             onPress={() => deleteLecture(item.id, item.lectureName)}
//           >
//             <Text style={styles.deleteButtonText}>Delete</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </TouchableOpacity>
//     </View>
//   );

//   // Render empty state for a day
//   const renderEmptyState = () => (
//     <View style={styles.emptyDayContainer}>
//       <Text style={styles.emptyDayText}>No lectures scheduled</Text>
//       <Text style={styles.emptyDaySubText}>
//         Tap "Add Lecture" to schedule a lecture for this day
//       </Text>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Weekly Timetable</Text>
//       <View style={styles.specialTimingsContainer}>
//        <TouchableOpacity
//     style={[
//       styles.specialButton,
//       specialTimings.assembly && styles.specialButtonActive
//     ]}
//     onPress={() => setShowAssemblyModal(true)}
//   >
//     <Text style={styles.specialButtonText}>
//       {specialTimings.assembly ? `Assembly: ${specialTimings.assembly}` : '+ Add Assembly Time'}
//     </Text>
//   </TouchableOpacity>
  
//   <TouchableOpacity
//     style={[
//       styles.specialButton,
//       specialTimings.offTime && styles.specialButtonActive
//     ]}
//     onPress={() => setShowOffTimeModal(true)}
//   >
//     <Text style={styles.specialButtonText}>
//       {specialTimings.offTime ? `Off Time: ${specialTimings.offTime}` : '+ Add Off Time'}
//     </Text>
//   </TouchableOpacity>
//   {/* Assembly Time Modal */}
// <Modal
//   animationType="slide"
//   transparent={true}
//   visible={showAssemblyModal}
//   onRequestClose={() => setShowAssemblyModal(true)}
// >
//   <View style={styles.modalOverlay}>
//     <View style={styles.modalContent}>
//       <Text style={styles.modalTitle}>Set Assembly Time</Text>
      
//       <Text style={styles.inputLabel}>Assembly Time *</Text>
//       <TextInput
//         style={styles.input}
//         placeholder="e.g., 08:30 AM"
//         value={assemblyTime}
//         onChangeText={setAssemblyTime}
//         placeholderTextColor="#999"
//       />
      
//       <View style={styles.modalButtons}>
//         <TouchableOpacity
//           style={[styles.modalButton, styles.cancelButton]}
//           onPress={() => {
//             setShowAssemblyModal(false);
//             setAssemblyTime(specialTimings.assembly || '');
//             //  setShowAssemblyModal(true);
//           }}
//         >
//           <Text style={styles.cancelButtonText}>Cancel</Text>
//         </TouchableOpacity>
        
//         <TouchableOpacity
//           style={[styles.modalButton, styles.submitButton]}
//           onPress={() => {
//             if (assemblyTime.trim()) {
//               setSpecialTimings(prev => ({
//                 ...prev,
//                 assembly: assemblyTime.trim()
//               }));
//               setAssemblyTime(specialTimings.assembly || '');
//               setShowAssemblyModal(false);
//             } else {
//               Alert.alert('Error', 'Please enter assembly time');
//             }
//           }}
//         >
//           <Text style={styles.submitButtonText}>Save</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   </View>
// </Modal>

// {/* Off Time Modal */}
// <Modal
//   animationType="slide"
//   transparent={true}
//   visible={showOffTimeModal}
//   onRequestClose={() => setShowOffTimeModal(false)}
// >
//   <View style={styles.modalOverlay}>
//     <View style={styles.modalContent}>
//       <Text style={styles.modalTitle}>Set Off Time</Text>
      
//       <Text style={styles.inputLabel}>Off Time *</Text>
//       <TextInput
//         style={styles.input}
//         placeholder="e.g., 04:00 PM"
//         value={offTime}
//         onChangeText={setOffTime}
//         placeholderTextColor="#999"
//       />
      
//       <View style={styles.modalButtons}>
//         <TouchableOpacity
//           style={[styles.modalButton, styles.cancelButton]}
//           onPress={() => {
//             setShowOffTimeModal(false);
//             setOffTime(specialTimings.offTime || '');
//           }}
//         >
//           <Text style={styles.cancelButtonText}>Cancel</Text>
//         </TouchableOpacity>
        
//         <TouchableOpacity
//           style={[styles.modalButton, styles.submitButton]}
//           onPress={() => {
//             if (offTime.trim()) {
//               setSpecialTimings(prev => ({
//                 ...prev,
//                 offTime: offTime.trim()
//               }));
//               // setOffTime('');
//               setOffTime(specialTimings.offTime || '');
//               setShowOffTimeModal(false);
//             } else {
//               Alert.alert('Error', 'Please enter off time');
//             }
//           }}
//         >
//           <Text style={styles.submitButtonText}>Save</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   </View>
// </Modal>
// </View>
//       </View>

//       {/* Days Selection */}
//       <ScrollView 
//         horizontal 
//         showsHorizontalScrollIndicator={false}
//         style={styles.daysContainer}
//       >
//         {days.map(day => renderDayButton(day))}
//       </ScrollView>

//       {/* Selected Day Title */}
//       <View style={styles.selectedDayHeader}>
//         <Text style={styles.selectedDayTitle}>
//           {selectedDay}'s Schedule
//         </Text>
//         <TouchableOpacity
//           style={styles.addLectureButton}
//           onPress={() => {
//             resetForm();
//             setModalVisible(true);
//           }}
//         >
//           <Text style={styles.addLectureButtonText}>+ Add Lecture</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Lectures List for Selected Day */}
//       <View style={styles.lecturesContainer}>
//         {getLecturesForDay(selectedDay).length === 0 ? (
//           renderEmptyState()
//         ) : (
//           <FlatList
//             data={getLecturesForDay(selectedDay)}
//             renderItem={renderLectureItem}
//             keyExtractor={(item) => item.id}
//             showsVerticalScrollIndicator={true}
//             contentContainerStyle={styles.lecturesList}
//           />
//         )}
//       </View>

  

//       {/* Add Lecture Modal */}
//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={modalVisible}
//         onRequestClose={() => {
//           setModalVisible(false);
//           resetForm();
//         }}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>Add New Lecture</Text>
            
//             <Text style={styles.inputLabel}>Lecture Name *</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="Enter lecture name"
//               value={lectureName}
//               onChangeText={setLectureName}
//               placeholderTextColor="#999"
//             />
            
//             <Text style={styles.inputLabel}>Teacher Name *</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="Enter teacher's name"
//               value={teacherName}
//               onChangeText={setTeacherName}
//               placeholderTextColor="#999"
//             />
            
//             <Text style={styles.inputLabel}>Time Slot *</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="Format: HH:MM - HH:MM"
//               value={lectureTime}
//               onChangeText={setLectureTime}
//               placeholderTextColor="#999"
//             />
            
//             <Text style={styles.inputLabel}>Select Day *</Text>
//             <View style={styles.daysGrid}>
//               {days.map(day => (
//                 <TouchableOpacity
//                   key={day}
//                   style={[
//                     styles.dayOption,
//                     selectedDay === day && styles.dayOptionSelected
//                   ]}
//                   onPress={() => setSelectedDay(day)}
//                 >
//                   <Text style={[
//                     styles.dayOptionText,
//                     selectedDay === day && styles.dayOptionTextSelected
//                   ]}>
//                     {day}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
            
//             <View style={styles.modalButtons}>
//               <TouchableOpacity
//                 style={[styles.modalButton, styles.cancelButton]}
//                 onPress={() => {
//                   setModalVisible(false);
//                   resetForm();
//                 }}
//               >
//                 <Text style={styles.cancelButtonText}>Cancel</Text>
//               </TouchableOpacity>
              
//               <TouchableOpacity
//                 style={[styles.modalButton, styles.submitButton]}
//                 onPress={addLecture}
//               >
//                 <Text style={styles.submitButtonText}>Add Lecture</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       {/* Edit Lecture Modal */}
//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={editModalVisible}
//         onRequestClose={() => {
//           setEditModalVisible(false);
//           resetForm();
//         }}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>Edit Lecture</Text>
            
//             <Text style={styles.inputLabel}>Lecture Name *</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="Enter lecture name"
//               value={lectureName}
//               onChangeText={setLectureName}
//               placeholderTextColor="#999"
//             />
            
//             <Text style={styles.inputLabel}>Teacher Name *</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="Enter teacher's name"
//               value={teacherName}
//               onChangeText={setTeacherName}
//               placeholderTextColor="#999"
//             />
            
//             <Text style={styles.inputLabel}>Time Slot *</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="Format: HH:MM - HH:MM"
//               value={lectureTime}
//               onChangeText={setLectureTime}
//               placeholderTextColor="#999"
//             />
            
//             <Text style={styles.inputLabel}>Select Day *</Text>
//             <View style={styles.daysGrid}>
//               {days.map(day => (
//                 <TouchableOpacity
//                   key={day}
//                   style={[
//                     styles.dayOption,
//                     selectedDay === day && styles.dayOptionSelected
//                   ]}
//                   onPress={() => setSelectedDay(day)}
//                 >
//                   <Text style={[
//                     styles.dayOptionText,
//                     selectedDay === day && styles.dayOptionTextSelected
//                   ]}>
//                     {day}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
            
//             <View style={styles.modalButtons}>
//               <TouchableOpacity
//                 style={[styles.modalButton, styles.cancelButton]}
//                 onPress={() => {
//                   setEditModalVisible(false);
//                   resetForm();
//                 }}
//               >
//                 <Text style={styles.cancelButtonText}>Cancel</Text>
//               </TouchableOpacity>
              
//               <TouchableOpacity
//                 style={[styles.modalButton, styles.submitButton]}
//                 onPress={updateLecture}
//               >
//                 <Text style={styles.submitButtonText}>Update Lecture</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//           Save Button
//       <View style={styles.footer}>
//         <TouchableOpacity
//           style={[
//             styles.saveButton,
//             isSaving && styles.saveButtonDisabled
//           ]}
//           onPress={saveTimetable}
//           disabled={isSaving}
//         >
//           <Text style={styles.saveButtonText}>
//             {isSaving ? 'Saving...' : 'Save Timetable'}
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F8F9FA',
//   },
//   header: {
//     backgroundColor: '#ffffffff',
//     // paddingLeft: 10,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingTop: 10,
//     // paddingBottom: 10,
//   },
//   headerTitle: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: '#000000ff',
//     // marginBottom: 5,
//   },
//   daysContainer: {
//     backgroundColor: '#ffffffff',
//     paddingVertical: 10,
//     paddingBottom: 50,
//     // paddingBottom: 10,
//   },
//   dayButton: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     width: 100,
//     height: 40,
//     marginRight: 5,
//     marginLeft: 10,
//     borderRadius: 10,
//     backgroundColor: '#f5f5f5',
//   },
//   dayButtonSelected: {
//     backgroundColor: '#0D47A1',
//   },
//   dayButtonText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#666',
//   },
//   dayButtonTextSelected: {
//     color: '#FFFFFF',
//   },
//   lectureCount: {
//     backgroundColor: '#ffffffff',
//     color: '#000000ff',
//     fontSize: 12,
//     fontWeight: 'bold',
//     paddingHorizontal:6,
//     paddingVertical: 2,
//     borderRadius: 10,
//     marginLeft: 80,
//     // paddingTop: 20,
//     // marginTop: 10,
//   },
//   selectedDayHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingVertical: 5,
//     backgroundColor: '#FFFFFF',
//     borderBottomWidth: 1,
//     borderBottomColor: '#E0E0E0',
//   },
//   selectedDayTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   addLectureButton: {
//     backgroundColor: '#2196F3',
//     paddingHorizontal: 10,
//     paddingVertical: 8,
//     borderRadius: 20,
//   },
//   addLectureButtonText: {
//     color: '#FFFFFF',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   lecturesContainer: {
//     // flex: 1,
//     backgroundColor: '#F8F9FA',
//   },
//   lecturesList: {
//     padding: 15,
//   },
//   lectureItem: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 10,
//     marginBottom: 12,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   lectureContent: {
//     padding: 15,
//   },
//   lectureHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: 10,
//   },
//   lectureName: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#333',
//     flex: 1,
//     marginRight: 10,
//   },
//   lectureTime: {
//     fontSize: 14,
//     color: '#ffffffff',
//     fontWeight: '600',
//     backgroundColor: '#3554edff',
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   teacherName: {
//     fontSize: 15,
//     color: '#666',
//     marginBottom: 15,
//   },
//   lectureActions: {
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//     borderTopWidth: 1,
//     borderTopColor: '#F0F0F0',
//     paddingTop: 10,
//   },
//   editButton: {
//     backgroundColor: '#4CAF50',
//     paddingHorizontal: 20,
//     paddingVertical: 8,
//     borderRadius: 6,
//     marginRight: 10,
//   },
//   editButtonText: {
//     color: '#FFFFFF',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   deleteButton: {
//     backgroundColor: '#F44336',
//     paddingHorizontal: 20,
//     paddingVertical: 8,
//     borderRadius: 6,
//   },
//   deleteButtonText: {
//     color: '#FFFFFF',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   emptyDayContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 40,
//   },
//   emptyDayText: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#666',
//     marginBottom: 10,
//   },
//   emptyDaySubText: {
//     fontSize: 14,
//     color: '#999',
//     textAlign: 'center',
//     lineHeight: 20,
//   },
//   footer: {
//     paddingHorizontal: 30,
//     // paddingTop:150,
//   },
//   saveButton: {
//     backgroundColor: '#0D47A1',
//     paddingVertical: 10,
//     borderRadius: 10,
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   saveButtonDisabled: {
//     backgroundColor: '#355f9fff',
//   },
//   saveButtonText: {
//     color: '#FFFFFF',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   statsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   statsText: {
//     fontSize: 14,
//     color: '#666',
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   modalContent: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 15,
//     padding: 25,
//     width: '100%',
//     maxWidth: 400,
//   },
//   modalTitle: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   inputLabel: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 8,
//     marginTop: 12,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#DDD',
//     borderRadius: 8,
//     padding: 12,
//     fontSize: 16,
//     backgroundColor: '#F9F9F9',
//   },
//   daysGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     marginHorizontal: -5,
//   },
//   dayOption: {
//     flex: 1,
//     minWidth: width / 3.5,
//     margin: 5,
//     paddingVertical: 10,
//     borderRadius: 8,
//     backgroundColor: '#F5F5F5',
//     alignItems: 'center',
//   },
//   dayOptionSelected: {
//     backgroundColor: '#0D47A1',
//   },
//   dayOptionText: {
//     fontSize: 14,
//     color: '#666',
//     fontWeight: '500',
//   },
//   dayOptionTextSelected: {
//     color: '#FFFFFF',
//   },
//   modalButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 25,
//   },
//   modalButton: {
//     flex: 1,
//     paddingVertical: 14,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   cancelButton: {
//     backgroundColor: '#F5F5F5',
//     marginRight: 10,
//   },
//   submitButton: {
//     backgroundColor: '#0D47A1',
//     marginLeft: 10,
//   },
//   cancelButtonText: {
//     color: '#666',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   submitButtonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   specialTimingsContainer: {
//   flexDirection: 'row',
//   justifyContent: 'space-between',
//   marginTop: 15,
//   paddingHorizontal: 5,
// },
// specialButton: {
//   flex: 1,
//   paddingVertical: 10,
//   paddingHorizontal: 10,
  
//   backgroundColor: '#0D47A1',
//   borderRadius: 8,
//   marginHorizontal: 8,
//   alignItems: 'center',
//   justifyContent: 'center',
//   marginBottom: 10,
// },
// specialButtonActive: {
//   backgroundColor: '#0D47A1',
// },
// specialButtonText: {
//   color: '#FFFFFF',
//   fontSize: 14,
//   fontWeight: '600',
//   textAlign: 'center',
// },
// });

// export default TimetableScreen;
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  FlatList,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const TimetableScreen = () => {
  // All hooks MUST be called unconditionally at the top level
  const [timetable, setTimetable] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [lectureName, setLectureName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [lectureTime, setLectureTime] = useState('');
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [showAssemblyModal, setShowAssemblyModal] = useState(false);
  const [showOffTimeModal, setShowOffTimeModal] = useState(false);
  const [assemblyTime, setAssemblyTime] = useState('');
  const [offTime, setOffTime] = useState('');
  const [specialTimings, setSpecialTimings] = useState({
    assembly: '',
    offTime: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Load saved data on component mount
  useEffect(() => {
    loadTimetableData();
  }, []);

  const loadTimetableData = async () => {
    try {
      setIsLoading(true);
      
      // Load timetable
      const savedTimetable = await AsyncStorage.getItem('timetable');
      if (savedTimetable) {
        setTimetable(JSON.parse(savedTimetable));
      }
      
      // Load special timings
      const savedTimings = await AsyncStorage.getItem('specialTimings');
      if (savedTimings) {
        const parsedTimings = JSON.parse(savedTimings);
        setSpecialTimings(parsedTimings);
        setAssemblyTime(parsedTimings.assembly || '');
        setOffTime(parsedTimings.offTime || '');
      }
    } catch (error) {
      console.log('Error loading timetable:', error);
      Alert.alert('Error', 'Failed to load timetable data');
    } finally {
      setIsLoading(false);
    }
  };

  const saveTimetableToStorage = async (timetableData) => {
    try {
      await AsyncStorage.setItem('timetable', JSON.stringify(timetableData));
    } catch (error) {
      console.log('Error saving timetable:', error);
      throw error;
    }
  };

  const saveSpecialTimingsToStorage = async (timings) => {
    try {
      await AsyncStorage.setItem('specialTimings', JSON.stringify(timings));
    } catch (error) {
      console.log('Error saving special timings:', error);
      throw error;
    }
  };

  const addLecture = async () => {
    if (!lectureName.trim()) {
      Alert.alert('Error', 'Please enter lecture name');
      return;
    }
    if (!teacherName.trim()) {
      Alert.alert('Error', 'Please enter teacher name');
      return;
    }
    if (!lectureTime.trim()) {
      Alert.alert('Error', 'Please enter lecture time');
      return;
    }

    const newLecture = {
      id: Date.now().toString(),
      lectureName: lectureName.trim(),
      teacherName: teacherName.trim(),
      time: lectureTime.trim(),
      day: selectedDay,
    };

    const updatedTimetable = [...timetable, newLecture];
    setTimetable(updatedTimetable);
    
    try {
      await saveTimetableToStorage(updatedTimetable);
      resetForm();
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to save lecture');
    }
  };

  const updateLecture = async () => {
    if (!lectureName.trim() || !teacherName.trim() || !lectureTime.trim()) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    const updatedTimetable = timetable.map(lecture =>
      lecture.id === currentLecture.id
        ? { 
            ...lecture, 
            lectureName: lectureName.trim(), 
            teacherName: teacherName.trim(), 
            time: lectureTime.trim(), 
            day: selectedDay 
          }
        : lecture
    );

    setTimetable(updatedTimetable);
    
    try {
      await saveTimetableToStorage(updatedTimetable);
      resetForm();
      setEditModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update lecture');
    }
  };

  const deleteLecture = async (id, lectureName) => {
    Alert.alert(
      'Delete Lecture',
      `Are you sure you want to delete "${lectureName}"?`,
      [
        { 
          text: 'Cancel', 
          style: 'cancel' 
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedTimetable = timetable.filter(lecture => lecture.id !== id);
            setTimetable(updatedTimetable);
            
            try {
              await saveTimetableToStorage(updatedTimetable);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete lecture');
            }
          },
        },
      ]
    );
  };

  const editLecture = (lecture) => {
    setCurrentLecture(lecture);
    setLectureName(lecture.lectureName);
    setTeacherName(lecture.teacherName);
    setLectureTime(lecture.time);
    setSelectedDay(lecture.day);
    setEditModalVisible(true);
  };

  const resetForm = () => {
    setLectureName('');
    setTeacherName('');
    setLectureTime('');
    setSelectedDay('Monday');
    setCurrentLecture(null);
  };

  const handleSaveAssemblyTime = async () => {
    if (!assemblyTime.trim()) {
      Alert.alert('Error', 'Please enter assembly time');
      return;
    }

    const newTimings = {
      ...specialTimings,
      assembly: assemblyTime.trim()
    };
    
    setSpecialTimings(newTimings);
    
    try {
      await saveSpecialTimingsToStorage(newTimings);
      setShowAssemblyModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to save assembly time');
    }
  };

  const handleSaveOffTime = async () => {
    if (!offTime.trim()) {
      Alert.alert('Error', 'Please enter off time');
      return;
    }

    const newTimings = {
      ...specialTimings,
      offTime: offTime.trim()
    };
    
    setSpecialTimings(newTimings);
    
    try {
      await saveSpecialTimingsToStorage(newTimings);
      setShowOffTimeModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to save off time');
    }
  };

  const getLecturesForDay = (day) => {
    return timetable
      .filter(lecture => lecture.day === day)
      .sort((a, b) => {
        const timeA = a.time.split(' - ')[0];
        const timeB = b.time.split(' - ')[0];
        return timeA.localeCompare(timeB);
      });
  };

  const renderDayButton = (day) => {
    const dayLectures = getLecturesForDay(day);
    const isSelected = selectedDay === day;

    return (
      <TouchableOpacity
        key={day}
        style={[
          styles.dayButton,
          isSelected && styles.dayButtonSelected,
        ]}
        onPress={() => setSelectedDay(day)}
      >
        <Text style={[
          styles.dayButtonText,
          isSelected && styles.dayButtonTextSelected
        ]}>
          {day}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderLectureItem = ({ item }) => (
    <TouchableOpacity
      style={styles.lectureItem}
      onPress={() => editLecture(item)}
      activeOpacity={0.7}
    >
      <View style={styles.lectureContent}>
        <View style={styles.lectureHeader}>
          <Text style={styles.lectureName} numberOfLines={1}>
            {item.lectureName}
          </Text>
          <Text style={styles.lectureTime}>
            {item.time}
          </Text>
        </View>
        
        <Text style={styles.teacherName} numberOfLines={1}>
          {item.teacherName}
        </Text>
        
        <View style={styles.lectureActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => editLecture(item)}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteLecture(item.id, item.lectureName)}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyDayContainer}>
      <Text style={styles.emptyDayText}>No lectures scheduled</Text>
      <Text style={styles.emptyDaySubText}>
        Tap "Add Lecture" to schedule a lecture for this day
      </Text>
    </View>
  );

  // Render loading state AFTER all hooks have been called
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0D47A1" />
        <Text style={styles.loadingText}>Loading timetable...</Text>
      </View>
    );
  }

  // Main render - this happens AFTER all hooks are called
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Weekly Timetable</Text>
      </View>

      {/* Special Timings */}
      <View style={styles.specialTimingsContainer}>
        <TouchableOpacity
          style={[
            styles.specialButton,
            specialTimings.assembly && styles.specialButtonActive
          ]}
          onPress={() => setShowAssemblyModal(true)}
        >
          <Text style={styles.specialButtonText}>
            {specialTimings.assembly ? `Assembly: ${specialTimings.assembly}` : '+ Add Assembly Time'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.specialButton,
            specialTimings.offTime && styles.specialButtonActive
          ]}
          onPress={() => setShowOffTimeModal(true)}
        >
          <Text style={styles.specialButtonText}>
            {specialTimings.offTime ? `Off Time: ${specialTimings.offTime}` : '+ Add Off Time'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Days Selection */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.daysContainer}
      >
        {days.map(day => renderDayButton(day))}
      </ScrollView>

      {/* Selected Day Header */}
      <View style={styles.selectedDayHeader}>
        <Text style={styles.selectedDayTitle}>
          {selectedDay}'s Schedule
        </Text>
        <TouchableOpacity
          style={styles.addLectureButton}
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
        >
          <Text style={styles.addLectureButtonText}>+ Add Lecture</Text>
        </TouchableOpacity>
      </View>

      {/* Lectures List */}
      <View style={styles.lecturesContainer}>
        {getLecturesForDay(selectedDay).length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={getLecturesForDay(selectedDay)}
            renderItem={renderLectureItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.lecturesList}
          />
        )}
      </View>

      {/* Assembly Time Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAssemblyModal}
        onRequestClose={() => setShowAssemblyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Assembly Time</Text>
            
            <Text style={styles.inputLabel}>Assembly Time *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 08:30 AM"
              value={assemblyTime}
              onChangeText={setAssemblyTime}
              placeholderTextColor="#999"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowAssemblyModal(false);
                  setAssemblyTime(specialTimings.assembly || '');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleSaveAssemblyTime}
              >
                <Text style={styles.submitButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Off Time Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showOffTimeModal}
        onRequestClose={() => setShowOffTimeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Off Time</Text>
            
            <Text style={styles.inputLabel}>Off Time *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 04:00 PM"
              value={offTime}
              onChangeText={setOffTime}
              placeholderTextColor="#999"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowOffTimeModal(false);
                  setOffTime(specialTimings.offTime || '');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleSaveOffTime}
              >
                <Text style={styles.submitButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Lecture Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          resetForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Lecture</Text>
            
            <Text style={styles.inputLabel}>Lecture Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter lecture name"
              value={lectureName}
              onChangeText={setLectureName}
              placeholderTextColor="#999"
            />
            
            <Text style={styles.inputLabel}>Teacher Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter teacher's name"
              value={teacherName}
              onChangeText={setTeacherName}
              placeholderTextColor="#999"
            />
            
            <Text style={styles.inputLabel}>Time Slot *</Text>
            <TextInput
              style={styles.input}
              placeholder="Format: HH:MM - HH:MM"
              value={lectureTime}
              onChangeText={setLectureTime}
              placeholderTextColor="#999"
            />
            
            <Text style={styles.inputLabel}>Select Day *</Text>
            <View style={styles.daysGrid}>
              {days.map(day => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayOption,
                    selectedDay === day && styles.dayOptionSelected
                  ]}
                  onPress={() => setSelectedDay(day)}
                >
                  <Text style={[
                    styles.dayOptionText,
                    selectedDay === day && styles.dayOptionTextSelected
                  ]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={addLecture}
              >
                <Text style={styles.submitButtonText}>Add Lecture</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Lecture Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => {
          setEditModalVisible(false);
          resetForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Lecture</Text>
            
            <Text style={styles.inputLabel}>Lecture Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter lecture name"
              value={lectureName}
              onChangeText={setLectureName}
              placeholderTextColor="#999"
            />
            
            <Text style={styles.inputLabel}>Teacher Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter teacher's name"
              value={teacherName}
              onChangeText={setTeacherName}
              placeholderTextColor="#999"
            />
            
            <Text style={styles.inputLabel}>Time Slot *</Text>
            <TextInput
              style={styles.input}
              placeholder="Format: HH:MM - HH:MM"
              value={lectureTime}
              onChangeText={setLectureTime}
              placeholderTextColor="#999"
            />
            
            <Text style={styles.inputLabel}>Select Day *</Text>
            <View style={styles.daysGrid}>
              {days.map(day => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayOption,
                    selectedDay === day && styles.dayOptionSelected
                  ]}
                  onPress={() => setSelectedDay(day)}
                >
                  <Text style={[
                    styles.dayOptionText,
                    selectedDay === day && styles.dayOptionTextSelected
                  ]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setEditModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={updateLecture}
              >
                <Text style={styles.submitButtonText}>Update Lecture</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Keep your existing styles here...

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 15,
    paddingBottom: 10,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  specialTimingsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  specialButton: {
    // flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: '#3498db',
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  specialButtonActive: {
    backgroundColor: '#3498db',
  },
  specialButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  daysContainer: {
     backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  dayButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
    height: 40,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dayButtonSelected: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  dayButtonTextSelected: {
    color: '#FFFFFF',
  },
  selectedDayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  selectedDayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  addLectureButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 15,
    paddingVertical: 8,
    // marginBottom: 20,
    borderRadius: 6,
  },
  addLectureButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  lecturesContainer: {
    backgroundColor: '#F8F9FA',
  },
  lecturesList: {
    padding: 15,
  },
  lectureItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  lectureContent: {
    padding: 15,
  },
  lectureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  lectureName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  lectureTime: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    backgroundColor: '#3554ED',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  teacherName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  lectureActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 10,
  },
  editButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyDayContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyDayText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
  },
  emptyDaySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
    marginBottom: 15,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
    marginBottom: 20,
  },
  dayOption: {
    width: (width - 60) / 3,
    margin: 5,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  dayOptionSelected: {
    backgroundColor: '#2196F3',
  },
  dayOptionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  dayOptionTextSelected: {
    color: '#FFFFFF',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    marginRight: 10,
  },
  submitButton: {
    backgroundColor: '#2196F3',
    marginLeft: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TimetableScreen;