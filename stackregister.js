import React, { useState,useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  FlatList,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const StackRegister = () => {
  const STORAGE_KEY = '@furniture_inventory';

  const [furnitureItems, setFurnitureItems] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'Tables',
    count: '',
    status: 'Available',
    icon: 'table',
    color: '#4CAF50',
  });

const loadFurnitureData = async () => {
  try {
    console.log('Loading data from storage...');
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    console.log('Loaded data:', jsonValue);
    
    if (jsonValue !== null) {
      const savedData = JSON.parse(jsonValue);
      console.log('Parsed data:', savedData);
      setFurnitureItems(savedData);
    } else {
      console.log('No data found in storage');
    }
  } catch (error) {
    console.error('Error loading data:', error);
    Alert.alert('Error', 'Failed to load saved data');
  }
};
    // Load data on component mount
  useEffect(() => {
    loadFurnitureData();
  }, []);

const saveFurnitureData = async () => {
  try {
    console.log('Saving data to storage...', furnitureItems);
    const jsonValue = JSON.stringify(furnitureItems);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    console.log('Data saved successfully');
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

  // Save data when furnitureItems changes
  useEffect(() => {
    saveFurnitureData();
  }, [furnitureItems]);

  // Categories
  const categories = ['Tables', 'Chairs','Bench','Desk', 'Teaching Aids', 'Electronics', 'Storage', 'Other'];
  
  // Status options
  const statusOptions = ['Available', 'In Use', 'Maintenance', 'Damaged', 'Missing'];
  
  // Calculate totals
  const totalItems = furnitureItems.reduce((sum, item) => sum + item.count, 0);
  const availableItems = furnitureItems
    .filter(item => item.status === 'Available')
    .reduce((sum, item) => sum + item.count, 0);

  // Add new item
  const handleAddNew = () => {
    setEditMode(false);
    setSelectedItem(null);
    setNewItem({
      name: '',
      category: 'Tables',
      count: '',
      status: 'Available',
      icon: 'table',
      color: '#4CAF50',
    });
    setModalVisible(true);
  };

  // Edit item
  const handleEditItem = (item) => {
    setEditMode(true);
    setSelectedItem(item);
    setNewItem({
      name: item.name,
      category: item.category,
      count: item.count.toString(),
      status: item.status,
      icon: item.icon,
      color: item.color,
    });
    setModalVisible(true);
  };

  // Save item
  const handleSaveItem = () => {
    const name = newItem.name.trim();
    const count = parseInt(newItem.count);

    if (!name) {
      Alert.alert('Error', 'Please enter item name');
      return;
    }

    if (isNaN(count) || count < 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    if (editMode && selectedItem) {
      // Update item
      setFurnitureItems(prev => prev.map(item =>
        item.id === selectedItem.id
          ? {
              ...item,
              name: name,
              category: newItem.category,
              count: count,
              status: newItem.status,
              icon: newItem.icon,
              color: newItem.color,
              lastUpdated: new Date().toISOString().split('T')[0],
            }
          : item
      ));
      Alert.alert('Success', 'Item updated successfully');
    } else {
      // Add new item
      const newId = Date.now().toString();
      const newFurnitureItem = {
        id: newId,
        name: name,
        category: newItem.category,
        count: count,
        status: newItem.status,
        icon: newItem.icon,
        color: newItem.color,
        lastUpdated: new Date().toISOString().split('T')[0],
      };
      setFurnitureItems(prev => [...prev, newFurnitureItem]);
      Alert.alert('Success', 'Item added successfully');
    }
    
    setModalVisible(false);
  };

  // Delete item
  const handleDeleteItem = (id) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setFurnitureItems(prev => prev.filter(item => item.id !== id));
          },
        },
      ]
    );
  };

  // Increase count
  const handleIncreaseCount = (id) => {
    setFurnitureItems(prev => prev.map(item =>
      item.id === id
        ? {
            ...item,
            count: item.count + 1,
            lastUpdated: new Date().toISOString().split('T')[0],
          }
        : item
    ));
  };

  // Decrease count
  const handleDecreaseCount = (id) => {
    setFurnitureItems(prev => prev.map(item =>
      item.id === id && item.count > 0
        ? {
            ...item,
            count: item.count - 1,
            lastUpdated: new Date().toISOString().split('T')[0],
          }
        : item
    ));
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return '#4CAF50';
      case 'In Use': return '#2196F3';
      case 'Maintenance': return '#FF9800';
      case 'Damaged': return '#FF5722';
      case 'Missing': return '#9E9E9E';
      default: return '#9E9E9E';
    }
  };

  // Render furniture item
  const renderFurnitureItem = ({ item }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <View style={styles.categoryRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status}
            </Text>
          </View>
        </View>
        <Text style={styles.lastUpdated}>Updated: {item.lastUpdated}</Text>
      </View>
      
      <View style={styles.countContainer}>
        <TouchableOpacity
          style={styles.countButton}
          onPress={() => handleDecreaseCount(item.id)}
          activeOpacity={0.7}>
          <Image source={require("./Icons/plus 2.png")} style={{height:12,width:12}}></Image>
          {/* <Icon name="remove" size={20} color="#FF5252" /> */}
        </TouchableOpacity>
        
        <View style={styles.countDisplay}>
          <Text style={styles.countText}>{item.count}</Text>
          <Text style={styles.countLabel}>units</Text>
        </View>
        
        <TouchableOpacity
          style={styles.countButton}
          onPress={() => handleIncreaseCount(item.id)}
          activeOpacity={0.7}>
          <Image source={require("./Icons/minus.png")} style={{height:12,width:12}}></Image>
          {/* <Icon name="add" size={20} color="#4CAF50" /> */}
        </TouchableOpacity>
      </View>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEditItem(item)}
          activeOpacity={0.7}>
          <Image source={require("./Icons/recycling-symbol.png")} style={{height:20,width:20}}></Image>
          {/* <Icon name="edit" size={20} color="#2196F3" /> */}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteItem(item.id)}
          activeOpacity={0.7}>
          <Image source={require("./Icons/bin.png")} style={{height:20,width:20}}></Image>
          {/* <Icon name="delete" size={20} color="#FF5252" /> */}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar backgroundColor="#2b2b2bff" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Furniture Inventory</Text>
        <Text style={styles.headerSubtitle}>Manage School Assets</Text>
      </View>

      {/* Add Button */}
      <TouchableOpacity 
        style={styles.addButton} 
        onPress={handleAddNew}
        activeOpacity={0.8}>
        {/* <Icon name="add" size={24} color="#FFF" /> */}
        <Text style={styles.addButtonText}>Add New Item</Text>
      </TouchableOpacity>
      
      {/* Furniture List */}
      <FlatList
        data={furnitureItems}
        renderItem={renderFurnitureItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {/* <Icon name="inventory" size={60} color="#E0E0E0" /> */}
            <Text style={styles.emptyText}>No furniture items found</Text>
            <Text style={styles.emptySubtext}>Tap "Add New Item" to get started</Text>
          </View>
        }
      />
      
      {/* Add/Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editMode ? 'Edit Item' : 'Add New Item'}
              </Text>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                activeOpacity={0.7}>
                {/* <Icon name="close" size={24} color="#666" /> */}
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}>
              
              {/* Item Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Item Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Teacher Table, White Board"
                  placeholderTextColor="#999"
                  value={newItem.name}
                  onChangeText={(text) => setNewItem({...newItem, name: text})}
                />
              </View>
              
              {/* Category */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Category</Text>
                <View style={styles.categorySelection}>
                  {categories.map((category, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.categoryOption,
                        newItem.category === category && styles.selectedCategory,
                      ]}
                      onPress={() => setNewItem({...newItem, category})}
                      activeOpacity={0.7}>
                      <Text style={[
                        styles.categoryOptionText,
                        newItem.category === category && styles.selectedCategoryText,
                      ]}>
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              {/* Quantity */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Quantity *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter quantity"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  value={newItem.count}
                  onChangeText={(text) => setNewItem({...newItem, count: text.replace(/[^0-9]/g, '')})}
                />
              </View>
              
              {/* Status */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Status</Text>
                <View style={styles.statusSelection}>
                  {statusOptions.map((status, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.statusOption,
                        newItem.status === status && { 
                          backgroundColor: `${getStatusColor(status)}20`,
                          borderColor: getStatusColor(status),
                        },
                      ]}
                      onPress={() => setNewItem({...newItem, status})}
                      activeOpacity={0.7}>
                      <View style={[styles.statusOptionDot, { backgroundColor: getStatusColor(status) }]} />
                      <Text style={[
                        styles.statusOptionText,
                        newItem.status === status && { color: getStatusColor(status) },
                      ]}>
                        {status}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>
            
            {/* Modal Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.7}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveItem}
                activeOpacity={0.7}>
                <Text style={styles.saveButtonText}>
                  {editMode ? 'Update' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#3498dbff',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E8F5E9',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    marginTop: -30,
  },
  statCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    width: '30%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#3498dbff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop: 10,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  itemCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  categoryRow: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 5,
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  lastUpdated: {
    fontSize: 11,
    color: '#999',
  },
  countContainer: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  countButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 10,
  },
  countDisplay: {
    alignItems: 'center',
    marginVertical: 5,
    marginRight: 10,
  },
  countText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  countLabel: {
    fontSize: 10,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'column',
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#45b2ffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
    marginBottom: 15,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ff4c67ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 20,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#BBB',
    marginTop: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
    color: '#333',
  },
  categorySelection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedCategory: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  categoryOptionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#FFF',
  },
  statusSelection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  statusOptionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusOptionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  iconSelection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  iconOption: {
    width: '22%',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedIcon: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  iconOptionText: {
    fontSize: 10,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  selectedIconText: {
    color: '#FFF',
  },
  colorSelection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#333',
    borderWidth: 3,
    transform: [{ scale: 1.1 }],
  },
  modalButtons: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    padding: 15,
    backgroundColor: '#3498dbff',
    borderRadius: 8,
    marginLeft: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default StackRegister;