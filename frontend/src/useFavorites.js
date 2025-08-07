import { ref } from 'vue';
import axios from 'axios';

export function useFavorites() {
  const favorites = ref([]);

  const fetchFavorites = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return;
      const response = await axios.get('/api/favorites', {
        headers: { 'x-user-id': userId }
      });
      favorites.value = response.data;
    } catch (error) {
      console.error('Ошибка при получении избранного:', error);
    }
  };

  const addToFavorites = async (productId) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return;
      await axios.post('/api/favorites', { user_id: userId, product_id: productId });
      await fetchFavorites();
    } catch (error) {
      console.error('Ошибка при добавлении в избранное:', error);
    }
  };

  const removeFromFavorites = async (productId) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return;
      await axios.delete(`/api/favorites/${productId}`, {
        headers: { 'x-user-id': userId }
      });
      await fetchFavorites();
    } catch (error) {
      console.error('Ошибка при удалении из избранного:', error);
    }
  };

  const isFavorite = (productId) => {
    return favorites.value.includes(productId);
  };

  return {
    favorites,
    fetchFavorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite
  };
}
