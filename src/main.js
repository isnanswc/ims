import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import { db, seedDemoDataIfEmpty } from './database/db'

// Pastikan dataset berisi 20 items & 50 transaksi 3 bulan terakhir
db.items.count().then(count => {
  if (count < 20) {
    return seedDemoDataIfEmpty(true)
  }
  return seedDemoDataIfEmpty(false)
}).then(() => {
  createApp(App).mount('#app')
})
