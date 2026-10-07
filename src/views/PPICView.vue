<template>
  <div class="space-y-5 pb-24 md:pb-6">
    <!-- Header Banner Perencanaan PPIC (Glass Matte) -->
    <div class="glass-card p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div>
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center shadow-xs border border-zinc-950 dark:border-white">
            <Calculator class="w-4 h-4" />
          </div>
          <h1 class="text-base sm:text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <span>Perencanaan Stok & Pengadaan (PPIC)</span>
            <span class="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700">
              Supply Intelligence
            </span>
          </h1>
        </div>
        <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">
          Analisis otomatis kebutuhan pengadaan berbasis konsumsi riwayat mutasi, estimasi hari persediaan habis (Days of Supply), serta eksekusi pesanan reorder langsung dalam 1-klik.
        </p>
      </div>

      <!-- Action Buttons: Kalkulator Simulasi PPIC, Batch PO & Export Excel -->
      <div class="flex flex-wrap items-center gap-2">
        <button 
          @click="openGeneralPPICCalculator"
          class="flex items-center gap-2 px-4 py-2 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 rounded-xl text-xs font-bold shadow-sm border border-zinc-950 dark:border-white transition-all cursor-pointer"
          title="Buka Kalkulator Simulasi PPIC Step-by-Step"
        >
          <Calculator class="w-4 h-4" />
          <span>Kalkulator Simulasi PPIC</span>
        </button>

        <button 
          @click="exportPPICToExcel"
          class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-sm"
        >
          <FileSpreadsheet class="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
          <span>Ekspor Rencana (.xlsx)</span>
        </button>

        <button 
          v-if="reorderItems.length > 0"
          @click="orderAllReorderItems"
          class="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl text-xs font-bold shadow-sm border border-zinc-300 dark:border-zinc-700 transition-all"
          :title="`Buat Transfer Order Masuk untuk ${reorderItems.length} item yang butuh dipesan`"
        >
          <ShoppingCart class="w-4 h-4" />
          <span>+ Pesan Borongan ({{ reorderItems.length }} Item)</span>
        </button>
      </div>
    </div>

    <!-- Stat Metric Cards: PPIC 4 Leveling Overview (Dengan Skeleton Shimmer) -->
    <SkeletonLoader v-if="isLoading" type="kpi" :count="5" :cols="3" />
    <div v-else class="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
      <!-- 1. Kritis -->
      <div 
        @click="activeStatusFilter = 'CRITICAL'"
        :class="[
          'glass-card p-3.5 cursor-pointer transition-all border-l-4 border-l-rose-500',
          activeStatusFilter === 'CRITICAL' ? 'ring-2 ring-rose-500/30 bg-rose-50/20 dark:bg-rose-950/20' : 'glass-card-hover'
        ]"
      >
        <span class="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 block">Stok Kritis</span>
        <div class="flex items-baseline justify-between mt-1">
          <strong class="text-xl sm:text-2xl font-black text-rose-700 dark:text-rose-300">{{ criticalCount }}</strong>
          <span class="text-[10px] text-slate-400 font-mono">SKU Mendesak</span>
        </div>
      </div>

      <!-- 2. Reorder -->
      <div 
        @click="activeStatusFilter = 'REORDER'"
        :class="[
          'glass-card p-3.5 cursor-pointer transition-all border-l-4 border-l-amber-500',
          activeStatusFilter === 'REORDER' ? 'ring-2 ring-amber-500/30 bg-amber-50/20 dark:bg-amber-950/20' : 'glass-card-hover'
        ]"
      >
        <span class="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 block">Perlu Reorder</span>
        <div class="flex items-baseline justify-between mt-1">
          <strong class="text-xl sm:text-2xl font-black text-amber-700 dark:text-amber-300">{{ reorderCount }}</strong>
          <span class="text-[10px] text-slate-400 font-mono">Stok &le; ROP</span>
        </div>
      </div>

      <!-- 3. Optimal -->
      <div 
        @click="activeStatusFilter = 'OPTIMAL'"
        :class="[
          'glass-card p-3.5 cursor-pointer transition-all border-l-4 border-l-emerald-500',
          activeStatusFilter === 'OPTIMAL' ? 'ring-2 ring-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/20' : 'glass-card-hover'
        ]"
      >
        <span class="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">Stok Optimal</span>
        <div class="flex items-baseline justify-between mt-1">
          <strong class="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-300">{{ optimalCount }}</strong>
          <span class="text-[10px] text-slate-400 font-mono">Persediaan Sehat</span>
        </div>
      </div>

      <!-- 4. Overstock -->
      <div 
        @click="activeStatusFilter = 'OVERSTOCK'"
        :class="[
          'glass-card p-3.5 cursor-pointer transition-all border-l-4 border-l-purple-500',
          activeStatusFilter === 'OVERSTOCK' ? 'ring-2 ring-purple-500/30 bg-purple-50/20 dark:bg-purple-950/20' : 'glass-card-hover'
        ]"
      >
        <span class="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400 block">Overstock</span>
        <div class="flex items-baseline justify-between mt-1">
          <strong class="text-xl sm:text-2xl font-black text-purple-700 dark:text-purple-300">{{ overstockCount }}</strong>
          <span class="text-[10px] text-slate-400 font-mono">Kelebihan Kapasitas</span>
        </div>
      </div>

      <!-- 5. Total Saran Belanja Unit -->
      <div class="col-span-2 lg:col-span-1 glass-card p-3.5 border-l-4 border-l-blue-500 bg-blue-500/5">
        <span class="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 block">Saran Total Belanja</span>
        <div class="flex items-baseline justify-between mt-1">
          <strong class="text-xl sm:text-2xl font-black text-blue-700 dark:text-blue-300">{{ totalSuggestedOrderUnits }}</strong>
          <span class="text-[10px] text-slate-400 font-mono">Unit Kebutuhan</span>
        </div>
      </div>
    </div>

    <!-- Toolbar: Search, Filter Tabs & Sort -->
    <div class="glass-card p-3 space-y-2.5">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <!-- Search Input -->
        <div class="relative w-full sm:w-80">
          <Search class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Cari kode SKU atau nama barang..."
            class="w-full pl-9 pr-3 py-1.5 glass-input rounded-xl text-xs"
          />
        </div>

        <!-- Filter Tab Buttons -->
        <div class="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          <button 
            @click="activeStatusFilter = 'ALL'"
            :class="[
              'px-3 py-1.5 rounded-xl transition-all',
              activeStatusFilter === 'ALL' ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            ]"
          >
            Semua ({{ itemsWithStock.length }})
          </button>
          <button 
            @click="activeStatusFilter = 'REORDER_ALL'"
            :class="[
              'px-3 py-1.5 rounded-xl transition-all flex items-center gap-1',
              activeStatusFilter === 'REORDER_ALL' ? 'bg-amber-600 text-white shadow-sm' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
            ]"
          >
            <AlertTriangle class="w-3.5 h-3.5" />
            <span>🚨 Butuh Dipesan ({{ reorderItems.length }})</span>
          </button>
          <button 
            @click="activeStatusFilter = 'OVERSTOCK'"
            :class="[
              'px-3 py-1.5 rounded-xl transition-all',
              activeStatusFilter === 'OVERSTOCK' ? 'bg-purple-600 text-white shadow-sm' : 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100'
            ]"
          >
            Overstock ({{ overstockCount }})
          </button>
          <button 
            @click="activeStatusFilter = 'OPTIMAL'"
            :class="[
              'px-3 py-1.5 rounded-xl transition-all',
              activeStatusFilter === 'OPTIMAL' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
            ]"
          >
            Optimal ({{ optimalCount }})
          </button>
        </div>
      </div>
    </div>

    <!-- Skeleton Shimmer Loading State -->
    <div v-if="isLoading" class="space-y-4">
      <div class="md:hidden">
        <SkeletonLoader type="card-list" :count="4" />
      </div>
      <div class="hidden md:block">
        <SkeletonLoader type="table" :count="6" />
      </div>
    </div>

    <!-- Mobile Compact Row View (Khusus Layar Smartphone / md:hidden) -->
    <div v-else class="md:hidden space-y-2">
      <div v-if="filteredItems.length === 0" class="glass-card p-6 text-center text-slate-400 text-xs">
        Tidak ada data barang yang sesuai dengan filter atau kata kunci pencarian.
      </div>

      <div 
        v-for="item in paginatedItems" 
        :key="item.uniqCode"
        class="glass-card p-2.5 space-y-1.5 transition-all active:scale-[0.99] border-l-2"
        :class="[
          item.stockLevel === 'CRITICAL' ? 'border-l-rose-500' :
          item.stockLevel === 'REORDER' ? 'border-l-amber-500' :
          item.stockLevel === 'OVERSTOCK' ? 'border-l-purple-500' : 'border-l-emerald-500'
        ]"
      >
        <!-- Baris 1: SKU & Deskripsi + Status Badge -->
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-1.5 min-w-0">
            <span class="font-mono font-bold text-[11px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 shrink-0">
              {{ item.uniqCode }}
            </span>
            <h3 class="text-xs font-bold text-zinc-900 dark:text-white truncate">
              {{ item.deskripsi }}
            </h3>
          </div>

          <!-- Status Level Badge Minimalis -->
          <span 
            :class="[
              'px-2 py-0.5 rounded-full text-[9.5px] font-bold border inline-flex items-center gap-1 shrink-0',
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
            <span>{{ item.stockLevelLabel }}</span>
          </span>
        </div>

        <!-- Baris 2: Metrik Strip Horizontal Padat (Stok, ROP, Sisa Hari, ADU) -->
        <div class="flex items-center justify-between text-[11px] bg-zinc-50 dark:bg-zinc-900/60 px-2 py-1 rounded-lg border border-zinc-200/60 dark:border-zinc-800 gap-2">
          <!-- Stok Fisik & Mini Bar -->
          <div class="flex items-center gap-1.5">
            <span class="text-zinc-400 text-[10px]">Stok:</span>
            <span class="font-black text-zinc-900 dark:text-white font-mono">{{ item.currentStock }}</span>
            <span class="text-[10px] text-zinc-500">{{ item.satuan }}</span>
            <div class="w-10 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden shrink-0 ml-0.5">
              <div 
                class="h-full rounded-full"
                :class="[
                  item.stockLevel === 'CRITICAL' ? 'bg-rose-500' :
                  item.stockLevel === 'REORDER' ? 'bg-amber-500' :
                  item.stockLevel === 'OVERSTOCK' ? 'bg-purple-500' : 'bg-emerald-500'
                ]"
                :style="{ width: `${item.stockPercent}%` }"
              ></div>
            </div>
          </div>

          <div class="flex items-center gap-2 text-[10.5px]">
            <span class="text-zinc-400 hidden xs:inline">ROP: <strong class="text-zinc-700 dark:text-zinc-300">{{ item.minStock || 0 }}</strong></span>
            <span class="text-zinc-300 dark:text-zinc-700 hidden xs:inline">•</span>
            <span>
              Sisa: 
              <strong 
                :class="[
                  'font-mono',
                  item.daysOfSupply <= 3 ? 'text-rose-600 dark:text-rose-400 font-black' :
                  item.daysOfSupply <= (item.leadTime || 7) ? 'text-amber-600 dark:text-amber-400 font-bold' :
                  'text-zinc-700 dark:text-zinc-300'
                ]"
              >
                {{ item.daysOfSupplyText }}
              </strong>
            </span>
          </div>
        </div>

        <!-- Baris 3: Saran Beli / ADU & Tombol Aksi Kompak -->
        <div class="flex items-center justify-between gap-2 pt-0.5">
          <div class="flex items-center gap-1.5 min-w-0">
            <div v-if="item.suggestedOrderQty > 0" class="flex items-center gap-1 text-[10.5px]">
              <span class="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-300/60 dark:border-amber-800 font-bold whitespace-nowrap">
                Beli +{{ item.suggestedOrderQty }} {{ item.satuan }}
              </span>
            </div>
            <span v-else class="text-[10px] text-zinc-400">
              ADU: <strong class="text-zinc-600 dark:text-zinc-400 font-mono">{{ item.adu }}</strong>/h
            </span>
          </div>

          <div class="flex items-center gap-1.5 shrink-0">
            <button 
              @click="openPPICModalForItem(item)"
              class="py-1 px-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg text-[10.5px] font-semibold border border-zinc-200 dark:border-zinc-700 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Calculator class="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
              <span>Simulasi</span>
            </button>

            <button 
              v-if="item.suggestedOrderQty > 0"
              @click="orderSingleItem(item)"
              class="py-1 px-2.5 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 rounded-lg text-[10.5px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-sm"
            >
              <Plus class="w-3 h-3" />
              <span>Pesan</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Desktop View: Tabel Analisa Pengadaan PPIC (Khusus Layar Sedang/Besar md:block) -->
    <div v-if="!isLoading" class="hidden md:block glass-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-slate-100/70 dark:bg-slate-800/70 border-b border-slate-200/80 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider select-none">
              <th @click="toggleSort('uniqCode')" class="py-2.5 px-3 cursor-pointer hover:text-emerald-600">
                <div class="flex items-center gap-1">
                  <span>Kode SKU</span>
                  <component :is="getSortIcon('uniqCode')" class="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th @click="toggleSort('deskripsi')" class="py-2.5 px-3 cursor-pointer hover:text-emerald-600">
                <div class="flex items-center gap-1">
                  <span>Deskripsi Barang</span>
                  <component :is="getSortIcon('deskripsi')" class="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th class="py-2.5 px-2 text-center">Satuan</th>
              <th @click="toggleSort('currentStock')" class="py-2.5 px-3 text-right cursor-pointer hover:text-emerald-600">
                <div class="flex items-center justify-end gap-1">
                  <span>Stok Fisik</span>
                  <component :is="getSortIcon('currentStock')" class="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th class="py-2.5 px-2.5 text-center">Min (ROP)</th>
              <th class="py-2.5 px-2.5 text-center">Maks. Stok</th>
              <th class="py-2.5 px-2.5 text-center">Lead Time</th>
              <th class="py-2.5 px-2.5 text-right font-mono">Rata-rata/Hari</th>
              <th class="py-2.5 px-3 text-center">Sisa Hari Stok</th>
              <th class="py-2.5 px-3 text-center">Status PPIC</th>
              <th @click="toggleSort('suggestedOrderQty')" class="py-2.5 px-3 text-right font-black cursor-pointer hover:text-emerald-600 bg-slate-200/40 dark:bg-slate-800/40">
                <div class="flex items-center justify-end gap-1">
                  <span>Saran Beli</span>
                  <component :is="getSortIcon('suggestedOrderQty')" class="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th class="py-2.5 px-3 text-center">Aksi Cepat</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            <tr v-if="filteredItems.length === 0">
              <td colspan="12" class="py-8 text-center text-slate-400 text-xs">
                Tidak ada data barang yang sesuai dengan filter atau kata kunci pencarian.
              </td>
            </tr>
            <tr 
              v-for="item in paginatedItems" 
              :key="item.uniqCode"
              class="hover:bg-emerald-500/5 dark:hover:bg-slate-800/50 transition-colors"
            >
              <td class="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-slate-100">
                <span class="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200/80 dark:border-slate-700">
                  {{ item.uniqCode }}
                </span>
              </td>
              <td class="py-2.5 px-3 font-medium text-slate-900 dark:text-white">
                <div>{{ item.deskripsi }}</div>
              </td>
              <td class="py-2.5 px-2 text-center">
                <span class="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-600 dark:text-slate-400">
                  {{ item.satuan }}
                </span>
              </td>
              <td class="py-2.5 px-3 text-right font-black text-slate-900 dark:text-white">
                {{ item.currentStock }}
              </td>
              <td class="py-2.5 px-2.5 text-center font-bold text-slate-700 dark:text-slate-300">
                {{ item.minStock || 0 }}
              </td>
              <td class="py-2.5 px-2.5 text-center font-bold text-slate-700 dark:text-slate-300">
                {{ item.maxStock || '-' }}
              </td>
              <td class="py-2.5 px-2.5 text-center font-mono text-[11px] text-slate-500">
                {{ item.leadTime || 7 }}h
              </td>
              <td class="py-2.5 px-2.5 text-right font-mono text-slate-600 dark:text-slate-400">
                {{ item.adu }} /h
              </td>

              <!-- Estimasi Habis Stok (Days of Supply) -->
              <td class="py-2.5 px-3 text-center">
                <span 
                  :class="[
                    'px-2 py-0.5 rounded font-mono font-bold text-[10px]',
                    item.daysOfSupply <= 3 ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-400' :
                    item.daysOfSupply <= (item.leadTime || 7) ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-400' :
                    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  ]"
                >
                  {{ item.daysOfSupplyText }}
                </span>
              </td>

              <!-- Status Level PPIC + Gauge -->
              <td class="py-2.5 px-3">
                <div class="space-y-1 w-24 mx-auto">
                  <div class="flex items-center justify-between gap-1">
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
                      <span>{{ item.stockLevelLabel }}</span>
                    </span>
                  </div>
                  <!-- Mini Gauge Bar -->
                  <div class="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      class="h-full rounded-full"
                      :class="[
                        item.stockLevel === 'CRITICAL' ? 'bg-rose-500' :
                        item.stockLevel === 'REORDER' ? 'bg-amber-500' :
                        item.stockLevel === 'OVERSTOCK' ? 'bg-purple-500' : 'bg-emerald-500'
                      ]"
                      :style="{ width: `${item.stockPercent}%` }"
                    ></div>
                  </div>
                </div>
              </td>

              <!-- Saran Order Qty -->
              <td class="py-2.5 px-3 text-right font-black bg-slate-50/50 dark:bg-slate-800/30">
                <span 
                  v-if="item.suggestedOrderQty > 0" 
                  class="text-amber-600 dark:text-amber-400 text-xs font-black"
                >
                  +{{ item.suggestedOrderQty }} {{ item.satuan }}
                </span>
                <span v-else class="text-slate-400 font-normal text-[11px]">-</span>
              </td>

              <!-- Aksi Cepat -->
              <td class="py-2.5 px-3 text-center">
                <div class="flex items-center justify-center gap-1.5">
                  <!-- Simulasi Modal Button -->
                  <button 
                    @click="openPPICModalForItem(item)"
                    class="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-lg text-[11px] font-bold border border-zinc-300 dark:border-zinc-700 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    title="Buka Simulasi Kalkulator PPIC untuk barang ini"
                  >
                    <Calculator class="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-300" />
                    <span>Simulasi</span>
                  </button>
                  
                  <!-- Pesan Single Item -->
                  <button 
                    v-if="item.suggestedOrderQty > 0"
                    @click="orderSingleItem(item)"
                    class="px-2.5 py-1 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 rounded-lg text-[11px] font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                    title="Buat Dokumen Transfer Masuk untuk Barang Ini"
                  >
                    <Plus class="w-3 h-3" />
                    <span>Pesan</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Unified Pagination untuk Mobile & Desktop -->
    <div v-if="!isLoading && filteredItems.length > 0" class="glass-card p-2.5">
      <Pagination 
        :current-page="currentPage"
        :page-size="pageSize"
        :total-items="filteredItems.length"
        @update:current-page="currentPage = $event"
        @update:page-size="pageSize = $event"
      />
    </div>

    <!-- ============================================================== -->
    <!-- MODAL ASISTEN KALKULATOR PPIC CERDAS & EDUKASI STEP-BY-STEP    -->
    <!-- ============================================================== -->
    <div 
      v-if="isPPICModalOpen && ppicCalcData" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-md p-2.5 sm:p-4 transition-all"
    >
      <div class="bg-white dark:bg-zinc-950 w-full max-w-3xl rounded-2xl sm:rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[94vh]">
        
        <!-- Header Modal Monokrom Estetik -->
        <div class="px-5 sm:px-6 py-4 bg-zinc-50 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-9 h-9 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-bold shadow-sm">
              <Calculator class="w-4 h-4" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-sm sm:text-base font-bold text-zinc-950 dark:text-white">
                  Simulasi Kalkulator PPIC Cerdas
                </h3>
                <span class="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700">
                  Step-by-Step
                </span>
              </div>
              <p class="text-[11px] text-zinc-500 dark:text-zinc-400">
                Visualisasi tahap perhitungan & rumus matematis dinamis berbasis histori 90 hari.
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <!-- Tombol Buka Kamus Awam -->
            <button 
              @click="isHelpGuideOpen = true"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors border border-zinc-200 dark:border-zinc-700"
              title="Buka Penjelasan Istilah PPIC untuk Pemula"
            >
              <HelpCircle class="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
              <span class="hidden sm:inline">Kamus Awam</span>
            </button>

            <!-- Tombol Tutup -->
            <button 
              @click="isPPICModalOpen = false" 
              class="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Scrollable Modal Body -->
        <div class="p-4 sm:p-6 overflow-y-auto space-y-5 bg-white dark:bg-zinc-950 text-xs">
          
          <!-- 1. Ringkasan SKU & Informasi Stok Fisik -->
          <div class="p-3.5 sm:p-4 bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div class="flex items-start sm:items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center shrink-0 text-zinc-700 dark:text-zinc-300">
                <Package class="w-5 h-5" />
              </div>
              <div>
                <div class="flex flex-wrap items-center gap-2">
                  <span class="font-mono font-bold text-xs bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-2 py-0.5 rounded-md">
                    {{ ppicCalcData.uniqCode }}
                  </span>
                  <span class="text-[10px] text-zinc-400 font-mono">
                    Satuan: {{ ppicCalcData.satuan }}
                  </span>
                  
                  <!-- Dropdown Switcher Barang Lain -->
                  <div class="flex items-center gap-1.5 ml-1">
                    <span class="text-[9px] text-zinc-400 font-mono">Ganti:</span>
                    <select 
                      :value="targetItem?.uniqCode" 
                      @change="onSwitchSimulatedItem($event.target.value)"
                      class="px-2 py-0.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md text-[10px] font-bold text-zinc-800 dark:text-zinc-200 outline-none cursor-pointer"
                    >
                      <option v-for="it in itemsWithStock" :key="it.uniqCode" :value="it.uniqCode">
                        {{ it.uniqCode }} - {{ it.deskripsi }} (Stok: {{ it.currentStock }})
                      </option>
                    </select>
                  </div>
                </div>
                <h4 class="font-bold text-sm text-zinc-950 dark:text-white mt-1">
                  {{ ppicCalcData.deskripsi }}
                </h4>
              </div>
            </div>

            <div class="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-200 dark:border-zinc-800">
              <div class="text-left sm:text-right">
                <span class="text-[10px] uppercase font-mono text-zinc-400 block">Stok Fisik Gudang</span>
                <span class="text-base sm:text-lg font-black text-zinc-950 dark:text-white">
                  {{ ppicCalcData.currentStock }} {{ ppicCalcData.satuan }}
                </span>
              </div>
              <div class="text-right">
                <span class="text-[10px] uppercase font-mono text-zinc-400 block">Total 90 Hari</span>
                <span class="text-sm sm:text-base font-bold text-zinc-700 dark:text-zinc-300">
                  {{ ppicCalcData.totalOutQty }} {{ ppicCalcData.satuan }}
                </span>
              </div>
            </div>
          </div>

          <!-- 2. Parameter Kontrol Interaktif (Sliders + Presets) -->
          <div class="p-4 bg-zinc-50/80 dark:bg-zinc-900/40 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3.5">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5">
                <Sliders class="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                <h4 class="font-bold text-xs uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Uji Coba Parameter Simulasi (Angka Live)
                </h4>
              </div>
              <span class="text-[10px] text-zinc-400 font-mono">
                Geser slider untuk melihat perubahan rumus seketika
              </span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Parameter 1: Lead Time Supplier -->
              <div class="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                <div class="flex items-center justify-between">
                  <div>
                    <label class="font-bold text-xs text-zinc-900 dark:text-zinc-100 block">
                      Lead Time Supplier
                    </label>
                    <span class="text-[10px] text-zinc-400">
                      Waktu tunggu kiriman sampai di gudang
                    </span>
                  </div>
                  <div class="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-lg border border-zinc-300 dark:border-zinc-700">
                    <input 
                      v-model.number="simLeadTime" 
                      type="number"
                      min="1"
                      max="90"
                      @input="recalculatePPIC"
                      class="w-10 bg-transparent font-black text-xs text-right text-zinc-950 dark:text-white outline-none"
                    />
                    <span class="text-[10px] font-mono text-zinc-500">hari</span>
                  </div>
                </div>

                <!-- Slider -->
                <input 
                  type="range" 
                  min="1" 
                  max="45" 
                  v-model.number="simLeadTime" 
                  @input="recalculatePPIC" 
                  class="w-full accent-zinc-950 dark:accent-white cursor-pointer"
                />

                <!-- Preset Buttons -->
                <div class="flex items-center gap-1.5 pt-1">
                  <span class="text-[9px] text-zinc-400 font-mono">Preset:</span>
                  <button 
                    @click="setLeadTimePreset(3)"
                    :class="['px-2 py-0.5 rounded text-[10px] font-mono font-medium transition-colors', simLeadTime === 3 ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400']"
                  >
                    3h (Lokal)
                  </button>
                  <button 
                    @click="setLeadTimePreset(7)"
                    :class="['px-2 py-0.5 rounded text-[10px] font-mono font-medium transition-colors', simLeadTime === 7 ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400']"
                  >
                    7h (Reguler)
                  </button>
                  <button 
                    @click="setLeadTimePreset(14)"
                    :class="['px-2 py-0.5 rounded text-[10px] font-mono font-medium transition-colors', simLeadTime === 14 ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400']"
                  >
                    14h (Luar Kota)
                  </button>
                  <button 
                    @click="setLeadTimePreset(30)"
                    :class="['px-2 py-0.5 rounded text-[10px] font-mono font-medium transition-colors', simLeadTime === 30 ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400']"
                  >
                    30h (Impor)
                  </button>
                </div>
              </div>

              <!-- Parameter 2: Siklus Belanja / Review Period -->
              <div class="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                <div class="flex items-center justify-between">
                  <div>
                    <label class="font-bold text-xs text-zinc-900 dark:text-zinc-100 block">
                      Siklus Belanja (Review)
                    </label>
                    <span class="text-[10px] text-zinc-400">
                      Jadwal evaluasi pengadaan berkala
                    </span>
                  </div>
                  <div class="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-lg border border-zinc-300 dark:border-zinc-700">
                    <input 
                      v-model.number="simReviewPeriod" 
                      type="number"
                      min="1"
                      max="90"
                      @input="recalculatePPIC"
                      class="w-10 bg-transparent font-black text-xs text-right text-zinc-950 dark:text-white outline-none"
                    />
                    <span class="text-[10px] font-mono text-zinc-500">hari</span>
                  </div>
                </div>

                <!-- Slider -->
                <input 
                  type="range" 
                  min="3" 
                  max="60" 
                  v-model.number="simReviewPeriod" 
                  @input="recalculatePPIC" 
                  class="w-full accent-zinc-950 dark:accent-white cursor-pointer"
                />

                <!-- Preset Buttons -->
                <div class="flex items-center gap-1.5 pt-1">
                  <span class="text-[9px] text-zinc-400 font-mono">Preset:</span>
                  <button 
                    @click="setReviewPeriodPreset(7)"
                    :class="['px-2 py-0.5 rounded text-[10px] font-mono font-medium transition-colors', simReviewPeriod === 7 ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400']"
                  >
                    7h (Mingguan)
                  </button>
                  <button 
                    @click="setReviewPeriodPreset(14)"
                    :class="['px-2 py-0.5 rounded text-[10px] font-mono font-medium transition-colors', simReviewPeriod === 14 ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400']"
                  >
                    14h (2 Minggu)
                  </button>
                  <button 
                    @click="setReviewPeriodPreset(30)"
                    :class="['px-2 py-0.5 rounded text-[10px] font-mono font-medium transition-colors', simReviewPeriod === 30 ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400']"
                  >
                    30h (Bulanan)
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 3. Meteran Visual Posisi Stok (Live Stock Gauge Bar) -->
          <div v-if="stockGauge" class="p-4 bg-zinc-50/80 dark:bg-zinc-900/40 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5">
                <Gauge class="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                <h4 class="font-bold text-xs uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Meteran Status Persediaan Saat Ini
                </h4>
              </div>
              <span :class="['px-2.5 py-0.5 rounded-full text-[10px] font-bold border', stockGauge.badgeClass]">
                {{ stockGauge.statusText }}
              </span>
            </div>

            <!-- Gauge Progress Bar -->
            <div class="space-y-1.5 pt-2">
              <div class="relative w-full h-4 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden flex shadow-inner">
                <!-- Zone 1: Critical / Safety Stock -->
                <div 
                  :style="{ width: `${stockGauge.ssPercent}%` }" 
                  class="h-full bg-rose-500/80" 
                  title="Zona Kritis (Safety Stock)"
                ></div>
                <!-- Zone 2: Reorder Zone (SS to ROP) -->
                <div 
                  :style="{ width: `${Math.max(0, stockGauge.ropPercent - stockGauge.ssPercent)}%` }" 
                  class="h-full bg-amber-400/80" 
                  title="Zona Reorder (Stok ≤ ROP)"
                ></div>
                <!-- Zone 3: Optimal Zone (ROP to Max) -->
                <div 
                  :style="{ width: `${Math.max(0, stockGauge.maxPercent - stockGauge.ropPercent)}%` }" 
                  class="h-full bg-emerald-500/80" 
                  title="Zona Sehat / Optimal"
                ></div>
                <!-- Zone 4: Overstock (> Max) -->
                <div 
                  class="flex-1 h-full bg-purple-500/60" 
                  title="Zona Overstock"
                ></div>
              </div>

              <!-- Pin Penunjuk Posisi Stok Fisik Saat Ini -->
              <div class="relative w-full h-6 select-none">
                <div 
                  class="absolute -top-3.5 flex flex-col items-center transition-all duration-300 -translate-x-1/2"
                  :style="{ left: `${stockGauge.stockPercent}%` }"
                >
                  <div class="w-3.5 h-3.5 bg-zinc-950 dark:bg-white rounded-full border-2 border-white dark:border-zinc-950 shadow-md"></div>
                  <span class="text-[9px] font-black font-mono bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 px-1.5 py-0.2 rounded mt-0.5 shadow-sm whitespace-nowrap">
                    Stok: {{ ppicCalcData.currentStock }}
                  </span>
                </div>
              </div>

              <!-- Legend Titik Ambang -->
              <div class="grid grid-cols-4 text-center text-[10px] font-mono pt-1 text-zinc-500 dark:text-zinc-400 border-t border-zinc-200/60 dark:border-zinc-800/60">
                <div>
                  <span class="block text-zinc-400 text-[9px]">0 (Habis)</span>
                  <strong>0 Unit</strong>
                </div>
                <div>
                  <span class="block text-rose-600 dark:text-rose-400 text-[9px] font-bold">Safety Stock</span>
                  <strong class="text-zinc-900 dark:text-white">{{ ppicCalcData.safetyStock }}</strong>
                </div>
                <div>
                  <span class="block text-amber-600 dark:text-amber-400 text-[9px] font-bold">Titik Pesan (ROP)</span>
                  <strong class="text-zinc-900 dark:text-white">{{ ppicCalcData.recommendedRop }}</strong>
                </div>
                <div>
                  <span class="block text-emerald-600 dark:text-emerald-400 text-[9px] font-bold">Maks. Stok</span>
                  <strong class="text-zinc-900 dark:text-white">{{ ppicCalcData.recommendedMaxStock }}</strong>
                </div>
              </div>
            </div>

            <!-- Penjelasan status bahasa awam -->
            <p class="text-[11px] text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-start gap-2">
              <Lightbulb class="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span><strong>Panduan Status:</strong> {{ stockGauge.statusDesc }}</span>
            </p>
          </div>

          <!-- 4. Tahap demi Tahap Perhitungan Dinamis (5 Steps) -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5">
                <Layers class="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                <h4 class="font-bold text-xs uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  5 Tahap Logika Perhitungan (Formula Live)
                </h4>
              </div>
              <span class="text-[10px] text-zinc-400">
                Klik kartu untuk melihat detail bahasa awam
              </span>
            </div>

            <!-- Loop 5 Dynamic Steps -->
            <div class="space-y-2.5">
              <div 
                v-for="(st, idx) in dynamicSteps" 
                :key="st.id"
                class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 rounded-2xl p-3.5 transition-all space-y-3 shadow-xs"
              >
                <!-- Step Header -->
                <div class="flex items-start justify-between gap-2">
                  <div class="flex items-start gap-2.5">
                    <!-- Step Number Badge -->
                    <span class="w-6 h-6 rounded-lg bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-black text-xs flex items-center justify-center shrink-0">
                      {{ st.step }}
                    </span>
                    <div>
                      <h5 class="font-bold text-xs sm:text-sm text-zinc-950 dark:text-white">
                        Tahap {{ st.step }}: {{ st.title }}
                      </h5>
                      <p class="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                        {{ st.tagline }}
                      </p>
                    </div>
                  </div>

                  <!-- Result Badge -->
                  <div class="text-right shrink-0">
                    <span class="inline-block px-2.5 py-1 rounded-xl font-black text-xs font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white border border-zinc-300 dark:border-zinc-700">
                      {{ st.resultValue }}
                    </span>
                    <span class="block text-[9px] text-zinc-400 font-mono mt-0.5">
                      {{ st.resultSub }}
                    </span>
                  </div>
                </div>

                <!-- Live Dynamic Formula Box -->
                <div class="p-2.5 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 font-mono text-[11px] space-y-1">
                  <!-- Rumus Umum -->
                  <div class="text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
                    <span>Rumus:</span>
                    <span class="text-zinc-700 dark:text-zinc-300 font-semibold">{{ st.formulaGeneral }}</span>
                  </div>
                  <!-- Substitusi Angka Live -->
                  <div class="text-zinc-900 dark:text-white pt-1 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between font-bold">
                    <span>Hitungan Live:</span>
                    <span class="bg-zinc-200/70 dark:bg-zinc-800/80 px-2 py-0.5 rounded text-zinc-950 dark:text-white">
                      {{ st.formulaApplied }}
                    </span>
                  </div>
                </div>

                <!-- Penjelasan Bahasa Manusia / Awam -->
                <div class="p-2.5 bg-zinc-100/60 dark:bg-zinc-800/40 rounded-xl text-[11px] text-zinc-700 dark:text-zinc-300 space-y-1.5 border border-zinc-200/60 dark:border-zinc-700/60">
                  <div class="flex items-start gap-1.5 font-medium">
                    <span class="text-xs">💡</span>
                    <span><strong>Analogi Sederhana:</strong> {{ st.analogy }}</span>
                  </div>
                  <p class="leading-relaxed text-zinc-600 dark:text-zinc-400 pl-4 border-l-2 border-zinc-300 dark:border-zinc-700">
                    {{ st.explanation }}
                  </p>
                  <p class="text-[10px] text-zinc-500 dark:text-zinc-400 italic pl-4">
                    ⚠️ <strong>Kenapa penting:</strong> {{ st.whyImportant }}
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Footer Modal Actions -->
        <div class="px-5 sm:px-6 py-3.5 bg-zinc-50 dark:bg-zinc-900/90 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <button 
            type="button" 
            @click="isPPICModalOpen = false" 
            class="px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-xl transition-colors order-2 sm:order-1"
          >
            Tutup
          </button>

          <div class="flex items-center gap-2 order-1 sm:order-2">
            <!-- Pesan Cepat Langsung jika butuh dipesan -->
            <button 
              v-if="ppicCalcData.suggestedOrderQty > 0"
              type="button"
              @click="orderSimulatedItem"
              class="px-4 py-2 text-xs font-bold text-zinc-900 dark:text-zinc-100 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
              title="Langsung buat dokumen Transfer Order Masuk untuk jumlah ini"
            >
              <ShoppingCart class="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300" />
              <span>+ Pesan ({{ ppicCalcData.suggestedOrderQty }} {{ ppicCalcData.satuan }})</span>
            </button>

            <!-- Terapkan ke Master SKU -->
            <button 
              type="button" 
              @click="applyPRICToItem" 
              class="px-4 py-2 text-xs font-bold text-white bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 rounded-xl transition-all flex items-center gap-1.5 shadow-sm border border-zinc-950 dark:border-white"
            >
              <CheckCircle2 class="w-3.5 h-3.5" />
              <span>Terapkan Parameter ke SKU</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- MODAL KAMUS ISTILAH & KONSEP PPIC RAMAH PEMULA                -->
    <!-- ============================================================== -->
    <div 
      v-if="isHelpGuideOpen" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 backdrop-blur-md p-3 sm:p-4 transition-all"
    >
      <div class="bg-white dark:bg-zinc-950 w-full max-w-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[88vh]">
        <!-- Header Kamus -->
        <div class="px-5 py-4 bg-zinc-50 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div class="flex items-center space-x-2.5">
            <div class="w-8 h-8 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-bold">
              <Lightbulb class="w-4 h-4" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-zinc-950 dark:text-white">
                Kamus Awam: Istilah Kunci PPIC
              </h3>
              <p class="text-[11px] text-zinc-500 dark:text-zinc-400">
                Penjelasan konsep manajemen stok dengan analogi kehidupan sehari-hari.
              </p>
            </div>
          </div>
          <button @click="isHelpGuideOpen = false" class="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Isi Kamus Awam -->
        <div class="p-5 overflow-y-auto space-y-3.5 text-xs">
          
          <!-- Istilah 1: Lead Time -->
          <div class="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-1">
            <div class="flex items-center justify-between">
              <strong class="text-zinc-950 dark:text-white text-xs">1. Lead Time (Waktu Tunggu Pengiriman)</strong>
              <span class="text-[10px] font-mono text-zinc-400">Hari</span>
            </div>
            <p class="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              <strong>Analogi:</strong> Berapa lama kurir/ojol butuh waktu mengantar pesanan makanan dari restoran sampai ke pintu rumah Anda.<br>
              <strong>Arti di Gudang:</strong> Total hari yang dibutuhkan supplier sejak PO diterbitkan, diproduksi, dikemas, hingga barang masuk dan diverifikasi di gudang.
            </p>
          </div>

          <!-- Istilah 2: ADU & MDU -->
          <div class="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-1">
            <div class="flex items-center justify-between">
              <strong class="text-zinc-950 dark:text-white text-xs">2. ADU & MDU (Kecepatan Pemakaian)</strong>
              <span class="text-[10px] font-mono text-zinc-400">Unit/Hari</span>
            </div>
            <p class="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              <strong>Analogi:</strong> Menghitung konsumsi bensin kendaraan Anda per hari (misal 2 liter/hari). Pada hari bepergian jauh, konsumsi melonjak ke angka tertinggi (MDU).<br>
              <strong>Arti di Gudang:</strong> Rata-rata berapa barang keluar dalam sehari (ADU), dan hari tersibuk pernah keluar berapa (MDU).
            </p>
          </div>

          <!-- Istilah 3: Safety Stock -->
          <div class="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-1">
            <div class="flex items-center justify-between">
              <strong class="text-zinc-950 dark:text-white text-xs">3. Safety Stock (Stok Pengaman)</strong>
              <span class="text-[10px] font-mono text-zinc-400">Ban Serep</span>
            </div>
            <p class="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              <strong>Analogi:</strong> Ban serep di bagasi mobil. Tidak pernah dipakai harian, tetapi wajib ada jika ban bocor di jalan tol.<br>
              <strong>Arti di Gudang:</strong> Stok cadangan ekstra untuk melindungi operasional jika kiriman supplier macet atau pembeli tiba-tiba memborong dalam jumlah besar.
            </p>
          </div>

          <!-- Istilah 4: Reorder Point (ROP) -->
          <div class="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-1">
            <div class="flex items-center justify-between">
              <strong class="text-zinc-950 dark:text-white text-xs">4. Reorder Point / ROP (Alarm Pemesanan Ulang)</strong>
              <span class="text-[10px] font-mono text-zinc-400">Min. Stock</span>
            </div>
            <p class="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              <strong>Analogi:</strong> Lampu indikator bensin mobil yang menyala oranye. Memberitahu Anda "Cari pom bensin sekarang sebelum kehabisan!".<br>
              <strong>Arti di Gudang:</strong> Saat sisa stok menyentuh angka ini, Anda HARUS memesan ke supplier sekarang juga agar barang baru datang tepat sebelum stok habis.
            </p>
          </div>

          <!-- Istilah 5: Max Stock -->
          <div class="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-1">
            <div class="flex items-center justify-between">
              <strong class="text-zinc-950 dark:text-white text-xs">5. Max Stock (Kapasitas Maksimal Aman)</strong>
              <span class="text-[10px] font-mono text-zinc-400">Plafon</span>
            </div>
            <p class="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              <strong>Analogi:</strong> Kapasitas tangki bensin penuh. Jangan mengisi meluber keluar karena bensin tumpah dan mubazir.<br>
              <strong>Arti di Gudang:</strong> Batas maksimal stok yang boleh disimpan agar kas perusahaan tidak membeku menjadi barang mati dan rak gudang tidak overload.
            </p>
          </div>

        </div>

        <!-- Footer Kamus -->
        <div class="px-5 py-3 bg-zinc-50 dark:bg-zinc-900/80 border-t border-zinc-200 dark:border-zinc-800 text-right">
          <button 
            @click="isHelpGuideOpen = false" 
            class="px-4 py-1.5 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-bold rounded-xl text-xs"
          >
            Saya Paham, Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { db, calculateItemPPICMetrics } from '../database/db';
import Pagination from '../components/Pagination.vue';
import { 
  Calculator, 
  Search, 
  FileSpreadsheet, 
  ShoppingCart, 
  AlertTriangle, 
  Plus, 
  X, 
  CheckCircle2, 
  ArrowUp, 
  ArrowDown, 
  ChevronsUpDown,
  HelpCircle,
  Info,
  Lightbulb,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ShieldCheck,
  Package,
  Sliders,
  Gauge,
  Layers
} from 'lucide-vue-next';
import * as XLSX from 'xlsx';
import SkeletonLoader from '../components/SkeletonLoader.vue';

const props = defineProps({
  itemsWithStock: {
    type: Array,
    default: () => []
  },
  transactions: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['refresh-data', 'create-order']);

const searchQuery = ref('');
const activeStatusFilter = ref('ALL'); // 'ALL' | 'CRITICAL' | 'REORDER' | 'REORDER_ALL' | 'OPTIMAL' | 'OVERSTOCK'
const sortKey = ref('suggestedOrderQty');
const sortOrder = ref('desc');
const currentPage = ref(1);
const pageSize = ref(10);

// State Modal Simulasi PPIC & Bantuan Edukasi Awam
const isPPICModalOpen = ref(false);
const isHelpGuideOpen = ref(false);
const activeTooltipStep = ref(null);
const expandedStepIndex = ref(null);
const ppicCalcData = ref(null);
const simLeadTime = ref(7);
const simReviewPeriod = ref(14);
const targetItem = ref(null);

// Menghitung ADU (Average Daily Usage) 90 hari untuk setiap barang
const itemAduMap = computed(() => {
  const map = {};
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  for (const doc of props.transactions) {
    if (doc.type === 'OUT' && doc.tanggal >= ninetyDaysAgo && Array.isArray(doc.items)) {
      for (const line of doc.items) {
        map[line.uniqCode] = (map[line.uniqCode] || 0) + (Number(line.qty) || 0);
      }
    }
  }

  const result = {};
  for (const item of props.itemsWithStock) {
    const totalOut = map[item.uniqCode] || 0;
    result[item.uniqCode] = Number((totalOut / 90).toFixed(2));
  }
  return result;
});

// Enriched Items dengan ADU, Days of Supply, dan Saran Order Qty
const enrichedItems = computed(() => {
  return props.itemsWithStock.map(item => {
    const adu = itemAduMap.value[item.uniqCode] || 0;
    const stock = item.currentStock || 0;
    const min = item.minStock || 0;
    const max = item.maxStock || (min > 0 ? min * 3 : 50);

    // Days of supply
    let daysOfSupply = 999;
    let daysOfSupplyText = 'Aman (>90h)';
    if (adu > 0) {
      daysOfSupply = Math.round(stock / adu);
      daysOfSupplyText = `${daysOfSupply} hari`;
    } else if (stock === 0) {
      daysOfSupply = 0;
      daysOfSupplyText = 'Habis (0h)';
    }

    // Saran Order Qty: jika stok <= min (Kritis / Reorder), maka saran = max - stock
    let suggestedOrderQty = 0;
    if (item.stockLevel === 'CRITICAL' || item.stockLevel === 'REORDER') {
      suggestedOrderQty = Math.max(0, max - stock);
    }

    return {
      ...item,
      adu,
      daysOfSupply,
      daysOfSupplyText,
      suggestedOrderQty
    };
  });
});

// Ringkasan Metrik
const criticalCount = computed(() => enrichedItems.value.filter(i => i.stockLevel === 'CRITICAL').length);
const reorderCount = computed(() => enrichedItems.value.filter(i => i.stockLevel === 'REORDER').length);
const optimalCount = computed(() => enrichedItems.value.filter(i => i.stockLevel === 'OPTIMAL').length);
const overstockCount = computed(() => enrichedItems.value.filter(i => i.stockLevel === 'OVERSTOCK').length);

const reorderItems = computed(() => enrichedItems.value.filter(i => i.stockLevel === 'CRITICAL' || i.stockLevel === 'REORDER'));
const totalSuggestedOrderUnits = computed(() => reorderItems.value.reduce((acc, curr) => acc + curr.suggestedOrderQty, 0));

// Filter & Sort Logic
const filteredItems = computed(() => {
  let list = [...enrichedItems.value];

  if (activeStatusFilter.value === 'CRITICAL') {
    list = list.filter(i => i.stockLevel === 'CRITICAL');
  } else if (activeStatusFilter.value === 'REORDER') {
    list = list.filter(i => i.stockLevel === 'REORDER');
  } else if (activeStatusFilter.value === 'REORDER_ALL') {
    list = list.filter(i => i.stockLevel === 'CRITICAL' || i.stockLevel === 'REORDER');
  } else if (activeStatusFilter.value === 'OPTIMAL') {
    list = list.filter(i => i.stockLevel === 'OPTIMAL');
  } else if (activeStatusFilter.value === 'OVERSTOCK') {
    list = list.filter(i => i.stockLevel === 'OVERSTOCK');
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(i => 
      i.uniqCode.toLowerCase().includes(q) || 
      i.deskripsi.toLowerCase().includes(q)
    );
  }

  list.sort((a, b) => {
    let valA = a[sortKey.value];
    let valB = b[sortKey.value];

    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();

    if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1;
    return 0;
  });

  return list;
});

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredItems.value.slice(start, start + pageSize.value);
});

function toggleSort(key) {
  if (sortKey.value === key) sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  else { sortKey.value = key; sortOrder.value = 'desc'; }
}

function getSortIcon(key) {
  if (sortKey.value !== key) return ChevronsUpDown;
  return sortOrder.value === 'asc' ? ArrowUp : ArrowDown;
}

// Buka Modal PPIC Umum (Langsung dari Header Banner)
function openGeneralPPICCalculator() {
  const defaultItem = reorderItems.value[0] || props.itemsWithStock[0];
  if (defaultItem) {
    openPPICModalForItem(defaultItem);
  } else {
    alert('Belum ada data barang di master item.');
  }
}

// Ganti Barang Langsung dari Dalam Modal Simulasi
function onSwitchSimulatedItem(uniqCode) {
  const found = props.itemsWithStock.find(i => i.uniqCode === uniqCode);
  if (found) {
    openPPICModalForItem(found);
  }
}

// Buka Modal PPIC per item
async function openPPICModalForItem(item) {
  targetItem.value = item;
  simLeadTime.value = Number(item.leadTime) || 7;
  simReviewPeriod.value = 14;

  ppicCalcData.value = await calculateItemPPICMetrics(item.uniqCode, simLeadTime.value, simReviewPeriod.value);
  isPPICModalOpen.value = true;
}

async function recalculatePPIC() {
  if (!ppicCalcData.value) return;
  ppicCalcData.value = await calculateItemPPICMetrics(
    ppicCalcData.value.uniqCode, 
    simLeadTime.value, 
    simReviewPeriod.value
  );
}

function setLeadTimePreset(days) {
  simLeadTime.value = days;
  recalculatePPIC();
}

function setReviewPeriodPreset(days) {
  simReviewPeriod.value = days;
  recalculatePPIC();
}

function toggleStepExplanation(index) {
  expandedStepIndex.value = expandedStepIndex.value === index ? null : index;
}

// 5 Tahap Perhitungan Dinamis dengan Penjelasan Ramah Pemula
const dynamicSteps = computed(() => {
  if (!ppicCalcData.value) return [];
  const d = ppicCalcData.value;
  const lt = Number(simLeadTime.value) || 7;
  const rp = Number(simReviewPeriod.value) || 14;
  const adu = d.adu || 0;
  const mdu = d.mdu || 0;
  const stock = d.currentStock || 0;

  const ltd = Number((adu * lt).toFixed(1));
  const ss = d.safetyStock;
  const rop = d.recommendedRop;
  const cs = Math.max(5, Math.ceil(adu * rp));
  const max = d.recommendedMaxStock;
  const orderQty = Math.max(0, max - stock);

  return [
    {
      step: 1,
      id: 'adu',
      title: 'Kecepatan Barang Habis (ADU & MDU)',
      tagline: 'Seberapa cepat barang ini laku & keluar dari gudang setiap harinya?',
      resultValue: `${adu} ${d.satuan}/hari`,
      resultSub: `Puncak: ${mdu} ${d.satuan}/hari`,
      formulaGeneral: 'ADU = Total Pengeluaran (90 Hari) ÷ 90 Hari',
      formulaApplied: `${d.totalOutQty} ${d.satuan} ÷ 90 hari = ${adu} ${d.satuan}/hari`,
      formulaSecondary: `MDU (Pengeluaran Puncak Sehari) = ${mdu} ${d.satuan}`,
      analogy: 'Ibarat menghitung berapa liter bensin yang motor Anda habiskan setiap harinya.',
      explanation: `Dalam 90 hari terakhir, rata-rata ada ${adu} ${d.satuan} yang keluar dari gudang per hari. Hari tersibuk pernah menghabiskan ${mdu} ${d.satuan} dalam satu hari.`,
      whyImportant: 'Kecepatan habis ini menjadi kompas utama untuk memperkirakan berapa banyak stok yang bakal terpakai saat menunggu kiriman datang.'
    },
    {
      step: 2,
      id: 'ss',
      title: 'Stok Cadangan Darurat (Safety Stock)',
      tagline: 'Berapa unit "ban serep" yang wajib disimpan untuk jaga-jaga?',
      resultValue: `${ss} ${d.satuan}`,
      resultSub: 'Zona Cadangan Darurat',
      formulaGeneral: 'Safety Stock = (Puncak Harian × Lead Time) - (Rata-rata Harian × Lead Time)',
      formulaApplied: `(${mdu} × ${lt} hari) - (${adu} × ${lt} hari) = ${(mdu * lt).toFixed(0)} - ${(adu * lt).toFixed(1)} ≈ ${ss} ${d.satuan}`,
      formulaSecondary: 'Stok pengaman ini tidak boleh disentuh pada kondisi operasional normal.',
      analogy: 'Ibarat ban serep di bagasi mobil, hanya dipakai saat kondisi darurat.',
      explanation: `Safety Stock adalah cadangan penyelamat. Jika supplier telat kirim atau tiba-tiba pelanggan memborong banyak selama masa tunggu ${lt} hari, Anda masih punya ${ss} ${d.satuan} cadangan sehingga gudang tidak kosong melompong (stockout).`,
      whyImportant: `Jika sisa stok gudang sudah menyentuh angka ${ss} ${d.satuan}, artinya Anda sudah memakai ban serep dan berada di zona bahaya kritis!`
    },
    {
      step: 3,
      id: 'rop',
      title: 'Titik Pesan Ulang (Reorder Point / ROP)',
      tagline: 'Kapan saat yang tepat untuk membuat pesanan baru ke supplier?',
      resultValue: `${rop} ${d.satuan}`,
      resultSub: 'Ambang Minimum Pemesanan',
      formulaGeneral: 'ROP = (Konsumsi Selama Lead Time) + Safety Stock',
      formulaApplied: `(${adu} × ${lt} hari) + ${ss} = ${ltd} + ${ss} = ${rop} ${d.satuan}`,
      formulaSecondary: `Konsumsi Selama Tunggu Kiriman (${lt} hari) = ${ltd} ${d.satuan}`,
      analogy: 'Ibarat lampu indikator bensin berkedip di dashboard speedometer Anda.',
      explanation: `Jangan tunggu stok habis jadi 0 baru pesan! Ketika sisa stok di gudang turun menyentuh ${rop} ${d.satuan}, Anda HARUS SEGERA memesan. Selama ${lt} hari menunggu supplier, gudang akan menghabiskan ${ltd} ${d.satuan}, sehingga barang baru tiba tepat saat stok mendekati angka cadangan.`,
      whyImportant: `Memastikan gudang tidak pernah kekurangan barang tanpa harus menimbun stok terlalu banyak.`
    },
    {
      step: 4,
      id: 'max',
      title: 'Kapasitas Maksimal Gudang (Max Stock)',
      tagline: 'Berapa batas paling banyak barang boleh disimpan di rak?',
      resultValue: `${max} ${d.satuan}`,
      resultSub: 'Plafon Aman Gudang',
      formulaGeneral: 'Max Stock = Titik Pesan (ROP) + (Konsumsi Harian × Siklus Belanja)',
      formulaApplied: `${rop} + (${adu} × ${rp} hari) = ${rop} + ${cs} = ${max} ${d.satuan}`,
      formulaSecondary: `Kebutuhan Siklus Belanja (${rp} hari) = ${cs} ${d.satuan}`,
      analogy: 'Ibarat kapasitas maksimal tangki bahan bakar kendaraan Anda.',
      explanation: `Gudang sebaiknya tidak menampung lebih dari ${max} ${d.satuan}. Menyimpan terlalu banyak barang akan membekukan uang kas perusahaan (modal mandek), membuat rak sempit (overstock), dan meningkatkan risiko barang rusak.`,
      whyImportant: `Menjaga perputaran modal kerja (cash flow) tetap sehat dan efisien.`
    },
    {
      step: 5,
      id: 'order',
      title: 'Rekomendasi Jumlah Pesan (Order Quantity)',
      tagline: 'Berapa banyak unit yang perlu di-checkout sekarang?',
      resultValue: `${orderQty} ${d.satuan}`,
      resultSub: orderQty > 0 ? 'Waktunya Belanja' : 'Persediaan Masih Aman',
      formulaGeneral: 'Saran Pesan = Kapasitas Maksimal - Stok Fisik Saat Ini',
      formulaApplied: `${max} - ${stock} = ${orderQty} ${d.satuan}`,
      formulaSecondary: stock <= rop ? `Stok sekarang (${stock}) ≤ Titik Pesan (${rop}) ➔ SEGERA ORDER` : `Stok sekarang (${stock}) > Titik Pesan (${rop}) ➔ BELUM PERLU ORDER`,
      analogy: 'Ibarat mengisi bensin dari jarum saat ini hingga tangki penuh kembali.',
      explanation: stock <= rop
        ? `Stok Anda saat ini (${stock} ${d.satuan}) sudah menyentuh atau berada di bawah batas pesan ulang (${rop} ${d.satuan}). Anda disarankan memesan tepat ${orderQty} ${d.satuan} agar persediaan kembali terisi penuh ke batas aman.`
        : `Stok Anda saat ini (${stock} ${d.satuan}) masih di atas batas pesan ulang (${rop} ${d.satuan}). Persediaan gudang masih aman dan mencukupi. Anda BELUM PERLU memesan saat ini.`,
      whyImportant: 'Mencegah pembelian berlebihan atau pembelian mendadak yang memboroskan ongkos kirim dan modal.'
    }
  ];
});

// Meteran Visual Posisi Stok (Stock Gauge)
const stockGauge = computed(() => {
  if (!ppicCalcData.value) return null;
  const d = ppicCalcData.value;
  const stock = Math.max(0, d.currentStock || 0);
  const ss = d.safetyStock || 0;
  const rop = d.recommendedRop || 0;
  const max = d.recommendedMaxStock || 50;

  const ceiling = Math.max(max * 1.25, stock * 1.2, 10);

  const ssPercent = Math.min(100, Math.round((ss / ceiling) * 100));
  const ropPercent = Math.min(100, Math.round((rop / ceiling) * 100));
  const maxPercent = Math.min(100, Math.round((max / ceiling) * 100));
  const stockPercent = Math.min(100, Math.max(0, Math.round((stock / ceiling) * 100)));

  let statusType = 'OPTIMAL';
  let statusText = 'Stok Sehat (Optimal)';
  let statusDesc = 'Persediaan aman di atas batas pesan ulang dan di bawah batas maksimal.';
  let badgeClass = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';

  if (stock < ss) {
    statusType = 'CRITICAL';
    statusText = 'KRITIS: Cadangan Darurat Terpakai!';
    statusDesc = 'Stok saat ini sudah menembus batas safety stock. Segera pesan barang darurat!';
    badgeClass = 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-800';
  } else if (stock <= rop) {
    statusType = 'REORDER';
    statusText = 'WAKTUNYA REORDER: Stok ≤ ROP';
    statusDesc = 'Stok menyentuh alarm pemesanan ulang. Buat pesanan baru ke supplier sekarang.';
    badgeClass = 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800';
  } else if (stock > max) {
    statusType = 'OVERSTOCK';
    statusText = 'OVERSTOCK: Melampaui Batas Maksimal';
    statusDesc = 'Persediaan melampaui plafon ideal, berisiko membebani ruang simpan dan modal.';
    badgeClass = 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300 dark:border-purple-800';
  }

  return {
    ceiling,
    ssPercent,
    ropPercent,
    maxPercent,
    stockPercent,
    statusType,
    statusText,
    statusDesc,
    badgeClass
  };
});

function orderSimulatedItem() {
  if (!ppicCalcData.value || ppicCalcData.value.suggestedOrderQty <= 0) return;
  emit('create-order', {
    type: 'IN',
    items: [{
      uniqCode: ppicCalcData.value.uniqCode,
      deskripsi: ppicCalcData.value.deskripsi,
      satuan: ppicCalcData.value.satuan,
      qty: ppicCalcData.value.suggestedOrderQty,
      keterangan: 'Reorder Rekomendasi Simulasi PPIC'
    }]
  });
  isPPICModalOpen.value = false;
}

async function applyPRICToItem() {
  if (!ppicCalcData.value || !targetItem.value?.id) return;

  await db.items.update(targetItem.value.id, {
    minStock: ppicCalcData.value.recommendedRop,
    maxStock: ppicCalcData.value.recommendedMaxStock,
    leadTime: ppicCalcData.value.leadTime,
    updatedAt: new Date().toISOString()
  });

  emit('refresh-data');
  isPPICModalOpen.value = false;
  alert(`Parameter PPIC untuk ${targetItem.value.uniqCode} berhasil diperbarui!`);
}

// Eksekusi Order Cepat 1 Item ke Transfer Order Masuk
function orderSingleItem(item) {
  emit('create-order', {
    type: 'IN',
    items: [{
      uniqCode: item.uniqCode,
      deskripsi: item.deskripsi,
      satuan: item.satuan,
      qty: item.suggestedOrderQty,
      keterangan: 'Reorder Rekomendasi PPIC'
    }]
  });
}

// Eksekusi Order Borongan Seluruh Item Kritis & Reorder
function orderAllReorderItems() {
  const itemsToOrder = reorderItems.value.map(item => ({
    uniqCode: item.uniqCode,
    deskripsi: item.deskripsi,
    satuan: item.satuan,
    qty: item.suggestedOrderQty,
    keterangan: `Reorder PPIC (${item.stockLevelLabel})`
  }));

  if (itemsToOrder.length === 0) {
    alert('Tidak ada item yang membutuhkan reorder saat ini.');
    return;
  }

  emit('create-order', {
    type: 'IN',
    items: itemsToOrder
  });
}

// Ekspor ke Excel
function exportPPICToExcel() {
  const exportData = enrichedItems.value.map(item => ({
    'Kode SKU': item.uniqCode,
    'Deskripsi Barang': item.deskripsi,
    'Satuan': item.satuan,
    'Stok Fisik Saat Ini': item.currentStock,
    'Min. Stok (ROP)': item.minStock || 0,
    'Maks. Stok': item.maxStock || '-',
    'Lead Time (Hari)': item.leadTime || 7,
    'Konsumsi Harian (ADU)': item.adu,
    'Estimasi Habis Stok': item.daysOfSupplyText,
    'Status PPIC': item.stockLevelLabel,
    'Saran Jumlah Belanja (Order Qty)': item.suggestedOrderQty
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Rencana_Pengadaan_PPIC');

  const fileName = `Rencana_Pengadaan_PPIC_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}
</script>
