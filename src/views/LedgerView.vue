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
                    class="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 mx-auto bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 shadow-xs border border-zinc-950 dark:border-white active:scale-95 cursor-pointer"
                    title="Buka Kartu Stok & Audit Mutasi"
                  >
                    <FileText class="w-3.5 h-3.5 shrink-0" />
                    <span class="tracking-wide">Kartu Stok</span>
                    <ArrowRight class="w-3.5 h-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
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
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <button 
          @click="resetToList()"
          class="flex items-center justify-center sm:justify-start gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-xs group w-full sm:w-auto cursor-pointer"
        >
          <ArrowLeft class="w-4 h-4 text-zinc-600 dark:text-zinc-400 group-hover:-translate-x-0.5 transition-transform" />
          <span>&larr; Kembali ke Daftar Item Ledger</span>
        </button>

        <button 
          @click="exportLedgerToExcel"
          class="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 rounded-xl font-bold text-xs shadow-xs border border-zinc-950 dark:border-white transition-all w-full sm:w-auto cursor-pointer"
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
                {{ currentItem?.uniqCode }}
              </span>
              <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white">{{ currentItem?.deskripsi }}</h2>
              <!-- PPIC Status Badge -->
              <span 
                :class="[
                  'px-2.5 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center gap-1',
                  currentItem?.stockLevel === 'CRITICAL' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-300 dark:border-rose-800' :
                  currentItem?.stockLevel === 'REORDER' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-300 dark:border-amber-800' :
                  currentItem?.stockLevel === 'OVERSTOCK' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 border-purple-300 dark:border-purple-800' :
                  'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                ]"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="[
                  currentItem?.stockLevel === 'CRITICAL' ? 'bg-rose-500' :
                  currentItem?.stockLevel === 'REORDER' ? 'bg-amber-500' :
                  currentItem?.stockLevel === 'OVERSTOCK' ? 'bg-purple-500' : 'bg-emerald-500'
                ]"></span>
                <span>{{ currentItem?.stockLevelLabel || 'Optimal' }}</span>
              </span>
            </div>
            <p class="text-[11px] text-slate-400 mt-1">
              Satuan: <strong class="text-slate-700 dark:text-slate-300">{{ currentItem?.satuan }}</strong> | 
              Min. Stok (ROP): <strong class="text-slate-700 dark:text-slate-300">{{ currentItem?.minStock || 0 }}</strong> | 
              Maks. Stok: <strong class="text-slate-700 dark:text-slate-300">{{ currentItem?.maxStock || '-' }}</strong> | 
              Lead Time: <strong class="text-slate-700 dark:text-slate-300">{{ currentItem?.leadTime || 7 }} hari</strong>
            </p>
          </div>

          <!-- Quick Stat Metrics & PPIC Button -->
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 text-xs w-full lg:w-auto">
            <div class="grid grid-cols-3 gap-2">
              <div class="px-2.5 py-1.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-center">
                <span class="text-[10px] text-zinc-500 block">Total Masuk</span>
                <strong class="text-emerald-700 dark:text-emerald-400 font-bold text-xs sm:text-sm">+{{ ledgerStats.totalIn }}</strong>
              </div>
              <div class="px-2.5 py-1.5 bg-rose-500/10 rounded-xl border border-rose-500/20 text-center">
                <span class="text-[10px] text-zinc-500 block">Total Keluar</span>
                <strong class="text-rose-700 dark:text-rose-400 font-bold text-xs sm:text-sm">-{{ ledgerStats.totalOut }}</strong>
              </div>
              <div class="px-2.5 py-1.5 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl border border-zinc-200 dark:border-zinc-700 text-center">
                <span class="text-[10px] text-zinc-500 block">Saldo Akhir</span>
                <strong class="text-zinc-950 dark:text-white font-extrabold text-xs sm:text-sm">{{ ledgerStats.currentBalance }}</strong>
              </div>
            </div>

            <!-- Tombol Aksi Header (Hitam & Putih Monokrom) -->
            <div class="grid grid-cols-2 sm:flex items-center gap-2">
              <button 
                @click="openPPICModal"
                class="flex items-center justify-center gap-1.5 px-3 py-2 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer text-center"
                title="Hitung Parameter Min-Max PPIC Berdasarkan Mutasi"
              >
                <Calculator class="w-3.5 h-3.5 shrink-0" />
                <span>⚡ Kalkulator PPIC</span>
              </button>

              <button 
                @click="downloadStockCardExcel"
                class="flex items-center justify-center gap-1.5 px-3 py-2 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-bold border border-zinc-300 dark:border-zinc-700 shadow-xs transition-all cursor-pointer text-center"
                title="Ekspor Kartu Stok & Riwayat Mutasi ke Excel (.xlsx)"
              >
                <Download class="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300 shrink-0" />
                <span>Ekspor Kartu Stok</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Filter Range Waktu Tertentu -->
        <div class="flex flex-wrap items-center justify-between gap-2.5 pt-1 text-xs">
          <!-- Quick Preset Buttons (Monokrom High-Contrast) -->
          <div class="flex flex-wrap items-center gap-1.5 font-semibold text-[11px]">
            <span class="text-zinc-400 text-[10px] uppercase font-bold mr-1">Filter Waktu:</span>
            <button 
              @click="applyDatePreset(7)"
              :class="['px-2.5 py-1 rounded-lg transition-all cursor-pointer', activePreset === 7 ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs font-bold' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700']"
            >
              7 Hari
            </button>
            <button 
              @click="applyDatePreset(30)"
              :class="['px-2.5 py-1 rounded-lg transition-all cursor-pointer', activePreset === 30 ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs font-bold' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700']"
            >
              30 Hari
            </button>
            <button 
              @click="applyDatePreset(90)"
              :class="['px-2.5 py-1 rounded-lg transition-all cursor-pointer', activePreset === 90 ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs font-bold' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700']"
            >
              3 Bulan Terakhir
            </button>
            <button 
              @click="applyDatePreset(0)"
              :class="['px-2.5 py-1 rounded-lg transition-all cursor-pointer', activePreset === 0 ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs font-bold' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700']"
            >
              Semua Waktu
            </button>
          </div>

          <!-- Custom Date Input -->
          <div class="flex items-center gap-2 w-full sm:w-auto">
            <input 
              v-model="startDate" 
              type="date"
              @change="activePreset = null"
              class="flex-1 sm:flex-initial min-w-0 px-2.5 py-1.5 glass-input rounded-lg text-xs"
              title="Mulai Tanggal"
            />
            <span class="text-slate-400 shrink-0">s/d</span>
            <input 
              v-model="endDate" 
              type="date"
              @change="activePreset = null"
              class="flex-1 sm:flex-initial min-w-0 px-2.5 py-1.5 glass-input rounded-lg text-xs"
              title="Sampai Tanggal"
            />
            <button 
              v-if="startDate || endDate" 
              @click="applyDatePreset(0)"
              class="px-2 py-1.5 text-slate-400 hover:text-slate-600 text-xs shrink-0 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Reset Filter"
            >
              <RotateCcw class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <!-- ============================================================== -->
      <!-- DIAGRAM GARIS TIMELINE KONDISI STOK & AMBANG BATAS PERSAMAAN   -->
      <!-- ============================================================== -->
      <div class="glass-card p-4 sm:p-5 space-y-3.5">
        <!-- Header & Switcher Mode Visualisasi -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200/80 dark:border-zinc-800 pb-3">
          <div class="flex items-center space-x-2.5">
            <div class="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
              <Activity v-if="chartVisualizationMode === 'timeline'" class="w-4 h-4" />
              <TrendingUp v-else class="w-4 h-4" />
            </div>
            <div>
              <h3 class="text-xs sm:text-sm font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                <span>{{ chartVisualizationMode === 'timeline' ? 'Timeline Kondisi Stok & Ambang Batas' : 'Grafik Tren Mutasi (3 Lines Chart)' }}</span>
                <span 
                  v-if="chartVisualizationMode === 'timeline' && currentItem" 
                  class="text-[10px] px-2 py-0.5 rounded-full font-bold border"
                  :class="currentItemStatus.badgeClass"
                >
                  {{ currentItemStatus.label }}
                </span>
              </h3>
              <p class="text-[11px] text-zinc-500 dark:text-zinc-400">
                {{ chartVisualizationMode === 'timeline' 
                  ? 'Garis berubah warna otomatis sesuai zona stok: Hijau (Aman), Kuning (≤ ROP), Merah (≤ Safety Stock).' 
                  : 'Pergerakan volume barang masuk (IN), keluar (OUT), dan akumulasi saldo akhir.' }}
              </p>
            </div>
          </div>

          <!-- Switcher Mode Button Group (Monokrom High-Contrast) -->
          <div class="w-full sm:w-auto grid grid-cols-2 sm:flex items-center p-1 bg-zinc-100 dark:bg-zinc-800/90 rounded-xl border border-zinc-200 dark:border-zinc-700/80 text-xs gap-1">
            <button 
              type="button"
              @click="chartVisualizationMode = 'timeline'"
              :class="[
                'flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer text-center text-[11px] sm:text-xs',
                chartVisualizationMode === 'timeline' 
                  ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
              ]"
            >
              <ShieldCheck class="w-3.5 h-3.5 shrink-0" />
              <span>Timeline Ambang Batas</span>
            </button>
            <button 
              type="button"
              @click="chartVisualizationMode = 'lines'"
              :class="[
                'flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer text-center text-[11px] sm:text-xs',
                chartVisualizationMode === 'lines' 
                  ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
              ]"
            >
              <TrendingUp class="w-3.5 h-3.5 shrink-0" />
              <span>Tren 3 Garis</span>
            </button>
          </div>
        </div>

        <!-- KPI Parameter Ambang Batas (Tampil pada mode Timeline) -->
        <div v-if="chartVisualizationMode === 'timeline'" class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div class="p-2 sm:p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
            <div class="text-[10px] text-slate-400 font-medium flex items-center justify-between">
              <span class="truncate">Safety Stock</span>
              <span class="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
            </div>
            <div class="text-xs sm:text-sm font-extrabold text-rose-600 dark:text-rose-400 mt-0.5 truncate">
              {{ effectiveSafetyStock }} <span class="text-[10px] font-normal text-slate-400">{{ currentItem?.satuan }}</span>
            </div>
          </div>
          <div class="p-2 sm:p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
            <div class="text-[10px] text-slate-400 font-medium flex items-center justify-between">
              <span class="truncate">Reorder Point (ROP)</span>
              <span class="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
            </div>
            <div class="text-xs sm:text-sm font-extrabold text-amber-600 dark:text-amber-400 mt-0.5 truncate">
              {{ effectiveRop }} <span class="text-[10px] font-normal text-slate-400">{{ currentItem?.satuan }}</span>
            </div>
          </div>
          <div class="p-2 sm:p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
            <div class="text-[10px] text-slate-400 font-medium flex items-center justify-between">
              <span class="truncate">Kapasitas Maksimal</span>
              <span class="w-2 h-2 rounded-full bg-purple-500 shrink-0"></span>
            </div>
            <div class="text-xs sm:text-sm font-extrabold text-purple-600 dark:text-purple-400 mt-0.5 truncate">
              {{ effectiveMaxStock }} <span class="text-[10px] font-normal text-slate-400">{{ currentItem?.satuan }}</span>
            </div>
          </div>
          <div class="p-2 sm:p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
            <div class="text-[10px] text-slate-400 font-medium flex items-center justify-between">
              <span class="truncate">Pelanggaran Batas</span>
              <AlertTriangle v-if="breachCount > 0" class="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <CheckCircle2 v-else class="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            </div>
            <div class="text-xs sm:text-sm font-extrabold mt-0.5 truncate" :class="breachCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'">
              {{ breachCount }} <span class="text-[10px] font-normal text-slate-400">Kejadian</span>
            </div>
          </div>
        </div>

        <!-- Legend Ribbon -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-semibold pt-0.5">
          <!-- Legend Timeline Mode -->
          <div v-if="chartVisualizationMode === 'timeline'" class="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <div class="flex items-center space-x-1.5">
              <span class="w-3 h-1.5 rounded-full bg-emerald-500"></span>
              <span class="text-emerald-700 dark:text-emerald-400">Aman (> ROP)</span>
            </div>
            <div class="flex items-center space-x-1.5">
              <span class="w-3 h-1.5 rounded-full bg-amber-500"></span>
              <span class="text-amber-700 dark:text-amber-400">Waspada (≤ ROP)</span>
            </div>
            <div class="flex items-center space-x-1.5">
              <span class="w-3 h-1.5 rounded-full bg-rose-500"></span>
              <span class="text-rose-700 dark:text-rose-400">Kritis (≤ Safety Stock)</span>
            </div>
            <div v-if="effectiveMaxStock > 0" class="flex items-center space-x-1.5">
              <span class="w-3 h-1.5 rounded-full bg-purple-500"></span>
              <span class="text-purple-700 dark:text-purple-400">Overstock (> Maks)</span>
            </div>
            <div class="flex items-center space-x-1.5 text-slate-400">
              <span class="w-2.5 h-2.5 rounded-full border border-dashed border-rose-500"></span>
              <span>Titik Pelanggaran</span>
            </div>
          </div>

          <!-- Legend 3 Garis -->
          <div v-else class="flex items-center space-x-3 text-[11px]">
            <div class="flex items-center space-x-1.5">
              <span class="w-3 h-1 rounded-full bg-emerald-500"></span>
              <span class="text-emerald-700 dark:text-emerald-400">Masuk (IN)</span>
            </div>
            <div class="flex items-center space-x-1.5">
              <span class="w-3 h-1 rounded-full bg-rose-500"></span>
              <span class="text-rose-700 dark:text-rose-400">Keluar (OUT)</span>
            </div>
            <div class="flex items-center space-x-1.5">
              <span class="w-3 h-1 rounded-full bg-zinc-900 dark:bg-zinc-100"></span>
              <span class="text-zinc-900 dark:text-zinc-100 font-bold">Saldo Stok</span>
            </div>
          </div>

          <div class="text-[10px] text-slate-400 ml-auto">
            Arah waktu: Lama &rarr; Baru (Kiri ke Kanan)
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
              class="w-full h-60 sm:h-72 overflow-visible"
            >
              <defs>
                <!-- Gradients for subtle area fills -->
                <linearGradient id="stockAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#71717a" stop-opacity="0.12" />
                  <stop offset="100%" stop-color="#71717a" stop-opacity="0.0" />
                </linearGradient>
                <linearGradient id="timelineAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#10b981" stop-opacity="0.08" />
                  <stop offset="100%" stop-color="#10b981" stop-opacity="0.0" />
                </linearGradient>
              </defs>

              <!-- Threshold Zones Background Shading (Hanya saat mode Timeline) -->
              <g v-if="chartVisualizationMode === 'timeline'">
                <!-- Overstock Zone (> Max) -->
                <rect 
                  v-if="effectiveMaxStock > 0"
                  :x="paddingLeft" 
                  :y="getY(maxChartValue)" 
                  :width="chartWidth - paddingLeft - paddingRight" 
                  :height="Math.max(0, getY(effectiveMaxStock) - getY(maxChartValue))" 
                  fill="#a855f7" 
                  fill-opacity="0.05" 
                />
                <!-- Optimal / Aman Zone (ROP to Max) -->
                <rect 
                  :x="paddingLeft" 
                  :y="effectiveMaxStock > 0 ? getY(effectiveMaxStock) : getY(maxChartValue)" 
                  :width="chartWidth - paddingLeft - paddingRight" 
                  :height="Math.max(0, (effectiveRop > 0 ? getY(effectiveRop) : getY(0)) - (effectiveMaxStock > 0 ? getY(effectiveMaxStock) : getY(maxChartValue)))" 
                  fill="#10b981" 
                  fill-opacity="0.06" 
                />
                <!-- Waspada / Reorder Zone (Safety Stock to ROP) -->
                <rect 
                  v-if="effectiveRop > 0"
                  :x="paddingLeft" 
                  :y="getY(effectiveRop)" 
                  :width="chartWidth - paddingLeft - paddingRight" 
                  :height="Math.max(0, (effectiveSafetyStock > 0 ? getY(effectiveSafetyStock) : getY(0)) - getY(effectiveRop))" 
                  fill="#f59e0b" 
                  fill-opacity="0.08" 
                />
                <!-- Kritis / Bahaya Zone (0 to Safety Stock) -->
                <rect 
                  v-if="effectiveSafetyStock > 0"
                  :x="paddingLeft" 
                  :y="getY(effectiveSafetyStock)" 
                  :width="chartWidth - paddingLeft - paddingRight" 
                  :height="Math.max(0, getY(0) - getY(effectiveSafetyStock))" 
                  fill="#ef4444" 
                  fill-opacity="0.10" 
                />
              </g>

              <!-- Horizontal Grid Lines (Standard) -->
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

              <!-- Y-Axis Values (Left) -->
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

              <!-- ============================================== -->
              <!-- KONTEN MODE 1: TIMELINE AMBANG BATAS           -->
              <!-- ============================================== -->
              <g v-if="chartVisualizationMode === 'timeline'">
                <!-- Area Fill di bawah garis trajectory -->
                <path :d="stockAreaPath" fill="url(#timelineAreaGrad)" />

                <!-- Garis Batas Ambang (Threshold Boundary Guidelines) -->
                <!-- Max Guideline -->
                <g v-if="effectiveMaxStock > 0">
                  <line 
                    :x1="paddingLeft" 
                    :y1="getY(effectiveMaxStock)" 
                    :x2="chartWidth - paddingRight" 
                    :y2="getY(effectiveMaxStock)" 
                    stroke="#a855f7" 
                    stroke-dasharray="4 3" 
                    stroke-width="1.5" 
                    opacity="0.8"
                  />
                  <text 
                    :x="chartWidth - paddingRight + 6" 
                    :y="getY(effectiveMaxStock) + 3" 
                    class="fill-purple-600 dark:fill-purple-400 text-[10px] font-bold font-mono select-none"
                  >
                    Maks: {{ effectiveMaxStock }}
                  </text>
                </g>

                <!-- ROP Guideline -->
                <g v-if="effectiveRop > 0">
                  <line 
                    :x1="paddingLeft" 
                    :y1="getY(effectiveRop)" 
                    :x2="chartWidth - paddingRight" 
                    :y2="getY(effectiveRop)" 
                    stroke="#f59e0b" 
                    stroke-dasharray="4 3" 
                    stroke-width="1.5" 
                    opacity="0.85"
                  />
                  <text 
                    :x="chartWidth - paddingRight + 6" 
                    :y="getY(effectiveRop) + 3" 
                    class="fill-amber-600 dark:fill-amber-400 text-[10px] font-bold font-mono select-none"
                  >
                    ROP: {{ effectiveRop }}
                  </text>
                </g>

                <!-- Safety Stock Guideline -->
                <g v-if="effectiveSafetyStock > 0">
                  <line 
                    :x1="paddingLeft" 
                    :y1="getY(effectiveSafetyStock)" 
                    :x2="chartWidth - paddingRight" 
                    :y2="getY(effectiveSafetyStock)" 
                    stroke="#ef4444" 
                    stroke-dasharray="4 3" 
                    stroke-width="1.5" 
                    opacity="0.9"
                  />
                  <text 
                    :x="chartWidth - paddingRight + 6" 
                    :y="getY(effectiveSafetyStock) + 3" 
                    class="fill-rose-600 dark:fill-rose-400 text-[10px] font-bold font-mono select-none"
                  >
                    Safety: {{ effectiveSafetyStock }}
                  </text>
                </g>

                <!-- Baseline 0 Guideline -->
                <line 
                  :x1="paddingLeft" 
                  :y1="getY(0)" 
                  :x2="chartWidth - paddingRight" 
                  :y2="getY(0)" 
                  stroke="currentColor" 
                  class="text-slate-300 dark:text-slate-700" 
                  stroke-width="1"
                />
                <text 
                  :x="chartWidth - paddingRight + 6" 
                  :y="getY(0) + 3" 
                  class="fill-slate-400 dark:fill-slate-500 text-[10px] font-mono select-none"
                >
                  0 (Habis)
                </text>

                <!-- Dynamic Multi-Color Segments (Warna Garis Berubah Berdasarkan Kondisi Stok) -->
                <line 
                  v-for="(seg, sIdx) in timelineSegments" 
                  :key="'seg-' + sIdx"
                  :x1="seg.x1" 
                  :y1="seg.y1" 
                  :x2="seg.x2" 
                  :y2="seg.y2" 
                  :stroke="seg.color" 
                  stroke-width="3.5" 
                  stroke-linecap="round" 
                  stroke-linejoin="round"
                />
              </g>

              <!-- ============================================== -->
              <!-- KONTEN MODE 2: TREN 3 GARIS (IN, OUT, SALDO)   -->
              <!-- ============================================== -->
              <g v-else>
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

                <!-- Line 3: Stock Balance (Saldo Berjalan - Hitam / Putih Monokrom) -->
                <path 
                  :d="stockLinePath" 
                  fill="none" 
                  stroke="currentColor" 
                  class="text-zinc-950 dark:text-zinc-100"
                  stroke-width="3" 
                  stroke-linecap="round" 
                  stroke-linejoin="round"
                />
              </g>

              <!-- Background Hit-box untuk dismiss tooltip saat tap/klik di luar titik -->
              <rect :width="chartWidth" :height="chartHeight" fill="transparent" class="cursor-default" @click="dismissActivePoint" />

              <!-- ============================================== -->
              <!-- TITIK DATA, MARKER PELANGGARAN & HOVER HITBOX  -->
              <!-- ============================================== -->
              <g v-for="(p, idx) in chartDataPoints" :key="'p-' + idx">
                <!-- Mode 3 Garis: Dot Masuk & Keluar -->
                <template v-if="chartVisualizationMode === 'lines'">
                  <circle 
                    v-if="p.inQty > 0"
                    :cx="getX(idx)" 
                    :cy="getY(p.inQty)" 
                    r="3.5" 
                    fill="#10b981" 
                    class="stroke-white dark:stroke-zinc-900 stroke-2 pointer-events-none"
                  />
                  <circle 
                    v-if="p.outQty > 0"
                    :cx="getX(idx)" 
                    :cy="getY(p.outQty)" 
                    r="3.5" 
                    fill="#f43f5e" 
                    class="stroke-white dark:stroke-zinc-900 stroke-2 pointer-events-none"
                  />
                </template>

                <!-- Mode Timeline: Aura Ring Pelanggaran (Breach Marker Ring) -->
                <template v-if="chartVisualizationMode === 'timeline' && getStockStatus(p.balance).isBreach">
                  <circle 
                    :cx="getX(idx)" 
                    :cy="getY(p.balance)" 
                    :r="hoveredPoint?.idx === idx ? 9.5 : 8" 
                    fill="none" 
                    :stroke="getStockStatus(p.balance).color" 
                    stroke-width="1.5" 
                    stroke-dasharray="2 2"
                    opacity="0.85"
                    class="pointer-events-none"
                  />
                </template>

                <!-- Titik Saldo Stok (Visual Dot) -->
                <circle 
                  :cx="getX(idx)" 
                  :cy="getY(p.balance)" 
                  :r="chartVisualizationMode === 'timeline' ? (hoveredPoint?.idx === idx ? 6 : 4.5) : (hoveredPoint?.idx === idx ? 5.5 : 4)" 
                  :fill="chartVisualizationMode === 'timeline' ? getStockStatus(p.balance).color : 'currentColor'" 
                  class="stroke-white dark:stroke-zinc-950 stroke-2 pointer-events-none text-zinc-900 dark:text-zinc-100"
                />

                <!-- Hitbox Sentuh Luas (18px radius) untuk Kemudahan Tap di Layar Sentuh HP -->
                <circle 
                  :cx="getX(idx)" 
                  :cy="getY(p.balance)" 
                  r="18" 
                  fill="transparent" 
                  class="cursor-pointer"
                  @touchstart.passive="handleTouchStart"
                  @mouseenter="setHoveredPoint(p, idx)"
                  @mouseleave="clearHoveredPoint"
                  @click.stop="toggleHoveredPoint(p, idx)"
                />

                <!-- X Axis Date Labels (Tampilkan berkala agar rapi) -->
                <text 
                  v-if="showXLabel(idx)" 
                  :x="getX(idx)" 
                  :y="chartHeight - 4" 
                  text-anchor="middle" 
                  class="fill-zinc-400 text-[9px] font-mono select-none pointer-events-none"
                >
                  {{ formatShortDate(p.tanggal) }}
                </text>
              </g>
            </svg>

            <!-- Floating Hover Tooltip Cerdas (Edge-Clamped, Rock-Solid, No Glitch) -->
            <div 
              v-if="hoveredPoint"
              class="absolute z-30 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl text-xs mb-3 min-w-[210px] max-w-[260px] backdrop-blur-md bg-white/95 dark:bg-zinc-900/95"
              :class="isPinned ? 'pointer-events-auto ring-1 ring-zinc-950/20 dark:ring-white/20' : 'pointer-events-none'"
              :style="tooltipStyle"
            >
              <div class="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-1.5 mb-1.5">
                <span class="font-bold text-zinc-900 dark:text-zinc-100 font-mono flex items-center gap-1.5">
                  <span v-if="isPinned" class="text-[10px]" title="Titik Terkunci">📌</span>
                  {{ hoveredPoint.tanggal }}
                </span>
                <div class="flex items-center gap-1.5">
                  <span 
                    class="text-[9px] px-2 py-0.5 rounded-full font-bold border"
                    :class="getStockStatus(hoveredPoint.balance).badgeClass"
                  >
                    {{ getStockStatus(hoveredPoint.balance).label }}
                  </span>
                  <button 
                    v-if="isPinned"
                    type="button"
                    @click.stop="dismissActivePoint"
                    class="p-0.5 -mr-1 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 rounded cursor-pointer leading-none text-xs"
                    title="Tutup Tooltip"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div class="space-y-1 text-[11px]">
                <div class="flex items-center justify-between">
                  <span class="text-zinc-500">Saldo Stok:</span>
                  <span class="font-extrabold text-sm" :style="{ color: getStockStatus(hoveredPoint.balance).color }">
                    {{ hoveredPoint.balance }} {{ currentItem?.satuan }}
                  </span>
                </div>
                
                <!-- Indikator Jarak Ambang Batas -->
                <div v-if="effectiveSafetyStock > 0 && hoveredPoint.balance <= effectiveSafetyStock" class="text-rose-600 dark:text-rose-400 text-[10px] font-semibold bg-rose-50 dark:bg-rose-950/40 p-1 rounded border border-rose-200 dark:border-rose-900">
                  ⚠️ Defisit Safety Stock: {{ effectiveSafetyStock - hoveredPoint.balance }} {{ currentItem?.satuan }}
                </div>
                <div v-else-if="effectiveRop > 0 && hoveredPoint.balance <= effectiveRop" class="text-amber-600 dark:text-amber-400 text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/40 p-1 rounded border border-amber-200 dark:border-amber-900">
                  ⚠️ Di Bawah ROP: Selisih -{{ effectiveRop - hoveredPoint.balance }} {{ currentItem?.satuan }}
                </div>
                <div v-else-if="effectiveMaxStock > 0 && hoveredPoint.balance > effectiveMaxStock" class="text-purple-600 dark:text-purple-400 text-[10px] font-semibold bg-purple-50 dark:bg-purple-950/40 p-1 rounded border border-purple-200 dark:border-purple-900">
                  ℹ️ Melampaui Maksimum: +{{ hoveredPoint.balance - effectiveMaxStock }} {{ currentItem?.satuan }}
                </div>
                <div v-else-if="effectiveSafetyStock > 0" class="text-emerald-600 dark:text-emerald-400 text-[10px]">
                  ✅ Di Atas Safety Stock: +{{ hoveredPoint.balance - effectiveSafetyStock }} {{ currentItem?.satuan }}
                </div>

                <!-- Mutasi Masuk/Keluar & No Dokumen -->
                <div class="pt-1 border-t border-zinc-100 dark:border-zinc-800 text-[10px] text-zinc-500 space-y-0.5">
                  <div v-if="hoveredPoint.inQty > 0" class="text-emerald-600 dark:text-emerald-400 font-semibold">
                    Masuk (IN): +{{ hoveredPoint.inQty }}
                  </div>
                  <div v-if="hoveredPoint.outQty > 0" class="text-rose-600 dark:text-rose-400 font-semibold">
                    Keluar (OUT): -{{ hoveredPoint.outQty }}
                  </div>
                  <div class="text-zinc-400 truncate">Doc: {{ hoveredPoint.noDocument || '-' }}</div>
                </div>
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
                <span v-else-if="row.inQty > 0" class="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">+{{ row.inQty }} {{ currentItem?.satuan }}</span>
                <span v-else-if="row.outQty > 0" class="text-xs font-bold text-rose-600 dark:text-rose-400 font-mono">-{{ row.outQty }} {{ currentItem?.satuan }}</span>
                <span v-else class="text-xs text-zinc-400">-</span>
                <span v-if="row.lineKeterangan || row.keterangan" class="text-[10px] text-zinc-400 truncate max-w-[120px] italic hidden xs:inline">
                  ({{ row.lineKeterangan || row.keterangan }})
                </span>
              </div>

              <div class="flex items-center gap-1 shrink-0">
                <span class="text-[10px] text-zinc-400">Saldo:</span>
                <span class="font-black text-xs text-zinc-950 dark:text-white font-mono">
                  {{ row.balance }} <span class="text-[9.5px] font-normal text-zinc-400">{{ currentItem?.satuan }}</span>
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
                  {{ row.balance }} <span class="text-[10px] text-slate-400 font-normal">{{ currentItem?.satuan }}</span>
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

    <!-- Fallback jika mode detail aktif tapi data item tidak ditemukan -->
    <div v-else-if="currentMode === 'detail' && !currentItem" class="glass-card p-8 text-center space-y-3">
      <div class="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
        <AlertCircle class="w-6 h-6" />
      </div>
      <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100">Item Tidak Ditemukan</h3>
      <p class="text-xs text-slate-400">Data master barang ini mungkin belum dipilih atau telah dihapus.</p>
      <button @click="resetToList()" class="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs">
        &larr; Kembali ke Daftar Item
      </button>
    </div>

    <!-- ============================================================== -->
    <!-- MODAL ASISTEN KALKULATOR PPIC CERDAS (ITEM LEDGER)             -->
    <!-- ============================================================== -->
    <div 
      v-if="isPPICModalOpen && ppicCalcData" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-3 sm:p-4 transition-all"
    >
      <div class="bg-white dark:bg-zinc-950 w-full max-w-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[92vh]">
        <!-- Top Border Accent Line -->
        <div class="h-1 w-full bg-zinc-950 dark:bg-white"></div>

        <!-- Modal Header Monokrom Elegan -->
        <div class="px-5 sm:px-6 py-4 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-9 h-9 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center shadow-xs">
              <Calculator class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-sm sm:text-base font-bold text-zinc-950 dark:text-white flex items-center gap-1.5">
                <span>Asisten Kalkulator PPIC Cerdas</span>
                <span class="text-[10px] px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold border border-zinc-300 dark:border-zinc-700">Audit Min-Max</span>
              </h3>
              <p class="text-[11px] text-zinc-500 dark:text-zinc-400">Prediksi matematis batas stok berdasarkan mutasi keluar 90 hari.</p>
            </div>
          </div>
          <button @click="isPPICModalOpen = false" class="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
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
              <div class="p-3 bg-zinc-100 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700 text-center">
                <span class="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 block">Safety Stock</span>
                <strong class="text-base font-black text-zinc-900 dark:text-white">{{ ppicCalcData.safetyStock }}</strong>
                <span class="text-[9px] text-zinc-400 block">Pengaman</span>
              </div>

              <div class="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-center">
                <span class="text-[10px] font-bold text-amber-700 dark:text-amber-400 block">Min. Stok (ROP)</span>
                <strong class="text-base font-black text-amber-700 dark:text-amber-400">{{ ppicCalcData.recommendedRop }}</strong>
                <span class="text-[9px] text-amber-600/80 dark:text-amber-400/80 block">Titik Pesan</span>
              </div>

              <div class="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20 text-center">
                <span class="text-[10px] font-bold text-purple-700 dark:text-purple-400 block">Maks. Stok</span>
                <strong class="text-base font-black text-purple-700 dark:text-purple-400">{{ ppicCalcData.recommendedMaxStock }}</strong>
                <span class="text-[9px] text-purple-600/80 dark:text-purple-400/80 block">Kapasitas Aman</span>
              </div>
            </div>
          </div>

          <!-- Ringkasan Rekomendasi Tindakan -->
          <div class="p-3 bg-zinc-100/70 dark:bg-zinc-800/80 rounded-xl text-zinc-700 dark:text-zinc-300 text-[11px] space-y-1 border border-zinc-200/60 dark:border-zinc-700">
            <div class="flex items-center justify-between">
              <span>Saran Order Pengadaan Saat Ini:</span>
              <strong :class="ppicCalcData.suggestedOrderQty > 0 ? 'text-amber-700 dark:text-amber-400 font-bold' : 'text-emerald-700 dark:text-emerald-400 font-bold'">
                {{ ppicCalcData.suggestedOrderQty > 0 ? `+${ppicCalcData.suggestedOrderQty} ${ppicCalcData.satuan} (Waktunya Reorder)` : 'Stok Aman' }}
              </strong>
            </div>
          </div>
        </div>

        <!-- Footer Modal -->
        <div class="px-5 sm:px-6 py-3.5 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
          <button 
            type="button" 
            @click="isPPICModalOpen = false" 
            class="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>
          <button 
            type="button" 
            @click="applyPRICToItem" 
            class="px-4 py-2 text-xs font-bold text-white dark:text-zinc-950 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
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
  Download,
  ShieldAlert,
  AlertTriangle,
  Layers,
  Activity,
  AlertCircle
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

// State Mode Visualisasi Grafik: 'timeline' (Safety Envelope & Timeline Garis Kondisi Stok) | 'lines' (Tren 3 Garis: Masuk, Keluar, Saldo)
const chartVisualizationMode = ref('timeline');
const itemPPICMetrics = ref(null);

// State SVG Line Chart (Optimized for Mobile & Desktop)
const chartWidth = 860;
const chartHeight = 250;
const paddingLeft = 45;
const paddingRight = 105;
const paddingTop = 25;
const paddingBottom = 30;
const hoveredPoint = ref(null);
const isPinned = ref(false);

let lastTouchTimestamp = 0;
let dismissCooldownUntil = 0;

function handleTouchStart() {
  lastTouchTimestamp = Date.now();
}

function setHoveredPoint(p, idx) {
  // Abaikan event mouse sintetis akibat touch tap di mobile atau jika sedang dalam cooldown dismiss
  if (Date.now() - lastTouchTimestamp < 600) return;
  if (Date.now() < dismissCooldownUntil) return;
  if (isPinned.value) return;
  hoveredPoint.value = { ...p, x: getX(idx), y: getY(p.balance), idx };
}

function clearHoveredPoint() {
  if (Date.now() - lastTouchTimestamp < 600) return;
  if (isPinned.value) return;
  hoveredPoint.value = null;
}

function toggleHoveredPoint(p, idx) {
  const isCurrent = hoveredPoint.value?.idx === idx;
  if (isPinned.value && isCurrent) {
    // Unpin dan tutup tooltip
    isPinned.value = false;
    hoveredPoint.value = null;
    dismissCooldownUntil = Date.now() + 450; // Cooldown 450ms agar mouse tidak langsung membuka kembali secara glitchy
  } else {
    // Kunci titik yang diklik
    isPinned.value = true;
    hoveredPoint.value = { ...p, x: getX(idx), y: getY(p.balance), idx };
  }
}

function dismissActivePoint() {
  isPinned.value = false;
  hoveredPoint.value = null;
  dismissCooldownUntil = Date.now() + 450;
}

// Penentuan Posisi Tooltip Cerdas (Edge Clamping agar tidak terpotong di layar HP)
const tooltipStyle = computed(() => {
  if (!hoveredPoint.value) return {};
  const pctX = (hoveredPoint.value.x / chartWidth) * 100;
  const pctY = (hoveredPoint.value.y / chartHeight) * 100;

  let transform = 'translate(-50%, -100%)';
  if (pctX < 22) {
    transform = 'translate(-8%, -100%)';
  } else if (pctX > 78) {
    transform = 'translate(-92%, -100%)';
  }

  // Jika terlalu dekat dengan atap grafik, balikkan tooltip ke bawah
  if (pctY < 32) {
    transform = transform.replace('-100%', '20%');
  }

  return {
    left: `${pctX}%`,
    top: `${pctY}%`,
    transform
  };
});

const currentItem = computed(() => {
  return props.itemsWithStock.find(i => i.uniqCode === selectedUniqCode.value) || null;
});

// Ambang Batas Stok Efektif (Thresholds)
const effectiveRop = computed(() => {
  if (currentItem.value && Number(currentItem.value.minStock) > 0) {
    return Number(currentItem.value.minStock);
  }
  if (itemPPICMetrics.value?.recommendedRop > 0) {
    return Number(itemPPICMetrics.value.recommendedRop);
  }
  return 0;
});

const effectiveSafetyStock = computed(() => {
  if (itemPPICMetrics.value?.safetyStock > 0) {
    return Number(itemPPICMetrics.value.safetyStock);
  }
  if (effectiveRop.value > 0) {
    return Math.max(1, Math.round(effectiveRop.value * 0.4));
  }
  return 0;
});

const effectiveMaxStock = computed(() => {
  if (currentItem.value && Number(currentItem.value.maxStock) > 0) {
    return Number(currentItem.value.maxStock);
  }
  if (itemPPICMetrics.value?.recommendedMaxStock > 0) {
    return Number(itemPPICMetrics.value.recommendedMaxStock);
  }
  if (effectiveRop.value > 0) {
    return Math.round(effectiveRop.value * 2.5);
  }
  return 0;
});

// Klasifikasi Kondisi & Status Ambang Batas per Saldo (Soft & Muted Colors)
function getStockStatus(balance) {
  const val = Number(balance) || 0;
  const ss = effectiveSafetyStock.value;
  const rop = effectiveRop.value;
  const max = effectiveMaxStock.value;

  if (val <= 0) {
    return {
      status: 'STOCKOUT',
      label: 'Habis (Stockout)',
      color: '#ef4444',
      badgeClass: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20',
      isBreach: true,
      breachType: 'SAFETY'
    };
  }
  if (ss > 0 && val <= ss) {
    return {
      status: 'CRITICAL',
      label: 'Di Bawah Safety Stock',
      color: '#ef4444',
      badgeClass: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20',
      isBreach: true,
      breachType: 'SAFETY'
    };
  }
  if (rop > 0 && val <= rop) {
    return {
      status: 'WARNING',
      label: 'Di Bawah ROP (Waspada)',
      color: '#f59e0b',
      badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20',
      isBreach: true,
      breachType: 'ROP'
    };
  }
  if (max > 0 && val > max) {
    return {
      status: 'OVERSTOCK',
      label: 'Overstock (> Maksimum)',
      color: '#8b5cf6',
      badgeClass: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20',
      isBreach: false,
      breachType: 'OVER'
    };
  }
  return {
    status: 'OPTIMAL',
    label: 'Aman / Optimal',
    color: '#10b981',
    badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20',
    isBreach: false,
    breachType: null
  };
}

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
    : (Number(currentItem.value?.currentStock) || 0);

  return { totalIn, totalOut, currentBalance };
});

const currentItemStatus = computed(() => {
  return getStockStatus(ledgerStats.value.currentBalance);
});

const breachCount = computed(() => {
  return chartDataPoints.value.filter(p => getStockStatus(p.balance).isBreach).length;
});

const paginatedLedger = computed(() => {
  const start = (ledgerCurrentPage.value - 1) * ledgerPageSize.value;
  return ledgerRows.value.slice(start, start + ledgerPageSize.value);
});

// Data Points untuk Grafik SVG Line Chart
const chartDataPoints = computed(() => {
  return ledgerRows.value;
});

// Perhitungan Max Chart Value yang Aman dari Call Stack Overflow (O(1) memory)
const maxChartValue = computed(() => {
  const points = chartDataPoints.value;
  let maxVal = 10;
  if (points.length > 0) {
    maxVal = points.reduce((acc, p) => {
      return Math.max(acc, p.balance || 0, p.inQty || 0, p.outQty || 0);
    }, 10);
  }
  if (effectiveMaxStock.value > 0) {
    maxVal = Math.max(maxVal, effectiveMaxStock.value);
  }
  if (effectiveRop.value > 0) {
    maxVal = Math.max(maxVal, effectiveRop.value * 1.2);
  }
  return Math.max(10, Math.ceil(maxVal * 1.15));
});

const yAxisTicks = computed(() => {
  const max = maxChartValue.value;
  return [0, Math.round(max * 0.33), Math.round(max * 0.66), max];
});

function getX(index) {
  const count = chartDataPoints.value.length;
  const availWidth = chartWidth - paddingLeft - paddingRight;
  if (count <= 1) return paddingLeft + availWidth / 2;
  return paddingLeft + (index / (count - 1)) * availWidth;
}

function getY(val) {
  const max = maxChartValue.value || 10;
  const availHeight = chartHeight - paddingTop - paddingBottom;
  const clamped = Math.max(0, Number(val) || 0);
  return chartHeight - paddingBottom - (clamped / max) * availHeight;
}

// Dynamic Multi-Color Segments untuk Timeline Garis Ambang Batas
const timelineSegments = computed(() => {
  const pts = chartDataPoints.value;
  if (pts.length < 2) return [];
  const segments = [];
  for (let i = 1; i < pts.length; i++) {
    const pPrev = pts[i - 1];
    const pCurr = pts[i];
    const status = getStockStatus(pCurr.balance);
    segments.push({
      x1: getX(i - 1),
      y1: getY(pPrev.balance),
      x2: getX(i),
      y2: getY(pCurr.balance),
      color: status.color,
      status: status.status,
      prevBalance: pPrev.balance,
      currBalance: pCurr.balance
    });
  }
  return segments;
});

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

// Flag dan Timer Debouncing untuk Mencegah Redundant Queries
let isUpdatingDates = false;
let loadLedgerTimer = null;

function debouncedLoadLedger() {
  if (loadLedgerTimer) clearTimeout(loadLedgerTimer);
  loadLedgerTimer = setTimeout(() => {
    loadLedger();
  }, 40);
}

async function loadLedger() {
  if (!selectedUniqCode.value) {
    ledgerRows.value = [];
    itemPPICMetrics.value = null;
    return;
  }
  const uniq = selectedUniqCode.value;
  const start = startDate.value || null;
  const end = endDate.value || null;
  const lt = Number(currentItem.value?.leadTime) || 7;

  const [history, ppic] = await Promise.all([
    getItemLedgerHistory(uniq, start, end),
    calculateItemPPICMetrics(uniq, lt, 14)
  ]);

  // Hindari race-condition jika pengguna beralih barang lain saat request berjalan
  if (selectedUniqCode.value === uniq) {
    ledgerRows.value = history;
    itemPPICMetrics.value = ppic;
    ledgerCurrentPage.value = 1;
  }
}

// Preset Rentang Waktu (7 Hari, 30 Hari, 90 Hari / 3 Bulan, Semua)
function applyDatePreset(days) {
  activePreset.value = days;
  isUpdatingDates = true;
  if (days === 0) {
    startDate.value = '';
    endDate.value = '';
  } else {
    const end = new Date();
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
    startDate.value = start.toISOString().split('T')[0];
    endDate.value = end.toISOString().split('T')[0];
  }
  isUpdatingDates = false;
  debouncedLoadLedger();
}

watch([selectedUniqCode, startDate, endDate], () => {
  if (isUpdatingDates) return;
  if (currentMode.value === 'detail') {
    debouncedLoadLedger();
  }
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
    'Total Masuk (IN)': item.inQty ?? item.totalIn ?? 0,
    'Total Keluar (OUT)': item.outQty ?? item.totalOut ?? 0,
    'Stok Akhir': item.currentStock ?? 0,
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
