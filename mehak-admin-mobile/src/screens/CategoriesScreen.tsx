import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { categoriesService } from '../services/categories';
import { Category } from '../types';
import { AppHeader } from '../components/AppHeader';
import { colors, spacing, borderRadius } from '../theme/colors';
import { FolderTree, Plus, Trash2, Edit3, X, Check } from 'lucide-react-native';

export const CategoriesScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      const data = await categoriesService.getCategories();
      setCategories(data);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to fetch categories.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setModalVisible(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setModalVisible(true);
  };

  const handleSaveCategory = async () => {
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName) {
      Alert.alert('Validation', 'Category name cannot be empty.');
      return;
    }

    setSaving(true);
    try {
      if (editingCategory) {
        await categoriesService.updateCategory(editingCategory.id, {
          name: trimmedName,
          description: trimmedDescription || undefined,
        });
      } else {
        await categoriesService.createCategory({
          name: trimmedName,
          description: trimmedDescription || undefined,
        });
      }
      setModalVisible(false);
      fetchCategories();
    } catch (err: any) {
      Alert.alert('Save Error', err?.message || 'Failed to save category.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = (cat: Category) => {
    Alert.alert(
      'Confirm Deletion',
      `Delete category "${cat.name}"? Products under this category will be detached.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await categoriesService.deleteCategory(cat.id);
              fetchCategories();
            } catch (err: any) {
              Alert.alert('Delete Error', err?.message || 'Failed to delete category.');
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <View style={styles.categoryCard}>
      <View style={styles.iconContainer}>
        <FolderTree color={colors.emerald} size={20} />
      </View>

      <View style={styles.info}>
        <Text style={styles.catName}>{item.name}</Text>
        <Text style={styles.catSlug}>/{item.slug}</Text>
        {!!item.description && (
          <Text style={styles.catDesc} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        {item._count && (
          <Text style={styles.productCount}>
            {item._count.products} products attached
          </Text>
        )}
      </View>

      <View style={styles.actionColumn}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openEditModal(item)}
          activeOpacity={0.7}
        >
          <Edit3 color={colors.textSecondary} size={15} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteCategory(item)}
          activeOpacity={0.7}
        >
          <Trash2 color={colors.dangerLight} size={15} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <AppHeader
        title="Categories"
        subtitle={`${categories.length} classifications`}
        rightAction={
          <TouchableOpacity
            style={styles.newButton}
            onPress={openAddModal}
            activeOpacity={0.8}
          >
            <Plus color="#ffffff" size={16} />
            <Text style={styles.newButtonText}>New</Text>
          </TouchableOpacity>
        }
      />

      {loading ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={colors.emerald} />
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={renderCategoryItem}
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
              <FolderTree color={colors.textMuted} size={40} />
              <Text style={styles.emptyTitle}>No Categories Yet</Text>
              <Text style={styles.emptySubtitle}>
                Add your first sanitary hardware category above.
              </Text>
            </View>
          }
        />
      )}

      {/* Edit/Add Category Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingCategory ? 'Edit Category' : 'New Category'}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X color={colors.textSecondary} size={18} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Category Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Health Faucets"
                placeholderTextColor={colors.textPlaceholder}
                value={name}
                onChangeText={setName}
                maxLength={100}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Short summary for catalogue..."
                placeholderTextColor={colors.textPlaceholder}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                maxLength={500}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, saving && styles.buttonDisabled]}
                onPress={handleSaveCategory}
                disabled={saving}
                activeOpacity={0.8}
              >
                {saving ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.confirmText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.emerald,
    paddingHorizontal: 10,
    height: 32,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  newButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  loadingCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: spacing.lg,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.emeraldSubtle,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
  },
  catName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  catSlug: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginTop: 1,
  },
  catDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  productCount: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.gold,
    marginTop: 3,
  },
  actionColumn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: spacing.sm,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.cardElevated,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: colors.dangerSubtle,
    borderColor: 'rgba(239, 68, 68, 0.25)',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  modalCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
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
  },
  textArea: {
    height: 70,
    paddingTop: spacing.sm,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  cancelButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.cardElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  confirmButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.emerald,
  },
  confirmText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
