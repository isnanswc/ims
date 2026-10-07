<template>
  <div class="space-y-6 pb-24 md:pb-6">
    <!-- 1. TOP WELCOME & QUICK ACTIONS RIBBON BANNER -->
    <div class="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-black text-zinc-950 dark:text-white shadow-sm border border-zinc-200/90 dark:border-zinc-800">
      <!-- Ambient light reflections -->
      <div class="absolute -right-10 -top-10 w-64 h-64 bg-zinc-200/40 dark:bg-zinc-800/20 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -left-10 -bottom-10 w-64 h-64 bg-zinc-300/30 dark:bg-zinc-700/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <div>
          <div class="flex flex-wrap items-center gap-2">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700">
              <span class="w-2 h-2 rounded-full bg-zinc-950 dark:bg-white animate-pulse"></span>
              Live Executive Dashboard • IndexedDB Realtime
            </span>
            <span class="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
              <Clock class="w-3 h-3" />
              {{ activeRangeLabel }}
            </span>
          </div>

          <h1 class="text-xl sm:text-3xl font-extrabold mt-3 tracking-tight text-zinc-950 dark:text-white">
            Pusat Analitika Gudang & Pergerakan Stok
          </h1>
          <p class="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm mt-1 max-w-2xl">
            Monitoring kondisi persediaan global per hari, analisis Pareto 80/20, evaluasi kecepatan perputaran (Velocity Moving), serta deteksi dini barang mati.
          </p>
        </div>

        <!-- Quick Action Buttons (Grid di Mobile, Flex di Desktop) -->
        <div class="grid grid-cols-3 sm:flex items-center gap-2 w-full sm:w-auto shrink-0">
          <button 
            @click="$emit('change-tab', 'ppic')"
            class="flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2.5 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 rounded-2xl font-bold text-[11px] sm:text-sm shadow-sm border border-zinc-950 dark:border-white transition-all active:scale-95 cursor-pointer text-center"
            title="Buka Halaman PPIC & Kalkulator Simulasi Stok"
          >
            <Calculator class="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span class="truncate">PPIC</span>
          </button>
          <button 
            @click="$emit('quick-action', 'inbound')"
            class="flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2.5 bg-white hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-2xl font-bold text-[11px] sm:text-sm border border-zinc-300 dark:border-zinc-700 shadow-sm transition-all active:scale-95 cursor-pointer text-center"
          >
            <ArrowDownLeft class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0" />
            <span class="truncate">+ Masuk</span>
          </button>
          <button 
            @click="$emit('quick-action', 'outbound')"
            class="flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2.5 bg-white hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-2xl font-bold text-[11px] sm:text-sm border border-zinc-300 dark:border-zinc-700 shadow-sm transition-all active:scale-95 cursor-pointer text-center"
          >
            <ArrowUpRight class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500 shrink-0" />
            <span class="truncate">- Keluar</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 2. ANIMATED ROLLING COUNTER KPI CARDS (DENGAN SKELETON SHIMMER) -->
    <SkeletonLoader v-if="isLoading" type="kpi" :count="4" />
    <div v-else class="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
      <!-- 1. Total SKU Aktif -->
      <div class="glass-card glass-card-hover p-4 sm:p-5 flex items-center gap-3.5 relative overflow-hidden group">
        <div class="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 flex items-center justify-center shrink-0 border border-zinc-300 dark:border-zinc-700 group-hover:scale-105 transition-transform">
          <Package class="w-6 h-6" />
        </div>
        <div class="min-w-0">
          <p class="text-xs text-zinc-500 dark:text-zinc-400 font-medium truncate">Total Master Item</p>
          <p class="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            {{ countTotalItems }} <span class="text-xs font-normal text-zinc-400">SKU</span>
          </p>
        </div>
      </div>

      <!-- 2. Total Fisik Unit Tersimpan -->
      <div class="glass-card glass-card-hover p-4 sm:p-5 flex items-center gap-3.5 relative overflow-hidden group">
        <div class="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 flex items-center justify-center shrink-0 border border-zinc-300 dark:border-zinc-700 group-hover:scale-105 transition-transform">
          <Layers class="w-6 h-6" />
        </div>
        <div class="min-w-0">
          <p class="text-xs text-zinc-500 dark:text-zinc-400 font-medium truncate">Total Unit Fisik</p>
          <p class="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            {{ countTotalStock }} <span class="text-xs font-normal text-zinc-400">Unit</span>
          </p>
        </div>
      </div>

      <!-- 3. Inbound (TO Masuk) Periode Aktif -->
      <div class="glass-card glass-card-hover p-4 sm:p-5 flex items-center gap-3.5 relative overflow-hidden group">
        <div class="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 flex items-center justify-center shrink-0 border border-zinc-300 dark:border-zinc-700 group-hover:scale-105 transition-transform">
          <ArrowDownLeft class="w-6 h-6 text-zinc-900 dark:text-white" />
        </div>
        <div class="min-w-0">
          <p class="text-xs text-zinc-500 dark:text-zinc-400 font-medium truncate">TO Masuk ({{ selectedRange }})</p>
          <p class="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            +{{ countRangeIn }} <span class="text-xs font-normal text-zinc-400">Unit</span>
          </p>
        </div>
      </div>

      <!-- 4. Outbound (TO Keluar) Periode Aktif -->
      <div class="glass-card glass-card-hover p-4 sm:p-5 flex items-center gap-3.5 relative overflow-hidden group">
        <div class="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20 group-hover:scale-105 transition-transform">
          <ArrowUpRight class="w-6 h-6" />
        </div>
        <div class="min-w-0">
          <p class="text-xs text-zinc-500 dark:text-zinc-400 font-medium truncate">TO Keluar ({{ selectedRange }})</p>
          <p class="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
            -{{ countRangeOut }} <span class="text-xs font-normal text-rose-400/80">Unit</span>
          </p>
        </div>
      </div>
    </div>

    <!-- 3. DIAGRAM GARIS KONDISI STOK GLOBAL PER HARI (INTERAKTIF & RANGE SELECTOR) -->
    <SkeletonLoader v-if="isLoading" type="chart" />
    <div v-else class="glass-card p-4 sm:p-6 space-y-4">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3.5">
        <div>
          <div class="flex items-center gap-2">
            <TrendingUp class="w-5 h-5 text-zinc-900 dark:text-white" />
            <h2 class="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">
              Kondisi & Pergerakan Stok Global Per Hari
            </h2>
          </div>
          <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Tren saldo akhir stok fisik harian disandingkan dengan volume arus masuk dan keluar.
          </p>
        </div>

        <!-- Global Range Selector Filter (Mempengaruhi Semua Diagram) -->
        <div class="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 self-start sm:self-auto overflow-x-auto max-w-full no-scrollbar">
          <button 
            v-for="r in rangeOptions" 
            :key="r.value"
            @click="selectedRange = r.value"
            :class="[
              'px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap',
              selectedRange === r.value 
                ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-sm' 
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
            ]"
          >
            {{ r.label }}
          </button>
        </div>
      </div>

      <!-- Legend & Info Bar -->
      <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div class="flex flex-wrap items-center gap-4">
          <span class="inline-flex items-center gap-1.5">
            <span class="w-3 h-1 bg-zinc-950 dark:bg-white rounded-full"></span>
            <span class="font-medium text-zinc-700 dark:text-zinc-300">Saldo Akhir Stok</span>
          </span>
          <span class="inline-flex items-center gap-1.5">
            <span class="w-3 h-1 bg-emerald-500 rounded-full"></span>
            <span class="font-medium text-zinc-700 dark:text-zinc-300">+ TO Masuk</span>
          </span>
          <span class="inline-flex items-center gap-1.5">
            <span class="w-3 h-1 bg-rose-500 rounded-full"></span>
            <span class="font-medium text-zinc-700 dark:text-zinc-300">- TO Keluar</span>
          </span>
        </div>

        <div class="text-[11px] text-zinc-400 font-mono">
          Rata-rata Arus: <strong class="text-zinc-800 dark:text-zinc-200">{{ averageDailyDelta >= 0 ? '+' : '' }}{{ averageDailyDelta }}</strong> unit/hari
        </div>
      </div>

      <!-- SVG Line Chart with Gradient and Interactive Hover Point -->
      <div class="relative w-full h-64 sm:h-72 select-none" ref="lineChartContainerRef">
        <svg 
          class="w-full h-full overflow-visible" 
          viewBox="0 0 800 240" 
          preserveAspectRatio="none"
          @mousemove="handleLineChartMouseMove"
          @mouseleave="hoveredLineIndex = -1"
        >
          <defs>
            <linearGradient id="stockAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#71717a" stop-opacity="0.35" />
              <stop offset="100%" stop-color="#71717a" stop-opacity="0.0" />
            </linearGradient>
            <linearGradient id="inboundGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#10b981" stop-opacity="0.25" />
              <stop offset="100%" stop-color="#10b981" stop-opacity="0.0" />
            </linearGradient>
          </defs>

          <!-- Horizontal Grid Lines -->
          <line v-for="g in 4" :key="g" 
            x1="40" :y1="30 + (g - 1) * 55" 
            x2="780" :y2="30 + (g - 1) * 55" 
            stroke="currentColor" 
            class="text-zinc-200 dark:text-zinc-800" 
            stroke-dasharray="3 3" 
            stroke-width="1"
          />

          <!-- Area Shading -->
          <path 
            v-if="lineChartPoints.length > 1"
            :d="stockAreaPath" 
            fill="url(#stockAreaGrad)" 
            class="transition-all duration-500"
          />

          <!-- Line 1: Inbound Bar/Points -->
          <g v-for="(p, idx) in lineChartPoints" :key="'in-' + idx">
            <line 
              v-if="p.inQty > 0"
              :x1="p.x" :y1="200"
              :x2="p.x" :y2="p.inY"
              stroke="#10b981" 
              stroke-width="3"
              stroke-linecap="round"
              class="opacity-75"
            />
          </g>

          <!-- Line 2: Outbound Bar/Points -->
          <g v-for="(p, idx) in lineChartPoints" :key="'out-' + idx">
            <line 
              v-if="p.outQty > 0"
              :x1="p.x + 4" :y1="200"
              :x2="p.x + 4" :y2="p.outY"
              stroke="#f43f5e" 
              stroke-width="3"
              stroke-linecap="round"
              class="opacity-75"
            />
          </g>

          <!-- Main Stock Line Path -->
          <path 
            v-if="lineChartPoints.length > 1"
            :d="stockLinePath" 
            fill="none" 
            stroke="currentColor" 
            class="text-zinc-950 dark:text-white transition-all duration-500"
            stroke-width="2.5" 
            stroke-linecap="round" 
            stroke-linejoin="round"
          />

          <!-- Data Points Circles -->
          <circle 
            v-for="(p, idx) in lineChartPoints" 
            :key="'pt-' + idx"
            :cx="p.x" 
            :cy="p.y" 
            :r="hoveredLineIndex === idx ? 5.5 : 3"
            class="fill-white dark:fill-zinc-950 stroke-zinc-950 dark:stroke-white transition-all duration-200"
            :stroke-width="hoveredLineIndex === idx ? 3 : 2"
          />

          <!-- Hover Crosshair Vertical Line -->
          <line 
            v-if="hoveredPoint"
            :x1="hoveredPoint.x" y1="20"
            :x2="hoveredPoint.x" y2="205"
            stroke="currentColor"
            class="text-zinc-400 dark:text-zinc-500"
            stroke-width="1.5"
            stroke-dasharray="2 2"
          />
        </svg>

        <!-- Floating Glass Interactive Tooltip Card -->
        <div 
          v-if="hoveredPoint"
          class="absolute z-30 pointer-events-none p-3 rounded-xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md shadow-xl border border-zinc-200 dark:border-zinc-700 text-xs min-w-[160px] transform -translate-x-1/2 -translate-y-full transition-all duration-75"
          :style="{ left: `${hoveredPointPercentX}%`, top: `${Math.max(10, hoveredPointPercentY - 10)}%` }"
        >
          <span class="font-bold text-zinc-900 dark:text-white block border-b border-zinc-100 dark:border-zinc-800 pb-1">
            {{ hoveredPoint.fullDateLabel }}
          </span>
          <div class="mt-1.5 space-y-1 font-mono">
            <div class="flex items-center justify-between text-zinc-900 dark:text-zinc-100">
              <span class="text-zinc-500 dark:text-zinc-400">Total Stok:</span>
              <strong>{{ hoveredPoint.balance }} Unit</strong>
            </div>
            <div class="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
              <span>Masuk (IN):</span>
              <strong>+{{ hoveredPoint.inQty }}</strong>
            </div>
            <div class="flex items-center justify-between text-rose-600 dark:text-rose-400">
              <span>Keluar (OUT):</span>
              <strong>-{{ hoveredPoint.outQty }}</strong>
            </div>
          </div>
        </div>

        <!-- Date Labels on X-axis -->
        <div class="flex items-center justify-between px-2 pt-1 border-t border-zinc-100 dark:border-zinc-800 text-[10px] text-zinc-400 font-mono">
          <span v-for="(p, idx) in sampledXLabels" :key="idx">
            {{ p.shortDate }}
          </span>
        </div>
      </div>
    </div>

    <!-- 4. DUAL ANALYTICAL CHARTS: PARETO 80/20 & VELOCITY MOVING ANALYSIS -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 4A. DIAGRAM ANALISIS PARETO (ATURAN 80/20) -->
      <div class="glass-card p-4 sm:p-5 flex flex-col justify-between space-y-3.5">
        <div>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <BarChart3 class="w-4 h-4 text-zinc-900 dark:text-white" />
              <h2 class="text-sm font-bold text-zinc-900 dark:text-white">
                Analisis Pareto (Aturan 80/20)
              </h2>
            </div>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700">
              Periode {{ selectedRange }}
            </span>
          </div>
          <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Mengidentifikasi 20% SKU vital (Kelas A) yang berkontribusi terhadap 80% perputaran volume barang keluar.
          </p>
        </div>

        <!-- Pareto ABC Classification Badges -->
        <div class="grid grid-cols-3 gap-2 text-center text-xs">
          <div class="p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100/60 dark:bg-zinc-900/60">
            <span class="font-extrabold text-zinc-950 dark:text-white block text-sm">{{ paretoSummary.classACount }} SKU</span>
            <span class="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold block">Kelas A (Top 80% Vital)</span>
          </div>
          <div class="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30">
            <span class="font-extrabold text-zinc-800 dark:text-zinc-200 block text-sm">{{ paretoSummary.classBCount }} SKU</span>
            <span class="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold block">Kelas B (15% Moderat)</span>
          </div>
          <div class="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30">
            <span class="font-extrabold text-zinc-800 dark:text-zinc-200 block text-sm">{{ paretoSummary.classCCount }} SKU</span>
            <span class="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold block">Kelas C (5% Ekor Panjang)</span>
          </div>
        </div>

        <!-- SVG Pareto Dual-Axis Chart -->
        <div v-if="paretoItems.length > 0" class="relative h-56 select-none mt-2">
          <svg class="w-full h-full overflow-visible" viewBox="0 0 500 200">
            <!-- 80% Pareto Reference Cutoff Line -->
            <line x1="30" y1="44" x2="470" y2="44" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4 3" class="opacity-80" />
            <text x="470" y="40" fill="#f59e0b" font-size="9" text-anchor="end" font-weight="bold">Batas 80%</text>

            <!-- Bars for Each Top SKU Volume -->
            <g v-for="(item, idx) in paretoChartData" :key="'pareto-bar-' + idx">
              <rect 
                :x="item.x" 
                :y="item.barY" 
                :width="item.barWidth" 
                :height="item.barHeight" 
                rx="3"
                :class="[
                  item.cumPercent <= 80 
                    ? 'fill-zinc-950 dark:fill-white' 
                    : item.cumPercent <= 95 
                      ? 'fill-zinc-500 dark:fill-zinc-400' 
                      : 'fill-zinc-300 dark:fill-zinc-700'
                ]"
                class="transition-all duration-300 hover:opacity-80 cursor-pointer"
                @mouseenter="hoveredParetoItem = item"
                @mouseleave="hoveredParetoItem = null"
              />
            </g>

            <!-- Cumulative Percentage Line -->
            <path 
              v-if="paretoChartData.length > 1"
              :d="paretoCumulativePath" 
              fill="none" 
              stroke="#f59e0b" 
              stroke-width="2" 
              stroke-linecap="round"
            />

            <!-- Cumulative Percentage Points -->
            <circle 
              v-for="(item, idx) in paretoChartData" 
              :key="'pareto-dot-' + idx"
              :cx="item.dotX" 
              :cy="item.dotY" 
              r="3"
              fill="#f59e0b"
              stroke="#ffffff"
              stroke-width="1.5"
            />
          </svg>

          <!-- Floating Tooltip for Pareto SKU -->
          <div 
            v-if="hoveredParetoItem"
            class="absolute bottom-2 right-2 p-2.5 rounded-xl bg-zinc-900/90 dark:bg-white/95 text-white dark:text-zinc-950 backdrop-blur-md shadow-xl text-[11px] pointer-events-none"
          >
            <div class="font-mono font-bold">{{ hoveredParetoItem.uniqCode }} • {{ hoveredParetoItem.deskripsi }}</div>
            <div class="mt-1 flex items-center gap-3">
              <span>Keluar: <strong>{{ hoveredParetoItem.qty }} {{ hoveredParetoItem.satuan }}</strong></span>
              <span>Kumulatif: <strong>{{ hoveredParetoItem.cumPercent }}%</strong></span>
              <span class="font-bold underline">Kelas {{ hoveredParetoItem.cls }}</span>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-10 text-zinc-400 text-xs">
          Belum ada data barang keluar pada rentang waktu ini.
        </div>
      </div>

      <!-- 4B. DIAGRAM MOVING BARANG (FAST, MEDIUM, SLOW, NO MOVING) -->
      <div class="glass-card p-4 sm:p-5 flex flex-col justify-between space-y-3.5">
        <div>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Zap class="w-4 h-4 text-zinc-900 dark:text-white" />
              <h2 class="text-sm font-bold text-zinc-900 dark:text-white">
                Kecepatan Barang (Velocity Moving)
              </h2>
            </div>

            <!-- Evaluasi Moving Selector -->
            <div class="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-[10px] font-bold">
              <button 
                @click="movingPeriod = '3m'" 
                :class="['px-2 py-1 rounded transition-colors', movingPeriod === '3m' ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950' : 'text-zinc-500']"
                title="Rekomendasi Standar Industri WMS (Triwulanan / 90 Hari)"
              >
                3 Bulan (Standar)
              </button>
              <button 
                @click="movingPeriod = 'sync'" 
                :class="['px-2 py-1 rounded transition-colors', movingPeriod === 'sync' ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950' : 'text-zinc-500']"
                title="Sinkronkan dengan range tanggal di atas"
              >
                Sesuai Range
              </button>
              <button 
                @click="movingPeriod = '6m'" 
                :class="['px-2 py-1 rounded transition-colors', movingPeriod === '6m' ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950' : 'text-zinc-500']"
                title="Evaluasi 6 Bulan Terakhir"
              >
                6 Bulan
              </button>
            </div>
          </div>
          <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Klasifikasi perputaran mutasi: <strong>Merah (Fast)</strong>, <strong>Oranye (Medium)</strong>, <strong>Kuning (Slow)</strong>, dan <strong>Hitam (No Moving / Dead Stock)</strong>.
          </p>
        </div>

        <!-- Donut & Legend Container -->
        <div class="flex flex-col sm:flex-row items-center justify-around gap-4 pt-1">
          <!-- Animated SVG Donut Chart -->
          <div class="relative w-40 h-40 shrink-0 select-none">
            <svg class="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <!-- Background ring -->
              <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" class="text-zinc-100 dark:text-zinc-800" stroke-width="14" />
              <!-- Slices -->
              <circle 
                v-for="(seg, idx) in movingDonutSegments" 
                :key="'slice-' + idx"
                cx="50" cy="50" r="38" 
                fill="none" 
                :stroke="seg.color" 
                stroke-width="14"
                :stroke-dasharray="`${seg.dash} ${seg.gap}`"
                :stroke-dashoffset="seg.offset"
                class="transition-all duration-700"
              />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span class="text-xl font-black text-zinc-900 dark:text-white leading-none">{{ props.itemsWithStock.length }}</span>
              <span class="text-[9px] uppercase font-bold text-zinc-400 mt-0.5">Total SKU</span>
            </div>
          </div>

          <!-- Color Legend with Detailed Percentages -->
          <div class="space-y-2 w-full sm:w-auto text-xs font-semibold">
            <!-- 1. Fast Moving (Merah) -->
            <div class="flex items-center justify-between sm:justify-start gap-3 p-1.5 rounded-lg bg-red-500/5">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-red-500 shrink-0"></span>
                <span class="text-zinc-900 dark:text-white">Fast Moving:</span>
              </div>
              <span class="font-mono font-bold text-red-600 dark:text-red-400">
                {{ movingBreakdown.fast.count }} SKU ({{ movingBreakdown.fast.percent }}%)
              </span>
            </div>

            <!-- 2. Medium Moving (Oranye) -->
            <div class="flex items-center justify-between sm:justify-start gap-3 p-1.5 rounded-lg bg-amber-500/5">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-orange-500 shrink-0"></span>
                <span class="text-zinc-900 dark:text-white">Medium Moving:</span>
              </div>
              <span class="font-mono font-bold text-orange-600 dark:text-orange-400">
                {{ movingBreakdown.medium.count }} SKU ({{ movingBreakdown.medium.percent }}%)
              </span>
            </div>

            <!-- 3. Slow Moving (Kuning) -->
            <div class="flex items-center justify-between sm:justify-start gap-3 p-1.5 rounded-lg bg-yellow-500/5">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-yellow-400 shrink-0"></span>
                <span class="text-zinc-900 dark:text-white">Slow Moving:</span>
              </div>
              <span class="font-mono font-bold text-yellow-600 dark:text-yellow-400">
                {{ movingBreakdown.slow.count }} SKU ({{ movingBreakdown.slow.percent }}%)
              </span>
            </div>

            <!-- 4. No Moving / Dead Stock (Hitam) -->
            <div class="flex items-center justify-between sm:justify-start gap-3 p-1.5 rounded-lg bg-zinc-900/5 dark:bg-zinc-800/40 border border-zinc-300 dark:border-zinc-700">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-zinc-950 dark:bg-white border border-zinc-400 shrink-0"></span>
                <span class="text-zinc-900 dark:text-white">No Moving (Dead):</span>
              </div>
              <span class="font-mono font-bold text-zinc-950 dark:text-zinc-100">
                {{ movingBreakdown.noMoving.count }} SKU ({{ movingBreakdown.noMoving.percent }}%)
              </span>
            </div>
          </div>
        </div>

        <!-- Dead Stock Notice Bar if detected -->
        <div v-if="movingBreakdown.noMoving.count > 0" class="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-between text-xs">
          <div class="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
            <AlertCircle class="w-3.5 h-3.5 text-zinc-500" />
            <span>Ada <strong>{{ movingBreakdown.noMoving.count }} SKU</strong> belum pernah keluar sama sekali dalam evaluasi ini.</span>
          </div>
          <button 
            @click="$emit('change-tab', 'items')"
            class="text-[11px] font-bold text-zinc-900 dark:text-white underline hover:no-underline"
          >
            Periksa Rak &rarr;
          </button>
        </div>
      </div>
    </div>

    <!-- 5. PERINGATAN STOK MENIPIS (DENGAN DUKUNGAN MENGABAIKAN STOK KOSONG DISENGAJA) -->
    <div v-if="activeLowStockItems.length > 0" class="glass-card p-4 sm:p-5 border-l-4 border-l-amber-500 bg-amber-500/5">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        <div class="flex items-center gap-2">
          <AlertTriangle class="w-5 h-5 text-amber-500 shrink-0" />
          <div>
            <h2 class="text-sm font-bold text-amber-900 dark:text-amber-300 flex items-center gap-2">
              <span>Perhatian: Stok Menipis ({{ activeLowStockItems.length }} Item Aktif)</span>
            </h2>
            <p class="text-[11px] text-amber-700/80 dark:text-amber-400/80">
              Barang di bawah batas aman. Klik tombol "Abaikan" jika stok barang ini memang sengaja dibiarkan kosong/discontinue.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button 
            @click="$emit('change-tab', 'ppic')" 
            class="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 flex items-center gap-1 shadow-sm transition-all"
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
          v-for="item in activeLowStockItems.slice(0, 3)" 
          :key="item.uniqCode"
          class="glass-card p-3 flex items-center justify-between gap-3"
        >
          <div class="min-w-0">
            <span class="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded">
              {{ item.uniqCode }}
            </span>
            <p class="text-xs font-semibold text-slate-900 dark:text-white truncate mt-1">{{ item.deskripsi }}</p>
            <p class="text-[11px] text-slate-400">Min. Aman: {{ item.minStock || 0 }} {{ item.satuan }}</p>
          </div>

          <div class="text-right shrink-0 flex flex-col items-end gap-1.5">
            <span class="inline-block px-2 py-0.5 rounded-lg text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
              Sisa {{ item.currentStock }} {{ item.satuan }}
            </span>

            <!-- Tombol Abaikan Stok Kosong Sengaja -->
            <button 
              @click="dismissLowStock(item)"
              class="text-[10px] text-zinc-500 hover:text-zinc-900 dark:hover:text-white underline"
              title="Tandai item ini sengaja dibiarkan kosong agar tidak muncul di beranda lagi"
            >
              Abaikan / Sengaja Kosong
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 6. DOKUMEN TRANSAKSI TERAKHIR & DAFTAR STOK TERKINI -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Dokumen Transaksi Terakhir -->
      <div class="glass-card p-4 sm:p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-bold text-zinc-900 dark:text-white text-sm sm:text-base flex items-center gap-2">
            <History class="w-4 h-4 text-zinc-800 dark:text-zinc-200" />
            Dokumen Transaksi Terbaru
          </h2>
          <button 
            @click="$emit('change-tab', 'transactions')" 
            class="text-xs text-zinc-900 dark:text-zinc-100 hover:underline font-semibold"
          >
            Selengkapnya &rarr;
          </button>
        </div>

        <div v-if="recentTransactions.length === 0" class="text-center py-8 text-zinc-400 text-xs">
          Belum ada riwayat dokumen transaksi.
        </div>

        <div v-else class="space-y-2.5">
          <div 
            v-for="tx in recentTransactions" 
            :key="tx.id"
            class="p-3 rounded-xl bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between gap-3 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60 transition-colors"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div 
                :class="[
                  'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs',
                  tx.type === 'IN' ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-sm' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700'
                ]"
              >
                {{ tx.type }}
              </div>
              <div class="min-w-0">
                <p class="text-xs font-semibold text-zinc-900 dark:text-white truncate font-mono">{{ tx.trxCode }}</p>
                <div class="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                  <span>Doc: {{ tx.noDocument || '-' }}</span>
                  <span>•</span>
                  <span>{{ tx.items?.length || 0 }} jenis item</span>
                </div>
              </div>
            </div>
            <div class="text-right shrink-0">
              <span :class="['font-bold text-xs sm:text-sm', tx.type === 'IN' ? 'text-zinc-950 dark:text-white' : 'text-rose-600 dark:text-rose-400']">
                {{ tx.type === 'IN' ? '+' : '-' }}{{ tx.totalQty }} Unit
              </span>
              <p class="text-[10px] text-zinc-400">{{ tx.tanggal }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Informasi Cepat Stok Terkini -->
      <div class="glass-card p-4 sm:p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-bold text-zinc-900 dark:text-white text-sm sm:text-base flex items-center gap-2">
            <Package class="w-4 h-4 text-zinc-800 dark:text-zinc-200" />
            Daftar Stok Terkini
          </h2>
          <button 
            @click="$emit('change-tab', 'items')" 
            class="text-xs text-zinc-900 dark:text-zinc-100 hover:underline font-semibold"
          >
            Lihat Semua &rarr;
          </button>
        </div>

        <div class="space-y-2.5">
          <div 
            v-for="item in itemsWithStock.slice(0, 5)" 
            :key="item.uniqCode"
            class="p-3 rounded-xl bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between gap-3"
          >
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <span class="font-mono text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
                  {{ item.uniqCode }}
                </span>
                <span class="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">{{ item.deskripsi }}</span>
              </div>
              <p class="text-[11px] text-zinc-400 mt-0.5">{{ item.satuan }} • {{ item.keterangan || 'Tanpa catatan' }}</p>
            </div>
            <div class="text-right shrink-0 flex items-center gap-2">
              <span 
                :class="[
                  'px-2 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center gap-1',
                  item.stockLevel === 'CRITICAL' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-300 dark:border-rose-800' :
                  item.stockLevel === 'REORDER' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-300 dark:border-amber-800' :
                  item.stockLevel === 'OVERSTOCK' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 border-purple-300 dark:border-purple-800' :
                  'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700'
                ]"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="[
                  item.stockLevel === 'CRITICAL' ? 'bg-rose-500' :
                  item.stockLevel === 'REORDER' ? 'bg-amber-500' :
                  item.stockLevel === 'OVERSTOCK' ? 'bg-purple-500' : 'bg-zinc-900 dark:bg-white'
                ]"></span>
                <span>{{ item.stockLevelLabel || 'Optimal' }}</span>
              </span>
              <span class="font-bold text-xs text-zinc-900 dark:text-white">
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
import { ref, computed, watch, onMounted } from 'vue';
import { 
  Package, 
  Layers, 
  ArrowDownLeft, 
  ArrowUpRight, 
  AlertTriangle, 
  AlertCircle,
  History,
  Calculator,
  TrendingUp,
  BarChart3,
  Zap,
  Clock
} from 'lucide-vue-next';
import { toggleItemAllowZeroStock } from '../database/db';
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

const emit = defineEmits(['change-tab', 'quick-action', 'refresh-data']);

// ==============================================================
// 1. ROLLING ANIMATED COUNTERS (EFEK ANGKA BERJALAN HALUS)
// ==============================================================
function createAnimatedCounter(targetGetter, duration = 450) {
  const displayVal = ref(0);
  let animId = null;

  watch(targetGetter, (newTarget) => {
    const start = displayVal.value;
    const target = Number(newTarget) || 0;
    if (start === target) return;

    const startTime = performance.now();
    if (animId) cancelAnimationFrame(animId);

    function frame(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      displayVal.value = Math.round(start + (target - start) * ease);

      if (progress < 1) {
        animId = requestAnimationFrame(frame);
      } else {
        displayVal.value = target;
      }
    }
    animId = requestAnimationFrame(frame);
  }, { immediate: true });

  return displayVal;
}

const targetTotalItems = computed(() => props.itemsWithStock.length);
const targetTotalStock = computed(() => props.itemsWithStock.reduce((acc, c) => acc + (Number(c.currentStock) || 0), 0));

const countTotalItems = createAnimatedCounter(() => targetTotalItems.value);
const countTotalStock = createAnimatedCounter(() => targetTotalStock.value);

// ==============================================================
// 2. GLOBAL RANGE SELECTOR (7d, 14d, 30d, mtd)
// ==============================================================
const selectedRange = ref('7d');
const rangeOptions = [
  { label: '7 Hari Terakhir', value: '7d' },
  { label: '14 Hari', value: '14d' },
  { label: '30 Hari', value: '30d' },
  { label: 'Bulan Ini', value: 'mtd' }
];

const activeRangeLabel = computed(() => {
  const opt = rangeOptions.find(o => o.value === selectedRange.value);
  return opt ? opt.label : '7 Hari Terakhir';
});

// Daftar Tanggal dalam Range Aktif (Format YYYY-MM-DD)
const activeRangeDates = computed(() => {
  const dates = [];
  const now = new Date();
  let daysCount = 7;

  if (selectedRange.value === '14d') daysCount = 14;
  else if (selectedRange.value === '30d') daysCount = 30;
  else if (selectedRange.value === 'mtd') {
    const todayDate = now.getDate();
    daysCount = Math.max(1, todayDate);
  }

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
});

// Total Inbound dan Outbound pada Rentang yang Dipilih
const rangeInQty = computed(() => {
  const activeSet = new Set(activeRangeDates.value);
  return props.transactions
    .filter(t => activeSet.has(t.tanggal) && t.type === 'IN')
    .reduce((sum, t) => sum + (Number(t.totalQty) || Number(t.qty) || 0), 0);
});

const rangeOutQty = computed(() => {
  const activeSet = new Set(activeRangeDates.value);
  return props.transactions
    .filter(t => activeSet.has(t.tanggal) && t.type === 'OUT')
    .reduce((sum, t) => sum + (Number(t.totalQty) || Number(t.qty) || 0), 0);
});

const countRangeIn = createAnimatedCounter(() => rangeInQty.value);
const countRangeOut = createAnimatedCounter(() => rangeOutQty.value);

// ==============================================================
// 3. DIAGRAM GARIS KONDISI STOK GLOBAL PER HARI
// ==============================================================
const lineChartContainerRef = ref(null);
const hoveredLineIndex = ref(-1);

const dailyChartData = computed(() => {
  const dates = activeRangeDates.value;
  if (dates.length === 0) return [];

  // 1. Petakan In dan Out per hari
  const inMap = {};
  const outMap = {};

  for (const tx of props.transactions) {
    const q = Number(tx.totalQty) || Number(tx.qty) || 0;
    if (tx.type === 'IN') inMap[tx.tanggal] = (inMap[tx.tanggal] || 0) + q;
    else if (tx.type === 'OUT') outMap[tx.tanggal] = (outMap[tx.tanggal] || 0) + q;
  }

  // 2. Rekonstruksi Saldo Stok per Hari dalam O(N) efisien
  const currentTotal = targetTotalStock.value;
  const len = dates.length;
  const forwardDeltas = new Array(len).fill(0);
  let accumulatedForward = 0;

  for (let j = len - 1; j >= 0; j--) {
    forwardDeltas[j] = accumulatedForward;
    const d = dates[j];
    accumulatedForward += ((inMap[d] || 0) - (outMap[d] || 0));
  }

  const result = [];
  for (let i = 0; i < len; i++) {
    const d = dates[i];
    const inQty = inMap[d] || 0;
    const outQty = outMap[d] || 0;
    const estimatedBalance = Math.max(0, currentTotal - forwardDeltas[i]);
    const dateObj = new Date(d);
    const shortDate = `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;
    const fullDateLabel = dateObj.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });

    result.push({
      date: d,
      shortDate,
      fullDateLabel,
      inQty,
      outQty,
      balance: estimatedBalance
    });
  }

  return result;
});

const averageDailyDelta = computed(() => {
  if (dailyChartData.value.length === 0) return 0;
  const net = rangeInQty.value - rangeOutQty.value;
  return Number((net / dailyChartData.value.length).toFixed(1));
});

// Koordinat SVG Line Chart
const lineChartPoints = computed(() => {
  const data = dailyChartData.value;
  if (data.length === 0) return [];

  const width = 800;
  const height = 240;
  const padLeft = 45;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 40;

  const usableWidth = width - padLeft - padRight;
  const usableHeight = height - padTop - padBottom;

  const balances = data.map(d => d.balance);
  const minBal = Math.max(0, Math.min(...balances) * 0.85);
  const maxBal = Math.max(10, Math.max(...balances) * 1.15);
  const rangeBal = maxBal - minBal || 1;

  const inOutMax = Math.max(10, Math.max(...data.map(d => Math.max(d.inQty, d.outQty))));

  return data.map((d, idx) => {
    const x = padLeft + (idx / Math.max(1, data.length - 1)) * usableWidth;
    const y = padTop + usableHeight - ((d.balance - minBal) / rangeBal) * usableHeight;
    const inY = padTop + usableHeight - (d.inQty / inOutMax) * (usableHeight * 0.45);
    const outY = padTop + usableHeight - (d.outQty / inOutMax) * (usableHeight * 0.45);

    return {
      ...d,
      x,
      y,
      inY,
      outY
    };
  });
});

// SVG Smooth Curve Path Builder
const stockLinePath = computed(() => {
  const pts = lineChartPoints.value;
  if (pts.length === 0) return '';
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

  let path = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i];
    const p1 = pts[i + 1];
    const cx = (p0.x + p1.x) / 2;
    path += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  return path;
});

const stockAreaPath = computed(() => {
  const pts = lineChartPoints.value;
  if (pts.length < 2) return '';
  const first = pts[0];
  const last = pts[pts.length - 1];
  return `${stockLinePath.value} L ${last.x} 200 L ${first.x} 200 Z`;
});

const sampledXLabels = computed(() => {
  const pts = lineChartPoints.value;
  if (pts.length <= 8) return pts;
  const step = Math.ceil(pts.length / 7);
  return pts.filter((_, idx) => idx % step === 0 || idx === pts.length - 1);
});

// Interactive Tooltip Tracker (Throttled by Index Delta)
function handleLineChartMouseMove(e) {
  if (!lineChartContainerRef.value || lineChartPoints.value.length === 0) return;
  const rect = lineChartContainerRef.value.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const ratio = Math.max(0, Math.min(1, mouseX / rect.width));

  const targetIdx = Math.round(ratio * (lineChartPoints.value.length - 1));
  if (hoveredLineIndex.value !== targetIdx) {
    hoveredLineIndex.value = targetIdx;
  }
}

const hoveredPoint = computed(() => {
  if (hoveredLineIndex.value < 0 || hoveredLineIndex.value >= lineChartPoints.value.length) return null;
  return lineChartPoints.value[hoveredLineIndex.value];
});

const hoveredPointPercentX = computed(() => {
  if (!hoveredPoint.value) return 0;
  return (hoveredPoint.value.x / 800) * 100;
});

const hoveredPointPercentY = computed(() => {
  if (!hoveredPoint.value) return 0;
  return (hoveredPoint.value.y / 240) * 100;
});

// ==============================================================
// 4. DIAGRAM ANALISIS PARETO (ATURAN 80/20)
// ==============================================================
const hoveredParetoItem = ref(null);

const paretoItems = computed(() => {
  const activeSet = new Set(activeRangeDates.value);
  const outTx = props.transactions.filter(t => activeSet.has(t.tanggal) && t.type === 'OUT');

  const itemQtyMap = {};
  for (const doc of outTx) {
    if (Array.isArray(doc.items)) {
      for (const line of doc.items) {
        const q = Number(line.qty) || 0;
        itemQtyMap[line.uniqCode] = (itemQtyMap[line.uniqCode] || 0) + q;
      }
    }
  }

  const items = Object.entries(itemQtyMap).map(([code, qty]) => {
    const info = props.itemsWithStock.find(i => i.uniqCode === code) || {};
    return {
      uniqCode: code,
      deskripsi: info.deskripsi || code,
      satuan: info.satuan || 'Unit',
      qty
    };
  });

  items.sort((a, b) => b.qty - a.qty);
  const totalOut = items.reduce((sum, it) => sum + it.qty, 0);

  let runningSum = 0;
  return items.map(it => {
    runningSum += it.qty;
    const cumPercent = totalOut > 0 ? Math.round((runningSum / totalOut) * 100) : 0;
    let cls = 'A';
    if (cumPercent > 95) cls = 'C';
    else if (cumPercent > 80) cls = 'B';

    return {
      ...it,
      cumPercent,
      cls
    };
  });
});

const paretoSummary = computed(() => {
  const items = paretoItems.value;
  return {
    classACount: items.filter(i => i.cls === 'A').length,
    classBCount: items.filter(i => i.cls === 'B').length,
    classCCount: items.filter(i => i.cls === 'C').length
  };
});

const paretoChartData = computed(() => {
  const items = paretoItems.value.slice(0, 10);
  if (items.length === 0) return [];

  const width = 500;
  const padLeft = 40;
  const padRight = 30;
  const maxQty = Math.max(1, items[0]?.qty || 1);
  const barSlot = (width - padLeft - padRight) / items.length;
  const barWidth = Math.max(10, barSlot * 0.65);

  return items.map((it, idx) => {
    const x = padLeft + idx * barSlot + (barSlot - barWidth) / 2;
    const barHeight = (it.qty / maxQty) * 120;
    const barY = 170 - barHeight;
    const dotX = padLeft + idx * barSlot + barSlot / 2;
    const dotY = 170 - (it.cumPercent / 100) * 140;

    return {
      ...it,
      x,
      barY,
      barWidth,
      barHeight,
      dotX,
      dotY
    };
  });
});

const paretoCumulativePath = computed(() => {
  const data = paretoChartData.value;
  if (data.length === 0) return '';
  return data.reduce((path, d, idx) => {
    return idx === 0 ? `M ${d.dotX} ${d.dotY}` : `${path} L ${d.dotX} ${d.dotY}`;
  }, '');
});

// ==============================================================
// 5. DIAGRAM MOVING BARANG (FAST, MEDIUM, SLOW, NO MOVING)
// ==============================================================
// Evaluasi per 3 bulan (90 hari) adalah rekomendasi standar industri WMS
const movingPeriod = ref('3m');

const movingPeriodDates = computed(() => {
  if (movingPeriod.value === 'sync') return activeRangeDates.value;

  const dates = [];
  const now = new Date();
  const days = movingPeriod.value === '6m' ? 180 : 90; // Default 3 bulan (90 hari)

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
});

const movingClassification = computed(() => {
  const evalDates = new Set(movingPeriodDates.value);
  const outTx = props.transactions.filter(t => evalDates.has(t.tanggal) && t.type === 'OUT');

  const movementCount = {};
  const movementQty = {};

  for (const doc of outTx) {
    if (Array.isArray(doc.items)) {
      for (const line of doc.items) {
        movementCount[line.uniqCode] = (movementCount[line.uniqCode] || 0) + 1;
        movementQty[line.uniqCode] = (movementQty[line.uniqCode] || 0) + (Number(line.qty) || 0);
      }
    }
  }

  const result = {
    fast: [],
    medium: [],
    slow: [],
    noMoving: []
  };

  for (const it of props.itemsWithStock) {
    const count = movementCount[it.uniqCode] || 0;
    const qty = movementQty[it.uniqCode] || 0;

    if (count === 0) {
      result.noMoving.push({ ...it, movementCount: 0, movementQty: 0 });
    } else if (count >= 4 || (it.currentStock > 0 && qty >= it.currentStock * 0.4)) {
      result.fast.push({ ...it, movementCount: count, movementQty: qty });
    } else if (count >= 2) {
      result.medium.push({ ...it, movementCount: count, movementQty: qty });
    } else {
      result.slow.push({ ...it, movementCount: count, movementQty: qty });
    }
  }

  return result;
});

const movingBreakdown = computed(() => {
  const total = props.itemsWithStock.length || 1;
  const m = movingClassification.value;
  return {
    fast: { count: m.fast.length, percent: Math.round((m.fast.length / total) * 100) },
    medium: { count: m.medium.length, percent: Math.round((m.medium.length / total) * 100) },
    slow: { count: m.slow.length, percent: Math.round((m.slow.length / total) * 100) },
    noMoving: { count: m.noMoving.length, percent: Math.round((m.noMoving.length / total) * 100) }
  };
});

// SVG Donut Segments
const movingDonutSegments = computed(() => {
  const total = props.itemsWithStock.length;
  if (total === 0) return [];

  const circumference = 2 * Math.PI * 38; // r = 38 => ~238.76
  const b = movingBreakdown.value;

  // Warna sesuai spesifikasi user:
  // Fast: Merah (#ef4444)
  // Medium: Oranye (#f97316)
  // Slow: Kuning (#eab308)
  // No Moving: Hitam (#18181b / #ffffff)
  const segments = [
    { key: 'fast', count: b.fast.count, color: '#ef4444' },
    { key: 'medium', count: b.medium.count, color: '#f97316' },
    { key: 'slow', count: b.slow.count, color: '#eab308' },
    { key: 'noMoving', count: b.noMoving.count, color: '#18181b' }
  ];

  let cumulativeOffset = 0;
  return segments.map(seg => {
    const fraction = seg.count / total;
    const dash = fraction * circumference;
    const gap = circumference - dash;
    const offset = -cumulativeOffset;
    cumulativeOffset += dash;

    return {
      ...seg,
      dash,
      gap,
      offset
    };
  });
});

// ==============================================================
// 6. PERINGATAN STOK MENIPIS & ABAIKAN STOK KOSONG SENGAJA
// ==============================================================
const activeLowStockItems = computed(() => {
  return props.itemsWithStock.filter(item => {
    // Abaikan jika item memang disengaja kosong atau discontinued
    if (item.allowZeroStock || item.ignoreLowStockAlert || item.status === 'DISCONTINUED') {
      return false;
    }
    return item.isLowStock;
  });
});

async function dismissLowStock(item) {
  const confirmDismiss = confirm(
    `Abaikan item "${item.deskripsi}" dari peringatan beranda?\n\n` +
    `Item ini akan ditandai sebagai stok kosong yang disengaja dan tidak akan muncul kembali di peringatan stok menipis.`
  );
  if (!confirmDismiss) return;

  await toggleItemAllowZeroStock(item.uniqCode, true);
  emit('refresh-data');
}

// Recent Transactions Feed
const recentTransactions = computed(() => {
  return [...props.transactions].reverse().slice(0, 5);
});
</script>
