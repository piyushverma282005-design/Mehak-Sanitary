import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { productsService } from '../services/products';
import { categoriesService } from '../services/categories';
import { uploadService } from '../services/upload';
import { Product, Category } from '../types';
import { Camera, Image as ImageIcon, Save, ArrowLeft, Check, AlertCircle } from 'lucide-react-native';

export const AddEditProductScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const existingProduct: Product | undefined = route.params?.product;
  const isEditing = !!existingProduct;

  const [name, setName] = useState(existingProduct?.name || '');
  const [categoryId, setCategoryId] = useState(existingProduct?.categoryId || '');
  const [material, setMaterial] = useState(existingProduct?.material || '');
  const [shortDescription, setShortDescription] = useState(existingProduct?.shortDescription || '');
  const [description, setDescription] = useState(existingProduct?.description || '');
  const [featured, setFeatured] = useState(existingProduct?.featured || false);
  const [available, setAvailable] = useState(existingProduct?.available ?? true);
  const [imageUri, setImageUri] = useState<string | null>(existingProduct?.image || null);
  const [categories, setCategories] = useState<Category[]>([]);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    categoriesService.getCategories().then((cats) => {
      setCategories(cats);
      if (!categoryId && cats.length > 0) {
        setCategoryId(cats[0].id);
      }
    });
  }, []);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Denied', 'Permission to access gallery is required to upload product images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedAsset = result.assets[0];
      handleUploadPickedImage(selectedAsset.uri, selectedAsset.mimeType || 'image/jpeg');
    }
  };

  const handleUploadPickedImage = async (uri: string, mimeType: string) => {
    setUploadingImage(true);
    try {
      const res = await uploadService.uploadImage(uri, mimeType, `product_${Date.now()}.jpg`);
      setImageUri(res.url);
    } catch (err: any) {
      Alert.alert('Upload Error', err?.message || 'Failed to upload image.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Product name is required.');
      return;
    }
    if (!categoryId) {
      setError('Please select a category.');
      return;
    }
    if (!description.trim()) {
      setError('Product description is required.');
      return;
    }

    setError('');
    setSaving(true);

    try {
      const payload: Partial<Product> = {
        name,
        categoryId,
        material,
        shortDescription,
        description,
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft color="#ffffff" size={20} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'Edit Product' : 'Add New Product'}</Text>
      </View>

      {!!error && (
        <View style={styles.errorCard}>
          <AlertCircle color="#f87171" size={18} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Image Picker Box */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Product Image</Text>
        <View style={styles.imageBox}>
          {imageUri ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="cover" />
              <TouchableOpacity style={styles.changeImageOverlay} onPress={pickImage}>
                <Camera color="#ffffff" size={20} />
                <Text style={styles.changeText}>Change Image</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.uploadPlaceholder} onPress={pickImage} disabled={uploadingImage}>
              {uploadingImage ? (
                <ActivityIndicator color="#10b981" />
              ) : (
                <>
                  <ImageIcon color="#64748b" size={36} />
                  <Text style={styles.uploadText}>Select Image from Device</Text>
                  <Text style={styles.uploadSubtext}>JPEG, PNG, WEBP (Max 5MB)</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Name Input */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Product Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Health Faucet Premium Brass"
          placeholderTextColor="#64748b"
          value={name}
          onChangeText={setName}
        />
      </View>

      {/* Category Selection */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Category *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryPills}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.catPill, categoryId === cat.id && styles.catPillActive]}
              onPress={() => setCategoryId(cat.id)}
            >
              <Text style={[styles.catPillText, categoryId === cat.id && styles.catPillTextActive]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Material Input */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Material / Construction</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. High-Purity Brass / Stainless Steel"
          placeholderTextColor="#64748b"
          value={material}
          onChangeText={setMaterial}
        />
      </View>

      {/* Short Description */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Short Description</Text>
        <TextInput
          style={styles.input}
          placeholder="Brief summary for product card"
          placeholderTextColor="#64748b"
          value={shortDescription}
          onChangeText={setShortDescription}
        />
      </View>

      {/* Full Description */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Full Specifications & Details *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Detailed product features, specifications, and warranty details..."
          placeholderTextColor="#64748b"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          value={description}
          onChangeText={setDescription}
        />
      </View>

      {/* Switches */}
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Featured on Home Page</Text>
        <Switch value={featured} onValueChange={setFeatured} trackColor={{ false: '#334155', true: '#059669' }} />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Available / In Stock</Text>
        <Switch value={available} onValueChange={setAvailable} trackColor={{ false: '#334155', true: '#059669' }} />
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveButton, saving && styles.buttonDisabled]}
        onPress={handleSave}
        disabled={saving}
        activeOpacity={0.8}
      >
        {saving ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <>
            <Save color="#ffffff" size={18} />
            <Text style={styles.saveButtonText}>{isEditing ? 'Update Product' : 'Save Product'}</Text>
          </>
        )}
      </TouchableOpacity>
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
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderRadius: 12,
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
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  textArea: {
    minHeight: 100,
  },
  imageBox: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#1e293b',
  },
  previewContainer: {
    height: 180,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  changeImageOverlay: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  changeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  uploadPlaceholder: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  uploadText: {
    color: '#34d399',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
  },
  uploadSubtext: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 2,
  },
  categoryPills: {
    gap: 8,
  },
  catPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  catPillActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  catPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
  },
  catPillTextActive: {
    color: '#ffffff',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  saveButton: {
    backgroundColor: '#10b981',
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
