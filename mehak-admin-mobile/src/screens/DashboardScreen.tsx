import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { productsService } from '../services/products';
import { categoriesService } from '../services/categories';
import { enquiriesService } from '../services/enquiries';
import { Enquiry, Product } from '../types';
import { AppHeader } from '../components/AppHeader';
import { colors, spacing, borderRadius } from '../theme/colors';
import {
  Package,
  FolderTree,
  Inbox,
  Clock,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Plus,
  ChevronRight,
} from 'lucide-react-native';

interface DashboardMetrics {
  totalProducts: number;
  totalCategories: number;
  totalEnquiries: number;
  newEnquiries: number;
  contactedEnquiries: number;
  completedEnquiries: number;
  recentEnquiries: Enquiry[];
  recentProducts: Product[];
}

export const DashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchMetrics = async () => {
    try {
      setError('');
      const [productsRes, categoriesRes, enquiriesRes] = await Promise.allSettled([
        productsService.getProducts(),
        categoriesService.getCategories(),
        enquiriesService.getEnquiries(),
      ]);

      const products = productsRes.status === 'fulfilled' ? productsRes.value : [];
      const categories = categoriesRes.status === 'fulfilled' ? categoriesRes.value : [];
      const enquiries = enquiriesRes.status === 'fulfilled' ? enquiriesRes.value : [];

      if (productsRes.status === 'rejected') {
        console.warn('[DashboardScreen] Failed to load products:', productsRes.reason?.message);
      }
      if (categoriesRes.status === 'rejected') {
        console.warn('[DashboardScreen] Failed to load categories:', categoriesRes.reason?.message);
      }
      if (enquiriesRes.status === 'rejected') {
        console.warn('[DashboardScreen] Failed to load enquiries:', enquiriesRes.reason?.message);
      }

      const totalProducts = products.length;
      const totalCategories = categories.length;
      const totalEnquiries = enquiries.length;

      const newEnquiries = enquiries.filter((e) => e.status === 'NEW').length;
      const contactedEnquiries = enquiries.filter((e) => e.status === 'CONTACTED').length;
      const completedEnquiries = enquiries.filter((e) => e.status === 'COMPLETED').length;

      setMetrics({
        totalProducts,
        totalCategories,
        totalEnquiries,
        newEnquiries,
        contactedEnquiries,
        completedEnquiries,
        recentEnquiries: enquiries.slice(0, 5),
        recentProducts: products.slice(0, 5),
      });
    } catch (err: any) {
      console.error('Fetch metrics error:', err);
      setError(err?.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMetrics();
  }, []);

  return (
    <View style={styles.container}>
      <AppHeader
        title="Mehak Admin"
        subtitle="Operations & Overview"
        showLogo
        rightAction={
          <TouchableOpacity
            onPress={onRefresh}
            style={styles.headerIconButton}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <RefreshCw color={colors.textSecondary} size={16} />
          </TouchableOpacity>
        }
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.emerald} />
          <Text style={styles.loadingText}>Fetching Real-time Metrics...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.content,
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
        >
          {!!error && (
            <View style={styles.errorCard}>
              <AlertCircle color={colors.dangerLight} size={16} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Metrics Grid */}
          <View style={styles.grid}>
            {/* Card 1: New Leads */}
            <TouchableOpacity
              style={styles.metricCard}
              onPress={() => navigation.navigate('Enquiries')}
              activeOpacity={0.75}
            >
              <View style={styles.metricCardHeader}>
                <View style={[styles.iconBox, { backgroundColor: colors.goldSubtle }]}>
                  <Clock color={colors.gold} size={18} />
                </View>
                <Text style={[styles.metricValue, { color: colors.gold }]}>
                  {metrics?.newEnquiries || 0}
                </Text>
              </View>
              <Text style={styles.metricLabel}>New Leads</Text>
              <Text style={styles.metricSubtext}>Action needed</Text>
            </TouchableOpacity>

            {/* Card 2: Total Leads */}
            <TouchableOpacity
              style={styles.metricCard}
              onPress={() => navigation.navigate('Enquiries')}
              activeOpacity={0.75}
            >
              <View style={styles.metricCardHeader}>
                <View style={[styles.iconBox, { backgroundColor: colors.blueSubtle }]}>
                  <Inbox color={colors.blue} size={18} />
                </View>
                <Text style={styles.metricValue}>
                  {metrics?.totalEnquiries || 0}
                </Text>
              </View>
              <Text style={styles.metricLabel}>Total Leads</Text>
              <Text style={styles.metricSubtext}>All inquiries</Text>
            </TouchableOpacity>

            {/* Card 3: Products */}
            <TouchableOpacity
              style={styles.metricCard}
              onPress={() => navigation.navigate('Products')}
              activeOpacity={0.75}
            >
              <View style={styles.metricCardHeader}>
                <View style={[styles.iconBox, { backgroundColor: colors.emeraldSubtle }]}>
                  <Package color={colors.emerald} size={18} />
                </View>
                <Text style={styles.metricValue}>
                  {metrics?.totalProducts || 0}
                </Text>
              </View>
              <Text style={styles.metricLabel}>Products</Text>
              <Text style={styles.metricSubtext}>In catalogue</Text>
            </TouchableOpacity>

            {/* Card 4: Categories */}
            <TouchableOpacity
              style={styles.metricCard}
              onPress={() => navigation.navigate('Categories')}
              activeOpacity={0.75}
            >
              <View style={styles.metricCardHeader}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(168, 85, 247, 0.12)' }]}>
                  <FolderTree color="#c084fc" size={18} />
                </View>
                <Text style={styles.metricValue}>
                  {metrics?.totalCategories || 0}
                </Text>
              </View>
              <Text style={styles.metricLabel}>Categories</Text>
              <Text style={styles.metricSubtext}>Organized</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Action Button */}
          <TouchableOpacity
            style={styles.quickAddButton}
            onPress={() => navigation.navigate('Products', { screen: 'AddEditProduct' })}
            activeOpacity={0.8}
          >
            <Plus color="#ffffff" size={18} />
            <Text style={styles.quickAddText}>Add New Product</Text>
          </TouchableOpacity>

          {/* Section: Recent Leads */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Customer Leads</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Enquiries')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.seeAll}>View All</Text>
              </TouchableOpacity>
            </View>

            {metrics?.recentEnquiries && metrics.recentEnquiries.length > 0 ? (
              metrics.recentEnquiries.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.leadCard}
                  onPress={() =>
                    navigation.navigate('Enquiries', {
                      screen: 'EnquiryDetail',
                      params: { enquiry: item },
                    })
                  }
                  activeOpacity={0.7}
                >
                  <View style={styles.leadTop}>
                    <Text style={styles.leadName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        item.status === 'NEW' ? styles.statusNew : styles.statusDefault,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          item.status === 'NEW' ? styles.statusTextNew : styles.statusTextDefault,
                        ]}
                      >
                        {item.status}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.leadPhone}>📞 {item.phone}</Text>
                  {!!item.product && (
                    <Text style={styles.leadProduct}>Product: {item.product}</Text>
                  )}
                  {!!item.message && (
                    <Text style={styles.leadMessage} numberOfLines={2}>
                      "{item.message}"
                    </Text>
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No recent customer leads found.</Text>
              </View>
            )}
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
  headerIconButton: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: spacing.md,
    fontSize: 13,
    fontWeight: '600',
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerSubtle,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  errorText: {
    color: colors.dangerLight,
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  metricCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  metricSubtext: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  quickAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.emerald,
    borderRadius: borderRadius.md,
    height: 44,
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  quickAddText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  seeAll: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.emerald,
  },
  leadCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  leadTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  leadName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  statusNew: {
    backgroundColor: colors.emeraldSubtle,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  statusDefault: {
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
  },
  statusTextNew: {
    color: colors.emerald,
  },
  statusTextDefault: {
    color: colors.textSecondary,
  },
  leadPhone: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  leadProduct: {
    fontSize: 11,
    color: colors.gold,
    fontWeight: '600',
    marginTop: 2,
  },
  leadMessage: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
    fontStyle: 'italic',
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
