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
import { productsService } from '../services/products';
import { categoriesService } from '../services/categories';
import { Product, Category } from '../types';
import { Search, Plus, Trash2, Edit3, Package, Filter } from 'lucide-react-native';

export const ProductsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
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
      const [prodsData, catsData] = await Promise.all([
        productsService.getProducts({ category: selectedCategory, search: searchQuery }),
        categoriesService.getCategories(),
      ]);
      setProducts(prodsData);
      setCategories(catsData);
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
      'Confirm Product Deletion',
      `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
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
              Alert.alert('Delete Error', err?.message || 'Failed to delete product.');
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
            <Package color="#64748b" size={28} />
          </View>
        )}
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productCategory}>{item.categoryName || item.category}</Text>
        {!!item.material && <Text style={styles.productMaterial}>Material: {item.material}</Text>}
        {!!item.shortDescription && (
          <Text style={styles.productDesc} numberOfLines={2}>
            {item.shortDescription}
          </Text>
        )}

        <View style={styles.badgeRow}>
          {item.featured && (
            <View style={[styles.badge, styles.featuredBadge]}>
              <Text style={styles.badgeText}>Featured</Text>
            </View>
          )}
          <View style={[styles.badge, item.available ? styles.availableBadge : styles.unavailableBadge]}>
            <Text style={styles.badgeText}>{item.available ? 'In Stock' : 'Out of Stock'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionColumn}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('AddEditProduct', { product: item })}
        >
          <Edit3 color="#ffffff" size={16} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteProduct(item)}>
          <Trash2 color="#ffffff" size={16} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar & Add Button */}
      <View style={styles.topBar}>
        <View style={styles.searchWrapper}>
          <Search color="#64748b" size={18} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products catalogue..."
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddEditProduct')}
          activeOpacity={0.8}
        >
          <Plus color="#ffffff" size={20} />
        </TouchableOpacity>
      </View>

      {/* Category Pills horizontal list */}
      <View style={styles.categoriesPillsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsScroll}>
          <TouchableOpacity
            style={[styles.pill, selectedCategory === 'all' && styles.pillActive]}
            onPress={() => setSelectedCategory('all')}
          >
            <Text style={[styles.pillText, selectedCategory === 'all' && styles.pillTextActive]}>All Items</Text>
          </TouchableOpacity>

          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.pill, selectedCategory === cat.slug && styles.pillActive]}
              onPress={() => setSelectedCategory(cat.slug)}
            >
              <Text style={[styles.pillText, selectedCategory === cat.slug && styles.pillTextActive]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderProductItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Package color="#475569" size={48} />
              <Text style={styles.emptyTitle}>No Products Found</Text>
              <Text style={styles.emptySubtitle}>Try adjusting your search query or category filter.</Text>
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 10,
  },
  searchWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: '#ffffff',
    fontSize: 14,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesPillsContainer: {
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
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  productImageContainer: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#0f172a',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
    marginRight: 12,
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
  },
  productName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  productCategory: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10b981',
    marginTop: 2,
  },
  productMaterial: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
  },
  productDesc: {
    fontSize: 11,
    color: '#cbd5e1',
    marginTop: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  featuredBadge: {
    backgroundColor: '#d97706',
  },
  availableBadge: {
    backgroundColor: '#059669',
  },
  unavailableBadge: {
    backgroundColor: '#dc2626',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#ffffff',
  },
  actionColumn: {
    gap: 8,
    marginLeft: 8,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
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
