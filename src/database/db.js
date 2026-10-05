import Dexie from 'dexie';

export const db = new Dexie('InventoryManagementSystemDB');

// Skema IndexedDB (Header-Detail Transaction Architecture)
db.version(2).stores({
  items: '++id, &uniqCode, deskripsi, satuan, minStock, createdAt',
  transactions: '++id, &trxCode, type, tanggal, noDocument, createdAt'
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

// Helper: Menghitung total akumulasi stok per barang
export async function calculateStockMap(excludeDocId = null) {
  const transactions = await db.transactions.toArray();
  const stockMap = {};

  for (const doc of transactions) {
    if (excludeDocId && doc.id === excludeDocId) continue;
    if (!doc.items || !Array.isArray(doc.items)) continue;

    for (const line of doc.items) {
      if (!stockMap[line.uniqCode]) {
        stockMap[line.uniqCode] = { inQty: 0, outQty: 0, balance: 0 };
      }
      const qty = Number(line.qty) || 0;
      if (doc.type === 'IN') {
        stockMap[line.uniqCode].inQty += qty;
        stockMap[line.uniqCode].balance += qty;
      } else if (doc.type === 'OUT') {
        stockMap[line.uniqCode].outQty += qty;
        stockMap[line.uniqCode].balance -= qty;
      }
    }
  }

  return stockMap;
}

// Helper: Mengambil master item lengkap beserta stok saat ini dan status PPIC
export async function getItemsWithCurrentStock(excludeDocId = null) {
  const items = await db.items.toArray();
  const stockMap = await calculateStockMap(excludeDocId);

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

    return {
      ...item,
      minStock: min,
      maxStock: max,
      leadTime: leadTime,
      inQty: stockInfo.inQty,
      outQty: stockInfo.outQty,
      currentStock: stock,
      isLowStock: stock <= min,
      stockLevel,
      stockLevelLabel,
      stockLevelColor,
      stockPercent
    };
  });
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

  // Filter tanggal
  return ledgerEntries.filter(entry => {
    if (startDate && entry.tanggal < startDate) return false;
    if (endDate && entry.tanggal > endDate) return false;
    return true;
  });
}
