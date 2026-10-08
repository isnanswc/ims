import Dexie from 'dexie';

export const db = new Dexie('InventoryManagementSystemDB');

// Skema IndexedDB (Header-Detail Transaction & Location Movement Architecture)
db.version(2).stores({
  items: '++id, &uniqCode, deskripsi, satuan, minStock, createdAt',
  transactions: '++id, &trxCode, type, tanggal, noDocument, createdAt'
});

db.version(3).stores({
  items: '++id, &uniqCode, deskripsi, satuan, minStock, createdAt',
  transactions: '++id, &trxCode, type, tanggal, noDocument, createdAt',
  locations: '++id, &code, name, type, maxCapacity, createdAt',
  item_locations: '++id, itemCode, locationCode, qty',
  movements: '++id, &docNo, tanggal, status, totalItems, totalQty, createdAt'
});

db.version(4).stores({
  items: '++id, &uniqCode, deskripsi, satuan, minStock, createdAt',
  transactions: '++id, &trxCode, type, tanggal, noDocument, createdAt',
  locations: '++id, &code, name, type, maxCapacity, createdAt',
  item_locations: '++id, itemCode, locationCode, qty',
  movements: '++id, &docNo, tanggal, status, totalItems, totalQty, createdAt',
  form_drafts: '&key, updatedAt'
});

// Helper: Generate Kode Unik Transaksi Otomatis
export async function generateAutoTrxCode(type) {
  const prefix = type === 'IN' ? 'INB' : 'OUT';
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  const countToday = await db.transactions
    .filter(tx => tx.type === type && tx.tanggal === now.toISOString().split('T')[0])
    .count();

  const seq = String(countToday + 1).padStart(4, '0');
  return `${prefix}-${dateStr}-${seq}`;
}

// 20 Master Items Bawaan Sistem
export const MASTER_20_ITEMS = [
  { uniqCode: 'BRG-001', deskripsi: 'Kertas HVS A4 80gr', satuan: 'Rim', minStock: 15, maxStock: 60, leadTime: 3, keterangan: 'ATK Kantor' },
  { uniqCode: 'BRG-002', deskripsi: 'Tinta Printer Epson Black 003', satuan: 'Botol', minStock: 8, maxStock: 35, leadTime: 5, keterangan: 'Gudang IT' },
  { uniqCode: 'BRG-003', deskripsi: 'Kabel UTP Cat6 305m', satuan: 'Roll', minStock: 3, maxStock: 12, leadTime: 7, keterangan: 'Jaringan & Server' },
  { uniqCode: 'BRG-004', deskripsi: 'Stop Kontak 4 Lubang 3M', satuan: 'Pcs', minStock: 10, maxStock: 40, leadTime: 4, keterangan: 'Peralatan Listrik' },
  { uniqCode: 'BRG-005', deskripsi: 'Lakban Bening 2 Inch 100 Yard', satuan: 'Roll', minStock: 25, maxStock: 100, leadTime: 3, keterangan: 'Pengemasan & Packing' },
  { uniqCode: 'BRG-006', deskripsi: 'Kardus Box Polos 30x20x15cm', satuan: 'Pcs', minStock: 50, maxStock: 200, leadTime: 5, keterangan: 'Kardus Kirim' },
  { uniqCode: 'BRG-007', deskripsi: 'Mouse USB Optik Logitech B100', satuan: 'Unit', minStock: 5, maxStock: 25, leadTime: 7, keterangan: 'Perangkat Keras IT' },
  { uniqCode: 'BRG-008', deskripsi: 'Harddisk Eksternal 1TB USB 3.0', satuan: 'Unit', minStock: 3, maxStock: 15, leadTime: 10, keterangan: 'Backup IT' },
  { uniqCode: 'BRG-009', deskripsi: 'Baterai Alkaline AA Pack isi 4', satuan: 'Pack', minStock: 12, maxStock: 50, leadTime: 4, keterangan: 'Kebutuhan Umum' },
  { uniqCode: 'BRG-010', deskripsi: 'Spidol Whiteboard Hitam Snowman', satuan: 'Lusin', minStock: 6, maxStock: 30, leadTime: 3, keterangan: 'ATK Meeting Room' },
  { uniqCode: 'BRG-011', deskripsi: 'Masker Medis 3 Ply isi 50', satuan: 'Box', minStock: 10, maxStock: 50, leadTime: 5, keterangan: 'Kesehatan & K3' },
  { uniqCode: 'BRG-012', deskripsi: 'Hand Sanitizer Gel 500ml', satuan: 'Botol', minStock: 8, maxStock: 40, leadTime: 5, keterangan: 'Kesehatan & K3' },
  { uniqCode: 'BRG-013', deskripsi: 'Kabel HDMI 2.0 Gold Plated 3M', satuan: 'Pcs', minStock: 5, maxStock: 25, leadTime: 7, keterangan: 'IT Perangkat Ruang Rapat' },
  { uniqCode: 'BRG-014', deskripsi: 'Lampu LED Phillips 12 Watt', satuan: 'Pcs', minStock: 15, maxStock: 60, leadTime: 4, keterangan: 'Maintenance Gedung' },
  { uniqCode: 'BRG-015', deskripsi: 'Obeng Set Presisi 32 in 1', satuan: 'Set', minStock: 4, maxStock: 20, leadTime: 7, keterangan: 'Peralatan Bengkel / IT' },
  { uniqCode: 'BRG-016', deskripsi: 'Sarung Tangan Kerja Safety Katun', satuan: 'Pasang', minStock: 30, maxStock: 120, leadTime: 4, keterangan: 'Gudang & Bongkar Muat' },
  { uniqCode: 'BRG-017', deskripsi: 'Steples Max HD-10 & Isi Box', satuan: 'Set', minStock: 10, maxStock: 40, leadTime: 3, keterangan: 'ATK Keuangan' },
  { uniqCode: 'BRG-018', deskripsi: 'Plastik Bubble Wrap Tebal 50m', satuan: 'Roll', minStock: 4, maxStock: 16, leadTime: 4, keterangan: 'Material Proteksi Packing' },
  { uniqCode: 'BRG-019', deskripsi: 'Timbangan Digital Ekspedisi 30kg', satuan: 'Unit', minStock: 2, maxStock: 8, leadTime: 14, keterangan: 'Logistik Kirim' },
  { uniqCode: 'BRG-020', deskripsi: 'Flashdisk Sandisk 32GB USB 3.0', satuan: 'Unit', minStock: 10, maxStock: 40, leadTime: 7, keterangan: 'Distribusi Data Lapangan' }
];

// Helper: Seed 20 items & 50 transaksi dalam 3 bulan terakhir
export async function seedDemoDataIfEmpty(force = false) {
  const itemCount = await db.items.count();
  if (itemCount === 0 || force) {
    if (force) {
      await db.items.clear();
      await db.transactions.clear();
    }

    const todayDate = new Date();
    // 3 bulan yang lalu: mundur 90 hari
    const ninetyDaysAgo = new Date(todayDate.getTime() - 90 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgoStr = ninetyDaysAgo.toISOString().split('T')[0];

    // 1. Tambahkan 20 Master Items dengan tgl dibuat 90 hari lalu
    const itemsToInsert = MASTER_20_ITEMS.map(it => ({
      ...it,
      createdAt: `${ninetyDaysAgoStr}T08:00:00.000Z`
    }));
    await db.items.bulkAdd(itemsToInsert);

    // 2. Generate 50 Dokumen Transfer Order realistis dalam 90 hari terakhir
    const transactionsToInsert = [];
    const stockTracker = {};
    itemsToInsert.forEach(it => { stockTracker[it.uniqCode] = 0; });

    // Daftar tanggal acak terurut dari 90 hari lalu hingga hari ini
    const generatedDates = [];
    for (let i = 0; i < 50; i++) {
      const dayOffset = Math.floor((i / 50) * 88); // merata 0-88 hari
      const d = new Date(ninetyDaysAgo.getTime() + dayOffset * 24 * 60 * 60 * 1000);
      generatedDates.push(d.toISOString().split('T')[0]);
    }

    for (let i = 0; i < 50; i++) {
      const docDate = generatedDates[i];
      // 10 transaksi pertama utamakan IN (Penerimaan stok awal)
      const isIN = (i < 10) ? true : (Math.random() < 0.55);
      const type = isIN ? 'IN' : 'OUT';
      const seq = String(i + 1).padStart(4, '0');
      const dateCompact = docDate.replace(/-/g, '');
      const trxCode = `${type === 'IN' ? 'INB' : 'OUT'}-${dateCompact}-${seq}`;
      const noDoc = `${type === 'IN' ? 'PO' : 'SJ'}-2026-${seq}`;

      // Ambil 1 sampai 3 macam item acak
      const numLines = Math.floor(Math.random() * 3) + 1;
      const selectedItemIndexes = new Set();
      while (selectedItemIndexes.size < numLines) {
        selectedItemIndexes.add(Math.floor(Math.random() * itemsToInsert.length));
      }

      const docItems = [];
      let totalQty = 0;

      for (const idx of selectedItemIndexes) {
        const itemObj = itemsToInsert[idx];
        const currentAvail = stockTracker[itemObj.uniqCode] || 0;

        let qty = 0;
        if (type === 'IN') {
          // Masuk antara 10 - 60 unit
          qty = Math.floor(Math.random() * 50) + 10;
          stockTracker[itemObj.uniqCode] += qty;
        } else {
          // Keluar tidak boleh melebihi stok yang ada
          if (currentAvail > 0) {
            qty = Math.min(currentAvail, Math.floor(Math.random() * Math.min(currentAvail, 20)) + 1);
            stockTracker[itemObj.uniqCode] -= qty;
          } else {
            // Jika stok 0, lewati untuk OUT
            continue;
          }
        }

        if (qty > 0) {
          totalQty += qty;
          docItems.push({
            uniqCode: itemObj.uniqCode,
            deskripsi: itemObj.deskripsi,
            satuan: itemObj.satuan,
            qty: qty,
            keterangan: type === 'IN' ? 'Pengadaan berkala' : 'Distribusi pemakaian operasional'
          });
        }
      }

      // Jika ada item valid, simpan dokumen
      if (docItems.length > 0) {
        transactionsToInsert.push({
          trxCode,
          type,
          tanggal: docDate,
          noDocument: noDoc,
          keterangan: type === 'IN' ? `Pengadaan Barang Masuk Ke Gudang (${docItems.length} SKU)` : `Pengiriman / Surat Jalan Keluar (${docItems.length} SKU)`,
          totalItems: docItems.length,
          totalQty: totalQty,
          items: docItems,
          createdAt: `${docDate}T10:00:00.000Z`
        });
      }
    }

    await db.transactions.bulkAdd(transactionsToInsert);
  }
}

// Helper: Menghitung total akumulasi stok per barang (dengan dukungan memoized preloaded transactions)
export async function calculateStockMap(excludeDocId = null, preloadedTransactions = null) {
  const transactions = preloadedTransactions || await db.transactions.toArray();
  const stockMap = {};

  for (let d = 0; d < transactions.length; d++) {
    const doc = transactions[d];
    if (doc.status === 'DRAFT') continue;
    if (excludeDocId && doc.id === excludeDocId) continue;
    if (!doc.items || !Array.isArray(doc.items)) continue;

    const isDocIn = doc.type === 'IN';
    const isDocOut = doc.type === 'OUT';
    const lines = doc.items;

    for (let l = 0; l < lines.length; l++) {
      const line = lines[l];
      const code = line.uniqCode;
      if (!stockMap[code]) {
        stockMap[code] = { inQty: 0, outQty: 0, balance: 0 };
      }
      const qty = Number(line.qty) || 0;
      if (isDocIn) {
        stockMap[code].inQty += qty;
        stockMap[code].balance += qty;
      } else if (isDocOut) {
        stockMap[code].outQty += qty;
        stockMap[code].balance -= qty;
      }
    }
  }

  return stockMap;
}

// Helper: Mengambil master item lengkap beserta stok saat ini dan status PPIC (Optimized parallel & memoized)
export async function getItemsWithCurrentStock(excludeDocId = null, preloadedTransactions = null) {
  const [items, stockMap] = await Promise.all([
    db.items.toArray(),
    calculateStockMap(excludeDocId, preloadedTransactions)
  ]);

  return items.map(item => {
    const stockInfo = stockMap[item.uniqCode] || { inQty: 0, outQty: 0, balance: 0 };
    const stock = stockInfo.balance;
    const min = Number(item.minStock) || 0;
    const max = Number(item.maxStock) || (min > 0 ? min * 3 : 50);
    const leadTime = Number(item.leadTime) || 7;

    // Klasifikasi 4 Level Status PPIC Persediaan:
    // 1. CRITICAL: stock <= Math.ceil(min * 0.35) atau stock === 0
    // 2. REORDER: stock <= min
    // 3. OPTIMAL: stock > min && stock <= max
    // 4. OVERSTOCK: stock > max
    let stockLevel = 'OPTIMAL';
    let stockLevelLabel = 'Optimal';
    let stockLevelColor = 'emerald';

    if (stock <= 0 || stock <= Math.ceil(min * 0.35)) {
      stockLevel = 'CRITICAL';
      stockLevelLabel = 'Kritis';
      stockLevelColor = 'rose';
    } else if (stock <= min) {
      stockLevel = 'REORDER';
      stockLevelLabel = 'Reorder';
      stockLevelColor = 'amber';
    } else if (stock > max) {
      stockLevel = 'OVERSTOCK';
      stockLevelLabel = 'Overstock';
      stockLevelColor = 'purple';
    } else {
      stockLevel = 'OPTIMAL';
      stockLevelLabel = 'Optimal';
      stockLevelColor = 'emerald';
    }

    const stockPercent = max > 0 ? Math.min(100, Math.round((stock / max) * 100)) : 0;
    const isAllowZero = Boolean(item.allowZeroStock || item.ignoreLowStockAlert || item.status === 'DISCONTINUED' || item.status === 'NON-AKTIF');
    const isLowStock = !isAllowZero && (min > 0 ? stock <= min : false);

    return {
      ...item,
      minStock: min,
      maxStock: max,
      leadTime: leadTime,
      inQty: stockInfo.inQty,
      outQty: stockInfo.outQty,
      currentStock: stock,
      allowZeroStock: isAllowZero,
      isLowStock,
      stockLevel,
      stockLevelLabel,
      stockLevelColor,
      stockPercent
    };
  });
}

// Helper: Toggle Abaikan Peringatan Stok Kosong / Disengaja Kosong
export async function toggleItemAllowZeroStock(uniqCode, allowZero = true) {
  const item = await db.items.where('uniqCode').equals(uniqCode).first();
  if (item) {
    await db.items.update(item.id, {
      allowZeroStock: allowZero,
      ignoreLowStockAlert: allowZero,
      updatedAt: new Date().toISOString()
    });
  }
}

// Helper: Kalkulator PPIC Cerdas Berbasis Data Riwayat Outbound
export async function calculateItemPPICMetrics(uniqCode, customLeadTime = null, customReviewPeriod = null) {
  const item = await db.items.where('uniqCode').equals(uniqCode).first();
  const transactions = await db.transactions.toArray();
  const stockMap = await calculateStockMap();
  const currentStock = stockMap[uniqCode]?.balance || 0;

  // Analisis 90 hari terakhir transaksi OUT
  const now = new Date();
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgoStr = ninetyDaysAgo.toISOString().split('T')[0];

  let totalOutQty = 0;
  let outTransactionCount = 0;
  const dailyOutMap = {};

  for (const doc of transactions) {
    if (doc.status === 'DRAFT') continue;
    if (doc.type === 'OUT' && doc.tanggal >= ninetyDaysAgoStr && Array.isArray(doc.items)) {
      for (const line of doc.items) {
        if (line.uniqCode === uniqCode) {
          const qty = Number(line.qty) || 0;
          totalOutQty += qty;
          outTransactionCount++;
          dailyOutMap[doc.tanggal] = (dailyOutMap[doc.tanggal] || 0) + qty;
        }
      }
    }
  }

  const daysTracked = 90;
  const rawAdu = totalOutQty / daysTracked;
  const adu = Number(rawAdu.toFixed(2)); // Average Daily Usage

  const dailyOutValues = Object.values(dailyOutMap);
  const mdu = dailyOutValues.length > 0 ? Math.max(...dailyOutValues) : Math.ceil(Math.max(1, adu * 1.5));

  const leadTime = Number(customLeadTime) > 0 ? Number(customLeadTime) : (Number(item?.leadTime) || 7);
  const reviewPeriod = Number(customReviewPeriod) > 0 ? Number(customReviewPeriod) : 14;

  // Rumus PPIC:
  // Safety Stock = (MDU * LT) - (ADU * LT)
  let rawSafetyStock = Math.ceil((mdu * leadTime) - (adu * leadTime));
  if (rawSafetyStock <= 0) {
    rawSafetyStock = Math.max(2, Math.ceil(adu * leadTime * 0.5));
  }
  const safetyStock = rawSafetyStock;

  // Reorder Point (ROP / Rekomendasi Min Stock) = (ADU * LT) + Safety Stock
  const recommendedRop = Math.max(safetyStock + 1, Math.ceil((adu * leadTime) + safetyStock));

  // Rekomendasi Stok Maksimal = ROP + (ADU * Siklus Review Period)
  const cycleStock = Math.max(5, Math.ceil(adu * reviewPeriod));
  const recommendedMaxStock = recommendedRop + cycleStock;

  // Saran Order Quantity = Max Stock - Stok Saat Ini (jika butuh dipesan)
  const suggestedOrderQty = Math.max(0, recommendedMaxStock - currentStock);

  return {
    uniqCode,
    deskripsi: item?.deskripsi || '',
    satuan: item?.satuan || '',
    currentStock,
    currentMinStock: Number(item?.minStock) || 0,
    currentMaxStock: Number(item?.maxStock) || recommendedMaxStock,
    currentLeadTime: Number(item?.leadTime) || leadTime,
    daysTracked,
    totalOutQty,
    outTransactionCount,
    adu,
    mdu,
    leadTime,
    reviewPeriod,
    safetyStock,
    recommendedRop,
    recommendedMaxStock,
    suggestedOrderQty
  };
}

// Helper: Menghitung buku besar / kartu stok (Ledger) per item
export async function getItemLedgerHistory(uniqCode, startDate = null, endDate = null) {
  const item = await db.items.where('uniqCode').equals(uniqCode).first();
  const transactions = await db.transactions.toArray();
  const lineEntries = [];

  // Baris Awal: Registrasi Item Baru dengan Qty 0
  const itemCreatedDate = item?.createdAt ? item.createdAt.split('T')[0] : '2026-07-01';
  lineEntries.push({
    docId: 0,
    trxCode: 'REG-ITEM',
    type: 'REG',
    tanggal: itemCreatedDate,
    noDocument: 'MASTER-AWAL',
    uniqCode: uniqCode,
    deskripsi: item?.deskripsi || '',
    satuan: item?.satuan || '',
    lineKeterangan: 'Registrasi Master Item Baru (Stok Awal)',
    docKeterangan: 'Master Item Baru',
    inQty: 0,
    outQty: 0,
    createdAt: item?.createdAt || new Date().toISOString()
  });

  // Mutasi Dokumen
  for (const doc of transactions) {
    if (doc.status === 'DRAFT') continue;
    if (!doc.items || !Array.isArray(doc.items)) continue;

    for (const line of doc.items) {
      if (line.uniqCode === uniqCode) {
        const qty = Number(line.qty) || 0;
        lineEntries.push({
          docId: doc.id,
          trxCode: doc.trxCode,
          type: doc.type,
          tanggal: doc.tanggal,
          noDocument: doc.noDocument || '',
          uniqCode: line.uniqCode,
          deskripsi: line.deskripsi,
          satuan: line.satuan,
          lineKeterangan: line.keterangan || '',
          docKeterangan: doc.keterangan || '',
          inQty: doc.type === 'IN' ? qty : 0,
          outQty: doc.type === 'OUT' ? qty : 0,
          createdAt: doc.createdAt
        });
      }
    }
  }

  // Sort kronologis (tanggal asc, docId asc)
  lineEntries.sort((a, b) => {
    const dateCmp = a.tanggal.localeCompare(b.tanggal);
    if (dateCmp !== 0) return dateCmp;
    return (a.docId || 0) - (b.docId || 0);
  });

  // Hitung saldo berjalan (Running Balance)
  let runningBalance = 0;
  const ledgerEntries = lineEntries.map(entry => {
    runningBalance = runningBalance + entry.inQty - entry.outQty;
    return {
      ...entry,
      balance: runningBalance
    };
  });

  // Filter tanggal dengan penyertaan Saldo Awal (Opening Balance) yang akurat
  if (!startDate && !endDate) {
    return ledgerEntries;
  }

  // Hitung Saldo Awal sebelum startDate
  let openingBalance = 0;
  if (startDate) {
    const priorEntries = ledgerEntries.filter(entry => entry.tanggal < startDate);
    if (priorEntries.length > 0) {
      openingBalance = priorEntries[priorEntries.length - 1].balance;
    }
  }

  const inRangeEntries = ledgerEntries.filter(entry => {
    if (startDate && entry.tanggal < startDate) return false;
    if (endDate && entry.tanggal > endDate) return false;
    return true;
  });

  // Jika ada startDate dan baris pertama bukan registrasi di tanggal startDate persis,
  // sertakan baris Saldo Awal Periode agar kartu stok dan diagram tidak putus/nol.
  if (startDate) {
    const openingEntry = {
      docId: 0,
      trxCode: 'SALDO-AWAL',
      type: 'REG',
      tanggal: startDate,
      noDocument: 'SALDO-AWAL',
      uniqCode: uniqCode,
      deskripsi: item?.deskripsi || '',
      satuan: item?.satuan || '',
      lineKeterangan: `Saldo Awal Periode per ${startDate}`,
      docKeterangan: 'Saldo Awal Periode',
      inQty: 0,
      outQty: 0,
      balance: openingBalance,
      createdAt: `${startDate}T00:00:00.000Z`
    };

    // Jika di dalam range tidak ada transaksi sama sekali, tambahkan titik penutup di endDate
    if (inRangeEntries.length === 0) {
      const closingDate = endDate || new Date().toISOString().split('T')[0];
      const closingEntry = {
        docId: 99999999,
        trxCode: 'SALDO-AKHIR',
        type: 'REG',
        tanggal: closingDate,
        noDocument: 'SALDO-BERJALAN',
        uniqCode: uniqCode,
        deskripsi: item?.deskripsi || '',
        satuan: item?.satuan || '',
        lineKeterangan: `Saldo Berjalan Stabil per ${closingDate}`,
        docKeterangan: 'Saldo Berjalan',
        inQty: 0,
        outQty: 0,
        balance: openingBalance,
        createdAt: `${closingDate}T23:59:59.000Z`
      };
      return [openingEntry, closingEntry];
    }

    // Sisipkan Saldo Awal di posisi paling depan jika tanggal transaksi pertama > startDate
    if (inRangeEntries[0].tanggal > startDate || inRangeEntries[0].trxCode !== 'REG-ITEM') {
      return [openingEntry, ...inRangeEntries];
    }
  }

  return inRangeEntries;
}

// =========================================================================
// FITUR MODUL LOKASI & MUTASI INTERNAL (INTERNAL MOVEMENT)
// =========================================================================

export const DEFAULT_LOCATIONS = [
  { code: 'RAK-A1', name: 'Rak Fast Picking A1', type: 'Fast Picking', maxCapacity: 200, keterangan: 'Dekat pintu keluar distribusi' },
  { code: 'RAK-A2', name: 'Rak Fast Picking A2', type: 'Fast Picking', maxCapacity: 250, keterangan: 'Rak lorong utama sisi timur' },
  { code: 'RAK-B1', name: 'Rak Logistik B1', type: 'Standard Storage', maxCapacity: 300, keterangan: 'Rak tingkat 1 & 2 tengah' },
  { code: 'RAK-B2', name: 'Rak Logistik B2', type: 'Standard Storage', maxCapacity: 300, keterangan: 'Rak tingkat 3 & 4 tengah' },
  { code: 'ZONE-C1', name: 'Pallet Bulk Storage C1', type: 'Bulk Pallet', maxCapacity: 500, keterangan: 'Area muatan karton besar' },
  { code: 'ZONE-STAGING', name: 'Area Transit & Receiving', type: 'Transit / Staging', maxCapacity: 150, keterangan: 'Area penyangga barang masuk' }
];

let isLocationSeeded = false;

export async function seedLocationDataIfEmpty(force = false) {
  if (isLocationSeeded && !force) return;

  const locCount = await db.locations.count();
  if (locCount === 0 || force) {
    if (force) {
      await db.locations.clear();
      await db.item_locations.clear();
      await db.movements.clear();
    }
    const now = new Date().toISOString();
    const locsToInsert = DEFAULT_LOCATIONS.map(l => ({ ...l, createdAt: now }));
    await db.locations.bulkAdd(locsToInsert);
  }

  // Cek apakah item_locations masih kosong
  const itemLocCount = await db.item_locations.count();
  if (itemLocCount === 0 || force) {
    const [items, stockMap] = await Promise.all([
      db.items.toArray(),
      calculateStockMap()
    ]);
    const allocations = [];

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const stock = Math.max(0, (stockMap[it.uniqCode]?.balance) || 0);
      if (stock === 0) continue;

      if (stock <= 10) {
        const loc = i % 2 === 0 ? 'RAK-A1' : 'RAK-A2';
        allocations.push({ itemCode: it.uniqCode, locationCode: loc, qty: stock });
      } else {
        const loc1 = i % 2 === 0 ? 'RAK-A1' : 'RAK-B1';
        const loc2 = i % 2 === 0 ? 'RAK-B2' : 'ZONE-C1';
        const qty1 = Math.ceil(stock * 0.65);
        const qty2 = stock - qty1;

        allocations.push({ itemCode: it.uniqCode, locationCode: loc1, qty: qty1 });
        if (qty2 > 0) {
          allocations.push({ itemCode: it.uniqCode, locationCode: loc2, qty: qty2 });
        }
      }
    }

    if (allocations.length > 0) {
      await db.item_locations.bulkAdd(allocations);
    }

    const movCount = await db.movements.count();
    if (movCount === 0 || force) {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      await db.movements.bulkAdd([
        {
          docNo: 'MOV-20261005-0001',
          tanggal: yesterday,
          operator: 'Budi Santoso (Admin Gudang)',
          keterangan: 'Relokasi stok pengisian rak picking depan',
          status: 'APPROVED',
          isLocked: true,
          totalItems: 2,
          totalQty: 15,
          createdAt: `${yesterday}T09:30:00.000Z`,
          approvedAt: `${yesterday}T10:15:00.000Z`,
          items: [
            {
              uniqCode: 'BRG-001',
              deskripsi: 'Kertas HVS A4 80gr',
              satuan: 'Rim',
              fromLocation: 'ZONE-C1',
              toLocation: 'RAK-A1',
              qty: 10,
              keterangan: 'Refill rak utama'
            },
            {
              uniqCode: 'BRG-005',
              deskripsi: 'Lakban Bening 2 Inch 100 Yard',
              satuan: 'Roll',
              fromLocation: 'RAK-B2',
              toLocation: 'RAK-A2',
              qty: 5,
              keterangan: 'Kebutuhan packing'
            }
          ]
        },
        {
          docNo: 'MOV-20261006-0001',
          tanggal: today,
          operator: 'Ahmad Fauzi (Operator)',
          keterangan: 'Draft rencana penataan ulang kapasitas rak B',
          status: 'DRAFT',
          isLocked: false,
          totalItems: 1,
          totalQty: 4,
          createdAt: `${today}T08:00:00.000Z`,
          items: [
            {
              uniqCode: 'BRG-002',
              deskripsi: 'Tinta Printer Epson Black 003',
              satuan: 'Botol',
              fromLocation: 'RAK-B1',
              toLocation: 'RAK-A1',
              qty: 4,
              keterangan: 'Pindah ke picking area'
            }
          ]
        }
      ]);
    }
  }

  isLocationSeeded = true;
}

export async function syncItemLocationsWithCurrentStock() {
  await seedLocationDataIfEmpty();
  const [items, allItemLocs] = await Promise.all([
    getItemsWithCurrentStock(),
    db.item_locations.toArray()
  ]);

  await db.transaction('rw', db.item_locations, async () => {
    for (const item of items) {
      const totalBalance = Math.max(0, Number(item.currentStock) || 0);
      const itemRecords = allItemLocs.filter(il => il.itemCode === item.uniqCode);
      const allocated = itemRecords.reduce((sum, curr) => sum + (Number(curr.qty) || 0), 0);

      const diff = totalBalance - allocated;
      if (diff > 0) {
        const defaultTarget = 'ZONE-STAGING';
        const existing = itemRecords.find(il => il.locationCode === defaultTarget);
        if (existing) {
          await db.item_locations.update(existing.id, { qty: existing.qty + diff });
        } else {
          await db.item_locations.add({
            itemCode: item.uniqCode,
            locationCode: defaultTarget,
            qty: diff
          });
        }
      } else if (diff < 0) {
        let needToDeduct = Math.abs(diff);
        for (const rec of itemRecords) {
          if (needToDeduct <= 0) break;
          if (rec.qty <= needToDeduct) {
            needToDeduct -= rec.qty;
            await db.item_locations.delete(rec.id);
          } else {
            await db.item_locations.update(rec.id, { qty: rec.qty - needToDeduct });
            needToDeduct = 0;
          }
        }
      }
    }
  });
}

export async function generateAutoMovementDocNo() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateCompact = `${year}${month}${day}`;

  const countToday = await db.movements
    .filter(m => m.tanggal === now.toISOString().split('T')[0])
    .count();

  const seq = String(countToday + 1).padStart(4, '0');
  return `MOV-${dateCompact}-${seq}`;
}

export async function getLocationDetailsWithOccupancy() {
  const [locations, itemLocs, items] = await Promise.all([
    db.locations.toArray(),
    db.item_locations.toArray(),
    db.items.toArray()
  ]);

  const itemMap = {};
  items.forEach(it => { itemMap[it.uniqCode] = it; });

  return locations.map(loc => {
    const locItems = itemLocs
      .filter(il => il.locationCode === loc.code && il.qty > 0)
      .map(il => {
        const info = itemMap[il.itemCode] || {};
        return {
          id: il.id,
          itemCode: il.itemCode,
          deskripsi: info.deskripsi || il.itemCode,
          satuan: info.satuan || 'Unit',
          qty: Number(il.qty) || 0
        };
      });

    const currentQty = locItems.reduce((sum, curr) => sum + curr.qty, 0);
    const maxCapacity = Number(loc.maxCapacity) || 100;
    const availableCapacity = Math.max(0, maxCapacity - currentQty);
    const occupancyPercent = Math.min(100, Math.round((currentQty / maxCapacity) * 100));

    let status = 'OPTIMAL';
    let statusLabel = 'Optimal';
    let statusColor = 'text-emerald-600 bg-emerald-50 border-emerald-200';

    if (currentQty >= maxCapacity) {
      status = 'FULL';
      statusLabel = 'Penuh';
      statusColor = 'text-rose-700 bg-rose-50 border-rose-200';
    } else if (occupancyPercent >= 85) {
      status = 'WARNING';
      statusLabel = 'Hampir Penuh';
      statusColor = 'text-amber-700 bg-amber-50 border-amber-200';
    } else if (occupancyPercent <= 15) {
      status = 'LOW';
      statusLabel = 'Kapasitas Lega';
      statusColor = 'text-blue-700 bg-blue-50 border-blue-200';
    }

    return {
      ...loc,
      currentQty,
      availableCapacity,
      occupancyPercent,
      status,
      statusLabel,
      statusColor,
      items: locItems
    };
  });
}

export async function getItemLocationsBreakdown(uniqCode) {
  const [records, locations] = await Promise.all([
    db.item_locations.filter(il => il.itemCode === uniqCode && il.qty > 0).toArray(),
    db.locations.toArray()
  ]);
  const locMap = {};
  locations.forEach(l => { locMap[l.code] = l; });

  return records.map(r => {
    const loc = locMap[r.locationCode] || {};
    return {
      id: r.id,
      itemCode: r.itemCode,
      locationCode: r.locationCode,
      locationName: loc.name || r.locationCode,
      locationType: loc.type || 'Standard',
      qty: Number(r.qty) || 0,
      maxCapacity: Number(loc.maxCapacity) || 100
    };
  });
}

export async function executeApproveMovement(movementId) {
  const movement = await db.movements.get(movementId);
  if (!movement) throw new Error('Dokumen movement tidak ditemukan');
  if (movement.status === 'APPROVED') throw new Error('Dokumen sudah disetujui sebelumnya');

  await db.transaction('rw', db.item_locations, db.movements, async () => {
    for (const line of movement.items) {
      const qtyToMove = Number(line.qty) || 0;
      if (qtyToMove <= 0) continue;

      // 1. Kurangi dari From Location
      const fromRecord = await db.item_locations
        .filter(il => il.itemCode === line.uniqCode && il.locationCode === line.fromLocation)
        .first();

      if (!fromRecord || fromRecord.qty < qtyToMove) {
        throw new Error(`Stok item ${line.uniqCode} di lokasi ${line.fromLocation} tidak mencukupi (Tersedia: ${fromRecord ? fromRecord.qty : 0})`);
      }

      if (fromRecord.qty === qtyToMove) {
        await db.item_locations.delete(fromRecord.id);
      } else {
        await db.item_locations.update(fromRecord.id, {
          qty: fromRecord.qty - qtyToMove
        });
      }

      // 2. Tambah ke To Location
      const toRecord = await db.item_locations
        .filter(il => il.itemCode === line.uniqCode && il.locationCode === line.toLocation)
        .first();

      if (toRecord) {
        await db.item_locations.update(toRecord.id, {
          qty: toRecord.qty + qtyToMove
        });
      } else {
        await db.item_locations.add({
          itemCode: line.uniqCode,
          locationCode: line.toLocation,
          qty: qtyToMove
        });
      }
    }

    // 3. Kunci dan perbarui status dokumen movement
    await db.movements.update(movementId, {
      status: 'APPROVED',
      isLocked: true,
      approvedAt: new Date().toISOString()
    });
  });

  return true;
}

// Alokasi otomatis stok dokumen Transfer Order ke lokasi rak (Default: ZONE-STAGING)
export async function applyTransactionStockToLocations(txDoc, isRevert = false) {
  if (!txDoc || txDoc.status === 'DRAFT' || !Array.isArray(txDoc.items)) return;
  await seedLocationDataIfEmpty();

  await db.transaction('rw', db.item_locations, async () => {
    for (const item of txDoc.items) {
      const qty = Number(item.qty) || 0;
      if (qty <= 0) continue;

      if (txDoc.type === 'IN') {
        // Lokasi masuk: gunakan yang dipilih di dokumen atau fallback ke default ZONE-STAGING
        const targetLoc = item.locationCode || txDoc.defaultLocation || 'ZONE-STAGING';
        const existing = await db.item_locations
          .filter(il => il.itemCode === item.uniqCode && il.locationCode === targetLoc)
          .first();

        if (isRevert) {
          if (existing) {
            if (existing.qty <= qty) {
              await db.item_locations.delete(existing.id);
            } else {
              await db.item_locations.update(existing.id, { qty: existing.qty - qty });
            }
          }
        } else {
          if (existing) {
            await db.item_locations.update(existing.id, { qty: existing.qty + qty });
          } else {
            await db.item_locations.add({
              itemCode: item.uniqCode,
              locationCode: targetLoc,
              qty: qty
            });
          }
        }
      } else if (txDoc.type === 'OUT') {
        if (isRevert) {
          const fallbackLoc = item.locationCode || 'ZONE-STAGING';
          const existing = await db.item_locations
            .filter(il => il.itemCode === item.uniqCode && il.locationCode === fallbackLoc)
            .first();
          if (existing) {
            await db.item_locations.update(existing.id, { qty: existing.qty + qty });
          } else {
            await db.item_locations.add({ itemCode: item.uniqCode, locationCode: fallbackLoc, qty });
          }
        } else {
          let needToDeduct = qty;
          let locRecords = await db.item_locations
            .filter(il => il.itemCode === item.uniqCode && il.qty > 0)
            .toArray();

          // Prioritaskan lokasi yang dipilih user jika ada
          if (item.locationCode) {
            locRecords.sort((a, b) => (a.locationCode === item.locationCode ? -1 : b.locationCode === item.locationCode ? 1 : 0));
          }

          for (const rec of locRecords) {
            if (needToDeduct <= 0) break;
            if (rec.qty <= needToDeduct) {
              needToDeduct -= rec.qty;
              await db.item_locations.delete(rec.id);
            } else {
              await db.item_locations.update(rec.id, { qty: rec.qty - needToDeduct });
              needToDeduct = 0;
            }
          }
        }
      }
    }
  });
}

// ==============================================================
// SISTEM DETEKSI DINI & PERINGATAN OTOMATIS GUDANG (SMART ALERTS)
// ==============================================================
export async function getWarehouseEarlyWarnings(preloadedLocations = null) {
  const [locations, itemLocs, items, stockMap] = await Promise.all([
    preloadedLocations || getLocationDetailsWithOccupancy(),
    db.item_locations.toArray(),
    db.items.toArray(),
    calculateStockMap()
  ]);

  const itemMap = {};
  items.forEach(it => { itemMap[it.uniqCode] = it; });

  // 1. Deteksi Overcapacity (Kapasitas Melampaui Batas)
  const overcapacityLocations = locations.filter(l => l.currentQty > l.maxCapacity);

  // 2. Deteksi Hampir Penuh (Occupancy >= 85% dan <= 100%)
  const nearCapacityLocations = locations.filter(l => l.occupancyPercent >= 85 && l.currentQty <= l.maxCapacity);

  // 3. Deteksi Staging Backlog (Barang menumpuk di ZONE-STAGING menunggu Putaway)
  const stagingItems = itemLocs
    .filter(il => il.locationCode === 'ZONE-STAGING' && il.qty > 0)
    .map(il => {
      const info = itemMap[il.itemCode] || {};
      return {
        itemCode: il.itemCode,
        deskripsi: info.deskripsi || il.itemCode,
        satuan: info.satuan || 'Unit',
        qty: il.qty
      };
    });

  // 4. Deteksi Dead Stock / Anomali Alokasi Lokasi
  const unallocatedItems = items.filter(it => {
    const currentStock = stockMap[it.uniqCode]?.balance || 0;
    const allocated = itemLocs
      .filter(il => il.itemCode === it.uniqCode)
      .reduce((sum, curr) => sum + (Number(curr.qty) || 0), 0);
    return currentStock > 0 && allocated === 0;
  });

  const totalWarnings = overcapacityLocations.length + nearCapacityLocations.length + (stagingItems.length > 0 ? 1 : 0);

  return {
    overcapacityLocations,
    nearCapacityLocations,
    stagingItems,
    unallocatedItems,
    totalWarnings
  };
}

// ==============================================================
// AUTO-SAVE DRAF FORM (INDEXEDDB)
// ==============================================================
export async function saveFormDraft(key, data) {
  try {
    await db.form_drafts.put({
      key,
      data,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Gagal menyimpan draf form ke IndexedDB:', err);
  }
}

export async function getFormDraft(key) {
  try {
    return await db.form_drafts.get(key);
  } catch (err) {
    console.warn('Gagal mengambil draf form dari IndexedDB:', err);
    return null;
  }
}

export async function deleteFormDraft(key) {
  try {
    await db.form_drafts.delete(key);
  } catch (err) {
    console.warn('Gagal menghapus draf form dari IndexedDB:', err);
  }
}

