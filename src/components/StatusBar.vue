<template>
  <header class="sticky top-0 z-40 glass-panel border-b border-zinc-200/90 dark:border-zinc-800 px-3 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2 text-xs shadow-sm">
    <!-- Breadcrumb Interaktif & Keterangan Pages -->
    <nav class="flex items-center space-x-1 sm:space-x-1.5 min-w-0 select-none" aria-label="Breadcrumb">
      <!-- Home / Dashboard Button -->
      <button 
        @click="$emit('navigate', 'dashboard')" 
        class="group flex items-center gap-1.5 px-2 py-1 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        title="Kembali ke Dashboard Utama"
      >
        <Home class="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
        <span class="font-extrabold text-[11px] tracking-tight">IMS</span>
      </button>

      <ChevronRight class="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600 shrink-0" />

      <!-- Current Menu / Page Button -->
      <button 
        @click="$emit('reset-menu', activeTab)" 
        :class="[
          'px-2 py-1 rounded-lg font-bold transition-all text-xs flex items-center gap-1 truncate',
          subPageTitle 
            ? 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800' 
            : 'text-zinc-950 dark:text-white bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 shadow-sm'
        ]"
        :title="`Klik untuk ke Halaman Utama ${pageTitle}`"
      >
        <span>{{ pageTitle }}</span>
      </button>

      <!-- Sub-Page Badge (misal: Buat Transfer Masuk, Edit, Kartu Stok SKU) -->
      <template v-if="subPageTitle">
        <ChevronRight class="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600 shrink-0" />
        <span class="px-2 py-0.5 rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-semibold border border-zinc-950 dark:border-white text-[11px] truncate max-w-[140px] sm:max-w-xs shadow-sm">
          {{ subPageTitle }}
        </span>
      </template>

      <!-- Optional Subtitle jika tidak ada sub-page -->
      <span v-else-if="pageSubtitle" class="hidden md:inline text-zinc-400 text-[11px] truncate">
        • {{ pageSubtitle }}
      </span>
    </nav>

    <!-- Status Badges & Real-time Info -->
    <div class="flex items-center space-x-2.5 text-[11px]">
      <!-- Status Penyimpanan IndexedDB Monokrom Bersih -->
      <div class="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 font-medium">
        <span class="w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-white animate-pulse"></span>
        <HardDrive class="w-3 h-3 text-zinc-700 dark:text-zinc-300" />
        <span class="hidden md:inline">Penyimpanan Lokal:</span>
        <span class="font-bold">IndexedDB Aktif</span>
      </div>

      <!-- Status Waktu Sistem -->
      <div class="hidden lg:flex items-center space-x-1.5 text-zinc-400 px-2 py-0.5">
        <Clock class="w-3 h-3" />
        <span>{{ currentTime }}</span>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Home, HardDrive, Clock, ChevronRight } from 'lucide-vue-next';

defineProps({
  pageTitle: {
    type: String,
    required: true
  },
  pageSubtitle: {
    type: String,
    default: ''
  },
  activeTab: {
    type: String,
    default: 'dashboard'
  },
  subPageTitle: {
    type: String,
    default: ''
  }
});

defineEmits(['navigate', 'reset-menu']);

const currentTime = ref('');
let timer = null;

function updateClock() {
  const now = new Date();
  currentTime.value = now.toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

onMounted(() => {
  updateClock();
  timer = setInterval(updateClock, 30000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>
