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
  Image,
  SafeAreaView,
  StatusBar,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CheckFeeScreen = ({ navigation, route }) => {
  const { student } = route.params || {};
  
  // Move all hooks to the top level
  const [feeModalVisible, setFeeModalVisible] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Fee form states
  const [admissionDate, setAdmissionDate] = useState('');
  const [totalFee, setTotalFee] = useState('');
  const [paidFee, setPaidFee] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [feeStatus, setFeeStatus] = useState('Pending');
  const [remainingFee, setRemainingFee] = useState(0);

  // Month schedule states - all months initially unpaid
  const [monthlySchedule, setMonthlySchedule] = useState([
    { id: '1', month: 'January', paid: true, amount: 833 },
    { id: '2', month: 'February', paid: true, amount: 833 },
    { id: '3', month: 'March', paid: true, amount: 833 },
    { id: '4', month: 'April', paid: true, amount: 833 },
    { id: '5', month: 'May', paid: true, amount: 833 },
    { id: '6', month: 'June', paid: true, amount: 833 },
    { id: '7', month: 'July', paid: true, amount: 833 },
    { id: '8', month: 'August', paid: true, amount: 833 },
    { id: '9', month: 'September', paid: true, amount: 833 },
    { id: '10', month: 'October', paid: true, amount: 833 },
    { id: '11', month: 'November', paid: true, amount: 833 },
    { id: '12', month: 'December', paid: true, amount: 833 },
  ]);

  // Load student data from params
  useEffect(() => {
    const initializeData = async () => {
      if (student) {
        setStudentData(student);
        await loadFeeData(student.id);
        setLoading(false);
      } else {
        Alert.alert('Error', 'Student data not found');
        navigation.goBack();
      }
    };
    
    initializeData();
  }, [student]);

  // Load fee data from AsyncStorage
  const loadFeeData = async (studentId) => {
    try {
      const feeData = await AsyncStorage.getItem(`fee_${studentId}`);
      if (feeData) {
        const parsedData = JSON.parse(feeData);
        setAdmissionDate(parsedData.admissionDate || '');
        setTotalFee(parsedData.totalFee ? parsedData.totalFee.toString() : '');
        setPaidFee(parsedData.paidFee ? parsedData.paidFee.toString() : '');
        setPaymentDate(parsedData.paymentDate || '');
        setFeeStatus(parsedData.feeStatus || 'Pending');
        
        // Load monthly schedule if exists
        if (parsedData.monthlySchedule && Array.isArray(parsedData.monthlySchedule)) {
          setMonthlySchedule(parsedData.monthlySchedule);
        }
        
        const total = parseInt(parsedData.totalFee || 0);
        const paid = parseInt(parsedData.paidFee || 0);
        setRemainingFee(total - paid);
      }
    } catch (error) {
      console.log('Error loading fee data:', error);
    }
  };

  // Toggle month payment status
  const toggleMonthPayment = (monthId) => {
    setMonthlySchedule(prev => prev.map(month => {
      if (month.id === monthId) {
        const updatedMonth = { ...month, paid: !month.paid };
        
        // Update month amount based on total fee
        const total = parseInt(totalFee) || 0;
        if (total > 0) {
          updatedMonth.amount = Math.round(total / 12);
        }
        
        // Update payment date for paid months
        if (updatedMonth.paid && !month.paid) {
          updatedMonth.paidDate = new Date().toISOString().split('T')[0];
        }
        
        return updatedMonth;
      }
      return month;
    }));
  };

  // Calculate total from monthly payments
  // const calculateMonthlyTotal = () => {
  //   return monthlySchedule.reduce((total, month) => {
  //     if (month.paid) {
  //       return total + (month.amount || 0);
  //     }
  //     return total;
  //   }, 0);
  // };

  // Calculate remaining fee
  const calculateRemainingFee = () => {
    const total = parseInt(totalFee) || 0;
    const paid = parseInt(paidFee) || 0;
    // const monthlyPaid = calculateMonthlyTotal();
    return total - (paid);
  };

  // Get paid months count
  const getPaidMonthsCount = () => {
    return monthlySchedule.filter(month => month.paid).length;
  };

  // Get pending months count
  const getPendingMonthsCount = () => {
    return monthlySchedule.filter(month => !month.paid).length;
  };

  // Save fee details
  const saveFeeDetails = async () => {
    if (!studentData) return;

    if (!admissionDate.trim()) {
      Alert.alert('Error', 'Please enter admission date');
      return;
    }
    
    if (!totalFee.trim()) {
      Alert.alert('Error', 'Please enter total fee');
      return;
    }
    
    if (!paidFee.trim()) {
      Alert.alert('Error', 'Please enter paid fee');
      return;
    }

    const total = parseInt(totalFee);
    const paid = parseInt(paidFee);
    // const monthlyPaid = calculateMonthlyTotal();
    const totalPaid = paid;
    
    if (isNaN(total) || total <= 0) {
      Alert.alert('Error', 'Please enter valid total fee');
      return;
    }
    
    if (isNaN(paid) || paid < 0) {
      Alert.alert('Error', 'Please enter valid paid fee');
      return;
    }
    
    if (totalPaid > total) {
      Alert.alert('Error', 'Total paid fee cannot be greater than total fee');
      return;
    }

    const remaining = total - totalPaid;
    const status = totalPaid === 0 ? 'Pending' : totalPaid === total ? 'Paid' : 'Partial';

    try {
      const feeData = {
        studentId: studentData.id,
        admissionDate: admissionDate.trim(),
        totalFee: total,
        paidFee: paid,
        // monthlyPaidFee: monthlyPaid,
        remainingFee: remaining,
        feeStatus: status,
        paymentDate: paymentDate.trim() || new Date().toISOString().split('T')[0],
        monthlySchedule: monthlySchedule,
        paidMonths: getPaidMonthsCount(),
        pendingMonths: getPendingMonthsCount(),
        lastUpdated: new Date().toISOString(),
      };

      await AsyncStorage.setItem(`fee_${studentData.id}`, JSON.stringify(feeData));
      
      setRemainingFee(remaining);
      setFeeStatus(status);
      setFeeModalVisible(false);
      
      Alert.alert('Success', 'Fee details saved successfully!');
    } catch (error) {
      console.log('Error saving fee data:', error);
      Alert.alert('Error', 'Failed to save fee details');
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return '#4CAF50';
      case 'Pending': return '#F44336';
      case 'Partial': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  // Render month item for FlatList
  const renderMonthItem = ({ item }) => (
    <View style={styles.monthItem}>
      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => toggleMonthPayment(item.id)}
      >
        <View style={[styles.checkbox, item.paid && styles.checkedBox]}>
          {item.paid && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={[styles.monthText, item.paid && styles.paidMonthText]}>
          {item.month}
        </Text>
      </TouchableOpacity>
      
      <View style={styles.monthDetails}>
        {/* <Text style={styles.dueDate}>Due: {item.dueDate}</Text> */}
        {item.paid ? (
          <Text style={styles.paidStatus}>Paid</Text>
        ) : (
          <Text style={styles.pendingStatus}>Pending</Text>
        )}
      </View>
    </View>
  );

  // Show loading state
  if (loading || !studentData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContainer}>
          <Text>Loading student data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          {/* Back icon would go here */}
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fee Details</Text>
        <View style={{width: 24}} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Student Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
             {studentData.image ? (<Image source={{ uri: studentData.image }} style={styles.profileImage} />
             ) : (
               <View style={styles.placeholderProfileImage}>
                 <Image source={require('./Icons/user.png')} style={{height:50,width:50,justifyContent:'center',alignItems:'center'}} />
             </View>
          )}
        </View>
          
          <Text style={styles.studentName}>{studentData.name}</Text>
          <Text style={styles.studentClass}>Class: {studentData.class}</Text>
          <Text style={styles.rollNumber}>Roll No: {studentData.rollNumber}</Text>
          
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(feeStatus) }]}>
            <Text style={styles.statusText}>{feeStatus}</Text>
          </View>
        </View>

        {/* Student Details */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Student Information</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Father's Name:</Text>
            <Text style={styles.detailValue}>{studentData.fatherName || 'N/A'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Phone:</Text>
            <Text style={styles.detailValue}>{studentData.phone || 'N/A'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Address:</Text>
            <Text style={styles.detailValue}>{studentData.address || 'N/A'}</Text>
          </View>
        </View>

        {/* Fee Summary */}
        <View style={styles.feeSection}>
          <Text style={styles.sectionTitle}>Fee Summary</Text>
          
          <View style={styles.feeSummaryCard}>
            <View style={styles.feeRow}>
              <View style={styles.feeItem}>
                <Text style={styles.feeLabel}>Total Fee</Text>
                <Text style={styles.feeAmount}>{totalFee || 0}</Text>
              </View>
              
              <View style={styles.feeItem}>
                <Text style={styles.feeLabel}>Paid Fee</Text>
                <Text style={[styles.feeAmount, styles.paidAmount]}>{paidFee || 0}</Text>
              </View>
              
              <View style={styles.feeItem}>
                <Text style={styles.feeLabel}>Remaining</Text>
                <Text style={[styles.feeAmount, styles.remainingAmount]}>{remainingFee}</Text>
              </View>
            </View>
            
            <View style={styles.monthlySummary}>
              <View style={styles.monthlySummaryRow}>
                <Text style={styles.monthlySummaryLabel}>Paid Months:</Text>
                <Text style={[styles.monthlySummaryValue, styles.paidMonths]}>
                  {getPaidMonthsCount()}
                </Text>
              </View>
              
              <View style={styles.monthlySummaryRow}>
                <Text style={styles.monthlySummaryLabel}>Pending Months:</Text>
                <Text style={[styles.monthlySummaryValue, styles.pendingMonths]}>
                  {getPendingMonthsCount()}
                </Text>
              </View>
              
              {/* <View style={styles.monthlySummaryRow}>
                <Text style={styles.monthlySummaryLabel}>Monthly Paid:</Text>
                <Text style={[styles.monthlySummaryValue, styles.monthlyPaid]}>
                  {calculateMonthlyTotal()}
                </Text>
              </View> */}
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Admission Date:</Text>
              <Text style={styles.detailValue}>{admissionDate || 'Not set'}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Last Payment:</Text>
              <Text style={styles.detailValue}>{paymentDate || 'No payment yet'}</Text>
            </View>
          </View>
        </View>

        {/* Monthly Fee Schedule */}
        <View style={styles.scheduleSection}>
          <Text style={styles.sectionTitle}>Monthly Fee Schedule</Text>
          
          <FlatList
            data={monthlySchedule}
            renderItem={renderMonthItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
          
          <View style={styles.scheduleSummary}>
            <Text style={styles.scheduleSummaryText}>
              Paid: {getPaidMonthsCount()}/12 months
            </Text>
            {/* <Text style={styles.scheduleSummaryText}>
              Total: {calculateMonthlyTotal()}
            </Text> */}
          </View>
        </View>

        {/* Manage Fee Button */}
        <TouchableOpacity
          style={styles.manageFeeButton}
          onPress={() => setFeeModalVisible(true)}
        >
          <Text style={styles.manageFeeButtonText}>Manage Fee</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Fee Management Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={feeModalVisible}
        onRequestClose={() => setFeeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Manage Fee for {studentData.name}</Text>
              
              <Text style={styles.inputLabel}>Admission Date *</Text>
              <TextInput
                style={styles.input}
                placeholder="DD-MM-YYYY"
                value={admissionDate}
                onChangeText={setAdmissionDate}
                placeholderTextColor="#999"
              />

              <Text style={styles.inputLabel}>Annual Fee *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter total fee amount"
                value={totalFee}
                onChangeText={setTotalFee}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />

              <Text style={styles.inputLabel}>Paid Fee *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter paid fee amount"
                value={paidFee}
                onChangeText={setPaidFee}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />

              <Text style={styles.inputLabel}>Payment Date</Text>
              <TextInput
                style={styles.input}
                placeholder="DD-MM-YYYY"
                value={paymentDate}
                onChangeText={setPaymentDate}
                placeholderTextColor="#999"
              />

              {/* Monthly Schedule in Modal */}
              <View style={styles.modalScheduleSection}>
                <Text style={styles.modalSectionTitle}>Monthly Fee Schedule</Text>
                
                <View style={styles.monthGrid}>
                  {monthlySchedule.map((month) => (
                    <TouchableOpacity
                      key={month.id}
                      style={[styles.monthChip, month.paid && styles.monthChipPaid]}
                      onPress={() => toggleMonthPayment(month.id)}
                    >
                      <Text style={[styles.monthChipText, month.paid && styles.monthChipTextPaid]}>
                        {month.month.substring(0, 3)}
                      </Text>
                      {month.paid && <Text style={styles.monthCheck}>✓</Text>}
                    </TouchableOpacity>
                  ))}
                </View>
                
                <View style={styles.monthSummary}>
                  <Text style={styles.monthSummaryText}>
                    Paid Months: {getPaidMonthsCount()} / 12
                  </Text>
                  {/* <Text style={styles.monthSummaryText}>
                    Monthly Total: {calculateMonthlyTotal()}
                  </Text> */}
                </View>
              </View>

              <View style={styles.feePreview}>
                <Text style={styles.previewTitle}>Fee Preview</Text>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Total Fee:</Text>
                  <Text style={styles.previewValue}>{totalFee || 0}</Text>
                </View>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Paid Fee:</Text>
                  <Text style={styles.previewValue}>{paidFee || 0}</Text>
                </View>
                {/* <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Monthly Paid:</Text>
                  <Text style={styles.previewValue}>{calculateMonthlyTotal()}</Text>
                </View> */}
                {/* <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Total Paid:</Text>
                  <Text style={[styles.previewValue, styles.previewPaid]}>
                    {parseInt(paidFee || 0) + calculateMonthlyTotal()}
                  </Text>
                </View> */}
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Remaining Fee:</Text>
                  <Text style={[styles.previewValue, styles.previewRemaining]}>
                    {calculateRemainingFee()}
                  </Text>
                </View>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setFeeModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={saveFeeDetails}
                >
                  <Text style={styles.saveButtonText}>Save Fee</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  profileImageContainer: {
    marginBottom: 15,
  },
  profileImage: {
    width: 200,
    height: 200,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  placeholderProfileImage: {
    width: 200,
    height: 200,
    borderRadius: 50,
    backgroundColor: '#F5F5F5',
    borderWidth: 3,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  studentName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  studentClass: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  rollNumber: {
    fontSize: 14,
    color: '#888',
    marginBottom: 15,
  },
  statusBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  detailsSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#555',
    width: 120,
  },
  detailValue: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  feeSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginTop: 10,
  },
  feeSummaryCard: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  feeItem: {
    alignItems: 'center',
    flex: 1,
  },
  feeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  feeAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  paidAmount: {
    color: '#4CAF50',
  },
  remainingAmount: {
    color: '#F44336',
  },
  monthlySummary: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  monthlySummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  monthlySummaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  monthlySummaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  paidMonths: {
    color: '#4CAF50',
  },
  pendingMonths: {
    color: '#F44336',
  },
  monthlyPaid: {
    color: '#2196F3',
  },
  manageFeeButton: {
    backgroundColor: '#2196F3',
    margin: 20,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  manageFeeButtonText: {
    color: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
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
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
  },
  feePreview: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 10,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  previewLabel: {
    fontSize: 14,
    color: '#555',
  },
  previewValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  previewRemaining: {
    color: '#F44336',
  },
  previewPaid: {
    color: '#4CAF50',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#2196F3',
    marginLeft: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // New styles for monthly schedule
  scheduleSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginTop: 10,
  },
  monthItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#DDD',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  monthText: {
    fontSize: 16,
    color: '#333',
  },
  paidMonthText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  monthDetails: {
    alignItems: 'flex-end',
  },
  dueDate: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  paidStatus: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  pendingStatus: {
    fontSize: 14,
    color: '#F44336',
    fontWeight: '600',
  },
  scheduleSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  scheduleSummaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  modalScheduleSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  monthChip: {
    width: '22%',
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'center',
  },
  monthChipPaid: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  monthChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  monthChipTextPaid: {
    color: '#FFFFFF',
  },
  monthCheck: {
    position: 'absolute',
    top: 2,
    right: 2,
    fontSize: 10,
    color: '#FFFFFF',
  },
  monthSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#DDD',
  },
  monthSummaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});

export default CheckFeeScreen;