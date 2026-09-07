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
  Image,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { productsService } from '../services/products';
import { categoriesService } from '../services/categories';
import { Product, Category } from '../types';
import { AppHeader } from '../components/AppHeader';
import { colors, spacing, borderRadius } from '../theme/colors';
import { Search, Plus, Trash2, Edit3, Package } from 'lucide-react-native';

export const ProductsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchProductsAndCategories = async () => {
    try {
      setError('');
      const [prodsRes, catsRes] = await Promise.allSettled([
        productsService.getProducts({ category: selectedCategory, search: searchQuery }),
        categoriesService.getCategories(),
      ]);

      if (prodsRes.status === 'fulfilled') {
        setProducts(prodsRes.value);
      } else {
        console.warn('Failed to load products:', prodsRes.reason?.message);
      }

      if (catsRes.status === 'fulfilled') {
        setCategories(catsRes.value);
      } else {
        console.warn('Failed to load categories:', catsRes.reason?.message);
      }

      if (prodsRes.status === 'rejected' && catsRes.status === 'rejected') {
        setError(prodsRes.reason?.message || 'Failed to load products.');
      }
    } catch (err: any) {
      console.error('Fetch products error:', err);
      setError(err?.message || 'Failed to load products.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProductsAndCategories();
  }, [selectedCategory]);

  const handleSearchSubmit = () => {
    setLoading(true);
    fetchProductsAndCategories();
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProductsAndCategories();
  }, [selectedCategory, searchQuery]);

  const handleDeleteProduct = (product: Product) => {
    Alert.alert(
      'Confirm Deletion',
      `Delete "${product.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await productsService.deleteProduct(product.id);
              await fetchProductsAndCategories();
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Failed to delete product.');
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <View style={styles.productImageContainer}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.productImage} resizeMode="cover" />
        ) : (
          <View style={styles.placeholderImage}>
            <Package color={colors.textMuted} size={22} />
          </View>
        )}
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.productCategory}>
          {item.categoryName || item.category}
        </Text>
        {!!item.material && (
          <Text style={styles.productMaterial} numberOfLines={1}>
            {item.material}
          </Text>
        )}
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('AddEditProduct', { product: item })}
          activeOpacity={0.7}
        >
          <Edit3 color={colors.textSecondary} size={15} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteProduct(item)}
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
        title="Products"
        subtitle={`${products.length} items listed`}
        rightAction={
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddEditProduct')}
            activeOpacity={0.8}
          >
            <Plus color="#ffffff" size={16} />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        }
      />

      {/* Search Input Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchWrapper}>
          <Search color={colors.textSecondary} size={16} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search catalogue..."
            placeholderTextColor={colors.textPlaceholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
        </View>
      </View>

      {/* Category Pills horizontal list */}
      <View style={styles.pillsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsScroll}
        >
          <TouchableOpacity
            style={[styles.pill, selectedCategory === 'all' && styles.pillActive]}
            onPress={() => setSelectedCategory('all')}
            activeOpacity={0.7}
          >
            <Text style={[styles.pillText, selectedCategory === 'all' && styles.pillTextActive]}>
              All Items
            </Text>
          </TouchableOpacity>

          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.pill, selectedCategory === cat.slug && styles.pillActive]}
              onPress={() => setSelectedCategory(cat.slug)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.pillText,
                  selectedCategory === cat.slug && styles.pillTextActive,
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Products List */}
      {loading ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={colors.emerald} />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderProductItem}
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
              <Package color={colors.textMuted} size={40} />
              <Text style={styles.emptyTitle}>No Products Found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? 'No products matched your search term.'
                  : 'Add your first product to this category.'}
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.emerald,
    paddingHorizontal: 10,
    height: 32,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  searchSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    height: 40,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '500',
  },
  pillsWrapper: {
    marginBottom: spacing.xs,
  },
  pillsScroll: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
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
    paddingTop: spacing.sm,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  productImageContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.inputBg,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  productName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  productCategory: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.gold,
    marginTop: 2,
  },
  productMaterial: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 1,
  },
  actionButtons: {
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
    textAlign: 'center',
  },
});
