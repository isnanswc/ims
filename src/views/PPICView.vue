<template>
  <div class="space-y-5 pb-24 md:pb-6">
    <!-- Header Banner Perencanaan PPIC (Glass Matte) -->
    <div class="glass-card p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div>
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Calculator class="w-4 h-4" />
          </div>
          <h1 class="text-base sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Perencanaan Stok & Pengadaan (PPIC)</span>
            <span class="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Supply Intelligence
            </span>
          </h1>
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
          Analisis otomatis kebutuhan pengadaan berbasis konsumsi riwayat mutasi, estimasi hari persediaan habis (Days of Supply), serta eksekusi pesanan reorder langsung dalam 1-klik.
        </p>
      </div>

      <!-- Action Buttons: Batch PO & Export Excel -->
      <div class="flex flex-wrap items-center gap-2">
        <button 
          @click="exportPPICToExcel"
          class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-colors shadow-sm"
        >
          <FileSpreadsheet class="w-4 h-4 text-emerald-600" />
          <span>Ekspor Rencana (.xlsx)</span>
        </button>

        <button 
          v-if="reorderItems.length > 0"
          @click="orderAllReorderItems"
          class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/25 transition-all"
          :title="`Buat Transfer Order Masuk untuk ${reorderItems.length} item yang butuh dipesan`"
        >
          <ShoppingCart class="w-4 h-4" />
          <span>+ Pesan Borongan ({{ reorderItems.length }} Item)</span>
        </button>
      </div>
    </div>

    <!-- Stat Metric Cards: PPIC 4 Leveling Overview -->
    <div class="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
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

    <!-- Tabel Analisa Pengadaan PPIC -->
    <div class="glass-card overflow-hidden">
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
                  <!-- Pesan Single Item -->
                  <button 
                    v-if="item.suggestedOrderQty > 0"
                    @click="orderSingleItem(item)"
                    class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold shadow-xs transition-all flex items-center gap-1"
                    title="Buat Dokumen Transfer Masuk untuk Barang Ini"
                  >
                    <Plus class="w-3 h-3" />
                    <span>Pesan</span>
                  </button>
                  <!-- Simulasi Modal -->
                  <button 
                    @click="openPPICModalForItem(item)"
                    class="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors"
                    title="Simulasi Perhitungan PPIC"
                  >
                    <Calculator class="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="p-2.5 border-t border-slate-200/60 dark:border-slate-800">
        <Pagination 
          :current-page="currentPage"
          :page-size="pageSize"
          :total-items="filteredItems.length"
          @update:current-page="currentPage = $event"
          @update:page-size="pageSize = $event"
        />
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- MODAL ASISTEN KALKULATOR PPIC CERDAS                           -->
    <!-- ============================================================== -->
    <div 
      v-if="isPPICModalOpen && ppicCalcData" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 dark:bg-black/80 backdrop-blur-md p-3 sm:p-4 transition-all"
    >
      <div class="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl sm:rounded-3xl shadow-2xl shadow-emerald-500/10 dark:shadow-black/70 border border-slate-200/90 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] ring-1 ring-black/5 dark:ring-white/10">
        <!-- Top Light Gradient Bar -->
        <div class="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500"></div>

        <!-- Header Modal -->
        <div class="px-5 sm:px-6 py-4 bg-gradient-to-b from-emerald-50/70 via-teal-50/20 to-white dark:from-slate-800/80 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/25 shadow-sm">
              <Calculator class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Asisten Kalkulator PPIC Cerdas</span>
                <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/25">Min-Max</span>
              </h3>
              <p class="text-[11px] text-slate-400">Prediksi berbasis formula PPIC dari histori mutasi keluar 90 hari.</p>
            </div>
          </div>
          <button @click="isPPICModalOpen = false" class="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="p-5 overflow-y-auto space-y-4 bg-white dark:bg-slate-900 text-xs">
          <!-- Item Info Card -->
          <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <div>
              <span class="font-mono font-bold text-[11px] bg-slate-200/70 dark:bg-slate-700 px-1.5 py-0.5 rounded mr-1.5 text-slate-800 dark:text-slate-200">
                {{ ppicCalcData.uniqCode }}
              </span>
              <strong class="text-slate-900 dark:text-white">{{ ppicCalcData.deskripsi }}</strong>
            </div>
            <div class="text-right">
              <span class="text-[10px] text-slate-400 block">Stok Fisik Saat Ini</span>
              <span class="font-extrabold text-sm text-slate-900 dark:text-white">{{ ppicCalcData.currentStock }} {{ ppicCalcData.satuan }}</span>
            </div>
          </div>

          <!-- Parameter Simulasi -->
          <div class="space-y-2">
            <span class="font-bold text-[11px] uppercase tracking-wider text-slate-500 block">Parameter Simulasi Gudang:</span>
            <div class="grid grid-cols-2 gap-3">
              <div class="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-700">
                <label class="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Lead Time Supplier (Hari):
                </label>
                <div class="flex items-center gap-2">
                  <input 
                    v-model.number="simLeadTime" 
                    type="number"
                    min="1"
                    @input="recalculatePPIC"
                    class="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-xs"
                  />
                  <span class="text-slate-400 text-xs">hari</span>
                </div>
              </div>

              <div class="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-700">
                <label class="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Siklus Pengadaan / Belanja:
                </label>
                <div class="flex items-center gap-2">
                  <input 
                    v-model.number="simReviewPeriod" 
                    type="number"
                    min="1"
                    @input="recalculatePPIC"
                    class="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-xs"
                  />
                  <span class="text-slate-400 text-xs">hari</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Riwayat 90 Hari -->
          <div class="grid grid-cols-3 gap-2 p-3 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-700 text-center">
            <div>
              <span class="text-[10px] text-slate-400 block">Total Keluar 90 Hari</span>
              <strong class="font-bold text-slate-800 dark:text-slate-200 text-xs">{{ ppicCalcData.totalOutQty }} {{ ppicCalcData.satuan }}</strong>
            </div>
            <div>
              <span class="text-[10px] text-slate-400 block">Rata-rata/Hari (ADU)</span>
              <strong class="font-bold text-slate-800 dark:text-slate-200 text-xs">{{ ppicCalcData.adu }} /h</strong>
            </div>
            <div>
              <span class="text-[10px] text-slate-400 block">Puncak/Hari (MDU)</span>
              <strong class="font-bold text-slate-800 dark:text-slate-200 text-xs">{{ ppicCalcData.mdu }} /h</strong>
            </div>
          </div>

          <!-- Hasil Rekomendasi PPIC -->
          <div class="grid grid-cols-3 gap-2.5">
            <div class="p-3 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-900/50 text-center">
              <span class="text-[10px] font-bold text-blue-600 dark:text-blue-400 block">Safety Stock</span>
              <strong class="text-base font-black text-blue-700 dark:text-blue-300">{{ ppicCalcData.safetyStock }}</strong>
              <span class="text-[9px] text-blue-500 block">Pengaman</span>
            </div>
            <div class="p-3 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/50 text-center">
              <span class="text-[10px] font-bold text-amber-600 dark:text-amber-400 block">Min. Stok (ROP)</span>
              <strong class="text-base font-black text-amber-700 dark:text-amber-300">{{ ppicCalcData.recommendedRop }}</strong>
              <span class="text-[9px] text-amber-500 block">Titik Pesan</span>
            </div>
            <div class="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-900/50 text-center">
              <span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block">Maks. Stok</span>
              <strong class="text-base font-black text-emerald-700 dark:text-emerald-300">{{ ppicCalcData.recommendedMaxStock }}</strong>
              <span class="text-[9px] text-emerald-500 block">Kapasitas Aman</span>
            </div>
          </div>
        </div>

        <!-- Footer Modal -->
        <div class="px-5 sm:px-6 py-3.5 bg-slate-50/80 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button 
            type="button" 
            @click="isPPICModalOpen = false" 
            class="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Tutup
          </button>
          <button 
            type="button" 
            @click="applyPRICToItem" 
            class="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
          >
            <CheckCircle2 class="w-3.5 h-3.5" />
            <span>Simpan Perubahan ke Database</span>
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
  ChevronsUpDown 
} from 'lucide-vue-next';
import * as XLSX from 'xlsx';

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

const emit = defineEmits(['refresh-data', 'create-order']);

const searchQuery = ref('');
const activeStatusFilter = ref('ALL'); // 'ALL' | 'CRITICAL' | 'REORDER' | 'REORDER_ALL' | 'OPTIMAL' | 'OVERSTOCK'
const sortKey = ref('suggestedOrderQty');
const sortOrder = ref('desc');
const currentPage = ref(1);
const pageSize = ref(10);

// State Modal Simulasi PPIC
const isPPICModalOpen = ref(false);
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
