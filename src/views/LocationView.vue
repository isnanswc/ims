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

      <!-- Action Button: Open Movement Worksheet & Ekspor -->
      <div class="flex items-center gap-2">
        <button 
          v-if="activeSubTab !== 'worksheet'"
          @click="downloadLocationDataExcel"
          class="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-bold border border-zinc-300 dark:border-zinc-700 shadow-xs transition-all cursor-pointer"
          title="Ekspor data okupansi rak & pergerakan internal ke Excel (.xlsx)"
        >
          <Download class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Ekspor Lokasi</span>
        </button>
        <button 
          v-if="activeSubTab !== 'worksheet'"
          @click="openNewWorksheet"
          class="flex items-center gap-2 px-4 py-2 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 rounded-xl text-xs font-bold shadow-sm border border-zinc-950 dark:border-white transition-all cursor-pointer"
        >
          <ArrowLeftRight class="w-4 h-4" />
          <span>+ Movement Worksheet</span>
        </button>
      </div>
    </div>

    <!-- Sheet Tabs Navigation (Dashboard, Kelola Lokasi, Movement, Worksheet) -->
    <div class="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl overflow-x-auto max-w-full scrollbar-none border border-zinc-200 dark:border-zinc-800">
      <button 
        @click="switchSheet('dashboard')"
        :class="[
          'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer',
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
          'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer',
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
          'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer',
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
        class="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-sm border border-zinc-950 dark:border-white shrink-0 cursor-pointer"
      >
        <ArrowLeftRight class="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-700 animate-pulse" />
        <span>Movement Worksheet (Aktif)</span>
      </button>
    </div>

    <!-- ============================================================== -->
    <!-- SHEET 1: DASHBOARD OKUPANSI & KAPASITAS LOKASI                 -->
    <!-- ============================================================== -->
    <div v-if="activeSubTab === 'dashboard'" class="space-y-5">
      <!-- 4 Top KPI Cards (Dengan Skeleton Shimmer) -->
      <SkeletonLoader v-if="isLoading" type="kpi" :count="4" />
      <div v-else class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <!-- 1. Total Kapasitas Gudang -->
        <div class="glass-card p-3.5 sm:p-4 border-l-2 border-l-zinc-950 dark:border-l-white">
          <span class="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400 block">Total Kapasitas Fisik</span>
          <div class="flex items-baseline justify-between mt-1">
            <strong class="text-xl sm:text-2xl font-black text-zinc-950 dark:text-white font-mono">{{ totalMaxCapacity }}</strong>
            <span class="text-[10px] text-zinc-400 font-mono">Unit Maks</span>
          </div>
          <p class="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">Daya tampung seluruh rak & bin</p>
        </div>

        <!-- 2. Total Terisi Saat Ini -->
        <div class="glass-card p-3.5 sm:p-4 border-l-2 border-l-zinc-800 dark:border-l-zinc-300">
          <span class="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400 block">Total Stok Fisik Terisi</span>
          <div class="flex items-baseline justify-between mt-1">
            <strong class="text-xl sm:text-2xl font-black text-zinc-950 dark:text-white font-mono">{{ totalCurrentOccupancy }}</strong>
            <span class="text-[10px] text-zinc-400 font-mono">Unit Fisik</span>
          </div>
          <p class="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">Sisa ruang: <span class="font-bold text-zinc-900 dark:text-zinc-100 font-mono">{{ totalAvailableCapacity }}</span> unit</p>
        </div>

        <!-- 3. Utilisasi Keseluruhan -->
        <div class="glass-card p-3.5 sm:p-4 border-l-2 border-l-zinc-700 dark:border-l-zinc-400">
          <span class="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400 block">Rata-rata Utilisasi</span>
          <div class="flex items-baseline justify-between mt-1">
            <strong class="text-xl sm:text-2xl font-black text-zinc-950 dark:text-white font-mono">{{ overallUtilization }}%</strong>
            <span class="text-[10px] font-mono" :class="overallUtilization >= 85 ? 'text-amber-500 font-bold' : 'text-zinc-400'">
              {{ overallUtilization >= 90 ? 'Kritis' : overallUtilization >= 80 ? 'Padat' : 'Optimal' }}
            </span>
          </div>
          <div class="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              class="h-full bg-zinc-950 dark:bg-zinc-100 rounded-full transition-all duration-500"
              :style="{ width: `${overallUtilization}%` }"
            ></div>
          </div>
        </div>

        <!-- 4. Rasio Kesehatan Ruang Gudang -->
        <div class="glass-card p-3.5 sm:p-4 border-l-2 border-l-zinc-600 dark:border-l-zinc-500">
          <span class="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400 block">Rasio Rak Optimal</span>
          <div class="flex items-baseline justify-between mt-1">
            <strong class="text-xl sm:text-2xl font-black text-zinc-950 dark:text-white font-mono">
              {{ occupancyStatusBreakdown.optimal.percent }}%
            </strong>
            <span class="text-[10px] text-zinc-400 font-mono">{{ occupancyStatusBreakdown.optimal.count }}/{{ locationsList.length }} Rak</span>
          </div>
          <p class="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
            {{ occupancyStatusBreakdown.warning.count + occupancyStatusBreakdown.full.count > 0 
              ? `${occupancyStatusBreakdown.warning.count + occupancyStatusBreakdown.full.count} rak perlu perhatian` 
              : 'Semua rak beroperasi aman' }}
          </p>
        </div>
      </div>

      <!-- Smart Early Warnings & Automation Hub -->
      <div 
        v-if="earlyWarnings.totalWarnings > 0"
        class="glass-card p-4 border border-zinc-200 dark:border-zinc-800 space-y-3"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-bold text-xs shadow-xs">
              <AlertTriangle class="w-4 h-4 text-amber-500 animate-pulse" />
            </div>
            <div>
              <h3 class="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <span>Pusat Deteksi Dini & Otomasi Gudang</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  {{ earlyWarnings.totalWarnings }} Peringatan
                </span>
              </h3>
              <p class="text-[11px] text-zinc-500 dark:text-zinc-400">
                Peringatan dini penumpukan barang masuk atau beban area melampaui toleransi.
              </p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
          <!-- Warning 1: Overcapacity -->
          <div 
            v-if="earlyWarnings.overcapacityLocations.length > 0"
            class="p-2.5 rounded-xl border border-rose-500/20 bg-rose-500/5 text-xs flex flex-col justify-between"
          >
            <div>
              <span class="font-bold flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                <AlertTriangle class="w-3.5 h-3.5" />
                Over-Kapasitas ({{ earlyWarnings.overcapacityLocations.length }} Rak)
              </span>
              <p class="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1">
                Rak: <strong class="text-zinc-950 dark:text-zinc-100 font-mono">{{ earlyWarnings.overcapacityLocations.map(l => l.code).join(', ') }}</strong> melebihi daya tampung fisik!
              </p>
            </div>
            <button 
              @click="startMovementFromLocation(earlyWarnings.overcapacityLocations[0])"
              class="mt-2 text-[10px] font-bold px-2 py-1 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-950 rounded-lg self-start transition-colors cursor-pointer"
            >
              Relokasi Stok Rak Ini &rarr;
            </button>
          </div>

          <!-- Warning 2: Staging Backlog -->
          <div 
            v-if="earlyWarnings.stagingItems.length > 0"
            class="p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100/70 dark:bg-zinc-800/50 text-xs flex flex-col justify-between"
          >
            <div>
              <span class="font-bold flex items-center gap-1.5 text-zinc-900 dark:text-zinc-100">
                <Boxes class="w-3.5 h-3.5 text-blue-500" />
                Staging Backlog ({{ earlyWarnings.stagingItems.length }} SKU)
              </span>
              <p class="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                Barang masuk belum dialokasikan ke rak penyimpanan tetap (Putaway tertunda).
              </p>
            </div>
            <button 
              @click="quickPutawayFromStaging"
              class="mt-2 text-[10px] font-bold px-2.5 py-1 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-950 rounded-lg self-start transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>🚀 Putaway Otomatis ke Rak Kosong</span>
            </button>
          </div>

          <!-- Warning 3: Near Capacity (>=85%) -->
          <div 
            v-if="earlyWarnings.nearCapacityLocations.length > 0"
            class="p-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 text-xs flex flex-col justify-between"
          >
            <div>
              <span class="font-bold flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                <AlertTriangle class="w-3.5 h-3.5" />
                Kapasitas Kritis &ge;85% ({{ earlyWarnings.nearCapacityLocations.length }} Rak)
              </span>
              <p class="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1">
                Rak: <strong class="text-zinc-950 dark:text-zinc-100 font-mono">{{ earlyWarnings.nearCapacityLocations.map(l => l.code).join(', ') }}</strong> hampir penuh.
              </p>
            </div>
            <button 
              @click="openManageWithStatusFilter('WARNING')"
              class="mt-2 text-[10px] font-semibold text-zinc-700 dark:text-zinc-300 hover:underline self-start cursor-pointer"
            >
              Lihat di Daftar Rak &rarr;
            </button>
          </div>
        </div>
      </div>

      <!-- ============================================================== -->
      <!-- GRAFIK UTAMA 1 & 2: DONUT DISTRIBUSI & UTILISASI ZONA GUDANG   -->
      <!-- ============================================================== -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <!-- GRAFIK 1: DONUT CHART KOMPOSISI BEBAN OKUPANSI GUDANG -->
        <div class="lg:col-span-5 glass-card p-4 sm:p-5 flex flex-col justify-between space-y-4">
          <div>
            <div class="flex items-center justify-between pb-2 border-b border-zinc-200/80 dark:border-zinc-800">
              <h3 class="text-xs sm:text-sm font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                <Boxes class="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
                <span>Distribusi Status Beban Okupansi</span>
              </h3>
              <span class="text-[10.5px] font-mono text-zinc-400">
                {{ locationsList.length }} Rak
              </span>
            </div>
            <p class="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
              Visualisasi proporsi beban rak berdasarkan batas toleransi kapasitas.
            </p>
          </div>

          <!-- Donut SVG + Legend Center -->
          <div class="flex flex-col sm:flex-row items-center justify-center gap-5 py-2">
            <!-- SVG Donut Chart -->
            <div class="relative w-36 h-36 shrink-0 flex items-center justify-center">
              <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <!-- Background Ring -->
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  class="stroke-zinc-200 dark:stroke-zinc-800"
                  stroke-width="12"
                  fill="transparent"
                />
                <!-- Segmented Rings -->
                <circle
                  v-for="seg in donutSegments"
                  :key="seg.key"
                  cx="50"
                  cy="50"
                  r="40"
                  :stroke="seg.color"
                  stroke-width="12"
                  fill="transparent"
                  :stroke-dasharray="`${seg.dashLength} ${seg.circumference}`"
                  :stroke-dashoffset="seg.dashOffset"
                  class="transition-all duration-700 ease-out"
                />
              </svg>

              <!-- Central Metric Text -->
              <div class="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
                <span class="text-lg font-black font-mono text-zinc-950 dark:text-white">
                  {{ overallUtilization }}%
                </span>
                <span class="text-[9.5px] font-medium text-zinc-400 uppercase tracking-wider">
                  Utilisasi
                </span>
              </div>
            </div>

            <!-- Interactive Legend Stack -->
            <div class="space-y-1.5 w-full sm:w-auto text-xs min-w-[170px]">
              <div 
                v-for="seg in donutSegments" 
                :key="seg.key"
                @click="openManageWithStatusFilter(seg.key)"
                class="flex items-center justify-between p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer group"
                :title="`Klik untuk melihat daftar rak dengan status ${seg.label}`"
              >
                <div class="flex items-center gap-2 min-w-0">
                  <div class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ backgroundColor: seg.color }"></div>
                  <span class="text-[11px] text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-950 dark:group-hover:text-white truncate">
                    {{ seg.label }}
                  </span>
                </div>
                <div class="flex items-center gap-1.5 font-mono text-[11px] shrink-0">
                  <strong class="font-bold text-zinc-950 dark:text-white">{{ seg.count }}</strong>
                  <span class="text-zinc-400 text-[10px]">({{ seg.percent }}%)</span>
                </div>
              </div>
            </div>
          </div>

          <div class="pt-2 border-t border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
            <span>💡 Klik status untuk memfilter daftar rak</span>
            <button @click="switchSheet('manage')" class="font-bold text-zinc-950 dark:text-white hover:underline cursor-pointer">
              Kelola Rak &rarr;
            </button>
          </div>
        </div>

        <!-- GRAFIK 2: UTILISASI PER KATEGORI / TIPE ZONA GUDANG (BAR CHART) -->
        <div class="lg:col-span-7 glass-card p-4 sm:p-5 flex flex-col justify-between space-y-4">
          <div>
            <div class="flex items-center justify-between pb-2 border-b border-zinc-200/80 dark:border-zinc-800">
              <h3 class="text-xs sm:text-sm font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                <SlidersHorizontal class="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
                <span>Kapasitas & Utilisasi per Zona Gudang</span>
              </h3>
              <span class="text-[10.5px] font-mono text-zinc-400">
                {{ categoryOccupancyStats.length }} Kategori
              </span>
            </div>
            <p class="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
              Perbandingan beban fisik antara zona Fast Picking, Bulk, Standar, Staging, dll.
            </p>
          </div>

          <!-- Horizontal Bar Chart Komparatif -->
          <div class="space-y-3 py-1">
            <div 
              v-for="cat in categoryOccupancyStats" 
              :key="cat.type"
              @click="openManageWithTypeFilter(cat.type)"
              class="p-2 rounded-xl hover:bg-zinc-100/70 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer group"
              :title="`Klik untuk menyaring seluruh rak di kategori ${cat.type}`"
            >
              <!-- Baris Judul Kategori & Angka -->
              <div class="flex items-center justify-between text-xs mb-1.5">
                <div class="flex items-center gap-2 min-w-0">
                  <strong class="text-zinc-900 dark:text-white group-hover:underline truncate text-xs">
                    {{ cat.type }}
                  </strong>
                  <span class="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700">
                    {{ cat.count }} Rak
                  </span>
                </div>

                <div class="flex items-center gap-2 text-right shrink-0">
                  <span class="font-mono text-xs font-bold text-zinc-950 dark:text-white">
                    {{ cat.currentQty }} / {{ cat.totalCapacity }}
                  </span>
                  <span 
                    class="font-mono text-[10.5px] font-bold px-1.5 py-0.5 rounded"
                    :class="[
                      cat.percent >= 90 ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' :
                      cat.percent >= 75 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    ]"
                  >
                    {{ cat.percent }}%
                  </span>
                </div>
              </div>

              <!-- Bar Progres Komparatif -->
              <div class="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div 
                  :class="[
                    'h-full rounded-full transition-all duration-500',
                    cat.percent >= 90 ? 'bg-rose-500' :
                    cat.percent >= 75 ? 'bg-amber-500' : 'bg-zinc-950 dark:bg-zinc-100'
                  ]"
                  :style="{ width: `${Math.min(100, cat.percent)}%` }"
                ></div>
              </div>

              <div class="flex items-center justify-between text-[10px] text-zinc-400 mt-1">
                <span>Sisa Ruang: <strong class="text-zinc-700 dark:text-zinc-300 font-mono">{{ cat.availableCapacity }} unit</strong></span>
                <span class="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-600 dark:text-zinc-400">Filter Zona Ini &rarr;</span>
              </div>
            </div>
          </div>

          <div class="pt-2 border-t border-zinc-200/80 dark:border-zinc-800 text-[11px] text-zinc-500 flex items-center justify-between">
            <span>💡 Monitor zona yang padat untuk menghindari penumpukan</span>
            <span class="font-mono text-[10.5px] text-zinc-400">Akumulasi Real-Time</span>
          </div>
        </div>
      </div>

      <!-- ============================================================== -->
      <!-- GRAFIK 3 & 4: ACTIONABLE INSIGHTS (TERPADAT VS TERLONGGAR)     -->
      <!-- ============================================================== -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- KARTU 3: TOP 5 AREA TERPADAT (PRIORITAS RELOKASI) -->
        <div class="glass-card p-4 sm:p-5 space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-zinc-200/80 dark:border-zinc-800">
            <div>
              <h3 class="text-xs sm:text-sm font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                <AlertTriangle class="w-4 h-4 text-amber-500" />
                <span>5 Rak Terpadat (Prioritas Relokasi)</span>
              </h3>
              <p class="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Area dengan beban okupansi tertinggi yang berpotensi menghambat alur gudang.
              </p>
            </div>
            <button 
              @click="openManageWithStatusFilter('WARNING')"
              class="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white cursor-pointer"
            >
              Semua &rarr;
            </button>
          </div>

          <div v-if="topOccupiedLocations.length === 0" class="py-6 text-center text-xs text-zinc-400">
            Belum ada data rak gudang.
          </div>

          <div v-else class="space-y-2">
            <div 
              v-for="loc in topOccupiedLocations" 
              :key="loc.code"
              class="p-2.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 flex items-center justify-between gap-3 text-xs"
            >
              <div class="min-w-0 flex items-center gap-2.5">
                <span class="font-mono font-bold text-[11px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 shrink-0">
                  {{ loc.code }}
                </span>
                <div class="min-w-0">
                  <strong class="text-zinc-950 dark:text-white block truncate text-xs">{{ loc.name }}</strong>
                  <span class="text-[10.5px] text-zinc-400 font-mono">
                    {{ loc.currentQty }}/{{ loc.maxCapacity }} u • Sisa {{ loc.availableCapacity }}
                  </span>
                </div>
              </div>

              <div class="flex items-center gap-2 shrink-0">
                <span 
                  class="font-mono text-xs font-black px-2 py-0.5 rounded-full"
                  :class="[
                    loc.occupancyPercent >= 90 ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20' :
                    loc.occupancyPercent >= 75 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' :
                    'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  ]"
                >
                  {{ loc.occupancyPercent }}%
                </span>

                <button 
                  @click="startMovementFromLocation(loc)"
                  title="Pindahkan stok dari area ini sekarang"
                  class="px-2.5 py-1 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 rounded-lg text-[10.5px] font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeftRight class="w-3 h-3" />
                  <span class="hidden sm:inline">Pindahkan</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- KARTU 4: TOP 5 AREA PALING LONGGAR (REKOMENDASI PUTAWAY TERBAIK) -->
        <div class="glass-card p-4 sm:p-5 space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-zinc-200/80 dark:border-zinc-800">
            <div>
              <h3 class="text-xs sm:text-sm font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                <Boxes class="w-4 h-4 text-emerald-500" />
                <span>5 Rak Terlonggar (Rekomendasi Putaway)</span>
              </h3>
              <p class="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Area dengan sisa kapasitas terbesar, ideal sebagai tujuan barang masuk baru.
              </p>
            </div>
            <button 
              @click="openManageWithStatusFilter('LOW')"
              class="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white cursor-pointer"
            >
              Semua &rarr;
            </button>
          </div>

          <div v-if="topAvailableLocations.length === 0" class="py-6 text-center text-xs text-zinc-400">
            Seluruh rak terisi penuh.
          </div>

          <div v-else class="space-y-2">
            <div 
              v-for="loc in topAvailableLocations" 
              :key="loc.code"
              class="p-2.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 flex items-center justify-between gap-3 text-xs"
            >
              <div class="min-w-0 flex items-center gap-2.5">
                <span class="font-mono font-bold text-[11px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 shrink-0">
                  {{ loc.code }}
                </span>
                <div class="min-w-0">
                  <strong class="text-zinc-950 dark:text-white block truncate text-xs">{{ loc.name }}</strong>
                  <span class="text-[10.5px] text-zinc-400">
                    {{ loc.type }} • Terisi {{ loc.occupancyPercent }}%
                  </span>
                </div>
              </div>

              <div class="flex items-center gap-2 shrink-0">
                <div class="text-right">
                  <strong class="font-mono text-xs font-extrabold text-emerald-600 dark:text-emerald-400 block">
                    +{{ loc.availableCapacity }} u
                  </strong>
                  <span class="text-[9.5px] text-zinc-400">Tersedia</span>
                </div>

                <button 
                  @click="openLocationDetailModal(loc)"
                  title="Lihat rincian area ini"
                  class="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
                >
                  <Eye class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- BANNER JEMBATAN KE TABEL KELOLA LOKASI LENGKAP -->
      <div class="glass-card p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-zinc-200/80 dark:border-zinc-800">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100 shrink-0">
            <Boxes class="w-4 h-4" />
          </div>
          <div>
            <h4 class="text-xs font-bold text-zinc-950 dark:text-white">
              Manajemen Master Rak & Pencarian Rinci
            </h4>
            <p class="text-[11px] text-zinc-500 dark:text-zinc-400">
              Gunakan tab Kelola Lokasi untuk pencarian mendalam ratusan rak, penyortiran tabel, pagination, dan perubahan kapasitas.
            </p>
          </div>
        </div>

        <button 
          @click="switchSheet('manage')"
          class="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs"
        >
          Buka Kelola Lokasi ({{ locationsList.length }} Area) &rarr;
        </button>
      </div>

      <!-- Recent Movements Activity Section -->
      <div class="glass-card p-4 sm:p-5">
        <div class="flex items-center justify-between mb-3 pb-2 border-b border-zinc-200/80 dark:border-zinc-800">
          <h2 class="text-xs sm:text-sm font-bold text-zinc-950 dark:text-white flex items-center gap-2">
            <History class="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
            <span>Perpindahan Stok Terakhir (Recent Movement Activity)</span>
          </h2>
          <button @click="switchSheet('movements')" class="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:underline font-bold cursor-pointer">
            Lihat Semua Mutasi &rarr;
          </button>
        </div>

        <div v-if="movementsList.length === 0" class="py-6 text-center text-xs text-zinc-400">
          Belum ada riwayat dokumen pemindahan.
        </div>
        <div v-else class="divide-y divide-zinc-100 dark:divide-zinc-800">
          <div 
            v-for="mov in movementsList.slice(0, 4)" 
            :key="mov.id"
            class="py-2.5 flex items-center justify-between gap-3 text-xs"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div :class="[
                'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-white font-bold text-xs',
                mov.status === 'APPROVED' ? 'bg-zinc-950 dark:bg-zinc-100 dark:text-zinc-950' : 'bg-amber-500'
              ]">
                <Check v-if="mov.status === 'APPROVED'" class="w-3.5 h-3.5" />
                <Clock v-else class="w-3.5 h-3.5" />
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <span class="font-mono font-bold text-zinc-950 dark:text-white">{{ mov.docNo }}</span>
                  <span :class="[
                    'text-[9.5px] font-bold px-2 py-0.2 rounded-full border',
                    mov.status === 'APPROVED' 
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                  ]">
                    {{ mov.status === 'APPROVED' ? 'Disetujui' : 'Draft' }}
                  </span>
                </div>
                <p class="text-[11px] text-zinc-400 truncate mt-0.5">
                  {{ mov.operator || 'Admin' }} • {{ mov.keterangan || 'Pemindahan stok internal' }}
                </p>
              </div>
            </div>

            <div class="text-right shrink-0">
              <span class="font-mono font-bold text-zinc-950 dark:text-white block">{{ mov.totalQty }} Unit</span>
              <span class="text-[10px] text-zinc-400 font-mono">{{ mov.tanggal }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- SHEET 2: KELOLA LOKASI & KAPASITAS (TABEL LIST LENGKAP & PAGINASI) -->
    <!-- ============================================================== -->
    <div v-else-if="activeSubTab === 'manage'" class="space-y-4">
      <div class="glass-card p-4 sm:p-5 space-y-4">
        <!-- Header & Action Ribbon -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200/80 dark:border-zinc-800">
          <div>
            <h2 class="text-sm sm:text-base font-bold text-zinc-950 dark:text-white flex items-center gap-2">
              <Boxes class="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
              <span>Kelola Master Lokasi & Rak Gudang</span>
              <span class="text-[11px] px-2 py-0.5 rounded-full font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 font-mono">
                {{ filteredLocations.length }} Area
              </span>
            </h2>
            <p class="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              Atur kapasitas maksimal, edit detail rak, atau klik baris untuk melihat rincian SKU tersimpan.
            </p>
          </div>

          <div class="flex items-center gap-2 self-start sm:self-auto">
            <button 
              @click="openCreateLocationModal"
              class="flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>Tambah Lokasi / Rak Baru</span>
            </button>
          </div>
        </div>

        <!-- Toolbar: Search, Filter Tipe, Filter Status Okupansi, Sort & Reset -->
        <div class="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
          <!-- Search Box -->
          <div class="sm:col-span-4 relative">
            <Search class="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              v-model="locationSearch" 
              type="text" 
              placeholder="Cari kode area, nama, tipe, SKU barang..." 
              class="w-full pl-8 pr-3 py-1.5 glass-input rounded-xl text-xs"
            />
          </div>

          <!-- Filter Kategori / Tipe -->
          <div class="sm:col-span-3">
            <select 
              v-model="locationTypeFilter"
              class="w-full px-2.5 py-1.5 glass-input rounded-xl text-xs font-medium"
            >
              <option value="ALL">Semua Kategori Tipe</option>
              <option v-for="t in uniqueLocationTypes" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>

          <!-- Filter Status Okupansi -->
          <div class="sm:col-span-3">
            <select 
              v-model="locationStatusFilter"
              class="w-full px-2.5 py-1.5 glass-input rounded-xl text-xs font-semibold"
            >
              <option value="ALL">Semua Status Okupansi</option>
              <option value="FULL">🔴 Penuh (100%)</option>
              <option value="WARNING">🟡 Hampir Penuh (&ge;85%)</option>
              <option value="OPTIMAL">🟢 Optimal (16% - 84%)</option>
              <option value="LOW">🔵 Kapasitas Lega (&le;15%)</option>
            </select>
          </div>

          <!-- Sort Dropdown & Toggle Order -->
          <div class="sm:col-span-2 flex items-center gap-1.5">
            <select 
              v-model="locationSortKey"
              class="w-full px-2 py-1.5 glass-input rounded-xl text-xs font-medium"
              title="Urutkan Berdasarkan"
            >
              <option value="code">Kode Lokasi</option>
              <option value="name">Nama Area</option>
              <option value="occupancyPercent">Okupansi (%)</option>
              <option value="currentQty">Beban Terisi</option>
              <option value="maxCapacity">Kapasitas Maks</option>
              <option value="itemsCount">Jumlah SKU</option>
            </select>

            <button 
              @click="locationSortOrder = (locationSortOrder === 'asc' ? 'desc' : 'asc')"
              class="p-1.5 glass-input rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white shrink-0 cursor-pointer"
              :title="locationSortOrder === 'asc' ? 'Urutan Naik (A-Z / Rendah ke Tinggi)' : 'Urutan Turun (Z-A / Tinggi ke Rendah)'"
            >
              <component :is="locationSortOrder === 'asc' ? ArrowUp : ArrowDown" class="w-3.5 h-3.5" />
            </button>

            <button 
              v-if="isLocationFilterActive"
              @click="resetLocationFilters"
              class="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl shrink-0 cursor-pointer"
              title="Reset Semua Filter"
            >
              <RotateCcw class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <!-- Skeleton Loading State -->
        <div v-if="isLoading" class="space-y-2">
          <div class="md:hidden">
            <SkeletonLoader type="card-list" :count="4" />
          </div>
          <div class="hidden md:block">
            <SkeletonLoader type="table" :count="6" />
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredLocations.length === 0" class="py-12 text-center text-zinc-400 text-xs">
          <Boxes class="w-8 h-8 mx-auto mb-2 opacity-30 text-zinc-500" />
          <p class="font-bold text-zinc-700 dark:text-zinc-300">Tidak ada area lokasi yang sesuai filter pencarian.</p>
          <p class="text-[11px] mt-0.5">Coba sesuaikan kata kunci pencarian atau reset filter.</p>
          <button 
            v-if="isLocationFilterActive"
            @click="resetLocationFilters"
            class="mt-3 px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-semibold hover:bg-zinc-200 cursor-pointer"
          >
            Reset Filter
          </button>
        </div>

        <!-- Content: Mobile List Rows & Desktop Table List (Paginated) -->
        <div v-else class="space-y-3">
          <!-- MOBILE VIEW (< md): Dense Compact List Rows -->
          <div class="md:hidden space-y-2">
            <div 
              v-for="loc in paginatedLocations" 
              :key="loc.code"
              @click="openLocationDetailModal(loc)"
              class="glass-card p-2.5 space-y-1.5 transition-all cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-700 active:scale-[0.99] border-l-2"
              :class="[
                loc.occupancyPercent >= 90 ? 'border-l-rose-500' :
                loc.occupancyPercent >= 75 ? 'border-l-amber-500' : 'border-l-emerald-500'
              ]"
            >
              <!-- Baris 1: Kode, Nama Area, Badge Status -->
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-1.5 min-w-0">
                  <span class="font-mono font-bold text-[11px] bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 shrink-0">
                    {{ loc.code }}
                  </span>
                  <h3 class="text-xs font-bold text-zinc-900 dark:text-white truncate">
                    {{ loc.name }}
                  </h3>
                  <span class="text-[9.5px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded-full shrink-0 hidden xs:inline">
                    {{ loc.type }}
                  </span>
                </div>

                <div class="flex items-center gap-1 shrink-0">
                  <span :class="['text-[9px] font-bold px-2 py-0.5 rounded-full border', loc.statusColor]">
                    {{ loc.statusLabel }}
                  </span>
                </div>
              </div>

              <!-- Baris 2: Strip Beban Okupansi & Mini Visual Progress -->
              <div class="flex items-center justify-between text-[11px] bg-zinc-50 dark:bg-zinc-900/60 px-2.5 py-1 rounded-lg border border-zinc-200/60 dark:border-zinc-800 gap-2">
                <div class="flex items-center gap-1.5 min-w-0">
                  <div class="w-10 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden shrink-0">
                    <div 
                      :class="[
                        'h-full rounded-full',
                        loc.occupancyPercent >= 90 ? 'bg-rose-500' :
                        loc.occupancyPercent >= 75 ? 'bg-amber-500' : 'bg-emerald-500'
                      ]"
                      :style="{ width: `${loc.occupancyPercent}%` }"
                    ></div>
                  </div>
                  <span class="font-bold text-zinc-900 dark:text-zinc-100 font-mono text-xs">
                    {{ loc.currentQty }}/{{ loc.maxCapacity }}
                  </span>
                  <span class="text-[10px] text-zinc-400">({{ loc.occupancyPercent }}%)</span>
                </div>

                <div class="flex items-center gap-2 text-[10px] text-zinc-500 shrink-0 font-medium">
                  <span>{{ loc.items.length }} SKU</span>
                  <span>•</span>
                  <span>Sisa: {{ loc.availableCapacity }}</span>
                </div>
              </div>

              <!-- Baris 3: Aksi Cepat Edit & Hapus -->
              <div class="flex items-center justify-between pt-0.5">
                <span class="text-[10px] text-zinc-400 truncate max-w-[150px]">
                  {{ loc.keterangan || 'Tanpa catatan' }}
                </span>

                <div class="flex items-center gap-1" @click.stop>
                  <button 
                    @click="openLocationDetailModal(loc)"
                    title="Lihat Item di Lokasi Ini"
                    class="px-2 py-0.5 rounded-lg text-[10.5px] font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Eye class="w-3 h-3" />
                    <span>Detail</span>
                  </button>
                  <button 
                    @click="openEditLocationModal(loc)"
                    title="Edit Lokasi & Kapasitas"
                    class="px-2 py-0.5 rounded-lg text-[10.5px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Pencil class="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button 
                    @click="deleteLocation(loc)"
                    title="Hapus Lokasi"
                    class="p-1 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors cursor-pointer"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- DESKTOP VIEW (>= md): Tabel List Data Kompak -->
          <div class="hidden md:block border border-zinc-200/80 dark:border-zinc-800 rounded-xl overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse text-xs">
                <thead>
                  <tr class="bg-zinc-100/70 dark:bg-zinc-800/70 border-b border-zinc-200 dark:border-zinc-700 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase select-none">
                    <th @click="toggleLocationSort('code')" class="py-2.5 px-3 cursor-pointer hover:text-zinc-950 dark:hover:text-white transition-colors">
                      <div class="flex items-center gap-1">
                        <span>Kode Lokasi</span>
                        <component :is="getLocationSortIcon('code')" class="w-3 h-3 text-zinc-400" />
                      </div>
                    </th>
                    <th @click="toggleLocationSort('name')" class="py-2.5 px-3 cursor-pointer hover:text-zinc-950 dark:hover:text-white transition-colors">
                      <div class="flex items-center gap-1">
                        <span>Nama Area / Deskripsi</span>
                        <component :is="getLocationSortIcon('name')" class="w-3 h-3 text-zinc-400" />
                      </div>
                    </th>
                    <th class="py-2.5 px-3">Kategori</th>
                    <th @click="toggleLocationSort('maxCapacity')" class="py-2.5 px-3 text-right cursor-pointer hover:text-zinc-950 dark:hover:text-white transition-colors">
                      <div class="flex items-center justify-end gap-1">
                        <span>Kapasitas Maks</span>
                        <component :is="getLocationSortIcon('maxCapacity')" class="w-3 h-3 text-zinc-400" />
                      </div>
                    </th>
                    <th @click="toggleLocationSort('currentQty')" class="py-2.5 px-3 text-right cursor-pointer hover:text-zinc-950 dark:hover:text-white transition-colors">
                      <div class="flex items-center justify-end gap-1">
                        <span>Terisi</span>
                        <component :is="getLocationSortIcon('currentQty')" class="w-3 h-3 text-zinc-400" />
                      </div>
                    </th>
                    <th @click="toggleLocationSort('occupancyPercent')" class="py-2.5 px-3 w-40 text-center cursor-pointer hover:text-zinc-950 dark:hover:text-white transition-colors">
                      <div class="flex items-center justify-center gap-1">
                        <span>Beban Okupansi</span>
                        <component :is="getLocationSortIcon('occupancyPercent')" class="w-3 h-3 text-zinc-400" />
                      </div>
                    </th>
                    <th @click="toggleLocationSort('itemsCount')" class="py-2.5 px-3 text-center cursor-pointer hover:text-zinc-950 dark:hover:text-white transition-colors">
                      <div class="flex items-center justify-center gap-1">
                        <span>SKU</span>
                        <component :is="getLocationSortIcon('itemsCount')" class="w-3 h-3 text-zinc-400" />
                      </div>
                    </th>
                    <th class="py-2.5 px-3 text-center">Status</th>
                    <th class="py-2.5 px-3 text-center w-28">Aksi</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800/80 text-zinc-700 dark:text-zinc-300">
                  <tr 
                    v-for="loc in paginatedLocations" 
                    :key="loc.code"
                    @click="openLocationDetailModal(loc)"
                    class="hover:bg-zinc-100/60 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors group"
                    title="Klik baris untuk melihat detail isi barang di lokasi ini"
                  >
                    <!-- Kode -->
                    <td class="py-2.5 px-3 font-mono">
                      <span class="font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
                        {{ loc.code }}
                      </span>
                    </td>

                    <!-- Nama & Catatan -->
                    <td class="py-2.5 px-3 min-w-0 max-w-[220px]">
                      <strong class="font-bold text-zinc-900 dark:text-white block truncate group-hover:underline">
                        {{ loc.name }}
                      </strong>
                      <span class="text-[10px] text-zinc-400 block truncate">{{ loc.keterangan || '-' }}</span>
                    </td>

                    <!-- Kategori -->
                    <td class="py-2.5 px-3">
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                        {{ loc.type }}
                      </span>
                    </td>

                    <!-- Kapasitas Maks -->
                    <td class="py-2.5 px-3 text-right font-mono font-bold text-zinc-900 dark:text-white">
                      {{ loc.maxCapacity }}
                    </td>

                    <!-- Terisi -->
                    <td class="py-2.5 px-3 text-right font-mono font-extrabold text-zinc-950 dark:text-white">
                      {{ loc.currentQty }}
                    </td>

                    <!-- Gauge Progress Bar Okupansi -->
                    <td class="py-2.5 px-3">
                      <div class="space-y-1">
                        <div class="flex items-center justify-between text-[10px] font-mono">
                          <span class="font-bold text-zinc-700 dark:text-zinc-300">{{ loc.occupancyPercent }}%</span>
                          <span class="text-zinc-400">Sisa: {{ loc.availableCapacity }}</span>
                        </div>
                        <div class="w-full bg-zinc-200 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                          <div 
                            :class="[
                              'h-full rounded-full transition-all duration-300',
                              loc.occupancyPercent >= 90 ? 'bg-rose-500' :
                              loc.occupancyPercent >= 75 ? 'bg-amber-500' : 'bg-emerald-500'
                            ]"
                            :style="{ width: `${loc.occupancyPercent}%` }"
                          ></div>
                        </div>
                      </div>
                    </td>

                    <!-- Jumlah SKU -->
                    <td class="py-2.5 px-3 text-center">
                      <span class="font-mono text-xs font-bold text-zinc-700 dark:text-zinc-300 px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">
                        {{ loc.items.length }} SKU
                      </span>
                    </td>

                    <!-- Status -->
                    <td class="py-2.5 px-3 text-center">
                      <span :class="['text-[10px] font-bold px-2 py-0.5 rounded-full border', loc.statusColor]">
                        {{ loc.statusLabel }}
                      </span>
                    </td>

                    <!-- Aksi -->
                    <td class="py-2.5 px-3 text-center" @click.stop>
                      <div class="flex items-center justify-center gap-1">
                        <button 
                          @click="openLocationDetailModal(loc)"
                          title="Lihat Rincian Barang"
                          class="p-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
                        >
                          <Eye class="w-3.5 h-3.5" />
                        </button>
                        <button 
                          @click="openEditLocationModal(loc)"
                          title="Edit Lokasi & Kapasitas"
                          class="p-1 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-950/40 text-amber-600 transition-colors cursor-pointer"
                        >
                          <Pencil class="w-3.5 h-3.5" />
                        </button>
                        <button 
                          @click="deleteLocation(loc)"
                          title="Hapus Lokasi"
                          class="p-1 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/40 text-rose-600 transition-colors cursor-pointer"
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

          <!-- Pagination Component (Mendukung Navigasi Ribuan Baris Data) -->
          <Pagination 
            :current-page="locCurrentPage"
            :page-size="locPageSize"
            :total-items="filteredLocations.length"
            @update:current-page="locCurrentPage = $event"
            @update:page-size="locPageSize = $event"
          />
        </div>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- ============================================================== -->
    <!-- SHEET 3: LIST DOKUMEN MOVEMENT (PAGINATED & RESPONSIVE)         -->
    <!-- ============================================================== -->
    <div v-else-if="activeSubTab === 'movements'" class="space-y-4">
      <div class="glass-card p-4 sm:p-5 space-y-4">
        <!-- Toolbar & Header Ribbon -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-zinc-200/80 dark:border-zinc-800">
          <div>
            <h2 class="text-sm sm:text-base font-bold text-zinc-950 dark:text-white flex items-center gap-2">
              <FileText class="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
              <span>Daftar Dokumen Mutasi Internal</span>
              <span class="text-[11px] px-2 py-0.5 rounded-full font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 font-mono">
                {{ filteredMovements.length }} Dokumen
              </span>
            </h2>
            <p class="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              Riwayat dokumen pemindahan barang antar rak, approval, dan pelacakan audit stok.
            </p>
          </div>

          <!-- Tombol Buat Lembar Kerja Baru -->
          <button 
            @click="openNewWorksheet"
            class="flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 rounded-xl text-xs font-bold shadow-xs transition-all self-start sm:self-auto cursor-pointer"
          >
            <ArrowLeftRight class="w-3.5 h-3.5" />
            <span>+ Buat Movement Worksheet</span>
          </button>
        </div>

        <!-- Filter & Search Toolbar -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
          <!-- Search Input -->
          <div class="relative max-w-sm w-full">
            <Search class="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              v-model="movementSearch" 
              type="text" 
              placeholder="Cari no doc, operator, catatan..." 
              class="w-full pl-8 pr-3 py-1.5 glass-input rounded-xl text-xs"
            />
          </div>

          <!-- Status Filter Tabs -->
          <div class="flex items-center gap-1 p-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs font-semibold self-start sm:self-auto border border-zinc-200 dark:border-zinc-700">
            <button 
              @click="movementStatusFilter = 'ALL'"
              :class="['px-2.5 py-1 rounded-md transition-all cursor-pointer', movementStatusFilter === 'ALL' ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white']"
            >
              Semua
            </button>
            <button 
              @click="movementStatusFilter = 'DRAFT'"
              :class="['px-2.5 py-1 rounded-md transition-all cursor-pointer', movementStatusFilter === 'DRAFT' ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white']"
            >
              Draft
            </button>
            <button 
              @click="movementStatusFilter = 'APPROVED'"
              :class="['px-2.5 py-1 rounded-md transition-all cursor-pointer', movementStatusFilter === 'APPROVED' ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white']"
            >
              Disetujui
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredMovements.length === 0" class="py-12 text-center text-zinc-400 text-xs">
          <FileText class="w-8 h-8 mx-auto mb-2 opacity-30 text-zinc-500" />
          <p class="font-bold text-zinc-700 dark:text-zinc-300">Tidak ada dokumen perpindahan yang cocok.</p>
          <p class="text-[11px] mt-0.5">Coba sesuaikan kata kunci pencarian atau buat dokumen baru.</p>
        </div>

        <!-- Content: Mobile View & Desktop Table -->
        <div v-else class="space-y-3">
          <!-- MOBILE VIEW (< md): Dense Rows -->
          <div class="md:hidden space-y-2">
            <div 
              v-for="mov in paginatedMovements" 
              :key="mov.id"
              @click="openMovementDetailModal(mov)"
              class="glass-card p-3 space-y-2 transition-all cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-700 active:scale-[0.99]"
            >
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="font-mono font-bold text-xs text-zinc-950 dark:text-white truncate">
                    {{ mov.docNo }}
                  </span>
                  <span :class="[
                    'text-[9px] font-bold px-2 py-0.2 rounded-full border',
                    mov.status === 'APPROVED' 
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                  ]">
                    {{ mov.status === 'APPROVED' ? 'Disetujui' : 'Draft' }}
                  </span>
                </div>

                <span class="text-[10px] text-zinc-400 font-mono">{{ mov.tanggal }}</span>
              </div>

              <div class="flex items-center justify-between text-xs bg-zinc-50 dark:bg-zinc-900/60 px-2.5 py-1.5 rounded-lg border border-zinc-200/60 dark:border-zinc-800">
                <span class="text-zinc-500 text-[11px]">{{ mov.operator || 'Admin' }}</span>
                <div class="flex items-center gap-2 font-mono">
                  <span class="text-zinc-400 text-[10px]">{{ mov.totalItems }} SKU</span>
                  <span>•</span>
                  <strong class="font-extrabold text-zinc-950 dark:text-white">{{ mov.totalQty }} Unit</strong>
                </div>
              </div>

              <div class="flex items-center justify-between pt-0.5 text-xs">
                <span class="text-[10px] text-zinc-400 truncate max-w-[150px]">
                  {{ mov.keterangan || '-' }}
                </span>

                <div class="flex items-center gap-1" @click.stop>
                  <button 
                    @click="openMovementDetailModal(mov)"
                    class="px-2 py-0.5 rounded-lg text-[10.5px] font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 cursor-pointer"
                  >
                    Detail
                  </button>
                  <button 
                    v-if="mov.status === 'DRAFT'"
                    @click="approveMovementDoc(mov)"
                    class="px-2 py-0.5 rounded-lg text-[10.5px] font-bold text-white bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 cursor-pointer"
                  >
                    Setujui
                  </button>
                  <button 
                    v-if="mov.status === 'DRAFT'"
                    @click="editDraftMovement(mov)"
                    class="p-1 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 cursor-pointer"
                  >
                    <Pencil class="w-3.5 h-3.5" />
                  </button>
                  <button 
                    v-if="mov.status === 'DRAFT'"
                    @click="deleteDraftMovement(mov)"
                    class="p-1 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- DESKTOP VIEW (>= md): Tabel Dokumen Movement -->
          <div class="hidden md:block border border-zinc-200/80 dark:border-zinc-800 rounded-xl overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse text-xs">
                <thead>
                  <tr class="bg-zinc-100/70 dark:bg-zinc-800/70 border-b border-zinc-200 dark:border-zinc-700 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase select-none">
                    <th class="py-2.5 px-3">No. Dokumen</th>
                    <th class="py-2.5 px-3">Tanggal</th>
                    <th class="py-2.5 px-3">Operator / PIC</th>
                    <th class="py-2.5 px-3 text-center">Total Item</th>
                    <th class="py-2.5 px-3 text-right">Total Qty Pindah</th>
                    <th class="py-2.5 px-3 text-center">Status</th>
                    <th class="py-2.5 px-3">Catatan</th>
                    <th class="py-2.5 px-3 text-center w-36">Aksi</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800/80 text-zinc-700 dark:text-zinc-300">
                  <tr 
                    v-for="mov in paginatedMovements" 
                    :key="mov.id"
                    @click="openMovementDetailModal(mov)"
                    class="hover:bg-zinc-100/60 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
                  >
                    <!-- No Doc -->
                    <td class="py-2.5 px-3 font-mono font-bold text-zinc-950 dark:text-white">
                      {{ mov.docNo }}
                    </td>

                    <!-- Tanggal -->
                    <td class="py-2.5 px-3 font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                      {{ mov.tanggal }}
                    </td>

                    <!-- Operator -->
                    <td class="py-2.5 px-3 font-medium text-zinc-900 dark:text-zinc-200">
                      {{ mov.operator || '-' }}
                    </td>

                    <!-- Total Lines -->
                    <td class="py-2.5 px-3 text-center font-bold">
                      {{ mov.totalItems }} SKU
                    </td>

                    <!-- Total Qty -->
                    <td class="py-2.5 px-3 text-right font-mono font-extrabold text-zinc-950 dark:text-white">
                      {{ mov.totalQty }} unit
                    </td>

                    <!-- Status Badge -->
                    <td class="py-2.5 px-3 text-center">
                      <span :class="[
                        'inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border',
                        mov.status === 'APPROVED' 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                      ]">
                        <Check v-if="mov.status === 'APPROVED'" class="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <Clock v-else class="w-3 h-3 text-amber-600 dark:text-amber-400" />
                        <span>{{ mov.status === 'APPROVED' ? 'Disetujui' : 'Draft' }}</span>
                      </span>
                    </td>

                    <!-- Catatan -->
                    <td class="py-2.5 px-3 text-[11px] text-zinc-500 max-w-xs truncate">
                      {{ mov.keterangan || '-' }}
                    </td>

                    <!-- Aksi -->
                    <td class="py-2.5 px-3 text-center" @click.stop>
                      <div class="flex items-center justify-center gap-1.5">
                        <button 
                          @click="openMovementDetailModal(mov)"
                          title="Lihat Detail Perpindahan"
                          class="px-2 py-1 rounded-lg text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                        >
                          Detail
                        </button>

                        <!-- Tombol Cepat Cetak PDF & Excel -->
                        <button 
                          @click="printMovementWorksheetDocument(mov, mov.items)"
                          title="Cetak Dokumen / Simpan PDF"
                          class="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
                        >
                          <Printer class="w-3.5 h-3.5" />
                        </button>
                        <button 
                          @click="exportMovementWorksheetExcel(mov, mov.items)"
                          title="Ekspor Dokumen ke Excel (.xlsx)"
                          class="p-1 rounded-lg text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer transition-colors"
                        >
                          <FileSpreadsheet class="w-3.5 h-3.5" />
                        </button>

                        <button 
                          v-if="mov.status === 'DRAFT'"
                          @click="approveMovementDoc(mov)"
                          title="Setujui dan Eksekusi Pindah Stok Sekarang"
                          class="px-2 py-1 rounded-lg text-[11px] font-bold text-white bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Check class="w-3 h-3" />
                          <span>Setujui</span>
                        </button>

                        <button 
                          v-if="mov.status === 'DRAFT'"
                          @click="editDraftMovement(mov)"
                          title="Edit Dokumen Draft"
                          class="p-1 rounded-lg text-zinc-500 hover:text-amber-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                        >
                          <Pencil class="w-3.5 h-3.5" />
                        </button>

                        <span 
                          v-else
                          title="Dokumen telah disetujui & terkunci permanen"
                          class="p-1 text-zinc-400 inline-flex items-center"
                        >
                          <Lock class="w-3.5 h-3.5" />
                        </span>

                        <button 
                          v-if="mov.status === 'DRAFT'"
                          @click="deleteDraftMovement(mov)"
                          title="Hapus Dokumen Draft"
                          class="p-1 rounded-lg text-zinc-500 hover:text-rose-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
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

          <!-- Pagination Component -->
          <Pagination 
            :current-page="movCurrentPage"
            :page-size="movPageSize"
            :total-items="filteredMovements.length"
            @update:current-page="movCurrentPage = $event"
            @update:page-size="movPageSize = $event"
          />
        </div>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- ============================================================== -->
    <!-- SHEET 4: MOVEMENT WORKSHEET (LEMBAR KERJA MUTASI MULTI-ITEM)   -->
    <!-- ============================================================== -->
    <div v-else-if="activeSubTab === 'worksheet'" class="space-y-4">
      <!-- Worksheet Header Form Card -->
      <div class="glass-card p-4 sm:p-5 space-y-4 border-l-2 border-l-zinc-950 dark:border-l-white">
        <div class="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 flex items-center justify-center font-bold">
              <ArrowLeftRight class="w-4 h-4" />
            </div>
            <div>
              <h2 class="text-sm font-bold text-zinc-950 dark:text-white">
                {{ editingMovementId ? 'Edit Movement Worksheet' : 'Lembar Kerja Pemindahan Barang (Movement Worksheet)' }}
              </h2>
              <p class="text-[11px] text-zinc-500 dark:text-zinc-400">Pindahkan stok item dari satu lokasi ke lokasi lain secara spesifik.</p>
            </div>
          </div>
          <button 
            @click="switchSheet('movements')"
            class="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            &larr; Kembali ke List
          </button>
        </div>

        <!-- Document Meta Inputs -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label class="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">No. Dokumen Movement</label>
            <input 
              v-model="worksheetHeader.docNo" 
              type="text" 
              readonly
              class="w-full px-3 py-1.5 glass-input rounded-xl font-mono font-bold bg-zinc-100/80 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300"
            />
          </div>

          <div>
            <label class="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Tanggal Pemindahan</label>
            <input 
              v-model="worksheetHeader.tanggal" 
              type="date" 
              class="w-full px-3 py-1.5 glass-input rounded-xl"
            />
          </div>

          <div>
            <label class="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Operator / Penanggung Jawab</label>
            <input 
              v-model="worksheetHeader.operator" 
              type="text" 
              placeholder="Nama staf gudang..." 
              class="w-full px-3 py-1.5 glass-input rounded-xl"
            />
          </div>

          <div class="sm:col-span-3">
            <label class="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Keterangan / Alasan Pemindahan</label>
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
        <h3 class="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
          <Plus class="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100" />
          <span>Tambah Item ke Lembar Kerja</span>
        </h3>

        <!-- Smart Search SKU / Nama Barang -->
        <div class="relative">
          <label class="block font-semibold text-xs text-zinc-700 dark:text-zinc-300 mb-1">
            Cari Barang (Smart Search)
          </label>
          <div class="relative">
            <Search class="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              ref="smartSearchInputRef"
              v-model="typedItemSearch" 
              @focus="isSmartDropdownOpen = true"
              @keydown.down.prevent="navigateItemSuggestions(1)"
              @keydown.up.prevent="navigateItemSuggestions(-1)"
              @keydown.enter.prevent="selectHighlightedItem"
              @keydown.esc="isSmartDropdownOpen = false"
              type="text" 
              placeholder="Ketik kode SKU (misal: BRG-001) atau nama barang..." 
              class="w-full pl-9 pr-3 py-2 glass-input rounded-xl text-xs font-medium"
            />
          </div>

          <!-- Dropdown Smart Suggestions -->
          <div 
            v-if="isSmartDropdownOpen && matchingItemSuggestions.length > 0"
            class="absolute z-30 left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl max-h-56 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800"
          >
            <div 
              v-for="(item, sIdx) in matchingItemSuggestions" 
              :key="item.uniqCode"
              @mouseenter="highlightedItemIndex = sIdx"
              @mousedown="selectItemForMovement(item)"
              :class="[
                'p-2.5 cursor-pointer flex items-center justify-between text-xs transition-colors',
                highlightedItemIndex === sIdx 
                  ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-medium' 
                  : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200'
              ]"
            >
              <div class="min-w-0">
                <span 
                  :class="[
                    'font-mono font-bold text-[10px] px-1.5 py-0.5 rounded mr-1.5 border',
                    highlightedItemIndex === sIdx
                      ? 'bg-zinc-800 text-zinc-100 dark:bg-zinc-200 dark:text-zinc-900 border-zinc-700 dark:border-zinc-300'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                  ]"
                >
                  {{ item.uniqCode }}
                </span>
                <span class="font-semibold">{{ item.deskripsi }}</span>
              </div>
              <div class="text-right shrink-0 ml-3">
                <span 
                  :class="[
                    'text-[11px] font-bold font-mono',
                    highlightedItemIndex === sIdx ? 'text-white dark:text-zinc-950' : 'text-zinc-950 dark:text-white'
                  ]"
                >
                  Stok: {{ item.currentStock }} {{ item.satuan }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Banner Deteksi Lokasi Fisik Barang Terpilih -->
        <div 
          v-if="selectedItemObj" 
          class="p-3.5 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="font-mono font-bold text-xs bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 px-2 py-0.5 rounded">
                {{ selectedItemObj.uniqCode }}
              </span>
              <strong class="text-xs sm:text-sm text-zinc-950 dark:text-white">{{ selectedItemObj.deskripsi }}</strong>
              <span class="text-xs text-zinc-400">({{ selectedItemObj.satuan }})</span>
            </div>
            <button @click="clearSelectedItem" class="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer">
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Visual Deteksi Lokasi Item -->
          <div class="pt-1">
            <span class="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
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
                    ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 border-zinc-950 dark:border-white shadow-xs' 
                    : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400'
                ]"
              >
                <span class="font-mono font-bold">{{ loc.locationCode }}</span>
                <span class="text-[11px] opacity-90">{{ loc.locationName }}</span>
                <span class="font-mono font-bold px-1.5 py-0.2 rounded bg-black/10 dark:bg-white/10 text-[10px]">
                  {{ loc.qty }} {{ selectedItemObj.satuan }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Form Pemilihan From, To, Qty, dan Indikator Kapasitas Maksimal -->
        <div v-if="selectedItemObj && selectedItemLocations.length > 0" class="grid grid-cols-1 sm:grid-cols-12 gap-2.5 text-xs pt-1">
          <!-- From Location (Smart Search Dropdown) -->
          <div class="sm:col-span-3">
            <label class="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Dari Lokasi Asal (From)
            </label>
            <SmartSearchSelect 
              v-model="draftFromLocation"
              :options="fromLocationOptions"
              placeholder="Pilih lokasi asal..."
              search-placeholder="Cari lokasi asal..."
            />
            <span v-if="selectedFromLocInfo" class="text-[10px] text-zinc-400 mt-0.5 block font-mono">
              Maks: <strong class="text-zinc-700 dark:text-zinc-300 font-mono">{{ availableToMove }} {{ selectedItemObj?.satuan }}</strong>
            </span>
          </div>

          <!-- To Location (Smart Search Dropdown) -->
          <div class="sm:col-span-3">
            <label class="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Ke Lokasi Tujuan (To)
            </label>
            <SmartSearchSelect 
              v-model="draftToLocation"
              :options="destinationLocationOptions"
              placeholder="Pilih lokasi/rak tujuan..."
              search-placeholder="Cari kode rak atau nama area..."
            />
            <span v-if="selectedToLocInfo" class="text-[10px] text-zinc-400 mt-0.5 block font-mono">
              Kapasitas: {{ selectedToLocInfo.currentQty }}/{{ selectedToLocInfo.maxCapacity }} unit
            </span>
          </div>

          <!-- Qty Pindah -->
          <div class="sm:col-span-2">
            <label class="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Qty Dipindahkan
            </label>
            <input 
              v-model.number="draftMoveQty" 
              type="number" 
              min="1" 
              :max="availableToMove || 999"
              class="w-full px-3 py-1.5 glass-input rounded-xl font-bold font-mono text-zinc-950 dark:text-zinc-100"
            />
            <span v-if="selectedItemObj" class="text-[10px] text-zinc-400 mt-0.5 block">
              Satuan: {{ selectedItemObj.satuan }}
            </span>
          </div>

          <!-- Catatan Baris -->
          <div class="sm:col-span-2">
            <label class="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Catatan Baris
            </label>
            <input 
              v-model="draftItemNote" 
              type="text" 
              placeholder="Catatan..."
              class="w-full px-3 py-1.5 glass-input rounded-xl text-xs"
            />
          </div>

          <!-- Tombol Tambah ke Tabel -->
          <div class="sm:col-span-2 flex items-end">
            <button 
              @click="addItemRowToWorksheet"
              class="w-full py-1.5 px-3 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs"
            >
              <Plus class="w-4 h-4 shrink-0" />
              <span>+ Tambah</span>
            </button>
          </div>
        </div>

        <!-- Live Indikator Kapasitas Maksimal Lokasi Tujuan -->
        <div 
          v-if="selectedToLocInfo && draftMoveQty > 0"
          :class="[
            'p-3 rounded-xl border text-xs transition-all space-y-1',
            isToOverCapacity 
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300' 
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
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
      <div class="glass-card overflow-hidden border border-zinc-200/80 dark:border-zinc-800">
        <div class="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h3 class="text-xs font-bold text-zinc-950 dark:text-white">
              Daftar Barang yang Dipindahkan ({{ worksheetItems.length }} Baris)
            </h3>
            <p class="text-[11px] text-zinc-400">Anda dapat memindahkan banyak barang dari lokasi berbeda ke tujuan berbeda dalam 1 dokumen ini.</p>
          </div>
          <span class="text-xs font-extrabold text-zinc-950 dark:text-white font-mono">
            Total Qty: {{ totalWorksheetQty }} Unit
          </span>
        </div>

        <div class="overflow-x-auto touch-pan-x">
          <table class="min-w-[840px] w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-zinc-100/70 dark:bg-zinc-800/70 border-b border-zinc-200/80 dark:border-zinc-800 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase select-none">
                <th class="py-2.5 px-3 text-center w-12">No</th>
                <th class="py-2.5 px-3 min-w-[200px]">Kode & Nama Barang</th>
                <th class="py-2.5 px-3 w-32">Dari (From)</th>
                <th class="py-2.5 px-1 text-center w-8">&rarr;</th>
                <th class="py-2.5 px-3 min-w-[200px]">Ke (To)</th>
                <th class="py-2.5 px-3 text-right w-32">Qty Pindah</th>
                <th class="py-2.5 px-3 min-w-[160px]">Catatan Baris</th>
                <th class="py-2.5 px-3 text-center w-16">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
              <tr v-if="worksheetItems.length === 0">
                <td colspan="8" class="py-10 text-center text-zinc-400 text-xs">
                  Belum ada item dalam lembar kerja ini. Gunakan kolom Smart Search di atas untuk menambahkan.
                </td>
              </tr>
              <tr 
                v-for="(item, idx) in worksheetItems" 
                :key="idx"
                class="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40"
              >
                <!-- 1. No -->
                <td class="py-2.5 px-3 text-center text-zinc-400 font-mono w-12">{{ idx + 1 }}</td>
                
                <!-- 2. Kode & Nama Barang -->
                <td class="py-2.5 px-3 min-w-[200px]">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span class="font-mono font-bold text-[10px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100">
                      {{ item.uniqCode }}
                    </span>
                    <span class="font-semibold text-zinc-900 dark:text-white">{{ item.deskripsi }}</span>
                  </div>
                </td>
                
                <!-- 3. Dari (From) -->
                <td class="py-2.5 px-3 w-32 font-mono font-bold">
                  <span class="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 inline-block">
                    {{ item.fromLocation }}
                  </span>
                </td>
                
                <!-- 4. Panah (->) -->
                <td class="py-2.5 px-1 text-center font-bold text-zinc-400 dark:text-zinc-500 w-8 select-none">
                  &rarr;
                </td>
                
                <!-- 5. Ke (To) -->
                <td class="py-2.5 px-3 min-w-[200px]">
                  <SmartSearchSelect 
                    v-model="item.toLocation"
                    :options="allLocationOptions.filter(l => l.value !== item.fromLocation)"
                    placeholder="Pilih rak tujuan..."
                    search-placeholder="Cari rak tujuan..."
                  />
                </td>
                
                <!-- 6. Qty Pindah -->
                <td class="py-2.5 px-3 text-right font-mono font-black text-zinc-950 dark:text-white w-32">
                  <div class="flex items-center justify-end gap-1.5">
                    <input 
                      v-model.number="item.qty" 
                      type="number" 
                      min="1" 
                      class="w-18 px-2 py-1 glass-input rounded-lg text-right font-bold font-mono text-xs focus:ring-1 focus:ring-zinc-950 dark:focus:ring-white" 
                    />
                    <span class="text-[10px] text-zinc-400 font-normal shrink-0">{{ item.satuan }}</span>
                  </div>
                </td>
                
                <!-- 7. Catatan Baris -->
                <td class="py-2.5 px-3 min-w-[160px] text-[11px] text-zinc-500">
                  <input 
                    v-model="item.keterangan" 
                    type="text" 
                    placeholder="Catatan perpindahan..." 
                    class="w-full px-2 py-1 glass-input rounded text-xs focus:ring-1 focus:ring-zinc-950 dark:focus:ring-white"
                  />
                </td>
                
                <!-- 8. Aksi -->
                <td class="py-2.5 px-3 text-center w-16">
                  <button 
                    @click="removeWorksheetItem(idx)"
                    class="p-1 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors"
                    title="Hapus baris ini"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Footer Actions Worksheet: Cetak, Ekspor, Simpan Draft & Setujui -->
        <div class="p-4 bg-zinc-50/80 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <button 
            type="button" 
            @click="switchSheet('movements')"
            class="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer"
          >
            Batal
          </button>

          <div class="flex flex-wrap items-center gap-2">
            <!-- Cetak / Simpan PDF Lembar Kerja -->
            <button 
              type="button" 
              @click="printMovementWorksheetDocument(worksheetHeader, worksheetItems)"
              :disabled="worksheetItems.length === 0"
              class="px-3.5 py-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 bg-white hover:bg-zinc-100 dark:bg-zinc-850 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              title="Cetak instruksi kerja mutasi atau simpan PDF"
            >
              <Printer class="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
              <span>Cetak / PDF</span>
            </button>

            <!-- Ekspor Excel Lembar Kerja -->
            <button 
              type="button" 
              @click="exportMovementWorksheetExcel(worksheetHeader, worksheetItems)"
              :disabled="worksheetItems.length === 0"
              class="px-3.5 py-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-800 rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              title="Ekspor Lembar Kerja ke Excel (.xlsx)"
            >
              <FileSpreadsheet class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Ekspor Excel</span>
            </button>

            <!-- Simpan Draft -->
            <button 
              type="button" 
              @click="saveWorksheet(false)"
              :disabled="worksheetItems.length === 0"
              class="px-4 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              💾 Simpan Draf
            </button>

            <!-- Setujui & Eksekusi Langsung -->
            <button 
              type="button" 
              @click="saveWorksheet(true)"
              :disabled="worksheetItems.length === 0"
              class="px-5 py-2 text-xs font-bold text-white bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 rounded-xl shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <Check class="w-4 h-4" />
              <span>Setujui & Pindah Sekarang</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- MODAL 1: TAMBAH / EDIT MASTER LOKASI (MONOCHROME MINIMALIS)    -->
    <!-- ============================================================== -->
    <div 
      v-if="isLocationModalOpen" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-4 transition-all"
    >
      <div class="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col">
        <!-- Top Subtle Strip -->
        <div class="h-1 w-full bg-zinc-950 dark:bg-zinc-100"></div>

        <div class="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <h3 class="text-sm font-bold text-zinc-950 dark:text-white flex items-center gap-2">
            <Boxes class="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
            <span>{{ isEditingLocation ? 'Edit Master Lokasi & Rak' : 'Tambah Area / Rak Baru' }}</span>
          </h3>
          <button @click="isLocationModalOpen = false" class="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer">
            <X class="w-4 h-4" />
          </button>
        </div>

        <form @submit.prevent="saveLocationMaster" class="p-5 space-y-3.5 text-xs">
          <div>
            <label class="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Kode Lokasi (Unik)</label>
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
            <label class="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Nama Area / Deskripsi</label>
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
              <label class="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Kategori / Tipe</label>
              <select 
                v-model="locationForm.type" 
                class="w-full px-3 py-2 glass-input rounded-xl font-medium"
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
              <label class="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Kapasitas Maksimal (Unit)</label>
              <input 
                v-model.number="locationForm.maxCapacity" 
                type="number" 
                min="1" 
                required
                placeholder="200" 
                class="w-full px-3 py-2 glass-input rounded-xl font-bold font-mono text-zinc-950 dark:text-zinc-100"
              />
            </div>
          </div>

          <div>
            <label class="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Keterangan Tambahan</label>
            <input 
              v-model="locationForm.keterangan" 
              type="text" 
              placeholder="Contoh: Khusus dus kemasan & material kertas" 
              class="w-full px-3 py-2 glass-input rounded-xl"
            />
          </div>

          <div class="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-2">
            <button 
              type="button" 
              @click="isLocationModalOpen = false" 
              class="px-3.5 py-2 rounded-xl text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer"
            >
              Batal
            </button>
            <button 
              type="submit" 
              class="px-4 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 font-bold cursor-pointer transition-all"
            >
              Simpan Area
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- MODAL 2: DETAIL ISI BARANG DI DALAM LOKASI (MONOCHROME MINIMALIS) -->
    <!-- ============================================================== -->
    <div 
      v-if="selectedLocationDetail" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-4 transition-all"
    >
      <div class="bg-white dark:bg-zinc-900 w-full max-w-xl rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]">
        <!-- Top Subtle Strip -->
        <div class="h-1 w-full bg-zinc-950 dark:bg-zinc-100"></div>

        <!-- Header Modal -->
        <div class="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-start justify-between gap-3">
          <div class="space-y-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-mono font-bold text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-zinc-100 px-2.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
                {{ selectedLocationDetail.code }}
              </span>
              <span class="text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-full border border-zinc-200/60 dark:border-zinc-700">
                {{ selectedLocationDetail.type }}
              </span>
              <span :class="['text-[9.5px] font-bold px-2 py-0.5 rounded-full border', selectedLocationDetail.statusColor]">
                {{ selectedLocationDetail.statusLabel }}
              </span>
            </div>

            <h3 class="text-base font-bold text-zinc-950 dark:text-white truncate">
              {{ selectedLocationDetail.name }}
            </h3>
            <p v-if="selectedLocationDetail.keterangan" class="text-[11px] text-zinc-500 dark:text-zinc-400">
              {{ selectedLocationDetail.keterangan }}
            </p>
          </div>

          <button 
            @click="selectedLocationDetail = null" 
            class="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 shrink-0 cursor-pointer"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Body Modal -->
        <div class="p-5 overflow-y-auto space-y-4 text-xs">
          <!-- 4 Mini KPI Cards -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div class="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-800">
              <span class="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 block">Kapasitas Maks</span>
              <strong class="font-mono text-sm font-bold text-zinc-950 dark:text-white block mt-0.5">
                {{ selectedLocationDetail.maxCapacity }}
              </strong>
              <span class="text-[9.5px] text-zinc-400">Unit</span>
            </div>

            <div class="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-800">
              <span class="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 block">Beban Terisi</span>
              <strong class="font-mono text-sm font-extrabold text-zinc-950 dark:text-white block mt-0.5">
                {{ selectedLocationDetail.currentQty }}
              </strong>
              <span class="text-[9.5px] text-zinc-400">Unit</span>
            </div>

            <div class="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-800">
              <span class="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 block">Sisa Ruang</span>
              <strong class="font-mono text-sm font-bold text-zinc-950 dark:text-white block mt-0.5">
                {{ selectedLocationDetail.availableCapacity }}
              </strong>
              <span class="text-[9.5px] text-zinc-400">Unit</span>
            </div>

            <div class="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-800 flex flex-col justify-between">
              <span class="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 block">Okupansi</span>
              <div class="mt-0.5">
                <strong class="font-mono text-sm font-extrabold text-zinc-950 dark:text-white">
                  {{ selectedLocationDetail.occupancyPercent }}%
                </strong>
                <div class="w-full bg-zinc-200 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden mt-1">
                  <div 
                    :class="[
                      'h-full rounded-full',
                      selectedLocationDetail.occupancyPercent >= 90 ? 'bg-rose-500' :
                      selectedLocationDetail.occupancyPercent >= 75 ? 'bg-amber-500' : 'bg-emerald-500'
                    ]"
                    :style="{ width: `${selectedLocationDetail.occupancyPercent}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Rincian SKU Tersimpan -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <h4 class="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Boxes class="w-3.5 h-3.5 text-zinc-500" />
                <span>Rincian Barang (SKU) Tersimpan:</span>
              </h4>
              <span class="text-[10.5px] font-mono font-bold text-zinc-600 dark:text-zinc-400">
                {{ selectedLocationDetail.items.length }} SKU
              </span>
            </div>

            <!-- Empty State Barang -->
            <div 
              v-if="selectedLocationDetail.items.length === 0" 
              class="py-8 text-center text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl"
            >
              <Boxes class="w-6 h-6 mx-auto mb-1.5 opacity-30 text-zinc-500" />
              <p class="font-medium text-xs text-zinc-600 dark:text-zinc-400">Lokasi ini saat ini kosong</p>
              <p class="text-[10px] mt-0.5">Belum ada stok barang yang dialokasikan di area ini.</p>
            </div>

            <!-- List SKU Tersimpan (Dense Table List) -->
            <div v-else class="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr class="bg-zinc-100/70 dark:bg-zinc-800/70 border-b border-zinc-200 dark:border-zinc-700 text-[10px] uppercase font-bold text-zinc-500 select-none">
                      <th class="py-2 px-3">Kode SKU</th>
                      <th class="py-2 px-3">Nama Barang</th>
                      <th class="py-2 px-3 text-right">Stok Fisik</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
                    <tr 
                      v-for="item in selectedLocationDetail.items" 
                      :key="item.itemCode"
                      class="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40"
                    >
                      <td class="py-2.5 px-3 font-mono font-bold">
                        <span class="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 text-[11px] text-zinc-900 dark:text-zinc-100">
                          {{ item.itemCode }}
                        </span>
                      </td>
                      <td class="py-2.5 px-3">
                        <strong class="text-zinc-950 dark:text-white block">{{ item.deskripsi }}</strong>
                      </td>
                      <td class="py-2.5 px-3 text-right font-mono font-extrabold text-zinc-950 dark:text-white text-xs">
                        {{ item.qty }} <span class="text-[10px] font-normal text-zinc-500">{{ item.satuan }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Modal: Aksi Cepat Mutasi & Edit -->
        <div class="px-5 py-3.5 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div class="text-[11px] text-zinc-400 self-start sm:self-auto">
            Area ID: <span class="font-mono">{{ selectedLocationDetail.code }}</span>
          </div>

          <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button 
              @click="openEditLocationModal(selectedLocationDetail); selectedLocationDetail = null"
              class="px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
            >
              Edit Area
            </button>
            <button 
              @click="startMovementFromLocation(selectedLocationDetail)"
              class="px-3.5 py-1.5 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeftRight class="w-3.5 h-3.5" />
              <span>⚡ Pindahkan Stok dari Area Ini</span>
            </button>
            <button 
              @click="selectedLocationDetail = null" 
              class="px-3 py-1.5 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-xl text-xs font-semibold text-zinc-800 dark:text-zinc-200 cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- MODAL 3: DETAIL DOKUMEN MOVEMENT (MONOCHROME MINIMALIS)         -->
    <!-- ============================================================== -->
    <div 
      v-if="selectedMovementDetail" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-4 transition-all"
    >
      <div class="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[88vh]">
        <!-- Top Subtle Strip -->
        <div class="h-1 w-full bg-zinc-950 dark:bg-zinc-100"></div>

        <div class="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <div class="flex items-center gap-2">
              <span class="font-mono font-bold text-sm text-zinc-950 dark:text-white">{{ selectedMovementDetail.docNo }}</span>
              <span :class="[
                'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                selectedMovementDetail.status === 'APPROVED' 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400' 
                  : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400'
              ]">
                {{ selectedMovementDetail.status === 'APPROVED' ? 'Disetujui & Terkunci' : 'Draft' }}
              </span>
            </div>
            <p class="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              Tanggal: {{ selectedMovementDetail.tanggal }} • Operator: {{ selectedMovementDetail.operator || '-' }}
            </p>
          </div>
          <button @click="selectedMovementDetail = null" class="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer">
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="p-5 overflow-y-auto space-y-3 text-xs">
          <p class="text-zinc-600 dark:text-zinc-300">Catatan: {{ selectedMovementDetail.keterangan || '-' }}</p>

          <div class="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-x-auto touch-pan-x shadow-xs">
            <table class="min-w-[540px] w-full text-left border-collapse text-xs">
              <thead>
                <tr class="bg-zinc-100/70 dark:bg-zinc-800/70 border-b border-zinc-200 dark:border-zinc-700 text-[10px] uppercase font-bold text-zinc-500">
                  <th class="py-2 px-3">No</th>
                  <th class="py-2 px-3">Barang</th>
                  <th class="py-2 px-3">Dari (From)</th>
                  <th class="py-2 px-3">Ke (To)</th>
                  <th class="py-2 px-3 text-right">Qty</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
                <tr v-for="(it, idx) in selectedMovementDetail.items" :key="idx">
                  <td class="py-2 px-3 text-zinc-400 font-mono">{{ idx + 1 }}</td>
                  <td class="py-2 px-3">
                    <span class="font-mono font-bold mr-1 text-zinc-950 dark:text-white">{{ it.uniqCode }}</span>
                    <span>{{ it.deskripsi }}</span>
                  </td>
                  <td class="py-2 px-3 font-mono font-bold text-amber-600 dark:text-amber-400">{{ it.fromLocation }}</td>
                  <td class="py-2 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">{{ it.toLocation }}</td>
                  <td class="py-2 px-3 text-right font-mono font-bold text-zinc-950 dark:text-white">{{ it.qty }} {{ it.satuan }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="px-5 py-3.5 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2.5">
          <span class="text-xs font-bold text-zinc-500">
            Total: {{ selectedMovementDetail.totalItems }} Item • {{ selectedMovementDetail.totalQty }} Unit
          </span>
          <div class="flex flex-wrap items-center gap-2">
            <!-- Cetak / PDF Dokumen Movement -->
            <button 
              type="button"
              @click="printMovementWorksheetDocument(selectedMovementDetail, selectedMovementDetail.items)"
              class="px-3.5 py-1.5 bg-white hover:bg-zinc-100 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Cetak Dokumen atau Simpan PDF Resmi"
            >
              <Printer class="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
              <span>Cetak / PDF</span>
            </button>

            <!-- Ekspor Excel Dokumen Movement -->
            <button 
              type="button"
              @click="exportMovementWorksheetExcel(selectedMovementDetail, selectedMovementDetail.items)"
              class="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Ekspor Dokumen ke Excel (.xlsx)"
            >
              <FileSpreadsheet class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Ekspor Excel</span>
            </button>

            <button 
              v-if="selectedMovementDetail.status === 'DRAFT'"
              @click="approveMovementDoc(selectedMovementDetail)"
              class="px-4 py-1.5 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Setujui Sekarang
            </button>
            <button 
              @click="selectedMovementDetail = null" 
              class="px-4 py-1.5 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
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
  X,
  Download,
  ChevronsUpDown,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  RotateCcw,
  SlidersHorizontal,
  Filter,
  Printer,
  FileSpreadsheet
} from 'lucide-vue-next';
import * as XLSX from 'xlsx';
import SkeletonLoader from '../components/SkeletonLoader.vue';
import Pagination from '../components/Pagination.vue';
import SmartSearchSelect from '../components/SmartSearchSelect.vue';
import { createStyledSheet, exportMovementWorksheetExcel } from '../utils/excelFormatter';
import { printMovementWorksheetDocument } from '../utils/documentPrinter';

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

// State Sheet Tabs: 'dashboard' | 'manage' | 'movements' | 'worksheet'
const activeSubTab = ref('dashboard');

// Master Data State
const locationsList = ref([]);
const movementsList = ref([]);
const locationSearch = ref('');
const locationTypeFilter = ref('ALL');
const locationStatusFilter = ref('ALL');
const locationSortKey = ref('code');
const locationSortOrder = ref('asc');
const locCurrentPage = ref(1);
const locPageSize = ref(10);

const movementSearch = ref('');
const movementStatusFilter = ref('ALL');
const movCurrentPage = ref(1);
const movPageSize = ref(10);

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
const draftItemNote = ref('');

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

// Analytics Breakdown untuk Dashboard Okupansi
const occupancyStatusBreakdown = computed(() => {
  const total = locationsList.value.length;
  if (total === 0) {
    return {
      full: { count: 0, percent: 0 },
      warning: { count: 0, percent: 0 },
      optimal: { count: 0, percent: 0 },
      low: { count: 0, percent: 0 },
      total: 0
    };
  }

  const full = locationsList.value.filter(l => l.occupancyPercent >= 100).length;
  const warning = locationsList.value.filter(l => l.occupancyPercent >= 85 && l.occupancyPercent < 100).length;
  const optimal = locationsList.value.filter(l => l.occupancyPercent > 15 && l.occupancyPercent < 85).length;
  const low = locationsList.value.filter(l => l.occupancyPercent <= 15).length;

  return {
    full: { count: full, percent: Math.round((full / total) * 100) },
    warning: { count: warning, percent: Math.round((warning / total) * 100) },
    optimal: { count: optimal, percent: Math.round((optimal / total) * 100) },
    low: { count: low, percent: Math.round((low / total) * 100) },
    total
  };
});

// Segmen Donut SVG Chart
const donutSegments = computed(() => {
  const total = locationsList.value.length;
  const circ = 2 * Math.PI * 40; // 251.327
  if (total === 0) return [];

  const b = occupancyStatusBreakdown.value;
  const items = [
    { key: 'FULL', label: 'Penuh (100%)', count: b.full.count, percent: b.full.percent, color: '#f43f5e', textColor: 'text-rose-500', bgBadge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' },
    { key: 'WARNING', label: 'Hampir Penuh (≥85%)', count: b.warning.count, percent: b.warning.percent, color: '#f59e0b', textColor: 'text-amber-500', bgBadge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
    { key: 'OPTIMAL', label: 'Optimal (16% - 84%)', count: b.optimal.count, percent: b.optimal.percent, color: '#10b981', textColor: 'text-emerald-500', bgBadge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
    { key: 'LOW', label: 'Kapasitas Lega (≤15%)', count: b.low.count, percent: b.low.percent, color: '#64748b', textColor: 'text-zinc-500', bgBadge: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20' }
  ];

  let cumulativeOffset = 0;
  return items.map(item => {
    const dashLength = (item.count / total) * circ;
    const dashOffset = -cumulativeOffset;
    cumulativeOffset += dashLength;
    return {
      ...item,
      dashLength,
      dashOffset,
      circumference: circ
    };
  });
});

// Utilisasi Beban per Kategori / Tipe Zona Gudang
const categoryOccupancyStats = computed(() => {
  const map = new Map();
  for (const loc of locationsList.value) {
    const type = loc.type || 'Lainnya';
    if (!map.has(type)) {
      map.set(type, {
        type,
        count: 0,
        totalCapacity: 0,
        currentQty: 0
      });
    }
    const cat = map.get(type);
    cat.count += 1;
    cat.totalCapacity += Number(loc.maxCapacity) || 0;
    cat.currentQty += Number(loc.currentQty) || 0;
  }

  return Array.from(map.values())
    .map(cat => {
      const availableCapacity = Math.max(0, cat.totalCapacity - cat.currentQty);
      const percent = cat.totalCapacity > 0 ? Math.round((cat.currentQty / cat.totalCapacity) * 100) : 0;
      return {
        ...cat,
        availableCapacity,
        percent
      };
    })
    .sort((a, b) => b.percent - a.percent);
});

// Top 5 Area Terpadat (Perlu Relokasi / Monitoring)
const topOccupiedLocations = computed(() => {
  return [...locationsList.value]
    .sort((a, b) => b.occupancyPercent - a.occupancyPercent)
    .slice(0, 5);
});

// Top 5 Area Paling Longgar (Target Putaway Terbaik)
const topAvailableLocations = computed(() => {
  return [...locationsList.value]
    .filter(l => l.availableCapacity > 0)
    .sort((a, b) => b.availableCapacity - a.availableCapacity)
    .slice(0, 5);
});

function openManageWithStatusFilter(status) {
  locationStatusFilter.value = status;
  activeSubTab.value = 'manage';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openManageWithTypeFilter(type) {
  locationTypeFilter.value = type;
  activeSubTab.value = 'manage';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Daftar Kategori / Tipe Unik Lokasi
const uniqueLocationTypes = computed(() => {
  const set = new Set(locationsList.value.map(l => l.type).filter(Boolean));
  return Array.from(set).sort();
});

// Status Apakah Filter Lokasi Aktif
const isLocationFilterActive = computed(() => {
  return locationSearch.value.trim() !== '' || 
         locationTypeFilter.value !== 'ALL' || 
         locationStatusFilter.value !== 'ALL' ||
         locationSortKey.value !== 'code' ||
         locationSortOrder.value !== 'asc';
});

function resetLocationFilters() {
  locationSearch.value = '';
  locationTypeFilter.value = 'ALL';
  locationStatusFilter.value = 'ALL';
  locationSortKey.value = 'code';
  locationSortOrder.value = 'asc';
  locCurrentPage.value = 1;
}

// Filter & Sort Locations (Mendukung Ribuan Data dengan Sorting & Filtering Cepat)
const filteredLocations = computed(() => {
  let list = [...locationsList.value];
  
  if (locationTypeFilter.value !== 'ALL') {
    list = list.filter(l => l.type === locationTypeFilter.value);
  }

  if (locationStatusFilter.value !== 'ALL') {
    list = list.filter(l => l.status === locationStatusFilter.value);
  }

  if (locationSearch.value.trim()) {
    const q = locationSearch.value.toLowerCase().trim();
    list = list.filter(l => 
      l.code.toLowerCase().includes(q) ||
      l.name.toLowerCase().includes(q) ||
      (l.type && l.type.toLowerCase().includes(q)) ||
      (l.keterangan && l.keterangan.toLowerCase().includes(q)) ||
      (l.items && l.items.some(i => 
        (i.itemCode && i.itemCode.toLowerCase().includes(q)) ||
        (i.deskripsi && i.deskripsi.toLowerCase().includes(q))
      ))
    );
  }

  list.sort((a, b) => {
    let valA, valB;
    if (locationSortKey.value === 'itemsCount') {
      valA = a.items?.length || 0;
      valB = b.items?.length || 0;
    } else if (['maxCapacity', 'currentQty', 'occupancyPercent'].includes(locationSortKey.value)) {
      valA = Number(a[locationSortKey.value]) || 0;
      valB = Number(b[locationSortKey.value]) || 0;
    } else {
      valA = String(a[locationSortKey.value] || '').toLowerCase();
      valB = String(b[locationSortKey.value] || '').toLowerCase();
    }

    if (valA < valB) return locationSortOrder.value === 'asc' ? -1 : 1;
    if (valA > valB) return locationSortOrder.value === 'asc' ? 1 : -1;
    return a.code.localeCompare(b.code);
  });

  return list;
});

// Paginated Locations (Hanya render slice per halaman agar performa super cepat)
const paginatedLocations = computed(() => {
  const start = (locCurrentPage.value - 1) * locPageSize.value;
  return filteredLocations.value.slice(start, start + locPageSize.value);
});

function toggleLocationSort(key) {
  if (locationSortKey.value === key) {
    locationSortOrder.value = locationSortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    locationSortKey.value = key;
    locationSortOrder.value = 'asc';
  }
}

function getLocationSortIcon(key) {
  if (locationSortKey.value !== key) return ChevronsUpDown;
  return locationSortOrder.value === 'asc' ? ArrowUp : ArrowDown;
}

watch([locationSearch, locationTypeFilter, locationStatusFilter, locationSortKey, locationSortOrder], () => {
  locCurrentPage.value = 1;
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

// Paginated Movements
const paginatedMovements = computed(() => {
  const start = (movCurrentPage.value - 1) * movPageSize.value;
  return filteredMovements.value.slice(start, start + movPageSize.value);
});

watch([movementSearch, movementStatusFilter], () => {
  movCurrentPage.value = 1;
});

// Smart Search Suggestions
const highlightedItemIndex = ref(0);

const matchingItemSuggestions = computed(() => {
  if (!typedItemSearch.value.trim()) return [];
  const q = typedItemSearch.value.toLowerCase().trim();
  return props.itemsWithStock.filter(it => 
    it.uniqCode.toLowerCase().includes(q) ||
    it.deskripsi.toLowerCase().includes(q)
  ).slice(0, 8);
});

watch(typedItemSearch, () => {
  highlightedItemIndex.value = 0;
});

function navigateItemSuggestions(delta) {
  if (matchingItemSuggestions.value.length === 0) return;
  isSmartDropdownOpen.value = true;
  const len = matchingItemSuggestions.value.length;
  highlightedItemIndex.value = (highlightedItemIndex.value + delta + len) % len;
}

function selectHighlightedItem() {
  if (isSmartDropdownOpen.value && matchingItemSuggestions.value[highlightedItemIndex.value]) {
    selectItemForMovement(matchingItemSuggestions.value[highlightedItemIndex.value]);
  }
}

// Destination Locations (excluding current From)
const destinationLocations = computed(() => {
  return locationsList.value.filter(l => l.code !== draftFromLocation.value);
});

const fromLocationOptions = computed(() => {
  return selectedItemLocations.value.map(loc => ({
    value: loc.locationCode,
    label: loc.locationCode,
    sublabel: loc.locationName,
    badge: `${getAvailableInLocation(loc.locationCode)} ${selectedItemObj.value?.satuan || 'unit'}`
  }));
});

const allLocationOptions = computed(() => {
  return locationsList.value.map(loc => ({
    value: loc.code,
    label: loc.code,
    sublabel: `${loc.name} • ${loc.type || 'Storage'}`,
    badge: `Sisa ${loc.availableCapacity}`
  }));
});

const destinationLocationOptions = computed(() => {
  return destinationLocations.value.map(loc => ({
    value: loc.code,
    label: loc.code,
    sublabel: `${loc.name} • ${loc.type || 'Storage'}`,
    badge: `Sisa ${loc.availableCapacity}`
  }));
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
  draftItemNote.value = '';
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
    keterangan: draftItemNote.value.trim() || 'Mutasi internal'
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
    status: 'DRAFT',
    isLocked: false,
    approvedAt: null,
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

async function startMovementFromLocation(loc) {
  selectedLocationDetail.value = null;
  if (!loc || !loc.code) return;

  // Dapatkan item-item yang ada di lokasi ini
  let itemsInLoc = loc.items || [];
  if (!itemsInLoc || itemsInLoc.length === 0) {
    const allItemLocs = await db.item_locations.where('locationCode').equals(loc.code).toArray();
    itemsInLoc = allItemLocs.filter(il => Number(il.qty) > 0).map(il => {
      const master = props.itemsWithStock.find(m => m.uniqCode === il.itemCode) || {};
      return {
        itemCode: il.itemCode,
        deskripsi: master.deskripsi || il.itemCode,
        satuan: master.satuan || 'Unit',
        qty: Number(il.qty)
      };
    });
  }

  if (itemsInLoc.length === 0) {
    alert(`Area "${loc.code} - ${loc.name || ''}" saat ini kosong dan tidak memiliki stok barang untuk dipindahkan.`);
    return;
  }

  // Buka worksheet baru
  await openNewWorksheet();
  worksheetHeader.value.keterangan = `Relokasi seluruh stok dari area ${loc.code} (${loc.name || loc.code})`;

  // Cari rekomendasi lokasi tujuan default (rak lain yang memiliki ruang sisa dan bukan lokasi asal)
  const candidateRack = locationsList.value
    .filter(l => l.code !== loc.code && l.code !== 'ZONE-STAGING')
    .sort((a, b) => b.availableCapacity - a.availableCapacity)[0] || 
    locationsList.value.find(l => l.code !== loc.code);
  const defaultToCode = candidateRack ? candidateRack.code : '';

  // MASUKKAN SELURUH ITEM DI LOKASI INI KE DALAM LEMBAR KERJA WORKSHEET!
  worksheetItems.value = itemsInLoc.map(it => {
    const master = props.itemsWithStock.find(m => m.uniqCode === it.itemCode) || {};
    return {
      uniqCode: it.itemCode,
      deskripsi: it.deskripsi || master.deskripsi || it.itemCode,
      satuan: it.satuan || master.satuan || 'Unit',
      fromLocation: loc.code,
      toLocation: defaultToCode,
      qty: it.qty,
      keterangan: `Pindah dari ${loc.code}`
    };
  });

  // Pre-fill form input baris atas dengan item pertama untuk kenyamanan
  draftFromLocation.value = loc.code;
  draftToLocation.value = defaultToCode;
  const firstMaster = props.itemsWithStock.find(m => m.uniqCode === itemsInLoc[0].itemCode);
  if (firstMaster) {
    selectedItemObj.value = firstMaster;
    typedItemSearch.value = `${firstMaster.uniqCode} - ${firstMaster.deskripsi}`;
    selectedItemLocations.value = await getItemLocationsBreakdown(firstMaster.uniqCode);
    draftMoveQty.value = 1;
  }

  activeSubTab.value = 'worksheet';
  window.scrollTo({ top: 0, behavior: 'smooth' });
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

function downloadLocationDataExcel() {
  if (locationsList.value.length === 0) {
    alert('Tidak ada data lokasi untuk diekspor.');
    return;
  }
  try {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Okupansi dan Kapasitas Rak
    const locRows = locationsList.value.map((loc, idx) => {
      const pct = loc.maxCapacity > 0 ? Math.round((loc.currentQty / loc.maxCapacity) * 100) : 0;
      let status = '🟢 Tersedia';
      if (pct >= 100) status = '🔴 Penuh (100%)';
      else if (pct >= 80) status = '🟡 Hampir Penuh';
      else if (pct === 0) status = '⚪ Kosong';

      return {
        'No': idx + 1,
        'Kode Lokasi / Rak': loc.code,
        'Nama Area': loc.name,
        'Tipe Penyimpanan': loc.type || 'Standard Storage',
        'Kapasitas Maksimal (Unit)': Number(loc.maxCapacity) || 0,
        'Kuantitas Terisi Saat Ini': Number(loc.currentQty) || 0,
        'Persentase Okupansi': `${pct}%`,
        'Status Okupansi': status,
        'Keterangan': loc.keterangan || '-'
      };
    });
    XLSX.utils.book_append_sheet(wb, createStyledSheet(locRows), 'Okupansi_dan_Kapasitas_Rak');

    // Sheet 2: Movement Internal (jika ada)
    if (movementsList.value.length > 0) {
      const movRows = movementsList.value.map(m => ({
        'No Dokumen Movement': m.docNo,
        'Tanggal Mutasi': m.tanggal,
        'Operator Gudang': m.operator || '-',
        'Status Dokumen': m.status === 'APPROVED' ? '✅ Disetujui' : '📝 Draf',
        'Jumlah Baris SKU': m.items ? m.items.length : 0,
        'Total Kuantitas Dipindahkan': Number(m.totalQty) || 0,
        'Keterangan': m.keterangan || '-',
        'Waktu Rekam': m.createdAt ? new Date(m.createdAt).toLocaleString('id-ID') : '-'
      }));
      XLSX.utils.book_append_sheet(wb, createStyledSheet(movRows), 'Histori_Movement_Internal');
    }

    const dateTag = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `IMS_Lokasi_dan_Movement_${dateTag}.xlsx`);
  } catch (err) {
    console.error('Gagal mengekspor data lokasi:', err);
    alert('Gagal mengekspor data: ' + err.message);
  }
}

onMounted(() => {
  loadData();
});
</script>
