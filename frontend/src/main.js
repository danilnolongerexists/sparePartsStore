import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Toast, { POSITION } from 'vue-toastification'
import 'vue-toastification/dist/index.css'

import './assets/main.scss'
// import './assets/normalize.css'

const app = createApp(App)
app.use(router)
app.use(Toast, { position: POSITION.TOP_RIGHT, timeout: 2000 })
app.mount('#app')
