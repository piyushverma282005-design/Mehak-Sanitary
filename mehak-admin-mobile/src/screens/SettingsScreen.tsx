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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { settingsService } from '../services/settings';
import { useAuth } from '../context/AuthContext';
import { BusinessSettings } from '../types';
import { AppHeader } from '../components/AppHeader';
import { colors, spacing, borderRadius } from '../theme/colors';
import { Save, LogOut, Shield, Phone, Mail, MapPin } from 'lucide-react-native';

export const SettingsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
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
    Alert.alert('Sign Out', 'Are you sure you want to sign out of Mehak Mobile Admin?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Settings"
        subtitle="Account & Business Profile"
      />

      {loading ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={colors.emerald} />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: 80 + insets.bottom },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Account Card */}
          <View style={styles.card}>
            <View style={styles.accountRow}>
              <View style={styles.avatarContainer}>
                <Shield color={colors.emerald} size={20} />
              </View>
              <View style={styles.accountText}>
                <Text style={styles.accountEmail} numberOfLines={1}>
                  {user?.email}
                </Text>
                <Text style={styles.accountRole}>Administrator</Text>
              </View>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogoutConfirm}
                activeOpacity={0.7}
              >
                <LogOut color={colors.dangerLight} size={15} />
                <Text style={styles.logoutButtonText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Business Identity Card */}
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>Business Identity</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Legal Business Name</Text>
              <TextInput
                style={styles.input}
                value={settings.name || ''}
                placeholderTextColor={colors.textPlaceholder}
                onChangeText={(text) => setSettings({ ...settings, name: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Brand Name</Text>
              <TextInput
                style={styles.input}
                value={settings.brand || ''}
                placeholderTextColor={colors.textPlaceholder}
                onChangeText={(text) => setSettings({ ...settings, brand: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Tagline / Slogan</Text>
              <TextInput
                style={styles.input}
                value={settings.tagline || ''}
                placeholderTextColor={colors.textPlaceholder}
                onChangeText={(text) => setSettings({ ...settings, tagline: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Company Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={settings.description || ''}
                placeholderTextColor={colors.textPlaceholder}
                onChangeText={(text) => setSettings({ ...settings, description: text })}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Contact Numbers */}
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>Contact Channels</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Primary Phone (Sales)</Text>
              <TextInput
                style={styles.input}
                value={settings.phonePrimary || ''}
                placeholderTextColor={colors.textPlaceholder}
                keyboardType="phone-pad"
                onChangeText={(text) => setSettings({ ...settings, phonePrimary: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>WhatsApp Number</Text>
              <TextInput
                style={styles.input}
                value={settings.whatsapp || ''}
                placeholderTextColor={colors.textPlaceholder}
                keyboardType="phone-pad"
                onChangeText={(text) => setSettings({ ...settings, whatsapp: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Support Email</Text>
              <TextInput
                style={styles.input}
                value={settings.email || ''}
                placeholderTextColor={colors.textPlaceholder}
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={(text) => setSettings({ ...settings, email: text })}
              />
            </View>
          </View>

          {/* Address */}
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>Physical Address</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Street / Industrial Area</Text>
              <TextInput
                style={styles.input}
                value={settings.address || ''}
                placeholderTextColor={colors.textPlaceholder}
                onChangeText={(text) => setSettings({ ...settings, address: text })}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.formGroup, styles.halfCol]}>
                <Text style={styles.label}>City</Text>
                <TextInput
                  style={styles.input}
                  value={settings.city || ''}
                  placeholderTextColor={colors.textPlaceholder}
                  onChangeText={(text) => setSettings({ ...settings, city: text })}
                />
              </View>
              <View style={[styles.formGroup, styles.halfCol]}>
                <Text style={styles.label}>State</Text>
                <TextInput
                  style={styles.input}
                  value={settings.state || ''}
                  placeholderTextColor={colors.textPlaceholder}
                  onChangeText={(text) => setSettings({ ...settings, state: text })}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.formGroup, styles.halfCol]}>
                <Text style={styles.label}>PIN Code</Text>
                <TextInput
                  style={styles.input}
                  value={settings.pincode || ''}
                  placeholderTextColor={colors.textPlaceholder}
                  keyboardType="numeric"
                  onChangeText={(text) => setSettings({ ...settings, pincode: text })}
                />
              </View>
              <View style={[styles.formGroup, styles.halfCol]}>
                <Text style={styles.label}>Country</Text>
                <TextInput
                  style={styles.input}
                  value={settings.country || ''}
                  placeholderTextColor={colors.textPlaceholder}
                  onChangeText={(text) => setSettings({ ...settings, country: text })}
                />
              </View>
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
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <Save color="#ffffff" size={16} />
                <Text style={styles.saveButtonText}>Save Configuration</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  loadingCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.emeraldSubtle,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  accountText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  accountEmail: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  accountRole: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerSubtle,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  logoutButtonText: {
    color: colors.dangerLight,
    fontSize: 11,
    fontWeight: '600',
  },
  cardSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
    letterSpacing: -0.2,
  },
  formGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 42,
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '500',
  },
  textArea: {
    height: 70,
    paddingTop: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfCol: {
    flex: 1,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.emerald,
    height: 46,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
