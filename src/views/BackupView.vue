<template>
  <div class="space-y-5 pb-24 md:pb-6">
    <div class="glass-card p-4 sm:p-5">
      <h1 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Cadangan & Pemulihan Data (Backup & Restore)</h1>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Karena seluruh data disimpan di peramban lokal (IndexedDB), sangat disarankan untuk mengunduh cadangan secara berkala.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <!-- Card Backup JSON -->
      <div class="glass-card p-5 space-y-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <Download class="w-5 h-5" />
          </div>
          <div>
            <h2 class="font-bold text-sm text-slate-900 dark:text-white">Ekspor Cadangan Lengkap (JSON)</h2>
            <p class="text-xs text-slate-400">Unduh seluruh master item dan dokumen transaksi.</p>
          </div>
        </div>

        <p class="text-xs text-slate-600 dark:text-slate-300">
          File cadangan JSON berisi seluruh struktur basis data lokal. Anda dapat menggunakannya untuk memulihkan data jika berganti perangkat atau peramban.
        </p>

        <button 
          @click="downloadBackupJson"
          class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-xs shadow-md transition-all"
        >
          <Download class="w-4 h-4" />
          <span>Unduh File Cadangan (.json)</span>
        </button>
      </div>

      <!-- Card Restore JSON -->
      <div class="glass-card p-5 space-y-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
            <Upload class="w-5 h-5" />
          </div>
          <div>
            <h2 class="font-bold text-sm text-slate-900 dark:text-white">Pulihkan Data (Restore)</h2>
            <p class="text-xs text-slate-400">Unggah file .json yang pernah Anda cadangkan.</p>
          </div>
        </div>

        <p class="text-xs text-slate-600 dark:text-slate-300">
          Peringatan: Memulihkan cadangan akan menggantikan data barang dan transaksi yang ada saat ini di IndexedDB.
        </p>

        <label class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl font-semibold text-xs shadow-md cursor-pointer transition-all">
          <Upload class="w-4 h-4" />
          <span>Pilih File Cadangan (.json)</span>
          <input type="file" accept=".json" @change="handleRestoreFile" class="hidden" />
        </label>
      </div>

      <!-- Card Export Excel -->
      <div class="glass-card p-5 space-y-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-500/20">
            <FileSpreadsheet class="w-5 h-5" />
          </div>
          <div>
            <h2 class="font-bold text-sm text-slate-900 dark:text-white">Laporan Inventaris Excel (.xlsx)</h2>
            <p class="text-xs text-slate-400">Unduh lembar kerja Excel lengkap multi-sheet.</p>
          </div>
        </div>

        <p class="text-xs text-slate-600 dark:text-slate-300">
          Ekspor 3 lembar (*sheets*): Sheet 1 (Master Barang & Stok), Sheet 2 (Header Dokumen Transaksi), Sheet 3 (Detail Item Transaksi).
        </p>

        <button 
          @click="exportAllToExcel"
          class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-semibold text-xs shadow-md transition-all"
        >
          <FileSpreadsheet class="w-4 h-4" />
          <span>Unduh Buku Kerja Excel (.xlsx)</span>
        </button>
      </div>

      <!-- Reset / Kosongkan Data -->
      <div class="glass-card p-5 border-rose-200/50 dark:border-rose-900/40 space-y-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20">
            <RefreshCw class="w-5 h-5" />
          </div>
          <div>
            <h2 class="font-bold text-sm text-rose-900 dark:text-rose-300">Atur Ulang Data Demo</h2>
            <p class="text-xs text-rose-400">Kembalikan ke data contoh awal.</p>
          </div>
        </div>

        <p class="text-xs text-slate-600 dark:text-slate-300">
          Gunakan tombol ini jika Anda ingin menguji coba ulang aplikasi dengan data demo bawaan sistem.
        </p>

        <button 
          @click="resetToDemo"
          class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl font-semibold text-xs transition-all"
        >
          <RefreshCw class="w-4 h-4" />
          <span>Hapus & Muat Ulang Data Demo</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { db, seedDemoDataIfEmpty } from '../database/db';
import { Download, Upload, FileSpreadsheet, RefreshCw } from 'lucide-vue-next';
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

const emit = defineEmits(['refresh-data']);

async function downloadBackupJson() {
  const items = await db.items.toArray();
  const txs = await db.transactions.toArray();

  const backupObject = {
    appName: 'IMS Client-Side Pro',
    version: '2.0',
    exportDate: new Date().toISOString(),
    data: {
      items,
      transactions: txs
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
        await db.transaction('rw', db.items, db.transactions, async () => {
          await db.items.clear();
          await db.transactions.clear();
          await db.items.bulkAdd(parsed.data.items);
          await db.transactions.bulkAdd(parsed.data.transactions);
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

function exportAllToExcel() {
  const itemsData = props.itemsWithStock.map(item => ({
    'Uniq Code': item.uniqCode,
    'Deskripsi Barang': item.deskripsi,
    'Satuan': item.satuan,
    'Stok Minimum': item.minStock || 0,
    'Total Masuk': item.inQty || 0,
    'Total Keluar': item.outQty || 0,
    'Sisa Stok Fisik': item.currentStock || 0,
    'Keterangan': item.keterangan || ''
  }));

  const docData = props.transactions.map(tx => ({
    'Kode Trx': tx.trxCode,
    'Tipe': tx.type === 'IN' ? 'Inbound (Masuk)' : 'Outbound (Keluar)',
    'Tanggal': tx.tanggal,
    'No Dokumen': tx.noDocument || '',
    'Total Macam Item': tx.items?.length || 0,
    'Total Qty Unit': tx.totalQty || 0,
    'Keterangan Dokumen': tx.keterangan || ''
  }));

  const lineData = [];
  props.transactions.forEach(doc => {
    if (doc.items && Array.isArray(doc.items)) {
      doc.items.forEach(it => {
        lineData.push({
          'Kode Trx': doc.trxCode,
          'Tanggal': doc.tanggal,
          'No Dokumen': doc.noDocument || '',
          'Tipe': doc.type,
          'Kode Item': it.uniqCode,
          'Deskripsi': it.deskripsi,
          'Satuan': it.satuan,
          'Qty': it.qty,
          'Keterangan Item': it.keterangan || ''
        });
      });
    }
  });

  const wb = XLSX.utils.book_new();
  const wsItems = XLSX.utils.json_to_sheet(itemsData);
  const wsDocs = XLSX.utils.json_to_sheet(docData);
  const wsLines = XLSX.utils.json_to_sheet(lineData);

  XLSX.utils.book_append_sheet(wb, wsItems, 'Master Barang & Stok');
  XLSX.utils.book_append_sheet(wb, wsDocs, 'Daftar Dokumen Transaksi');
  XLSX.utils.book_append_sheet(wb, wsLines, 'Rincian Item Transaksi');

  XLSX.writeFile(wb, `Laporan_Gudang_IMS_${new Date().toISOString().split('T')[0]}.xlsx`);
}

async function resetToDemo() {
  if (confirm('Apakah Anda yakin ingin mengatur ulang data ke data demo bawaan? Data input Anda akan dihapus.')) {
    await db.items.clear();
    await db.transactions.clear();
    await seedDemoDataIfEmpty();
    emit('refresh-data');
    alert('Data berhasil diatur ulang ke sampel demo!');
  }
}
</script>
