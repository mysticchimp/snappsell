<template>
  <div class="home">
    <div class="hero">
      <h1>Welcome to SnappSell</h1>
      <p>Your one-stop shop for all your needs</p>
    </div>

    <!-- Featured Categories -->
    <section class="featured-categories">
      <h2>Shop by Category</h2>
      <div class="categories-grid">
        <CategoryCard
          v-for="category in categories"
          :key="category.id"
          :category="category"
          @click="navigateToCategory(category.id)"
        />
      </div>
    </section>

    <!-- Featured Products -->
    <section class="featured-products">
      <h2>Featured Products</h2>
      <div class="products-grid">
        <ProductCard
          v-for="product in featuredProducts"
          :key="product.id"
          :product="product"
          @add-to-cart="addToCart"
        />
      </div>
    </section>

    <!-- Special Offers -->
    <section class="special-offers">
      <h2>Special Offers</h2>
      <div class="offers-grid">
        <div v-for="offer in specialOffers" :key="offer.id" class="offer-card">
          <img :src="offer.image" :alt="offer.title">
          <div class="offer-content">
            <h3>{{ offer.title }}</h3>
            <p>{{ offer.description }}</p>
            <button class="btn btn-primary" @click="navigateToOffer(offer.id)">
              Shop Now
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import ProductCard from '@/components/ProductCard.vue'
import CategoryCard from '@/components/CategoryCard.vue'

export default {
  name: 'HomeView',
  components: {
    ProductCard,
    CategoryCard
  },
  setup() {
    const router = useRouter()
    const store = useStore()
    const featuredProducts = ref([])
    const categories = ref([])
    const specialOffers = ref([])

    const fetchData = async () => {
      try {
        // Fetch featured products
        const products = await store.dispatch('products/fetchFeaturedProducts')
        featuredProducts.value = products

        // Fetch categories
        const categoriesData = await store.dispatch('categories/fetchCategories')
        categories.value = categoriesData

        // Mock special offers data
        specialOffers.value = [
          {
            id: 1,
            title: 'Summer Sale',
            description: 'Up to 50% off on selected items',
            image: '/images/summer-sale.jpg'
          },
          {
            id: 2,
            title: 'New Arrivals',
            description: 'Check out our latest products',
            image: '/images/new-arrivals.jpg'
          }
        ]
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    const navigateToCategory = (categoryId) => {
      router.push(`/category/${categoryId}`)
    }

    const navigateToOffer = (offerId) => {
      router.push(`/offers/${offerId}`)
    }

    const addToCart = (product) => {
      store.dispatch('cart/addToCart', product)
    }

    onMounted(() => {
      fetchData()
    })

    return {
      featuredProducts,
      categories,
      specialOffers,
      navigateToCategory,
      navigateToOffer,
      addToCart
    }
  }
}
</script>

<style scoped>
.home {
  padding: 2rem;
}

.hero {
  text-align: center;
  padding: 4rem 2rem;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border-radius: 1rem;
  margin-bottom: 3rem;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.hero p {
  font-size: 1.25rem;
  opacity: 0.9;
}

section {
  margin-bottom: 4rem;
}

section h2 {
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #1f2937;
}

.categories-grid,
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
}

.offers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.offer-card {
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.offer-card:hover {
  transform: translateY(-4px);
}

.offer-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.offer-content {
  padding: 1.5rem;
}

.offer-content h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.offer-content p {
  color: #6b7280;
  margin-bottom: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 0.2s;
  cursor: pointer;
}

.btn-primary {
  background: #6366f1;
  color: white;
  border: none;
}

.btn-primary:hover {
  background: #4f46e5;
}

@media (max-width: 768px) {
  .home {
    padding: 1rem;
  }

  .hero {
    padding: 3rem 1rem;
  }

  .hero h1 {
    font-size: 2rem;
  }

  section h2 {
    font-size: 1.5rem;
  }

  .categories-grid,
  .products-grid,
  .offers-grid {
    grid-template-columns: 1fr;
  }
}
</style> 