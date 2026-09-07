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
import { enquiriesService } from '../services/enquiries';
import { Enquiry, EnquiryStatus } from '../types';
import { Inbox, Phone, Mail, Building, Clock, ChevronRight } from 'lucide-react-native';

const STATUS_OPTIONS: Array<{ label: string; value: string }> = [
  { label: 'All Leads', value: 'all' },
  { label: 'New', value: 'NEW' },
  { label: 'Contacted', value: 'CONTACTED' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Archived', value: 'ARCHIVED' },
];

export const EnquiriesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
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

  const renderEnquiryItem = ({ item }: { item: Enquiry }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('EnquiryDetail', { enquiry: item })}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.name}>{item.name}</Text>
        <View style={[styles.badge, item.status === 'NEW' ? styles.badgeNew : styles.badgeDefault]}>
          <Text style={styles.badgeText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Phone color="#34d399" size={14} />
        <Text style={styles.phone}>{item.phone}</Text>
      </View>

      {!!item.companyName && (
        <View style={styles.infoRow}>
          <Building color="#94a3b8" size={14} />
          <Text style={styles.company}>{item.companyName} {item.city ? `(${item.city})` : ''}</Text>
        </View>
      )}

      {!!item.product && (
        <Text style={styles.productTag}>Interested Product: {item.product}</Text>
      )}

      <Text style={styles.message} numberOfLines={2}>
        "{item.message}"
      </Text>

      <View style={styles.cardFooter}>
        <View style={styles.dateRow}>
          <Clock color="#64748b" size={12} />
          <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
        <ChevronRight color="#64748b" size={16} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <Text style={styles.headerTitle}>Customer Enquiries</Text>
        <Text style={styles.headerSubtitle}>Trade Enquiries & Bulk Leads</Text>
      </View>

      {/* Status Filter Pills */}
      <View style={styles.pillsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsScroll}>
          {STATUS_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.pill, selectedStatus === opt.value && styles.pillActive]}
              onPress={() => setSelectedStatus(opt.value)}
            >
              <Text style={[styles.pillText, selectedStatus === opt.value && styles.pillTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      ) : (
        <FlatList
          data={enquiries}
          keyExtractor={(item) => item.id}
          renderItem={renderEnquiryItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Inbox color="#475569" size={48} />
              <Text style={styles.emptyTitle}>No Enquiries Found</Text>
              <Text style={styles.emptySubtitle}>No customer leads matched the selected status filter.</Text>
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
    backgroundColor: '#0f172a',
  },
  topHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
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
  pillsContainer: {
    marginBottom: 8,
  },
  pillsScroll: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  pillActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
  },
  pillTextActive: {
    color: '#ffffff',
  },
  loadingCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeNew: {
    backgroundColor: '#9f1239',
  },
  badgeDefault: {
    backgroundColor: '#334155',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  phone: {
    fontSize: 13,
    fontWeight: '700',
    color: '#34d399',
  },
  company: {
    fontSize: 12,
    color: '#94a3b8',
  },
  productTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#38bdf8',
    marginTop: 4,
    marginBottom: 4,
  },
  message: {
    fontSize: 13,
    color: '#cbd5e1',
    fontStyle: 'italic',
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
  },
});
