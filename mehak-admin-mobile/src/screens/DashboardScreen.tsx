import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { productsService } from '../services/products';
import { categoriesService } from '../services/categories';
import { enquiriesService } from '../services/enquiries';
import { Enquiry, Product } from '../types';
import { Package, FolderTree, Inbox, Clock, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react-native';

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
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchMetrics = async () => {
    try {
      setError('');
      const [products, categories, enquiries] = await Promise.all([
        productsService.getProducts(),
        categoriesService.getCategories(),
        enquiriesService.getEnquiries(),
      ]);

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Fetching Real-time Metrics...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />}
    >
      {/* Header Title */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Business Overview</Text>
        <Text style={styles.headerSubtitle}>Mehak Sanitary Hardware Operations</Text>
      </View>

      {!!error && (
        <View style={styles.errorCard}>
          <AlertCircle color="#f87171" size={20} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Metric Cards Grid */}
      <View style={styles.grid}>
        {/* Card 1: New Leads */}
        <TouchableOpacity
          style={[styles.card, { backgroundColor: '#881337', borderColor: '#f43f5e' }]}
          onPress={() => navigation.navigate('Enquiries')}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <Clock color="#ffffff" size={24} />
            <Text style={styles.cardValue}>{metrics?.newEnquiries || 0}</Text>
          </View>
          <Text style={styles.cardLabel}>New Enquiries</Text>
          <Text style={styles.cardSubtext}>Action Required</Text>
        </TouchableOpacity>

        {/* Card 2: Total Enquiries */}
        <TouchableOpacity
          style={[styles.card, { backgroundColor: '#1e1b4b', borderColor: '#6366f1' }]}
          onPress={() => navigation.navigate('Enquiries')}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <Inbox color="#ffffff" size={24} />
            <Text style={styles.cardValue}>{metrics?.totalEnquiries || 0}</Text>
          </View>
          <Text style={styles.cardLabel}>Total Leads</Text>
          <Text style={styles.cardSubtext}>All Inquiries</Text>
        </TouchableOpacity>

        {/* Card 3: Products */}
        <TouchableOpacity
          style={[styles.card, { backgroundColor: '#0f172a', borderColor: '#334155' }]}
          onPress={() => navigation.navigate('Products')}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <Package color="#34d399" size={24} />
            <Text style={styles.cardValue}>{metrics?.totalProducts || 0}</Text>
          </View>
          <Text style={styles.cardLabel}>Catalogue Items</Text>
          <Text style={styles.cardSubtext}>Live Products</Text>
        </TouchableOpacity>

        {/* Card 4: Categories */}
        <TouchableOpacity
          style={[styles.card, { backgroundColor: '#451a03', borderColor: '#f97316' }]}
          onPress={() => navigation.navigate('Categories')}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <FolderTree color="#ffffff" size={24} />
            <Text style={styles.cardValue}>{metrics?.totalCategories || 0}</Text>
          </View>
          <Text style={styles.cardLabel}>Product Categories</Text>
          <Text style={styles.cardSubtext}>Core Lines</Text>
        </TouchableOpacity>
      </View>

      {/* Section: Recent Enquiries */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Customer Leads</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Enquiries')}>
            <Text style={styles.seeAll}>View All</Text>
          </TouchableOpacity>
        </View>

        {metrics?.recentEnquiries && metrics.recentEnquiries.length > 0 ? (
          metrics.recentEnquiries.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.enquiryCard}
              onPress={() => navigation.navigate('Enquiries', { screen: 'EnquiryDetail', params: { id: item.id } })}
              activeOpacity={0.7}
            >
              <View style={styles.enquiryTop}>
                <Text style={styles.enquiryName}>{item.name}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    item.status === 'NEW' ? styles.statusNew : styles.statusOther,
                  ]}
                >
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>

              <Text style={styles.enquiryPhone}>📞 {item.phone}</Text>
              {!!item.product && <Text style={styles.enquiryMeta}>Product: {item.product}</Text>}
              <Text style={styles.enquiryMessage} numberOfLines={2}>
                "{item.message}"
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>No recent customer enquiries found.</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
    marginTop: 2,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    gap: 10,
  },
  errorText: {
    color: '#f87171',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  card: {
    width: '48%',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
  cardSubtext: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  seeAll: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10b981',
  },
  enquiryCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 12,
  },
  enquiryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  enquiryName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusNew: {
    backgroundColor: '#9f1239',
  },
  statusOther: {
    backgroundColor: '#334155',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
  },
  enquiryPhone: {
    fontSize: 12,
    fontWeight: '700',
    color: '#34d399',
    marginBottom: 4,
  },
  enquiryMeta: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 4,
  },
  enquiryMessage: {
    fontSize: 12,
    color: '#cbd5e1',
    fontStyle: 'italic',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 16,
  },
});
