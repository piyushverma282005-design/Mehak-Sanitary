import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { ProductsScreen } from './src/screens/ProductsScreen';
import { AddEditProductScreen } from './src/screens/AddEditProductScreen';
import { CategoriesScreen } from './src/screens/CategoriesScreen';
import { EnquiriesScreen } from './src/screens/EnquiriesScreen';
import { EnquiryDetailScreen } from './src/screens/EnquiryDetailScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

import { LayoutDashboard, Package, FolderTree, Inbox, Settings } from 'lucide-react-native';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const ProductsStackNav = createStackNavigator();
const EnquiriesStackNav = createStackNavigator();

function ProductsStack() {
  return (
    <ProductsStackNav.Navigator screenOptions={{ headerShown: false }}>
      <ProductsStackNav.Screen name="ProductsList" component={ProductsScreen} />
      <ProductsStackNav.Screen name="AddEditProduct" component={AddEditProductScreen} />
    </ProductsStackNav.Navigator>
  );
}

function EnquiriesStack() {
  return (
    <EnquiriesStackNav.Navigator screenOptions={{ headerShown: false }}>
      <EnquiriesStackNav.Screen name="EnquiriesList" component={EnquiriesScreen} />
      <EnquiriesStackNav.Screen name="EnquiryDetail" component={EnquiryDetailScreen} />
    </EnquiriesStackNav.Navigator>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0f172a',
          borderTopColor: '#334155',
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#10b981',
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Products"
        component={ProductsStack}
        options={{
          tabBarLabel: 'Products',
          tabBarIcon: ({ color, size }) => <Package color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{
          tabBarLabel: 'Categories',
          tabBarIcon: ({ color, size }) => <FolderTree color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Enquiries"
        component={EnquiriesStack}
        options={{
          tabBarLabel: 'Leads',
          tabBarIcon: ({ color, size }) => <Inbox color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Authenticating Mehak Admin Mobile...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      {user ? <TabNavigator /> : <LoginScreen />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 12,
  },
});
