<template>
  <div class="space-y-4 pb-24 md:pb-6" @keydown="handleGlobalKeydown">
    <!-- ========================================== -->
    <!-- VIEW MODE 1: LIST DOKUMEN TRANSFER ORDER   -->
    <!-- ========================================== -->
    <div v-if="currentView === 'list'" class="space-y-4">
      <!-- Header List Dokumen (Minimalis) -->
      <div class="glass-card p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Daftar Dokumen Transfer Order</span>
            <span class="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700">
              {{ transactions.length }} Dokumen
            </span>
          </h1>
          <p class="text-xs text-zinc-400">Kelola seluruh arsip Transfer Order (Masuk & Keluar).</p>
        </div>

        <div class="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
          <button 
            @click="isExportModalOpen = true"
            class="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-xl font-bold text-xs border border-zinc-300 dark:border-zinc-700 shadow-xs transition-all cursor-pointer"
            title="Ekspor transaksi Transfer Order ke file Excel (.xlsx)"
          >
            <Download class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Ekspor Excel</span>
          </button>
          <button 
            @click="openCreatePage('IN')"
            class="flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-2 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 rounded-xl font-bold text-xs shadow-sm border border-zinc-950 dark:border-white transition-all cursor-pointer"
          >
            <ArrowDownLeft class="w-4 h-4" />
            <span class="truncate">+ Masuk (IN)</span>
          </button>
          <button 
            @click="openCreatePage('OUT')"
            class="flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-2 bg-white hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl font-bold text-xs border border-zinc-300 dark:border-zinc-700 shadow-sm transition-all cursor-pointer"
          >
            <ArrowUpRight class="w-4 h-4 text-rose-500" />
            <span class="truncate">+ Keluar (OUT)</span>
          </button>
        </div>
      </div>

      <!-- Toolbar: Search, Filters -->
      <div class="glass-card p-3 space-y-2.5">
        <div class="grid grid-cols-1 sm:grid-cols-12 gap-2">
          <div class="sm:col-span-5 relative">
            <Search class="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Cari kode TO, no dokumen, keterangan..."
              class="w-full pl-9 pr-3 py-1.5 glass-input rounded-xl text-xs"
            />
          </div>

          <div class="sm:col-span-4 flex items-center bg-zinc-100 dark:bg-zinc-800/80 p-0.5 rounded-xl text-xs font-semibold">
            <button 
              @click="selectedTypeFilter = 'ALL'"
              :class="['flex-1 py-1 rounded-lg transition-all text-center text-xs', selectedTypeFilter === 'ALL' ? 'bg-white dark:bg-zinc-700 text-zinc-950 dark:text-white shadow-sm' : 'text-zinc-500 dark:text-zinc-400']"
            >
              Semua
            </button>
            <button 
              @click="selectedTypeFilter = 'IN'"
              :class="['flex-1 py-1 rounded-lg transition-all text-center text-xs', selectedTypeFilter === 'IN' ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-sm font-bold' : 'text-zinc-500 dark:text-zinc-400']"
            >
              Masuk (IN)
            </button>
            <button 
              @click="selectedTypeFilter = 'OUT'"
              :class="['flex-1 py-1 rounded-lg transition-all text-center text-xs', selectedTypeFilter === 'OUT' ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm font-bold' : 'text-zinc-500 dark:text-zinc-400']"
            >
              Keluar (OUT)
            </button>
          </div>

          <div class="sm:col-span-3">
            <input 
              v-model="dateFilter"
              type="date"
              class="w-full px-2.5 py-1.5 glass-input rounded-xl text-xs"
              title="Filter Tanggal"
            />
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

      <!-- Empty State -->
      <div v-else-if="filteredTransactions.length === 0" class="glass-card p-10 text-center">
        <div class="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-xl flex items-center justify-center mx-auto mb-2.5">
          <FileText class="w-5 h-5" />
        </div>
        <h3 class="text-xs font-bold text-slate-700 dark:text-slate-200">Tidak ada dokumen Transfer Order</h3>
        <p class="text-[11px] text-slate-400 mt-0.5">Belum ada dokumen yang sesuai filter.</p>
      </div>

      <!-- Mobile Rows: Dense & Wide Layout -->
      <div v-else class="space-y-2 md:hidden">
        <div 
          v-for="doc in paginatedTransactions" 
          :key="doc.id"
          class="glass-card p-2.5 space-y-1.5 hover:border-emerald-500/40 transition-all border-l-2"
          :class="[
            doc.type === 'IN' ? 'border-l-emerald-500' : 'border-l-rose-500'
          ]"
        >
          <!-- Baris 1: Tipe Badge + Trx Code & No Doc + Total Qty -->
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-1.5 min-w-0">
              <span 
                :class="[
                  'px-1.5 py-0.5 rounded text-[9.5px] font-bold uppercase tracking-wider shrink-0',
                  doc.type === 'IN' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                ]"
              >
                {{ doc.type === 'IN' ? 'Masuk' : 'Keluar' }}
              </span>
              <span 
                v-if="doc.status === 'DRAFT'"
                class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 uppercase shrink-0"
              >
                Draft
              </span>
              <span class="font-mono text-xs font-bold text-slate-900 dark:text-white shrink-0">
                {{ doc.trxCode }}
              </span>
              <span v-if="doc.noDocument" class="text-slate-400 text-[10.5px] font-mono truncate hidden xs:inline">
                ({{ doc.noDocument }})
              </span>
            </div>

            <div class="flex items-baseline gap-1 shrink-0">
              <span class="text-xs font-extrabold text-slate-900 dark:text-white font-mono">{{ doc.totalQty || 0 }}</span>
              <span class="text-[10px] text-slate-400">Unit ({{ doc.items?.length || 0 }} item)</span>
            </div>
          </div>

          <!-- Baris 2: Strip Info Tanggal & Keterangan Horizontal -->
          <div class="flex items-center justify-between text-[11px] bg-slate-50/70 dark:bg-slate-800/40 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-800 gap-2">
            <div class="flex items-center gap-1.5 text-[10.5px] text-slate-500 dark:text-slate-400 shrink-0">
              <span class="font-mono">{{ doc.tanggal }}</span>
            </div>
            <div class="min-w-0 truncate text-[10.5px] text-slate-600 dark:text-slate-400 italic text-right">
              {{ doc.keterangan || (doc.noDocument ? 'Doc: ' + doc.noDocument : 'Tanpa keterangan') }}
            </div>
          </div>

          <!-- Baris 3: Aksi Kompak Horizontal -->
          <div class="flex items-center justify-between pt-0.5 text-xs">
            <button 
              @click="openDetailModal(doc)"
              class="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 text-[11px] hover:underline cursor-pointer"
            >
              <Eye class="w-3.5 h-3.5" />
              <span>Detail ({{ doc.items?.length || 0 }})</span>
            </button>
            <div class="flex items-center gap-1.5">
              <!-- HANYA DRAFT YANG DAPAT DI-EDIT & DIHAPUS -->
              <template v-if="isDocEditable(doc)">
                <button 
                  @click="openEditPage(doc)"
                  class="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 text-amber-700 dark:text-amber-300 rounded text-[10.5px] font-semibold flex items-center gap-1 cursor-pointer"
                  title="Edit Draf Dokumen"
                >
                  <Pencil class="w-3 h-3 text-amber-600" />
                  <span>Edit</span>
                </button>
                <button 
                  @click="deleteDoc(doc)"
                  class="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors cursor-pointer"
                  title="Hapus Draf Dokumen"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </template>

              <!-- JIKA BUKAN DRAFT: DOKUMEN RESMI TERKUNCI TOTAL -->
              <template v-else>
                <span 
                  class="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded text-[10px] font-medium flex items-center gap-1 border border-zinc-200 dark:border-zinc-700 select-none cursor-not-allowed"
                  title="Dokumen Resmi Terkunci"
                >
                  <Lock class="w-2.5 h-2.5 text-zinc-400" />
                  <span>Terkunci</span>
                </span>
              </template>
            </div>
          </div>
        </div>

        <Pagination 
          :current-page="currentPage"
          :page-size="pageSize"
          :total-items="filteredTransactions.length"
          @update:current-page="currentPage = $event"
          @update:page-size="pageSize = $event"
        />
      </div>

      <!-- Desktop Table -->
      <div v-if="!isLoading && filteredTransactions.length > 0" class="hidden md:block glass-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-100/60 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase select-none">
                <th @click="toggleSort('type')" class="py-2.5 px-3.5 cursor-pointer hover:text-emerald-600">
                  <div class="flex items-center gap-1">
                    <span>Tipe</span>
                    <component :is="getSortIcon('type')" class="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th @click="toggleSort('trxCode')" class="py-2.5 px-3.5 cursor-pointer hover:text-emerald-600">
                  <div class="flex items-center gap-1">
                    <span>Kode TO</span>
                    <component :is="getSortIcon('trxCode')" class="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th @click="toggleSort('tanggal')" class="py-2.5 px-3.5 cursor-pointer hover:text-emerald-600">
                  <div class="flex items-center gap-1">
                    <span>Tanggal</span>
                    <component :is="getSortIcon('tanggal')" class="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th @click="toggleSort('noDocument')" class="py-2.5 px-3.5 cursor-pointer hover:text-emerald-600">
                  <div class="flex items-center gap-1">
                    <span>No. Dokumen</span>
                    <component :is="getSortIcon('noDocument')" class="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th @click="toggleSort('totalQty')" class="py-2.5 px-3.5 text-right cursor-pointer hover:text-emerald-600">
                  <div class="flex items-center justify-end gap-1">
                    <span>Total Qty</span>
                    <component :is="getSortIcon('totalQty')" class="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th class="py-2.5 px-3.5">Keterangan</th>
                <th class="py-2.5 px-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
              <tr 
                v-for="doc in paginatedTransactions" 
                :key="doc.id"
                class="hover:bg-emerald-500/5 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td class="py-2.5 px-3.5">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span 
                      :class="[
                        'px-2 py-0.5 rounded text-[10px] font-bold tracking-wider inline-flex items-center gap-1 uppercase',
                        doc.type === 'IN' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                      ]"
                    >
                      <component :is="doc.type === 'IN' ? ArrowDownLeft : ArrowUpRight" class="w-3 h-3" />
                      {{ doc.type === 'IN' ? 'TO Masuk' : 'TO Keluar' }}
                    </span>
                    <span 
                      v-if="doc.status === 'DRAFT'"
                      class="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 uppercase"
                    >
                      Draft
                    </span>
                  </div>
                </td>
                <td class="py-2.5 px-3.5 font-mono font-bold text-slate-900 dark:text-slate-100">{{ doc.trxCode }}</td>
                <td class="py-2.5 px-3.5 font-medium text-slate-600 dark:text-slate-400">{{ doc.tanggal }}</td>
                <td class="py-2.5 px-3.5 font-mono font-semibold text-slate-800 dark:text-slate-200">{{ doc.noDocument || '-' }}</td>
                <td class="py-2.5 px-3.5 text-right">
                  <span class="font-extrabold text-xs text-slate-900 dark:text-white">{{ doc.totalQty }}</span>
                  <span class="text-[10px] text-slate-400 ml-1">({{ doc.items?.length || 0 }} item)</span>
                </td>
                <td class="py-2.5 px-3.5 text-slate-500 dark:text-slate-400 max-w-[200px] truncate">{{ doc.keterangan || '-' }}</td>
                <td class="py-2.5 px-3.5 text-center" @click.stop>
                  <div class="flex items-center justify-center gap-1.5">
                    <button 
                      @click="openDetailModal(doc)"
                      class="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      title="Lihat Detail Item"
                    >
                      <Eye class="w-3 h-3" />
                      <span>Buka</span>
                    </button>

                    <!-- Tombol Cepat Cetak PDF & Excel -->
                    <button 
                      @click="printTransferOrderDocument(doc)"
                      class="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
                      title="Cetak Dokumen / Simpan PDF"
                    >
                      <Printer class="w-3.5 h-3.5" />
                    </button>
                    <button 
                      @click="exportTransferOrderExcel(doc)"
                      class="p-1 rounded-lg text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer transition-colors"
                      title="Ekspor Dokumen ke Excel (.xlsx)"
                    >
                      <FileSpreadsheet class="w-3.5 h-3.5" />
                    </button>

                    <!-- HANYA DRAFT YANG DAPAT DI-EDIT & DIHAPUS -->
                    <template v-if="isDocEditable(doc)">
                      <button 
                        @click="openEditPage(doc)"
                        class="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 text-amber-700 dark:text-amber-300 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        title="Edit Draf Dokumen"
                      >
                        <Pencil class="w-3 h-3 text-amber-600" />
                        <span>Edit</span>
                      </button>
                      <button 
                        @click="deleteDoc(doc)"
                        class="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                        title="Hapus Draf Dokumen"
                      >
                        <Trash2 class="w-3.5 h-3.5" />
                      </button>
                    </template>

                    <!-- DOKUMEN RESMI TERKUNCI TOTAL (LOCKED) -->
                    <template v-else>
                      <span 
                        class="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded text-[11px] font-medium flex items-center gap-1 border border-zinc-200 dark:border-zinc-700 select-none cursor-not-allowed"
                        title="Dokumen resmi sudah diposting dan terkunci. Tidak dapat diedit atau dihapus demi integritas kartu stok."
                      >
                        <Lock class="w-3 h-3 text-zinc-400" />
                        <span>Terkunci</span>
                      </span>
                    </template>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="p-2.5 border-t border-slate-200/60 dark:border-slate-800">
          <Pagination 
            :current-page="currentPage"
            :page-size="pageSize"
            :total-items="filteredTransactions.length"
            @update:current-page="currentPage = $event"
            @update:page-size="pageSize = $event"
          />
        </div>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- VIEW MODE 2: FORM INPUT DOKUMEN DENGAN STICKY HEADER STACK     -->
    <!-- ============================================================== -->
    <div v-else-if="currentView === 'create'" class="space-y-3.5">
      <!-- HEADER DOKUMEN: RESPONSIVE STATIC DI MOBILE (TIDAK MEMBLOKIR ROW DATA), STICKY HANYA DI DESKTOP -->
      <div class="static sm:sticky sm:top-11 z-20 glass-panel border border-slate-200/80 dark:border-slate-800 p-3 sm:p-3.5 rounded-2xl shadow-sm space-y-2.5">
        <!-- Top Bar: Navigation, Badges, Quick Buttons -->
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center space-x-2">
            <button 
              @click="resetToList()"
              class="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Kembali ke Daftar Transfer Order"
            >
              <ArrowLeft class="w-4 h-4" />
            </button>
            <div class="flex items-center space-x-1.5">
              <span 
                :class="[
                  'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider',
                  formHeader.type === 'IN' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                ]"
              >
                {{ isEditingDoc ? 'Edit TO' : 'Baru' }}: {{ formHeader.type === 'IN' ? 'TO Masuk' : 'TO Keluar' }}
              </span>
              <span class="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {{ formHeader.trxCode }}
              </span>

              <!-- Indikator Auto-Save IndexedDB -->
              <span v-if="lastDraftSavedTime" class="hidden sm:inline-flex items-center gap-1.5 text-[10.5px] text-zinc-500 dark:text-zinc-400 font-mono px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700" title="Draf otomatis disimpan di IndexedDB browser Anda">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500" :class="isAutosaving ? 'animate-ping' : ''"></span>
                <span>Draf otomatis {{ lastDraftSavedTime }}</span>
              </span>
            </div>
          </div>

          <!-- Tombol Tambah Item & Simpan Dokumen Berada di Header -->
          <div class="flex items-center gap-2">
            <button 
              @click="focusAddItemInput"
              class="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl text-xs font-semibold shadow transition-all cursor-pointer"
            >
              <Plus class="w-3.5 h-3.5 text-emerald-400" />
              <span>Tambah Item</span>
            </button>

            <!-- Opsi 1: Simpan sebagai Draf (Bisa diedit/dihapus) -->
            <button 
              @click="saveEntireDocument('DRAFT')"
              :disabled="draftItems.length === 0"
              class="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Simpan sebagai Draf (dapat diedit atau dihapus kembali)"
            >
              <Save class="w-3.5 h-3.5" />
              <span>Simpan Draf</span>
            </button>

            <!-- Opsi 2: Posting Dokumen Sah (Dikunci Total) -->
            <button 
              @click="saveEntireDocument('POSTED')"
              :disabled="draftItems.length === 0"
              :class="[
                'flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer',
                formHeader.type === 'IN' 
                  ? 'bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 border border-zinc-950 dark:border-white' 
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm'
              ]"
              title="Posting resmi & KUNCI TOTAL dokumen (Tekan Ctrl+Enter)"
            >
              <Lock class="w-3.5 h-3.5 text-amber-400 dark:text-amber-300" />
              <span>Posting & Kunci TO ({{ draftItems.length }})</span>
              <kbd class="hidden sm:inline text-[9px] font-mono px-1 py-0.2 bg-black/20 rounded">Ctrl+Enter</kbd>
            </button>
          </div>
        </div>

        <!-- BANNER PULIHKAN DRAF OTOMATIS (INDEXEDDB) -->
        <div 
          v-if="hasPendingDraft && pendingDraftData"
          class="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/80 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 text-xs"
        >
          <div class="flex items-start gap-2">
            <Sparkles class="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong class="text-amber-900 dark:text-amber-200 block font-bold">
                Ditemukan Draf Belum Tersimpan di IndexedDB
              </strong>
              <span class="text-amber-800 dark:text-amber-300 text-[11px] block mt-0.5">
                Ada data form yang belum tersimpan dari sesi sebelumnya ({{ pendingDraftData.items?.length || 0 }} item, {{ pendingDraftData.header?.noDocument ? 'No Doc: ' + pendingDraftData.header.noDocument : 'Draf baru' }}). Ingin pulihkan data ini?
              </span>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button 
              type="button" 
              @click="applyRestoredDraft"
              class="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs shadow-xs transition-all flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw class="w-3.5 h-3.5" />
              <span>Pulihkan Draf</span>
            </button>
            <button 
              type="button" 
              @click="discardPendingDraft"
              class="px-2.5 py-1 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 rounded-lg font-medium text-xs transition-colors cursor-pointer"
            >
              Abaikan & Buang
            </button>
          </div>
        </div>

        <!-- Compact Input Fields Grid -->
        <div :class="['grid gap-2 pt-1 border-t border-slate-200/50 dark:border-slate-800 text-xs', formHeader.type === 'IN' ? 'grid-cols-2 sm:grid-cols-5' : 'grid-cols-2 sm:grid-cols-4']">
          <!-- Tipe Switcher Mini -->
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Tipe TO</label>
            <div class="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 font-semibold text-[11px]">
              <button 
                type="button" 
                @click="changeDocType('IN')"
                :disabled="isEditingDoc"
                :class="['flex-1 py-1 rounded text-center transition-all cursor-pointer', formHeader.type === 'IN' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-500']"
              >
                TO Masuk
              </button>
              <button 
                type="button" 
                @click="changeDocType('OUT')"
                :disabled="isEditingDoc"
                :class="['flex-1 py-1 rounded text-center transition-all cursor-pointer', formHeader.type === 'OUT' ? 'bg-white dark:bg-slate-700 text-rose-600 shadow-sm' : 'text-slate-500']"
              >
                TO Keluar
              </button>
            </div>
          </div>

          <!-- Tanggal -->
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Tanggal *</label>
            <input 
              v-model="formHeader.tanggal" 
              type="date" 
              required
              class="w-full px-2.5 py-1 glass-input rounded-lg text-xs"
            />
          </div>

          <!-- No Dokumen (Manual) -->
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">No. Dokumen (Manual) *</label>
            <input 
              v-model="formHeader.noDocument" 
              required
              placeholder="Misal: TO-2026/001"
              class="w-full px-2.5 py-1 glass-input rounded-lg text-xs font-mono font-medium"
            />
          </div>

          <!-- Default Area Masuk (Hanya untuk TO Masuk) -->
          <div v-if="formHeader.type === 'IN'">
            <label class="block text-[10px] font-bold text-slate-400 uppercase mb-0.5" title="Default area rak untuk barang masuk (Default: Staging Area)">
              Default Area Masuk
            </label>
            <SmartSearchSelect 
              v-model="formHeader.defaultLocation"
              :options="locationSelectOptions"
              placeholder="Pilih rak default..."
              search-placeholder="Cari kode rak / nama..."
            />
          </div>

          <!-- Keterangan Dokumen -->
          <div :class="formHeader.type === 'IN' ? 'col-span-2 sm:col-span-1' : ''">
            <label class="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Keterangan Dokumen</label>
            <input 
              v-model="formHeader.keterangan" 
              placeholder="Catatan vendor/toko"
              class="w-full px-2.5 py-1 glass-input rounded-lg text-xs"
            />
          </div>
        </div>
      </div>

      <!-- SECTION: SMART AUTOFILL INPUT WITH FLOATING SUGGESTIONS (MINIMALIS & EFISIEN) -->
      <div 
        ref="addItemSectionRef" 
        class="glass-card p-3 space-y-2 border border-emerald-500/30 relative z-20"
      >
        <!-- Header Ringkas & Tombol Expand Katalog -->
        <div class="flex items-center justify-between text-xs">
          <div class="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Input Item Barang</span>
          </div>

          <button 
            type="button" 
            @click="isAdvancedPickerOpen = true"
            class="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Search class="w-3 h-3" />
            <span>Katalog Master &rarr;</span>
          </button>
        </div>

        <!-- Form Input: Minimalis & Efisien -->
        <form @submit.prevent="addItemToDraft" class="space-y-2">
          <!-- Baris 1: Smart Search Input & Dropdown -->
          <div class="relative">
            <div class="relative flex items-center">
              <Search class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
              <input 
                ref="smartInputRef"
                v-model="typedInputText" 
                @input="onSmartInputChanged"
                @focus="onSmartInputFocus"
                @blur="onSmartInputBlur"
                @keydown.down.prevent="navigateSuggestions(1)"
                @keydown.up.prevent="navigateSuggestions(-1)"
                @keydown.enter.prevent="handleEnterKeyOnSmartInput"
                placeholder="Ketik kode SKU atau nama barang..."
                :class="[
                  'w-full pl-8 pr-8 py-1.5 rounded-lg text-xs font-mono transition-all',
                  isItemUnregistered
                    ? 'border-2 border-rose-500 bg-rose-50/40 dark:bg-rose-950/30 text-rose-800 dark:text-rose-200'
                    : 'glass-input'
                ]"
              />
              <button 
                v-if="typedInputText"
                type="button" 
                @click="typedInputText = ''; selectedItemObject = null; isDropdownOpen = false"
                class="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X class="w-3.5 h-3.5" />
              </button>
            </div>

            <!-- Warning jika tidak terdaftar -->
            <div v-if="isItemUnregistered" class="text-[10px] font-bold text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1">
              <AlertCircle class="w-3 h-3 shrink-0" />
              <span>SKU "{{ typedInputText }}" belum ada di katalog Master Item!</span>
            </div>

            <!-- FLOATING SUGGESTION DROPDOWN (Z-50) -->
            <div 
              v-if="isDropdownOpen && matchingSuggestions.length > 0"
              class="absolute left-0 right-0 top-full mt-1 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xl max-h-56 overflow-y-auto py-1 divide-y divide-slate-100 dark:divide-slate-800"
            >
              <div 
                v-for="(candidate, idx) in matchingSuggestions"
                :key="candidate.uniqCode"
                @mousedown.prevent="selectCandidate(candidate)"
                :class="[
                  'px-3 py-2 text-xs flex items-center justify-between cursor-pointer transition-colors',
                  highlightedIndex === idx 
                    ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold' 
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-300'
                ]"
              >
                <div class="flex items-center gap-2 truncate">
                  <span class="font-mono text-[11px] font-bold bg-slate-200/70 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-800 dark:text-slate-200 shrink-0">
                    {{ candidate.uniqCode }}
                  </span>
                  <span class="truncate font-medium">{{ candidate.deskripsi }}</span>
                </div>
                <span class="text-[10px] text-slate-400 shrink-0 ml-2 font-mono">
                  Stok: {{ candidate.currentStock }} {{ candidate.satuan }}
                </span>
              </div>
            </div>
          </div>

          <!-- Chip Item Terpilih (Sleek Inline Badge) -->
          <div v-if="selectedItemObject" class="flex items-center justify-between bg-emerald-50/80 dark:bg-emerald-950/40 px-2.5 py-1.5 rounded-lg text-xs border border-emerald-200 dark:border-emerald-800/60">
            <div class="flex items-center gap-2 truncate min-w-0">
              <span class="font-mono font-bold text-emerald-800 dark:text-emerald-300">{{ selectedItemObject.uniqCode }}</span>
              <span class="truncate font-medium text-slate-800 dark:text-slate-200">{{ selectedItemObject.deskripsi }}</span>
            </div>
            <div class="flex items-center gap-2 shrink-0 font-mono text-[11px]">
              <span class="text-slate-500 dark:text-slate-400">Stok: <strong class="text-slate-800 dark:text-slate-200">{{ selectedItemObject.currentStock }}</strong> {{ selectedItemObject.satuan }}</span>
            </div>
          </div>

          <!-- Baris 2: Parameter Input Padat (Qty, Lokasi Rak, Catatan, Tombol Tambah) -->
          <div class="grid grid-cols-12 gap-1.5 items-center text-xs">
            <!-- Qty -->
            <div class="col-span-4 sm:col-span-2">
              <input 
                ref="qtyInputRef"
                v-model.number="itemQty" 
                type="number"
                inputmode="numeric"
                min="1"
                required
                placeholder="Qty"
                class="w-full px-2 py-1.5 glass-input rounded-lg text-xs font-bold text-center text-slate-900 dark:text-white"
              />
            </div>

            <!-- Lokasi Rak -->
            <div class="col-span-8 sm:col-span-3">
              <SmartSearchSelect 
                v-model="itemLocation"
                :options="formHeader.type === 'OUT' ? locationSelectOptionsWithAuto : locationSelectOptions"
                placeholder="Pilih rak..."
                search-placeholder="Cari rak..."
              />
            </div>

            <!-- Catatan -->
            <div class="col-span-8 sm:col-span-5">
              <input 
                ref="noteInputRef"
                v-model="itemNote" 
                placeholder="Catatan baris (opsional)..."
                class="w-full px-2.5 py-1.5 glass-input rounded-lg text-xs"
              />
            </div>

            <!-- Tombol Tambah -->
            <div class="col-span-4 sm:col-span-2">
              <button 
                ref="addButtonRef"
                type="submit"
                :disabled="!selectedItemObject"
                class="w-full py-1.5 px-2 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed text-white dark:text-zinc-950 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer shadow-sm"
              >
                <Plus class="w-3.5 h-3.5" />
                <span>+ Item</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      <!-- SECTION: TABEL ITEM LEBIH MINIMALIS PROFESIONAL DENGAN KOLOM QTY AKTUAL (Z-10) -->
      <div class="glass-card overflow-hidden space-y-2.5 p-3.5 relative z-10">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 class="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <List class="w-4 h-4 text-emerald-600" />
              <span>Rincian Item Dokumen ({{ draftItems.length }} Item)</span>
            </h3>
            <p class="text-[10px] text-slate-400">Total Akumulasi: <strong class="text-emerald-600 dark:text-emerald-400">{{ totalDraftQty }} Unit</strong></p>
          </div>

          <!-- Search dalam draft items & Hint Geser Mobile -->
          <div class="flex items-center gap-2">
            <span class="text-[10.5px] text-slate-400 sm:hidden font-mono flex items-center gap-1">
              &larr; Geser tabel &rarr;
            </span>
            <div class="relative w-44 sm:w-56">
              <Search class="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input 
                v-model="draftSearch" 
                type="text" 
                placeholder="Cari item dalam tabel..." 
                class="w-full pl-7 pr-2.5 py-1 glass-input rounded-lg text-xs"
              />
            </div>
          </div>
        </div>

        <!-- Tabel Minimalis Profesional dengan Touch Horizontal Slide -->
        <div class="border border-slate-200/70 dark:border-slate-800 rounded-xl overflow-x-auto touch-pan-x">
          <table class="min-w-[760px] w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-slate-100/70 dark:bg-slate-800/70 border-b border-slate-200/80 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase select-none">
                <th class="py-2 px-3 text-center w-12">No Item</th>
                <th @click="toggleDraftSort('uniqCode')" class="py-2 px-3 cursor-pointer hover:text-emerald-600">
                  <div class="flex items-center gap-1">
                    <span>Kode Item</span>
                    <component :is="getDraftSortIcon('uniqCode')" class="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th @click="toggleDraftSort('deskripsi')" class="py-2 px-3 cursor-pointer hover:text-emerald-600">
                  <div class="flex items-center gap-1">
                    <span>Deskripsi Barang</span>
                    <component :is="getDraftSortIcon('deskripsi')" class="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th class="py-2 px-3 text-center">Satuan</th>
                <th @click="toggleDraftSort('qty')" class="py-2 px-3 text-right cursor-pointer hover:text-emerald-600">
                  <div class="flex items-center justify-end gap-1">
                    <span>Qty</span>
                    <component :is="getDraftSortIcon('qty')" class="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th class="py-2 px-3">Keterangan</th>

                <!-- KOLOM AREA RAK -->
                <th class="py-2 px-3 text-center">
                  {{ formHeader.type === 'IN' ? 'Area Masuk (Rak)' : 'Rak Pengambilan' }}
                </th>

                <!-- KOLOM QTY AKTUAL DENGAN KUADRAT PENJUMLAHAN STOK (DI ANTARA KETERANGAN DAN AKSI) -->
                <th class="py-2 px-3 text-center bg-slate-200/40 dark:bg-slate-800/60 font-black">
                  Qty Aktual (Proyeksi)
                </th>

                <th class="py-2 px-3 text-center w-14">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              <tr v-if="filteredDraftItems.length === 0">
                <td :colspan="9" class="py-6 text-center text-slate-400 text-xs">
                  Belum ada item dalam dokumen ini. Gunakan kolom Smart Autofill di atas untuk menambahkan.
                </td>
              </tr>
              <tr 
                v-for="(it, idx) in paginatedDraftItems" 
                :key="idx" 
                class="hover:bg-emerald-500/5 dark:hover:bg-slate-800/40 transition-colors"
              >
                <td class="py-2 px-3 text-center font-bold text-slate-400 bg-slate-50/50 dark:bg-slate-800/30">
                  {{ (draftCurrentPage - 1) * draftPageSize + idx + 1 }}
                </td>
                <td class="py-2 px-3 font-mono font-bold text-slate-900 dark:text-slate-100">{{ it.uniqCode }}</td>
                <td class="py-2 px-3 font-medium text-slate-800 dark:text-slate-200">{{ it.deskripsi }}</td>
                <td class="py-2 px-3 text-center">
                  <span class="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-600 dark:text-slate-400">
                    {{ it.satuan }}
                  </span>
                </td>
                <td class="py-2 px-3 text-right font-black text-xs text-slate-900 dark:text-white">{{ it.qty }}</td>
                <td class="py-2 px-3 text-slate-500 dark:text-slate-400 max-w-[160px] truncate">{{ it.keterangan || '-' }}</td>

                <!-- SEL AREA RAK DENGAN SMART SEARCH DROPDOWN -->
                <td class="py-2 px-3 text-center min-w-[140px]">
                  <SmartSearchSelect 
                    v-model="it.locationCode"
                    :options="formHeader.type === 'OUT' ? locationSelectOptionsWithAuto : locationSelectOptions"
                    placeholder="Pilih rak..."
                    search-placeholder="Cari rak..."
                  />
                </td>

                <!-- SEL QTY AKTUAL DENGAN KUADRAT PENJUMLAHAN MINIMALIS -->
                <td class="py-2 px-3 text-center bg-slate-50/40 dark:bg-slate-800/20 whitespace-nowrap">
                  <div class="inline-flex items-baseline font-mono select-none" :title="'Stok Sebelum: ' + getItemStockProjection(it, (draftCurrentPage - 1) * draftPageSize + idx).stockBefore + ' → Stok Proyeksi: ' + getItemStockProjection(it, (draftCurrentPage - 1) * draftPageSize + idx).newStock">
                    <span class="font-extrabold text-xs text-slate-900 dark:text-slate-100">
                      {{ it.qty }}
                    </span>
                    <sup 
                      :class="[
                        'ml-0.5 text-[9px] font-bold px-1 py-0.2 rounded tracking-tight',
                        formHeader.type === 'IN' 
                          ? 'text-emerald-700 bg-emerald-100/90 dark:text-emerald-300 dark:bg-emerald-950/80 border border-emerald-500/30' 
                          : (getItemStockProjection(it, (draftCurrentPage - 1) * draftPageSize + idx).newStock < 0 
                              ? 'text-rose-700 bg-rose-100 dark:text-rose-300 dark:bg-rose-950/80 border border-rose-500/30' 
                              : 'text-amber-700 bg-amber-100/90 dark:text-amber-300 dark:bg-amber-950/80 border border-amber-500/30')
                      ]"
                    >
                      {{ getItemStockProjection(it, (draftCurrentPage - 1) * draftPageSize + idx).superscriptText }}
                    </sup>
                  </div>
                </td>

                <td class="py-2 px-3 text-center">
                  <button 
                    @click="removeDraftItem((draftCurrentPage - 1) * draftPageSize + idx)"
                    class="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 rounded transition-colors"
                    title="Hapus baris"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Pagination 
          v-if="filteredDraftItems.length > 0"
          :current-page="draftCurrentPage"
          :page-size="draftPageSize"
          :total-items="filteredDraftItems.length"
          @update:current-page="draftCurrentPage = $event"
          @update:page-size="draftPageSize = $event"
        />
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- MODAL EXPAND / ADVANCED SEARCH MASTER ITEM (LIGHT ACCENT)      -->
    <!-- ============================================================== -->
    <div 
      v-if="isAdvancedPickerOpen" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 dark:bg-black/75 backdrop-blur-md p-3 sm:p-4 transition-all"
    >
      <div class="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl sm:rounded-3xl shadow-2xl shadow-emerald-500/10 dark:shadow-black/70 border border-slate-200/90 dark:border-slate-800 overflow-hidden flex flex-col max-h-[88vh] ring-1 ring-black/5 dark:ring-white/10">
        <!-- Top Light Gradient Bar -->
        <div class="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500"></div>

        <!-- Modal Header dengan Aksen Cahaya Lembut -->
        <div class="px-5 sm:px-6 py-4 bg-gradient-to-b from-emerald-50/70 via-teal-50/20 to-white dark:from-slate-800/80 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/25 shadow-sm">
              <Search class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Pencarian Master Item Canggih</h3>
              <p class="text-[11px] text-slate-400">Pilih barang langsung dari katalog Master Data.</p>
            </div>
          </div>
          <button @click="isAdvancedPickerOpen = false" class="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="p-3.5 sm:p-4 bg-slate-50/60 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
          <div class="relative">
            <Search class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              v-model="advancedSearchQuery" 
              type="text" 
              placeholder="Cari kode unik (SKU), nama barang, satuan..."
              class="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white transition-all shadow-xs"
              autofocus
            />
          </div>
        </div>

        <div class="overflow-y-auto overflow-x-auto flex-1 p-3.5 sm:p-4 bg-white dark:bg-slate-900 touch-pan-x">
          <table class="min-w-[560px] w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase">
                <th class="py-2.5 px-3">Kode Unik</th>
                <th class="py-2.5 px-3">Deskripsi Barang</th>
                <th class="py-2.5 px-3 text-center">Satuan</th>
                <th class="py-2.5 px-3 text-right">Stok Fisik</th>
                <th class="py-2.5 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              <tr 
                v-for="item in filteredAdvancedItems" 
                :key="item.uniqCode" 
                class="hover:bg-emerald-500/5 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td class="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-slate-100">
                  <span class="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200/80 dark:border-slate-700">
                    {{ item.uniqCode }}
                  </span>
                </td>
                <td class="py-2.5 px-3 font-medium text-slate-900 dark:text-slate-100">{{ item.deskripsi }}</td>
                <td class="py-2.5 px-3 text-center">
                  <span class="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-600 dark:text-slate-400">
                    {{ item.satuan }}
                  </span>
                </td>
                <td class="py-2.5 px-3 text-right font-bold" :class="item.currentStock <= 0 ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'">
                  {{ item.currentStock }} {{ item.satuan }}
                </td>
                <td class="py-2.5 px-3 text-center">
                  <button 
                    @click="selectItemFromAdvanced(item)"
                    class="px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-all"
                  >
                    Pilih Item
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="p-3.5 sm:px-6 bg-slate-50/80 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button 
            @click="isAdvancedPickerOpen = false"
            class="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- MODAL DETAIL DOKUMEN TRANSFER ORDER (LIGHT ACCENT)             -->
    <!-- ============================================================== -->
    <div 
      v-if="selectedDetailDoc" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 dark:bg-black/75 backdrop-blur-md p-3 sm:p-4 transition-all"
    >
      <div class="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl shadow-emerald-500/10 dark:shadow-black/70 border border-slate-200/90 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] ring-1 ring-black/5 dark:ring-white/10">
        <!-- Top Light Gradient Bar -->
        <div class="h-1.5 w-full bg-gradient-to-r" :class="selectedDetailDoc.type === 'IN' ? 'from-emerald-500 via-teal-400 to-blue-500' : 'from-rose-500 via-orange-400 to-amber-500'"></div>

        <!-- Modal Header dengan Aksen Cahaya Lembut -->
        <div class="px-5 sm:px-6 py-4 bg-gradient-to-b from-slate-50/80 via-white to-white dark:from-slate-800/80 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <span 
                :class="[
                  'px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border',
                  selectedDetailDoc.type === 'IN' 
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800' 
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-300 dark:border-rose-800'
                ]"
              >
                {{ selectedDetailDoc.type === 'IN' ? 'Transfer Masuk (IN)' : 'Transfer Keluar (OUT)' }}
              </span>
              <span 
                v-if="selectedDetailDoc.status === 'DRAFT'"
                class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
              >
                Draft
              </span>
              <span 
                v-else
                class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 inline-flex items-center gap-1"
              >
                <Lock class="w-2.5 h-2.5 text-zinc-500" />
                <span>Resmi & Terkunci</span>
              </span>
              <h2 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-mono">{{ selectedDetailDoc.trxCode }}</h2>
            </div>
            <p class="text-[11px] text-slate-400 mt-0.5">Detail dokumen Transfer Order dan rincian item barang.</p>
          </div>
          <button @click="selectedDetailDoc = null" class="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="p-4 sm:p-5 overflow-y-auto space-y-4 bg-white dark:bg-slate-900">
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700 text-xs">
            <div>
              <span class="text-slate-400 block text-[10px] font-medium">No. Dokumen:</span>
              <strong class="font-mono text-slate-900 dark:text-slate-100">{{ selectedDetailDoc.noDocument || '-' }}</strong>
            </div>
            <div>
              <span class="text-slate-400 block text-[10px] font-medium">Tanggal:</span>
              <strong class="text-slate-900 dark:text-slate-100">{{ selectedDetailDoc.tanggal }}</strong>
            </div>
            <div>
              <span class="text-slate-400 block text-[10px] font-medium">Total Qty:</span>
              <strong class="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">{{ selectedDetailDoc.totalQty }} Unit</strong>
            </div>
            <div class="col-span-2 sm:col-span-3">
              <span class="text-slate-400 block text-[10px] font-medium">Keterangan Dokumen:</span>
              <span class="text-slate-700 dark:text-slate-300">{{ selectedDetailDoc.keterangan || '-' }}</span>
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between mb-2">
              <h4 class="font-bold text-[11px] uppercase tracking-wider text-slate-500">Daftar Item Barang ({{ selectedDetailDoc.items?.length || 0 }} Item):</h4>
              <span class="text-[10px] text-slate-400 sm:hidden font-mono">&larr; Geser tabel &rarr;</span>
            </div>
            <div class="border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-x-auto touch-pan-x shadow-xs">
              <table class="min-w-[580px] w-full text-left border-collapse text-xs">
                <thead>
                  <tr class="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800 text-[9px] font-bold text-slate-600 dark:text-slate-300 uppercase">
                    <th class="py-2.5 px-3">No</th>
                    <th class="py-2.5 px-3">Kode Item</th>
                    <th class="py-2.5 px-3">Deskripsi Barang</th>
                    <th class="py-2.5 px-3 text-center">Satuan</th>
                    <th v-if="selectedDetailDoc.type === 'IN'" class="py-2.5 px-3">Area Masuk</th>
                    <th class="py-2.5 px-3 text-right">Qty</th>
                    <th class="py-2.5 px-3">Keterangan</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  <tr v-for="(it, idx) in selectedDetailDoc.items" :key="idx" class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td class="py-2 px-3 text-slate-400 font-bold">{{ idx + 1 }}</td>
                    <td class="py-2 px-3 font-mono font-bold text-slate-900 dark:text-slate-100">{{ it.uniqCode }}</td>
                    <td class="py-2 px-3 font-medium">{{ it.deskripsi }}</td>
                    <td class="py-2 px-3 text-center">
                      <span class="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-600 dark:text-slate-400">{{ it.satuan }}</span>
                    </td>
                    <td v-if="selectedDetailDoc.type === 'IN'" class="py-2 px-3 font-semibold text-xs">
                      <span class="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        {{ it.locationCode || selectedDetailDoc.defaultLocation || 'ZONE-STAGING' }}
                      </span>
                    </td>
                    <td class="py-2 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">{{ it.qty }}</td>
                    <td class="py-2 px-3 text-slate-500">{{ it.keterangan || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="px-5 py-3.5 bg-slate-50/80 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div class="text-xs">
            <span v-if="!isDocEditable(selectedDetailDoc)" class="inline-flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-[11px]">
              <Lock class="w-3.5 h-3.5 text-zinc-400" />
              <span>Dokumen sah & terkunci permanen untuk menjaga integritas kartu stok.</span>
            </span>
            <span v-else class="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-[11px] font-medium">
              <span>Dokumen Draf (Belum mempengaruhi stok fisik gudang).</span>
            </span>
          </div>

          <div class="flex flex-wrap items-center gap-2 self-end sm:self-auto">
            <!-- Tombol Cetak / Simpan PDF -->
            <button 
              type="button"
              @click="printTransferOrderDocument(selectedDetailDoc)"
              class="px-3.5 py-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 bg-white hover:bg-zinc-100 dark:bg-zinc-850 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Cetak Dokumen atau Simpan PDF Resmi"
            >
              <Printer class="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
              <span>Cetak / PDF</span>
            </button>

            <!-- Tombol Ekspor Excel -->
            <button 
              type="button"
              @click="exportTransferOrderExcel(selectedDetailDoc)"
              class="px-3.5 py-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-800 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Ekspor Dokumen ke Format Excel (.xlsx)"
            >
              <FileSpreadsheet class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Ekspor Excel</span>
            </button>

            <button 
              v-if="isDocEditable(selectedDetailDoc)"
              @click="openEditFromDetail(selectedDetailDoc)"
              class="px-3.5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Pencil class="w-3.5 h-3.5" />
              <span>Edit Draf</span>
            </button>
            <button 
              @click="selectedDetailDoc = null"
              class="px-4 py-2 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- MODAL EKSPOR EXCEL TRANSFER ORDER (MINIMALIS & ELEGAN)         -->
    <!-- ============================================================== -->
    <div 
      v-if="isExportModalOpen" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4"
    >
      <div class="bg-white dark:bg-zinc-950 w-full max-w-lg rounded-2xl sm:rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col">
        <!-- Modal Header Minimalis -->
        <div class="px-5 sm:px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-bold">
              <Download class="w-4 h-4" />
            </div>
            <div>
              <h3 class="text-sm sm:text-base font-bold text-zinc-950 dark:text-white">Ekspor Transfer Order (.xlsx)</h3>
              <p class="text-[11px] text-zinc-400">Unduh data mutasi dengan filter spesifik sesuai kebutuhan.</p>
            </div>
          </div>
          <button 
            @click="isExportModalOpen = false" 
            class="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Modal Body Form -->
        <div class="p-5 sm:p-6 space-y-4 text-xs overflow-y-auto max-h-[75vh]">
          <!-- Filter 1: Jenis Mutasi -->
          <div class="space-y-1.5">
            <label class="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              1. Jenis Transaksi
            </label>
            <div class="grid grid-cols-3 gap-2">
              <button 
                type="button"
                @click="exportTypeFilter = 'ALL'"
                :class="[
                  'py-2 rounded-xl font-bold transition-all border text-center cursor-pointer',
                  exportTypeFilter === 'ALL'
                    ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border-zinc-950 dark:border-white shadow-xs'
                    : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400'
                ]"
              >
                Semua (IN & OUT)
              </button>
              <button 
                type="button"
                @click="exportTypeFilter = 'IN'"
                :class="[
                  'py-2 rounded-xl font-bold transition-all border text-center cursor-pointer',
                  exportTypeFilter === 'IN'
                    ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border-zinc-950 dark:border-white shadow-xs'
                    : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400'
                ]"
              >
                Masuk (IN)
              </button>
              <button 
                type="button"
                @click="exportTypeFilter = 'OUT'"
                :class="[
                  'py-2 rounded-xl font-bold transition-all border text-center cursor-pointer',
                  exportTypeFilter === 'OUT'
                    ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border-zinc-950 dark:border-white shadow-xs'
                    : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400'
                ]"
              >
                Keluar (OUT)
              </button>
            </div>
          </div>

          <!-- Filter 2: Rentang Waktu -->
          <div class="space-y-1.5">
            <label class="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              2. Rentang Waktu Transaksi
            </label>
            <div class="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              <button 
                v-for="preset in [
                  { id: 'ALL', label: 'Semua' },
                  { id: 'TODAY', label: 'Hari Ini' },
                  { id: '7D', label: '7 Hari' },
                  { id: '30D', label: '30 Hari' },
                  { id: 'MTD', label: 'Bulan Ini' },
                  { id: 'CUSTOM', label: 'Kustom' }
                ]"
                :key="preset.id"
                type="button"
                @click="exportDatePreset = preset.id"
                :class="[
                  'py-1.5 px-2 rounded-lg text-center font-semibold transition-all border cursor-pointer',
                  exportDatePreset === preset.id
                    ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border-zinc-950 dark:border-white shadow-xs font-bold'
                    : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400'
                ]"
              >
                {{ preset.label }}
              </button>
            </div>

            <!-- Custom Date Pickers -->
            <div v-if="exportDatePreset === 'CUSTOM'" class="grid grid-cols-2 gap-2 pt-2">
              <div>
                <label class="block text-[10px] text-zinc-400 mb-1 font-mono">Mulai Tanggal:</label>
                <input 
                  v-model="exportStartDate" 
                  type="date" 
                  class="w-full px-2.5 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-xs font-mono"
                />
              </div>
              <div>
                <label class="block text-[10px] text-zinc-400 mb-1 font-mono">Sampai Tanggal:</label>
                <input 
                  v-model="exportEndDate" 
                  type="date" 
                  class="w-full px-2.5 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <!-- Opsi Tambahan -->
          <div class="space-y-1.5 pt-1">
            <label class="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              3. Opsi Lembar Kerja (Sheets)
            </label>
            <label class="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 cursor-pointer">
              <input 
                v-model="exportIncludeDetails" 
                type="checkbox" 
                class="mt-0.5 rounded text-zinc-950 focus:ring-0 dark:bg-zinc-800"
              />
              <div>
                <strong class="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">Sertakan Sheet Rincian Per-Item (Direkomendasikan)</strong>
                <span class="text-[11px] text-zinc-400 block mt-0.5">
                  Menambahkan lembar ke-2 berisi setiap baris SKU barang, jumlah unit, dan lokasi rak.
                </span>
              </div>
            </label>
          </div>

          <!-- Live Preview Summary Card -->
          <div class="p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <span class="text-[10px] uppercase font-mono text-zinc-400 block">Pratinjau Hasil Filter</span>
              <div class="text-xs font-bold text-zinc-900 dark:text-white mt-0.5">
                <span>{{ exportTransactionsList.length }} Dokumen</span>
                <span class="text-zinc-400 font-normal mx-1.5">•</span>
                <span>{{ exportTotalQty }} Unit</span>
                <span v-if="exportIncludeDetails" class="text-zinc-400 font-normal mx-1.5">•</span>
                <span v-if="exportIncludeDetails">{{ exportTotalItemsCount }} Baris Barang</span>
              </div>
            </div>
            <div class="w-8 h-8 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <FileSpreadsheet class="w-4 h-4" />
            </div>
          </div>
        </div>

        <!-- Modal Footer Actions -->
        <div class="px-5 sm:px-6 py-3.5 bg-zinc-50 dark:bg-zinc-900/60 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-2">
          <button 
            type="button"
            @click="isExportModalOpen = false"
            class="px-3.5 py-2 text-xs font-semibold bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-xl border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button 
            type="button"
            @click="downloadTransactionsExcel"
            :disabled="isExporting || exportTransactionsList.length === 0"
            class="flex items-center gap-2 px-4 py-2 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 rounded-xl text-xs font-bold shadow-xs border border-zinc-950 dark:border-white transition-all disabled:opacity-50 cursor-pointer"
          >
            <Download class="w-4 h-4" />
            <span>{{ isExporting ? 'Membuat File...' : 'Unduh Excel (.xlsx)' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { 
  db, 
  generateAutoTrxCode, 
  applyTransactionStockToLocations,
  saveFormDraft,
  getFormDraft,
  deleteFormDraft
} from '../database/db';
import Pagination from '../components/Pagination.vue';
import SkeletonLoader from '../components/SkeletonLoader.vue';
import SmartSearchSelect from '../components/SmartSearchSelect.vue';
import * as XLSX from 'xlsx';
import { createStyledSheet, exportTransferOrderExcel } from '../utils/excelFormatter';
import { printTransferOrderDocument } from '../utils/documentPrinter';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Search, 
  Trash2, 
  X, 
  FileText, 
  Plus, 
  Eye, 
  ArrowLeft, 
  List, 
  Save, 
  Maximize2, 
  AlertCircle,
  Pencil,
  ArrowUp,
  ArrowDown,
  ChevronsUpDown,
  Download,
  FileSpreadsheet,
  RotateCcw,
  Sparkles,
  Lock,
  CheckCircle2,
  Printer
} from 'lucide-vue-next';

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

const emit = defineEmits(['refresh-data', 'subpage-change']);

// State Views: 'list' | 'create'
const currentView = ref('list');
const selectedDetailDoc = ref(null);
const isEditingDoc = ref(false);
const editingDocId = ref(null);

// List View State
const searchQuery = ref('');
const selectedTypeFilter = ref('ALL');
const dateFilter = ref('');
const sortKey = ref('tanggal');
const sortOrder = ref('desc');
const currentPage = ref(1);
const pageSize = ref(10);

// Contextual Export Modal State
const isExportModalOpen = ref(false);
const exportTypeFilter = ref('ALL'); // 'ALL' | 'IN' | 'OUT'
const exportDatePreset = ref('ALL'); // 'ALL' | 'TODAY' | '7D' | '30D' | 'MTD' | 'CUSTOM'
const exportStartDate = ref('');
const exportEndDate = ref('');
const exportIncludeDetails = ref(true);
const isExporting = ref(false);

// Filtered Transactions for Export
const exportTransactionsList = computed(() => {
  let list = [...props.transactions];
  if (exportTypeFilter.value !== 'ALL') {
    list = list.filter(t => t.type === exportTypeFilter.value);
  }
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  if (exportDatePreset.value === 'TODAY') {
    list = list.filter(t => t.tanggal === todayStr);
  } else if (exportDatePreset.value === '7D') {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    const startStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    list = list.filter(t => t.tanggal >= startStr && t.tanggal <= todayStr);
  } else if (exportDatePreset.value === '30D') {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    const startStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    list = list.filter(t => t.tanggal >= startStr && t.tanggal <= todayStr);
  } else if (exportDatePreset.value === 'MTD') {
    const startStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`;
    list = list.filter(t => t.tanggal >= startStr && t.tanggal <= todayStr);
  } else if (exportDatePreset.value === 'CUSTOM') {
    if (exportStartDate.value) {
      list = list.filter(t => t.tanggal >= exportStartDate.value);
    }
    if (exportEndDate.value) {
      list = list.filter(t => t.tanggal <= exportEndDate.value);
    }
  }
  return list.sort((a, b) => (b.tanggal || '').localeCompare(a.tanggal || ''));
});

const exportTotalQty = computed(() => {
  return exportTransactionsList.value.reduce((acc, curr) => acc + (Number(curr.totalQty) || 0), 0);
});

const exportTotalItemsCount = computed(() => {
  return exportTransactionsList.value.reduce((acc, curr) => acc + (curr.items?.length || 0), 0);
});

function downloadTransactionsExcel() {
  if (exportTransactionsList.value.length === 0) {
    alert('Tidak ada dokumen transaksi yang cocok dengan kriteria filter.');
    return;
  }
  isExporting.value = true;
  try {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Dokumen Transfer Order
    const docRows = exportTransactionsList.value.map(doc => ({
      'Kode Transfer Order': doc.trxCode,
      'Tipe Mutasi': doc.type === 'IN' ? '📥 MASUK (IN)' : '📤 KELUAR (OUT)',
      'Tanggal Transaksi': doc.tanggal,
      'No Dokumen Referensi': doc.noDocument || '-',
      'Total Kuantitas (Unit)': Number(doc.totalQty) || 0,
      'Jumlah Baris Item': doc.items ? doc.items.length : 0,
      'Default Area Rak': doc.defaultLocation || 'ZONE-STAGING',
      'Keterangan Dokumen': doc.keterangan || '-',
      'Waktu Rekam Sistem': doc.createdAt ? new Date(doc.createdAt).toLocaleString('id-ID') : '-'
    }));
    XLSX.utils.book_append_sheet(wb, createStyledSheet(docRows), 'Dokumen_Transfer_Order');

    // Sheet 2: Rincian Baris Barang (opsional)
    if (exportIncludeDetails.value) {
      const itemRows = [];
      exportTransactionsList.value.forEach(doc => {
        if (doc.items && Array.isArray(doc.items)) {
          doc.items.forEach((it, idx) => {
            itemRows.push({
              'Kode TO Induk': doc.trxCode,
              'Tipe Mutasi': doc.type === 'IN' ? '📥 MASUK (IN)' : '📤 KELUAR (OUT)',
              'Tanggal Transaksi': doc.tanggal,
              'No Dokumen Ref': doc.noDocument || '-',
              'No Urut': idx + 1,
              'Kode Item (SKU)': it.uniqCode,
              'Deskripsi Barang': it.deskripsi || '-',
              'Kuantitas': Number(it.qty) || 0,
              'Satuan': it.satuan || 'PCS',
              'Alokasi Lokasi Rak': it.locationCode || doc.defaultLocation || 'ZONE-STAGING',
              'Keterangan Item': it.keterangan || '-'
            });
          });
        }
      });
      XLSX.utils.book_append_sheet(wb, createStyledSheet(itemRows), 'Rincian_Baris_Barang');
    }

    const dateTag = new Date().toISOString().split('T')[0];
    const typeTag = exportTypeFilter.value;
    const presetTag = exportDatePreset.value;
    const fileName = `IMS_Transfer_Order_${typeTag}_${presetTag}_${dateTag}.xlsx`;

    XLSX.writeFile(wb, fileName);
    isExportModalOpen.value = false;
  } catch (err) {
    console.error('Gagal mengekspor transaksi:', err);
    alert('Terjadi kesalahan saat memproses file Excel: ' + err.message);
  } finally {
    isExporting.value = false;
  }
}

// Lokasi Gudang State (Default Masuk ke Staging Area)
const availableLocations = ref([]);
const itemLocation = ref('ZONE-STAGING');

const locationSelectOptions = computed(() => {
  return availableLocations.value.map(l => ({
    value: l.code,
    label: l.code,
    sublabel: l.name,
    badge: l.type || 'Storage'
  }));
});

const locationSelectOptionsWithAuto = computed(() => {
  return [
    { value: 'AUTO', label: 'AUTO (Picking Otomatis)', sublabel: 'Sistem memilih rak stok tersedia' },
    ...locationSelectOptions.value
  ];
});

async function loadLocations() {
  const locs = await db.locations.toArray();
  if (locs.length > 0) {
    availableLocations.value = locs;
  } else {
    availableLocations.value = [
      { code: 'ZONE-STAGING', name: 'Area Transit & Receiving' },
      { code: 'RAK-A1', name: 'Rak Fast Picking A1' },
      { code: 'RAK-A2', name: 'Rak Fast Picking A2' },
      { code: 'RAK-B1', name: 'Rak Logistik B1' },
      { code: 'RAK-B2', name: 'Rak Logistik B2' },
      { code: 'ZONE-C1', name: 'Pallet Bulk Storage C1' }
    ];
  }
}

// Create Form State
const formHeader = ref({
  trxCode: '',
  type: 'IN',
  tanggal: new Date().toISOString().split('T')[0],
  noDocument: '',
  keterangan: '',
  defaultLocation: 'ZONE-STAGING'
});

// Smart Autofill & Candidate Suggestions State
const typedInputText = ref('');
const matchingSuggestions = ref([]);
const highlightedIndex = ref(-1);
const isDropdownOpen = ref(false);
const selectedItemObject = ref(null);
const isItemUnregistered = ref(false);

const itemQty = ref(1);
const itemNote = ref('');
const draftItems = ref([]);

// Element Refs
const addItemSectionRef = ref(null);
const smartInputRef = ref(null);
const qtyInputRef = ref(null);
const noteInputRef = ref(null);
const addButtonRef = ref(null);

// ==============================================================
// AUTO-SAVE DRAF TRANSFER ORDER (INDEXEDDB)
// ==============================================================
// Helper: Hanya dokumen berstatus DRAFT yang boleh diedit atau dihapus
function isDocEditable(doc) {
  if (!doc) return false;
  return doc.status === 'DRAFT' && !doc.isLocked;
}

const hasPendingDraft = ref(false);
const pendingDraftData = ref(null);
const lastDraftSavedTime = ref('');
const isAutosaving = ref(false);
const isCheckingDraft = ref(false);
let autosaveTimer = null;

const currentDraftKey = computed(() => {
  if (isEditingDoc.value && editingDocId.value) {
    return `to_draft_edit_${editingDocId.value}`;
  }
  return 'to_draft_new';
});

async function checkForSavedDraft(key) {
  isCheckingDraft.value = true;
  try {
    const draftRecord = await getFormDraft(key);
    if (draftRecord && draftRecord.data) {
      const data = draftRecord.data;
      const hasContent = (data.items && data.items.length > 0) || 
                         (data.header && (data.header.noDocument?.trim() || data.header.keterangan?.trim()));
      if (hasContent) {
        pendingDraftData.value = {
          ...data,
          updatedAt: draftRecord.updatedAt
        };
        hasPendingDraft.value = true;
        return;
      }
    }
  } catch (err) {
    console.warn('Gagal membaca draf dari IndexedDB:', err);
  } finally {
    isCheckingDraft.value = false;
  }
  hasPendingDraft.value = false;
  pendingDraftData.value = null;
}

function applyRestoredDraft() {
  if (!pendingDraftData.value) return;
  const d = pendingDraftData.value;
  if (d.header) {
    formHeader.value = {
      ...formHeader.value,
      ...d.header
    };
    if (d.header.defaultLocation) {
      itemLocation.value = d.header.defaultLocation;
    }
  }
  if (Array.isArray(d.items)) {
    draftItems.value = JSON.parse(JSON.stringify(d.items));
  }
  hasPendingDraft.value = false;
  lastDraftSavedTime.value = d.updatedAt 
    ? new Date(d.updatedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    : 'Sebelumnya';
}

async function discardPendingDraft() {
  if (currentDraftKey.value) {
    await deleteFormDraft(currentDraftKey.value);
  }
  hasPendingDraft.value = false;
  pendingDraftData.value = null;
  lastDraftSavedTime.value = '';
}

// Watcher Auto-Save ke IndexedDB (Debounce 600ms)
watch([formHeader, draftItems], () => {
  if (currentView.value !== 'create') return;
  // Jangan menimpa draf jika sedang proses cek draf atau user belum merespons banner restore draf
  if (isCheckingDraft.value || hasPendingDraft.value) return;

  const hasContent = draftItems.value.length > 0 || 
                     formHeader.value.noDocument.trim() !== '' || 
                     formHeader.value.keterangan.trim() !== '';

  if (!hasContent) return;

  if (autosaveTimer) clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(async () => {
    isAutosaving.value = true;
    try {
      await saveFormDraft(currentDraftKey.value, {
        header: JSON.parse(JSON.stringify(formHeader.value)),
        items: JSON.parse(JSON.stringify(draftItems.value)),
        isEditing: isEditingDoc.value,
        editingId: editingDocId.value
      });
      lastDraftSavedTime.value = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch (err) {
      console.warn('Gagal auto-save ke IndexedDB:', err);
    } finally {
      setTimeout(() => {
        isAutosaving.value = false;
      }, 400);
    }
  }, 600);
}, { deep: true });

// Advanced Picker Modal State
const isAdvancedPickerOpen = ref(false);
const advancedSearchQuery = ref('');

// Draft Items Table Tools (Search, Sort, Pagination)
const draftSearch = ref('');
const draftSortKey = ref('uniqCode');
const draftSortOrder = ref('asc');
const draftCurrentPage = ref(1);
const draftPageSize = ref(10);

// Computed Total Draft Qty
const totalDraftQty = computed(() => {
  return draftItems.value.reduce((acc, curr) => acc + (Number(curr.qty) || 0), 0);
});

// Filter & Sort Transactions
const filteredTransactions = computed(() => {
  let list = [...props.transactions];
  if (selectedTypeFilter.value !== 'ALL') list = list.filter(t => t.type === selectedTypeFilter.value);
  if (dateFilter.value) list = list.filter(t => t.tanggal === dateFilter.value);
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(t => 
      (t.trxCode && t.trxCode.toLowerCase().includes(q)) ||
      (t.noDocument && t.noDocument.toLowerCase().includes(q)) ||
      (t.keterangan && t.keterangan.toLowerCase().includes(q)) ||
      (t.items && t.items.some(i => i.uniqCode.toLowerCase().includes(q) || i.deskripsi.toLowerCase().includes(q)))
    );
  }
  list.sort((a, b) => {
    let valA = a[sortKey.value];
    let valB = b[sortKey.value];
    if (sortKey.value === 'totalQty') {
      valA = Number(valA) || 0;
      valB = Number(valB) || 0;
    } else {
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
    }
    if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1;
    return (b.id || 0) - (a.id || 0);
  });
  return list;
});

const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredTransactions.value.slice(start, start + pageSize.value);
});

// Draft Items Table: Filter, Sort, Pagination
const filteredDraftItems = computed(() => {
  let list = [...draftItems.value];
  if (draftSearch.value.trim()) {
    const q = draftSearch.value.toLowerCase().trim();
    list = list.filter(i => 
      i.uniqCode.toLowerCase().includes(q) ||
      i.deskripsi.toLowerCase().includes(q) ||
      (i.keterangan && i.keterangan.toLowerCase().includes(q))
    );
  }
  list.sort((a, b) => {
    let valA = a[draftSortKey.value];
    let valB = b[draftSortKey.value];
    if (draftSortKey.value === 'qty') {
      valA = Number(valA) || 0;
      valB = Number(valB) || 0;
    } else {
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
    }
    if (valA < valB) return draftSortOrder.value === 'asc' ? -1 : 1;
    if (valA > valB) return draftSortOrder.value === 'asc' ? 1 : -1;
    return 0;
  });
  return list;
});

const paginatedDraftItems = computed(() => {
  const start = (draftCurrentPage.value - 1) * draftPageSize.value;
  return filteredDraftItems.value.slice(start, start + draftPageSize.value);
});

// Advanced Picker Filtered Items
const filteredAdvancedItems = computed(() => {
  if (!advancedSearchQuery.value.trim()) return props.itemsWithStock;
  const q = advancedSearchQuery.value.toLowerCase().trim();
  return props.itemsWithStock.filter(item => 
    item.uniqCode.toLowerCase().includes(q) ||
    item.deskripsi.toLowerCase().includes(q) ||
    item.satuan.toLowerCase().includes(q)
  );
});

// =========================================================================
// LOGIKA QTY AKTUAL DENGAN KUADRAT PENJUMLAHAN STOK (CACHED O(1) PROJECTION)
// =========================================================================
const draftStockProjections = computed(() => {
  const masterMap = {};
  for (const m of props.itemsWithStock) {
    masterMap[m.uniqCode] = Number(m.currentStock) || 0;
  }

  if (isEditingDoc.value && editingDocId.value) {
    const existingSavedDoc = props.transactions.find(t => t.id === editingDocId.value);
    if (existingSavedDoc && existingSavedDoc.items) {
      for (const i of existingSavedDoc.items) {
        const q = Number(i.qty) || 0;
        if (existingSavedDoc.type === 'IN') {
          masterMap[i.uniqCode] = (masterMap[i.uniqCode] || 0) - q;
        } else {
          masterMap[i.uniqCode] = (masterMap[i.uniqCode] || 0) + q;
        }
      }
    }
  }

  const isTypeIn = formHeader.value.type === 'IN';
  const runningTrack = { ...masterMap };
  const map = new Map();

  for (let i = 0; i < draftItems.value.length; i++) {
    const item = draftItems.value[i];
    const base = runningTrack[item.uniqCode] || 0;
    const currentLineQty = Number(item.qty) || 0;

    const stockBefore = base;
    const newStock = isTypeIn ? stockBefore + currentLineQty : stockBefore - currentLineQty;
    const superscriptText = isTypeIn ? `+${stockBefore}=${newStock}` : `-${stockBefore}=${newStock}`;

    runningTrack[item.uniqCode] = newStock;
    map.set(i, {
      stockBefore,
      newStock,
      superscriptText
    });
  }

  return map;
});

function getItemStockProjection(item, currentIndex) {
  return draftStockProjections.value.get(currentIndex) || {
    stockBefore: 0,
    newStock: 0,
    superscriptText: ''
  };
}

// ==========================================
// SMART AUTOFILL & FLOATING SUGGESTIONS LOGIC
// ==========================================
function onSmartInputChanged() {
  const query = typedInputText.value.trim();

  if (!query) {
    matchingSuggestions.value = [];
    highlightedIndex.value = -1;
    isDropdownOpen.value = false;
    selectedItemObject.value = null;
    isItemUnregistered.value = false;
    return;
  }

  const qLower = query.toLowerCase();

  const matches = props.itemsWithStock.filter(i => 
    i.uniqCode.toLowerCase().includes(qLower) || 
    i.deskripsi.toLowerCase().includes(qLower)
  ).slice(0, 6);

  matchingSuggestions.value = matches;
  highlightedIndex.value = matches.length > 0 ? 0 : -1;
  isDropdownOpen.value = matches.length > 0;

  if (matches.length > 0) {
    isItemUnregistered.value = false;
    const exact = matches.find(m => m.uniqCode.toUpperCase() === query.toUpperCase());
    if (exact) {
      selectedItemObject.value = exact;
    }
  } else {
    selectedItemObject.value = null;
    isItemUnregistered.value = true;
  }
}

function onSmartInputFocus() {
  if (typedInputText.value.trim() && matchingSuggestions.value.length > 0) {
    isDropdownOpen.value = true;
  }
}

function onSmartInputBlur() {
  // Delay penutupan agar klik mouse pada item dropdown tetap sempat tereksekusi
  setTimeout(() => {
    isDropdownOpen.value = false;
  }, 200);
}

function navigateSuggestions(delta) {
  if (matchingSuggestions.value.length === 0) return;
  isDropdownOpen.value = true;
  highlightedIndex.value = (highlightedIndex.value + delta + matchingSuggestions.value.length) % matchingSuggestions.value.length;
}

function handleEnterKeyOnSmartInput() {
  if (isDropdownOpen.value && highlightedIndex.value >= 0 && matchingSuggestions.value[highlightedIndex.value]) {
    selectCandidate(matchingSuggestions.value[highlightedIndex.value]);
    if (qtyInputRef.value) qtyInputRef.value.focus();
  } else if (selectedItemObject.value) {
    addItemToDraft();
  }
}

function selectCandidate(item) {
  typedInputText.value = item.uniqCode;
  selectedItemObject.value = item;
  isItemUnregistered.value = false;
  isDropdownOpen.value = false;
  matchingSuggestions.value = [];
}

function selectItemFromAdvanced(item) {
  selectCandidate(item);
  isAdvancedPickerOpen.value = false;
  if (qtyInputRef.value) qtyInputRef.value.focus();
}

function focusAddItemInput() {
  if (smartInputRef.value) {
    smartInputRef.value.focus();
    smartInputRef.value.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function addItemToDraft() {
  if (!selectedItemObject.value) {
    alert('Pilih barang yang terdaftar di database terlebih dahulu!');
    return;
  }

  const qty = Number(itemQty.value);
  if (!qty || qty <= 0) {
    alert('Qty harus lebih dari 0!');
    return;
  }

  // Validasi stok TO Keluar (OUT)
  if (formHeader.value.type === 'OUT') {
    const existingInDraft = draftItems.value
      .filter(it => it.uniqCode === selectedItemObject.value.uniqCode)
      .reduce((acc, curr) => acc + Number(curr.qty), 0);

    const totalRequested = existingInDraft + qty;
    if (totalRequested > selectedItemObject.value.currentStock) {
      const confirmExceed = confirm(
        `PERINGATAN: Total Qty keluar (${totalRequested}) melebihi stok yang tersedia (${selectedItemObject.value.currentStock} ${selectedItemObject.value.satuan})! Tetap lanjutkan?`
      );
      if (!confirmExceed) return;
    }
  }

  draftItems.value.push({
    uniqCode: String(selectedItemObject.value.uniqCode),
    deskripsi: String(selectedItemObject.value.deskripsi),
    satuan: String(selectedItemObject.value.satuan),
    qty: qty,
    locationCode: formHeader.value.type === 'IN' 
      ? (itemLocation.value || formHeader.value.defaultLocation || 'ZONE-STAGING') 
      : (itemLocation.value || 'AUTO'),
    keterangan: String(itemNote.value || '').trim()
  });

  // Reset input state
  typedInputText.value = '';
  selectedItemObject.value = null;
  matchingSuggestions.value = [];
  isDropdownOpen.value = false;
  isItemUnregistered.value = false;
  itemQty.value = 1;
  itemNote.value = '';

  // KURSOR OTOMATIS BERPINDAH KE KOLOM INPUT BARANG
  nextTick(() => {
    if (smartInputRef.value) {
      smartInputRef.value.focus();
    }
  });
}

function removeDraftItem(index) {
  draftItems.value.splice(index, 1);
}

// Buka Halaman Create (dengan dukungan prefilled items dari PPIC)
async function openCreatePage(type = 'IN', prefilledItems = []) {
  isEditingDoc.value = false;
  editingDocId.value = null;
  const autoCode = await generateAutoTrxCode(type);
  await loadLocations();
  formHeader.value = {
    trxCode: autoCode,
    type: type,
    tanggal: new Date().toISOString().split('T')[0],
    noDocument: prefilledItems.length > 0 ? `PO-PPIC-${new Date().toISOString().split('T')[0].replace(/-/g, '')}` : '',
    keterangan: prefilledItems.length > 0 ? 'Pengadaan berdasarkan Rekomendasi PPIC' : '',
    defaultLocation: 'ZONE-STAGING'
  };
  itemLocation.value = 'ZONE-STAGING';
  draftItems.value = prefilledItems.length > 0 
    ? prefilledItems.map(item => ({
        ...item,
        locationCode: item.locationCode || 'ZONE-STAGING'
      })) 
    : [];
  typedInputText.value = '';
  selectedItemObject.value = null;
  matchingSuggestions.value = [];
  isDropdownOpen.value = false;
  isItemUnregistered.value = false;
  itemQty.value = 1;
  itemNote.value = '';

  currentView.value = 'create';
  emit('subpage-change', `+ Transfer ${type === 'IN' ? 'Masuk (IN)' : 'Keluar (OUT)'}`);
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Cek apakah ada draf tersimpan di IndexedDB jika bukan prefilled dari PPIC
  if (prefilledItems.length === 0) {
    await checkForSavedDraft('to_draft_new');
  } else {
    hasPendingDraft.value = false;
    pendingDraftData.value = null;
  }
}

// Buka Halaman Edit Dokumen
async function openEditPage(doc) {
  if (!isDocEditable(doc)) {
    alert(`Dokumen "${doc.trxCode}" sudah berstatus resmi/terposting dan TERKUNCI!\n\nDokumen resmi tidak dapat diedit untuk mencegah selisih kartu stok.`);
    return;
  }
  isEditingDoc.value = true;
  editingDocId.value = doc.id;
  await loadLocations();
  formHeader.value = {
    trxCode: doc.trxCode,
    type: doc.type,
    tanggal: doc.tanggal,
    noDocument: doc.noDocument || '',
    keterangan: doc.keterangan || '',
    defaultLocation: doc.defaultLocation || 'ZONE-STAGING'
  };
  itemLocation.value = doc.defaultLocation || 'ZONE-STAGING';
  draftItems.value = (doc.items || []).map(it => ({
    ...it,
    locationCode: it.locationCode || doc.defaultLocation || 'ZONE-STAGING'
  }));
  typedInputText.value = '';
  selectedItemObject.value = null;
  matchingSuggestions.value = [];
  isDropdownOpen.value = false;
  isItemUnregistered.value = false;
  itemQty.value = 1;
  itemNote.value = '';

  currentView.value = 'create';
  emit('subpage-change', `Edit Draf (${doc.trxCode})`);
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Cek apakah ada draf editan belum tersimpan di IndexedDB
  await checkForSavedDraft(`to_draft_edit_${doc.id}`);
}

function resetToList() {
  currentView.value = 'list';
  isEditingDoc.value = false;
  editingDocId.value = null;
  selectedDetailDoc.value = null;
  isAdvancedPickerOpen.value = false;
  hasPendingDraft.value = false;
  pendingDraftData.value = null;
  lastDraftSavedTime.value = '';
  emit('subpage-change', '');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function changeDocType(newType) {
  if (isEditingDoc.value) return;
  formHeader.value.type = newType;
  itemLocation.value = newType === 'IN' ? (formHeader.value.defaultLocation || 'ZONE-STAGING') : '';
  formHeader.value.trxCode = await generateAutoTrxCode(newType);
}

// SIMPAN ATAU PERBARUI DOKUMEN TRANSFER ORDER (DRAFT ATAU POSTED)
async function saveEntireDocument(targetStatus = 'POSTED') {
  if (!formHeader.value.noDocument.trim()) {
    alert('Harap masukkan No. Dokumen (Manual)!');
    return;
  }
  if (draftItems.value.length === 0) {
    alert('Tambahkan minimal 1 item ke dalam dokumen!');
    return;
  }

  const isDraft = targetStatus === 'DRAFT';
  const status = isDraft ? 'DRAFT' : 'POSTED';
  const isLocked = !isDraft;

  try {
    const cleanItems = JSON.parse(JSON.stringify(draftItems.value)).map(it => ({
      ...it,
      locationCode: formHeader.value.type === 'IN' ? (it.locationCode || formHeader.value.defaultLocation || 'ZONE-STAGING') : 'ZONE-STAGING'
    }));
    const docPayload = {
      trxCode: String(formHeader.value.trxCode),
      type: String(formHeader.value.type),
      status: status,
      isLocked: isLocked,
      tanggal: String(formHeader.value.tanggal),
      noDocument: String(formHeader.value.noDocument).trim(),
      keterangan: String(formHeader.value.keterangan || '').trim(),
      defaultLocation: formHeader.value.type === 'IN' ? (formHeader.value.defaultLocation || 'ZONE-STAGING') : undefined,
      totalItems: cleanItems.length,
      totalQty: Number(totalDraftQty.value) || 0,
      items: cleanItems
    };

    if (isEditingDoc.value && editingDocId.value) {
      const oldDoc = await db.transactions.get(editingDocId.value);
      if (!oldDoc) {
        throw new Error('Dokumen yang ingin diedit tidak ditemukan di database.');
      }
      if (oldDoc.status !== 'DRAFT' || oldDoc.isLocked) {
        throw new Error(`Dokumen "${oldDoc.trxCode}" sudah berstatus resmi/terposting (${oldDoc.status}) dan TERKUNCI. Dokumen resmi tidak dapat diubah.`);
      }
      await db.transactions.update(editingDocId.value, {
        ...docPayload,
        updatedAt: new Date().toISOString()
      });
    } else {
      await db.transactions.add({
        ...docPayload,
        createdAt: new Date().toISOString()
      });
    }

    // Terapkan alokasi stok masuk/keluar ke item_locations HANYA JIKA BUKAN DRAFT
    if (!isDraft) {
      await applyTransactionStockToLocations(docPayload, false);
    }

    // Hapus draf otomatis dari IndexedDB karena sudah berhasil disimpan permanen / masuk list
    if (currentDraftKey.value) {
      await deleteFormDraft(currentDraftKey.value);
    }
    lastDraftSavedTime.value = '';
    hasPendingDraft.value = false;
    pendingDraftData.value = null;

    resetToList();
    emit('refresh-data');
  } catch (err) {
    alert('Gagal menyimpan dokumen: ' + err.message);
  }
}

// SHORTCUT GLOBAL: CTRL + ENTER UNTUK SIMPAN DOKUMEN
function handleGlobalKeydown(e) {
  if (currentView.value === 'create' && e.ctrlKey && e.key === 'Enter') {
    e.preventDefault();
    saveEntireDocument('POSTED');
  }
}

function openDetailModal(doc) {
  selectedDetailDoc.value = doc;
}

function openEditFromDetail(doc) {
  selectedDetailDoc.value = null;
  openEditPage(doc);
}

async function deleteDoc(doc) {
  if (!isDocEditable(doc)) {
    alert(`Dokumen "${doc.trxCode}" sudah berstatus resmi/terposting dan TERKUNCI.\n\nDokumen resmi tidak dapat dihapus untuk menjaga riwayat mutasi stok.`);
    return;
  }
  if (confirm(`Hapus draf dokumen "${doc.trxCode}" (No Doc: ${doc.noDocument})?`)) {
    try {
      await db.transactions.delete(doc.id);
      emit('refresh-data');
    } catch (err) {
      alert('Gagal menghapus draf dokumen: ' + err.message);
    }
  }
}

function toggleSort(key) {
  if (sortKey.value === key) sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  else { sortKey.value = key; sortOrder.value = 'asc'; }
}

function getSortIcon(key) {
  if (sortKey.value !== key) return ChevronsUpDown;
  return sortOrder.value === 'asc' ? ArrowUp : ArrowDown;
}

function toggleDraftSort(key) {
  if (draftSortKey.value === key) draftSortOrder.value = draftSortOrder.value === 'asc' ? 'desc' : 'asc';
  else { draftSortKey.value = key; draftSortOrder.value = 'asc'; }
}

function getDraftSortIcon(key) {
  if (draftSortKey.value !== key) return ChevronsUpDown;
  return draftSortOrder.value === 'asc' ? ArrowUp : ArrowDown;
}

onMounted(async () => {
  window.addEventListener('keydown', handleGlobalKeydown);
  await loadLocations();
});

defineExpose({
  openCreatePage,
  openEditPage,
  resetToList
});
</script>
