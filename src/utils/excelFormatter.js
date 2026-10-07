import * as XLSX from 'xlsx';

/**
 * Utilitas Pemformatan Tabel Excel Profesional (IMS)
 * Mengatur lebar kolom dinamis (auto-fit width), pembekuan baris header (freeze pane),
 * filter tabel resmi Excel (!autofilter), tinggi baris, dan format angka/tanggal.
 */

/**
 * Menghitung panjang teks tampak (termasuk penanganan karakter non-ASCII dan angka)
 */
function getDisplayLength(val) {
  if (val === null || val === undefined) return 0;
  const str = String(val);
  // Karakter CJK atau emoji bisa memakan ruang lebih lebar di Excel
  let len = 0;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    // Tambah 2 untuk karakter double-byte / emoji
    len += code > 255 ? 1.5 : 1;
  }
  return Math.ceil(len);
}

/**
 * Memformat worksheet agar menjadi tabel rapi dengan fitur tabel Excel lengkap
 * @param {object} ws - Worksheet object dari XLSX
 * @param {Array<object>} rows - Array data baris
 * @param {object} options - Opsi tambahan (minColWidth, maxColWidth, padding)
 */
export function formatWorksheetTable(ws, rows = [], options = {}) {
  if (!ws || !ws['!ref']) return ws;

  const minColWidth = options.minColWidth || 14;
  const maxColWidth = options.maxColWidth || 55;
  const padding = options.padding !== undefined ? options.padding : 5;

  const range = XLSX.utils.decode_range(ws['!ref']);
  const numRows = range.e.r - range.s.r + 1;

  // 1. HITUNG LEBAR KOLOM DINAMIS (WIDTH AUTO-FIT BERDASARKAN TEKS TERPANJANG)
  const colWidths = [];

  for (let c = range.s.c; c <= range.e.c; c++) {
    let maxLen = minColWidth;

    for (let r = range.s.r; r <= range.e.r; r++) {
      const cellRef = XLSX.utils.encode_cell({ r, c });
      const cell = ws[cellRef];
      if (!cell || cell.v === undefined || cell.v === null) continue;

      const cellLen = getDisplayLength(cell.v);
      if (cellLen > maxLen) {
        maxLen = cellLen;
      }

      // Format Angka & Teks untuk Baris Data (r > 0)
      if (r > range.s.r) {
        if (typeof cell.v === 'number') {
          cell.t = 'n';
          // Jika nilai desimal atau bulat
          if (Number.isInteger(cell.v)) {
            cell.z = '#,##0';
          } else {
            cell.z = '#,##0.00';
          }
        } else if (typeof cell.v === 'string') {
          cell.t = 's';
          // Deteksi format tanggal ISO (YYYY-MM-DD)
          if (/^\d{4}-\d{2}-\d{2}$/.test(cell.v)) {
            cell.z = 'yyyy-mm-dd';
          }
        }
      }
    }

    // Terapkan batas minimum, maksimum, dan padding nyaman (+5 karakter)
    const finalWidth = Math.min(Math.max(maxLen + padding, minColWidth), maxColWidth);
    colWidths.push({ wch: finalWidth });
  }

  ws['!cols'] = colWidths;

  // 2. TINGGI BARIS (HEADER BESAR & DATA SPASIOUS NYAMAN DIBACA)
  const rowHeights = [{ hpt: 28, hpx: 36 }]; // Header baris 1
  for (let r = 1; r < numRows; r++) {
    rowHeights.push({ hpt: 20, hpx: 26 }); // Baris data
  }
  ws['!rows'] = rowHeights;

  // 3. FREEZE PANES (BARIS HEADER TETAP TERPANCANG SAAT SCROLL KE BAWAH)
  ws['!views'] = [
    {
      state: 'frozen',
      ySplit: 1,
      topLeftCell: 'A2',
      activeCell: 'A2'
    }
  ];

  // 4. AKTIFKAN TOMBOL FILTER TABEL RESMI EXCEL (!autofilter)
  ws['!autofilter'] = { ref: ws['!ref'] };

  return ws;
}

/**
 * Membuat worksheet terformat tabel siap pakai dari array data
 * @param {Array<object>} rows - Array data baris
 * @param {object} options - Opsi format
 */
export function createStyledSheet(rows, options = {}) {
  const ws = XLSX.utils.json_to_sheet(rows);
  return formatWorksheetTable(ws, rows, options);
}

/**
 * Mengekspor multi-sheet workbook dengan seluruh tabel otomatis rapi terformat
 * @param {Array<{ sheetName: string, data: Array<object> }>} sheetsConfig
 * @param {string} fileName
 */
export function exportStyledWorkbook(sheetsConfig, fileName) {
  const wb = XLSX.utils.book_new();

  sheetsConfig.forEach(({ sheetName, data, options }) => {
    if (Array.isArray(data) && data.length > 0) {
      const ws = createStyledSheet(data, options);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    } else {
      const ws = XLSX.utils.json_to_sheet([{}]);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    }
  });

  XLSX.writeFile(wb, fileName);
}

/**
 * Universal Date Parser yang Sangat Fleksibel
 * Mendukung:
 * 1. Serial Number Tanggal Excel (misal 45321)
 * 2. Format Indonesia / Eropa: DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
 * 3. Format ISO: YYYY-MM-DD, YYYY/MM/DD
 * 4. Nama Bulan Bahasa Indonesia / Inggris: 12 Oktober 2026, 12 Oct 2026
 * 5. JavaScript Date object (dari cellDates: true)
 * Output selalu konsisten: string 'YYYY-MM-DD'
 * @param {any} val - Nilai tanggal dari cell Excel
 * @returns {string} Tanggal dalam format standar 'YYYY-MM-DD'
 */
export function parseFlexibleDate(val) {
  if (val === null || val === undefined || val === '') {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  // 1. Jika sudah berupa objek Date JavaScript
  if (val instanceof Date && !isNaN(val.getTime())) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const d = String(val.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // 2. Jika berupa angka (Excel Serial Date atau Timestamp)
  const numVal = Number(val);
  if (!isNaN(numVal) && typeof val !== 'boolean') {
    // Serial number tanggal Excel umumnya berkisar antara 1000 (th 1902) dan 90000 (th 2146)
    if (numVal > 1000 && numVal < 90000) {
      // Epoch Excel dimulai 1899-12-30 karena bug tahun kabisat 1900
      const excelEpoch = new Date(Date.UTC(1899, 11, 30));
      const dateMs = excelEpoch.getTime() + Math.round(numVal * 86400000);
      const parsed = new Date(dateMs);
      if (!isNaN(parsed.getTime())) {
        const y = parsed.getUTCFullYear();
        const m = String(parsed.getUTCMonth() + 1).padStart(2, '0');
        const d = String(parsed.getUTCDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      }
    } else if (numVal > 1000000000000) {
      // Unix timestamp milidetik
      const parsed = new Date(numVal);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().split('T')[0];
      }
    }
  }

  // 3. Parsing String teks
  const str = String(val).trim();
  if (!str) {
    return new Date().toISOString().split('T')[0];
  }

  // ISO: YYYY-MM-DD atau YYYY/MM/DD atau YYYY.MM.DD
  const isoMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (isoMatch) {
    const y = isoMatch[1];
    const m = isoMatch[2].padStart(2, '0');
    const d = isoMatch[3].padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // Indonesia / Eropa: DD/MM/YYYY atau DD-MM-YYYY atau DD.MM.YYYY
  const dmYMatch = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (dmYMatch) {
    const d = dmYMatch[1].padStart(2, '0');
    const m = dmYMatch[2].padStart(2, '0');
    const y = dmYMatch[3];
    return `${y}-${m}-${d}`;
  }

  // Nama bulan Indonesia & Inggris (misal: "07 Oktober 2026", "15 Des 2025")
  const monthNames = {
    jan: '01', januari: '01', january: '01',
    feb: '02', februari: '02', february: '02',
    mar: '03', maret: '03', march: '03',
    apr: '04', april: '04',
    mei: '05', may: '05',
    jun: '06', juni: '06', june: '06',
    jul: '07', juli: '07', july: '07',
    agu: '08', agt: '08', agustus: '08', aug: '08', august: '08',
    sep: '09', september: '09',
    okt: '10', oktober: '10', oct: '10', october: '10',
    nop: '11', nov: '11', november: '11',
    des: '12', desember: '12', dec: '12', december: '12'
  };
  const namedMatch = str.match(/^(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})/);
  if (namedMatch) {
    const d = namedMatch[1].padStart(2, '0');
    const monthKey = namedMatch[2].toLowerCase().substring(0, 3);
    const m = monthNames[namedMatch[2].toLowerCase()] || monthNames[monthKey];
    const y = namedMatch[3];
    if (m) {
      return `${y}-${m}-${d}`;
    }
  }

  // Fallback: Date.parse native
  const nativeParse = new Date(str);
  if (!isNaN(nativeParse.getTime()) && nativeParse.getFullYear() > 1990) {
    const y = nativeParse.getFullYear();
    const m = String(nativeParse.getMonth() + 1).padStart(2, '0');
    const d = String(nativeParse.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return new Date().toISOString().split('T')[0];
}

/**
 * Generator Kode SKU Otomatis (Smart Auto-SKU Generator)
 * Membangun SKU unik yang bersih dan bermakna jika user tidak mengisi kolom SKU
 * Contoh: "Kertas HVS A4" -> "SKU-KHA-001"
 * @param {string} desc - Deskripsi atau nama barang
 * @param {Set<string>} existingCodes - Set berisi kode SKU yang sudah ada untuk mencegah duplikasi
 * @param {number} seq - Nomor urutan fallback
 * @returns {string} Kode SKU unik siap pakai
 */
export function generateAutoSkuCode(desc = '', existingCodes = new Set(), seq = 1) {
  const cleanDesc = String(desc || '').trim();
  let prefix = 'AUTO';

  if (cleanDesc) {
    const words = cleanDesc.replace(/[^a-zA-Z0-9\s]/g, '').trim().split(/\s+/).filter(w => w.length > 0);
    if (words.length >= 2) {
      prefix = words.slice(0, 3).map(w => w[0].toUpperCase()).join('');
    } else if (words.length === 1 && words[0].length >= 3) {
      prefix = words[0].substring(0, 4).toUpperCase();
    }
  }

  if (prefix.length < 2) prefix = 'GEN';

  let candidate = '';
  let counter = seq;
  do {
    const numPart = String(counter).padStart(3, '0');
    candidate = `SKU-${prefix}-${numPart}`;
    counter++;
  } while (existingCodes && existingCodes.has(candidate));

  return candidate;
}

export { 
  normalizeText, 
  calculateStringSimilarity, 
  findSimilarItemByDescription 
} from './similarity';
