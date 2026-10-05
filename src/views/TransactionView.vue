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
            <span class="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {{ transactions.length }} Dokumen
            </span>
          </h1>
          <p class="text-xs text-slate-400">Kelola seluruh arsip Transfer Order (Masuk & Keluar).</p>
        </div>

        <div class="flex items-center gap-2">
          <button 
            @click="openCreatePage('IN')"
            class="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all"
          >
            <ArrowDownLeft class="w-4 h-4" />
            <span>+ Transfer Masuk (IN)</span>
          </button>
          <button 
            @click="openCreatePage('OUT')"
            class="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-semibold text-xs shadow-md shadow-rose-600/20 transition-all"
          >
            <ArrowUpRight class="w-4 h-4" />
            <span>+ Transfer Keluar (OUT)</span>
          </button>
        </div>
      </div>

      <!-- Toolbar: Search, Filters -->
      <div class="glass-card p-3 space-y-2.5">
        <div class="grid grid-cols-1 sm:grid-cols-12 gap-2">
          <div class="sm:col-span-5 relative">
            <Search class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Cari kode TO, no dokumen, keterangan..."
              class="w-full pl-9 pr-3 py-1.5 glass-input rounded-xl text-xs"
            />
          </div>

          <div class="sm:col-span-4 flex items-center bg-slate-100/80 dark:bg-slate-800/80 p-0.5 rounded-xl text-xs font-semibold">
            <button 
              @click="selectedTypeFilter = 'ALL'"
              :class="['flex-1 py-1 rounded-lg transition-all text-center text-xs', selectedTypeFilter === 'ALL' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400']"
            >
              Semua
            </button>
            <button 
              @click="selectedTypeFilter = 'IN'"
              :class="['flex-1 py-1 rounded-lg transition-all text-center text-xs', selectedTypeFilter === 'IN' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400']"
            >
              Masuk (IN)
            </button>
            <button 
              @click="selectedTypeFilter = 'OUT'"
              :class="['flex-1 py-1 rounded-lg transition-all text-center text-xs', selectedTypeFilter === 'OUT' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400']"
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

      <!-- Empty State -->
      <div v-if="filteredTransactions.length === 0" class="glass-card p-10 text-center">
        <div class="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-xl flex items-center justify-center mx-auto mb-2.5">
          <FileText class="w-5 h-5" />
        </div>
        <h3 class="text-xs font-bold text-slate-700 dark:text-slate-200">Tidak ada dokumen Transfer Order</h3>
        <p class="text-[11px] text-slate-400 mt-0.5">Belum ada dokumen yang sesuai filter.</p>
      </div>

      <!-- Mobile Cards -->
      <div v-else class="grid grid-cols-1 gap-2.5 md:hidden">
        <div 
          v-for="doc in paginatedTransactions" 
          :key="doc.id"
          class="glass-card p-3.5 space-y-2.5 hover:border-emerald-500/40 transition-all"
        >
          <div class="flex items-start justify-between gap-2">
            <div>
              <span 
                :class="[
                  'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider',
                  doc.type === 'IN' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                ]"
              >
                {{ doc.type === 'IN' ? 'TO Masuk' : 'TO Keluar' }}
              </span>
              <p class="font-mono text-xs font-bold text-slate-900 dark:text-white mt-1">{{ doc.trxCode }}</p>
            </div>
            <div class="text-right">
              <span class="text-xs font-extrabold text-slate-900 dark:text-white">{{ doc.totalQty || 0 }} Unit</span>
              <p class="text-[10px] text-slate-400">({{ doc.items?.length || 0 }} item)</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2 text-[11px] bg-slate-50/70 dark:bg-slate-800/40 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
            <div>
              <span class="text-slate-400 block text-[9px]">No. Dokumen:</span>
              <span class="font-mono font-semibold text-slate-800 dark:text-slate-200">{{ doc.noDocument || '-' }}</span>
            </div>
            <div>
              <span class="text-slate-400 block text-[9px]">Tanggal:</span>
              <span class="font-medium text-slate-700 dark:text-slate-300">{{ doc.tanggal }}</span>
            </div>
            <div class="col-span-2">
              <span class="text-slate-400 block text-[9px]">Keterangan:</span>
              <span class="text-slate-600 dark:text-slate-400 truncate block">{{ doc.keterangan || '-' }}</span>
            </div>
          </div>

          <div class="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
            <button 
              @click="openDetailModal(doc)"
              class="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 text-[11px]"
            >
              <Eye class="w-3.5 h-3.5" />
              <span>Buka Item</span>
            </button>
            <div class="flex items-center gap-2">
              <button 
                @click="openEditPage(doc)"
                class="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded text-[11px] font-semibold flex items-center gap-1"
                title="Edit Dokumen"
              >
                <Pencil class="w-3 h-3 text-emerald-600" />
                <span>Edit</span>
              </button>
              <button 
                @click="deleteDoc(doc)"
                class="text-rose-500 hover:text-rose-700 p-1"
                title="Hapus Dokumen"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
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
      <div v-if="filteredTransactions.length > 0" class="hidden md:block glass-card overflow-hidden">
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
                  <span 
                    :class="[
                      'px-2 py-0.5 rounded text-[10px] font-bold tracking-wider inline-flex items-center gap-1 uppercase',
                      doc.type === 'IN' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                    ]"
                  >
                    <component :is="doc.type === 'IN' ? ArrowDownLeft : ArrowUpRight" class="w-3 h-3" />
                    {{ doc.type === 'IN' ? 'TO Masuk' : 'TO Keluar' }}
                  </span>
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
                      class="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 rounded text-xs font-semibold flex items-center gap-1"
                      title="Lihat Detail Item"
                    >
                      <Eye class="w-3 h-3" />
                      <span>Buka</span>
                    </button>
                    <button 
                      @click="openEditPage(doc)"
                      class="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded text-xs font-semibold flex items-center gap-1"
                      title="Edit Dokumen Transfer Order"
                    >
                      <Pencil class="w-3 h-3 text-emerald-600" />
                      <span>Edit</span>
                    </button>
                    <button 
                      @click="deleteDoc(doc)"
                      class="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded"
                      title="Hapus Dokumen"
                    >
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
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
      <!-- STICKY HEADER DOKUMEN: STACK DI ATAS SAAT SCROLL (top-10 sm:top-11) -->
      <div class="sticky top-10 sm:top-11 z-30 glass-panel border border-slate-200/80 dark:border-slate-800 p-3 sm:p-3.5 rounded-2xl shadow-lg space-y-2.5">
        <!-- Top Bar: Navigation, Badges, Quick Buttons -->
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center space-x-2">
            <button 
              @click="resetToList()"
              class="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
            </div>
          </div>

          <!-- Tombol Tambah Item & Simpan Dokumen Berada di Header -->
          <div class="flex items-center gap-2">
            <button 
              @click="focusAddItemInput"
              class="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl text-xs font-semibold shadow transition-all"
            >
              <Plus class="w-3.5 h-3.5 text-emerald-400" />
              <span>Tambah Item</span>
            </button>

            <button 
              @click="saveEntireDocument"
              :disabled="draftItems.length === 0"
              :class="[
                'flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white shadow transition-all disabled:opacity-40 disabled:cursor-not-allowed',
                formHeader.type === 'IN' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20' : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
              ]"
              title="Tekan Ctrl+Enter untuk simpan cepat"
            >
              <Save class="w-3.5 h-3.5" />
              <span>{{ isEditingDoc ? 'Perbarui TO' : 'Simpan TO' }} ({{ draftItems.length }})</span>
              <kbd class="hidden sm:inline text-[9px] font-mono px-1 py-0.2 bg-black/20 rounded">Ctrl+Enter</kbd>
            </button>
          </div>
        </div>

        <!-- Compact Input Fields Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-200/50 dark:border-slate-800 text-xs">
          <!-- Tipe Switcher Mini -->
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Tipe TO</label>
            <div class="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 font-semibold text-[11px]">
              <button 
                type="button" 
                @click="changeDocType('IN')"
                :disabled="isEditingDoc"
                :class="['flex-1 py-1 rounded text-center transition-all', formHeader.type === 'IN' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-500']"
              >
                TO Masuk
              </button>
              <button 
                type="button" 
                @click="changeDocType('OUT')"
                :disabled="isEditingDoc"
                :class="['flex-1 py-1 rounded text-center transition-all', formHeader.type === 'OUT' ? 'bg-white dark:bg-slate-700 text-rose-600 shadow-sm' : 'text-slate-500']"
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

          <!-- Keterangan Dokumen -->
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Keterangan Dokumen</label>
            <input 
              v-model="formHeader.keterangan" 
              placeholder="Catatan tujuan/toko/vendor"
              class="w-full px-2.5 py-1 glass-input rounded-lg text-xs"
            />
          </div>
        </div>
      </div>

      <!-- SECTION: SMART AUTOFILL INPUT WITH FLOATING SUGGESTIONS (Z-30 AGAR TIDAK TERTUTUP) -->
      <div 
        ref="addItemSectionRef" 
        class="glass-card p-3 sm:p-3.5 space-y-2.5 border-emerald-500/30 relative z-30"
      >
        <!-- Top Bar: Label & Deskripsi Barang Sejajar di Atas -->
        <div class="flex flex-wrap items-center justify-between gap-1 text-xs">
          <div class="flex items-center space-x-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span class="font-bold text-slate-800 dark:text-slate-200">Input Item Barang:</span>
            <!-- Deskripsi Barang Setara di Bagian Atas -->
            <div v-if="selectedItemObject" class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-500/20 text-[11px]">
              <span class="truncate max-w-[260px] sm:max-w-md">{{ selectedItemObject.deskripsi }} ({{ selectedItemObject.satuan }})</span>
              <span class="font-bold ml-1 text-slate-500 dark:text-slate-400">• Stok: {{ selectedItemObject.currentStock }}</span>
            </div>
            <span v-else class="text-slate-400 text-[11px] italic">
              (Belum ada item terpilih)
            </span>
          </div>

          <!-- Shortcut & Expand Button -->
          <div class="flex items-center space-x-2 text-[11px]">
            <span class="text-slate-400 hidden sm:inline">
              Pilih item: <kbd class="px-1 py-0.2 bg-slate-100 dark:bg-slate-800 rounded border text-[10px] font-mono">↓</kbd> lalu <kbd class="px-1 py-0.2 bg-slate-100 dark:bg-slate-800 rounded border text-[10px] font-mono">Enter</kbd>
            </span>
            <button 
              type="button"
              @click="isAdvancedPickerOpen = true"
              class="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <Maximize2 class="w-3 h-3" />
              <span>Expand Katalog</span>
            </button>
          </div>
        </div>

        <!-- Input Row (Single Clean Horizontal Flow) -->
        <form @submit.prevent="addItemToDraft" class="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
          <!-- Input Kolom Barang (Dengan Floating Dropdown List di Bawahnya) -->
          <div class="sm:col-span-6 relative">
            <div class="relative flex items-center">
              <input 
                ref="smartInputRef"
                v-model="typedInputText" 
                @input="onSmartInputChanged"
                @focus="onSmartInputFocus"
                @blur="onSmartInputBlur"
                @keydown.down.prevent="navigateSuggestions(1)"
                @keydown.up.prevent="navigateSuggestions(-1)"
                @keydown.enter.prevent="handleEnterKeyOnSmartInput"
                placeholder="Ketik kode (misal 'BRG') atau nama..."
                :class="[
                  'w-full pl-2.5 pr-8 py-1.5 rounded-lg text-xs font-mono transition-all',
                  isItemUnregistered
                    ? 'border-2 border-rose-500 bg-rose-50/40 dark:bg-rose-950/30 text-rose-800 dark:text-rose-200 focus:ring-rose-500/20'
                    : 'glass-input'
                ]"
              />

              <button 
                type="button" 
                @click="isAdvancedPickerOpen = true"
                class="absolute right-2 text-slate-400 hover:text-emerald-600"
                title="Buka Pencarian Canggih"
              >
                <Search class="w-3.5 h-3.5" />
              </button>
            </div>

            <!-- Warning jika tidak terdaftar -->
            <div v-if="isItemUnregistered" class="absolute left-0 -bottom-4 flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap z-20">
              <AlertCircle class="w-3 h-3" />
              <span>Item "{{ typedInputText }}" tidak terdaftar di Master Item!</span>
            </div>

            <!-- FLOATING SUGGESTION DROPDOWN LIST (Z-50 & FLOATING DI ATAS TABEL) -->
            <div 
              v-if="isDropdownOpen && matchingSuggestions.length > 0"
              class="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xl max-h-60 overflow-y-auto py-1"
            >
              <div 
                v-for="(candidate, idx) in matchingSuggestions"
                :key="candidate.uniqCode"
                @mousedown.prevent="selectCandidate(candidate)"
                :class="[
                  'px-3 py-2 text-xs flex items-center justify-between cursor-pointer transition-colors border-b border-slate-100/60 dark:border-slate-800/60 last:border-b-0',
                  highlightedIndex === idx 
                    ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold' 
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-300'
                ]"
              >
                <div class="flex items-center gap-2 truncate">
                  <span class="font-mono text-[11px] font-bold bg-slate-200/70 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-800 dark:text-slate-200">
                    {{ candidate.uniqCode }}
                  </span>
                  <span class="truncate font-medium">{{ candidate.deskripsi }}</span>
                </div>
                <span class="text-[10px] text-slate-400 shrink-0 ml-2 font-semibold">
                  Stok: {{ candidate.currentStock }} {{ candidate.satuan }}
                </span>
              </div>
            </div>
          </div>

          <!-- Qty Input (Tab naturally moves here) -->
          <div class="sm:col-span-2">
            <input 
              ref="qtyInputRef"
              v-model.number="itemQty" 
              type="number"
              inputmode="numeric"
              min="1"
              required
              placeholder="Qty"
              class="w-full px-2.5 py-1.5 glass-input rounded-lg text-xs font-bold text-center text-slate-900 dark:text-white"
            />
          </div>

          <!-- Keterangan Item (Tab naturally moves here) -->
          <div class="sm:col-span-3">
            <input 
              ref="noteInputRef"
              v-model="itemNote" 
              placeholder="Catatan baris item..."
              class="w-full px-2.5 py-1.5 glass-input rounded-lg text-xs"
            />
          </div>

          <!-- Tombol Tambah Bersih & Estetik (Single Icon, Tidak Double) -->
          <div class="sm:col-span-1 flex justify-end">
            <button 
              ref="addButtonRef"
              type="submit"
              :disabled="!selectedItemObject"
              class="w-full py-1.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
              title="Tambahkan ke Dokumen"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>Tambah</span>
            </button>
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

          <!-- Search dalam draft items -->
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

        <!-- Tabel Minimalis Profesional -->
        <div class="border border-slate-200/70 dark:border-slate-800 rounded-xl overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
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

                <!-- KOLOM QTY AKTUAL DENGAN KUADRAT PENJUMLAHAN STOK (DI ANTARA KETERANGAN DAN AKSI) -->
                <th class="py-2 px-3 text-center bg-slate-200/40 dark:bg-slate-800/60 font-black">
                  Qty Aktual (Proyeksi)
                </th>

                <th class="py-2 px-3 text-center w-14">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              <tr v-if="filteredDraftItems.length === 0">
                <td colspan="8" class="py-6 text-center text-slate-400 text-xs">
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

        <div class="overflow-y-auto flex-1 p-3.5 sm:p-4 bg-white dark:bg-slate-900">
          <table class="w-full text-left border-collapse text-xs">
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
            <div class="flex items-center gap-2">
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
            <h4 class="font-bold text-[11px] uppercase tracking-wider text-slate-500 mb-2">Daftar Item Barang ({{ selectedDetailDoc.items?.length || 0 }} Item):</h4>
            <div class="border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
              <table class="w-full text-left border-collapse text-xs">
                <thead>
                  <tr class="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800 text-[9px] font-bold text-slate-600 dark:text-slate-300 uppercase">
                    <th class="py-2.5 px-3">No</th>
                    <th class="py-2.5 px-3">Kode Item</th>
                    <th class="py-2.5 px-3">Deskripsi Barang</th>
                    <th class="py-2.5 px-3 text-center">Satuan</th>
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
                    <td class="py-2 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">{{ it.qty }}</td>
                    <td class="py-2 px-3 text-slate-500">{{ it.keterangan || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="px-5 py-3.5 bg-slate-50/80 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button 
            @click="selectedDetailDoc = null"
            class="px-4 py-2 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { db, generateAutoTrxCode } from '../database/db';
import Pagination from '../components/Pagination.vue';
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
  ChevronsUpDown
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

// Create Form State
const formHeader = ref({
  trxCode: '',
  type: 'IN',
  tanggal: new Date().toISOString().split('T')[0],
  noDocument: '',
  keterangan: ''
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
// LOGIKA QTY AKTUAL DENGAN KUADRAT PENJUMLAHAN STOK (RUNNING PROJECTION)
// =========================================================================
function getItemStockProjection(item, currentIndex) {
  const master = props.itemsWithStock.find(m => m.uniqCode === item.uniqCode);
  let baseDbStock = master ? Number(master.currentStock) || 0 : 0;

  // JIKA SEDANG EDIT DOKUMEN:
  // Kurangkan/kembalikan efek dari dokumen yang sedang diedit ini dari baseDbStock,
  // agar kuantitas yang sudah tersimpan di database tidak dihitung ganda!
  if (isEditingDoc.value && editingDocId.value) {
    const existingSavedDoc = props.transactions.find(t => t.id === editingDocId.value);
    if (existingSavedDoc && existingSavedDoc.items) {
      const savedQtyForThisItem = existingSavedDoc.items
        .filter(i => i.uniqCode === item.uniqCode)
        .reduce((sum, curr) => sum + (Number(curr.qty) || 0), 0);

      if (existingSavedDoc.type === 'IN') {
        baseDbStock -= savedQtyForThisItem;
      } else if (existingSavedDoc.type === 'OUT') {
        baseDbStock += savedQtyForThisItem;
      }
    }
  }

  // Hitung akumulasi dari baris-baris SEBELUM currentIndex di tabel draft saat ini:
  let prevAccumulated = 0;
  for (let i = 0; i < currentIndex; i++) {
    const prevItem = draftItems.value[i];
    if (prevItem && prevItem.uniqCode === item.uniqCode) {
      prevAccumulated += Number(prevItem.qty) || 0;
    }
  }

  const currentLineQty = Number(item.qty) || 0;
  const isTypeIn = formHeader.value.type === 'IN';

  let stockBefore = 0;
  let newStock = 0;
  let superscriptText = '';

  if (isTypeIn) {
    stockBefore = baseDbStock + prevAccumulated;
    newStock = stockBefore + currentLineQty;
    superscriptText = `+${stockBefore}=${newStock}`;
  } else {
    stockBefore = baseDbStock - prevAccumulated;
    newStock = stockBefore - currentLineQty;
    superscriptText = `-${stockBefore}=${newStock}`;
  }

  return {
    stockBefore,
    newStock,
    superscriptText
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
  formHeader.value = {
    trxCode: autoCode,
    type: type,
    tanggal: new Date().toISOString().split('T')[0],
    noDocument: prefilledItems.length > 0 ? `PO-PPIC-${new Date().toISOString().split('T')[0].replace(/-/g, '')}` : '',
    keterangan: prefilledItems.length > 0 ? 'Pengadaan berdasarkan Rekomendasi PPIC' : ''
  };
  draftItems.value = prefilledItems.length > 0 ? JSON.parse(JSON.stringify(prefilledItems)) : [];
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
}

// Buka Halaman Edit Dokumen
function openEditPage(doc) {
  isEditingDoc.value = true;
  editingDocId.value = doc.id;
  formHeader.value = {
    trxCode: doc.trxCode,
    type: doc.type,
    tanggal: doc.tanggal,
    noDocument: doc.noDocument || '',
    keterangan: doc.keterangan || ''
  };
  draftItems.value = JSON.parse(JSON.stringify(doc.items || []));
  typedInputText.value = '';
  selectedItemObject.value = null;
  matchingSuggestions.value = [];
  isDropdownOpen.value = false;
  isItemUnregistered.value = false;
  itemQty.value = 1;
  itemNote.value = '';

  currentView.value = 'create';
  emit('subpage-change', `Edit (${doc.trxCode})`);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetToList() {
  currentView.value = 'list';
  isEditingDoc.value = false;
  editingDocId.value = null;
  selectedDetailDoc.value = null;
  isAdvancedPickerOpen.value = false;
  emit('subpage-change', '');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function changeDocType(newType) {
  if (isEditingDoc.value) return;
  formHeader.value.type = newType;
  formHeader.value.trxCode = await generateAutoTrxCode(newType);
}

// SIMPAN ATAU PERBARUI DOKUMEN TRANSFER ORDER
async function saveEntireDocument() {
  if (!formHeader.value.noDocument.trim()) {
    alert('Harap masukkan No. Dokumen (Manual)!');
    return;
  }
  if (draftItems.value.length === 0) {
    alert('Tambahkan minimal 1 item ke dalam dokumen!');
    return;
  }

  try {
    const cleanItems = JSON.parse(JSON.stringify(draftItems.value));
    const docPayload = {
      trxCode: String(formHeader.value.trxCode),
      type: String(formHeader.value.type),
      tanggal: String(formHeader.value.tanggal),
      noDocument: String(formHeader.value.noDocument).trim(),
      keterangan: String(formHeader.value.keterangan || '').trim(),
      totalItems: cleanItems.length,
      totalQty: Number(totalDraftQty.value) || 0,
      items: cleanItems
    };

    if (isEditingDoc.value && editingDocId.value) {
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
    saveEntireDocument();
  }
}

function openDetailModal(doc) {
  selectedDetailDoc.value = doc;
}

async function deleteDoc(doc) {
  if (confirm(`Hapus dokumen "${doc.trxCode}" (No Doc: ${doc.noDocument})?`)) {
    await db.transactions.delete(doc.id);
    emit('refresh-data');
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

defineExpose({
  openCreatePage,
  openEditPage,
  resetToList
});
</script>
