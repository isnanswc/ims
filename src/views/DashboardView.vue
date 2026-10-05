<template>
  <div class="space-y-6 pb-24 md:pb-6">
    <!-- Top Welcome & Quick Actions Banner (Estetik Glass Gradient) -->
    <div class="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-900 text-white shadow-xl shadow-emerald-900/10 border border-white/20">
      <!-- Ambient light reflections -->
      <div class="absolute -right-10 -top-10 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -left-10 -bottom-10 w-64 h-64 bg-teal-300/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <div>
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-md text-emerald-100 border border-white/20">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Offline-Ready • IndexedDB Local Storage
          </span>
          <h1 class="text-xl sm:text-3xl font-extrabold mt-3 tracking-tight">Ringkasan Gudang & Inventaris</h1>
          <p class="text-emerald-100/90 text-xs sm:text-sm mt-1 max-w-xl">
            Sistem manajemen persediaan stok berbasis dokumen transaksi di sisi client.
          </p>
        </div>

        <!-- Quick Action Buttons -->
        <div class="flex items-center gap-2.5">
          <button 
            @click="$emit('quick-action', 'inbound')"
            class="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-white text-emerald-900 hover:bg-emerald-50 rounded-2xl font-bold text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all"
          >
            <ArrowDownLeft class="w-4 h-4 text-emerald-600" />
            <span>+ TO Masuk</span>
          </button>
          <button 
            @click="$emit('quick-action', 'outbound')"
            class="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-lg shadow-rose-900/20 transition-all"
          >
            <ArrowUpRight class="w-4 h-4" />
            <span>- TO Keluar</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Stat Metric Cards (Glass Matte Effect) -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
      <!-- Total SKU -->
      <div class="glass-card glass-card-hover p-4 sm:p-5 flex items-center gap-3.5">
        <div class="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
          <Package class="w-6 h-6" />
        </div>
        <div class="min-w-0">
          <p class="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">Total Master Item</p>
          <p class="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">{{ metrics.totalItems }} <span class="text-xs font-normal text-slate-400">SKU</span></p>
        </div>
      </div>

      <!-- Total Fisik Unit -->
      <div class="glass-card glass-card-hover p-4 sm:p-5 flex items-center gap-3.5">
        <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
          <Layers class="w-6 h-6" />
        </div>
        <div class="min-w-0">
          <p class="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">Total Unit Fisik</p>
          <p class="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">{{ metrics.totalStockUnits }} <span class="text-xs font-normal text-slate-400">Unit</span></p>
        </div>
      </div>

      <!-- Inbound Hari Ini -->
      <div class="glass-card glass-card-hover p-4 sm:p-5 flex items-center gap-3.5">
        <div class="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/20">
          <ArrowDownLeft class="w-6 h-6" />
        </div>
        <div class="min-w-0">
          <p class="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">TO Masuk Hari Ini</p>
          <p class="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">+{{ metrics.todayInQty }}</p>
        </div>
      </div>

      <!-- Outbound Hari Ini -->
      <div class="glass-card glass-card-hover p-4 sm:p-5 flex items-center gap-3.5">
        <div class="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20">
          <ArrowUpRight class="w-6 h-6" />
        </div>
        <div class="min-w-0">
          <p class="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">TO Keluar Hari Ini</p>
          <p class="text-xl sm:text-2xl font-extrabold text-rose-600 dark:text-rose-400">-{{ metrics.todayOutQty }}</p>
        </div>
      </div>
    </div>

    <!-- Alert Stok Kritis / Menipis (Glass Matte Amber) -->
    <div v-if="lowStockItems.length > 0" class="glass-card p-4 sm:p-5 border-l-4 border-l-amber-500 bg-amber-500/5">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <AlertTriangle class="w-5 h-5 text-amber-500" />
          <h2 class="text-sm font-bold text-amber-900 dark:text-amber-300">Perhatian: Stok Menipis ({{ lowStockItems.length }} Item)</h2>
        </div>
        <div class="flex items-center gap-2">
          <button 
            @click="$emit('change-tab', 'ppic')" 
            class="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 shadow-sm transition-all"
          >
            <Calculator class="w-3.5 h-3.5" />
            <span>Perencanaan PPIC</span>
          </button>
          <button 
            @click="$emit('change-tab', 'items')" 
            class="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline"
          >
            Lihat Semua &rarr;
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        <div 
          v-for="item in lowStockItems.slice(0, 3)" 
          :key="item.uniqCode"
          class="glass-card p-3 flex items-center justify-between"
        >
          <div class="min-w-0">
            <span class="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded">
              {{ item.uniqCode }}
            </span>
            <p class="text-xs font-semibold text-slate-900 dark:text-white truncate mt-1">{{ item.deskripsi }}</p>
            <p class="text-[11px] text-slate-400">Min. Aman: {{ item.minStock || 0 }} {{ item.satuan }}</p>
          </div>
          <div class="text-right shrink-0 ml-3">
            <span class="inline-block px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
              Sisa {{ item.currentStock }} {{ item.satuan }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 2 Column Section: Aktivitas Transaksi Terakhir & Stok Terkini -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Dokumen Transaksi Terakhir -->
      <div class="glass-card p-4 sm:p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-bold text-slate-900 dark:text-white text-sm sm:text-base flex items-center gap-2">
            <History class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Dokumen Transaksi Terbaru
          </h2>
          <button 
            @click="$emit('change-tab', 'transactions')" 
            class="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
          >
            Selengkapnya
          </button>
        </div>

        <div v-if="recentTransactions.length === 0" class="text-center py-8 text-slate-400 text-xs">
          Belum ada riwayat dokumen transaksi.
        </div>

        <div v-else class="space-y-2.5">
          <div 
            v-for="tx in recentTransactions" 
            :key="tx.id"
            class="p-3 rounded-xl bg-white/60 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800 flex items-center justify-between gap-3 hover:bg-white/80 dark:hover:bg-slate-800/60 transition-colors"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div 
                :class="[
                  'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs',
                  tx.type === 'IN' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                ]"
              >
                {{ tx.type }}
              </div>
              <div class="min-w-0">
                <p class="text-xs font-semibold text-slate-900 dark:text-white truncate font-mono">{{ tx.trxCode }}</p>
                <div class="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                  <span>Doc: {{ tx.noDocument || '-' }}</span>
                  <span>•</span>
                  <span>{{ tx.items?.length || 0 }} jenis item</span>
                </div>
              </div>
            </div>
            <div class="text-right shrink-0">
              <span :class="['font-bold text-xs sm:text-sm', tx.type === 'IN' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400']">
                {{ tx.type === 'IN' ? '+' : '-' }}{{ tx.totalQty }} Unit
              </span>
              <p class="text-[10px] text-slate-400">{{ tx.tanggal }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Informasi Cepat Stok -->
      <div class="glass-card p-4 sm:p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-bold text-slate-900 dark:text-white text-sm sm:text-base flex items-center gap-2">
            <Package class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Daftar Stok Terkini
          </h2>
          <button 
            @click="$emit('change-tab', 'items')" 
            class="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
          >
            Lihat Semua
          </button>
        </div>

        <div class="space-y-2.5">
          <div 
            v-for="item in itemsWithStock.slice(0, 5)" 
            :key="item.uniqCode"
            class="p-3 rounded-xl bg-white/60 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800 flex items-center justify-between gap-3"
          >
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <span class="font-mono text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded border border-slate-200/50 dark:border-slate-700">
                  {{ item.uniqCode }}
                </span>
                <span class="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{{ item.deskripsi }}</span>
              </div>
              <p class="text-[11px] text-slate-400 mt-0.5">{{ item.satuan }} • {{ item.keterangan || 'Tanpa catatan' }}</p>
            </div>
            <div class="text-right shrink-0 flex items-center gap-2">
              <span 
                :class="[
                  'px-2 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center gap-1',
                  item.stockLevel === 'CRITICAL' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-300 dark:border-rose-800' :
                  item.stockLevel === 'REORDER' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-300 dark:border-amber-800' :
                  item.stockLevel === 'OVERSTOCK' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 border-purple-300 dark:border-purple-800' :
                  'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                ]"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="[
                  item.stockLevel === 'CRITICAL' ? 'bg-rose-500' :
                  item.stockLevel === 'REORDER' ? 'bg-amber-500' :
                  item.stockLevel === 'OVERSTOCK' ? 'bg-purple-500' : 'bg-emerald-500'
                ]"></span>
                <span>{{ item.stockLevelLabel || 'Optimal' }}</span>
              </span>
              <span class="font-bold text-xs text-slate-900 dark:text-white">
                {{ item.currentStock }} {{ item.satuan }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { 
  Package, 
  Layers, 
  ArrowDownLeft, 
  ArrowUpRight, 
  AlertTriangle, 
  History,
  Calculator
} from 'lucide-vue-next';

const props = defineProps({
  itemsWithStock: {
    type: Array,
    default: () => []
  },
  transactions: {
    type: Array,
    default: () => []
  }
});

defineEmits(['change-tab', 'quick-action']);

const todayStr = new Date().toISOString().split('T')[0];

const metrics = computed(() => {
  const totalItems = props.itemsWithStock.length;
  const totalStockUnits = props.itemsWithStock.reduce((acc, curr) => acc + (curr.currentStock || 0), 0);

  const todayTxs = props.transactions.filter(t => t.tanggal === todayStr);
  const todayInQty = todayTxs
    .filter(t => t.type === 'IN')
    .reduce((acc, curr) => acc + (Number(curr.totalQty) || Number(curr.qty) || 0), 0);
  const todayOutQty = todayTxs
    .filter(t => t.type === 'OUT')
    .reduce((acc, curr) => acc + (Number(curr.totalQty) || Number(curr.qty) || 0), 0);

  return {
    totalItems,
    totalStockUnits,
    todayInQty,
    todayOutQty
  };
});

const lowStockItems = computed(() => {
  return props.itemsWithStock.filter(item => item.isLowStock);
});

const recentTransactions = computed(() => {
  return [...props.transactions].reverse().slice(0, 5);
});
</script>
