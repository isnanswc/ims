<template>
  <div :class="[
    'min-h-screen transition-colors duration-300 font-[\'Plus_Jakarta_Sans\',sans-serif] relative overflow-x-clip',
    isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
  ]">
    <!-- Ambient Aesthetic Light Accents (Soft Light Blur Effects) -->
    <div class="fixed top-0 left-1/4 w-[500px] h-[500px] bg-emerald-400/10 dark:bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none -z-10"></div>
    <div class="fixed bottom-10 right-10 w-[450px] h-[450px] bg-teal-300/15 dark:bg-teal-500/5 rounded-full blur-[130px] pointer-events-none -z-10"></div>
    <div class="fixed top-1/2 right-1/4 w-[350px] h-[350px] bg-blue-300/10 dark:bg-blue-600/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>

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
        'transition-all duration-300 ease-in-out flex flex-col min-h-screen',
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

      <!-- Dynamic Views Container -->
      <main class="flex-1 max-w-7xl w-full mx-auto p-3.5 sm:p-6 lg:p-8">
        <DashboardView 
          v-if="activeTab === 'dashboard'" 
          :items-with-stock="itemsWithStock" 
          :transactions="transactions"
          @change-tab="handleTabChange"
          @quick-action="handleQuickAction"
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

        <BackupView 
          v-else-if="activeTab === 'backup'" 
          :items-with-stock="itemsWithStock" 
          :transactions="transactions"
          @refresh-data="loadAllData"
        />
      </main>

      <!-- Minimalist Subtle Footer -->
      <footer class="py-4 text-center text-[11px] text-slate-400 dark:text-slate-600 border-t border-slate-200/40 dark:border-slate-800/60 pb-20 md:pb-4">
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
import { db, getItemsWithCurrentStock } from './database/db';

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
  backup: { title: 'Cadangan & Pemulihan', subtitle: 'Export & Import Data Lokal' }
};

const currentPageInfo = computed(() => {
  return pageMetaMap[activeTab.value] || { title: 'IMS Pro', subtitle: '' };
});

function initTheme() {
  const saved = localStorage.getItem('ims_theme');
  if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDark.value = true;
    document.documentElement.classList.add('dark');
  } else {
    isDark.value = false;
    document.documentElement.classList.remove('dark');
  }
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
}

async function loadAllData() {
  itemsWithStock.value = await getItemsWithCurrentStock();
  transactions.value = await db.transactions.toArray();
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

onMounted(() => {
  initTheme();
  loadAllData();
});
</script>
