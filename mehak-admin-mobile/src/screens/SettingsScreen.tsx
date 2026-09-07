import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { settingsService } from '../services/settings';
import { useAuth } from '../context/AuthContext';
import { BusinessSettings } from '../types';
import { Settings, Save, LogOut, Building, Phone, Mail, MapPin, Shield } from 'lucide-react-native';

export const SettingsScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const [settings, setSettings] = useState<Partial<BusinessSettings>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      const data = await settingsService.getSettings();
      setSettings(data);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to fetch business settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await settingsService.updateSettings(settings);
      setSettings(updated);
      Alert.alert('Success', 'Website and business settings updated successfully!');
    } catch (err: any) {
      Alert.alert('Save Error', err?.message || 'Failed to update business settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoutConfirm = () => {
    Alert.alert('Confirm Sign Out', 'Are you sure you want to sign out of Mehak Mobile Admin?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingCenter}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {/* Top Title */}
      <View style={styles.topHeader}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Website & Business Configuration</Text>
      </View>

      {/* Account Info Card */}
      <View style={styles.card}>
        <View style={styles.accountRow}>
          <View style={styles.avatarContainer}>
            <Shield color="#10b981" size={24} />
          </View>
          <View>
            <Text style={styles.accountEmail}>{user?.email}</Text>
            <Text style={styles.accountRole}>System Administrator</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogoutConfirm} activeOpacity={0.8}>
          <LogOut color="#ef4444" size={16} />
          <Text style={styles.logoutButtonText}>Sign Out of Admin</Text>
        </TouchableOpacity>
      </View>

      {/* Business Identity */}
      <View style={styles.card}>
        <Text style={styles.cardSectionTitle}>Business Identity</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Legal Name</Text>
          <TextInput
            style={styles.input}
            value={settings.name || ''}
            onChangeText={(text) => setSettings({ ...settings, name: text })}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Brand Name</Text>
          <TextInput
            style={styles.input}
            value={settings.brand || ''}
            onChangeText={(text) => setSettings({ ...settings, brand: text })}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Tagline</Text>
          <TextInput
            style={styles.input}
            value={settings.tagline || ''}
            onChangeText={(text) => setSettings({ ...settings, tagline: text })}
          />
        </View>
      </View>

      {/* Contact Channels */}
      <View style={styles.card}>
        <Text style={styles.cardSectionTitle}>Contact Channels</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Primary Phone</Text>
          <TextInput
            style={styles.input}
            keyboardType="phone-pad"
            value={settings.phonePrimary || ''}
            onChangeText={(text) => setSettings({ ...settings, phonePrimary: text })}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>WhatsApp Number</Text>
          <TextInput
            style={styles.input}
            keyboardType="phone-pad"
            value={settings.whatsapp || ''}
            onChangeText={(text) => setSettings({ ...settings, whatsapp: text })}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Official Business Email</Text>
          <TextInput
            style={styles.input}
            keyboardType="email-address"
            value={settings.email || ''}
            onChangeText={(text) => setSettings({ ...settings, email: text })}
          />
        </View>
      </View>

      {/* Address Details */}
      <View style={styles.card}>
        <Text style={styles.cardSectionTitle}>Physical Address & Location</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Address Line</Text>
          <TextInput
            style={styles.input}
            value={settings.address || ''}
            onChangeText={(text) => setSettings({ ...settings, address: text })}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>City</Text>
          <TextInput
            style={styles.input}
            value={settings.city || ''}
            onChangeText={(text) => setSettings({ ...settings, city: text })}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>State</Text>
          <TextInput
            style={styles.input}
            value={settings.state || ''}
            onChangeText={(text) => setSettings({ ...settings, state: text })}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Pincode</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={settings.pincode || ''}
            onChangeText={(text) => setSettings({ ...settings, pincode: text })}
          />
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveButton, saving && styles.buttonDisabled]}
        onPress={handleSave}
        disabled={saving}
        activeOpacity={0.8}
      >
        {saving ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <>
            <Save color="#ffffff" size={18} />
            <Text style={styles.saveButtonText}>Save All Settings</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },
  loadingCenter: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topHeader: {
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  accountEmail: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  accountRole: {
    fontSize: 11,
    color: '#34d399',
    fontWeight: '600',
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  logoutButtonText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '800',
  },
  cardSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#10b981',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 14,
  },
  formGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#10b981',
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
