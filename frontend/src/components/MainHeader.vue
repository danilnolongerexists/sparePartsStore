<template>
  <header class="main-header">
    <img src="@/assets/logo1.png" alt="Логотип магазина" class="main-logo" @click="$router.push('/')" style="cursor:pointer;" />
    <div class="header-icons">
      <div class="center-icons">
        <button class="icon-btn">
          <img src="@/assets/icons/catalog.svg" alt="Каталог" class="icon-img" />
          <span>Каталог</span>
        </button>
        <div class="search-wrapper">
          <input type="text" placeholder="Поиск..." class="search-input" />
          <img src="@/assets/icons/search.svg" alt="Поиск" class="search-icon" />
        </div>
      </div>
      <button class="icon-btn">
        <img src="@/assets/icons/cart.svg" alt="Корзина" class="icon-img" />
        <span>Корзина</span>
      </button>
      <button v-if="!isAuth" class="icon-btn" @click="$emit('login')">
        <img src="@/assets/icons/profile.svg" alt="Войти" class="icon-img" />
        <span>Войти</span>
      </button>
      <button v-else class="icon-btn" @click="$emit('profile')">
        <img src="@/assets/icons/profile.svg" alt="Профиль" class="icon-img" />
        <span>{{ userName || 'Профиль' }}</span>
      </button>
    </div>
  </header>
</template>

<script>
export default {
  name: 'MainHeader',
  props: {
    isAuth: {
      type: Boolean,
      required: true
    },
    userName: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
.main-header {
  color: #fff;
  padding: 1.5rem 1rem 1rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.main-logo {
  height: 48px;
  width: auto;
  display: block;
}
.header-icons {
  display: flex;
  gap: 1.5rem;
  align-items: flex-end;
  flex: 1;
  justify-content: flex-end;
}
.center-icons {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  justify-content: center;
  flex: 1;
}
.search-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 640px;
  height: 100%;
}
.search-input {
  padding: 0.65rem 2.4rem 0.65rem 1.2rem;
  border-radius: 28px;
  border: none;
  background: #f5f7fa;
  font-size: 1.12rem;
  outline: none;
  width: 640px;
  box-sizing: border-box;
  box-shadow: 0 2px 8px rgba(44,62,80,0.07);
  transition: box-shadow 0.2s, background 0.2s;
  color: #222;
  margin-bottom: 0.1rem;
}
.search-input:focus {
  background: #fff;
  box-shadow: 0 4px 16px rgba(44,62,80,0.13);
}
.search-icon {
  width: 24px;
  height: 24px;
  position: absolute;
  right: 1.1rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  opacity: 0.7;
  filter: drop-shadow(0 1px 2px rgba(44,62,80,0.10));
}
.icon-btn {
  background: none;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  color: #2d3e50;
  font-size: 0.95rem;
  font-weight: 600;
  transition: color 0.2s, background 0.2s;
  padding: 0;
}
.icon-btn span {
  font-weight: 600;
}
.icon-btn:hover {
  color: #e53935;
  border-radius: 8px;
}
.icon-img {
  width: 24px;
  height: 24px;
  margin-bottom: 0.2rem;
}
.profile-icon-btn {
  width: 20px;
  height: 20px;
  margin-right: 0.5rem;
  vertical-align: middle;
}
.profile-btn {
  background: #2d3e50;
  color: #fff;
  border: none;
  display: flex;
  align-items: center;
  font-size: 1rem;
  padding: 0.5rem 1.2rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
  margin-left: 1.2rem;
}
.profile-btn:hover {
  background: #1976d2;
}
@media (max-width: 900px) {
  .main-header {
    flex-direction: column;
    align-items: stretch;
    padding: 1rem 0.5rem 0.5rem 0.5rem;
  }
  .main-logo {
    margin: 0 auto 1rem auto;
    height: 40px;
  }
  .header-icons {
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
  }
  .center-icons {
    gap: 1rem;
  }
  .search-wrapper {
    min-width: 220px;
    width: 100%;
    margin: 0 0 1rem 0;
  }
  .search-input {
    width: 100%;
    min-width: 0;
    max-width: 100vw;
  }
}
@media (max-width: 600px) {
  .main-header {
    flex-direction: column;
    align-items: stretch;
    padding: 0.7rem 0.2rem 0.2rem 0.2rem;
  }
  .main-logo {
    margin: 0 auto 0.7rem auto;
    height: 32px;
  }
  .header-icons {
    flex-direction: column;
    gap: 0.7rem;
    align-items: stretch;
  }
  .center-icons {
    flex-direction: column;
    gap: 0.7rem;
    align-items: stretch;
  }
  .search-wrapper {
    width: 100%;
    min-width: 0;
    margin: 0 0 0.7rem 0;
  }
  .search-input {
    width: 100%;
    min-width: 0;
    max-width: 100vw;
    font-size: 1rem;
    padding: 0.5rem 2.2rem 0.5rem 1.1rem;
  }
  .icon-btn {
    font-size: 0.95rem;
    padding: 0.3rem 0 0.1rem 0;
  }
  .icon-btn span {
    font-size: 0.92rem;
  }
}
</style>
