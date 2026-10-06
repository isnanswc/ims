<template>
  <div :class="[
    'min-h-screen transition-colors duration-150 font-[\'Plus_Jakarta_Sans\',sans-serif] relative overflow-x-clip',
    isDark ? 'bg-[#09090b] text-zinc-100' : 'bg-[#fafafa] text-zinc-900'
  ]">
    <!-- Sidebar Component (Collapsible & Mobile Drawer) -->
    <Sidebar 
      :active-tab="activeTab" 
      :is-dark="isDark"
      v-model:is-collapsed="isSidebarCollapsed"
      @change-tab="handleTabChange" 
      @toggle-dark="toggleDarkMode"
    />

    <!-- Main Content Dynamic Container with Responsive Margin -->
    <div 
      :class="[
        'transition-all duration-200 ease-in-out flex flex-col min-h-screen',
        isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
      ]"
    >
      <!-- Top Status Bar (Breadcrumb Interaktif & Sticky) -->
      <StatusBar 
        :page-title="currentPageInfo.title" 
        :page-subtitle="currentPageInfo.subtitle"
        :active-tab="activeTab"
        :sub-page-title="subPageTitle"
        @navigate="handleBreadcrumbNavigate"
        @reset-menu="handleResetMenu"
      />

      <!-- Dynamic Views Container (In-Memory Cached with KeepAlive) -->
      <main class="flex-1 max-w-7xl w-full mx-auto p-3.5 sm:p-6 lg:p-8">
        <KeepAlive>
          <DashboardView 
            v-if="activeTab === 'dashboard'" 
            :items-with-stock="itemsWithStock" 
            :transactions="transactions"
            @change-tab="handleTabChange"
            @quick-action="handleQuickAction"
            @refresh-data="loadAllData"
          />

          <MasterItemView 
            v-else-if="activeTab === 'items'" 
            :items-with-stock="itemsWithStock"
            @refresh-data="loadAllData"
          />

          <TransactionView 
            v-else-if="activeTab === 'transactions'" 
            ref="transactionViewRef"
            :items-with-stock="itemsWithStock" 
            :transactions="transactions"
            @refresh-data="loadAllData"
            @subpage-change="handleSubpageChange"
          />

          <LedgerView 
            v-else-if="activeTab === 'ledger'" 
            ref="ledgerViewRef"
            :items-with-stock="itemsWithStock" 
            @refresh-data="loadAllData"
            @subpage-change="handleSubpageChange"
          />
          <PPICView 
            v-else-if="activeTab === 'ppic'" 
            :items-with-stock="itemsWithStock" 
            :transactions="transactions" 
            @refresh-data="loadAllData" 
            @create-order="handleCreateOrderFromPPIC" 
          />

          <LocationView 
            v-else-if="activeTab === 'locations'" 
            :items-with-stock="itemsWithStock" 
            @refresh-data="loadAllData" 
          />

          <BackupView 
            v-else-if="activeTab === 'backup'" 
            :items-with-stock="itemsWithStock" 
            :transactions="transactions"
            @refresh-data="loadAllData"
          />
        </KeepAlive>
      </main>

      <!-- Minimalist Subtle Footer -->
      <footer class="py-4 text-center text-[11px] text-zinc-400 dark:text-zinc-600 border-t border-zinc-200/60 dark:border-zinc-850 pb-20 md:pb-4">
        <span>IMS Client-Side Pro • 100% Offline IndexedDB</span>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Sidebar from './components/Sidebar.vue';
import StatusBar from './components/StatusBar.vue';
import DashboardView from './views/DashboardView.vue';
import MasterItemView from './views/MasterItemView.vue';
import TransactionView from './views/TransactionView.vue';
import LedgerView from './views/LedgerView.vue';
import BackupView from './views/BackupView.vue';
import PPICView from './views/PPICView.vue';
import LocationView from './views/LocationView.vue';
import { db, getItemsWithCurrentStock, syncItemLocationsWithCurrentStock } from './database/db';

const activeTab = ref('dashboard');
const isDark = ref(false);
const isSidebarCollapsed = ref(false);
const subPageTitle = ref('');

const itemsWithStock = ref([]);
const transactions = ref([]);
const transactionViewRef = ref(null);
const ledgerViewRef = ref(null);

const pageMetaMap = {
  dashboard: { title: 'Dashboard Inventaris', subtitle: 'Ringkasan Real-Time & Metrik Stok' },
  items: { title: 'Master Data Barang', subtitle: 'Katalog SKU & Batas Minimum Stok' },
  transactions: { title: 'Transfer Order', subtitle: 'Pencatatan Dokumen Masuk & Keluar' },
  ledger: { title: 'Item Ledger (Kartu Stok)', subtitle: 'Riwayat Kronologis & Saldo Berjalan' },
  ppic: { title: 'Perencanaan PPIC', subtitle: 'Analisis Kebutuhan & Rekomendasi Pengadaan' },
  locations: { title: 'Manajemen Lokasi & Mutasi', subtitle: 'Tata Letak Gudang, Kapasitas & Movement' },
  backup: { title: 'Cadangan & Pemulihan', subtitle: 'Export & Import Data Lokal' }
};

const currentPageInfo = computed(() => {
  return pageMetaMap[activeTab.value] || { title: 'IMS Pro', subtitle: '' };
});

function updateDynamicFavicon(isDarkMode) {
  try {
    const metaTheme = document.getElementById('meta-theme-color');
    if (metaTheme) {
      metaTheme.setAttribute('content', isDarkMode ? '#09090b' : '#fafafa');
    }

    const favicon = document.getElementById('dynamic-favicon');
    if (!favicon) return;

    const svgData = isDarkMode
      ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><polygon points="24,6 40,15 24,24 8,15" fill="#18181b" stroke="#3f3f46" stroke-width="1.5"/><polygon points="8,15 24,24 24,42 8,33" fill="#09090b" stroke="#3f3f46" stroke-width="1.5"/><polygon points="24,24 40,15 40,33 24,42" fill="#121215" stroke="#3f3f46" stroke-width="1.5"/><line x1="24" y1="6" x2="24" y2="24" stroke="#27272a" stroke-width="1.8"/><line x1="24" y1="24" x2="24" y2="42" stroke="#27272a" stroke-width="1.8"/><polygon points="24,11 29,13.5 24,16 19,13.5" fill="#27272a" stroke="#52525b" stroke-width="1"/><path d="M 8,33 L 8,15 L 24,6 L 40,15 L 40,33" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M 24,42 L 24,24 L 40,15" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/><circle cx="24" cy="6" r="2" fill="#ffffff"/><circle cx="8" cy="15" r="2" fill="#ffffff"/><circle cx="40" cy="15" r="2" fill="#ffffff"/><circle cx="24" cy="42" r="2" fill="#ffffff"/></svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><polygon points="24,6 40,15 24,24 8,15" fill="#ffffff" stroke="#18181b" stroke-width="1.5"/><polygon points="8,15 24,24 24,42 8,33" fill="#e4e4e7" stroke="#18181b" stroke-width="1.5"/><polygon points="24,24 40,15 40,33 24,42" fill="#f4f4f5" stroke="#18181b" stroke-width="1.5"/><line x1="24" y1="6" x2="24" y2="24" stroke="#71717a" stroke-width="1.8"/><line x1="24" y1="24" x2="24" y2="42" stroke="#71717a" stroke-width="1.8"/><polygon points="24,11 29,13.5 24,16 19,13.5" fill="#d4d4d8" stroke="#18181b" stroke-width="1"/><path d="M 8,33 L 8,15 L 24,6 L 40,15 L 40,33" stroke="#09090b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M 24,42 L 24,24 L 40,15" stroke="#09090b" stroke-width="2" stroke-linecap="round"/><circle cx="24" cy="6" r="2" fill="#09090b"/><circle cx="8" cy="15" r="2" fill="#09090b"/><circle cx="40" cy="15" r="2" fill="#09090b"/><circle cx="24" cy="42" r="2" fill="#09090b"/></svg>`;

    favicon.setAttribute('href', 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData));
  } catch (err) {
    console.warn('Favicon update error:', err);
  }
}

function initTheme() {
  const saved = localStorage.getItem('ims_theme');
  if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDark.value = true;
    document.documentElement.classList.add('dark');
  } else {
    isDark.value = false;
    document.documentElement.classList.remove('dark');
  }
  updateDynamicFavicon(isDark.value);
}

function toggleDarkMode() {
  isDark.value = !isDark.value;
  if (isDark.value) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('ims_theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('ims_theme', 'light');
  }
  updateDynamicFavicon(isDark.value);
}

async function loadAllData() {
  const txs = await db.transactions.toArray();
  const items = await getItemsWithCurrentStock(null, txs);
  itemsWithStock.value = items;
  transactions.value = txs;
}

function handleSubpageChange(subTitle) {
  subPageTitle.value = subTitle || '';
}

function handleTabChange(newTab) {
  if (activeTab.value === newTab) {
    handleResetMenu(newTab);
    return;
  }
  activeTab.value = newTab;
  subPageTitle.value = '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleBreadcrumbNavigate(targetTab) {
  activeTab.value = targetTab;
  subPageTitle.value = '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleResetMenu(tab) {
  activeTab.value = tab;
  subPageTitle.value = '';
  if (tab === 'transactions' && transactionViewRef.value?.resetToList) {
    transactionViewRef.value.resetToList();
  }
  if (tab === 'ledger' && ledgerViewRef.value?.resetToList) {
    ledgerViewRef.value.resetToList();
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleQuickAction(type) {
  activeTab.value = 'transactions';
  setTimeout(() => {
    if (transactionViewRef.value) {
      transactionViewRef.value.openCreatePage(type.toUpperCase());
    }
  }, 100);
}

function handleCreateOrderFromPPIC(payload) {
  activeTab.value = 'transactions';
  setTimeout(() => {
    if (transactionViewRef.value) {
      transactionViewRef.value.openCreatePage(payload.type || 'IN', payload.items || []);
    }
  }, 100);
}

onMounted(async () => {
  initTheme();
  await loadAllData();
  setTimeout(() => {
    syncItemLocationsWithCurrentStock();
  }, 150);
});
</script>
