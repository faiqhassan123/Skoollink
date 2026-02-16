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

const CheckSalaryScreen = ({ navigation, route }) => {
  const { teacher } = route.params || {};
  
  // ALL HOOKS AT THE TOP - NO CONDITIONAL HOOKS
  const [salaryModalVisible, setSalaryModalVisible] = useState(false);
  const [teacherData, setTeacherData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Salary form states
  const [joiningDate, setJoiningDate] = useState('');
  const [designation, setDesignation] = useState('');
  const [basicSalary, setBasicSalary] = useState('');
  const [allowances, setAllowances] = useState('');
  const [deductions, setDeductions] = useState('');
  const [paidSalary, setPaidSalary] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [salaryStatus, setSalaryStatus] = useState('Pending');
  const [netSalary, setNetSalary] = useState(0);

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

  // Load teacher data from params - NO CONDITIONAL HOOKS INSIDE
  useEffect(() => {
    const initializeData = async () => {
      if (teacher) {
        setTeacherData(teacher);
        await loadSalaryData(teacher.id);
        setLoading(false);
      } else {
        Alert.alert('Error', 'Teacher data not found');
        navigation.goBack();
      }
    };
    
    initializeData();
  }, [teacher]);

  // Load salary data from AsyncStorage
  const loadSalaryData = async (teacherId) => {
    try {
      const salaryData = await AsyncStorage.getItem(`salary_${teacherId}`);
      if (salaryData) {
        const parsedData = JSON.parse(salaryData);
        setJoiningDate(parsedData.joiningDate || '');
        setDesignation(parsedData.designation || '');
        setBasicSalary(parsedData.basicSalary ? parsedData.basicSalary.toString() : '');
        setAllowances(parsedData.allowances ? parsedData.allowances.toString() : '');
        setDeductions(parsedData.deductions ? parsedData.deductions.toString() : '');
        setPaidSalary(parsedData.paidSalary ? parsedData.paidSalary.toString() : '');
        setPaymentDate(parsedData.paymentDate || '');
        setSalaryStatus(parsedData.salaryStatus || 'Pending');
        
        // Load monthly schedule if exists
        if (parsedData.monthlySchedule && Array.isArray(parsedData.monthlySchedule)) {
          setMonthlySchedule(parsedData.monthlySchedule);
        }
        
        const basic = parseInt(parsedData.basicSalary || 0);
        const allowance = parseInt(parsedData.allowances || 0);
        const deduction = parseInt(parsedData.deductions || 0);
        setNetSalary(basic + allowance - deduction);
      }
    } catch (error) {
      console.log('Error loading salary data:', error);
    }
  };

  // Toggle month payment status
  const toggleMonthPayment = (monthId) => {
    setMonthlySchedule(prev => prev.map(month => {
      if (month.id === monthId) {
        const updatedMonth = { ...month, paid: !month.paid };
        
        // Update month amount based on net salary
        const net = calculateNetSalary();
        if (net > 0) {
          updatedMonth.amount = Math.round(net / 12);
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

  // Calculate net salary
  const calculateNetSalary = () => {
    const basic = parseInt(basicSalary) || 0;
    const allowance = parseInt(allowances) || 0;
    const deduction = parseInt(deductions) || 0;
    return basic + allowance - deduction;
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

  // Calculate remaining salary
  const calculateRemainingSalary = () => {
    const net = calculateNetSalary();
    const paid = parseInt(paidSalary) || 0;
    // const monthlyPaid = calculateMonthlyTotal();
    return net - (paid);
  };

  // Get paid months count
  const getPaidMonthsCount = () => {
    return monthlySchedule.filter(month => month.paid).length;
  };

  // Get pending months count
  const getPendingMonthsCount = () => {
    return monthlySchedule.filter(month => !month.paid).length;
  };

  // Save salary details
  const saveSalaryDetails = async () => {
    if (!teacherData) return;

    if (!joiningDate.trim()) {
      Alert.alert('Error', 'Please enter joining date');
      return;
    }
    
    if (!designation.trim()) {
      Alert.alert('Error', 'Please enter designation');
      return;
    }
    
    if (!basicSalary.trim()) {
      Alert.alert('Error', 'Please enter basic salary');
      return;
    }

    const basic = parseInt(basicSalary);
    const allowance = parseInt(allowances || 0);
    const deduction = parseInt(deductions || 0);
    const paid = parseInt(paidSalary || 0);
    // const monthlyPaid = calculateMonthlyTotal();
    const totalPaid = paid;
    
    if (isNaN(basic) || basic <= 0) {
      Alert.alert('Error', 'Please enter valid basic salary');
      return;
    }
    
    if (isNaN(allowance) || allowance < 0) {
      Alert.alert('Error', 'Please enter valid allowances');
      return;
    }
    
    if (isNaN(deduction) || deduction < 0) {
      Alert.alert('Error', 'Please enter valid deductions');
      return;
    }
    
    if (isNaN(paid) || paid < 0) {
      Alert.alert('Error', 'Please enter valid paid salary');
      return;
    }

    const net = basic + allowance - deduction;
    
    if (totalPaid > net) {
      Alert.alert('Error', 'Total paid salary cannot be greater than net salary');
      return;
    }

    const remaining = net - totalPaid;
    const status = totalPaid === 0 ? 'Pending' : totalPaid === net ? 'Paid' : 'Partial';

    try {
      const salaryData = {
        teacherId: teacherData.id,
        joiningDate: joiningDate.trim(),
        designation: designation.trim(),
        basicSalary: basic,
        allowances: allowance,
        deductions: deduction,
        netSalary: net,
        paidSalary: paid,
        // monthlyPaidSalary: monthlyPaid,
        remainingSalary: remaining,
        salaryStatus: status,
        paymentDate: paymentDate.trim() || new Date().toISOString().split('T')[0],
        monthlySchedule: monthlySchedule,
        paidMonths: getPaidMonthsCount(),
        pendingMonths: getPendingMonthsCount(),
        lastUpdated: new Date().toISOString(),
      };

      await AsyncStorage.setItem(`salary_${teacherData.id}`, JSON.stringify(salaryData));
      
      setNetSalary(net);
      setSalaryStatus(status);
      setSalaryModalVisible(false);
      
      Alert.alert('Success', 'Salary details saved successfully!');
    } catch (error) {
      console.log('Error saving salary data:', error);
      Alert.alert('Error', 'Failed to save salary details');
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

  // Show loading state - THIS IS AT THE END, NO HOOKS AFTER IT
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContainer}>
          <Text>Loading teacher data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state if no teacher data
  if (!teacherData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContainer}>
          <Text>No teacher data found</Text>
        </View>
      </SafeAreaView>
    );
  }

  // MAIN RETURN - ALL HOOKS ARE ABOVE THIS LINE
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
        <Text style={styles.headerTitle}>Salary Details</Text>
        <View style={{width: 24}} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Teacher Profile Section */}
        <View style={styles.profileSection}>
         <View style={styles.profileImageContainer}>
            {teacherData.image ? (
              <Image source={{ uri: teacherData.image }} style={styles.profileImage} />
            ) : (
              <View style={styles.placeholderProfileImage}>
                <Image source={require('./Icons/user.png')} style={{height:50,width:50,justifyContent:'center',alignItems:'center'}} />
              </View>
            )}
          </View>
          
          <Text style={styles.teacherName}>{teacherData.name}</Text>
          <Text style={styles.teacherDesignation}>
            {designation ? designation : 'Designation not set'}
          </Text>
          {teacherData.subject && (
            <Text style={styles.teacherSubject}>Subject: {teacherData.subject}</Text>
          )}
          
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(salaryStatus) }]}>
            <Text style={styles.statusText}>{salaryStatus}</Text>
          </View>
        </View>

        {/* Teacher Details */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Teacher Information</Text>
          
          {teacherData.email && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Email:</Text>
              <Text style={styles.detailValue}>{teacherData.email}</Text>
            </View>
          )}
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Phone:</Text>
            <Text style={styles.detailValue}>{teacherData.phone || 'Not provided'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Address:</Text>
            <Text style={styles.detailValue}>{teacherData.address || 'Not provided'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Joining Date:</Text>
            <Text style={styles.detailValue}>{joiningDate || 'Not set'}</Text>
          </View>
        </View>

        {/* Salary Summary */}
        <View style={styles.salarySection}>
          <Text style={styles.sectionTitle}>Salary Summary</Text>
          
          <View style={styles.salarySummaryCard}>
            <View style={styles.salaryBreakdown}>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Basic Salary:</Text>
                <Text style={styles.breakdownValue}>{basicSalary || 0}</Text>
              </View>
              
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Allowances:</Text>
                <Text style={[styles.breakdownValue, styles.allowanceValue]}>
                  +{allowances || 0}
                </Text>
              </View>
              
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Deductions:</Text>
                <Text style={[styles.breakdownValue, styles.deductionValue]}>
                  -{deductions || 0}
                </Text>
              </View>
              
              <View style={[styles.breakdownRow, styles.netSalaryRow]}>
                <Text style={styles.netSalaryLabel}>Net Salary:</Text>
                <Text style={styles.netSalaryValue}>{netSalary}</Text>
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
            
            <View style={styles.salaryRow}>
              <View style={styles.salaryItem}>
                <Text style={styles.salaryLabel}>Paid Salary</Text>
                <Text style={[styles.salaryAmount, styles.paidAmount]}>
                  {paidSalary || 0}
                </Text>
              </View>
              
              <View style={styles.salaryItem}>
                <Text style={styles.salaryLabel}>Remaining</Text>
                <Text style={[styles.salaryAmount, styles.remainingAmount]}>
                  {calculateRemainingSalary()}
                </Text>
              </View>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Last Payment:</Text>
              <Text style={styles.detailValue}>{paymentDate || 'No payment yet'}</Text>
            </View>
          </View>
        </View>

        {/* Monthly Salary Schedule */}
        <View style={styles.scheduleSection}>
          <Text style={styles.sectionTitle}>Monthly Salary Schedule</Text>
          
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

        {/* Manage Salary Button */}
        <TouchableOpacity
          style={styles.manageSalaryButton}
          onPress={() => setSalaryModalVisible(true)}
        >
          <Text style={styles.manageSalaryButtonText}>Manage Salary</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Salary Management Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={salaryModalVisible}
        onRequestClose={() => setSalaryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Manage Salary for {teacherData.name}</Text>
              
              <Text style={styles.inputLabel}>Joining Date *</Text>
              <TextInput
                style={styles.input}
                placeholder="DD-MM-YYYY"
                value={joiningDate}
                onChangeText={setJoiningDate}
                placeholderTextColor="#999"
              />

              <Text style={styles.inputLabel}>Designation *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Senior Teacher, Professor"
                value={designation}
                onChangeText={setDesignation}
                placeholderTextColor="#999"
              />

              <Text style={styles.inputLabel}>Basic Salary *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter basic salary"
                value={basicSalary}
                onChangeText={setBasicSalary}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />

              <Text style={styles.inputLabel}>Allowances</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter allowances"
                value={allowances}
                onChangeText={setAllowances}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />

              <Text style={styles.inputLabel}>Deductions</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter deductions"
                value={deductions}
                onChangeText={setDeductions}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />

              <Text style={styles.inputLabel}>Paid Salary *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter paid salary"
                value={paidSalary}
                onChangeText={setPaidSalary}
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
                <Text style={styles.modalSectionTitle}>Monthly Salary Schedule</Text>
                
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

              <View style={styles.salaryPreview}>
                <Text style={styles.previewTitle}>Salary Preview</Text>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Basic Salary:</Text>
                  <Text style={styles.previewValue}>{basicSalary || 0}</Text>
                </View>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Allowances:</Text>
                  <Text style={[styles.previewValue, styles.allowancePreview]}>
                    +{allowances || 0}
                  </Text>
                </View>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Deductions:</Text>
                  <Text style={[styles.previewValue, styles.deductionPreview]}>
                    -{deductions || 0}
                  </Text>
                </View>
                <View style={[styles.previewRow, styles.netPreviewRow]}>
                  <Text style={styles.netPreviewLabel}>Net Salary:</Text>
                  <Text style={styles.netPreviewValue}>{calculateNetSalary()}</Text>
                </View>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Paid Salary:</Text>
                  <Text style={styles.previewValue}>{paidSalary || 0}</Text>
                </View>
                {/* <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Monthly Paid:</Text>
                  <Text style={styles.previewValue}>{calculateMonthlyTotal()}</Text>
                </View> */}
                {/* <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Total Paid:</Text>
                  <Text style={[styles.previewValue, styles.totalPaidPreview]}>
                    {parseInt(paidSalary || 0) + calculateMonthlyTotal()}
                  </Text>
                </View> */}
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Remaining:</Text>
                  <Text style={[styles.previewValue, styles.remainingPreview]}>
                    {calculateRemainingSalary()}
                  </Text>
                </View>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setSalaryModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={saveSalaryDetails}
                >
                  <Text style={styles.saveButtonText}>Save Salary</Text>
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
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F5F5F5',
    borderWidth: 3,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  teacherName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  teacherDesignation: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
    marginBottom: 5,
  },
  teacherSubject: {
    fontSize: 14,
    color: '#666',
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
  salarySection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginTop: 10,
  },
  salarySummaryCard: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  salaryBreakdown: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#555',
  },
  breakdownValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  allowanceValue: {
    color: '#4CAF50',
  },
  deductionValue: {
    color: '#F44336',
  },
  netSalaryRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  netSalaryLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  netSalaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
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
  salaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  salaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  salaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  salaryAmount: {
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
  manageSalaryButton: {
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
  manageSalaryButtonText: {
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
  salaryPreview: {
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
  allowancePreview: {
    color: '#4CAF50',
  },
  deductionPreview: {
    color: '#F44336',
  },
  netPreviewRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  netPreviewLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  netPreviewValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  totalPaidPreview: {
    color: '#4CAF50',
  },
  remainingPreview: {
    color: '#F44336',
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

export default CheckSalaryScreen;