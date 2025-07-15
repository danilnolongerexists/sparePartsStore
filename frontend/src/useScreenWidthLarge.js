import { ref, onMounted, onBeforeUnmount } from 'vue';

export function useScreenWidthLarge() {
  const is_large_screen = ref(window.innerWidth > 1100);  // Проверка на ширину больше 1100px

  const resizeHandler = () => {
    is_large_screen.value = window.innerWidth > 1100;  // Обновляем значение при изменении ширины
  };

  onMounted(() => {
    window.addEventListener('resize', resizeHandler);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeHandler);
  });

  return { is_large_screen };
}
