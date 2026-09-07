import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { enquiriesService } from '../services/enquiries';
import { Enquiry, EnquiryStatus } from '../types';
import { AppHeader } from '../components/AppHeader';
import { colors, spacing, borderRadius } from '../theme/colors';
import { Phone, Mail, MapPin, Building, Package, Trash2, CheckCircle2 } from 'lucide-react-native';

const ALL_STATUSES: EnquiryStatus[] = ['NEW', 'CONTACTED', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED'];

export const EnquiryDetailScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const initialEnquiry: Enquiry = route.params.enquiry;
  const [enquiry, setEnquiry] = useState<Enquiry>(initialEnquiry);
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus: EnquiryStatus) => {
    if (newStatus === enquiry.status) return;

    setUpdating(true);
    try {
      const updated = await enquiriesService.updateStatus(enquiry.id, newStatus);
      setEnquiry(updated);
    } catch (err: any) {
      Alert.alert('Status Error', err?.message || 'Failed to update enquiry status.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirm Deletion',
      `Delete enquiry from "${enquiry.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await enquiriesService.deleteEnquiry(enquiry.id);
              navigation.goBack();
            } catch (err: any) {
              Alert.alert('Delete Error', err?.message || 'Failed to delete enquiry.');
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Lead Details"
        subtitle={enquiry.name}
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            style={styles.deleteHeaderButton}
            onPress={handleDelete}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Trash2 color={colors.dangerLight} size={18} />
          </TouchableOpacity>
        }
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
            { paddingBottom: Math.max(insets.bottom + 40, 48) },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Info Card */}
          <View style={styles.card}>
            <View style={styles.nameRow}>
              <Text style={styles.customerName}>{enquiry.name}</Text>
              <View style={[styles.badge, enquiry.status === 'NEW' ? styles.badgeNew : styles.badgeDefault]}>
                <Text style={[styles.badgeText, enquiry.status === 'NEW' ? styles.badgeTextNew : styles.badgeTextDefault]}>
                  {enquiry.status}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.detailRow}
              onPress={() => Linking.openURL(`tel:${enquiry.phone}`)}
              activeOpacity={0.7}
            >
              <Phone color={colors.emerald} size={16} />
              <Text style={[styles.detailValue, { color: colors.emerald }]}>
                {enquiry.phone}
              </Text>
            </TouchableOpacity>

            {!!enquiry.email && (
              <TouchableOpacity
                style={styles.detailRow}
                onPress={() => Linking.openURL(`mailto:${enquiry.email}`)}
                activeOpacity={0.7}
              >
                <Mail color={colors.textSecondary} size={16} />
                <Text style={styles.detailValue}>{enquiry.email}</Text>
              </TouchableOpacity>
            )}

            {!!enquiry.city && (
              <View style={styles.detailRow}>
                <MapPin color={colors.textSecondary} size={16} />
                <Text style={styles.detailValue}>{enquiry.city}</Text>
              </View>
            )}

            {!!enquiry.companyName && (
              <View style={styles.detailRow}>
                <Building color={colors.textSecondary} size={16} />
                <Text style={styles.detailValue}>
                  {enquiry.companyName} {enquiry.businessType ? `(${enquiry.businessType})` : ''}
                </Text>
              </View>
            )}
          </View>

          {/* Product Requirement */}
          {(!!enquiry.product || !!enquiry.quantity) && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Product Interest</Text>
              <View style={styles.detailRow}>
                <Package color={colors.gold} size={16} />
                <Text style={[styles.detailValue, { color: colors.gold, fontWeight: '700' }]}>
                  {enquiry.product || 'General Requirement'}
                </Text>
              </View>
              {!!enquiry.quantity && (
                <Text style={styles.quantityText}>Estimated Quantity: {enquiry.quantity}</Text>
              )}
            </View>
          )}

          {/* Customer Message */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Message / Notes</Text>
            <Text style={styles.messageText}>{enquiry.message}</Text>
          </View>

          {/* Status Update Card */}
          <View style={styles.card}>
            <View style={styles.statusHeaderRow}>
              <Text style={styles.sectionTitle}>Update Status</Text>
              {updating && <ActivityIndicator size="small" color={colors.emerald} />}
            </View>

            <View style={styles.statusOptionsContainer}>
              {ALL_STATUSES.map((st) => {
                const isSelected = enquiry.status === st;
                return (
                  <TouchableOpacity
                    key={st}
                    style={[styles.statusOption, isSelected && styles.statusOptionActive]}
                    onPress={() => handleStatusChange(st)}
                    disabled={updating}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.statusOptionText, isSelected && styles.statusOptionTextActive]}>
                      {st}
                    </Text>
                    {isSelected && <CheckCircle2 color={colors.emerald} size={14} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
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
  deleteHeaderButton: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.dangerSubtle,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
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
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customerName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  badgeNew: {
    backgroundColor: colors.emeraldSubtle,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  badgeDefault: {
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  badgeTextNew: {
    color: colors.emerald,
  },
  badgeTextDefault: {
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  detailValue: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  quantityText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
  },
  messageText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  statusHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statusOptionsContainer: {
    gap: spacing.sm,
  },
  statusOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusOptionActive: {
    backgroundColor: colors.emeraldSubtle,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  statusOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  statusOptionTextActive: {
    color: colors.emerald,
    fontWeight: '700',
  },
});
