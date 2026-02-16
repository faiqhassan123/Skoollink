import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
  Modal,
  SafeAreaView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImagePicker from 'react-native-image-crop-picker';

const { width, height } = Dimensions.get('window');

const AddStudentScreen = ({ navigation, route }) => {
  const params = route?.params || {};
  const { mode = 'add', student: existingStudent, onStudentAdded, onStudentUpdated } = params;
  
  // All hooks must be declared unconditionally at the top
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    fatherName: '',
    class: '',
    dateofbirth: '',
    rollNumber: '',
    phone: '',
    address: '',
    image: null
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [showImageSourceModal, setShowImageSourceModal] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [tempImage, setTempImage] = useState(null);

  // Populate form when editing - this hook must always run
  useEffect(() => {
    if (mode === 'edit' && existingStudent) {
      setFormData({
        id: existingStudent.id || Date.now().toString(),
        name: existingStudent.name || '',
        fatherName: existingStudent.fatherName || '',
        class: existingStudent.class || '',
        dateofbirth: existingStudent.dateofbirth || '',
        rollNumber: existingStudent.rollNumber || '',
        phone: existingStudent.phone || '',
        address: existingStudent.address || '',
        image: existingStudent.image || null,
      });
    } else {
      setFormData({
        id: Date.now().toString(),
        name: '',
        fatherName: '',
        class: '',
        dateofbirth: '',
        rollNumber: '',
        phone: '',
        address: '',
        image: null,
      });
    }
  }, [mode, existingStudent]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const showImagePickerOptions = () => {
    setShowImageSourceModal(true);
  };

  const openCamera = async () => {
    setShowImageSourceModal(false);
    try {
      const image = await ImagePicker.openCamera({
        width: 300,
        height: 300,
        cropping: true,
        cropperCircleOverlay: true,
        compressImageQuality: 0.7,
        mediaType: 'photo',
        includeBase64: false,
      });
      setTempImage(image.path);
      setShowAdjustmentModal(true);
    } catch (error) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Error', 'Failed to take photo');
        console.log('Camera Error:', error);
      }
    }
  };

  const openGallery = async () => {
    setShowImageSourceModal(false);
    try {
      const image = await ImagePicker.openPicker({
        width: 300,
        height: 300,
        cropping: true,
        cropperCircleOverlay: true,
        compressImageQuality: 0.7,
        mediaType: 'photo',
        includeBase64: false,
      });
      setTempImage(image.path);
      setShowAdjustmentModal(true);
    } catch (error) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Error', 'Failed to select image');
        console.log('Gallery Error:', error);
      }
    }
  };
  const applyImage = () => {
    if (tempImage) {
      handleInputChange('image', tempImage);
    }
    setShowAdjustmentModal(false);
    setTempImage(null);
  };

  const cancelImageAdjustment = () => {
    setShowAdjustmentModal(false);
    setTempImage(null);
  };

  const removeImage = () => {
    handleInputChange('image', null);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter student name');
      return false;
    }
    if (!formData.fatherName.trim()) {
      Alert.alert('Error', 'Please enter father name');
      return false;
    }
    if (!formData.class.trim()) {
      Alert.alert('Error', 'Please enter class');
      return false;
    }
    if (!formData.dateofbirth.trim()) {
      Alert.alert('Error', 'Please enter date of birth');
      return false;
    }
    if (!formData.rollNumber.trim()) {
      Alert.alert('Error', 'Please enter roll number');
      return false;
    }
    if (!formData.phone.trim()) {
      Alert.alert('Error', 'Please enter phone number');
      return false;
    }
    if (!formData.address.trim()) {
      Alert.alert('Error', 'Please enter address');
      return false;
    }
    return true;
  };

  const saveStudent = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const storedStudents = await AsyncStorage.getItem('students');
      let students = storedStudents ? JSON.parse(storedStudents) : [];

      const studentData = {
        ...formData,
        name: formData.name.trim(),
        fatherName: formData.fatherName.trim(),
        class: formData.class.trim(),
        dateofbirth: formData.dateofbirth.trim(),
        rollNumber: formData.rollNumber.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
      };

      if (mode === 'edit') {
        const index = students.findIndex(s => s.id === studentData.id);
        if (index !== -1) {
          students[index] = studentData;
          await AsyncStorage.setItem('students', JSON.stringify(students));
          if (onStudentUpdated) onStudentUpdated();
          Alert.alert('Success', 'Student updated successfully!');
        }
      } else {
        const rollNumberExists = students.some(s => s.rollNumber === studentData.rollNumber);
        if (rollNumberExists) {
          Alert.alert('Error', 'Roll number already exists');
          setIsLoading(false);
          return;
        }

        students.unshift(studentData);
        await AsyncStorage.setItem('students', JSON.stringify(students));
        if (onStudentAdded) onStudentAdded();
        Alert.alert('Success', 'Student added successfully!');
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save student');
      console.log('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Image Upload Section */}
        <View style={styles.imageSection}>
          <Text style={styles.sectionTitle}>Student Photo</Text>
          <View style={styles.imageContainer}>
            {formData.image ? (
              <View style={styles.imagePreview}>
                <Image source={{ uri: formData.image }} style={styles.previewImage} />
                <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                  <Text style={styles.removeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.uploadButton} onPress={showImagePickerOptions}>
                <Text style={styles.plusIcon}>+</Text>
                <Text style={styles.uploadText}>Add Photo</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Student Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter student full name"
              value={formData.name}
              onChangeText={(text) => handleInputChange('name', text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Father Name *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter father's name"
              value={formData.fatherName}
              onChangeText={(text) => handleInputChange('fatherName', text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Class *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., 10th Grade, 11th Science"
              value={formData.class}
              onChangeText={(text) => handleInputChange('class', text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Date of Birth *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="DD/MM/YYYY"
              value={formData.dateofbirth}
              onChangeText={(text) => handleInputChange('dateofbirth', text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Roll Number *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter roll number"
              value={formData.rollNumber}
              onChangeText={(text) => handleInputChange('rollNumber', text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter phone number"
              value={formData.phone}
              onChangeText={(text) => handleInputChange('phone', text)}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Address *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Enter full address"
              value={formData.address}
              onChangeText={(text) => handleInputChange('address', text)}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={saveStudent}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>
              {mode === 'edit' ? 'Update Student' : 'Save Student'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Image Source Selection Modal - Always rendered, conditionally shown */}
      <Modal
        visible={showImageSourceModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowImageSourceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Image Source</Text>
            
            <TouchableOpacity style={styles.modalOption} onPress={openCamera}>
              <Text style={styles.modalOptionText}>📸 Open Camera</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.modalOption} onPress={openGallery}>
              <Text style={styles.modalOptionText}>🖼️ Open Gallery</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowImageSourceModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Image Adjustment Modal - Always rendered, conditionally shown */}
      <Modal
        visible={showAdjustmentModal}
        transparent={true}
        animationType="slide"
        onRequestClose={cancelImageAdjustment}
      >
        <SafeAreaView style={styles.adjustmentContainer}>
          <View style={styles.adjustmentHeader}>
            <Text style={styles.adjustmentTitle}>Adjust Image</Text>
            <TouchableOpacity onPress={cancelImageAdjustment}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.imagePreviewContainer}>
            {tempImage && (
              <Image 
                source={{ uri: tempImage }} 
                style={styles.adjustmentImage}
                resizeMode="contain"
              />
            )}
          </View>
          <View style={styles.adjustmentActions}>
            <TouchableOpacity style={styles.cancelAdjustButton} onPress={cancelImageAdjustment}>
              <Text style={styles.cancelAdjustButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.applyButton} onPress={applyImage}>
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  imageSection: {
    backgroundColor: 'white',
    padding: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  imageContainer: {
    alignItems: 'center',
  },
  uploadButton: {
    width: 120,
    height: 120,
    borderWidth: 2,
    borderColor: '#bdc3c7',
    borderStyle: 'dashed',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  plusIcon: {
    fontSize: 40,
    color: '#3498db',
    marginBottom: 5,
  },
  uploadText: {
    color: '#7f8c8d',
    fontSize: 14,
  },
  imagePreview: {
    position: 'relative',
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#ecf0f1',
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#e74c3c',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  formSection: {
    backgroundColor: 'white',
    padding: 20,
    marginTop: 10,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2c3e50',
    backgroundColor: '#fafbfc',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#3498db',
    margin: 20,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalOptionText: {
    fontSize: 18,
    color: '#2c3e50',
    textAlign: 'center',
  },
  cancelButton: {
    marginTop: 10,
    paddingVertical: 18,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#e74c3c',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  adjustmentContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  adjustmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#1a1a1a',
  },
  adjustmentTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    color: 'white',
    fontSize: 24,
    fontWeight: '300',
  },
  imagePreviewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  adjustmentImage: {
    width: width * 0.9,
    height: height * 0.6,
  },
  adjustmentControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#1a1a1a',
  },
  adjustButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
  },
  rotateButton: {
    backgroundColor: '#9b59b6',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
  },
  adjustButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  adjustmentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  cancelAdjustButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: '#3498db',
  },
  cancelAdjustButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  applyButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: '#3498db',
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddStudentScreen;