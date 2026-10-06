<template>
  <div class="space-y-5 pb-24 md:pb-6">
    <!-- Top Header Ribbon Banner (Glass Matte Monochrome) -->
    <div class="glass-card p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div>
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center shadow-sm border border-zinc-950 dark:border-white">
            <MapPin class="w-4 h-4" />
          </div>
          <h1 class="text-base sm:text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <span>Manajemen Lokasi & Mutasi Internal</span>
            <span class="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700">
              Bin & Movement
            </span>
          </h1>
        </div>
        <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">
          Visualisasi okupansi rak/bin gudang, kontrol kapasitas maksimal, serta lembar kerja pemindahan barang antar lokasi multi-item dengan pelacakan stok otomatis.
        </p>
      </div>

      <!-- Action Button: Open Movement Worksheet -->
      <div class="flex items-center gap-2">
        <button 
          v-if="activeSubTab !== 'worksheet'"
          @click="openNewWorksheet"
          class="flex items-center gap-2 px-4 py-2 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 rounded-xl text-xs font-bold shadow-sm border border-zinc-950 dark:border-white transition-all"
        >
          <ArrowLeftRight class="w-4 h-4" />
          <span>+ Movement Worksheet</span>
        </button>
      </div>
    </div>

    <!-- Sheet Tabs Navigation (Dashboard, Kelola Lokasi, Movement, Worksheet) -->
    <div class="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl max-w-fit border border-zinc-200 dark:border-zinc-800">
      <button 
        @click="switchSheet('dashboard')"
        :class="[
          'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all',
          activeSubTab === 'dashboard' 
            ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-sm' 
            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
        ]"
      >
        <LayoutDashboard class="w-3.5 h-3.5" />
        <span>Dashboard Okupansi</span>
      </button>

      <button 
        @click="switchSheet('manage')"
        :class="[
          'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all',
          activeSubTab === 'manage' 
            ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-sm' 
            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
        ]"
      >
        <Boxes class="w-3.5 h-3.5" />
        <span>Kelola Lokasi ({{ locationsList.length }})</span>
      </button>

      <button 
        @click="switchSheet('movements')"
        :class="[
          'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all',
          activeSubTab === 'movements' 
            ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-sm' 
            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
        ]"
      >
        <FileText class="w-3.5 h-3.5" />
        <span>Daftar Movement</span>
      </button>

      <button 
        v-if="activeSubTab === 'worksheet'"
        @click="switchSheet('worksheet')"
        class="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-sm border border-zinc-950 dark:border-white"
      >
        <ArrowLeftRight class="w-3.5 h-3.5 text-blue-600 animate-pulse" />
        <span>Movement Worksheet (Aktif)</span>
      </button>
    </div>

    <!-- ============================================================== -->
    <!-- SHEET 1: DASHBOARD OKUPANSI & KAPASITAS LOKASI                 -->
    <!-- ============================================================== -->
    <div v-if="activeSubTab === 'dashboard'" class="space-y-5">
      <!-- 4 Top KPI Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <!-- 1. Total Kapasitas Gudang -->
        <div class="glass-card p-3.5 sm:p-4 border-l-4 border-l-blue-500">
          <span class="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 block">Total Kapasitas Fisik</span>
          <div class="flex items-baseline justify-between mt-1">
            <strong class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{{ totalMaxCapacity }}</strong>
            <span class="text-[10px] text-slate-400 font-mono">Unit Maks</span>
          </div>
          <p class="text-[11px] text-slate-400 mt-1">Akumulasi seluruh rak & bin</p>
        </div>

        <!-- 2. Total Terisi Saat Ini -->
        <div class="glass-card p-3.5 sm:p-4 border-l-4 border-l-emerald-500">
          <span class="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">Total Stok Tersimpan</span>
          <div class="flex items-baseline justify-between mt-1">
            <strong class="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">{{ totalCurrentOccupancy }}</strong>
            <span class="text-[10px] text-slate-400 font-mono">Unit Fisik</span>
          </div>
          <p class="text-[11px] text-slate-400 mt-1">Tersedia: {{ totalAvailableCapacity }} unit ruang</p>
        </div>

        <!-- 3. Utilisasi Keseluruhan -->
        <div class="glass-card p-3.5 sm:p-4 border-l-4 border-l-indigo-500">
          <span class="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 block">Rata-rata Utilisasi</span>
          <div class="flex items-baseline justify-between mt-1">
            <strong class="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400">{{ overallUtilization }}%</strong>
            <span class="text-[10px] text-slate-400 font-mono">Kepadatan</span>
          </div>
          <div class="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              class="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
              :style="{ width: `${overallUtilization}%` }"
            ></div>
          </div>
        </div>

        <!-- 4. Jumlah Area & Movement -->
        <div class="glass-card p-3.5 sm:p-4 border-l-4 border-l-amber-500">
          <span class="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 block">Area & Dokumen</span>
          <div class="flex items-baseline justify-between mt-1">
            <strong class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{{ locationsList.length }} Area</strong>
            <span class="text-[10px] text-slate-400 font-mono">{{ movementsList.length }} Mutasi</span>
          </div>
          <p class="text-[11px] text-slate-400 mt-1">Status gudang optimal</p>
        </div>
      </div>

      <!-- Smart Early Warnings & Automation Hub -->
      <div 
        v-if="earlyWarnings.totalWarnings > 0"
        class="glass-card p-4 border border-zinc-300 dark:border-zinc-700 space-y-3"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-bold text-xs shadow-xs">
              <AlertTriangle class="w-4 h-4 text-amber-500 animate-pulse" />
            </div>
            <div>
              <h3 class="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <span>Pusat Peringatan & Deteksi Dini Operasional Gudang</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  {{ earlyWarnings.totalWarnings }} Perhatian
                </span>
              </h3>
              <p class="text-[11px] text-zinc-500 dark:text-zinc-400">
                Sistem mendeteksi potensi hambatan operasional, penumpukan staging, atau beban kapasitas berlebih.
              </p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
          <!-- Warning 1: Overcapacity -->
          <div 
            v-if="earlyWarnings.overcapacityLocations.length > 0"
            class="p-2.5 rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50/70 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200 text-xs flex flex-col justify-between"
          >
            <div>
              <span class="font-bold block flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
                <AlertTriangle class="w-3.5 h-3.5" />
                Over-Kapasitas ({{ earlyWarnings.overcapacityLocations.length }} Rak)
              </span>
              <p class="text-[11px] text-rose-800/80 dark:text-rose-300/80 mt-1">
                Rak: {{ earlyWarnings.overcapacityLocations.map(l => l.code).join(', ') }} melebihi daya tampung fisik!
              </p>
            </div>
            <button 
              @click="openNewWorksheet"
              class="mt-2 text-[10px] font-bold px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg self-start transition-colors"
            >
              Relokasi Stok Rak Ini &rarr;
            </button>
          </div>

          <!-- Warning 2: Staging Backlog (Barang menumpuk di Staging Area) -->
          <div 
            v-if="earlyWarnings.stagingItems.length > 0"
            class="p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100/70 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 text-xs flex flex-col justify-between"
          >
            <div>
              <span class="font-bold block flex items-center gap-1.5 text-zinc-900 dark:text-zinc-100">
                <Boxes class="w-3.5 h-3.5 text-blue-500" />
                Staging Area Backlog ({{ earlyWarnings.stagingItems.length }} SKU)
              </span>
              <p class="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                Barang baru masuk belum dialokasikan ke rak penyimpanan tetap (Putaway tertunda).
              </p>
            </div>
            <button 
              @click="quickPutawayFromStaging"
              class="mt-2 text-[10px] font-bold px-2.5 py-1 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-950 rounded-lg self-start transition-colors flex items-center gap-1"
            >
              <span>🚀 Putaway Otomatis ke Rak Kosong</span>
            </button>
          </div>

          <!-- Warning 3: Near Capacity (>=85%) -->
          <div 
            v-if="earlyWarnings.nearCapacityLocations.length > 0"
            class="p-2.5 rounded-xl border border-amber-300 dark:border-amber-800/80 bg-amber-50/70 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 text-xs flex flex-col justify-between"
          >
            <div>
              <span class="font-bold block flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                <AlertTriangle class="w-3.5 h-3.5" />
                Kapasitas Kritis &ge;85% ({{ earlyWarnings.nearCapacityLocations.length }} Rak)
              </span>
              <p class="text-[11px] text-amber-800/80 dark:text-amber-300/80 mt-1">
                Rak: {{ earlyWarnings.nearCapacityLocations.map(l => l.code).join(', ') }} hampir penuh.
              </p>
            </div>
            <span class="text-[10px] text-amber-600 dark:text-amber-400 mt-2 font-mono">Disarankan kontrol mutasi</span>
          </div>
        </div>
      </div>

      <!-- Grid Visualisasi Rak Gudang (Occupancy Gauge Cards) -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Boxes class="w-4 h-4 text-blue-600" />
            <span>Tata Letak Rak & Beban Kapasitas</span>
          </h2>
          <span class="text-xs text-slate-400">Klik area untuk melihat daftar SKU di dalamnya</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          <div 
            v-for="loc in locationsList" 
            :key="loc.code"
            @click="openLocationDetailModal(loc)"
            class="glass-card p-4 cursor-pointer hover:shadow-md transition-all group border hover:border-blue-400/50"
          >
            <!-- Card Header: Code & Type -->
            <div class="flex items-start justify-between gap-2">
              <div>
                <span class="font-mono font-black text-xs px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {{ loc.code }}
                </span>
                <h3 class="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-1 group-hover:text-blue-600 transition-colors">
                  {{ loc.name }}
                </h3>
              </div>
              <span :class="['text-[10px] font-bold px-2 py-0.5 rounded-full border', loc.statusColor]">
                {{ loc.statusLabel }}
              </span>
            </div>

            <!-- Tipe Area -->
            <p class="text-[11px] text-slate-400 mt-0.5">{{ loc.type }} • {{ loc.keterangan || 'Tanpa catatan' }}</p>

            <!-- Gauge Progress Bar -->
            <div class="mt-3 space-y-1">
              <div class="flex items-center justify-between text-xs">
                <span class="text-slate-500 font-medium">Beban Terisi:</span>
                <span class="font-bold text-slate-800 dark:text-slate-200">
                  {{ loc.currentQty }} / {{ loc.maxCapacity }} unit ({{ loc.occupancyPercent }}%)
                </span>
              </div>
              <div class="w-full bg-slate-200/80 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div 
                  :class="[
                    'h-full rounded-full transition-all duration-500',
                    loc.occupancyPercent >= 90 ? 'bg-rose-500' :
                    loc.occupancyPercent >= 75 ? 'bg-amber-500' : 'bg-emerald-500'
                  ]"
                  :style="{ width: `${loc.occupancyPercent}%` }"
                ></div>
              </div>
              <div class="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                <span>{{ loc.items.length }} SKU tersimpan</span>
                <span>Sisa Ruang: {{ loc.availableCapacity }} unit</span>
              </div>
            </div>

            <!-- Preview 2 Item Teratas -->
            <div v-if="loc.items.length > 0" class="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 space-y-1">
              <div 
                v-for="item in loc.items.slice(0, 2)" 
                :key="item.itemCode"
                class="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400"
              >
                <span class="truncate max-w-[170px]">{{ item.deskripsi }}</span>
                <span class="font-mono font-bold text-slate-800 dark:text-slate-200">{{ item.qty }} {{ item.satuan }}</span>
              </div>
              <p v-if="loc.items.length > 2" class="text-[10px] text-blue-600 dark:text-blue-400 font-semibold pt-0.5">
                +{{ loc.items.length - 2 }} item lainnya...
              </p>
            </div>
            <div v-else class="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400 italic">
              Area saat ini kosong (siap digunakan)
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Movements Activity Section -->
      <div class="glass-card p-4 sm:p-5">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History class="w-4 h-4 text-blue-600" />
            <span>Perpindahan Stok Terakhir (Recent Movement)</span>
          </h2>
          <button @click="switchSheet('movements')" class="text-xs text-blue-600 hover:underline font-semibold">
            Lihat Semua Mutasi &rarr;
          </button>
        </div>

        <div v-if="movementsList.length === 0" class="py-6 text-center text-xs text-slate-400">
          Belum ada riwayat dokumen pemindahan.
        </div>
        <div v-else class="divide-y divide-slate-100 dark:divide-slate-800">
          <div 
            v-for="mov in movementsList.slice(0, 4)" 
            :key="mov.id"
            class="py-3 flex items-center justify-between gap-3 text-xs"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div :class="[
                'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white font-bold',
                mov.status === 'APPROVED' ? 'bg-emerald-500' : 'bg-amber-500'
              ]">
                <Check v-if="mov.status === 'APPROVED'" class="w-4 h-4" />
                <Clock v-else class="w-4 h-4" />
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <span class="font-mono font-bold text-slate-900 dark:text-white">{{ mov.docNo }}</span>
                  <span :class="[
                    'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                    mov.status === 'APPROVED' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400' 
                      : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400'
                  ]">
                    {{ mov.status === 'APPROVED' ? 'Disetujui' : 'Draft' }}
                  </span>
                </div>
                <p class="text-[11px] text-slate-400 truncate mt-0.5">
                  {{ mov.operator }} • {{ mov.keterangan || 'Pemindahan stok internal' }}
                </p>
              </div>
            </div>

            <div class="text-right shrink-0">
              <span class="font-bold text-slate-900 dark:text-white block">{{ mov.totalQty }} Unit</span>
              <span class="text-[10px] text-slate-400 font-mono">{{ mov.tanggal }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- SHEET 2: KELOLA LOKASI & KAPASITAS                             -->
    <!-- ============================================================== -->
    <div v-else-if="activeSubTab === 'manage'" class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <!-- Search Area -->
        <div class="relative max-w-sm w-full">
          <Search class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            v-model="locationSearch" 
            type="text" 
            placeholder="Cari kode area, nama, tipe..." 
            class="w-full pl-8 pr-3 py-1.5 glass-input rounded-xl text-xs"
          />
        </div>

        <!-- Tombol Tambah Lokasi Baru -->
        <button 
          @click="openCreateLocationModal"
          class="flex items-center gap-2 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all self-start sm:self-auto"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>Tambah Lokasi / Rak Baru</span>
        </button>
      </div>

      <!-- Tabel Kelola Lokasi -->
      <div class="glass-card overflow-hidden border border-slate-200/80 dark:border-slate-800">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-slate-100/70 dark:bg-slate-800/70 border-b border-slate-200/80 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase select-none">
                <th class="py-2.5 px-3">Kode Lokasi</th>
                <th class="py-2.5 px-3">Nama Area / Deskripsi</th>
                <th class="py-2.5 px-3">Kategori</th>
                <th class="py-2.5 px-3 text-right">Kapasitas Maksimal</th>
                <th class="py-2.5 px-3 text-right">Terisi Saat Ini</th>
                <th class="py-2.5 px-3 w-40 text-center">Beban Okupansi</th>
                <th class="py-2.5 px-3 text-center">Status</th>
                <th class="py-2.5 px-3 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              <tr v-if="filteredLocations.length === 0">
                <td colspan="8" class="py-8 text-center text-slate-400 text-xs">
                  Tidak ada area/lokasi yang sesuai pencarian.
                </td>
              </tr>
              <tr 
                v-for="loc in filteredLocations" 
                :key="loc.code"
                class="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
              >
                <!-- Kode -->
                <td class="py-2.5 px-3">
                  <span class="font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 px-2 py-0.5 rounded border border-slate-200/60 dark:border-slate-700">
                    {{ loc.code }}
                  </span>
                </td>

                <!-- Nama -->
                <td class="py-2.5 px-3">
                  <strong class="font-semibold text-slate-900 dark:text-white block">{{ loc.name }}</strong>
                  <span class="text-[10px] text-slate-400">{{ loc.keterangan || '-' }}</span>
                </td>

                <!-- Tipe -->
                <td class="py-2.5 px-3">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700">
                    {{ loc.type }}
                  </span>
                </td>

                <!-- Kapasitas Maks -->
                <td class="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                  {{ loc.maxCapacity }} unit
                </td>

                <!-- Terisi -->
                <td class="py-2.5 px-3 text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                  {{ loc.currentQty }} unit
                </td>

                <!-- Beban Gauge -->
                <td class="py-2.5 px-3">
                  <div class="space-y-1">
                    <div class="flex items-center justify-between text-[10px]">
                      <span class="font-semibold">{{ loc.occupancyPercent }}%</span>
                      <span class="text-slate-400">Sisa: {{ loc.availableCapacity }}</span>
                    </div>
                    <div class="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div 
                        :class="[
                          'h-full rounded-full',
                          loc.occupancyPercent >= 90 ? 'bg-rose-500' :
                          loc.occupancyPercent >= 75 ? 'bg-amber-500' : 'bg-emerald-500'
                        ]"
                        :style="{ width: `${loc.occupancyPercent}%` }"
                      ></div>
                    </div>
                  </div>
                </td>

                <!-- Status Badge -->
                <td class="py-2.5 px-3 text-center">
                  <span :class="['text-[10px] font-bold px-2 py-0.5 rounded-full border', loc.statusColor]">
                    {{ loc.statusLabel }}
                  </span>
                </td>

                <!-- Aksi -->
                <td class="py-2.5 px-3 text-center">
                  <div class="flex items-center justify-center gap-1">
                    <button 
                      @click="openLocationDetailModal(loc)"
                      title="Lihat Item di Lokasi Ini"
                      class="p-1 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                    >
                      <Eye class="w-3.5 h-3.5" />
                    </button>
                    <button 
                      @click="openEditLocationModal(loc)"
                      title="Edit Lokasi & Kapasitas"
                      class="p-1 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                    >
                      <Pencil class="w-3.5 h-3.5" />
                    </button>
                    <button 
                      @click="deleteLocation(loc)"
                      title="Hapus Lokasi"
                      class="p-1 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- SHEET 3: LIST DOKUMEN MOVEMENT                                 -->
    <!-- ============================================================== -->
    <div v-else-if="activeSubTab === 'movements'" class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <!-- Search & Status Filter -->
        <div class="flex flex-wrap items-center gap-2">
          <div class="relative min-w-[200px] sm:min-w-[240px]">
            <Search class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              v-model="movementSearch" 
              type="text" 
              placeholder="Cari no doc, operator, keterangan..." 
              class="w-full pl-8 pr-3 py-1.5 glass-input rounded-xl text-xs"
            />
          </div>

          <div class="flex items-center gap-1 p-0.5 bg-slate-200/60 dark:bg-slate-800 rounded-lg text-xs font-semibold">
            <button 
              @click="movementStatusFilter = 'ALL'"
              :class="['px-2.5 py-1 rounded-md transition-all', movementStatusFilter === 'ALL' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' : 'text-slate-500']"
            >
              Semua
            </button>
            <button 
              @click="movementStatusFilter = 'DRAFT'"
              :class="['px-2.5 py-1 rounded-md transition-all', movementStatusFilter === 'DRAFT' ? 'bg-white dark:bg-slate-900 text-amber-600 shadow-xs' : 'text-slate-500']"
            >
              Draft
            </button>
            <button 
              @click="movementStatusFilter = 'APPROVED'"
              :class="['px-2.5 py-1 rounded-md transition-all', movementStatusFilter === 'APPROVED' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-xs' : 'text-slate-500']"
            >
              Disetujui
            </button>
          </div>
        </div>

        <!-- Tombol Buat Lembar Kerja Baru -->
        <button 
          @click="openNewWorksheet"
          class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all self-start sm:self-auto"
        >
          <ArrowLeftRight class="w-4 h-4" />
          <span>+ Buat Movement Worksheet</span>
        </button>
      </div>

      <!-- Tabel Dokumen Movement -->
      <div class="glass-card overflow-hidden border border-slate-200/80 dark:border-slate-800">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-slate-100/70 dark:bg-slate-800/70 border-b border-slate-200/80 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase select-none">
                <th class="py-2.5 px-3">No. Dokumen</th>
                <th class="py-2.5 px-3">Tanggal</th>
                <th class="py-2.5 px-3">Operator / PIC</th>
                <th class="py-2.5 px-3 text-center">Total Item</th>
                <th class="py-2.5 px-3 text-right">Total Qty Pindah</th>
                <th class="py-2.5 px-3">Status</th>
                <th class="py-2.5 px-3">Catatan</th>
                <th class="py-2.5 px-3 text-center w-36">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              <tr v-if="filteredMovements.length === 0">
                <td colspan="8" class="py-8 text-center text-slate-400 text-xs">
                  Tidak ada dokumen perpindahan yang cocok.
                </td>
              </tr>
              <tr 
                v-for="mov in filteredMovements" 
                :key="mov.id"
                class="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
              >
                <!-- No Doc -->
                <td class="py-2.5 px-3">
                  <span class="font-mono font-bold text-slate-900 dark:text-white">
                    {{ mov.docNo }}
                  </span>
                </td>

                <!-- Tanggal -->
                <td class="py-2.5 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                  {{ mov.tanggal }}
                </td>

                <!-- Operator -->
                <td class="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">
                  {{ mov.operator || '-' }}
                </td>

                <!-- Total Lines -->
                <td class="py-2.5 px-3 text-center font-bold">
                  {{ mov.totalItems }} SKU
                </td>

                <!-- Total Qty -->
                <td class="py-2.5 px-3 text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                  {{ mov.totalQty }} unit
                </td>

                <!-- Status Badge -->
                <td class="py-2.5 px-3">
                  <span :class="[
                    'inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border',
                    mov.status === 'APPROVED' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400' 
                      : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400'
                  ]">
                    <Check v-if="mov.status === 'APPROVED'" class="w-3 h-3 text-emerald-600" />
                    <Clock v-else class="w-3 h-3 text-amber-600" />
                    <span>{{ mov.status === 'APPROVED' ? 'Disetujui' : 'Draft' }}</span>
                  </span>
                </td>

                <!-- Catatan -->
                <td class="py-2.5 px-3 text-[11px] text-slate-500 max-w-xs truncate">
                  {{ mov.keterangan || '-' }}
                </td>

                <!-- Aksi -->
                <td class="py-2.5 px-3 text-center">
                  <div class="flex items-center justify-center gap-1.5">
                    <!-- Detail View -->
                    <button 
                      @click="openMovementDetailModal(mov)"
                      title="Lihat Detail Perpindahan"
                      class="px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors"
                    >
                      Detail
                    </button>

                    <!-- Approve Action (Jika masih Draft) -->
                    <button 
                      v-if="mov.status === 'DRAFT'"
                      @click="approveMovementDoc(mov)"
                      title="Setujui dan Eksekusi Pindah Stok Sekarang"
                      class="px-2 py-1 rounded-lg text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm transition-all flex items-center gap-1"
                    >
                      <Check class="w-3 h-3" />
                      <span>Setujui</span>
                    </button>

                    <!-- Edit (Jika masih Draft) -->
                    <button 
                      v-if="mov.status === 'DRAFT'"
                      @click="editDraftMovement(mov)"
                      title="Edit Dokumen Draft"
                      class="p-1 rounded-lg text-slate-500 hover:text-amber-600"
                    >
                      <Pencil class="w-3.5 h-3.5" />
                    </button>

                    <!-- Lock Badge (Jika Approved) -->
                    <span 
                      v-else
                      title="Dokumen telah disetujui & terkunci secara permanen"
                      class="p-1 text-slate-400 inline-flex items-center"
                    >
                      <Lock class="w-3.5 h-3.5 text-slate-400" />
                    </span>

                    <!-- Delete (Hanya Draft) -->
                    <button 
                      v-if="mov.status === 'DRAFT'"
                      @click="deleteDraftMovement(mov)"
                      title="Hapus Dokumen Draft"
                      class="p-1 rounded-lg text-slate-500 hover:text-rose-600"
                    >
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- SHEET 4: MOVEMENT WORKSHEET (LEMBAR KERJA MUTASI MULTI-ITEM)   -->
    <!-- ============================================================== -->
    <div v-else-if="activeSubTab === 'worksheet'" class="space-y-5">
      <!-- Worksheet Header Form Card -->
      <div class="glass-card p-4 sm:p-5 space-y-4 border-l-4 border-l-blue-600">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-blue-500/15 text-blue-600 flex items-center justify-center font-bold">
              <ArrowLeftRight class="w-4 h-4" />
            </div>
            <div>
              <h2 class="text-sm font-bold text-slate-900 dark:text-white">
                {{ editingMovementId ? 'Edit Movement Worksheet' : 'Lembar Kerja Pemindahan Barang (Movement Worksheet)' }}
              </h2>
              <p class="text-[11px] text-slate-400">Pindahkan item dari satu lokasi ke lokasi lain secara spesifik.</p>
            </div>
          </div>
          <button 
            @click="switchSheet('movements')"
            class="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white px-2.5 py-1 rounded-lg border hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            &larr; Kembali ke List
          </button>
        </div>

        <!-- Document Meta Inputs -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">No. Dokumen Movement</label>
            <input 
              v-model="worksheetHeader.docNo" 
              type="text" 
              readonly
              class="w-full px-3 py-1.5 glass-input rounded-xl font-mono font-bold bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300"
            />
          </div>

          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Pemindahan</label>
            <input 
              v-model="worksheetHeader.tanggal" 
              type="date" 
              class="w-full px-3 py-1.5 glass-input rounded-xl"
            />
          </div>

          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Operator / Penanggung Jawab</label>
            <input 
              v-model="worksheetHeader.operator" 
              type="text" 
              placeholder="Nama staf gudang..." 
              class="w-full px-3 py-1.5 glass-input rounded-xl"
            />
          </div>

          <div class="sm:col-span-3">
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Keterangan / Alasan Pemindahan</label>
            <input 
              v-model="worksheetHeader.keterangan" 
              type="text" 
              placeholder="Contoh: Relokasi stok ke rak picking depan, penataan kapasitas..." 
              class="w-full px-3 py-1.5 glass-input rounded-xl"
            />
          </div>
        </div>
      </div>

      <!-- Section Input Baris Item Baru dengan Smart Search & Deteksi Lokasi Asal -->
      <div class="glass-card p-4 sm:p-5 space-y-4">
        <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Plus class="w-3.5 h-3.5 text-blue-600" />
          <span>Tambah Item ke Lembar Kerja</span>
        </h3>

        <!-- Smart Search SKU / Nama Barang -->
        <div class="relative">
          <label class="block font-semibold text-xs text-slate-700 dark:text-slate-300 mb-1">
            Cari Barang (Smart Search)
          </label>
          <div class="relative">
            <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              ref="smartSearchInputRef"
              v-model="typedItemSearch" 
              @focus="isSmartDropdownOpen = true"
              type="text" 
              placeholder="Ketik kode SKU (misal: BRG-001) atau nama barang..." 
              class="w-full pl-9 pr-3 py-2 glass-input rounded-xl text-xs font-medium"
            />
          </div>

          <!-- Dropdown Smart Suggestions -->
          <div 
            v-if="isSmartDropdownOpen && matchingItemSuggestions.length > 0"
            class="absolute z-30 left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800"
          >
            <div 
              v-for="item in matchingItemSuggestions" 
              :key="item.uniqCode"
              @mousedown="selectItemForMovement(item)"
              class="p-2.5 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer flex items-center justify-between text-xs transition-colors"
            >
              <div class="min-w-0">
                <span class="font-mono font-bold text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300 mr-1.5">
                  {{ item.uniqCode }}
                </span>
                <span class="font-semibold text-slate-800 dark:text-slate-200">{{ item.deskripsi }}</span>
              </div>
              <div class="text-right shrink-0 ml-3">
                <span class="text-[11px] font-bold text-slate-900 dark:text-white">
                  Stok Total: {{ item.currentStock }} {{ item.satuan }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Banner Deteksi Lokasi Fisik Barang Terpilih -->
        <div 
          v-if="selectedItemObj" 
          class="p-3.5 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-200/80 dark:border-blue-900/60 space-y-2"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="font-mono font-bold text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                {{ selectedItemObj.uniqCode }}
              </span>
              <strong class="text-xs sm:text-sm text-slate-900 dark:text-white">{{ selectedItemObj.deskripsi }}</strong>
              <span class="text-xs text-slate-500">({{ selectedItemObj.satuan }})</span>
            </div>
            <button @click="clearSelectedItem" class="text-xs text-slate-400 hover:text-slate-600">
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Visual Deteksi Lokasi Item -->
          <div class="pt-1">
            <span class="text-[11px] font-bold text-blue-900 dark:text-blue-300 block mb-1">
              📍 Terdeteksi Tersimpan di Lokasi Berikut:
            </span>
            <div v-if="selectedItemLocations.length === 0" class="text-xs text-rose-600 font-semibold">
              Item ini belum teralokasi di rak mana pun (Stok fisik 0).
            </div>
            <div v-else class="flex flex-wrap gap-2">
              <div 
                v-for="loc in selectedItemLocations" 
                :key="loc.locationCode"
                @click="draftFromLocation = loc.locationCode"
                :class="[
                  'px-3 py-1.5 rounded-lg border text-xs cursor-pointer transition-all flex items-center gap-2',
                  draftFromLocation === loc.locationCode 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                ]"
              >
                <span class="font-mono font-bold">{{ loc.locationCode }}</span>
                <span class="text-[11px] opacity-90">{{ loc.locationName }}</span>
                <span class="font-black px-1.5 py-0.2 rounded bg-black/10 dark:bg-white/10 text-[10px]">
                  {{ loc.qty }} {{ selectedItemObj.satuan }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Form Pemilihan From, To, Qty, dan Indikator Kapasitas Maksimal -->
        <div v-if="selectedItemObj && selectedItemLocations.length > 0" class="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs pt-1">
          <!-- From Location -->
          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Dari Lokasi Asal (From)
            </label>
            <select 
              v-model="draftFromLocation"
              class="w-full px-3 py-2 glass-input rounded-xl font-medium"
            >
              <option value="" disabled>Pilih lokasi asal...</option>
              <option 
                v-for="loc in selectedItemLocations" 
                :key="loc.locationCode" 
                :value="loc.locationCode"
              >
                {{ loc.locationCode }} (Tersisa: {{ getAvailableInLocation(loc.locationCode) }} {{ selectedItemObj.satuan }})
              </option>
            </select>
            <span v-if="selectedFromLocInfo" class="text-[10px] text-slate-400 mt-0.5 block">
              Maksimum bisa dipindah saat ini: <strong>{{ availableToMove }} {{ selectedItemObj.satuan }}</strong>
            </span>
          </div>

          <!-- To Location -->
          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Ke Lokasi Tujuan (To)
            </label>
            <select 
              v-model="draftToLocation"
              class="w-full px-3 py-2 glass-input rounded-xl font-medium"
            >
              <option value="" disabled>Pilih lokasi tujuan...</option>
              <option 
                v-for="loc in destinationLocations" 
                :key="loc.code" 
                :value="loc.code"
              >
                {{ loc.code }} - {{ loc.name }} (Sisa: {{ loc.availableCapacity }})
              </option>
            </select>
            <span v-if="selectedToLocInfo" class="text-[10px] text-slate-400 mt-0.5 block">
              Kapasitas: {{ selectedToLocInfo.currentQty }}/{{ selectedToLocInfo.maxCapacity }} unit
            </span>
          </div>

          <!-- Qty Pindah -->
          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Qty Dipindahkan
            </label>
            <input 
              v-model.number="draftMoveQty" 
              type="number" 
              min="1" 
              :max="availableToMove || 999"
              class="w-full px-3 py-2 glass-input rounded-xl font-bold font-mono text-blue-600"
            />
            <span v-if="selectedItemObj" class="text-[10px] text-slate-400 mt-0.5 block">
              Satuan: {{ selectedItemObj.satuan }}
            </span>
          </div>

          <!-- Tombol Tambah ke Tabel -->
          <div class="flex items-end">
            <button 
              @click="addItemRowToWorksheet"
              class="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-1.5"
            >
              <Plus class="w-4 h-4" />
              <span>+ Tambah Baris</span>
            </button>
          </div>
        </div>

        <!-- Live Indikator Kapasitas Maksimal Lokasi Tujuan -->
        <div 
          v-if="selectedToLocInfo && draftMoveQty > 0"
          :class="[
            'p-3 rounded-xl border text-xs transition-all space-y-1',
            isToOverCapacity 
              ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-300 text-rose-800 dark:text-rose-300' 
              : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 text-emerald-800 dark:text-emerald-300'
          ]"
        >
          <div class="flex items-center justify-between font-bold">
            <span class="flex items-center gap-1.5">
              <AlertTriangle v-if="isToOverCapacity" class="w-4 h-4 text-rose-600 animate-bounce" />
              <CheckCircle2 v-else class="w-4 h-4 text-emerald-600" />
              <span>
                {{ isToOverCapacity ? 'Peringatan: Melebihi Kapasitas Maksimal Lokasi Tujuan!' : 'Proyeksi Kapasitas Lokasi Tujuan Aman' }}
              </span>
            </span>
            <span class="font-mono">
              Proyeksi: {{ projectedToQty }} / {{ selectedToLocInfo.maxCapacity }} unit ({{ projectedToPercent }}%)
            </span>
          </div>
          <p class="text-[11px] opacity-90">
            Lokasi <strong>{{ selectedToLocInfo.code }} ({{ selectedToLocInfo.name }})</strong> saat ini terisi {{ selectedToLocInfo.currentQty }} unit. Setelah ditambah {{ draftMoveQty }} unit menjadi {{ projectedToQty }} unit.
            <span v-if="isToOverCapacity" class="font-bold underline block mt-0.5">
              (Kelebihan muatan: +{{ projectedToQty - selectedToLocInfo.maxCapacity }} unit dari daya tampung maksimal!)
            </span>
          </p>
        </div>
      </div>

      <!-- Tabel Daftar Item Multi-Item dalam Dokumen Worksheet -->
      <div class="glass-card overflow-hidden border border-slate-200/80 dark:border-slate-800">
        <div class="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 class="text-xs font-bold text-slate-900 dark:text-white">
              Daftar Barang yang Dipindahkan ({{ worksheetItems.length }} Baris)
            </h3>
            <p class="text-[11px] text-slate-400">Anda dapat memindahkan banyak barang dari lokasi berbeda ke tujuan berbeda dalam 1 dokumen ini.</p>
          </div>
          <span class="text-xs font-extrabold text-blue-600 dark:text-blue-400 font-mono">
            Total Qty: {{ totalWorksheetQty }} Unit
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-slate-100/70 dark:bg-slate-800/70 border-b border-slate-200/80 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase select-none">
                <th class="py-2.5 px-3 text-center w-12">No</th>
                <th class="py-2.5 px-3">Kode & Nama Barang</th>
                <th class="py-2.5 px-3">Dari (From)</th>
                <th class="py-2.5 px-3 text-center w-8">&rarr;</th>
                <th class="py-2.5 px-3">Ke (To)</th>
                <th class="py-2.5 px-3 text-right">Qty Pindah</th>
                <th class="py-2.5 px-3">Catatan Baris</th>
                <th class="py-2.5 px-3 text-center w-16">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              <tr v-if="worksheetItems.length === 0">
                <td colspan="8" class="py-10 text-center text-slate-400 text-xs">
                  Belum ada item dalam lembar kerja ini. Gunakan kolom Smart Search di atas untuk menambahkan.
                </td>
              </tr>
              <tr 
                v-for="(item, idx) in worksheetItems" 
                :key="idx"
                class="hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
              >
                <td class="py-2.5 px-3 text-center text-slate-400 font-mono">{{ idx + 1 }}</td>
                <td class="py-2.5 px-3">
                  <span class="font-mono font-bold text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded mr-1">
                    {{ item.uniqCode }}
                  </span>
                  <span class="font-semibold text-slate-900 dark:text-white">{{ item.deskripsi }}</span>
                </td>
                <td class="py-2.5 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                  <span class="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-amber-700 dark:text-amber-300">
                    {{ item.fromLocation }}
                  </span>
                </td>
                <td class="py-2.5 px-3 text-center text-slate-400 font-bold">&rarr;</td>
                <td class="py-2.5 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                  <span class="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-700 dark:text-emerald-300">
                    {{ item.toLocation }}
                  </span>
                </td>
                <td class="py-2.5 px-3 text-right font-mono font-black text-blue-600 dark:text-blue-400">
                  {{ item.qty }} {{ item.satuan }}
                </td>
                <td class="py-2.5 px-3 text-[11px] text-slate-500">
                  <input 
                    v-model="item.keterangan" 
                    type="text" 
                    placeholder="Catatan..." 
                    class="w-full px-2 py-1 glass-input rounded text-xs"
                  />
                </td>
                <td class="py-2.5 px-3 text-center">
                  <button 
                    @click="removeWorksheetItem(idx)"
                    class="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Footer Actions Worksheet: Simpan Draft & Setujui (Approve) -->
        <div class="p-4 bg-slate-50/80 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button 
            type="button" 
            @click="switchSheet('movements')"
            class="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Batal
          </button>

          <div class="flex items-center gap-2">
            <!-- Simpan Draft -->
            <button 
              type="button" 
              @click="saveWorksheet(false)"
              :disabled="worksheetItems.length === 0"
              class="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              💾 Simpan sebagai Draft
            </button>

            <!-- Setujui & Eksekusi Langsung -->
            <button 
              type="button" 
              @click="saveWorksheet(true)"
              :disabled="worksheetItems.length === 0"
              class="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Check class="w-4 h-4" />
              <span>✅ Setujui & Pindah Stok Sekarang</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- MODAL 1: TAMBAH / EDIT MASTER LOKASI (LIGHT ACCENT)            -->
    <!-- ============================================================== -->
    <div 
      v-if="isLocationModalOpen" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 dark:bg-black/80 backdrop-blur-md p-3 sm:p-4 transition-all"
    >
      <div class="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden flex flex-col">
        <!-- Top Light Gradient Bar -->
        <div class="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-teal-400"></div>

        <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Boxes class="w-4 h-4 text-blue-600" />
            <span>{{ isEditingLocation ? 'Edit Area / Rak Lokasi' : 'Tambah Area / Rak Baru' }}</span>
          </h3>
          <button @click="isLocationModalOpen = false" class="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X class="w-4 h-4" />
          </button>
        </div>

        <form @submit.prevent="saveLocationMaster" class="p-5 space-y-3.5 text-xs">
          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kode Lokasi (Unik)</label>
            <input 
              v-model="locationForm.code" 
              :readonly="isEditingLocation"
              type="text" 
              required
              placeholder="Contoh: RAK-C1, BIN-05, ZONE-NORTH" 
              class="w-full px-3 py-2 glass-input rounded-xl font-mono uppercase font-bold"
            />
          </div>

          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Area / Deskripsi</label>
            <input 
              v-model="locationForm.name" 
              type="text" 
              required
              placeholder="Contoh: Rak Logistik Timur Tingkat 1" 
              class="w-full px-3 py-2 glass-input rounded-xl font-medium"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kategori / Tipe</label>
              <select 
                v-model="locationForm.type" 
                class="w-full px-3 py-2 glass-input rounded-xl"
              >
                <option value="Fast Picking">Fast Picking</option>
                <option value="Standard Storage">Standard Storage</option>
                <option value="Bulk Pallet">Bulk Pallet</option>
                <option value="Transit / Staging">Transit / Staging</option>
                <option value="Cold Storage">Cold Storage</option>
                <option value="Karantina / Rusak">Karantina / Rusak</option>
              </select>
            </div>

            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kapasitas Maksimal (Unit)</label>
              <input 
                v-model.number="locationForm.maxCapacity" 
                type="number" 
                min="1" 
                required
                placeholder="200" 
                class="w-full px-3 py-2 glass-input rounded-xl font-bold font-mono text-blue-600"
              />
            </div>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Keterangan Tambahan</label>
            <input 
              v-model="locationForm.keterangan" 
              type="text" 
              placeholder="Contoh: Khusus dus kemasan & material kertas" 
              class="w-full px-3 py-2 glass-input rounded-xl"
            />
          </div>

          <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button 
              type="button" 
              @click="isLocationModalOpen = false" 
              class="px-3.5 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200"
            >
              Batal
            </button>
            <button 
              type="submit" 
              class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
            >
              Simpan Area
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- MODAL 2: DETAIL ISI BARANG DI DALAM LOKASI (LIGHT ACCENT)      -->
    <!-- ============================================================== -->
    <div 
      v-if="selectedLocationDetail" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 dark:bg-black/80 backdrop-blur-md p-3 sm:p-4 transition-all"
    >
      <div class="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
        <div class="h-1.5 w-full bg-gradient-to-r from-blue-500 to-indigo-500"></div>

        <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span class="font-mono font-bold text-xs bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 px-2 py-0.5 rounded">
              {{ selectedLocationDetail.code }}
            </span>
            <h3 class="text-sm font-bold text-slate-900 dark:text-white mt-1">{{ selectedLocationDetail.name }}</h3>
            <p class="text-[11px] text-slate-400">
              Beban Terisi: {{ selectedLocationDetail.currentQty }} / {{ selectedLocationDetail.maxCapacity }} unit ({{ selectedLocationDetail.occupancyPercent }}%)
            </p>
          </div>
          <button @click="selectedLocationDetail = null" class="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="p-5 overflow-y-auto space-y-3 text-xs">
          <h4 class="font-bold text-slate-800 dark:text-slate-200">Daftar SKU Tersimpan di Area Ini:</h4>
          <div v-if="selectedLocationDetail.items.length === 0" class="py-6 text-center text-slate-400">
            Area ini saat ini kosong.
          </div>
          <div v-else class="divide-y divide-slate-100 dark:divide-slate-800 border rounded-xl overflow-hidden">
            <div 
              v-for="item in selectedLocationDetail.items" 
              :key="item.itemCode"
              class="p-2.5 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40"
            >
              <div>
                <span class="font-mono font-bold text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded mr-1">
                  {{ item.itemCode }}
                </span>
                <strong class="text-slate-900 dark:text-white">{{ item.deskripsi }}</strong>
              </div>
              <span class="font-mono font-bold text-blue-600 dark:text-blue-400">
                {{ item.qty }} {{ item.satuan }}
              </span>
            </div>
          </div>
        </div>

        <div class="px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button @click="selectedLocationDetail = null" class="px-4 py-1.5 bg-slate-200 dark:bg-slate-700 rounded-xl text-xs font-semibold">
            Tutup
          </button>
        </div>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- MODAL 3: DETAIL DOKUMEN MOVEMENT                               -->
    <!-- ============================================================== -->
    <div 
      v-if="selectedMovementDetail" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 dark:bg-black/80 backdrop-blur-md p-3 sm:p-4 transition-all"
    >
      <div class="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden flex flex-col max-h-[88vh]">
        <div class="h-1.5 w-full bg-gradient-to-r from-blue-500 to-indigo-500"></div>

        <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div class="flex items-center gap-2">
              <span class="font-mono font-bold text-sm text-slate-900 dark:text-white">{{ selectedMovementDetail.docNo }}</span>
              <span :class="[
                'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                selectedMovementDetail.status === 'APPROVED' 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400' 
                  : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400'
              ]">
                {{ selectedMovementDetail.status === 'APPROVED' ? 'Disetujui & Terkunci' : 'Draft' }}
              </span>
            </div>
            <p class="text-[11px] text-slate-400 mt-0.5">
              Tanggal: {{ selectedMovementDetail.tanggal }} • Operator: {{ selectedMovementDetail.operator || '-' }}
            </p>
          </div>
          <button @click="selectedMovementDetail = null" class="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="p-5 overflow-y-auto space-y-3 text-xs">
          <p class="text-slate-500">Catatan: {{ selectedMovementDetail.keterangan || '-' }}</p>

          <table class="w-full text-left border-collapse border rounded-xl overflow-hidden">
            <thead>
              <tr class="bg-slate-100 dark:bg-slate-800 border-b text-[10px] uppercase font-bold text-slate-500">
                <th class="py-2 px-3">No</th>
                <th class="py-2 px-3">Barang</th>
                <th class="py-2 px-3">Dari (From)</th>
                <th class="py-2 px-3">Ke (To)</th>
                <th class="py-2 px-3 text-right">Qty</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr v-for="(it, idx) in selectedMovementDetail.items" :key="idx">
                <td class="py-2 px-3 text-slate-400">{{ idx + 1 }}</td>
                <td class="py-2 px-3">
                  <span class="font-mono font-bold mr-1">{{ it.uniqCode }}</span>
                  <span>{{ it.deskripsi }}</span>
                </td>
                <td class="py-2 px-3 font-mono font-bold text-amber-600">{{ it.fromLocation }}</td>
                <td class="py-2 px-3 font-mono font-bold text-emerald-600">{{ it.toLocation }}</td>
                <td class="py-2 px-3 text-right font-mono font-bold">{{ it.qty }} {{ it.satuan }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span class="text-xs font-bold text-slate-500">
            Total: {{ selectedMovementDetail.totalItems }} Item • {{ selectedMovementDetail.totalQty }} Unit
          </span>
          <div class="flex items-center gap-2">
            <button 
              v-if="selectedMovementDetail.status === 'DRAFT'"
              @click="approveMovementDoc(selectedMovementDetail)"
              class="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
            >
              Setujui Sekarang
            </button>
            <button @click="selectedMovementDetail = null" class="px-4 py-1.5 bg-slate-200 dark:bg-slate-700 rounded-xl text-xs font-semibold">
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { 
  db, 
  getLocationDetailsWithOccupancy, 
  getItemLocationsBreakdown, 
  executeApproveMovement,
  generateAutoMovementDocNo,
  syncItemLocationsWithCurrentStock,
  getWarehouseEarlyWarnings
} from '../database/db';
import { 
  MapPin, 
  Boxes, 
  LayoutDashboard, 
  FileText, 
  ArrowLeftRight, 
  Plus, 
  Search, 
  Eye, 
  Pencil, 
  Trash2, 
  Check, 
  Clock, 
  Lock, 
  History, 
  AlertTriangle, 
  CheckCircle2, 
  X 
} from 'lucide-vue-next';

const props = defineProps({
  itemsWithStock: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['refresh-data']);

// State Sheet Tabs: 'dashboard' | 'manage' | 'movements' | 'worksheet'
const activeSubTab = ref('dashboard');

// Master Data State
const locationsList = ref([]);
const movementsList = ref([]);
const locationSearch = ref('');
const movementSearch = ref('');
const movementStatusFilter = ref('ALL');

// Modal State
const isLocationModalOpen = ref(false);
const isEditingLocation = ref(false);
const locationForm = ref({
  id: null,
  code: '',
  name: '',
  type: 'Standard Storage',
  maxCapacity: 200,
  keterangan: ''
});
const selectedLocationDetail = ref(null);
const selectedMovementDetail = ref(null);

// Worksheet State
const editingMovementId = ref(null);
const worksheetHeader = ref({
  docNo: '',
  tanggal: new Date().toISOString().split('T')[0],
  operator: '',
  keterangan: ''
});
const worksheetItems = ref([]);

// Smart Search di Worksheet
const typedItemSearch = ref('');
const isSmartDropdownOpen = ref(false);
const selectedItemObj = ref(null);
const selectedItemLocations = ref([]);
const draftFromLocation = ref('');
const draftToLocation = ref('');
const draftMoveQty = ref(1);

// Computed: Total Kapasitas & Okupansi
const totalMaxCapacity = computed(() => {
  return locationsList.value.reduce((sum, curr) => sum + (Number(curr.maxCapacity) || 0), 0);
});

const totalCurrentOccupancy = computed(() => {
  return locationsList.value.reduce((sum, curr) => sum + (Number(curr.currentQty) || 0), 0);
});

const totalAvailableCapacity = computed(() => {
  return Math.max(0, totalMaxCapacity.value - totalCurrentOccupancy.value);
});

const overallUtilization = computed(() => {
  if (totalMaxCapacity.value === 0) return 0;
  return Math.min(100, Math.round((totalCurrentOccupancy.value / totalMaxCapacity.value) * 100));
});

// Filtered Locations
const filteredLocations = computed(() => {
  if (!locationSearch.value.trim()) return locationsList.value;
  const q = locationSearch.value.toLowerCase().trim();
  return locationsList.value.filter(l => 
    l.code.toLowerCase().includes(q) ||
    l.name.toLowerCase().includes(q) ||
    l.type.toLowerCase().includes(q)
  );
});

// Filtered Movements
const filteredMovements = computed(() => {
  let list = [...movementsList.value];
  if (movementStatusFilter.value !== 'ALL') {
    list = list.filter(m => m.status === movementStatusFilter.value);
  }
  if (movementSearch.value.trim()) {
    const q = movementSearch.value.toLowerCase().trim();
    list = list.filter(m => 
      m.docNo.toLowerCase().includes(q) ||
      (m.operator && m.operator.toLowerCase().includes(q)) ||
      (m.keterangan && m.keterangan.toLowerCase().includes(q))
    );
  }
  // Sort descending by id or date
  list.sort((a, b) => (b.id || 0) - (a.id || 0));
  return list;
});

// Smart Search Suggestions
const matchingItemSuggestions = computed(() => {
  if (!typedItemSearch.value.trim()) return [];
  const q = typedItemSearch.value.toLowerCase().trim();
  return props.itemsWithStock.filter(it => 
    it.uniqCode.toLowerCase().includes(q) ||
    it.deskripsi.toLowerCase().includes(q)
  ).slice(0, 8);
});

// Destination Locations (excluding current From)
const destinationLocations = computed(() => {
  return locationsList.value.filter(l => l.code !== draftFromLocation.value);
});

// Info From Location terpilih
const selectedFromLocInfo = computed(() => {
  return selectedItemLocations.value.find(l => l.locationCode === draftFromLocation.value);
});

// Info To Location terpilih
const selectedToLocInfo = computed(() => {
  return locationsList.value.find(l => l.code === draftToLocation.value);
});

// Proyeksi Kapasitas Tujuan
const projectedToQty = computed(() => {
  if (!selectedToLocInfo.value) return 0;
  return selectedToLocInfo.value.currentQty + (Number(draftMoveQty.value) || 0);
});

const projectedToPercent = computed(() => {
  if (!selectedToLocInfo.value || selectedToLocInfo.value.maxCapacity === 0) return 0;
  return Math.round((projectedToQty.value / selectedToLocInfo.value.maxCapacity) * 100);
});

const isToOverCapacity = computed(() => {
  if (!selectedToLocInfo.value) return false;
  return projectedToQty.value > selectedToLocInfo.value.maxCapacity;
});

// Total Qty di Worksheet
const totalWorksheetQty = computed(() => {
  return worksheetItems.value.reduce((sum, curr) => sum + (Number(curr.qty) || 0), 0);
});

// Early Warnings State
const earlyWarnings = ref({
  overcapacityLocations: [],
  nearCapacityLocations: [],
  stagingItems: [],
  unallocatedItems: [],
  totalWarnings: 0
});

// Helper ketersediaan stok fisik per lokasi yang memperhitungkan baris di draft worksheet
function getAvailableInLocation(locCode) {
  if (!selectedItemObj.value) return 0;
  const loc = selectedItemLocations.value.find(l => l.locationCode === locCode);
  const totalInLoc = loc ? Number(loc.qty) : 0;
  const alreadyInDraft = worksheetItems.value
    .filter(it => it.uniqCode === selectedItemObj.value.uniqCode && it.fromLocation === locCode)
    .reduce((sum, it) => sum + (Number(it.qty) || 0), 0);
  return Math.max(0, totalInLoc - alreadyInDraft);
}

const availableToMove = computed(() => {
  if (!draftFromLocation.value) return 0;
  return getAvailableInLocation(draftFromLocation.value);
});

// Load Data (Parallel & Single-Pass Optimization)
async function loadData() {
  const [locs, movs] = await Promise.all([
    getLocationDetailsWithOccupancy(),
    db.movements.toArray()
  ]);
  locationsList.value = locs;
  movementsList.value = movs;
  earlyWarnings.value = await getWarehouseEarlyWarnings(locs);
}

function switchSheet(tab) {
  activeSubTab.value = tab;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Buka Worksheet Baru
async function openNewWorksheet() {
  editingMovementId.value = null;
  const newDocNo = await generateAutoMovementDocNo();
  worksheetHeader.value = {
    docNo: newDocNo,
    tanggal: new Date().toISOString().split('T')[0],
    operator: '',
    keterangan: 'Pemindahan stok internal'
  };
  worksheetItems.value = [];
  clearSelectedItem();
  activeSubTab.value = 'worksheet';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Otomatisasi Putaway Cepat untuk Barang yang Menumpuk di Staging Area
async function quickPutawayFromStaging() {
  await openNewWorksheet();
  worksheetHeader.value.keterangan = 'Putaway Barang Masuk dari Staging Area ke Rak Gudang';
  
  if (earlyWarnings.value.stagingItems && earlyWarnings.value.stagingItems.length > 0) {
    for (const stg of earlyWarnings.value.stagingItems) {
      // Rekomendasikan rak non-staging dengan sisa kapasitas terbesar
      const candidateRack = locationsList.value
        .filter(l => l.code !== 'ZONE-STAGING' && l.type !== 'Transit / Staging')
        .sort((a, b) => b.availableCapacity - a.availableCapacity)[0];

      worksheetItems.value.push({
        uniqCode: stg.itemCode,
        deskripsi: stg.deskripsi,
        satuan: stg.satuan,
        fromLocation: 'ZONE-STAGING',
        toLocation: candidateRack ? candidateRack.code : 'RAK-A1',
        qty: stg.qty,
        keterangan: 'Rekomendasi Putaway Otomatis'
      });
    }
  }
}

// Smart Search: Pilih Item
async function selectItemForMovement(item) {
  selectedItemObj.value = item;
  typedItemSearch.value = `${item.uniqCode} - ${item.deskripsi}`;
  isSmartDropdownOpen.value = false;

  // Deteksi lokasi-lokasi fisik barang ini
  selectedItemLocations.value = await getItemLocationsBreakdown(item.uniqCode);

  if (selectedItemLocations.value.length > 0) {
    draftFromLocation.value = selectedItemLocations.value[0].locationCode;
    const avail = getAvailableInLocation(selectedItemLocations.value[0].locationCode);
    draftMoveQty.value = avail > 0 ? 1 : 0;
  } else {
    draftFromLocation.value = '';
    draftMoveQty.value = 0;
  }
  draftToLocation.value = destinationLocations.value.length > 0 ? destinationLocations.value[0].code : '';
}

function clearSelectedItem() {
  selectedItemObj.value = null;
  typedItemSearch.value = '';
  selectedItemLocations.value = [];
  draftFromLocation.value = '';
  draftToLocation.value = '';
  draftMoveQty.value = 1;
}

// Tambah Baris ke Worksheet
function addItemRowToWorksheet() {
  if (!selectedItemObj.value) {
    alert('Pilih barang terlebih dahulu!');
    return;
  }
  if (!draftFromLocation.value) {
    alert('Pilih lokasi asal (From)!');
    return;
  }
  if (!draftToLocation.value) {
    alert('Pilih lokasi tujuan (To)!');
    return;
  }
  if (draftFromLocation.value === draftToLocation.value) {
    alert('Lokasi asal dan tujuan tidak boleh sama!');
    return;
  }

  const moveQty = Number(draftMoveQty.value) || 0;
  if (moveQty <= 0) {
    alert('Kuantitas yang dipindahkan harus lebih dari 0!');
    return;
  }

  const remainingAvailable = getAvailableInLocation(draftFromLocation.value);
  if (moveQty > remainingAvailable) {
    alert(`Qty (${moveQty}) melebihi sisa stok yang tersedia di lokasi ${draftFromLocation.value}!\n(Sisa Stok Tersedia: ${remainingAvailable})`);
    return;
  }

  worksheetItems.value.push({
    uniqCode: selectedItemObj.value.uniqCode,
    deskripsi: selectedItemObj.value.deskripsi,
    satuan: selectedItemObj.value.satuan,
    fromLocation: draftFromLocation.value,
    toLocation: draftToLocation.value,
    qty: moveQty,
    keterangan: 'Mutasi internal'
  });

  clearSelectedItem();
}

function removeWorksheetItem(index) {
  worksheetItems.value.splice(index, 1);
}

// Simpan Dokumen Worksheet (Draft / Langsung Approve)
async function saveWorksheet(isApproveNow = false) {
  if (worksheetItems.value.length === 0) {
    alert('Tambahkan minimal 1 item ke dalam lembar kerja!');
    return;
  }

  if (isApproveNow) {
    // Validasi & Peringatan Overcapacity
    const locQtyDelta = {};
    for (const item of worksheetItems.value) {
      locQtyDelta[item.fromLocation] = (locQtyDelta[item.fromLocation] || 0) - Number(item.qty);
      locQtyDelta[item.toLocation] = (locQtyDelta[item.toLocation] || 0) + Number(item.qty);
    }
    
    const overCapacityAlerts = [];
    for (const [code, delta] of Object.entries(locQtyDelta)) {
      if (delta > 0) {
        const loc = locationsList.value.find(l => l.code === code);
        if (loc && (loc.currentQty + delta) > loc.maxCapacity) {
          overCapacityAlerts.push(
            `• ${code} (${loc.name}): Kapasitas maks ${loc.maxCapacity}, proyeksi terisi ${loc.currentQty + delta} unit (+${(loc.currentQty + delta) - loc.maxCapacity} unit overload)`
          );
        }
      }
    }

    if (overCapacityAlerts.length > 0) {
      const proceed = confirm(
        '⚠️ PERINGATAN OVER-KAPASITAS GUDANG!\n\n' +
        'Pemindahan ini akan menyebabkan area berikut MELEBIHI kapasitas fisik maksimal:\n' +
        overCapacityAlerts.join('\n') +
        '\n\nApakah Anda tetap ingin melanjutkan dan menyetujui dokumen ini?'
      );
      if (!proceed) return;
    } else {
      const confirmApprove = confirm(
        'Apakah Anda yakin ingin menyetujui dokumen ini sekarang?\n\n' +
        'PERHATIAN: Setelah disetujui, dokumen akan terkunci permanen dan kuantitas item otomatis berpindah lokasinya di database.'
      );
      if (!confirmApprove) return;
    }
  }

  const payload = {
    docNo: worksheetHeader.value.docNo,
    tanggal: worksheetHeader.value.tanggal,
    operator: worksheetHeader.value.operator || 'Admin Gudang',
    keterangan: worksheetHeader.value.keterangan || 'Pemindahan stok internal',
    totalItems: worksheetItems.value.length,
    totalQty: totalWorksheetQty.value,
    items: JSON.parse(JSON.stringify(worksheetItems.value)),
    status: isApproveNow ? 'APPROVED' : 'DRAFT',
    isLocked: isApproveNow,
    approvedAt: isApproveNow ? new Date().toISOString() : null,
    updatedAt: new Date().toISOString()
  };

  try {
    let savedId = editingMovementId.value;
    if (editingMovementId.value) {
      await db.movements.update(editingMovementId.value, payload);
    } else {
      payload.createdAt = new Date().toISOString();
      savedId = await db.movements.add(payload);
    }

    if (isApproveNow) {
      await executeApproveMovement(savedId);
      alert('✅ Dokumen berhasil disetujui dan lokasi stok telah diperbarui secara fisik!');
    } else {
      alert('💾 Dokumen movement berhasil disimpan sebagai Draft.');
    }

    await loadData();
    emit('refresh-data');
    activeSubTab.value = 'movements';
  } catch (err) {
    alert('Terjadi kesalahan: ' + err.message);
  }
}

// Approve Dokumen dari List
async function approveMovementDoc(mov) {
  if (mov.status === 'APPROVED') {
    alert('Dokumen ini sudah disetujui sebelumnya.');
    return;
  }

  const confirmApprove = confirm(
    `Setujui dokumen "${mov.docNo}"?\n\n` +
    `Stok sebanyak ${mov.totalQty} unit akan otomatis dipindahkan ke lokasi tujuan dan dokumen akan terkunci.`
  );
  if (!confirmApprove) return;

  try {
    await executeApproveMovement(mov.id);
    alert('✅ Dokumen berhasil disetujui! Stok otomatis berpindah.');
    await loadData();
    selectedMovementDetail.value = null;
    emit('refresh-data');
  } catch (err) {
    alert('Gagal menyetujui dokumen: ' + err.message);
  }
}

// Edit Draft Movement
function editDraftMovement(mov) {
  if (mov.status === 'APPROVED') {
    alert('Dokumen yang sudah disetujui tidak dapat diedit.');
    return;
  }
  editingMovementId.value = mov.id;
  worksheetHeader.value = {
    docNo: mov.docNo,
    tanggal: mov.tanggal,
    operator: mov.operator || '',
    keterangan: mov.keterangan || ''
  };
  worksheetItems.value = JSON.parse(JSON.stringify(mov.items || []));
  clearSelectedItem();
  activeSubTab.value = 'worksheet';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Hapus Draft Movement
async function deleteDraftMovement(mov) {
  if (mov.status === 'APPROVED') {
    alert('Dokumen yang sudah disetujui tidak dapat dihapus.');
    return;
  }
  if (confirm(`Hapus dokumen draft "${mov.docNo}"?`)) {
    await db.movements.delete(mov.id);
    await loadData();
  }
}

// Detail Modals
function openLocationDetailModal(loc) {
  selectedLocationDetail.value = loc;
}

function openMovementDetailModal(mov) {
  selectedMovementDetail.value = mov;
}

// Master Location CRUD Modal
function openCreateLocationModal() {
  isEditingLocation.value = false;
  locationForm.value = {
    id: null,
    code: '',
    name: '',
    type: 'Standard Storage',
    maxCapacity: 200,
    keterangan: ''
  };
  isLocationModalOpen.value = true;
}

function openEditLocationModal(loc) {
  isEditingLocation.value = true;
  locationForm.value = {
    id: loc.id,
    code: loc.code,
    name: loc.name,
    type: loc.type,
    maxCapacity: loc.maxCapacity,
    keterangan: loc.keterangan || ''
  };
  isLocationModalOpen.value = true;
}

async function saveLocationMaster() {
  const code = locationForm.value.code.trim().toUpperCase();
  if (!code) return;

  try {
    if (isEditingLocation.value && locationForm.value.id) {
      await db.locations.update(locationForm.value.id, {
        name: locationForm.value.name,
        type: locationForm.value.type,
        maxCapacity: Number(locationForm.value.maxCapacity) || 100,
        keterangan: locationForm.value.keterangan
      });
    } else {
      const existing = await db.locations.filter(l => l.code === code).first();
      if (existing) {
        alert(`Kode lokasi "${code}" sudah digunakan. Gunakan kode lain.`);
        return;
      }
      await db.locations.add({
        code: code,
        name: locationForm.value.name,
        type: locationForm.value.type,
        maxCapacity: Number(locationForm.value.maxCapacity) || 100,
        keterangan: locationForm.value.keterangan,
        createdAt: new Date().toISOString()
      });
    }

    isLocationModalOpen.value = false;
    await loadData();
  } catch (err) {
    alert('Gagal menyimpan lokasi: ' + err.message);
  }
}

async function deleteLocation(loc) {
  if (loc.currentQty > 0) {
    alert(`Lokasi "${loc.code}" masih berisi ${loc.currentQty} unit barang! Pindahkan barang terlebih dahulu sebelum menghapus lokasi.`);
    return;
  }
  if (confirm(`Hapus area/lokasi "${loc.code} - ${loc.name}"?`)) {
    await db.locations.delete(loc.id);
    await loadData();
  }
}

onMounted(() => {
  loadData();
});
</script>
