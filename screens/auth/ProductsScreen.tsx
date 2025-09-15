import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert
} from 'react-native';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../AuthContext';

const { width } = Dimensions.get('window');

const ProductsScreen = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<{name: string, image: string}[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { isOnline } = useAuth();

  const fetchProducts = async () => {
    if (!isOnline) {
      Alert.alert('Offline', 'Cannot load products without internet connection');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProducts(data || []);
      
      const uniqueCategories = Array.from(
        new Set(data?.map(item => item.category).filter(Boolean))
      ).map(category => ({
        name: category,
        image: data.find(item => item.category === category)?.image_url
      }));

      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [isOnline]);

  const getProductsByCategory = useCallback((category: string) => {
    return products.filter(product => product.category === category);
  }, [products]);

  const handleCategoryPress = (category: string) => {
    const categoryProducts = getProductsByCategory(category);
    setSelectedCategory(category);
    setSelectedProduct(categoryProducts[0]);
  };

  const handleThumbnailPress = (product: any) => {
    setSelectedProduct(product);
  };

  const renderCategoryPreview = ({ item }: { item: { name: string, image: string } }) => (
    <TouchableOpacity
      style={styles.categoryPreviewCard}
      onPress={() => handleCategoryPress(item.name)}
    >
      <View style={[
        styles.categoryImageContainer,
        item.name === 'Dezodorans' && styles.whiteBackgroundContainer
      ]}>
        <Image
          source={{ uri: item.image }}
          style={styles.categoryPreviewImage}
          resizeMode={item.name === 'Dezodorans' ? 'contain' : 'cover'}
        />
      </View>
      <Text style={styles.categoryPreviewTitle}>{item.name}</Text>
    </TouchableOpacity>
  );
  
  const renderThumbnail = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.thumbnail,
        selectedProduct?.id === item.id && styles.selectedThumbnail
      ]}
      onPress={() => handleThumbnailPress(item)}
    >
      <View style={[
        styles.thumbnailContainer,
        item.category === 'Dezodorans' && styles.whiteBackgroundContainer
      ]}>
        <Image
          source={{ uri: item.image_url }}
          style={styles.thumbnailImage}
          resizeMode={item.category === 'Dezodorans' ? 'contain' : 'cover'}
        />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFC72C" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Naši Proizvodi</Text>
      
      {products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.subtitle}>Trenutno nema dostupnih proizvoda</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchProducts}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Category Previews */}
          {!selectedCategory && (
            <FlatList
              data={categories}
              renderItem={renderCategoryPreview}
              keyExtractor={(item) => item.name}
              numColumns={2}
              columnWrapperStyle={styles.categoryPreviewRow}
              contentContainerStyle={styles.categoriesContainer}
              scrollEnabled={false}
            />
          )}

          {/* Product Detail View */}
          {selectedCategory && selectedProduct && (
            <View style={styles.productDetailContainer}>
              {/* Back Button */}
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => setSelectedCategory(null)}
              >
                <Text style={styles.backButtonText}>←</Text>
              </TouchableOpacity>

              {/* Main Product Image */}
              <View style={styles.mainImageContainer}>
                <Image
                  source={{ uri: selectedProduct.image_url }}
                  style={styles.mainImage}
                  resizeMode="contain"
                />
              </View>

              {/* Product Details */}
              <View style={styles.detailsContainer}>
                <Text style={styles.productName}>{selectedProduct.name}</Text>
                <Text style={styles.productDescription}>{selectedProduct.description}</Text>
                <Text style={styles.productPrice}>{selectedProduct.price} RSD</Text>
              </View>

              {/* Thumbnail Gallery */}
              <Text style={styles.galleryTitle}>Dostupne varijante:</Text>
              <FlatList
                data={getProductsByCategory(selectedCategory)}
                renderItem={renderThumbnail}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.galleryContainer}
              />
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 30,
    flex: 1,
    backgroundColor: '#121212',
    padding: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  loadingText: {
    color: '#FFC72C',
    marginTop: 15,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFC72C',
    marginVertical: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#FFF',
    textAlign: 'center',
    marginTop: 15,
  },
  retryButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'rgba(255, 199, 44, 0.2)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFC72C',
  },
  retryButtonText: {
    color: '#FFC72C',
    fontWeight: 'bold',
    fontSize: 16,
  },
  categoriesContainer: {
    paddingBottom: 20,
  },
  categoryPreviewRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryPreviewCard: {
    width: width / 2 - 18,
    backgroundColor: '#1F1F1F',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 12,
  },
  categoryImageContainer: {
    backgroundColor: '#1F1F1F',
    width: '100%',
    height: width / 2 - 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryPreviewImage: {
    width: '90%',
    height: '90%',
  },
  categoryPreviewTitle: {
    padding: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    textAlign: 'center',
  },
  productDetailContainer: {
    marginBottom: 24,
  },
  backButton: {
    marginBottom: 16,
    padding: 8,
  },
  backButtonText: {
    color: '#FFC72C',
    fontSize: 35,
    fontWeight: 'bold'
  },
  mainImageContainer: {
    height: width * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1F1F1F',
    borderRadius: 10,
    marginBottom: 20,
  },
  mainImage: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
  },
  detailsContainer: {
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 16,
    color: '#AAA',
    marginBottom: 12,
    lineHeight: 22,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFC72C',
  },
  galleryTitle: {
    fontSize: 16,
    color: '#FFF',
    marginBottom: 12,
  },
  galleryContainer: {
    paddingBottom: 20,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedThumbnail: {
    borderColor: '#FFC72C',
  },
  thumbnailImage: {
    width: '90%',
    height: '90%',
  },
  thumbnailContainer: {
    backgroundColor: '#1F1F1F',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
  whiteBackgroundContainer: {
    //backgroundColor: '#FFFFFF',
  },
});

export default ProductsScreen;