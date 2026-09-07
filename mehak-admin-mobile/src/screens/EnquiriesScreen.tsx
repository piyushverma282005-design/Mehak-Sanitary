import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { enquiriesService } from '../services/enquiries';
import { Enquiry } from '../types';
import { AppHeader } from '../components/AppHeader';
import { colors, spacing, borderRadius } from '../theme/colors';
import { Inbox, Phone, Mail, ChevronRight, Clock } from 'lucide-react-native';

const STATUS_OPTIONS: Array<{ label: string; value: string }> = [
  { label: 'All Leads', value: 'all' },
  { label: 'New', value: 'NEW' },
  { label: 'Contacted', value: 'CONTACTED' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Archived', value: 'ARCHIVED' },
];

export const EnquiriesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEnquiries = async () => {
    try {
      const data = await enquiriesService.getEnquiries({ status: selectedStatus });
      setEnquiries(data);
    } catch (err: any) {
      console.error('Fetch enquiries error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [selectedStatus]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEnquiries();
  }, [selectedStatus]);

  const renderEnquiryItem = ({ item }: { item: Enquiry }) => {
    const isNew = item.status === 'NEW';
    const isContacted = item.status === 'CONTACTED';
    const isInProgress = item.status === 'IN_PROGRESS';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('EnquiryDetail', { enquiry: item })}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <View
            style={[
              styles.badge,
              isNew && styles.badgeNew,
              isContacted && styles.badgeContacted,
              isInProgress && styles.badgeProgress,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                isNew && styles.badgeTextNew,
                isContacted && styles.badgeTextContacted,
                isInProgress && styles.badgeTextProgress,
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.infoItem}>
            <Phone color={colors.textSecondary} size={13} />
            <Text style={styles.infoText}>{item.phone}</Text>
          </View>
          {!!item.city && (
            <Text style={styles.cityText}>• {item.city}</Text>
          )}
        </View>

        {!!item.product && (
          <Text style={styles.productTag}>Product: {item.product}</Text>
        )}

        <Text style={styles.message} numberOfLines={2}>
          "{item.message}"
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.dateRow}>
            <Clock color={colors.textMuted} size={12} />
            <Text style={styles.dateText}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <ChevronRight color={colors.textMuted} size={14} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Leads & Enquiries"
        subtitle={`${enquiries.length} received`}
      />

      {/* Status Filter Horizontal Pills */}
      <View style={styles.pillsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsScroll}
        >
          {STATUS_OPTIONS.map((opt) => {
            const active = selectedStatus === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[styles.pill, active && styles.pillActive]}
                onPress={() => setSelectedStatus(opt.value)}
                activeOpacity={0.7}
              >
                <Text style={[styles.pillText, active && styles.pillTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={colors.emerald} />
        </View>
      ) : (
        <FlatList
          data={enquiries}
          keyExtractor={(item) => item.id}
          renderItem={renderEnquiryItem}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: 80 + insets.bottom },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.emerald}
              colors={[colors.emerald]}
            />
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Inbox color={colors.textMuted} size={40} />
              <Text style={styles.emptyTitle}>No Leads Found</Text>
              <Text style={styles.emptySubtitle}>
                No customer inquiries match this filter.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  pillsWrapper: {
    paddingVertical: spacing.sm,
  },
  pillsScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillActive: {
    backgroundColor: colors.emeraldSubtle,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  pillText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  pillTextActive: {
    color: colors.emerald,
  },
  loadingCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeNew: {
    backgroundColor: colors.emeraldSubtle,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  badgeContacted: {
    backgroundColor: colors.blueSubtle,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  badgeProgress: {
    backgroundColor: colors.goldSubtle,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  badgeTextNew: {
    color: colors.emerald,
  },
  badgeTextContacted: {
    color: colors.blue,
  },
  badgeTextProgress: {
    color: colors.gold,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  cityText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  productTag: {
    fontSize: 11,
    color: colors.gold,
    fontWeight: '600',
    marginTop: 2,
  },
  message: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 10,
    color: colors.textMuted,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
});
