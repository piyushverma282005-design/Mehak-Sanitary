import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { ProductsScreen } from './src/screens/ProductsScreen';
import { AddEditProductScreen } from './src/screens/AddEditProductScreen';
import { CategoriesScreen } from './src/screens/CategoriesScreen';
import { EnquiriesScreen } from './src/screens/EnquiriesScreen';
import { EnquiryDetailScreen } from './src/screens/EnquiryDetailScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { colors } from './src/theme/colors';

import { LayoutDashboard, Package, FolderTree, Inbox, Settings } from 'lucide-react-native';

const Tab = createBottomTabNavigator();
const ProductsStackNav = createStackNavigator();
const EnquiriesStackNav = createStackNavigator();

const DarkNavTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.card,
    text: colors.textPrimary,
    border: colors.border,
    primary: colors.emerald,
  },
};

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
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom > 0 ? insets.bottom : 8;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBarBg,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: 1,
          height: 54 + bottomInset,
          paddingBottom: bottomInset,
          paddingTop: 6,
          elevation: 0,
        },
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={20} />,
        }}
      />
      <Tab.Screen
        name="Products"
        component={ProductsStack}
        options={{
          tabBarLabel: 'Products',
          tabBarIcon: ({ color, size }) => <Package color={color} size={20} />,
        }}
      />
      <Tab.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{
          tabBarLabel: 'Categories',
          tabBarIcon: ({ color, size }) => <FolderTree color={color} size={20} />,
        }}
      />
      <Tab.Screen
        name="Enquiries"
        component={EnquiriesStack}
        options={{
          tabBarLabel: 'Leads',
          tabBarIcon: ({ color, size }) => <Inbox color={color} size={20} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings color={color} size={20} />,
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
        <ActivityIndicator size="large" color={colors.emerald} />
        <Text style={styles.loadingText}>Authenticating Mehak Admin Mobile...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer theme={DarkNavTheme}>
      <StatusBar style="light" />
      {user ? <TabNavigator /> : <LoginScreen />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 12,
  },
});
