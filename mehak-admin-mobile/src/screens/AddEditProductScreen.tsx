import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { productsService } from '../services/products';
import { categoriesService } from '../services/categories';
import { uploadService } from '../services/upload';
import { Product, Category } from '../types';
import { AppHeader } from '../components/AppHeader';
import { colors, spacing, borderRadius } from '../theme/colors';
import { Upload, X, AlertCircle } from 'lucide-react-native';

export const AddEditProductScreen: React.FC<{ route?: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const existingProduct: Product | undefined = route?.params?.product;
  const isEditing = !!existingProduct;

  const [name, setName] = useState(existingProduct?.name || '');
  const [categoryId, setCategoryId] = useState(existingProduct?.categoryId || '');
  const [material, setMaterial] = useState(existingProduct?.material || '');
  const [shortDescription, setShortDescription] = useState(
    existingProduct?.shortDescription || ''
  );
  const [description, setDescription] = useState(existingProduct?.description || '');
  const [featured, setFeatured] = useState(existingProduct?.featured ?? false);
  const [available, setAvailable] = useState(existingProduct?.available ?? true);
  const [imageUri, setImageUri] = useState<string | null>(existingProduct?.image || null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await categoriesService.getCategories();
        setCategories(cats);
        if (!categoryId && cats.length > 0) {
          const match = cats.find((c) => c.slug === existingProduct?.category);
          setCategoryId(match ? match.id : cats[0].id);
        }
      } catch (err) {
        console.error('Failed to load categories in form:', err);
      }
    };
    loadCategories();
  }, []);

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Camera roll permissions are required to upload product images.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const localUri = result.assets[0].uri;
        setUploadingImage(true);
        setError('');

        try {
          const uploadRes = await uploadService.uploadImage(localUri);
          setImageUri(uploadRes.url);
        } catch (uploadErr: any) {
          console.error('Upload image error:', uploadErr);
          Alert.alert('Upload Warning', uploadErr?.message || 'Failed to upload image. Using local reference.');
          setImageUri(localUri);
        } finally {
          setUploadingImage(false);
        }
      }
    } catch (err: any) {
      console.error('Pick image error:', err);
      Alert.alert('Error', 'Failed to pick image.');
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Product name is required.');
      return;
    }
    if (!categoryId) {
      setError('Please select a valid category.');
      return;
    }

    setError('');
    setSaving(true);

    try {
      const payload: Partial<Product> = {
        name: name.trim(),
        categoryId,
        material: material.trim() || undefined,
        shortDescription: shortDescription.trim() || undefined,
        description: description.trim(),
        featured,
        available,
        image: imageUri,
      };

      if (isEditing) {
        await productsService.updateProduct(existingProduct.id, payload);
      } else {
        await productsService.createProduct(payload);
      }

      Alert.alert('Success', `Product ${isEditing ? 'updated' : 'created'} successfully!`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      console.error('Save product error:', err);
      setError(err?.message || 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title={isEditing ? 'Edit Product' : 'New Product'}
        subtitle={isEditing ? existingProduct.name : 'Create catalogue entry'}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom + 40, 48) },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {!!error && (
          <View style={styles.errorCard}>
            <AlertCircle color={colors.dangerLight} size={16} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Image Picker Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Product Image</Text>
          {imageUri ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => setImageUri(null)}
                activeOpacity={0.7}
              >
                <X color="#ffffff" size={14} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.uploadArea}
              onPress={handlePickImage}
              disabled={uploadingImage}
              activeOpacity={0.7}
            >
              {uploadingImage ? (
                <View style={styles.uploadingCenter}>
                  <ActivityIndicator color={colors.emerald} />
                  <Text style={styles.uploadingText}>Optimizing & Uploading...</Text>
                </View>
              ) : (
                <>
                  <Upload color={colors.textSecondary} size={24} />
                  <Text style={styles.uploadTitle}>Choose Product Photo</Text>
                  <Text style={styles.uploadSubtitle}>PNG, JPG, or WEBP up to 5MB</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Basic Info Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Product Details</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Product Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Health Faucet ABS Chrome"
              placeholderTextColor={colors.textPlaceholder}
              value={name}
              onChangeText={setName}
              maxLength={150}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Category *</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryChips}
            >
              {categories.map((cat) => {
                const selected = categoryId === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.chip, selected && styles.chipSelected]}
                    onPress={() => setCategoryId(cat.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Material / Finish</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. PTMT Polymer / Heavy Brass"
              placeholderTextColor={colors.textPlaceholder}
              value={material}
              onChangeText={setMaterial}
              maxLength={100}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Short Summary</Text>
            <TextInput
              style={styles.input}
              placeholder="One line description for catalogue cards"
              placeholderTextColor={colors.textPlaceholder}
              value={shortDescription}
              onChangeText={setShortDescription}
              maxLength={250}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Full Specifications & Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Detailed specifications, dimensions, features..."
              placeholderTextColor={colors.textPlaceholder}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={3000}
            />
          </View>
        </View>

        {/* Visibility / Badges */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Catalogue Status</Text>

          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Featured on Homepage</Text>
              <Text style={styles.switchSubtitle}>Showcase in top spotlight section</Text>
            </View>
            <Switch
              value={featured}
              onValueChange={setFeatured}
              trackColor={{ false: colors.border, true: colors.emerald }}
              thumbColor="#ffffff"
            />
          </View>

          <View style={[styles.switchRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Available for Orders</Text>
              <Text style={styles.switchSubtitle}>Visible to dealers in catalogue</Text>
            </View>
            <Switch
              value={available}
              onValueChange={setAvailable}
              trackColor={{ false: colors.border, true: colors.emerald }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.saveButtonText}>
              {isEditing ? 'Save Changes' : 'Publish Product'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
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
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
    letterSpacing: -0.2,
  },
  uploadArea: {
    height: 120,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: borderRadius.md,
    backgroundColor: colors.inputBg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  uploadTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  uploadSubtitle: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  uploadingCenter: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  uploadingText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  previewContainer: {
    position: 'relative',
    height: 140,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
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
    height: 80,
    paddingTop: spacing.sm,
  },
  categoryChips: {
    gap: spacing.sm,
    paddingVertical: 2,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.cardElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.emeraldSubtle,
    borderColor: colors.emerald,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: colors.emerald,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  switchInfo: {
    flex: 1,
    paddingRight: spacing.md,
  },
  switchLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  switchSubtitle: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  saveButton: {
    backgroundColor: colors.emerald,
    height: 46,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
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
