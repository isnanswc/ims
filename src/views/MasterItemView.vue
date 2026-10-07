<template>
  <div class="space-y-5 pb-24 md:pb-6">
    <!-- Top Action Header (Glass Matte) -->
    <div class="glass-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>Master Data Barang</span>
          <span class="text-xs px-2 py-0.5 rounded-full font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700">
            {{ itemsWithStock.length }} SKU Terdaftar
          </span>
        </h1>
        <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Kelola SKU unik, deskripsi barang, satuan, batas Min-Max PPIC, Lead Time supplier, dan pantau level persediaan secara akurat.
        </p>
      </div>
      <div class="flex items-center gap-2 self-start sm:self-auto">
        <button 
          @click="isExportModalOpen = true" 
          class="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-xl font-bold text-xs sm:text-sm border border-zinc-300 dark:border-zinc-700 shadow-xs transition-all cursor-pointer"
          title="Ekspor katalog barang ke file Excel (.xlsx)"
        >
          <Download class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Ekspor Excel</span>
        </button>
        <button 
          @click="openModal()" 
          class="flex items-center justify-center gap-2 px-4 py-2 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 rounded-xl font-bold text-xs sm:text-sm shadow-sm border border-zinc-950 dark:border-white transition-all cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          <span>Tambah Master Item</span>
        </button>
      </div>
    </div>

    <!-- Toolbar: Search, Filters & Quick Stats -->
    <div class="glass-card p-3.5 space-y-3">
      <div class="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
        <!-- Search Input -->
        <div class="sm:col-span-5 relative">
          <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Cari kode unik (SKU), nama barang, keterangan..."
            class="w-full pl-10 pr-4 py-2 glass-input rounded-xl text-xs sm:text-sm"
          />
        </div>

        <!-- Filter Status Leveling PPIC (4 Level) -->
        <div class="sm:col-span-4">
          <select 
            v-model="stockFilter" 
            class="w-full px-3 py-2 glass-input rounded-xl text-xs sm:text-sm font-semibold"
          >
            <option value="ALL">Semua Level Persediaan</option>
            <option value="CRITICAL">🔴 Stok Kritis / Habis</option>
            <option value="REORDER">🟡 Waktunya Reorder (Stok &le; Min)</option>
            <option value="OPTIMAL">🟢 Stok Optimal (Aman)</option>
            <option value="OVERSTOCK">🟣 Overstock (Kelebihan Kapasitas)</option>
          </select>
        </div>

        <!-- Filter Satuan -->
        <div class="sm:col-span-3">
          <select 
            v-model="unitFilter" 
            class="w-full px-3 py-2 glass-input rounded-xl text-xs sm:text-sm font-medium"
          >
            <option value="ALL">Semua Satuan Unit</option>
            <option v-for="u in uniqueUnits" :key="u" :value="u">{{ u }}</option>
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

    <!-- Empty State -->
    <div v-else-if="filteredItems.length === 0" class="glass-card p-12 text-center">
      <div class="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
        <PackageX class="w-6 h-6" />
      </div>
      <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200">Tidak ada barang yang cocok</h3>
      <p class="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau reset filter status.</p>
    </div>

    <!-- Mobile View: Modern Dense & Compact Rows -->
    <div v-else class="space-y-2 md:hidden">
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
            <span class="font-mono text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 shrink-0">
              {{ item.uniqCode }}
            </span>
            <h3 class="font-bold text-slate-900 dark:text-white text-xs truncate">
              {{ item.deskripsi }}
            </h3>
          </div>

          <!-- Badge Level PPIC Minimalis -->
          <span 
            :class="[
              'px-2 py-0.5 rounded-full text-[9.5px] font-bold shrink-0 border inline-flex items-center gap-1',
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

        <!-- Baris 2: Strip Metrik Horizontal (Stok Fisik, Mini Gauge, Min/ROP, Max, Lead Time) -->
        <div class="flex items-center justify-between text-[11px] bg-slate-50/70 dark:bg-slate-800/50 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-800 gap-2">
          <!-- Stok & Mini Gauge -->
          <div class="flex items-center gap-1.5">
            <span class="text-slate-400 text-[10px]">Stok:</span>
            <strong class="text-slate-900 dark:text-white font-mono font-black">{{ item.currentStock }}</strong>
            <span class="text-[10px] text-slate-500">{{ item.satuan }}</span>
            <div class="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shrink-0 ml-0.5">
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

          <!-- Parameter Inventori Kompak -->
          <div class="flex items-center gap-2 text-[10.5px]">
            <span class="text-slate-400">ROP: <strong class="text-slate-700 dark:text-slate-300">{{ item.minStock || 0 }}</strong></span>
            <span class="text-slate-300 dark:text-slate-700">•</span>
            <span class="text-slate-400">LT: <strong class="text-slate-700 dark:text-slate-300 font-mono">{{ item.leadTime || 7 }}h</strong></span>
            <span class="text-slate-300 dark:text-slate-700 hidden xs:inline">•</span>
            <span class="text-slate-400 hidden xs:inline">Max: <strong class="text-slate-700 dark:text-slate-300">{{ item.maxStock || '-' }}</strong></span>
          </div>
        </div>

        <!-- Baris 3: Aksi Kompak Horizontal -->
        <div class="flex items-center justify-between pt-0.5">
          <button 
            @click="openPPICModalForItem(item)"
            class="flex items-center gap-1 px-2 py-1 text-[10.5px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
          >
            <Calculator class="w-3 h-3" />
            <span>Kalkulator PPIC</span>
          </button>

          <div class="flex items-center gap-1">
            <button 
              @click="openModal(item)"
              class="px-2 py-1 text-[10.5px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              title="Edit Item"
            >
              <Pencil class="w-3 h-3 text-slate-500" />
              <span>Edit</span>
            </button>
            <button 
              @click="confirmDelete(item)"
              class="p-1 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
              title="Hapus Item"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Pagination -->
      <Pagination 
        :current-page="currentPage"
        :page-size="pageSize"
        :total-items="filteredItems.length"
        @update:current-page="currentPage = $event"
        @update:page-size="pageSize = $event"
      />
    </div>

    <!-- Desktop View: Glass Table with PPIC Leveling & Column Sorting -->
    <div v-if="!isLoading && filteredItems.length > 0" class="hidden md:block glass-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-slate-100/60 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider select-none">
              <!-- Sortable Uniq Code -->
              <th @click="toggleSort('uniqCode')" class="py-3 px-3.5 cursor-pointer hover:text-emerald-600 transition-colors">
                <div class="flex items-center gap-1">
                  <span>Kode SKU</span>
                  <component :is="getSortIcon('uniqCode')" class="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <!-- Sortable Deskripsi -->
              <th @click="toggleSort('deskripsi')" class="py-3 px-3.5 cursor-pointer hover:text-emerald-600 transition-colors">
                <div class="flex items-center gap-1">
                  <span>Deskripsi Barang</span>
                  <component :is="getSortIcon('deskripsi')" class="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <!-- Satuan -->
              <th class="py-3 px-2.5 text-center">Satuan</th>

              <!-- Min Stock (ROP) -->
              <th @click="toggleSort('minStock')" class="py-3 px-3 text-center cursor-pointer hover:text-emerald-600 transition-colors">
                <div class="flex items-center justify-center gap-1">
                  <span>Min (ROP)</span>
                  <component :is="getSortIcon('minStock')" class="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <!-- Max Stock -->
              <th @click="toggleSort('maxStock')" class="py-3 px-3 text-center cursor-pointer hover:text-emerald-600 transition-colors">
                <div class="flex items-center justify-center gap-1">
                  <span>Maks. Stok</span>
                  <component :is="getSortIcon('maxStock')" class="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <!-- Lead Time -->
              <th class="py-3 px-2.5 text-center">Lead Time</th>

              <!-- Stok Fisik -->
              <th @click="toggleSort('currentStock')" class="py-3 px-3.5 text-right cursor-pointer hover:text-emerald-600 transition-colors">
                <div class="flex items-center justify-end gap-1">
                  <span>Stok Fisik</span>
                  <component :is="getSortIcon('currentStock')" class="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <!-- Status PPIC Gauge (4 Level) -->
              <th class="py-3 px-3.5 text-center">Status Level PPIC</th>

              <th class="py-3 px-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs text-slate-700 dark:text-slate-300">
            <tr 
              v-for="item in paginatedItems" 
              :key="item.uniqCode"
              class="hover:bg-emerald-500/5 dark:hover:bg-slate-800/50 transition-colors"
            >
              <td class="py-3 px-3.5 font-mono font-bold text-slate-900 dark:text-slate-100">
                <span class="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200/80 dark:border-slate-700">
                  {{ item.uniqCode }}
                </span>
              </td>
              <td class="py-3 px-3.5 font-medium text-slate-900 dark:text-white">
                <div>{{ item.deskripsi }}</div>
                <div v-if="item.keterangan" class="text-[10px] text-slate-400 truncate max-w-[200px]">{{ item.keterangan }}</div>
              </td>
              <td class="py-3 px-2.5 text-center">
                <span class="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded text-[11px]">
                  {{ item.satuan }}
                </span>
              </td>
              <td class="py-3 px-3 text-center font-bold text-slate-700 dark:text-slate-300">
                {{ item.minStock || 0 }}
              </td>
              <td class="py-3 px-3 text-center font-bold text-slate-700 dark:text-slate-300">
                {{ item.maxStock || '-' }}
              </td>
              <td class="py-3 px-2.5 text-center text-slate-500 font-mono text-[11px]">
                {{ item.leadTime || 7 }}h
              </td>
              <td class="py-3 px-3.5 text-right font-black text-sm text-slate-900 dark:text-white">
                {{ item.currentStock }} <span class="text-[10px] text-slate-400 font-normal">{{ item.satuan }}</span>
              </td>

              <!-- Status PPIC Level & Mini Gauge Bar -->
              <td class="py-3 px-3.5">
                <div class="space-y-1 w-28 mx-auto">
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
                    <span class="text-[10px] font-mono text-slate-400">{{ item.stockPercent }}%</span>
                  </div>
                  <!-- Mini Visual Gauge Bar -->
                  <div class="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      class="h-full rounded-full transition-all duration-300"
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

              <!-- Kolom Aksi -->
              <td class="py-3 px-3 text-center">
                <div class="flex items-center justify-center gap-1">
                  <!-- Kalkulator PPIC Cepat -->
                  <button 
                    @click="openPPICModalForItem(item)"
                    class="p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors"
                    title="Asisten Kalkulator PPIC Cerdas"
                  >
                    <Calculator class="w-4 h-4" />
                  </button>
                  <button 
                    @click="openModal(item)"
                    class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                    title="Edit Item"
                  >
                    <Pencil class="w-4 h-4" />
                  </button>
                  <button 
                    @click="confirmDelete(item)"
                    class="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                    title="Hapus Item"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Desktop Pagination -->
      <div class="p-3 border-t border-slate-200/60 dark:border-slate-800">
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
    <!-- MODAL FORM TAMBAH / EDIT ITEM (LIGHT ACCENT MODAL)             -->
    <!-- ============================================================== -->
    <div 
      v-if="isModalOpen" 
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/30 dark:bg-black/75 backdrop-blur-md p-0 sm:p-4 transition-all"
    >
      <div 
        class="bg-white dark:bg-slate-900 w-full sm:max-w-xl rounded-t-3xl sm:rounded-3xl shadow-2xl shadow-emerald-500/10 dark:shadow-black/70 border border-slate-200/90 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] ring-1 ring-black/5 dark:ring-white/10"
      >
        <!-- Top Light Gradient Bar -->
        <div class="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500"></div>

        <!-- Modal Header -->
        <div class="px-5 sm:px-6 py-4 bg-gradient-to-b from-emerald-50/70 via-teal-50/20 to-white dark:from-slate-800/80 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/25 shadow-sm">
              <Plus v-if="!isEditing" class="w-5 h-5" />
              <Pencil v-else class="w-4 h-4" />
            </div>
            <div>
              <h2 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {{ isEditing ? 'Edit Master Item' : 'Tambah Master Item Baru' }}
              </h2>
              <p class="text-[11px] text-slate-400">Atur parameter SKU dan batas kendali persediaan gudang.</p>
            </div>
          </div>
          <button 
            @click="closeModal" 
            class="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Form Body -->
        <form @submit.prevent="saveItem" class="bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-4 overflow-y-auto">
          <!-- Uniq Code -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                Uniq Code (SKU / Barcode) *
              </label>
              <button 
                v-if="!isEditing"
                type="button" 
                @click="autoGenerateSkuForForm"
                class="text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 flex items-center gap-1 cursor-pointer transition-colors"
                title="Buat kode SKU unik otomatis berdasarkan nama barang"
              >
                <Zap class="w-3 h-3 text-purple-500" />
                <span>Buat Otomatis (Auto-SKU)</span>
              </button>
            </div>
            <input 
              v-model="formData.uniqCode" 
              :disabled="isEditing"
              placeholder="Contoh: BRG-001 (Bisa kosong untuk auto-generate)"
              class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-xs sm:text-sm font-mono uppercase text-slate-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            />
          </div>

          <!-- Deskripsi -->
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">
              Deskripsi Barang *
            </label>
            <input 
              v-model="formData.deskripsi" 
              required
              placeholder="Nama lengkap barang"
              class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white transition-all"
            />

            <!-- Peringatan Cerdas: Kemiripan Deskripsi yang Pernah Dibuat -->
            <div 
              v-if="similarExistingItem && !isEditing" 
              class="mt-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 text-xs space-y-2 shadow-xs transition-all"
            >
              <div class="flex items-start gap-2">
                <AlertTriangle class="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div class="leading-relaxed">
                  <strong class="font-bold text-amber-900 dark:text-amber-200 block">
                    {{ similarExistingItem.isExact ? 'Peringatan: Deskripsi Pernah Dibuat Sebelumnya!' : 'Perhatian: Ditemukan Item dengan Nama Mirip!' }}
                  </strong>
                  <span class="text-amber-800 dark:text-amber-300 text-[11px] block mt-0.5">
                    Item serupa sudah terdaftar: 
                    <strong>"{{ similarExistingItem.item.deskripsi }}"</strong> 
                    (SKU: <code class="font-mono font-bold bg-amber-200/60 dark:bg-amber-900 px-1 py-0.2 rounded">{{ similarExistingItem.item.uniqCode }}</code>, Stok: {{ similarExistingItem.item.currentStock || 0 }} {{ similarExistingItem.item.satuan }}, Kemiripan: {{ similarExistingItem.percentage }}%)
                  </span>
                </div>
              </div>

              <div class="flex flex-wrap items-center gap-2 pt-0.5 border-t border-amber-200 dark:border-amber-900/60 text-[11px]">
                <button 
                  type="button" 
                  @click="useExistingItem(similarExistingItem.item)"
                  class="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shadow-2xs transition-colors cursor-pointer"
                >
                  Edit / Gunakan Item Eksisting ({{ similarExistingItem.item.uniqCode }})
                </button>
                <span class="text-amber-700/80 dark:text-amber-400 text-[10px]">
                  atau lanjutkan jika item ini memang varian berbeda.
                </span>
              </div>
            </div>
          </div>

          <!-- Satuan & Lead Time Grid -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">
                Satuan (UOM) *
              </label>
              <input 
                v-model="formData.satuan" 
                required
                placeholder="Pcs, Box, Kg, Rim..."
                class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white transition-all"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">
                Lead Time Supplier (Hari)
              </label>
              <input 
                v-model.number="formData.leadTime" 
                type="number"
                inputmode="numeric"
                min="1"
                placeholder="7"
                class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white transition-all"
              />
            </div>
          </div>

          <!-- Section Parameter PPIC (Min Stock, Max Stock, Asisten Hitung) -->
          <div class="p-3.5 bg-slate-50/90 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <ShieldCheck class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Batas Pengendalian Persediaan (PPIC)</span>
              </span>
              <button 
                type="button"
                @click="openPPICCalculatorForForm"
                class="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 text-xs font-bold transition-all shadow-2xs"
                title="Buka Asisten Perhitungan PPIC Cerdas Berdasarkan Histori"
              >
                <Sparkles class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>⚡ Asisten PPIC Cerdas</span>
              </button>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">
                  Batas Min. Stok (ROP) *
                </label>
                <input 
                  v-model.number="formData.minStock" 
                  type="number"
                  inputmode="numeric"
                  min="0"
                  placeholder="5"
                  class="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white font-bold"
                />
                <span class="text-[10px] text-slate-400 block mt-0.5">Titik pesan ulang (Reorder Point).</span>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">
                  Batas Maks. Stok *
                </label>
                <input 
                  v-model.number="formData.maxStock" 
                  type="number"
                  inputmode="numeric"
                  min="0"
                  placeholder="25"
                  class="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white font-bold"
                />
                <span class="text-[10px] text-slate-400 block mt-0.5">Kapasitas aman gudang.</span>
              </div>
            </div>
          </div>

          <!-- Keterangan -->
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">
              Keterangan
            </label>
            <textarea 
              v-model="formData.keterangan" 
              rows="2"
              placeholder="Catatan spesifikasi, lokasi rak gudang..."
              class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white resize-none transition-all"
            ></textarea>
          </div>

          <!-- Opsi Stok Kosong Disengaja (Non-aktifkan Peringatan) -->
          <div class="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-between gap-3">
            <div>
              <span class="block text-xs font-bold text-zinc-900 dark:text-white">Stok Kosong Disengaja</span>
              <span class="block text-[11px] text-zinc-500 dark:text-zinc-400">Non-aktifkan peringatan stok menipis jika item ini sengaja dibiarkan kosong atau discontinue.</span>
            </div>
            <label class="relative inline-flex items-center cursor-pointer shrink-0">
              <input type="checkbox" v-model="formData.allowZeroStock" class="sr-only peer" />
              <div class="w-9 h-5 bg-zinc-200 dark:bg-zinc-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-zinc-950 dark:peer-checked:bg-white"></div>
            </label>
          </div>

          <div v-if="errorMessage" class="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium">
            {{ errorMessage }}
          </div>

          <!-- Action Buttons Footer -->
          <div class="pt-4 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800">
            <button 
              type="button" 
              @click="closeModal" 
              class="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button 
              type="submit" 
              class="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl shadow-md shadow-emerald-600/25 transition-all"
            >
              {{ isEditing ? 'Simpan Perubahan' : 'Simpan Data Barang' }}
            </button>
          </div>
        </form>
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

        <!-- Modal Header -->
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

          <!-- Parameter Simulasi (Lead Time & Siklus Belanja) -->
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

          <!-- Data Riwayat Pengeluaran (Historical Usage) -->
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

          <!-- Hasil Rekomendasi PPIC (Min-Max & Safety Stock) -->
          <div class="space-y-2">
            <span class="font-bold text-[11px] uppercase tracking-wider text-slate-500 block">Hasil Kalkulasi Rekomendasi PPIC:</span>
            <div class="grid grid-cols-3 gap-2.5">
              <!-- Safety Stock -->
              <div class="p-3 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-900/50 text-center">
                <span class="text-[10px] font-bold text-blue-600 dark:text-blue-400 block">Safety Stock (SS)</span>
                <strong class="text-base font-black text-blue-700 dark:text-blue-300">{{ ppicCalcData.safetyStock }}</strong>
                <span class="text-[9px] text-blue-500 block">Stok Pengaman</span>
              </div>

              <!-- Reorder Point / Min Stock -->
              <div class="p-3 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/50 text-center">
                <span class="text-[10px] font-bold text-amber-600 dark:text-amber-400 block">Min. Stok (ROP)</span>
                <strong class="text-base font-black text-amber-700 dark:text-amber-300">{{ ppicCalcData.recommendedRop }}</strong>
                <span class="text-[9px] text-amber-500 block">Batas Titik Pesan</span>
              </div>

              <!-- Max Stock -->
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
                {{ ppicCalcData.suggestedOrderQty > 0 ? `+${ppicCalcData.suggestedOrderQty} ${ppicCalcData.satuan} (Perlu Dipesan)` : 'Stok Mencukupi (Belum Perlu Order)' }}
              </strong>
            </div>
            <p class="text-[10px] text-slate-400">
              * Formula: ROP = (ADU × {{ ppicCalcData.leadTime }}h) + SS ({{ ppicCalcData.safetyStock }}). Max = ROP + (ADU × {{ ppicCalcData.reviewPeriod }}h).
            </p>
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
            @click="applyPRICToForm" 
            class="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
          >
            <CheckCircle2 class="w-3.5 h-3.5" />
            <span>Terapkan Nilai ke Form Master Item</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- MODAL EKSPOR EXCEL MASTER ITEM (MINIMALIS & ELEGAN)            -->
    <!-- ============================================================== -->
    <div 
      v-if="isExportModalOpen" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4"
    >
      <div class="bg-white dark:bg-zinc-950 w-full max-w-lg rounded-2xl sm:rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col">
        <!-- Modal Header -->
        <div class="px-5 sm:px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-bold">
              <Download class="w-4 h-4" />
            </div>
            <div>
              <h3 class="text-sm sm:text-base font-bold text-zinc-950 dark:text-white">Ekspor Katalog Master Item (.xlsx)</h3>
              <p class="text-[11px] text-zinc-400">Unduh data SKU, batas Min-Max PPIC, dan saldo persediaan saat ini.</p>
            </div>
          </div>
          <button 
            @click="isExportModalOpen = false" 
            class="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-5 sm:p-6 space-y-4 text-xs">
          <div class="space-y-1.5">
            <label class="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              Pilih Cakupan Data:
            </label>
            <div class="grid grid-cols-2 gap-2">
              <button 
                type="button"
                @click="exportScope = 'ALL'"
                :class="[
                  'p-3 rounded-xl border text-left transition-all cursor-pointer',
                  exportScope === 'ALL'
                    ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border-zinc-950 dark:border-white shadow-xs'
                    : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'
                ]"
              >
                <strong class="text-xs font-bold block">Seluruh Master Item</strong>
                <span class="text-[10px] opacity-80 block mt-0.5">{{ itemsWithStock.length }} Total SKU Terdaftar</span>
              </button>

              <button 
                type="button"
                @click="exportScope = 'FILTERED'"
                :class="[
                  'p-3 rounded-xl border text-left transition-all cursor-pointer',
                  exportScope === 'FILTERED'
                    ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border-zinc-950 dark:border-white shadow-xs'
                    : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'
                ]"
              >
                <strong class="text-xs font-bold block">Tampilan Filter Aktif</strong>
                <span class="text-[10px] opacity-80 block mt-0.5">{{ filteredItems.length }} SKU Sesuai Filter/Cari</span>
              </button>
            </div>
          </div>

          <!-- Preview Ringkasan -->
          <div class="p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <span class="text-[10px] uppercase font-mono text-zinc-400 block">Pratinjau Hasil Ekspor</span>
              <div class="text-xs font-bold text-zinc-900 dark:text-white mt-0.5">
                <span>{{ exportItemsList.length }} SKU Barang</span>
                <span class="text-zinc-400 font-normal mx-1.5">•</span>
                <span>{{ exportItemsTotalStock }} Total Unit Fisik</span>
              </div>
            </div>
            <div class="w-8 h-8 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <FileSpreadsheet class="w-4 h-4" />
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
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
            @click="downloadItemsExcel"
            :disabled="isExporting || exportItemsList.length === 0"
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
import { ref, computed, watch } from 'vue';
import { db, calculateItemPPICMetrics } from '../database/db';
import Pagination from '../components/Pagination.vue';
import SkeletonLoader from '../components/SkeletonLoader.vue';
import * as XLSX from 'xlsx';
import { 
  createStyledSheet, 
  findSimilarItemByDescription, 
  generateAutoSkuCode 
} from '../utils/excelFormatter';
import { 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  X, 
  PackageX, 
  ArrowUp, 
  ArrowDown, 
  ChevronsUpDown, 
  Calculator, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2,
  Download,
  FileSpreadsheet,
  AlertTriangle,
  Zap,
  RefreshCw
} from 'lucide-vue-next';

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

const emit = defineEmits(['refresh-data']);

const searchQuery = ref('');
const stockFilter = ref('ALL');
const unitFilter = ref('ALL');

// Contextual Export State
const isExportModalOpen = ref(false);
const exportScope = ref('ALL'); // 'ALL' | 'FILTERED'
const isExporting = ref(false);

const exportItemsList = computed(() => {
  if (exportScope.value === 'FILTERED') {
    return filteredItems.value;
  }
  return props.itemsWithStock;
});

const exportItemsTotalStock = computed(() => {
  return exportItemsList.value.reduce((acc, curr) => acc + (Number(curr.currentStock) || 0), 0);
});

function downloadItemsExcel() {
  if (exportItemsList.value.length === 0) {
    alert('Tidak ada item yang dapat diekspor.');
    return;
  }
  isExporting.value = true;
  try {
    const wb = XLSX.utils.book_new();
    const rows = exportItemsList.value.map((item, idx) => {
      let statusLabel = '🟢 Optimal (Aman)';
      const stock = Number(item.currentStock) || 0;
      const min = Number(item.minStock) || 0;
      const max = Number(item.maxStock) || 0;
      if (stock <= 0) statusLabel = '🔴 Kritis (Habis)';
      else if (stock <= min) statusLabel = '🟡 Reorder Point';
      else if (max > 0 && stock > max) statusLabel = '🟣 Overstock';

      return {
        'No': idx + 1,
        'Kode Item (SKU)': item.uniqCode,
        'Deskripsi Barang': item.deskripsi,
        'Satuan': item.satuan,
        'Stok Fisik Saat Ini': stock,
        'Batas Min (ROP)': min,
        'Batas Maks': max,
        'Lead Time Supplier (Hari)': Number(item.leadTime) || 7,
        'Status Level': statusLabel,
        'Keterangan': item.keterangan || '-',
        'Tanggal Registrasi': item.createdAt ? new Date(item.createdAt).toLocaleDateString('id-ID') : '-'
      };
    });

    XLSX.utils.book_append_sheet(wb, createStyledSheet(rows), 'Master_Item_Barang');

    const dateTag = new Date().toISOString().split('T')[0];
    const scopeTag = exportScope.value.toLowerCase();
    XLSX.writeFile(wb, `IMS_Master_Item_${scopeTag}_${dateTag}.xlsx`);
    isExportModalOpen.value = false;
  } catch (err) {
    console.error('Gagal ekspor master item:', err);
    alert('Gagal mengekspor data: ' + err.message);
  } finally {
    isExporting.value = false;
  }
}

const sortKey = ref('uniqCode');
const sortOrder = ref('asc'); // 'asc' | 'desc'

const currentPage = ref(1);
const pageSize = ref(10);

const isModalOpen = ref(false);
const isEditing = ref(false);
const errorMessage = ref('');

// State PPIC Modal
const isPPICModalOpen = ref(false);
const ppicCalcData = ref(null);
const simLeadTime = ref(7);
const simReviewPeriod = ref(14);
const targetItemForPPIC = ref(null);

const formData = ref({
  id: null,
  uniqCode: '',
  deskripsi: '',
  satuan: 'Pcs',
  minStock: 5,
  maxStock: 25,
  leadTime: 7,
  allowZeroStock: false,
  keterangan: ''
});

// Unique Units list for filter
const uniqueUnits = computed(() => {
  const units = props.itemsWithStock.map(i => i.satuan).filter(Boolean);
  return [...new Set(units)];
});

// Filter & Sort Logic
const filteredItems = computed(() => {
  let list = [...props.itemsWithStock];

  // Stock Filter PPIC
  if (stockFilter.value === 'CRITICAL') {
    list = list.filter(i => i.stockLevel === 'CRITICAL');
  } else if (stockFilter.value === 'REORDER') {
    list = list.filter(i => i.stockLevel === 'REORDER' || i.stockLevel === 'CRITICAL');
  } else if (stockFilter.value === 'OPTIMAL') {
    list = list.filter(i => i.stockLevel === 'OPTIMAL');
  } else if (stockFilter.value === 'OVERSTOCK') {
    list = list.filter(i => i.stockLevel === 'OVERSTOCK');
  }

  // Unit Filter
  if (unitFilter.value !== 'ALL') {
    list = list.filter(i => i.satuan === unitFilter.value);
  }

  // Search Filter
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(item => 
      item.uniqCode.toLowerCase().includes(q) ||
      item.deskripsi.toLowerCase().includes(q) ||
      (item.keterangan && item.keterangan.toLowerCase().includes(q))
    );
  }

  // Sorting
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

// Paginated items
const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredItems.value.slice(start, start + pageSize.value);
});

// Reset page when filter changes
watch([searchQuery, stockFilter, unitFilter, pageSize], () => {
  currentPage.value = 1;
});

function toggleSort(key) {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
}

function getSortIcon(key) {
  if (sortKey.value !== key) return ChevronsUpDown;
  return sortOrder.value === 'asc' ? ArrowUp : ArrowDown;
}

function openModal(item = null) {
  errorMessage.value = '';
  if (item) {
    isEditing.value = true;
    formData.value = {
      id: item.id,
      uniqCode: item.uniqCode,
      deskripsi: item.deskripsi,
      satuan: item.satuan,
      minStock: item.minStock || 5,
      maxStock: item.maxStock || 25,
      leadTime: item.leadTime || 7,
      allowZeroStock: Boolean(item.allowZeroStock),
      keterangan: item.keterangan || ''
    };
  } else {
    isEditing.value = false;
    formData.value = {
      id: null,
      uniqCode: '',
      deskripsi: '',
      satuan: 'Pcs',
      minStock: 5,
      maxStock: 25,
      leadTime: 7,
      allowZeroStock: false,
      keterangan: ''
    };
  }
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
}

// Buka Kalkulator PPIC langsung dari form modal tambah/edit
async function openPPICCalculatorForForm() {
  const code = formData.value.uniqCode.trim().toUpperCase();
  if (!code) {
    alert('Harap isi Uniq Code (SKU) terlebih dahulu untuk menganalisis data riwayat mutasi.');
    return;
  }
  targetItemForPPIC.value = { ...formData.value };
  simLeadTime.value = Number(formData.value.leadTime) || 7;
  simReviewPeriod.value = 14;

  ppicCalcData.value = await calculateItemPPICMetrics(code, simLeadTime.value, simReviewPeriod.value);
  isPPICModalOpen.value = true;
}

// Buka Kalkulator PPIC langsung dari tabel baris item
async function openPPICModalForItem(item) {
  targetItemForPPIC.value = item;
  simLeadTime.value = Number(item.leadTime) || 7;
  simReviewPeriod.value = 14;

  ppicCalcData.value = await calculateItemPPICMetrics(item.uniqCode, simLeadTime.value, simReviewPeriod.value);
  isPPICModalOpen.value = true;
}

// Hitung ulang saat user mengubah slider / input parameter simulasi
async function recalculatePPIC() {
  if (!ppicCalcData.value) return;
  ppicCalcData.value = await calculateItemPPICMetrics(
    ppicCalcData.value.uniqCode, 
    simLeadTime.value, 
    simReviewPeriod.value
  );
}

// Terapkan hasil kalkulator ke form / database
async function applyPRICToForm() {
  if (!ppicCalcData.value) return;

  if (isModalOpen.value) {
    formData.value.minStock = ppicCalcData.value.recommendedRop;
    formData.value.maxStock = ppicCalcData.value.recommendedMaxStock;
    formData.value.leadTime = ppicCalcData.value.leadTime;
  } else if (targetItemForPPIC.value?.id) {
    // Terapkan langsung ke database jika dibuka dari tabel baris
    await db.items.update(targetItemForPPIC.value.id, {
      minStock: ppicCalcData.value.recommendedRop,
      maxStock: ppicCalcData.value.recommendedMaxStock,
      leadTime: ppicCalcData.value.leadTime,
      updatedAt: new Date().toISOString()
    });
    emit('refresh-data');
  }

  isPPICModalOpen.value = false;
}

// Deteksi Item Serupa Secara Real-Time saat mengetik deskripsi
const similarExistingItem = computed(() => {
  const desc = formData.value.deskripsi?.trim();
  if (!desc || desc.length < 3) return null;

  // Jika sedang mode edit, jangan bandingkan dengan item dirinya sendiri
  const pool = isEditing.value 
    ? props.itemsWithStock.filter(i => i.id !== formData.value.id && i.uniqCode !== formData.value.uniqCode)
    : props.itemsWithStock;

  return findSimilarItemByDescription(desc, pool, 0.70);
});

// Auto-generate SKU unik untuk form
function autoGenerateSkuForForm() {
  const desc = formData.value.deskripsi?.trim();
  if (!desc) {
    alert('Ketik deskripsi atau nama barang terlebih dahulu untuk menghasilkan SKU otomatis.');
    return;
  }
  const existingCodes = new Set(props.itemsWithStock.map(i => i.uniqCode));
  formData.value.uniqCode = generateAutoSkuCode(desc, existingCodes, props.itemsWithStock.length + 1);
}

// Beralih untuk mengedit / memakai item eksisting yang mirip
function useExistingItem(item) {
  openModal(item);
}

async function saveItem() {
  errorMessage.value = '';
  try {
    const desc = formData.value.deskripsi.trim();
    if (!desc) {
      errorMessage.value = 'Deskripsi barang tidak boleh kosong!';
      return;
    }

    let code = formData.value.uniqCode.trim().toUpperCase();
    // Jika kode SKU kosong saat simpan, otomatis generate SKU unik!
    if (!code) {
      const existingCodes = new Set(props.itemsWithStock.map(i => i.uniqCode));
      code = generateAutoSkuCode(desc, existingCodes, props.itemsWithStock.length + 1);
      formData.value.uniqCode = code;
    }

    // Pengecekan apakah deskripsi pernah dibuat sebelumnya saat menambah item baru
    if (!isEditing.value && similarExistingItem.value) {
      const isExact = similarExistingItem.value.isExact;
      const matched = similarExistingItem.value.item;
      const confirmPrompt = isExact
        ? `⚠️ Peringatan:\nDeskripsi "${matched.deskripsi}" persis sama dengan item yang sudah ada (SKU: ${matched.uniqCode}).\n\nApakah Anda yakin ingin tetap membuat item baru dengan SKU "${code}"?`
        : `⚠️ Perhatian:\nDeskripsi "${desc}" mirip (${similarExistingItem.value.percentage}%) dengan item yang sudah ada:\n"${matched.deskripsi}" (SKU: ${matched.uniqCode}).\n\nApakah Anda yakin ingin tetap membuat item baru dengan SKU "${code}"?`;

      if (!confirm(confirmPrompt)) {
        return;
      }
    }

    if (!isEditing.value) {
      const existing = await db.items.where('uniqCode').equals(code).first();
      if (existing) {
        errorMessage.value = `Uniq Code "${code}" sudah terdaftar. Gunakan kode lain.`;
        return;
      }

      await db.items.add({
        uniqCode: code,
        deskripsi: desc,
        satuan: formData.value.satuan.trim(),
        minStock: Number(formData.value.minStock) || 0,
        maxStock: Number(formData.value.maxStock) || 0,
        leadTime: Number(formData.value.leadTime) || 7,
        allowZeroStock: Boolean(formData.value.allowZeroStock),
        keterangan: formData.value.keterangan.trim(),
        createdAt: new Date().toISOString()
      });
    } else {
      await db.items.update(formData.value.id, {
        deskripsi: desc,
        satuan: formData.value.satuan.trim(),
        minStock: Number(formData.value.minStock) || 0,
        maxStock: Number(formData.value.maxStock) || 0,
        leadTime: Number(formData.value.leadTime) || 7,
        allowZeroStock: Boolean(formData.value.allowZeroStock),
        keterangan: formData.value.keterangan.trim(),
        updatedAt: new Date().toISOString()
      });
    }

    closeModal();
    emit('refresh-data');
  } catch (err) {
    errorMessage.value = 'Terjadi kesalahan: ' + err.message;
  }
}

async function confirmDelete(item) {
  const txCount = await db.transactions.where('uniqCode').equals(item.uniqCode).count();
  if (txCount > 0) {
    alert(`Item "${item.uniqCode}" tidak dapat dihapus karena sudah memiliki transaksi. Hapus riwayat transaksinya terlebih dahulu.`);
    return;
  }

  if (confirm(`Apakah Anda yakin ingin menghapus barang "${item.deskripsi}" (${item.uniqCode})?`)) {
    await db.items.delete(item.id);
    emit('refresh-data');
  }
}
</script>
