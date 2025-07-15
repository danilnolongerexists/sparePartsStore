import { ref, onMounted, onBeforeUnmount } from 'vue';

export function useScreenWidth() {
  const is_mobile = ref(window.innerWidth < 1100);

  const resizeHandler = () => {
    is_mobile.value = window.innerWidth < 1100;
  };

  onMounted(() => {
    window.addEventListener('resize', resizeHandler);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeHandler);
  });

  return { is_mobile };
}
