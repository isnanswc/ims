<template>
  <div class="space-y-5 pb-24 md:pb-6">
    <!-- Header Banner Pusat Data & Excel (Data Hub) -->
    <div class="glass-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-bold shadow-xs">
            <FileSpreadsheet class="w-5 h-5" />
          </div>
          <div>
            <h1 class="text-base sm:text-xl font-bold text-zinc-950 dark:text-white flex items-center gap-2">
              <span>Pusat Data Excel & Integrasi (Data Hub)</span>
              <span class="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 font-mono">
                WMS Suite
              </span>
            </h1>
            <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Kelola ekspor-impor Excel (.xlsx) cerdas, unduh template standar, validasi data otomatis, dan cadangan lokal offline.
            </p>
          </div>
        </div>
      </div>

      <!-- Quick Tab Switcher Minimalis (Grid di Mobile, Flex di Desktop) -->
      <div class="grid grid-cols-3 sm:flex items-center bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold w-full sm:w-auto">
        <button 
          @click="activeHubTab = 'import'"
          :class="[
            'flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all',
            activeHubTab === 'import' ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-sm font-bold' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          ]"
        >
          <Upload class="w-3.5 h-3.5 shrink-0" />
          <span class="truncate">Impor</span>
        </button>
        <button 
          @click="activeHubTab = 'export'"
          :class="[
            'flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all',
            activeHubTab === 'export' ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-sm font-bold' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          ]"
        >
          <Download class="w-3.5 h-3.5 shrink-0" />
          <span class="truncate">Ekspor</span>
        </button>
        <button 
          @click="activeHubTab = 'backup'"
          :class="[
            'flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all',
            activeHubTab === 'backup' ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-sm font-bold' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          ]"
        >
          <Database class="w-3.5 h-3.5 shrink-0" />
          <span class="truncate">Cadangan</span>
        </button>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- TAB 1: IMPOR EXCEL CERDAS DENGAN VALIDASI & PREVIEW            -->
    <!-- ============================================================== -->
    <div v-if="activeHubTab === 'import'" class="space-y-4">
      <!-- 1. Pilihan Modul & Download Template Resmi -->
      <div class="glass-card p-4 sm:p-5 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-200/80 dark:border-zinc-800 pb-3">
          <div>
            <h2 class="text-sm sm:text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <span>Langkah 1: Pilih Modul & Siapkan File Excel</span>
            </h2>
            <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Anda dapat mengimpor data sebagian (hanya item, transaksi, atau lokasi) tanpa harus mengisi seluruh sistem.
            </p>
          </div>

          <!-- Tombol Download Template Resmi -->
          <button 
            @click="downloadTemplate"
            class="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
            :title="`Unduh template Excel resmi untuk modul ${selectedImportModule}`"
          >
            <Download class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Unduh Template {{ getModuleLabel(selectedImportModule) }} (.xlsx)</span>
          </button>
        </div>

        <!-- Kartu Selector Modul Target -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div 
            @click="selectModule('ITEMS')"
            :class="[
              'p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3',
              selectedImportModule === 'ITEMS' 
                ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border-zinc-950 dark:border-white shadow-sm' 
                : 'bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'
            ]"
          >
            <Package class="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <strong class="text-xs block font-bold">1. Master Item Barang</strong>
              <span class="text-[10px] opacity-80 leading-relaxed block mt-0.5">
                Katalog SKU, nama barang, satuan, batas minimum/maksimum stok, dan lead time.
              </span>
            </div>
          </div>

          <div 
            @click="selectModule('TRANSACTIONS')"
            :class="[
              'p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3',
              selectedImportModule === 'TRANSACTIONS' 
                ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border-zinc-950 dark:border-white shadow-sm' 
                : 'bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'
            ]"
          >
            <ArrowDownLeft class="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <strong class="text-xs block font-bold">2. Transfer Order (IN / OUT)</strong>
              <span class="text-[10px] opacity-80 leading-relaxed block mt-0.5">
                Dokumen mutasi masuk dari supplier atau barang keluar ke pelanggan.
              </span>
            </div>
          </div>

          <div 
            @click="selectModule('LOCATIONS')"
            :class="[
              'p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3',
              selectedImportModule === 'LOCATIONS' 
                ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border-zinc-950 dark:border-white shadow-sm' 
                : 'bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'
            ]"
          >
            <MapPin class="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <strong class="text-xs block font-bold">3. Denah Lokasi & Rak</strong>
              <span class="text-[10px] opacity-80 leading-relaxed block mt-0.5">
                Daftar rak gudang, tipe penyimpanan, dan batas kapasitas fisik maksimal.
              </span>
            </div>
          </div>
        </div>

        <!-- 2. Area Drag and Drop / Upload File -->
        <div class="pt-2">
          <label 
            :class="[
              'border-2 border-dashed rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer group',
              isDragging 
                ? 'border-zinc-950 dark:border-white bg-zinc-100 dark:bg-zinc-900' 
                : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-500 bg-zinc-50/50 dark:bg-zinc-900/30'
            ]"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleFileDrop"
          >
            <input 
              type="file" 
              accept=".xlsx, .xls" 
              class="hidden" 
              @change="handleFileSelect"
            />
            <div :class="[
              'w-12 h-12 rounded-2xl flex items-center justify-center mb-2.5 group-hover:scale-110 transition-all shadow-xs',
              isDragging 
                ? 'bg-emerald-600 text-white scale-110 ring-4 ring-emerald-400/30' 
                : 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400'
            ]">
              <Upload class="w-6 h-6" />
            </div>
            <p class="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white">
              Klik untuk memilih file Excel, atau seret & lepas (*drag and drop*) ke sini
            </p>
            <p class="text-[11px] text-zinc-400 mt-0.5">
              Format yang didukung: <strong>.xlsx</strong> atau <strong>.xls</strong> (Maks. 10 MB)
            </p>

            <!-- Fitur Cerdas Highlight Chips -->
            <div class="flex flex-wrap items-center justify-center gap-2 mt-2.5">
              <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                <Zap class="w-3 h-3 text-purple-500" />
                <span>Auto-SKU: Jika kolom SKU kosong, otomatis dibuat</span>
              </span>
              <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                <Calendar class="w-3 h-3 text-blue-500" />
                <span>Tanggal Fleksibel: Serial Excel, DD/MM/YYYY, ISO</span>
              </span>
            </div>

            <!-- Badge File Terpilih -->
            <div v-if="parsedFileName" class="mt-3.5 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-bold flex items-center gap-2 border border-emerald-300 dark:border-emerald-700 shadow-xs">
              <FileSpreadsheet class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>File Terpilih: {{ parsedFileName }}</span>
              <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600" />
            </div>
          </label>
        </div>
      </div>

      <!-- 3. PREVIEW & SMART VALIDATION CARD (Muncul Setelah File Diupload) -->
      <div v-if="parsedPreviewData" class="glass-card p-4 sm:p-5 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-200/80 dark:border-zinc-800 pb-3">
          <div>
            <h3 class="text-sm sm:text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Sparkles class="w-4 h-4 text-zinc-800 dark:text-zinc-200" />
              <span>Hasil Analisis & Pratinjau (*Pre-Flight Check*)</span>
            </h3>
            <p class="text-[11px] text-zinc-400">
              Periksa ringkasan validasi sebelum data dimasukkan secara permanen ke IndexedDB.
            </p>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center gap-2">
            <button 
              @click="cancelPreview"
              class="px-3.5 py-1.5 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white rounded-xl text-xs font-semibold border border-zinc-300 dark:border-zinc-700 transition-colors"
            >
              Batalkan
            </button>
            <button 
              @click="executeImport"
              :disabled="isImporting || parsedPreviewData.validCount === 0"
              class="flex items-center gap-2 px-4 py-2 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 rounded-xl text-xs font-bold shadow-sm border border-zinc-950 dark:border-white transition-all disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 class="w-4 h-4" />
              <span>{{ isImporting ? 'Memproses Impor...' : `Konfirmasi & Impor (${parsedPreviewData.validCount} Baris)` }}</span>
            </button>
          </div>
        </div>

        <!-- Kartu Metrik Validasi 5 Pilar Berwarna Estetik & Informatif -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <!-- Total Baris -->
          <div class="p-3 bg-zinc-50/70 dark:bg-zinc-900/60 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
            <div class="flex items-center justify-between text-zinc-500 mb-1">
              <span class="text-[10px] uppercase font-mono tracking-wider font-semibold">Total Baris</span>
              <FileSpreadsheet class="w-3.5 h-3.5 text-zinc-400" />
            </div>
            <strong class="text-xl font-black text-zinc-900 dark:text-white">{{ parsedPreviewData.totalRows }}</strong>
            <span class="text-[10px] text-zinc-400 block font-mono mt-0.5">Baris Excel</span>
          </div>

          <!-- Baris Siap Impor -->
          <div class="p-3 bg-emerald-500/10 dark:bg-emerald-950/30 rounded-xl border border-emerald-300 dark:border-emerald-800/80 shadow-xs">
            <div class="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-1">
              <span class="text-[10px] uppercase font-mono tracking-wider font-bold">Siap Impor</span>
              <CheckCircle2 class="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <strong class="text-xl font-black text-emerald-700 dark:text-emerald-300">{{ parsedPreviewData.validCount }}</strong>
            <span class="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 block font-mono mt-0.5">Valid & tersimpan</span>
          </div>

          <!-- SKU Dicocokkan (Deskripsi Serupa) -->
          <div class="p-3 bg-teal-500/10 dark:bg-teal-950/30 rounded-xl border border-teal-300 dark:border-teal-800/80 shadow-xs">
            <div class="flex items-center justify-between text-teal-600 dark:text-teal-400 mb-1">
              <span class="text-[10px] uppercase font-mono tracking-wider font-bold">SKU Mirip</span>
              <RefreshCw class="w-3.5 h-3.5 text-teal-500" />
            </div>
            <strong class="text-xl font-black text-teal-700 dark:text-teal-300">{{ parsedPreviewData.matchedSkuCount || 0 }}</strong>
            <span class="text-[10px] text-teal-600/80 dark:text-teal-400/80 block font-mono mt-0.5">Pakai item katalog</span>
          </div>

          <!-- Auto-SKU Baru -->
          <div class="p-3 bg-purple-500/10 dark:bg-purple-950/30 rounded-xl border border-purple-300 dark:border-purple-800/80 shadow-xs">
            <div class="flex items-center justify-between text-purple-600 dark:text-purple-400 mb-1">
              <span class="text-[10px] uppercase font-mono tracking-wider font-bold">Auto-SKU Baru</span>
              <Zap class="w-3.5 h-3.5 text-purple-500" />
            </div>
            <strong class="text-xl font-black text-purple-700 dark:text-purple-300">{{ parsedPreviewData.autoSkuCount || 0 }}</strong>
            <span class="text-[10px] text-purple-600/80 dark:text-purple-400/80 block font-mono mt-0.5">Otomatis dibuat</span>
          </div>

          <!-- Peringatan / Dilewati -->
          <div class="p-3 bg-rose-500/10 dark:bg-rose-950/30 rounded-xl border border-rose-300 dark:border-rose-800/80 shadow-xs">
            <div class="flex items-center justify-between text-rose-600 dark:text-rose-400 mb-1">
              <span class="text-[10px] uppercase font-mono tracking-wider font-bold">Dilewati</span>
              <AlertTriangle class="w-3.5 h-3.5 text-rose-500" />
            </div>
            <strong class="text-xl font-black text-rose-700 dark:text-rose-300">{{ parsedPreviewData.invalidCount }}</strong>
            <span class="text-[10px] text-rose-600/80 dark:text-rose-400/80 block font-mono mt-0.5">Data tidak lengkap</span>
          </div>
        </div>

        <!-- Banner 1: SKU Dicocokkan dari Deskripsi Serupa (Mencegah Duplikasi) -->
        <div v-if="parsedPreviewData.matchedSkuCount > 0" class="flex items-start gap-2.5 p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/70 text-teal-900 dark:text-teal-200 text-xs shadow-xs">
          <RefreshCw class="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
          <div class="leading-relaxed">
            <strong class="font-bold">🔄 Deteksi Kemiripan Deskripsi Aktif:</strong>
            Ditemukan <strong>{{ parsedPreviewData.matchedSkuCount }} baris</strong> tanpa Kode SKU yang memiliki deskripsi mirip dengan master item di katalog. Sistem secara otomatis menautkan baris tersebut ke SKU yang sudah ada untuk <strong>mencegah duplikasi barang ganda</strong>.
          </div>
        </div>

        <!-- Banner 2: Auto-SKU Otomatis Dibuat Baru (Jika Tidak Ada yang Mirip) -->
        <div v-if="parsedPreviewData.autoSkuCount > 0" class="flex items-start gap-2.5 p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/70 text-purple-900 dark:text-purple-200 text-xs shadow-xs">
          <Zap class="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
          <div class="leading-relaxed">
            <strong class="font-bold">⚡ Fitur Auto-SKU Baru:</strong>
            Ditemukan <strong>{{ parsedPreviewData.autoSkuCount }} baris</strong> baru tanpa Kode SKU yang tidak memiliki kecocokan di katalog. Sistem telah otomatis membuat kode SKU unik (contoh: <code class="px-1.5 py-0.5 rounded bg-purple-200/70 dark:bg-purple-900/80 font-mono font-bold">{{ parsedPreviewData.firstAutoSku }}</code>) dan langsung mendaftarkannya ke database.
          </div>
        </div>

        <!-- Pengaturan Cerdas Resolusi Data (Smart Auto-Resolution Switches) -->
        <div class="p-3.5 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2.5">
          <div class="flex items-center gap-2">
            <Sliders class="w-4 h-4 text-zinc-500" />
            <h4 class="font-bold text-xs uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Kebijakan Integritas & Penanganan Otomatis
            </h4>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <!-- Switch 1: Auto Register Master -->
            <label class="flex items-start gap-2.5 p-2.5 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 cursor-pointer">
              <input 
                type="checkbox" 
                v-model="importOptions.autoRegisterMaster" 
                class="mt-0.5 rounded text-zinc-950 focus:ring-zinc-500"
              />
              <div>
                <strong class="text-zinc-900 dark:text-white block font-semibold">
                  Otomatis Daftarkan Master Item Baru
                </strong>
                <span class="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight block">
                  Jika transaksi memuat SKU yang belum ada di katalog, buat master item baru otomatis dengan nilai default aman.
                </span>
              </div>
            </label>

            <!-- Switch 2: Fallback to Staging -->
            <label class="flex items-start gap-2.5 p-2.5 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 cursor-pointer">
              <input 
                type="checkbox" 
                v-model="importOptions.fallbackToStaging" 
                class="mt-0.5 rounded text-zinc-950 focus:ring-zinc-500"
              />
              <div>
                <strong class="text-zinc-900 dark:text-white block font-semibold">
                  Gunakan ZONE-STAGING jika Lokasi Belum Terdaftar
                </strong>
                <span class="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight block">
                  Jika kolom lokasi rak di file Excel belum ada, barang otomatis dialokasikan ke Area Staging untuk dipindahkan nanti.
                </span>
              </div>
            </label>
          </div>
        </div>

        <!-- Tabel Preview Baris Data (Estetik, Berwarna, dan Interaktif) -->
        <div class="space-y-2">
          <div class="flex items-center justify-between text-[11px] font-mono text-zinc-500">
            <span class="flex items-center gap-1.5">
              <Sparkles class="w-3.5 h-3.5 text-zinc-400" />
              <span>Pratinjau Data dengan Format Warna (Maks. 8 Baris):</span>
            </span>
            <span>Menampilkan {{ Math.min(8, parsedPreviewData.rows.length) }} dari {{ parsedPreviewData.rows.length }} baris</span>
          </div>

          <div class="overflow-x-auto touch-pan-x rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <table class="min-w-[650px] w-full text-left border-collapse text-[11px]">
              <thead>
                <tr class="bg-zinc-100/90 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase font-mono tracking-wider">
                  <th class="py-2.5 px-3">Status</th>
                  <th v-for="col in parsedPreviewData.headers" :key="col" class="py-2.5 px-3 whitespace-nowrap">
                    {{ col }}
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-200 dark:divide-zinc-800 font-mono">
                <tr 
                  v-for="(row, idx) in parsedPreviewData.rows.slice(0, 8)" 
                  :key="idx"
                  class="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/60 transition-colors"
                >
                  <!-- 1. Kolom Status Berwarna -->
                  <td class="py-2.5 px-3 whitespace-nowrap">
                    <span 
                      :class="[
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xs',
                        row._status === 'VALID' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' :
                        row._status === 'MATCHED_SKU' ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-300 dark:border-teal-800' :
                        row._status === 'AUTO_SKU' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300 dark:border-purple-800' :
                        row._status === 'NEW_SKU' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-800' :
                        'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                      ]"
                    >
                      <CheckCircle2 v-if="row._status === 'VALID'" class="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <RefreshCw v-else-if="row._status === 'MATCHED_SKU'" class="w-3 h-3 text-teal-600 dark:text-teal-400" />
                      <Zap v-else-if="row._status === 'AUTO_SKU'" class="w-3 h-3 text-purple-600 dark:text-purple-400" />
                      <Sparkles v-else-if="row._status === 'NEW_SKU'" class="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      <AlertTriangle v-else class="w-3 h-3 text-rose-600 dark:text-rose-400" />
                      <span>{{ row._statusLabel }}</span>
                    </span>
                  </td>

                  <!-- 2. Kolom Data Dinamis Berwarna Sesuai Tipe Data -->
                  <td v-for="col in parsedPreviewData.headers" :key="col" class="py-2.5 px-3 truncate max-w-[200px]">
                    <!-- A. Kolom Kode SKU -->
                    <template v-if="isSkuColumn(col)">
                      <!-- SKU Hasil Pencocokan Deskripsi Mirip (Mencegah Duplikasi) -->
                      <span 
                        v-if="row._isMatchedSku" 
                        class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-mono text-[11px] font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-300 dark:border-teal-800 shadow-xs"
                        :title="`Deskripsi mirip dengan item katalog: ${row._matchedItem?.deskripsi}`"
                      >
                        <RefreshCw class="w-3 h-3 text-teal-500" />
                        <span>{{ row[col] }}</span>
                        <span class="text-[9px] font-sans font-semibold bg-teal-200/70 dark:bg-teal-800 text-teal-800 dark:text-teal-200 px-1 rounded">MIRIP {{ row._matchScore }}%</span>
                      </span>

                      <!-- SKU Baru Dibuat Otomatis -->
                      <span 
                        v-else-if="row._isAutoSku" 
                        class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-mono text-[11px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shadow-xs"
                        title="Kode SKU dihasilkan otomatis karena belum ada item serupa di katalog"
                      >
                        <Zap class="w-3 h-3 text-purple-500 fill-purple-400/30" />
                        <span>{{ row[col] }}</span>
                        <span class="text-[9px] font-sans font-semibold bg-purple-200/70 dark:bg-purple-800 text-purple-800 dark:text-purple-200 px-1 rounded">AUTO</span>
                      </span>
                      <span 
                        v-else-if="row[col]" 
                        class="inline-flex items-center px-2 py-0.5 rounded-md font-mono text-[11px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700"
                      >
                        {{ row[col] }}
                      </span>
                      <span v-else class="text-zinc-400 italic text-[10px]">-</span>
                    </template>

                    <!-- B. Kolom Tanggal Fleksibel -->
                    <template v-else-if="isDateColumn(col)">
                      <span 
                        class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-mono text-[11px] bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 shadow-xs"
                        :title="`Asli dari Excel: ${row[col]}`"
                      >
                        <Calendar class="w-3 h-3 text-blue-500" />
                        <span>{{ parseFlexibleDate(row[col]) }}</span>
                      </span>
                    </template>

                    <!-- C. Kolom Tipe Transfer (IN / OUT) -->
                    <template v-else-if="isTypeColumn(col)">
                      <span 
                        v-if="String(row[col]).toUpperCase().includes('OUT')" 
                        class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800 shadow-xs"
                      >
                        <ArrowUpRight class="w-3 h-3 text-amber-600" />
                        <span>OUT (Keluar)</span>
                      </span>
                      <span 
                        v-else 
                        class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shadow-xs"
                      >
                        <ArrowDownLeft class="w-3 h-3 text-emerald-600" />
                        <span>IN (Masuk)</span>
                      </span>
                    </template>

                    <!-- D. Kolom Kuantitas / Qty -->
                    <template v-else-if="isQtyColumn(col)">
                      <span class="inline-flex items-center px-2 py-0.5 rounded-md font-mono font-bold text-[11px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                        {{ !isNaN(Number(row[col])) ? Number(row[col]).toLocaleString('id-ID') : (row[col] || 0) }}
                      </span>
                    </template>

                    <!-- E. Kolom Lokasi Rak -->
                    <template v-else-if="isLocColumn(col)">
                      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[11px] bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-900">
                        <MapPin class="w-3 h-3 text-cyan-500" />
                        <span>{{ row[col] || 'ZONE-STAGING' }}</span>
                      </span>
                    </template>

                    <!-- F. Kolom Teks Default -->
                    <template v-else>
                      <span class="text-zinc-800 dark:text-zinc-200 font-medium">
                        {{ row[col] !== '' && row[col] !== null && row[col] !== undefined ? row[col] : '-' }}
                      </span>
                    </template>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 4. PANDUAN KETERKAITAN DATA & INTEGRITAS SISTEM (FAQ MINIMALIS) -->
      <div class="glass-card p-4 sm:p-5 space-y-3 border-zinc-200/80 dark:border-zinc-800">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
            <HelpCircle class="w-3.5 h-3.5" />
          </div>
          <h3 class="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
            Panduan Integritas Data & Keterkaitan Antar-Modul
          </h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <!-- Item 1 -->
          <div class="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800 space-y-1">
            <strong class="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-zinc-950 dark:bg-white inline-block"></span>
              Apakah bisa mengimpor sebagian data saja?
            </strong>
            <p class="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              <strong>Bisa dan sangat aman.</strong> Anda bebas mengimpor hanya Master Item, hanya Transfer Order, atau hanya Lokasi Rak tanpa harus mengisi seluruh data sekaligus.
            </p>
          </div>

          <!-- Item 2 -->
          <div class="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800 space-y-1">
            <strong class="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-zinc-950 dark:bg-white inline-block"></span>
              Bagaimana jika SKU di Transfer Order belum ada di Master?
            </strong>
            <p class="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Jika opsi <em>"Otomatis Daftarkan Master Item Baru"</em> aktif, sistem akan mendaftarkan SKU baru secara otomatis dengan batas aman default (Min: 0, Max: 2x Qty, Lead Time: 7 hari). Jika nonaktif, baris tersebut akan dilewati (*skip*).
            </p>
          </div>

          <!-- Item 3 -->
          <div class="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800 space-y-1">
            <strong class="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-zinc-950 dark:bg-white inline-block"></span>
              Bagaimana jika kode rak belum terdaftar?
            </strong>
            <p class="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Sistem otomatis mengalihkan alokasi fisik barang ke <code>ZONE-STAGING</code> (Area Transit). Catatan mutasi tetap akurat dan barang siap dipindahkan via menu Movement Worksheet.
            </p>
          </div>

          <!-- Item 4 -->
          <div class="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800 space-y-1">
            <strong class="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-zinc-950 dark:bg-white inline-block"></span>
              Bagaimana keterkaitan dengan Item Ledger & Saldo Stok?
            </strong>
            <p class="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Buku besar (Item Ledger) dan saldo stok fisik dihitung secara dinamis dan <em>real-time</em> dari seluruh dokumen Transfer Order (IN & OUT). Keduanya tidak diimpor manual terpisah agar riwayat audit selalu valid 100%.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- TAB 2: EKSPOR EXCEL MULTI-MODUL (ALL-IN-ONE & SPESIFIK)        -->
    <!-- ============================================================== -->
    <div v-else-if="activeHubTab === 'export'" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- 1. Ekspor Buku Kerja Lengkap (All-in-One 5-Sheets) -->
        <div class="glass-card p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-bold">
                <Layers class="w-5 h-5" />
              </div>
              <div>
                <h3 class="font-bold text-sm text-zinc-950 dark:text-white">Buku Kerja Lengkap All-in-One (.xlsx)</h3>
                <p class="text-xs text-zinc-400">1 File Excel memuat seluruh database 5 sheet terpisah.</p>
              </div>
            </div>

            <div class="mt-4 p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs space-y-1.5 text-zinc-600 dark:text-zinc-400">
              <p class="font-bold text-zinc-900 dark:text-white">Isi Sheet yang Dihasilkan:</p>
              <div class="grid grid-cols-1 gap-1 text-[11px] font-mono">
                <div>• <strong>Sheet 1:</strong> Master Item & Stok Fisik ({{ itemsWithStock.length }} SKU)</div>
                <div>• <strong>Sheet 2:</strong> Header Transfer Order ({{ transactions.length }} Dokumen)</div>
                <div>• <strong>Sheet 3:</strong> Rincian Baris Transaksi Item</div>
                <div>• <strong>Sheet 4:</strong> Rencana Pengadaan PPIC</div>
                <div>• <strong>Sheet 5:</strong> Okupansi Rak & Movement Gudang</div>
              </div>
            </div>
          </div>

          <button 
            @click="exportMasterWorkbook"
            class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 rounded-xl font-bold text-xs shadow-sm border border-zinc-950 dark:border-white transition-all cursor-pointer"
          >
            <Download class="w-4 h-4" />
            <span>Unduh Buku Kerja Lengkap (5 Sheets .xlsx)</span>
          </button>
        </div>

        <!-- 2. Ekspor Kustom dengan Filter Rentang Waktu -->
        <div class="glass-card p-5 space-y-4 flex flex-col justify-between">
          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center border border-zinc-300 dark:border-zinc-700">
                <Filter class="w-5 h-5" />
              </div>
              <div>
                <h3 class="font-bold text-sm text-zinc-950 dark:text-white">Ekspor Transaksi dengan Filter Periode</h3>
                <p class="text-xs text-zinc-400">Ekspor Transfer Order dengan filter tanggal dan status spesifik.</p>
              </div>
            </div>

            <!-- Filter Options Form -->
            <div class="space-y-2.5 text-xs pt-2">
              <div>
                <label class="font-bold text-[11px] text-zinc-700 dark:text-zinc-300 block mb-1">Pilih Tipe Dokumen:</label>
                <div class="grid grid-cols-3 gap-2">
                  <button 
                    @click="exportCustomFilter.type = 'ALL'"
                    :class="['py-1.5 rounded-lg border text-xs font-semibold text-center transition-colors', exportCustomFilter.type === 'ALL' ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border-zinc-950 dark:border-white' : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400']"
                  >
                    Semua (IN & OUT)
                  </button>
                  <button 
                    @click="exportCustomFilter.type = 'IN'"
                    :class="['py-1.5 rounded-lg border text-xs font-semibold text-center transition-colors', exportCustomFilter.type === 'IN' ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border-zinc-950 dark:border-white' : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400']"
                  >
                    Hanya Masuk (IN)
                  </button>
                  <button 
                    @click="exportCustomFilter.type = 'OUT'"
                    :class="['py-1.5 rounded-lg border text-xs font-semibold text-center transition-colors', exportCustomFilter.type === 'OUT' ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border-zinc-950 dark:border-white' : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400']"
                  >
                    Hanya Keluar (OUT)
                  </button>
                </div>
              </div>

              <div>
                <label class="font-bold text-[11px] text-zinc-700 dark:text-zinc-300 block mb-1">Rentang Tanggal:</label>
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <span class="text-[10px] text-zinc-400 font-mono block">Mulai Tanggal:</span>
                    <input 
                      type="date" 
                      v-model="exportCustomFilter.startDate"
                      class="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <span class="text-[10px] text-zinc-400 font-mono block">Sampai Tanggal:</span>
                    <input 
                      type="date" 
                      v-model="exportCustomFilter.endDate"
                      class="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button 
            @click="exportFilteredTransactionsExcel"
            class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl font-bold text-xs border border-zinc-300 dark:border-zinc-700 shadow-xs transition-all cursor-pointer"
          >
            <FileSpreadsheet class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Ekspor Transaksi Terfilter (.xlsx)</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- TAB 3: CADANGAN JSON & PEMULIHAN SISTEM OFFLINE                 -->
    <!-- ============================================================== -->
    <div v-else-if="activeHubTab === 'backup'" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Card Backup JSON -->
        <div class="glass-card p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white flex items-center justify-center border border-zinc-300 dark:border-zinc-700">
                <Download class="w-5 h-5" />
              </div>
              <div>
                <h3 class="font-bold text-sm text-zinc-950 dark:text-white">Ekspor Cadangan (JSON)</h3>
                <p class="text-xs text-zinc-400">Unduh seluruh basis data IndexedDB.</p>
              </div>
            </div>
            <p class="text-xs text-zinc-600 dark:text-zinc-400 mt-3 leading-relaxed">
              File JSON memuat struktur tabel lengkap. Simpan file ini jika Anda ingin memindahkan data ke komputer atau peramban lain.
            </p>
          </div>

          <button 
            @click="downloadBackupJson"
            class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 rounded-xl font-bold text-xs shadow-sm border border-zinc-950 dark:border-white transition-all cursor-pointer"
          >
            <Download class="w-4 h-4" />
            <span>Unduh File Cadangan (.json)</span>
          </button>
        </div>

        <!-- Card Restore JSON -->
        <div class="glass-card p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white flex items-center justify-center border border-zinc-300 dark:border-zinc-700">
                <Upload class="w-5 h-5" />
              </div>
              <div>
                <h3 class="font-bold text-sm text-zinc-950 dark:text-white">Pulihkan Data (JSON)</h3>
                <p class="text-xs text-zinc-400">Restore file .json yang dicadangkan.</p>
              </div>
            </div>
            <p class="text-xs text-zinc-600 dark:text-zinc-400 mt-3 leading-relaxed">
              Memulihkan data akan menggantikan data barang, transaksi, dan lokasi yang ada saat ini dengan data dari file cadangan.
            </p>
          </div>

          <label class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl font-bold text-xs border border-zinc-300 dark:border-zinc-700 shadow-xs cursor-pointer transition-all">
            <Upload class="w-4 h-4" />
            <span>Pilih File Cadangan (.json)</span>
            <input type="file" accept=".json" @change="handleRestoreFile" class="hidden" />
          </label>
        </div>

        <!-- Reset / Demo Data -->
        <div class="glass-card p-5 space-y-4 flex flex-col justify-between border-rose-200/50 dark:border-rose-900/40">
          <div>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20">
                <RefreshCw class="w-5 h-5" />
              </div>
              <div>
                <h3 class="font-bold text-sm text-rose-900 dark:text-rose-300">Atur Ulang Data Demo</h3>
                <p class="text-xs text-rose-400">Kembalikan ke sampel bawaan.</p>
              </div>
            </div>
            <p class="text-xs text-zinc-600 dark:text-zinc-400 mt-3 leading-relaxed">
              Menghapus data saat ini dan mengisi kembali 8 SKU demo, riwayat mutasi contoh, serta rak standar untuk latihan.
            </p>
          </div>

          <button 
            @click="resetToDemo"
            class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl font-bold text-xs transition-all cursor-pointer"
          >
            <RefreshCw class="w-4 h-4" />
            <span>Muat Ulang Sampel Demo</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { 
  db, 
  seedDemoDataIfEmpty, 
  seedLocationDataIfEmpty, 
  applyTransactionStockToLocations,
  calculateStockMap 
} from '../database/db';
import { 
  Download, 
  Upload, 
  FileSpreadsheet, 
  RefreshCw, 
  Package, 
  ArrowDownLeft, 
  ArrowUpRight,
  MapPin, 
  Layers, 
  Filter, 
  CheckCircle2, 
  Sparkles, 
  Sliders, 
  Database,
  HelpCircle,
  Zap,
  Calendar,
  AlertTriangle
} from 'lucide-vue-next';
import * as XLSX from 'xlsx';
import { 
  formatWorksheetTable, 
  createStyledSheet, 
  parseFlexibleDate, 
  generateAutoSkuCode,
  findSimilarItemByDescription 
} from '../utils/excelFormatter';

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

const emit = defineEmits(['refresh-data']);

// State Tab Navigation
const activeHubTab = ref('import'); // 'import' | 'export' | 'backup'

// State Impor
const selectedImportModule = ref('ITEMS'); // 'ITEMS' | 'TRANSACTIONS' | 'LOCATIONS'
const isDragging = ref(false);
const isImporting = ref(false);
const parsedFileName = ref('');
const parsedPreviewData = ref(null);

// Opsi Kebijakan Impor Cerdas
const importOptions = ref({
  autoRegisterMaster: true,
  fallbackToStaging: true,
  upsertMode: true
});

// State Filter Ekspor Kustom
const exportCustomFilter = ref({
  type: 'ALL',
  startDate: '',
  endDate: ''
});

function selectModule(mod) {
  selectedImportModule.value = mod;
  parsedPreviewData.value = null;
  parsedFileName.value = '';
}

function getModuleLabel(mod) {
  switch (mod) {
    case 'TRANSACTIONS': return 'Transfer Order';
    case 'LOCATIONS': return 'Lokasi Rak';
    case 'ITEMS':
    default: return 'Master Item';
  }
}

// Helper deteksi tipe kolom untuk styling pratinjau tabel yang kaya warna & estetik
function isSkuColumn(col) {
  const c = String(col || '').toLowerCase();
  return c.includes('sku') || c.includes('kode item') || c.includes('uniq code') || c === 'kode';
}

function isDateColumn(col) {
  const c = String(col || '').toLowerCase();
  return c.includes('tanggal') || c.includes('date') || c.includes('tgl');
}

function isTypeColumn(col) {
  const c = String(col || '').toLowerCase();
  return c.includes('tipe') || c.includes('type');
}

function isQtyColumn(col) {
  const c = String(col || '').toLowerCase();
  return c.includes('qty') || c.includes('jumlah') || c.includes('kuantitas') || c.includes('stok') || c.includes('kapasitas');
}

function isLocColumn(col) {
  const c = String(col || '').toLowerCase();
  return c.includes('lokasi') || c.includes('rak');
}

// =========================================================================
// 1. GENERATE TEMPLATE EXCEL RESMI DENGAN DATA CONTOH & PANDUAN LENGKAP
// =========================================================================
function downloadTemplate() {
  const wb = XLSX.utils.book_new();

  if (selectedImportModule.value === 'ITEMS') {
    const templateData = [
      {
        'Kode SKU': 'BRG-010',
        'Deskripsi Barang': 'Kabel UTP Cat6 305 Meter',
        'Satuan': 'Roll',
        'Min Stock': 5,
        'Max Stock': 30,
        'Lead Time (Hari)': 7,
        'Keterangan': 'Material instalasi jaringan'
      },
      {
        'Kode SKU': 'BRG-011',
        'Deskripsi Barang': 'Konektor RJ45 Cat6 Gold Plated Isi 50',
        'Satuan': 'Pack',
        'Min Stock': 10,
        'Max Stock': 50,
        'Lead Time (Hari)': 3,
        'Keterangan': 'Fast moving picking'
      },
      {
        'Kode SKU': 'BRG-012',
        'Deskripsi Barang': 'Kertas HVS A4 80gr PaperOne',
        'Satuan': 'Rim',
        'Min Stock': 20,
        'Max Stock': 100,
        'Lead Time (Hari)': 5,
        'Keterangan': 'Alat tulis operasional kantor'
      },
      {
        'Kode SKU': 'BRG-013',
        'Deskripsi Barang': 'Spidol Whiteboard Hitam Snowman',
        'Satuan': 'Pcs',
        'Min Stock': 15,
        'Max Stock': 60,
        'Lead Time (Hari)': 2,
        'Keterangan': 'Perlengkapan ruang meeting'
      },
      {
        'Kode SKU': 'BRG-014',
        'Deskripsi Barang': 'Baterai Alkaline AA Isi 4',
        'Satuan': 'Pack',
        'Min Stock': 10,
        'Max Stock': 40,
        'Lead Time (Hari)': 4,
        'Keterangan': 'Inventaris operasional'
      }
    ];

    const guideData = [
      {
        'Nama Kolom Header': 'Kode SKU',
        'Tipe Data': 'Teks (String)',
        'Status Wajib': 'Opsional (Auto-Add Jika Kosong)',
        'Aturan & Format Contoh': 'Kode unik identitas barang. JIKA DIKOSONGKAN: Sistem otomatis menghasilkan kode SKU unik (Auto-SKU) dari deskripsi barang.'
      },
      {
        'Nama Kolom Header': 'Deskripsi Barang',
        'Tipe Data': 'Teks (String)',
        'Status Wajib': 'Wajib Diisi (Mandatory)',
        'Aturan & Format Contoh': 'Nama lengkap atau spesifikasi barang. Contoh: Kertas HVS A4 80gr PaperOne.'
      },
      {
        'Nama Kolom Header': 'Satuan',
        'Tipe Data': 'Teks (String)',
        'Status Wajib': 'Wajib Diisi (Mandatory)',
        'Aturan & Format Contoh': 'Satuan terkecil barang. Contoh: PCS, Rim, Roll, Pack, Box, Unit, Kg, Meter.'
      },
      {
        'Nama Kolom Header': 'Min Stock',
        'Tipe Data': 'Angka (Integer)',
        'Status Wajib': 'Opsional (Default: 0)',
        'Aturan & Format Contoh': 'Batas persediaan minimum (Titik Reorder Point). Isi 0 jika tidak dibatasi.'
      },
      {
        'Nama Kolom Header': 'Max Stock',
        'Tipe Data': 'Angka (Integer)',
        'Status Wajib': 'Opsional (Default: 100)',
        'Aturan & Format Contoh': 'Batas kapasitas maksimal penyimpanan barang di gudang. Contoh: 50, 100, 500.'
      },
      {
        'Nama Kolom Header': 'Lead Time (Hari)',
        'Tipe Data': 'Angka (Integer)',
        'Status Wajib': 'Opsional (Default: 7)',
        'Aturan & Format Contoh': 'Estimasi waktu tunggu pengiriman dari supplier sejak pesanan dibuat s/d tiba.'
      },
      {
        'Nama Kolom Header': 'Keterangan',
        'Tipe Data': 'Teks (String)',
        'Status Wajib': 'Opsional',
        'Aturan & Format Contoh': 'Catatan tambahan seperti nama vendor, rak default, atau kegunaan barang.'
      }
    ];

    const ws1 = createStyledSheet(templateData);
    const ws2 = createStyledSheet(guideData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Template_Master_Item');
    XLSX.utils.book_append_sheet(wb, ws2, 'Panduan_Pengisian');
    XLSX.writeFile(wb, 'Template_Master_Item_IMS.xlsx');

  } else if (selectedImportModule.value === 'TRANSACTIONS') {
    const todayStr = new Date().toISOString().split('T')[0];
    const templateData = [
      {
        'Tipe (IN/OUT)': 'IN',
        'Tanggal (YYYY-MM-DD)': todayStr,
        'No Dokumen / Surat Jalan': 'PO-2026-0901',
        'Kode SKU': 'BRG-001',
        'Deskripsi Barang': 'Kertas HVS A4 80gr PaperOne',
        'Satuan': 'Rim',
        'Qty': 50,
        'Lokasi Rak': 'ZONE-STAGING',
        'Keterangan Transaksi': 'Barang masuk supplier PT PaperOne'
      },
      {
        'Tipe (IN/OUT)': 'IN',
        'Tanggal (YYYY-MM-DD)': todayStr,
        'No Dokumen / Surat Jalan': 'PO-2026-0901',
        'Kode SKU': 'BRG-002',
        'Deskripsi Barang': 'Spidol Whiteboard Hitam Snowman',
        'Satuan': 'Pcs',
        'Qty': 30,
        'Lokasi Rak': 'RAK-A1',
        'Keterangan Transaksi': 'Barang masuk supplier PT Snowman'
      },
      {
        'Tipe (IN/OUT)': 'OUT',
        'Tanggal (YYYY-MM-DD)': todayStr,
        'No Dokumen / Surat Jalan': 'DO-2026-0412',
        'Kode SKU': 'BRG-001',
        'Deskripsi Barang': 'Kertas HVS A4 80gr PaperOne',
        'Satuan': 'Rim',
        'Qty': 10,
        'Lokasi Rak': 'ZONE-STAGING',
        'Keterangan Transaksi': 'Distribusi ATK Divisi Keuangan'
      },
      {
        'Tipe (IN/OUT)': 'OUT',
        'Tanggal (YYYY-MM-DD)': todayStr,
        'No Dokumen / Surat Jalan': 'DO-2026-0415',
        'Kode SKU': 'BRG-003',
        'Deskripsi Barang': 'Kabel UTP Cat6 305 Meter',
        'Satuan': 'Roll',
        'Qty': 2,
        'Lokasi Rak': 'RAK-B1',
        'Keterangan Transaksi': 'Pengeluaran project IT Server Room'
      }
    ];

    const guideData = [
      {
        'Nama Kolom Header': 'Tipe (IN/OUT)',
        'Tipe Data': 'Pilihan (IN / OUT)',
        'Status Wajib': 'Wajib Diisi (Mandatory)',
        'Aturan & Format Contoh': 'Gunakan "IN" untuk Transfer Masuk (Penerimaan), atau "OUT" untuk Transfer Keluar (Pengeluaran).'
      },
      {
        'Nama Kolom Header': 'Tanggal (YYYY-MM-DD)',
        'Tipe Data': 'Format Tanggal Fleksibel',
        'Status Wajib': 'Wajib Diisi (Mandatory)',
        'Aturan & Format Contoh': 'Sangat fleksibel: Mendukung angka serial Excel (misal 45321), DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, maupun nama bulan teks (misal 07/10/2026 atau 07 Oktober 2026).'
      },
      {
        'Nama Kolom Header': 'No Dokumen / Surat Jalan',
        'Tipe Data': 'Teks (String)',
        'Status Wajib': 'Opsional (Sangat Disarankan)',
        'Aturan & Format Contoh': 'Nomor referensi eksternal seperti No PO, Surat Jalan, Delivery Order, atau Faktur.'
      },
      {
        'Nama Kolom Header': 'Kode SKU',
        'Tipe Data': 'Teks (String)',
        'Status Wajib': 'Opsional (Auto-Add Jika Kosong)',
        'Aturan & Format Contoh': 'Kode barang yang dimutasi. JIKA DIKOSONGKAN: Sistem otomatis membuat Kode SKU baru (Auto-SKU) dan mendaftarkannya ke Master Item!'
      },
      {
        'Nama Kolom Header': 'Deskripsi Barang',
        'Tipe Data': 'Teks (String)',
        'Status Wajib': 'Opsional',
        'Aturan & Format Contoh': 'Nama barang. Jika SKU sudah ada di Master, nama akan disinkronkan otomatis.'
      },
      {
        'Nama Kolom Header': 'Satuan',
        'Tipe Data': 'Teks (String)',
        'Status Wajib': 'Opsional (Default: PCS)',
        'Aturan & Format Contoh': 'Satuan kuantitas barang. Contoh: PCS, Rim, Roll, Pack, Box.'
      },
      {
        'Nama Kolom Header': 'Qty',
        'Tipe Data': 'Angka Positif (> 0)',
        'Status Wajib': 'Wajib Diisi (Mandatory)',
        'Aturan & Format Contoh': 'Jumlah fisik barang. Harus angka bilangan bulat/desimal lebih besar dari 0.'
      },
      {
        'Nama Kolom Header': 'Lokasi Rak',
        'Tipe Data': 'Kode Rak (String)',
        'Status Wajib': 'Opsional (Default: ZONE-STAGING)',
        'Aturan & Format Contoh': 'Kode area/rak penyimpanan. Jika belum terdaftar, otomatis dialihkan ke ZONE-STAGING.'
      },
      {
        'Nama Kolom Header': 'Keterangan Transaksi',
        'Tipe Data': 'Teks (String)',
        'Status Wajib': 'Opsional',
        'Aturan & Format Contoh': 'Catatan operasional transaksi, nama vendor, atau penerima barang.'
      }
    ];

    const ws1 = createStyledSheet(templateData);
    const ws2 = createStyledSheet(guideData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Template_Transfer_Order');
    XLSX.utils.book_append_sheet(wb, ws2, 'Panduan_Pengisian');
    XLSX.writeFile(wb, 'Template_Transfer_Order_IMS.xlsx');

  } else if (selectedImportModule.value === 'LOCATIONS') {
    const templateData = [
      {
        'Kode Lokasi': 'ZONE-STAGING',
        'Nama Lokasi': 'Area Transit & Receiving',
        'Tipe Lokasi': 'Transit / Staging',
        'Kapasitas Maksimal': 500,
        'Keterangan': 'Area penerimaan barang masuk sementara sebelum put-away'
      },
      {
        'Kode Lokasi': 'RAK-A1',
        'Nama Lokasi': 'Rak Fast Picking Lorong A1',
        'Tipe Lokasi': 'Fast Picking',
        'Kapasitas Maksimal': 200,
        'Keterangan': 'Dekat pintu keluar gudang (akses cepat)'
      },
      {
        'Kode Lokasi': 'RAK-A2',
        'Nama Lokasi': 'Rak Fast Picking Lorong A2',
        'Tipe Lokasi': 'Fast Picking',
        'Kapasitas Maksimal': 200,
        'Keterangan': 'Rak tingkat 1 & 2 barang kecil'
      },
      {
        'Kode Lokasi': 'RAK-B1',
        'Nama Lokasi': 'Rak Logistik Sedang B1',
        'Tipe Lokasi': 'Standard Storage',
        'Kapasitas Maksimal': 300,
        'Keterangan': 'Penyimpanan karton ukuran sedang'
      },
      {
        'Kode Lokasi': 'ZONE-C1',
        'Nama Lokasi': 'Pallet Bulk Storage Area C1',
        'Tipe Lokasi': 'Bulk Pallet',
        'Kapasitas Maksimal': 1000,
        'Keterangan': 'Area penyimpanan barang berat di atas pallet'
      }
    ];

    const guideData = [
      {
        'Nama Kolom Header': 'Kode Lokasi',
        'Tipe Data': 'Teks Unik (String)',
        'Status Wajib': 'Wajib Diisi (Mandatory)',
        'Aturan & Format Contoh': 'Kode penanda fisik rak atau area gudang. Contoh: ZONE-STAGING, RAK-A1, BIN-01.'
      },
      {
        'Nama Kolom Header': 'Nama Lokasi',
        'Tipe Data': 'Teks (String)',
        'Status Wajib': 'Wajib Diisi (Mandatory)',
        'Aturan & Format Contoh': 'Deskripsi nama area atau lorong gudang. Contoh: Rak Fast Picking Lorong A1.'
      },
      {
        'Nama Kolom Header': 'Tipe Lokasi',
        'Tipe Data': 'Pilihan (String)',
        'Status Wajib': 'Opsional (Default: Standard Storage)',
        'Aturan & Format Contoh': 'Kategori rak: Standard Storage, Fast Picking, Transit / Staging, Bulk Pallet.'
      },
      {
        'Nama Kolom Header': 'Kapasitas Maksimal',
        'Tipe Data': 'Angka Positif (> 0)',
        'Status Wajib': 'Opsional (Default: 200)',
        'Aturan & Format Contoh': 'Batas kapasitas maksimal fisik (unit barang) yang aman disimpan di rak ini.'
      },
      {
        'Nama Kolom Header': 'Keterangan',
        'Tipe Data': 'Teks (String)',
        'Status Wajib': 'Opsional',
        'Aturan & Format Contoh': 'Catatan peruntukan barang atau batas beban lantai.'
      }
    ];

    const ws1 = createStyledSheet(templateData);
    const ws2 = createStyledSheet(guideData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Template_Lokasi_Rak');
    XLSX.utils.book_append_sheet(wb, ws2, 'Panduan_Pengisian');
    XLSX.writeFile(wb, 'Template_Lokasi_Rak_IMS.xlsx');
  }
}

// =========================================================================
// 2. PARSING FILE EXCEL & SMART PRE-FLIGHT VALIDATION
// =========================================================================
function handleFileDrop(e) {
  isDragging.value = false;
  const file = e.dataTransfer.files[0];
  if (file) parseExcelFile(file);
}

function handleFileSelect(e) {
  const file = e.target.files[0];
  if (file) parseExcelFile(file);
}

async function parseExcelFile(file) {
  parsedFileName.value = file.name;
  const reader = new FileReader();

  reader.onload = async (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      // cellDates: true memungkinkan SheetJS mengonversi sel berformat tanggal Excel secara presisi
      const workbook = XLSX.read(data, { type: 'array', cellDates: true });
      const firstSheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[firstSheetName];
      const jsonRows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

      if (jsonRows.length === 0) {
        alert('File Excel kosong atau tidak memiliki baris data.');
        return;
      }

      await validateAndBuildPreview(jsonRows);
    } catch (err) {
      alert('Gagal membaca file Excel: ' + err.message);
    }
  };

  reader.readAsArrayBuffer(file);
}

async function validateAndBuildPreview(rawRows) {
  const existingItems = await db.items.toArray();
  const existingLocations = await db.locations.toArray();
  const existingItemCodes = new Set(existingItems.map(i => i.uniqCode));
  const existingLocCodes = new Set(existingLocations.map(l => l.code));

  const headers = Object.keys(rawRows[0]).filter(k => !k.startsWith('_'));
  const processedRows = [];
  let validCount = 0;
  let newItemsCount = 0;
  let matchedSkuCount = 0;
  let autoSkuCount = 0;
  let invalidCount = 0;
  let autoSkuCounter = 1;
  let firstAutoSku = '';

  for (const rawRow of rawRows) {
    const row = { ...rawRow };
    let status = 'VALID';
    let statusLabel = 'Siap Impor';
    let isAutoSku = false;
    let isMatchedSku = false;
    let matchedItem = null;
    let matchScore = 0;

    if (selectedImportModule.value === 'ITEMS') {
      let code = String(row['Kode SKU'] || row['Uniq Code'] || row['SKU'] || row['Item Code'] || row['Kode'] || '').trim();
      const name = String(row['Deskripsi Barang'] || row['Deskripsi'] || row['Nama Barang'] || row['Nama Item'] || row['Item'] || '').trim();

      // FITUR CERDAS: Jika Kode SKU kosong
      // 1. Cek apakah ada barang di katalog yang deskripsinya mirip / identik
      // 2. Jika ada: gunakan SKU barang tersebut agar tidak terduplikasi
      // 3. Jika tidak ada yang mirip: baru otomatis buat SKU baru unik
      if (!code) {
        if (name) {
          const matched = findSimilarItemByDescription(name, existingItems, 0.70);
          if (matched) {
            code = matched.item.uniqCode;
            row['Kode SKU'] = code;
            isMatchedSku = true;
            matchedItem = matched.item;
            matchScore = matched.percentage;
            status = 'MATCHED_SKU';
            statusLabel = `🔄 Pakai ${code}`;
            matchedSkuCount++;
            validCount++;
          } else {
            code = generateAutoSkuCode(name, existingItemCodes, autoSkuCounter++);
            existingItemCodes.add(code);
            row['Kode SKU'] = code;
            isAutoSku = true;
            status = 'AUTO_SKU';
            statusLabel = '⚡ Auto-SKU';
            autoSkuCount++;
            validCount++;
            if (!firstAutoSku) firstAutoSku = code;
          }
        } else {
          status = 'INVALID';
          statusLabel = 'Data Kosong';
          invalidCount++;
        }
      } else {
        if (existingItemCodes.has(code)) {
          statusLabel = 'Update / Ada';
          validCount++;
        } else {
          status = 'NEW_SKU';
          statusLabel = 'SKU Baru';
          newItemsCount++;
          validCount++;
        }
      }

    } else if (selectedImportModule.value === 'TRANSACTIONS') {
      let code = String(row['Kode SKU'] || row['Kode Item'] || row['SKU'] || row['Item Code'] || row['Kode'] || '').trim();
      const desc = String(row['Deskripsi Barang'] || row['Deskripsi'] || row['Nama Barang'] || row['Nama'] || '').trim();
      const qty = Number(row['Qty'] || row['Jumlah'] || row['Kuantitas'] || 0);

      // PARSER TANGGAL FLEKSIBEL: Serial number Excel (angka), DD/MM/YYYY, ISO, teks bulan
      const rawDate = row['Tanggal (YYYY-MM-DD)'] ?? row['Tanggal'] ?? row['Date'] ?? row['Tgl'] ?? row['Tgl Transaksi'] ?? row['Tanggal Transaksi'];
      const parsedDate = parseFlexibleDate(rawDate);
      
      // Standarisasi nilai tanggal dalam row
      if (row['Tanggal (YYYY-MM-DD)'] !== undefined) {
        row['Tanggal (YYYY-MM-DD)'] = parsedDate;
      } else if (row['Tanggal'] !== undefined) {
        row['Tanggal'] = parsedDate;
      }

      if (isNaN(qty) || qty <= 0) {
        status = 'INVALID';
        statusLabel = 'Qty Salah';
        invalidCount++;
      } else {
        // FITUR CERDAS: Jika Kode SKU kosong di transaksi
        // 1. Cek deskripsi yang mirip di master item
        // 2. Jika ada yang mirip, otomatis gunakan SKU yang sudah terdaftar
        // 3. Jika tidak ada yang mirip, buat SKU baru unik
        if (!code) {
          const matched = desc ? findSimilarItemByDescription(desc, existingItems, 0.70) : null;
          if (matched) {
            code = matched.item.uniqCode;
            if (row['Kode SKU'] !== undefined) row['Kode SKU'] = code;
            else if (row['Kode Item'] !== undefined) row['Kode Item'] = code;
            else row['Kode SKU'] = code;
            isMatchedSku = true;
            matchedItem = matched.item;
            matchScore = matched.percentage;
            status = 'MATCHED_SKU';
            statusLabel = `🔄 Pakai ${code}`;
            matchedSkuCount++;
            validCount++;
          } else {
            const itemDesc = desc || `Barang Transaksi ${processedRows.length + 1}`;
            code = generateAutoSkuCode(itemDesc, existingItemCodes, autoSkuCounter++);
            existingItemCodes.add(code);
            if (row['Kode SKU'] !== undefined) row['Kode SKU'] = code;
            else if (row['Kode Item'] !== undefined) row['Kode Item'] = code;
            else row['Kode SKU'] = code;
            isAutoSku = true;
            status = 'AUTO_SKU';
            statusLabel = '⚡ Auto-SKU';
            autoSkuCount++;
            validCount++;
            if (!firstAutoSku) firstAutoSku = code;
          }
        } else if (!existingItemCodes.has(code)) {
          status = 'NEW_SKU';
          statusLabel = 'SKU Baru';
          newItemsCount++;
          validCount++;
        } else {
          validCount++;
        }
      }

    } else if (selectedImportModule.value === 'LOCATIONS') {
      const code = String(row['Kode Lokasi'] || row['Code'] || '').trim();
      if (!code) {
        status = 'INVALID';
        statusLabel = 'Kode Kosong';
        invalidCount++;
      } else {
        validCount++;
      }
    }

    processedRows.push({
      ...row,
      _status: status,
      _statusLabel: statusLabel,
      _isAutoSku: isAutoSku,
      _isMatchedSku: isMatchedSku,
      _matchedItem: matchedItem,
      _matchScore: matchScore
    });
  }

  parsedPreviewData.value = {
    totalRows: rawRows.length,
    validCount,
    matchedSkuCount,
    newItemsCount,
    autoSkuCount,
    firstAutoSku,
    invalidCount,
    headers,
    rows: processedRows
  };
}

function cancelPreview() {
  parsedPreviewData.value = null;
  parsedFileName.value = '';
}

// =========================================================================
// 3. EKSEKUSI IMPOR DATA KE DALAM DATABASE INDEXEDDB
// =========================================================================
async function executeImport() {
  if (!parsedPreviewData.value) return;
  isImporting.value = true;

  try {
    const rows = parsedPreviewData.value.rows.filter(r => r._status !== 'INVALID');
    let importedCount = 0;
    let autoRegisteredCount = 0;
    let autoSkuGeneratedCount = 0;

    if (selectedImportModule.value === 'ITEMS') {
      const now = new Date().toISOString();
      for (const row of rows) {
        const code = String(row['Kode SKU'] || row['Uniq Code'] || row['SKU'] || '').trim();
        const desc = String(row['Deskripsi Barang'] || row['Deskripsi'] || row['Nama Barang'] || code).trim();
        const satuan = String(row['Satuan'] || 'Unit').trim();
        const minStock = Math.max(0, Number(row['Min Stock'] || row['Stok Minimum'] || 0));
        const maxStock = Math.max(minStock + 1, Number(row['Max Stock'] || row['Stok Maksimal'] || (minStock > 0 ? minStock * 3 : 100)));
        const leadTime = Math.max(1, Number(row['Lead Time (Hari)'] || row['Lead Time'] || 7));
        const keterangan = row._isAutoSku 
          ? 'Auto-SKU dibuat otomatis oleh sistem saat impor' 
          : String(row['Keterangan'] || 'Impor Excel').trim();

        const existing = await db.items.where('uniqCode').equals(code).first();
        if (existing) {
          if (importOptions.value.upsertMode) {
            await db.items.update(existing.id, {
              deskripsi: desc,
              satuan,
              minStock,
              maxStock,
              leadTime,
              keterangan,
              updatedAt: now
            });
            importedCount++;
          }
        } else {
          await db.items.add({
            uniqCode: code,
            deskripsi: desc,
            satuan,
            minStock,
            maxStock,
            leadTime,
            keterangan,
            allowZeroStock: false,
            createdAt: now,
            updatedAt: now
          });
          importedCount++;
          if (row._isAutoSku) autoSkuGeneratedCount++;
        }
      }

    } else if (selectedImportModule.value === 'TRANSACTIONS') {
      // Kelompokkan baris berdasarkan No Dokumen / Surat Jalan
      const groupedDocs = {};
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];

      for (const row of rows) {
        const type = String(row['Tipe (IN/OUT)'] || row['Tipe'] || 'IN').toUpperCase().includes('OUT') ? 'OUT' : 'IN';
        const docNo = String(row['No Dokumen / Surat Jalan'] || row['No Dokumen'] || `IMP-${Date.now()}`).trim();
        
        // Parsing fleksibel tanggal: Serial Excel (angka), DD/MM/YYYY, ISO, dll.
        const rawDate = row['Tanggal (YYYY-MM-DD)'] ?? row['Tanggal'] ?? row['Date'] ?? row['Tgl'] ?? row['Tgl Transaksi'] ?? todayStr;
        const date = parseFlexibleDate(rawDate);

        const code = String(row['Kode SKU'] || row['Kode Item'] || row['SKU'] || '').trim();
        const desc = String(row['Deskripsi Barang'] || row['Deskripsi'] || code).trim();
        const satuan = String(row['Satuan'] || 'Unit').trim();
        const qty = Number(row['Qty'] || row['Jumlah'] || 1);
        let locCode = String(row['Lokasi Rak'] || row['Lokasi'] || 'ZONE-STAGING').trim();

        // Validasi Lokasi Fallback
        if (importOptions.value.fallbackToStaging) {
          const locExists = await db.locations.where('code').equals(locCode).first();
          if (!locExists) locCode = 'ZONE-STAGING';
        }

        // Resolusi SKU Baru atau Auto-SKU
        if (importOptions.value.autoRegisterMaster || row._isAutoSku) {
          const itemExists = await db.items.where('uniqCode').equals(code).first();
          if (!itemExists) {
            await db.items.add({
              uniqCode: code,
              deskripsi: desc,
              satuan,
              minStock: 0,
              maxStock: Math.max(100, qty * 2),
              leadTime: 7,
              keterangan: row._isAutoSku ? 'Auto-SKU dibuat via Impor Transaksi' : 'Auto-register via Impor Transaksi',
              createdAt: now.toISOString(),
              updatedAt: now.toISOString()
            });
            autoRegisteredCount++;
            if (row._isAutoSku) autoSkuGeneratedCount++;
          }
        }

        const groupKey = `${type}_${docNo}_${date}`;
        if (!groupedDocs[groupKey]) {
          groupedDocs[groupKey] = {
            type,
            noDocument: docNo,
            tanggal: date,
            keterangan: String(row['Keterangan Transaksi'] || 'Impor Excel').trim(),
            items: []
          };
        }

        groupedDocs[groupKey].items.push({
          uniqCode: code,
          deskripsi: desc,
          satuan,
          qty,
          locationCode: locCode,
          keterangan: String(row['Keterangan Item'] || '').trim()
        });
      }

      // Simpan dokumen transaksi ke Dexie
      for (const groupKey in groupedDocs) {
        const docInfo = groupedDocs[groupKey];
        const docCount = await db.transactions.count();
        const seq = String(docCount + 1).padStart(4, '0');
        const trxCode = `TO-${docInfo.type}-${todayStr.replace(/-/g, '')}-${seq}`;
        const totalQty = docInfo.items.reduce((s, c) => s + c.qty, 0);

        const newDoc = {
          trxCode,
          type: docInfo.type,
          tanggal: docInfo.tanggal,
          noDocument: docInfo.noDocument,
          keterangan: docInfo.keterangan,
          status: 'APPROVED',
          items: docInfo.items,
          totalQty,
          createdAt: new Date().toISOString()
        };

        await db.transactions.add(newDoc);
        // Sinkronkan stok ke item_locations
        await applyTransactionStockToLocations(newDoc);
        importedCount += docInfo.items.length;
      }

    } else if (selectedImportModule.value === 'LOCATIONS') {
      const now = new Date().toISOString();
      for (const row of rows) {
        const code = String(row['Kode Lokasi'] || row['Code'] || '').trim();
        const name = String(row['Nama Lokasi'] || row['Name'] || code).trim();
        const type = String(row['Tipe Lokasi'] || row['Type'] || 'Standard Storage').trim();
        const maxCapacity = Math.max(10, Number(row['Kapasitas Maksimal'] || row['Capacity'] || 100));
        const keterangan = String(row['Keterangan'] || '').trim();

        const existing = await db.locations.where('code').equals(code).first();
        if (existing) {
          if (importOptions.value.upsertMode) {
            await db.locations.update(existing.id, { name, type, maxCapacity, keterangan });
            importedCount++;
          }
        } else {
          await db.locations.add({ code, name, type, maxCapacity, keterangan, createdAt: now });
          importedCount++;
        }
      }
    }

    emit('refresh-data');
    let msg = `Berhasil mengimpor ${importedCount} data ke dalam sistem!`;
    if (autoSkuGeneratedCount > 0) {
      msg += `\n⚡ ${autoSkuGeneratedCount} Kode SKU otomatis telah berhasil dibuat & didaftarkan.`;
    }
    if (autoRegisteredCount > 0 && selectedImportModule.value === 'TRANSACTIONS') {
      msg += `\n📦 ${autoRegisteredCount} Master Item baru telah didaftarkan otomatis.`;
    }
    alert(msg);
    cancelPreview();

  } catch (err) {
    alert('Terjadi kesalahan saat mengimpor: ' + err.message);
  } finally {
    isImporting.value = false;
  }
}

// =========================================================================
// 4. EKSPOR BUKU KERJA LENGKAP & KUSTOM FILTER
// =========================================================================
async function exportMasterWorkbook() {
  const stockMap = await calculateStockMap();
  const [items, transactions, locations, movements] = await Promise.all([
    db.items.toArray(),
    db.transactions.toArray(),
    db.locations.toArray(),
    db.movements.toArray()
  ]);

  const wb = XLSX.utils.book_new();

  // Sheet 1: Master Items & Stok
  const sheet1Data = items.map(it => {
    const stock = stockMap[it.uniqCode]?.balance || 0;
    const min = it.minStock || 0;
    const max = it.maxStock || 100;
    let statusLabel = '🟢 Optimal (Aman)';
    if (stock <= 0) statusLabel = '🔴 Kritis (Habis)';
    else if (stock <= min) statusLabel = '🟡 Reorder Point';
    else if (max > 0 && stock > max) statusLabel = '🟣 Overstock';

    return {
      'Kode SKU': it.uniqCode,
      'Deskripsi Barang': it.deskripsi,
      'Satuan': it.satuan,
      'Stok Fisik Saat Ini': stock,
      'Min Stock (ROP)': min,
      'Max Stock': max,
      'Lead Time (Hari)': it.leadTime || 7,
      'Status Level': statusLabel,
      'Catatan / Keterangan': it.keterangan || '-'
    };
  });
  XLSX.utils.book_append_sheet(wb, createStyledSheet(sheet1Data), '1_Master_Item_Stok');

  // Sheet 2: Header Dokumen Transaksi
  const sheet2Data = transactions.map(tx => ({
    'Kode Transfer Order': tx.trxCode,
    'Tipe Mutasi': tx.type === 'IN' ? '📥 Masuk (IN)' : '📤 Keluar (OUT)',
    'Tanggal Transaksi': tx.tanggal,
    'No Dokumen Referensi': tx.noDocument || '-',
    'Status Dokumen': tx.status === 'APPROVED' ? '✅ APPROVED' : '📝 DRAFT',
    'Jumlah Macam SKU': tx.items?.length || 0,
    'Total Kuantitas Fisik': tx.totalQty || 0,
    'Default Lokasi': tx.defaultLocation || 'ZONE-STAGING',
    'Keterangan Dokumen': tx.keterangan || '-'
  }));
  XLSX.utils.book_append_sheet(wb, createStyledSheet(sheet2Data), '2_Dokumen_Transaksi');

  // Sheet 3: Rincian Baris Transaksi
  const sheet3Data = [];
  transactions.forEach(tx => {
    if (Array.isArray(tx.items)) {
      tx.items.forEach((it, idx) => {
        sheet3Data.push({
          'Kode TO Induk': tx.trxCode,
          'Tanggal': tx.tanggal,
          'No Dokumen Ref': tx.noDocument || '-',
          'Tipe': tx.type === 'IN' ? '📥 IN' : '📤 OUT',
          'No Baris': idx + 1,
          'Kode SKU': it.uniqCode,
          'Deskripsi Barang': it.deskripsi,
          'Satuan': it.satuan,
          'Kuantitas': it.qty,
          'Alokasi Rak': it.locationCode || tx.defaultLocation || 'ZONE-STAGING',
          'Catatan Baris': it.keterangan || '-'
        });
      });
    }
  });
  XLSX.utils.book_append_sheet(wb, createStyledSheet(sheet3Data), '3_Rincian_Baris_Item');

  // Sheet 4: Rencana Pengadaan PPIC
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const outMap = {};
  transactions.filter(t => t.type === 'OUT' && t.tanggal >= ninetyDaysAgo).forEach(t => {
    if (Array.isArray(t.items)) {
      t.items.forEach(it => { outMap[it.uniqCode] = (outMap[it.uniqCode] || 0) + Number(it.qty); });
    }
  });

  const sheet4Data = items.map(it => {
    const totalOut = outMap[it.uniqCode] || 0;
    const adu = Number((totalOut / 90).toFixed(2));
    const stock = stockMap[it.uniqCode]?.balance || 0;
    const min = it.minStock || 0;
    const max = it.maxStock || (min > 0 ? min * 3 : 50);
    const suggestedOrder = stock <= min ? Math.max(0, max - stock) : 0;
    return {
      'Kode SKU': it.uniqCode,
      'Deskripsi Barang': it.deskripsi,
      'Stok Fisik': stock,
      'Pengeluaran 90 Hari': totalOut,
      'Konsumsi Harian (ADU)': adu,
      'Hari Persediaan (Days of Supply)': adu > 0 ? Math.round(stock / adu) : 999,
      'Min Stock (ROP)': min,
      'Max Stock': max,
      'Saran Order Qty': suggestedOrder,
      'Status Tindakan': suggestedOrder > 0 ? '⚠️ SEGERA ORDER' : '✅ STOK AMAN'
    };
  });
  XLSX.utils.book_append_sheet(wb, createStyledSheet(sheet4Data), '4_Rencana_PPIC');

  // Sheet 5: Denah Lokasi & Okupansi
  const itemLocs = await db.item_locations.toArray();
  const sheet5Data = locations.map(loc => {
    const locQty = itemLocs.filter(il => il.locationCode === loc.code).reduce((s, c) => s + (Number(c.qty) || 0), 0);
    const pct = loc.maxCapacity > 0 ? Math.min(100, Math.round((locQty / loc.maxCapacity) * 100)) : 0;
    let statusOkupansi = '🟢 Tersedia';
    if (pct >= 100) statusOkupansi = '🔴 Penuh (100%)';
    else if (pct >= 80) statusOkupansi = '🟡 Hampir Penuh';
    else if (locQty === 0) statusOkupansi = '⚪ Kosong';

    return {
      'Kode Lokasi / Rak': loc.code,
      'Nama Area': loc.name,
      'Tipe Penyimpanan': loc.type,
      'Kapasitas Maksimal': loc.maxCapacity,
      'Kuantitas Terisi': locQty,
      'Sisa Kapasitas': Math.max(0, loc.maxCapacity - locQty),
      'Persentase Terisi': `${pct}%`,
      'Status Okupansi': statusOkupansi
    };
  });
  XLSX.utils.book_append_sheet(wb, createStyledSheet(sheet5Data), '5_Okupansi_Rak');

  XLSX.writeFile(wb, `Buku_Kerja_Lengkap_IMS_${new Date().toISOString().split('T')[0]}.xlsx`);
}

async function exportFilteredTransactionsExcel() {
  let txList = await db.transactions.toArray();

  if (exportCustomFilter.value.type !== 'ALL') {
    txList = txList.filter(t => t.type === exportCustomFilter.value.type);
  }
  if (exportCustomFilter.value.startDate) {
    txList = txList.filter(t => t.tanggal >= exportCustomFilter.value.startDate);
  }
  if (exportCustomFilter.value.endDate) {
    txList = txList.filter(t => t.tanggal <= exportCustomFilter.value.endDate);
  }

  if (txList.length === 0) {
    alert('Tidak ada dokumen transaksi yang sesuai dengan filter yang dipilih.');
    return;
  }

  const wb = XLSX.utils.book_new();
  const docData = txList.map(tx => ({
    'Kode Transfer Order': tx.trxCode,
    'Tipe Mutasi': tx.type === 'IN' ? '📥 Masuk (IN)' : '📤 Keluar (OUT)',
    'Tanggal Transaksi': tx.tanggal,
    'No Dokumen Referensi': tx.noDocument || '-',
    'Status': tx.status === 'APPROVED' ? '✅ APPROVED' : '📝 DRAFT',
    'Macam SKU': tx.items?.length || 0,
    'Total Kuantitas Fisik': tx.totalQty || 0,
    'Default Area Rak': tx.defaultLocation || 'ZONE-STAGING',
    'Keterangan Dokumen': tx.keterangan || '-'
  }));

  const lineData = [];
  txList.forEach(tx => {
    if (Array.isArray(tx.items)) {
      tx.items.forEach((it, idx) => {
        lineData.push({
          'Kode TO Induk': tx.trxCode,
          'Tanggal': tx.tanggal,
          'No Dokumen Ref': tx.noDocument || '-',
          'Tipe': tx.type === 'IN' ? '📥 IN' : '📤 OUT',
          'No Baris': idx + 1,
          'Kode SKU': it.uniqCode,
          'Deskripsi Barang': it.deskripsi,
          'Satuan': it.satuan,
          'Kuantitas': it.qty,
          'Alokasi Rak': it.locationCode || tx.defaultLocation || 'ZONE-STAGING',
          'Keterangan Item': it.keterangan || '-'
        });
      });
    }
  });

  XLSX.utils.book_append_sheet(wb, createStyledSheet(docData), 'Dokumen_Transfer_Order');
  XLSX.utils.book_append_sheet(wb, createStyledSheet(lineData), 'Rincian_Baris_Barang');

  const filterName = exportCustomFilter.value.type !== 'ALL' ? exportCustomFilter.value.type : 'ALL';
  XLSX.writeFile(wb, `Laporan_Transaksi_${filterName}_${new Date().toISOString().split('T')[0]}.xlsx`);
}

// =========================================================================
// 5. CADANGAN JSON & RESET DATA DEMO
// =========================================================================
async function downloadBackupJson() {
  const [items, txs, locs, itemLocs, movs] = await Promise.all([
    db.items.toArray(),
    db.transactions.toArray(),
    db.locations.toArray(),
    db.item_locations.toArray(),
    db.movements.toArray()
  ]);

  const backupObject = {
    appName: 'IMS Client-Side Pro',
    version: '3.5',
    exportDate: new Date().toISOString(),
    data: {
      items,
      transactions: txs,
      locations: locs,
      item_locations: itemLocs,
      movements: movs
    }
  };

  const jsonStr = JSON.stringify(backupObject, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `IMS_Backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

async function handleRestoreFile(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (event) => {
    try {
      const parsed = JSON.parse(event.target.result);
      if (!parsed.data || !Array.isArray(parsed.data.items) || !Array.isArray(parsed.data.transactions)) {
        alert('Format file JSON tidak valid!');
        return;
      }

      if (confirm(`Pulihkan ${parsed.data.items.length} master item dan ${parsed.data.transactions.length} dokumen transaksi? Seluruh data saat ini akan ditimpa.`)) {
        await db.transaction('rw', db.items, db.transactions, db.locations, db.item_locations, db.movements, async () => {
          await db.items.clear();
          await db.transactions.clear();
          await db.locations.clear();
          await db.item_locations.clear();
          await db.movements.clear();

          await db.items.bulkAdd(parsed.data.items);
          await db.transactions.bulkAdd(parsed.data.transactions);

          if (Array.isArray(parsed.data.locations)) {
            await db.locations.bulkAdd(parsed.data.locations);
          }
          if (Array.isArray(parsed.data.item_locations)) {
            await db.item_locations.bulkAdd(parsed.data.item_locations);
          }
          if (Array.isArray(parsed.data.movements)) {
            await db.movements.bulkAdd(parsed.data.movements);
          }
        });

        alert('Data berhasil dipulihkan!');
        emit('refresh-data');
      }
    } catch (err) {
      alert('Gagal membaca file cadangan: ' + err.message);
    }
  };
  reader.readAsText(file);
}

async function resetToDemo() {
  if (confirm('Apakah Anda yakin ingin mengatur ulang data ke data demo bawaan? Data input Anda akan dihapus.')) {
    await db.items.clear();
    await db.transactions.clear();
    await db.locations.clear();
    await db.item_locations.clear();
    await db.movements.clear();
    if (db.form_drafts) await db.form_drafts.clear();
    await seedDemoDataIfEmpty(true);
    await seedLocationDataIfEmpty(true);
    emit('refresh-data');
    alert('Data berhasil diatur ulang ke sampel demo!');
  }
}
</script>
