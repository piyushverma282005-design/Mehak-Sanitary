import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { enquiriesService } from '../services/enquiries';
import { Enquiry, EnquiryStatus } from '../types';
import { ArrowLeft, Phone, Mail, MapPin, Building, Package, Clock, Trash2, CheckCircle2 } from 'lucide-react-native';

const STATUS_LIST: EnquiryStatus[] = ['NEW', 'CONTACTED', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED'];

export const EnquiryDetailScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const [enquiry, setEnquiry] = useState<Enquiry>(route.params.enquiry);
  const [loading, setLoading] = useState(false);

  const handleUpdateStatus = async (newStatus: EnquiryStatus) => {
    setLoading(true);
    try {
      const updated = await enquiriesService.updateStatus(enquiry.id, newStatus);
      setEnquiry(updated);
      Alert.alert('Status Updated', `Enquiry status changed to ${newStatus}`);
    } catch (err: any) {
      Alert.alert('Update Error', err?.message || 'Failed to update status.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Enquiry',
      `Are you sure you want to delete this enquiry from ${enquiry.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft color="#ffffff" size={20} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Enquiry Details</Text>
        <TouchableOpacity style={styles.deleteHeaderButton} onPress={handleDelete}>
          <Trash2 color="#ef4444" size={20} />
        </TouchableOpacity>
      </View>

      {/* Main Info Card */}
      <View style={styles.card}>
        <View style={styles.nameRow}>
          <Text style={styles.customerName}>{enquiry.name}</Text>
          <View style={[styles.badge, enquiry.status === 'NEW' ? styles.badgeNew : styles.badgeDefault]}>
            <Text style={styles.badgeText}>{enquiry.status}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Phone color="#34d399" size={18} />
          <Text style={styles.detailValue}>{enquiry.phone}</Text>
        </View>

        {!!enquiry.email && (
          <View style={styles.detailRow}>
            <Mail color="#94a3b8" size={18} />
            <Text style={styles.detailValue}>{enquiry.email}</Text>
          </View>
        )}

        {!!enquiry.city && (
          <View style={styles.detailRow}>
            <MapPin color="#94a3b8" size={18} />
            <Text style={styles.detailValue}>{enquiry.city}</Text>
          </View>
        )}

        {!!enquiry.companyName && (
          <View style={styles.detailRow}>
            <Building color="#94a3b8" size={18} />
            <Text style={styles.detailValue}>{enquiry.companyName} {enquiry.businessType ? `(${enquiry.businessType})` : ''}</Text>
          </View>
        )}

        {!!enquiry.product && (
          <View style={styles.detailRow}>
            <Package color="#38bdf8" size={18} />
            <Text style={styles.detailValue}>
              {enquiry.product} {enquiry.quantity ? `(Qty: ${enquiry.quantity})` : ''}
            </Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Clock color="#64748b" size={18} />
          <Text style={styles.detailSubtext}>Received: {new Date(enquiry.createdAt).toLocaleString()}</Text>
        </View>
      </View>

      {/* Message Card */}
      <View style={styles.card}>
        <Text style={styles.cardSectionTitle}>Message / Requirements</Text>
        <Text style={styles.messageBody}>{enquiry.message}</Text>
      </View>

      {/* Status Action Buttons */}
      <View style={styles.card}>
        <Text style={styles.cardSectionTitle}>Update Status</Text>

        {loading ? (
          <ActivityIndicator color="#10b981" style={{ marginVertical: 12 }} />
        ) : (
          <View style={styles.statusButtonsGrid}>
            {STATUS_LIST.map((st) => (
              <TouchableOpacity
                key={st}
                style={[
                  styles.statusOptionButton,
                  enquiry.status === st && styles.statusOptionActive,
                ]}
                onPress={() => handleUpdateStatus(st)}
              >
                <Text
                  style={[
                    styles.statusOptionText,
                    enquiry.status === st && styles.statusOptionTextActive,
                  ]}
                >
                  {st}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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
    padding: 20,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  deleteHeaderButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customerName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeNew: {
    backgroundColor: '#9f1239',
  },
  badgeDefault: {
    backgroundColor: '#334155',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 14,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  detailSubtext: {
    fontSize: 12,
    color: '#94a3b8',
  },
  cardSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  messageBody: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 22,
  },
  statusButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusOptionButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
  },
  statusOptionActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  statusOptionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
  },
  statusOptionTextActive: {
    color: '#ffffff',
  },
});
