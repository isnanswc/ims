<template>
  <div class="space-y-5 pb-24 md:pb-6">
    <!-- ============================================================== -->
    <!-- VIEW MODE 1: DAFTAR SELURUH MASTER ITEM & RINGKASAN KONDISI    -->
    <!-- ============================================================== -->
    <div v-if="currentMode === 'list'" class="space-y-4">
      <!-- Header List Master Item Ledger -->
      <div class="glass-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 class="text-base sm:text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <span>Item Ledger (Buku Besar Mutasi)</span>
            <span class="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700">
              {{ itemsWithStock.length }} Master Item
            </span>
          </h1>
          <p class="text-xs text-zinc-400 mt-0.5">
            Daftar seluruh item barang dan kondisi transaksi persediaan. Klik item untuk membuka halaman audit kartu stok & grafik mutasi.
          </p>
        </div>

        <button 
          @click="downloadLedgerSummaryExcel" 
          class="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-xl font-bold text-xs border border-zinc-300 dark:border-zinc-700 shadow-xs transition-all self-start sm:self-auto cursor-pointer"
          title="Ekspor ringkasan buku besar seluruh item ke Excel (.xlsx)"
        >
          <Download class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Ekspor Buku Besar</span>
        </button>
      </div>

      <!-- Toolbar: Search & Filter Status -->
      <div class="glass-card p-3 space-y-2.5">
        <div class="grid grid-cols-1 sm:grid-cols-12 gap-2">
          <div class="sm:col-span-8 relative">
            <Search class="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              v-model="catalogSearch" 
              type="text" 
              placeholder="Cari berdasarkan kode unik (SKU), deskripsi barang, atau satuan..." 
              class="w-full pl-9 pr-3 py-1.5 glass-input rounded-xl text-xs"
            />
          </div>
          <div class="sm:col-span-4">
            <select 
              v-model="catalogStatusFilter"
              class="w-full px-3 py-1.5 glass-input rounded-xl text-xs font-semibold"
            >
              <option value="ALL">Semua Status Persediaan</option>
              <option value="LOW">⚠️ Stok Kritis (Di Bawah Minimum)</option>
              <option value="SAFE">✅ Stok Aman</option>
            </select>
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

      <!-- Mobile Card View: Katalog Master Item (Khusus Smartphone / md:hidden) -->
      <div v-else class="md:hidden space-y-3">
        <div v-if="filteredCatalogItems.length === 0" class="glass-card p-6 text-center text-slate-400 text-xs">
          Tidak ada barang yang cocok dengan pencarian atau filter.
        </div>

        <div 
          v-for="item in paginatedCatalogItems" 
          :key="item.uniqCode"
          @click="openItemDetailPage(item.uniqCode)"
          class="glass-card p-2.5 space-y-1.5 cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-700 transition-all active:scale-[0.99] border-l-2"
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
              <span>{{ item.stockLevelLabel || (item.isLowStock ? 'Kritis' : 'Optimal') }}</span>
            </span>
          </div>

          <!-- Baris 2: Strip Metrik Horizontal (IN, OUT, Saldo) & Aksi Buka -->
          <div class="flex items-center justify-between text-[11px] bg-zinc-50 dark:bg-zinc-900/60 px-2.5 py-1 rounded-lg border border-zinc-200/60 dark:border-zinc-800">
            <div class="flex items-center gap-2.5">
              <div>
                <span class="text-zinc-400 text-[10px]">IN: </span>
                <strong class="font-bold text-emerald-600 dark:text-emerald-400 font-mono">+{{ item.inQty || 0 }}</strong>
              </div>
              <div class="text-zinc-300 dark:text-zinc-700">•</div>
              <div>
                <span class="text-zinc-400 text-[10px]">OUT: </span>
                <strong class="font-bold text-rose-600 dark:text-rose-400 font-mono">-{{ item.outQty || 0 }}</strong>
              </div>
              <div class="text-zinc-300 dark:text-zinc-700">•</div>
              <div>
                <span class="text-zinc-400 text-[10px]">Saldo: </span>
                <strong class="font-black text-zinc-900 dark:text-white font-mono">{{ item.currentStock || 0 }}</strong>
                <span class="text-[9.5px] text-zinc-500 ml-0.5">{{ item.satuan }}</span>
              </div>
            </div>

            <div class="flex items-center gap-1 text-[11px] font-bold text-zinc-900 dark:text-zinc-100 hover:text-emerald-600 shrink-0">
              <span class="text-[10px] hidden xs:inline">Buku Besar</span>
              <ArrowRight class="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      <!-- Desktop View: Tabel Katalog Master Item (Khusus Layar Desktop / md:block) -->
      <div v-if="!isLoading" class="hidden md:block glass-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-zinc-100/70 dark:bg-zinc-850/70 border-b border-zinc-200/80 dark:border-zinc-800 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase select-none">
                <th class="py-2.5 px-3.5">Kode Item (SKU)</th>
                <th class="py-2.5 px-3.5">Deskripsi Barang</th>
                <th class="py-2.5 px-3.5 text-center">Satuan</th>
                <th class="py-2.5 px-3.5 text-center">Tgl Registrasi</th>
                <th class="py-2.5 px-3.5 text-right font-bold text-zinc-900 dark:text-white">Total Masuk (IN)</th>
                <th class="py-2.5 px-3.5 text-right font-bold text-rose-600 dark:text-rose-400">Total Keluar (OUT)</th>
                <th class="py-2.5 px-3.5 text-right font-black">Stok Akhir</th>
                <th class="py-2.5 px-3.5 text-center">Status</th>
                <th class="py-2.5 px-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              <tr v-if="filteredCatalogItems.length === 0">
                <td colspan="9" class="py-8 text-center text-slate-400 text-xs">
                  Tidak ada barang yang cocok dengan pencarian atau filter.
                </td>
              </tr>
              <tr 
                v-for="item in paginatedCatalogItems" 
                :key="item.uniqCode"
                @click="openItemDetailPage(item.uniqCode)"
                class="hover:bg-emerald-500/5 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
              >
                <td class="py-2.5 px-3.5 font-mono font-bold text-slate-900 dark:text-slate-100">
                  <span class="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200/70 dark:border-slate-700">
                    {{ item.uniqCode }}
                  </span>
                </td>
                <td class="py-2.5 px-3.5 font-medium text-slate-900 dark:text-slate-100">{{ item.deskripsi }}</td>
                <td class="py-2.5 px-3.5 text-center">
                  <span class="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-600 dark:text-slate-400">
                    {{ item.satuan }}
                  </span>
                </td>
                <td class="py-2.5 px-3.5 text-center text-slate-500 text-[11px]">
                  {{ item.createdAt ? item.createdAt.split('T')[0] : '-' }}
                </td>
                <td class="py-2.5 px-3.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                  +{{ item.inQty || 0 }}
                </td>
                <td class="py-2.5 px-3.5 text-right font-bold text-rose-600 dark:text-rose-400">
                  -{{ item.outQty || 0 }}
                </td>
                <td class="py-2.5 px-3.5 text-right font-black text-sm text-slate-900 dark:text-white">
                  {{ item.currentStock || 0 }} <span class="text-[10px] text-slate-400 font-normal">{{ item.satuan }}</span>
                </td>
                <td class="py-2.5 px-3.5 text-center">
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
                    <span>{{ item.stockLevelLabel || (item.isLowStock ? 'Kritis' : 'Optimal') }}</span>
                  </span>
                </td>
                <td class="py-2.5 px-3.5 text-center" @click.stop>
                  <button 
                    @click="openItemDetailPage(item.uniqCode)"
                    class="group relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 mx-auto overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-sm hover:shadow-md hover:shadow-emerald-500/25 border border-emerald-400/30 active:scale-95"
                    title="Buka Kartu Stok & Audit Mutasi"
                  >
                    <span class="absolute inset-0 w-full h-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    <FileText class="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
                    <span class="tracking-wide">Kartu Stok</span>
                    <ArrowRight class="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Unified Pagination Katalog Master Item -->
      <div v-if="!isLoading && filteredCatalogItems.length > 0" class="glass-card p-2.5">
        <Pagination 
          :current-page="catalogCurrentPage"
          :page-size="catalogPageSize"
          :total-items="filteredCatalogItems.length"
          @update:current-page="catalogCurrentPage = $event"
          @update:page-size="catalogPageSize = $event"
        />
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- VIEW MODE 2: DETAIL ITEM LEDGER (PAGE TERPISAH DENGAN GRAFIK) -->
    <!-- ============================================================== -->
    <div v-else-if="currentMode === 'detail' && currentItem" class="space-y-4">
      <!-- Top Action Navigation: Kembali & Judul -->
      <div class="flex flex-wrap items-center justify-between gap-3">
        <button 
          @click="resetToList()"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-colors shadow-sm group"
        >
          <ArrowLeft class="w-4 h-4 text-emerald-600 group-hover:-translate-x-0.5 transition-transform" />
          <span>&larr; Kembali ke Daftar Item Ledger</span>
        </button>

        <button 
          @click="exportLedgerToExcel"
          class="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all"
        >
          <FileSpreadsheet class="w-4 h-4" />
          <span>Ekspor Kartu Stok Excel (.xlsx)</span>
        </button>
      </div>

      <!-- Header Banner Informasi Item Terpilih & PPIC Levels -->
      <div class="glass-card p-4 sm:p-5 border-l-4 border-l-emerald-500 space-y-3.5">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b border-slate-200/60 dark:border-slate-800 pb-3">
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-xs font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded">
                {{ currentItem.uniqCode }}
              </span>
              <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white">{{ currentItem.deskripsi }}</h2>
              <!-- PPIC Status Badge -->
              <span 
                :class="[
                  'px-2.5 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center gap-1',
                  currentItem.stockLevel === 'CRITICAL' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-300 dark:border-rose-800' :
                  currentItem.stockLevel === 'REORDER' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-300 dark:border-amber-800' :
                  currentItem.stockLevel === 'OVERSTOCK' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 border-purple-300 dark:border-purple-800' :
                  'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                ]"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="[
                  currentItem.stockLevel === 'CRITICAL' ? 'bg-rose-500' :
                  currentItem.stockLevel === 'REORDER' ? 'bg-amber-500' :
                  currentItem.stockLevel === 'OVERSTOCK' ? 'bg-purple-500' : 'bg-emerald-500'
                ]"></span>
                <span>{{ currentItem.stockLevelLabel || 'Optimal' }}</span>
              </span>
            </div>
            <p class="text-[11px] text-slate-400 mt-1">
              Satuan: <strong class="text-slate-700 dark:text-slate-300">{{ currentItem.satuan }}</strong> | 
              Min. Stok (ROP): <strong class="text-slate-700 dark:text-slate-300">{{ currentItem.minStock || 0 }}</strong> | 
              Maks. Stok: <strong class="text-slate-700 dark:text-slate-300">{{ currentItem.maxStock || '-' }}</strong> | 
              Lead Time: <strong class="text-slate-700 dark:text-slate-300">{{ currentItem.leadTime || 7 }} hari</strong>
            </p>
          </div>

          <!-- Quick Stat Metrics & PPIC Button -->
          <div class="flex flex-wrap items-center gap-2 text-xs">
            <div class="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-500/20 text-center">
              <span class="text-[10px] text-slate-400 block">Total Masuk</span>
              <strong class="text-emerald-600 dark:text-emerald-400 font-bold">+{{ ledgerStats.totalIn }}</strong>
            </div>
            <div class="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-500/20 text-center">
              <span class="text-[10px] text-slate-400 block">Total Keluar</span>
              <strong class="text-rose-600 dark:text-rose-400 font-bold">-{{ ledgerStats.totalOut }}</strong>
            </div>
            <div class="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-500/20 text-center">
              <span class="text-[10px] text-slate-400 block">Saldo Akhir</span>
              <strong class="text-blue-600 dark:text-blue-400 font-extrabold text-sm">{{ ledgerStats.currentBalance }}</strong>
            </div>

            <!-- Tombol Buka Kalkulator PPIC -->
            <button 
              @click="openPPICModal"
              class="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all ml-1 cursor-pointer"
              title="Hitung Parameter Min-Max PPIC Berdasarkan Mutasi"
            >
              <Calculator class="w-3.5 h-3.5" />
              <span>⚡ Kalkulator PPIC</span>
            </button>

            <!-- Tombol Ekspor Kartu Stok -->
            <button 
              @click="downloadStockCardExcel"
              class="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-bold border border-zinc-300 dark:border-zinc-700 shadow-xs transition-all ml-1 cursor-pointer"
              title="Ekspor Kartu Stok & Riwayat Mutasi ke Excel (.xlsx)"
            >
              <Download class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Ekspor Kartu Stok</span>
            </button>
          </div>
        </div>

        <!-- Filter Range Waktu Tertentu -->
        <div class="flex flex-wrap items-center justify-between gap-2.5 pt-1 text-xs">
          <!-- Quick Preset Buttons -->
          <div class="flex flex-wrap items-center gap-1.5 font-semibold text-[11px]">
            <span class="text-slate-400 text-[10px] uppercase font-bold mr-1">Filter Waktu:</span>
            <button 
              @click="applyDatePreset(7)"
              :class="['px-2.5 py-1 rounded-lg transition-all', activePreset === 7 ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200']"
            >
              7 Hari
            </button>
            <button 
              @click="applyDatePreset(30)"
              :class="['px-2.5 py-1 rounded-lg transition-all', activePreset === 30 ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200']"
            >
              30 Hari
            </button>
            <button 
              @click="applyDatePreset(90)"
              :class="['px-2.5 py-1 rounded-lg transition-all', activePreset === 90 ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200']"
            >
              3 Bulan Terakhir
            </button>
            <button 
              @click="applyDatePreset(0)"
              :class="['px-2.5 py-1 rounded-lg transition-all', activePreset === 0 ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200']"
            >
              Semua Waktu
            </button>
          </div>

          <!-- Custom Date Input -->
          <div class="flex items-center gap-2">
            <input 
              v-model="startDate" 
              type="date"
              @change="activePreset = null"
              class="px-2.5 py-1 glass-input rounded-lg text-xs"
              title="Mulai Tanggal"
            />
            <span class="text-slate-400">s/d</span>
            <input 
              v-model="endDate" 
              type="date"
              @change="activePreset = null"
              class="px-2.5 py-1 glass-input rounded-lg text-xs"
              title="Sampai Tanggal"
            />
            <button 
              v-if="startDate || endDate" 
              @click="applyDatePreset(0)"
              class="px-2 py-1 text-slate-400 hover:text-slate-600 text-xs"
              title="Reset Filter"
            >
              <RotateCcw class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <!-- ============================================================== -->
      <!-- DIAGRAM LINE KELUAR MASUK BARANG (3 LINE: MASUK, KELUAR, STOK)  -->
      <!-- ============================================================== -->
      <div class="glass-card p-4 sm:p-5 space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-800 pb-2.5">
          <div class="flex items-center space-x-2">
            <TrendingUp class="w-4 h-4 text-emerald-600" />
            <h3 class="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              Grafik Tren Mutasi & Saldo Berjalan (3 Lines Chart)
            </h3>
          </div>

          <!-- Legend 3 Garis -->
          <div class="flex items-center space-x-3 text-[11px] font-semibold">
            <div class="flex items-center space-x-1.5">
              <span class="w-3 h-1 rounded-full bg-emerald-500"></span>
              <span class="text-emerald-700 dark:text-emerald-400">Masuk (IN)</span>
            </div>
            <div class="flex items-center space-x-1.5">
              <span class="w-3 h-1 rounded-full bg-rose-500"></span>
              <span class="text-rose-700 dark:text-rose-400">Keluar (OUT)</span>
            </div>
            <div class="flex items-center space-x-1.5">
              <span class="w-3 h-1 rounded-full bg-blue-500"></span>
              <span class="text-blue-700 dark:text-blue-400">Saldo Stok</span>
            </div>
          </div>
        </div>

        <!-- SVG Line Chart Rendering -->
        <div class="w-full overflow-hidden pt-2">
          <div v-if="chartDataPoints.length < 2" class="py-12 text-center text-slate-400 text-xs">
            Data transaksi belum cukup untuk merender grafik tren.
          </div>
          <div v-else class="relative w-full">
            <svg 
              :viewBox="`0 0 ${chartWidth} ${chartHeight}`" 
              class="w-full h-56 sm:h-64 overflow-visible"
            >
              <defs>
                <!-- Gradients for subtle area fills -->
                <linearGradient id="stockAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.15" />
                  <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.0" />
                </linearGradient>
              </defs>

              <!-- Horizontal Grid Lines -->
              <line 
                v-for="(val, idx) in yAxisTicks" 
                :key="idx"
                :x1="paddingLeft" 
                :y1="getY(val)" 
                :x2="chartWidth - paddingRight" 
                :y2="getY(val)" 
                stroke="currentColor" 
                class="text-slate-200 dark:text-slate-800" 
                stroke-dasharray="3 3"
              />

              <!-- Y-Axis Values -->
              <text 
                v-for="(val, idx) in yAxisTicks" 
                :key="'txt-' + idx"
                :x="paddingLeft - 8" 
                :y="getY(val) + 4" 
                text-anchor="end" 
                class="fill-slate-400 text-[10px] font-mono select-none"
              >
                {{ val }}
              </text>

              <!-- Area Fill under Stock Line -->
              <path :d="stockAreaPath" fill="url(#stockAreaGrad)" />

              <!-- Line 1: Inbound (Masuk - Emerald) -->
              <path 
                :d="inLinePath" 
                fill="none" 
                stroke="#10b981" 
                stroke-width="2.5" 
                stroke-linecap="round" 
                stroke-linejoin="round"
              />

              <!-- Line 2: Outbound (Keluar - Rose) -->
              <path 
                :d="outLinePath" 
                fill="none" 
                stroke="#f43f5e" 
                stroke-width="2.5" 
                stroke-linecap="round" 
                stroke-linejoin="round"
              />

              <!-- Line 3: Stock Balance (Saldo Berjalan - Blue) -->
              <path 
                :d="stockLinePath" 
                fill="none" 
                stroke="#3b82f6" 
                stroke-width="3" 
                stroke-linecap="round" 
                stroke-linejoin="round"
              />

              <!-- Data Dots & Hover Hitbox -->
              <g v-for="(p, idx) in chartDataPoints" :key="'p-' + idx">
                <!-- Dot Masuk -->
                <circle 
                  v-if="p.inQty > 0"
                  :cx="getX(idx)" 
                  :cy="getY(p.inQty)" 
                  r="3.5" 
                  fill="#10b981" 
                  class="stroke-white dark:stroke-slate-900 stroke-2"
                />
                <!-- Dot Keluar -->
                <circle 
                  v-if="p.outQty > 0"
                  :cx="getX(idx)" 
                  :cy="getY(p.outQty)" 
                  r="3.5" 
                  fill="#f43f5e" 
                  class="stroke-white dark:stroke-slate-900 stroke-2"
                />
                <!-- Dot Saldo Stok -->
                <circle 
                  :cx="getX(idx)" 
                  :cy="getY(p.balance)" 
                  r="4" 
                  fill="#3b82f6" 
                  class="stroke-white dark:stroke-slate-900 stroke-2 cursor-pointer hover:r-6 transition-all"
                  @mouseenter="hoveredPoint = { ...p, x: getX(idx), y: getY(p.balance) }"
                  @mouseleave="hoveredPoint = null"
                />

                <!-- X Axis Date Labels (Tampilkan berkala agar tidak menumpuk) -->
                <text 
                  v-if="showXLabel(idx)"
                  :x="getX(idx)" 
                  :y="chartHeight - 4" 
                  text-anchor="middle" 
                  class="fill-slate-400 text-[9px] font-mono select-none"
                >
                  {{ formatShortDate(p.tanggal) }}
                </text>
              </g>
            </svg>

            <!-- Floating Hover Tooltip -->
            <div 
              v-if="hoveredPoint"
              class="absolute z-30 p-2.5 rounded-xl glass-panel border border-slate-200 dark:border-slate-700 shadow-xl text-xs pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3"
              :style="{ left: `${(hoveredPoint.x / chartWidth) * 100}%`, top: `${(hoveredPoint.y / chartHeight) * 100}%` }"
            >
              <div class="font-bold text-slate-800 dark:text-slate-100 border-b pb-1 mb-1 font-mono">
                {{ hoveredPoint.tanggal }}
              </div>
              <div class="space-y-0.5 text-[11px]">
                <div class="text-blue-600 dark:text-blue-400 font-extrabold">Saldo Stok: {{ hoveredPoint.balance }} {{ currentItem.satuan }}</div>
                <div class="text-emerald-600 dark:text-emerald-400">Masuk (IN): +{{ hoveredPoint.inQty }}</div>
                <div class="text-rose-600 dark:text-rose-400">Keluar (OUT): -{{ hoveredPoint.outQty }}</div>
                <div class="text-slate-400 text-[10px] mt-0.5 truncate">Doc: {{ hoveredPoint.noDocument || '-' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================================================== -->
      <!-- TABEL KARTU STOK BUKU BESAR RINCIAN (DENGAN BARIS SALDO AWAL)  -->
      <!-- ============================================================== -->
      <div class="glass-card overflow-hidden space-y-2 p-3.5">
        <div class="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
          <h3 class="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
            <FileSpreadsheet class="w-4 h-4 text-emerald-600" />
            <span>Riwayat Mutasi Kronologis ({{ ledgerRows.length }} Baris)</span>
          </h3>
          <span class="text-[11px] text-slate-400">
            Urutan: Terlama &rarr; Terbaru
          </span>
        </div>

        <!-- Mobile View: Riwayat Mutasi Kronologis Rows (md:hidden) -->
        <div class="md:hidden space-y-1.5">
          <div v-if="paginatedLedger.length === 0" class="p-6 text-center text-slate-400 text-xs">
            Belum ada transaksi mutasi untuk barang ini pada rentang waktu terpilih.
          </div>

          <div 
            v-for="(row, idx) in paginatedLedger" 
            :key="idx"
            :class="[
              'p-2.5 rounded-lg border space-y-1 transition-all',
              row.type === 'REG' 
                ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50' 
                : 'bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800'
            ]"
          >
            <!-- Baris 1: Tanggal & No Dokumen + Badge Tipe -->
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-1.5 min-w-0">
                <span class="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 font-mono shrink-0">
                  {{ row.tanggal }}
                </span>
                <span class="text-zinc-300 dark:text-zinc-700">•</span>
                <span class="font-mono font-bold text-xs text-zinc-900 dark:text-white truncate">
                  {{ row.noDocument || '-' }}
                </span>
              </div>

              <span 
                v-if="row.type === 'REG'"
                class="px-1.5 py-0.5 rounded text-[9.5px] font-bold uppercase bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 shrink-0"
              >
                Registrasi
              </span>
              <span 
                v-else
                :class="[
                  'px-1.5 py-0.5 rounded text-[9.5px] font-bold uppercase shrink-0',
                  row.type === 'IN' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                ]"
              >
                {{ row.type === 'IN' ? 'Masuk' : 'Keluar' }}
              </span>
            </div>

            <!-- Baris 2: Mutasi Qty & Saldo Berjalan (Horizontal Padat) -->
            <div class="flex items-center justify-between text-[11px] pt-0.5">
              <div class="flex items-center gap-1.5 min-w-0">
                <span class="text-zinc-400 text-[10px]">Mutasi:</span>
                <span v-if="row.type === 'REG'" class="text-xs text-slate-400 font-normal">0</span>
                <span v-else-if="row.inQty > 0" class="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">+{{ row.inQty }} {{ currentItem.satuan }}</span>
                <span v-else-if="row.outQty > 0" class="text-xs font-bold text-rose-600 dark:text-rose-400 font-mono">-{{ row.outQty }} {{ currentItem.satuan }}</span>
                <span v-else class="text-xs text-zinc-400">-</span>
                <span v-if="row.lineKeterangan || row.keterangan" class="text-[10px] text-zinc-400 truncate max-w-[120px] italic hidden xs:inline">
                  ({{ row.lineKeterangan || row.keterangan }})
                </span>
              </div>

              <div class="flex items-center gap-1 shrink-0">
                <span class="text-[10px] text-zinc-400">Saldo:</span>
                <span class="font-black text-xs text-zinc-950 dark:text-white font-mono">
                  {{ row.balance }} <span class="text-[9.5px] font-normal text-zinc-400">{{ currentItem.satuan }}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Desktop View: Tabel Riwayat Mutasi (hidden md:block) -->
        <div class="hidden md:block border border-slate-200/70 dark:border-slate-800 rounded-xl overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-slate-100/70 dark:bg-slate-800/70 border-b border-slate-200/80 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase select-none">
                <th class="py-2.5 px-3">Tanggal</th>
                <th class="py-2.5 px-3">No. Dokumen</th>
                <th class="py-2.5 px-3 text-center">Tipe Transaksi</th>
                <th class="py-2.5 px-3 text-right text-emerald-600 dark:text-emerald-400">Masuk (+)</th>
                <th class="py-2.5 px-3 text-right text-rose-600 dark:text-rose-400">Keluar (-)</th>
                <th class="py-2.5 px-3 text-right font-black bg-slate-100/50 dark:bg-slate-800/50">Saldo Berjalan</th>
                <th class="py-2.5 px-3">Keterangan</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              <tr 
                v-for="(row, idx) in paginatedLedger" 
                :key="idx"
                :class="[
                  'transition-colors',
                  row.type === 'REG' 
                    ? 'bg-blue-50/50 dark:bg-blue-950/25 font-semibold' 
                    : 'hover:bg-emerald-500/5 dark:hover:bg-slate-800/50'
                ]"
              >
                <td class="py-2.5 px-3 font-medium whitespace-nowrap">{{ row.tanggal }}</td>
                <td class="py-2.5 px-3 font-mono">
                  <span v-if="row.type === 'REG'" class="text-blue-600 dark:text-blue-400 font-bold">
                    {{ row.noDocument }}
                  </span>
                  <span v-else class="text-slate-800 dark:text-slate-200 font-semibold">
                    {{ row.noDocument || '-' }}
                  </span>
                </td>
                <td class="py-2.5 px-3 text-center">
                  <span 
                    v-if="row.type === 'REG'"
                    class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                  >
                    Registrasi Awal
                  </span>
                  <span 
                    v-else
                    :class="[
                      'px-2 py-0.5 rounded text-[10px] font-bold uppercase',
                      row.type === 'IN' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    ]"
                  >
                    {{ row.type === 'IN' ? 'TO Masuk' : 'TO Keluar' }}
                  </span>
                </td>
                <td class="py-2.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                  <span v-if="row.type === 'REG'" class="text-slate-400 font-normal">0</span>
                  <span v-else-if="row.inQty > 0">+{{ row.inQty }}</span>
                  <span v-else class="text-slate-300 dark:text-slate-600">-</span>
                </td>
                <td class="py-2.5 px-3 text-right font-bold text-rose-600 dark:text-rose-400">
                  <span v-if="row.type === 'REG'" class="text-slate-400 font-normal">0</span>
                  <span v-else-if="row.outQty > 0">-{{ row.outQty }}</span>
                  <span v-else class="text-slate-300 dark:text-slate-600">-</span>
                </td>
                <td class="py-2.5 px-3 text-right font-black text-slate-900 dark:text-white bg-slate-100/30 dark:bg-slate-800/30 text-xs">
                  {{ row.balance }} <span class="text-[10px] text-slate-400 font-normal">{{ currentItem.satuan }}</span>
                </td>
                <td class="py-2.5 px-3 text-slate-500 dark:text-slate-400 max-w-[220px] truncate">
                  {{ row.lineKeterangan || row.keterangan || '-' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Buku Besar -->
        <Pagination 
          :current-page="ledgerCurrentPage"
          :page-size="ledgerPageSize"
          :total-items="ledgerRows.length"
          @update:current-page="ledgerCurrentPage = $event"
          @update:page-size="ledgerPageSize = $event"
        />
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- MODAL ASISTEN KALKULATOR PPIC CERDAS (ITEM LEDGER)             -->
    <!-- ============================================================== -->
    <div 
      v-if="isPPICModalOpen && ppicCalcData" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 dark:bg-black/80 backdrop-blur-md p-3 sm:p-4 transition-all"
    >
      <div class="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl sm:rounded-3xl shadow-2xl shadow-emerald-500/10 dark:shadow-black/70 border border-slate-200/90 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] ring-1 ring-black/5 dark:ring-white/10">
        <!-- Top Light Gradient Bar -->
        <div class="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500"></div>

        <!-- Modal Header -->
        <div class="px-5 sm:px-6 py-4 bg-gradient-to-b from-emerald-50/70 via-teal-50/20 to-white dark:from-slate-800/80 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/25 shadow-sm">
              <Calculator class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Asisten Kalkulator PPIC Cerdas</span>
                <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/25">Audit Min-Max</span>
              </h3>
              <p class="text-[11px] text-slate-400">Prediksi matematis batas stok berdasarkan mutasi keluar 90 hari.</p>
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
                <span class="text-[10px] text-slate-400 block mt-1">Waktu tunggu sejak order s/d tiba.</span>
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
                <span class="text-[10px] text-slate-400 block mt-1">Interval jadwal reorder (misal 14 hari).</span>
              </div>
            </div>
          </div>

          <!-- Histori Pengeluaran 90 Hari -->
          <div class="grid grid-cols-3 gap-2 p-3 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-700 text-center">
            <div>
              <span class="text-[10px] text-slate-400 block">Total Keluar 90 Hari</span>
              <strong class="font-bold text-slate-800 dark:text-slate-200 text-xs">{{ ppicCalcData.totalOutQty }} {{ ppicCalcData.satuan }}</strong>
            </div>
            <div>
              <span class="text-[10px] text-slate-400 block">Rata-rata/Hari (ADU)</span>
              <strong class="font-bold text-slate-800 dark:text-slate-200 text-xs">{{ ppicCalcData.adu }} /hari</strong>
            </div>
            <div>
              <span class="text-[10px] text-slate-400 block">Puncak/Hari (MDU)</span>
              <strong class="font-bold text-slate-800 dark:text-slate-200 text-xs">{{ ppicCalcData.mdu }} /hari</strong>
            </div>
          </div>

          <!-- Rekomendasi PPIC -->
          <div class="space-y-2">
            <span class="font-bold text-[11px] uppercase tracking-wider text-slate-500 block">Hasil Kalkulasi Rekomendasi PPIC:</span>
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

          <!-- Ringkasan Rekomendasi Tindakan -->
          <div class="p-3 bg-slate-100/70 dark:bg-slate-800/80 rounded-xl text-slate-700 dark:text-slate-300 text-[11px] space-y-1">
            <div class="flex items-center justify-between">
              <span>Saran Order Pengadaan Saat Ini:</span>
              <strong :class="ppicCalcData.suggestedOrderQty > 0 ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-emerald-600 dark:text-emerald-400 font-bold'">
                {{ ppicCalcData.suggestedOrderQty > 0 ? `+${ppicCalcData.suggestedOrderQty} ${ppicCalcData.satuan} (Waktunya Reorder)` : 'Stok Aman' }}
              </strong>
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
import { ref, computed, watch, onMounted } from 'vue';
import { getItemLedgerHistory, calculateItemPPICMetrics, db } from '../database/db';
import Pagination from '../components/Pagination.vue';
import SkeletonLoader from '../components/SkeletonLoader.vue';
import { 
  FileSpreadsheet, 
  Search, 
  Eye, 
  ArrowLeft, 
  ArrowRight,
  TrendingUp, 
  RotateCcw,
  FileText,
  Calculator,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  X,
  Download
} from 'lucide-vue-next';
import * as XLSX from 'xlsx';
import { createStyledSheet } from '../utils/excelFormatter';

const props = defineProps({
  itemsWithStock: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['subpage-change', 'refresh-data']);

// State Modal PPIC
const isPPICModalOpen = ref(false);
const ppicCalcData = ref(null);
const simLeadTime = ref(7);
const simReviewPeriod = ref(14);

// State Mode: 'list' (Katalog Item) | 'detail' (Page Terpisah Kartu Stok & Grafik)
const currentMode = ref('list');

// State Mode 1: Katalog Master Item
const catalogSearch = ref('');
const catalogStatusFilter = ref('ALL');
const catalogCurrentPage = ref(1);
const catalogPageSize = ref(10);

// State Mode 2: Detail Kartu Stok & Grafik
const selectedUniqCode = ref('');
const startDate = ref('');
const endDate = ref('');
const activePreset = ref(90); // default 3 bulan terakhir
const ledgerRows = ref([]);
const ledgerCurrentPage = ref(1);
const ledgerPageSize = ref(10);

// State SVG Line Chart
const chartWidth = 800;
const chartHeight = 220;
const paddingLeft = 45;
const paddingRight = 25;
const paddingTop = 20;
const paddingBottom = 30;
const hoveredPoint = ref(null);

const currentItem = computed(() => {
  return props.itemsWithStock.find(i => i.uniqCode === selectedUniqCode.value) || null;
});

// Filter Katalog Master Item
const filteredCatalogItems = computed(() => {
  let list = [...props.itemsWithStock];

  if (catalogStatusFilter.value === 'LOW') {
    list = list.filter(i => i.isLowStock);
  } else if (catalogStatusFilter.value === 'SAFE') {
    list = list.filter(i => !i.isLowStock);
  }

  if (catalogSearch.value.trim()) {
    const q = catalogSearch.value.toLowerCase().trim();
    list = list.filter(i => 
      i.uniqCode.toLowerCase().includes(q) ||
      i.deskripsi.toLowerCase().includes(q) ||
      i.satuan.toLowerCase().includes(q)
    );
  }

  return list;
});

const paginatedCatalogItems = computed(() => {
  const start = (catalogCurrentPage.value - 1) * catalogPageSize.value;
  return filteredCatalogItems.value.slice(start, start + catalogPageSize.value);
});

// Statistik Kartu Stok
const ledgerStats = computed(() => {
  const totalIn = ledgerRows.value.reduce((acc, curr) => acc + (curr.inQty || 0), 0);
  const totalOut = ledgerRows.value.reduce((acc, curr) => acc + (curr.outQty || 0), 0);
  const currentBalance = ledgerRows.value.length > 0 
    ? ledgerRows.value[ledgerRows.value.length - 1].balance 
    : 0;

  return { totalIn, totalOut, currentBalance };
});

const paginatedLedger = computed(() => {
  const start = (ledgerCurrentPage.value - 1) * ledgerPageSize.value;
  return ledgerRows.value.slice(start, start + ledgerPageSize.value);
});

// Data Points untuk Grafik SVG Line Chart
const chartDataPoints = computed(() => {
  return ledgerRows.value;
});

const maxChartValue = computed(() => {
  if (chartDataPoints.value.length === 0) return 10;
  const maxVal = Math.max(
    ...chartDataPoints.value.map(p => Math.max(p.balance || 0, p.inQty || 0, p.outQty || 0))
  );
  return Math.max(10, Math.ceil(maxVal * 1.15));
});

const yAxisTicks = computed(() => {
  const max = maxChartValue.value;
  return [0, Math.round(max * 0.33), Math.round(max * 0.66), max];
});

function getX(index) {
  const count = chartDataPoints.value.length;
  if (count <= 1) return paddingLeft;
  const availWidth = chartWidth - paddingLeft - paddingRight;
  return paddingLeft + (index / (count - 1)) * availWidth;
}

function getY(val) {
  const max = maxChartValue.value;
  const availHeight = chartHeight - paddingTop - paddingBottom;
  const clamped = Math.max(0, val || 0);
  return chartHeight - paddingBottom - (clamped / max) * availHeight;
}

// SVG Line Paths (3 Lines: Masuk, Keluar, Saldo Stok)
const inLinePath = computed(() => {
  if (chartDataPoints.value.length === 0) return '';
  return chartDataPoints.value.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.inQty)}`).join(' ');
});

const outLinePath = computed(() => {
  if (chartDataPoints.value.length === 0) return '';
  return chartDataPoints.value.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.outQty)}`).join(' ');
});

const stockLinePath = computed(() => {
  if (chartDataPoints.value.length === 0) return '';
  return chartDataPoints.value.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.balance)}`).join(' ');
});

const stockAreaPath = computed(() => {
  if (chartDataPoints.value.length === 0) return '';
  const firstX = getX(0);
  const lastX = getX(chartDataPoints.value.length - 1);
  const baseY = getY(0);
  return `${stockLinePath.value} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
});

function showXLabel(idx) {
  const total = chartDataPoints.value.length;
  if (total <= 6) return true;
  const step = Math.ceil(total / 6);
  return idx % step === 0 || idx === total - 1;
}

function formatShortDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  return parts.length >= 3 ? `${parts[2]}/${parts[1]}` : dateStr;
}

// Buka Halaman Terpisah Detail Item Ledger
function openItemDetailPage(uniqCode) {
  selectedUniqCode.value = uniqCode;
  applyDatePreset(90); // default 3 bulan terakhir
  currentMode.value = 'detail';
  emit('subpage-change', `Kartu Stok (${uniqCode})`);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetToList() {
  currentMode.value = 'list';
  emit('subpage-change', '');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

defineExpose({ resetToList });

async function loadLedger() {
  if (!selectedUniqCode.value) {
    ledgerRows.value = [];
    return;
  }
  ledgerRows.value = await getItemLedgerHistory(
    selectedUniqCode.value, 
    startDate.value || null, 
    endDate.value || null
  );
  ledgerCurrentPage.value = 1;
}

// Preset Rentang Waktu (7 Hari, 30 Hari, 90 Hari / 3 Bulan, Semua)
function applyDatePreset(days) {
  activePreset.value = days;
  if (days === 0) {
    startDate.value = '';
    endDate.value = '';
  } else {
    const end = new Date();
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
    startDate.value = start.toISOString().split('T')[0];
    endDate.value = end.toISOString().split('T')[0];
  }
  loadLedger();
}

watch([selectedUniqCode, startDate, endDate], () => {
  loadLedger();
});

watch(() => props.itemsWithStock, (newVal) => {
  if (newVal.length > 0 && !selectedUniqCode.value) {
    selectedUniqCode.value = newVal[0].uniqCode;
  }
  if (currentMode.value === 'detail') {
    loadLedger();
  }
});

onMounted(() => {
  if (props.itemsWithStock.length > 0 && !selectedUniqCode.value) {
    selectedUniqCode.value = props.itemsWithStock[0].uniqCode;
  }
});

function exportLedgerToExcel() {
  if (!currentItem.value || ledgerRows.value.length === 0) {
    alert('Tidak ada data mutasi kartu stok untuk diekspor.');
    return;
  }

  const exportData = ledgerRows.value.map(row => ({
    'Tanggal Mutasi': row.tanggal,
    'No Dokumen Ref': row.noDocument || '-',
    'Tipe Mutasi': row.type === 'REG' ? '✨ Registrasi Awal' : (row.type === 'IN' ? '📥 TO Masuk (IN)' : '📤 TO Keluar (OUT)'),
    'Kode Item (SKU)': row.uniqCode,
    'Deskripsi Barang': row.deskripsi,
    'Masuk': row.inQty || 0,
    'Keluar': row.outQty || 0,
    'Saldo Akhir Berjalan': row.balance || 0,
    'Satuan': currentItem.value.satuan,
    'Keterangan': row.lineKeterangan || row.keterangan || '-'
  }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, createStyledSheet(exportData), 'Kartu_Stok_Mutasi');

  const dateTag = new Date().toISOString().split('T')[0];
  const rangeTag = activePreset.value ? `${activePreset.value}D` : (startDate.value && endDate.value ? `${startDate.value}_sd_${endDate.value}` : 'ALL');
  const fileName = `IMS_Kartu_Stok_${currentItem.value.uniqCode}_${rangeTag}_${dateTag}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

const downloadStockCardExcel = exportLedgerToExcel;

function downloadLedgerSummaryExcel() {
  if (filteredCatalogItems.value.length === 0) {
    alert('Tidak ada data buku besar untuk diekspor.');
    return;
  }

  const exportRows = filteredCatalogItems.value.map((item, idx) => ({
    'No': idx + 1,
    'Kode Item (SKU)': item.uniqCode,
    'Deskripsi Barang': item.deskripsi,
    'Satuan': item.satuan,
    'Tgl Registrasi': item.createdAt ? new Date(item.createdAt).toLocaleDateString('id-ID') : '-',
    'Total Masuk (IN)': item.totalIn || 0,
    'Total Keluar (OUT)': item.totalOut || 0,
    'Stok Akhir': item.currentStock || 0,
    'Status Persediaan': item.isLowStock ? '🔴 Kritis (Di Bawah Min)' : '🟢 Aman',
    'Batas Min (ROP)': item.minStock || 0,
    'Batas Maks': item.maxStock || 0
  }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, createStyledSheet(exportRows), 'Ringkasan_Buku_Besar');

  const dateTag = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `IMS_Buku_Besar_Ledger_${dateTag}.xlsx`);
}

// Buka Kalkulator PPIC Cerdas dari Detail Item Ledger
async function openPPICModal() {
  if (!currentItem.value) return;
  simLeadTime.value = Number(currentItem.value.leadTime) || 7;
  simReviewPeriod.value = 14;

  ppicCalcData.value = await calculateItemPPICMetrics(
    currentItem.value.uniqCode, 
    simLeadTime.value, 
    simReviewPeriod.value
  );
  isPPICModalOpen.value = true;
}

// Hitung Ulang saat simulasi parameter diubah
async function recalculatePPIC() {
  if (!ppicCalcData.value) return;
  ppicCalcData.value = await calculateItemPPICMetrics(
    ppicCalcData.value.uniqCode, 
    simLeadTime.value, 
    simReviewPeriod.value
  );
}

// Simpan hasil PPIC ke database dari Detail Item Ledger
async function applyPRICToItem() {
  if (!ppicCalcData.value || !currentItem.value?.id) return;

  await db.items.update(currentItem.value.id, {
    minStock: ppicCalcData.value.recommendedRop,
    maxStock: ppicCalcData.value.recommendedMaxStock,
    leadTime: ppicCalcData.value.leadTime,
    updatedAt: new Date().toISOString()
  });

  emit('refresh-data');
  isPPICModalOpen.value = false;
  alert(`Parameter PPIC untuk ${currentItem.value.uniqCode} berhasil diperbarui (Min: ${ppicCalcData.value.recommendedRop}, Max: ${ppicCalcData.value.recommendedMaxStock})!`);
}
</script>
