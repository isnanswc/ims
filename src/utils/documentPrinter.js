/**
 * Utilitas Pencetakan Dokumen Resmi Gudang & Export PDF (IMS WMS)
 * Menggunakan standar cetak A4 Portrait murni (210mm x 297mm).
 * - Menghilangkan teks aneh browser (URL, tanggal, about:blank, page no) di sudut kertas via @page margin 0.
 * - Kolom tanda tangan berada tepat di dasar kertas (pinned to bottom of page).
 * - Lebar penuh (100% width) tanpa ruang kosong canggung di kiri dan kanan.
 */

/**
 * Format tanggal Indonesia resmi
 */
function formatDateId(dateStr) {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (e) {
    return dateStr;
  }
}

/**
 * Memicu jendela cetak browser yang bersih
 */
function triggerPrintWindow(htmlContent, title = 'Dokumen Gudang') {
  const printWindow = window.open('', '_blank', 'width=950,height=1050');
  if (!printWindow) {
    alert('Popup diblokir oleh browser. Harap izinkan popup pada peramban Anda untuk mencetak atau menyimpan sebagai PDF.');
    return;
  }

  printWindow.document.open();
  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        /* PENGATURAN KERTAS A4 MURNI & MENGHILANGKAN HEADER/FOOTER BROWSER */
        @page {
          size: A4 portrait;
          margin: 0 !important; /* MENGHILANGKAN SEMUA TEKS URL, TANGGAL, DAN HALAMAN DI SUDUT KERTAS */
        }
        
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        html, body {
          margin: 0 !important;
          padding: 0 !important;
          background: #ffffff !important;
          color: #09090b !important;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          font-size: 11px;
          line-height: 1.4;
          width: 210mm;
        }

        /* LEMBAR KERTAS A4 PERSISI TINGGI 297mm & LEBAR 210mm */
        .sheet-page {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          padding: 13mm 15mm 13mm 15mm; /* Margin isi kertas yang proporsional dan simetris */
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          position: relative;
          background: #ffffff;
        }

        /* BAGIAN ATAS LEMBAR */
        .sheet-top {
          width: 100%;
          flex: 0 0 auto;
        }

        /* KOP DOKUMEN */
        .header-container {
          border-bottom: 2.5px solid #18181b;
          padding-bottom: 10px;
          margin-bottom: 14px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          width: 100%;
        }

        .company-title {
          font-size: 15px;
          font-weight: 900;
          letter-spacing: 0.5px;
          color: #09090b;
          text-transform: uppercase;
        }

        .company-sub {
          font-size: 10px;
          color: #52525b;
          margin-top: 2px;
          font-weight: 500;
        }

        .doc-badge-title {
          text-align: right;
        }

        .doc-name {
          font-size: 17px;
          font-weight: 900;
          text-transform: uppercase;
          color: #09090b;
          margin: 0;
          letter-spacing: 0.5px;
        }

        .doc-code {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 13px;
          font-weight: 800;
          background: #f4f4f5;
          padding: 3px 8px;
          border-radius: 4px;
          display: inline-block;
          margin-top: 4px;
          border: 1px solid #d4d4d8;
        }

        /* GRID INFORMASI DOKUMEN (LEBAR PENUH 100%) */
        .info-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr 1fr 1fr;
          gap: 8px 12px;
          background: #fafafa;
          border: 1px solid #e4e4e7;
          border-radius: 6px;
          padding: 10px 14px;
          margin-bottom: 14px;
          width: 100%;
        }

        .info-item {
          display: flex;
          flex-direction: column;
        }

        .info-label {
          font-size: 8.5px;
          font-weight: 700;
          text-transform: uppercase;
          color: #71717a;
          letter-spacing: 0.5px;
        }

        .info-value {
          font-size: 11px;
          font-weight: 700;
          color: #18181b;
          margin-top: 2px;
        }

        .info-value.mono {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }

        /* TABEL RINCIAN BARANG (LEBAR PENUH 100% DENGAN BORDER CRISP) */
        table.items-table {
          width: 100%;
          table-layout: fixed;
          border-collapse: collapse;
          margin-bottom: 12px;
        }

        table.items-table th {
          background-color: #f4f4f5;
          color: #18181b;
          font-size: 9.5px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 7px 8px;
          border-top: 1.5px solid #18181b;
          border-bottom: 1.5px solid #18181b;
          border-left: 1px solid #e4e4e7;
          border-right: 1px solid #e4e4e7;
          text-align: left;
        }

        table.items-table td {
          padding: 6px 8px;
          border-bottom: 1px solid #e4e4e7;
          border-left: 1px solid #e4e4e7;
          border-right: 1px solid #e4e4e7;
          font-size: 10.5px;
          vertical-align: middle;
          word-wrap: break-word;
        }

        table.items-table tr:nth-child(even) td {
          background-color: #fafafa;
        }

        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
        .font-bold { font-weight: 700; }
        .font-black { font-weight: 900; }

        .sku-badge {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-weight: 800;
          background: #f4f4f5;
          border: 1px solid #d4d4d8;
          padding: 1.5px 5px;
          border-radius: 3px;
          display: inline-block;
          font-size: 10px;
        }

        .loc-badge {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-weight: 700;
          background: #f4f4f5;
          border: 1px solid #d4d4d8;
          padding: 1.5px 5px;
          border-radius: 3px;
          display: inline-block;
          font-size: 9.5px;
        }

        /* RINGKASAN KUANTITAS */
        .summary-box {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 14px;
          background: #fafafa;
          border: 1.5px solid #18181b;
          border-radius: 5px;
          width: 100%;
          margin-bottom: 15px;
        }

        /* ELEMEN PENDORONG AGAR TANDA TANGAN BERADA DI DASAR KERTAS */
        .sheet-spacer {
          flex: 1 1 auto;
          min-height: 25mm; /* Memberikan jarak fleksibel yang mendorong tanda tangan ke dasar lembar */
        }

        /* BAGIAN DASAR LEMBAR (TANDA TANGAN & CATATAN KAKI) */
        .sheet-bottom {
          width: 100%;
          flex: 0 0 auto;
          page-break-inside: avoid;
        }

        .signatures-container {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          width: 100%;
          margin-bottom: 10px;
        }

        .sign-box {
          border: 1px solid #d4d4d8;
          border-radius: 5px;
          padding: 8px 10px;
          text-align: center;
          background: #ffffff;
        }

        .sign-role {
          font-size: 9.5px;
          font-weight: 800;
          text-transform: uppercase;
          color: #3f3f46;
          margin-bottom: 46px; /* Ruang tanda tangan resmi */
        }

        .sign-line {
          border-top: 1px dashed #71717a;
          margin: 0 8px 4px 8px;
        }

        .sign-name {
          font-size: 9px;
          color: #71717a;
          font-weight: 500;
        }

        .footer-note {
          padding-top: 6px;
          border-top: 1px solid #e4e4e7;
          font-size: 8.5px;
          color: #71717a;
          display: flex;
          justify-content: space-between;
          width: 100%;
        }

        /* TOOLBAR LAYAR (HANYA MUNCUL DI PREVIEW, TIDAK TERCETAK) */
        .no-print-toolbar {
          position: sticky;
          top: 0;
          z-index: 9999;
          background: #18181b;
          color: #ffffff;
          padding: 10px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.25);
        }

        .btn-print {
          background: #ffffff;
          color: #18181b;
          border: none;
          font-weight: 800;
          font-size: 12px;
          padding: 8px 18px;
          border-radius: 6px;
          cursor: pointer;
        }

        @media print {
          .no-print { display: none !important; }
          body { width: 210mm !important; }
          .sheet-page { margin: 0 !important; width: 210mm !important; }
        }
      </style>
    </head>
    <body>
      <div class="no-print no-print-toolbar">
        <div>
          <span style="font-weight: bold; font-size: 13px;">Pratinjau Cetak / Ekspor PDF Resmi (A4)</span>
          <span style="font-size: 11px; color: #a1a1aa; margin-left: 10px;">Pilih opsi Printer: "Save as PDF" untuk mengunduh</span>
        </div>
        <button class="btn-print" onclick="window.print()">🖨️ Cetak / Simpan PDF</button>
      </div>

      <div class="sheet-page">
        ${htmlContent}
      </div>

      <script>
        window.addEventListener('DOMContentLoaded', () => {
          setTimeout(() => {
            window.focus();
            window.print();
          }, 350);
        });
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

/**
 * 1. CETAK / EKSPOR PDF TRANSFER ORDER (IN / OUT)
 */
export function printTransferOrderDocument(doc) {
  if (!doc) return;

  const isTypeIn = doc.type === 'IN';
  const typeLabel = isTypeIn ? 'TRANSFER MASUK (IN)' : 'TRANSFER KELUAR (OUT)';
  const items = doc.items || [];
  const totalQty = items.reduce((sum, it) => sum + (Number(it.qty) || 0), 0);

  const rowsHtml = items.map((it, idx) => `
    <tr>
      <td class="text-center font-mono" style="width: 5%;">${idx + 1}</td>
      <td style="width: 18%;">
        <span class="sku-badge">${it.uniqCode || '-'}</span>
      </td>
      <td style="width: 32%;">
        <strong style="color: #09090b;">${it.deskripsi || '-'}</strong>
      </td>
      <td class="text-center font-bold" style="width: 9%;">${it.satuan || 'UNIT'}</td>
      <td style="width: 14%;">
        <span class="loc-badge">${it.locationCode || doc.defaultLocation || 'ZONE-STAGING'}</span>
      </td>
      <td class="text-right font-mono font-black" style="width: 10%;">${Number(it.qty || 0).toLocaleString('id-ID')}</td>
      <td style="width: 12%; font-size: 9.5px; color: #52525b;">${it.keterangan || '-'}</td>
    </tr>
  `).join('');

  const content = `
    <!-- BAGIAN ATAS LEMBAR -->
    <div class="sheet-top">
      <!-- Header Kop -->
      <div class="header-container">
        <div>
          <div class="company-title">IMS • Warehouse Management System</div>
          <div class="company-sub">Sistem Manajemen Persediaan & Pergudangan Terintegrasi</div>
        </div>
        <div class="doc-badge-title">
          <h1 class="doc-name">${typeLabel}</h1>
          <div class="doc-code">${doc.trxCode || '-'}</div>
        </div>
      </div>

      <!-- Metadata Informasi Dokumen (100% Lebar Penuh) -->
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">No. Dokumen Ref</span>
          <span class="info-value mono">${doc.noDocument || '-'}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Tanggal Dokumen</span>
          <span class="info-value">${formatDateId(doc.tanggal)}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Status Validasi</span>
          <span class="info-value mono">${doc.status === 'DRAFT' ? 'DRAFT SEMENTARA' : 'RESMI & TERBUKU'}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Area / Staging Default</span>
          <span class="info-value mono">${doc.defaultLocation || 'ZONE-STAGING'}</span>
        </div>
        <div class="info-item" style="grid-column: span 4; margin-top: 2px;">
          <span class="info-label">Catatan Dokumen</span>
          <span class="info-value" style="font-weight: 500;">${doc.keterangan || 'Tidak ada catatan tambahan.'}</span>
        </div>
      </div>

      <!-- Tabel Daftar Barang (100% Lebar Penuh) -->
      <table class="items-table">
        <thead>
          <tr>
            <th class="text-center" style="width: 5%;">No</th>
            <th style="width: 18%;">Kode SKU</th>
            <th style="width: 32%;">Deskripsi Barang</th>
            <th class="text-center" style="width: 9%;">Satuan</th>
            <th style="width: 14%;">Area / Rak</th>
            <th class="text-right" style="width: 10%;">Qty</th>
            <th style="width: 12%;">Catatan</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml || '<tr><td colspan="7" class="text-center" style="padding: 20px;">Tidak ada rincian item barang.</td></tr>'}
        </tbody>
      </table>

      <!-- Ringkasan Kuantitas -->
      <div class="summary-box">
        <div>
          <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #52525b;">Total Rincian Barang:</span>
          <strong style="margin-left: 6px; font-size: 11.5px;">${items.length} Baris SKU</strong>
        </div>
        <div>
          <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #52525b;">Total Akumulasi Fisik:</span>
          <strong style="margin-left: 8px; font-size: 14px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace;">${totalQty.toLocaleString('id-ID')} Unit</strong>
        </div>
      </div>
    </div>

    <!-- ELEMEN FLEKSIBEL: Mendorong Tanda Tangan ke Dasar Kertas -->
    <div class="sheet-spacer"></div>

    <!-- BAGIAN DASAR LEMBAR (Tanda Tangan & Footer Kertas) -->
    <div class="sheet-bottom">
      <div class="signatures-container">
        <div class="sign-box">
          <div class="sign-role">Dibuat Oleh (Admin / Staf)</div>
          <div class="sign-line"></div>
          <div class="sign-name">Tanggal & Tanda Tangan</div>
        </div>
        <div class="sign-box">
          <div class="sign-role">Diserahkan / Pengirim</div>
          <div class="sign-line"></div>
          <div class="sign-name">Tanggal & Tanda Tangan</div>
        </div>
        <div class="sign-box">
          <div class="sign-role">Diterima (Kepala Gudang)</div>
          <div class="sign-line"></div>
          <div class="sign-name">Tanggal & Tanda Tangan</div>
        </div>
      </div>

      <div class="footer-note">
        <span>Dokumen ini dihasilkan secara otomatis oleh IMS WMS. Sah tanpa stempel jika status telah disetujui.</span>
        <span>Dicetak pada: ${new Date().toLocaleString('id-ID')}</span>
      </div>
    </div>
  `;

  triggerPrintWindow(content, `Transfer_Order_${doc.trxCode || 'Doc'}`);
}

/**
 * 2. CETAK / EKSPOR PDF MOVEMENT WORKSHEET (MUTASI RAK INTERNAL)
 */
export function printMovementWorksheetDocument(header, items = []) {
  if (!header) return;

  const totalQty = items.reduce((sum, it) => sum + (Number(it.qty) || 0), 0);

  const rowsHtml = items.map((it, idx) => `
    <tr>
      <td class="text-center font-mono" style="width: 5%;">${idx + 1}</td>
      <td style="width: 18%;">
        <span class="sku-badge">${it.uniqCode || '-'}</span>
      </td>
      <td style="width: 27%;">
        <strong style="color: #09090b;">${it.deskripsi || '-'}</strong>
      </td>
      <td style="width: 13%;">
        <span class="loc-badge" style="background: #fef3c7; border-color: #fde68a; color: #92400e;">${it.fromLocation || '-'}</span>
      </td>
      <td class="text-center font-bold" style="width: 4%; color: #71717a;">&rarr;</td>
      <td style="width: 13%;">
        <span class="loc-badge" style="background: #d1fae5; border-color: #a7f3d0; color: #065f46;">${it.toLocation || '-'}</span>
      </td>
      <td class="text-right font-mono font-black" style="width: 9%;">${Number(it.qty || 0).toLocaleString('id-ID')}</td>
      <td class="text-center font-bold" style="width: 7%;">${it.satuan || 'UNIT'}</td>
      <td style="width: 14%; font-size: 9.5px; color: #52525b;">${it.keterangan || '-'}</td>
    </tr>
  `).join('');

  const content = `
    <!-- BAGIAN ATAS LEMBAR -->
    <div class="sheet-top">
      <!-- Header Kop -->
      <div class="header-container">
        <div>
          <div class="company-title">IMS • Warehouse Management System</div>
          <div class="company-sub">Instruksi Kerja Pemindahan Stok Rak (Internal Movement Worksheet)</div>
        </div>
        <div class="doc-badge-title">
          <h1 class="doc-name">MUTASI RAK / WORKSHEET</h1>
          <div class="doc-code">${header.docNo || 'DRAFT-MOVE'}</div>
        </div>
      </div>

      <!-- Metadata Informasi Dokumen (100% Lebar Penuh) -->
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">No. Dokumen Mutasi</span>
          <span class="info-value mono">${header.docNo || '-'}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Tanggal Pelaksanaan</span>
          <span class="info-value">${formatDateId(header.tanggal)}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Operator / Pelaksana</span>
          <span class="info-value">${header.operator || 'Staf Gudang'}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Status Lembar Kerja</span>
          <span class="info-value mono">${header.status === 'APPROVED' ? 'SELESAI (APPROVED)' : 'LEMBAR KERJA / DRAFT'}</span>
        </div>
        <div class="info-item" style="grid-column: span 4; margin-top: 2px;">
          <span class="info-label">Instruksi / Catatan Kerja</span>
          <span class="info-value" style="font-weight: 500;">${header.keterangan || 'Pemindahan stok internal antar rak penyimpanan.'}</span>
        </div>
      </div>

      <!-- Tabel Rute Pemindahan Barang (100% Lebar Penuh) -->
      <table class="items-table">
        <thead>
          <tr>
            <th class="text-center" style="width: 5%;">No</th>
            <th style="width: 18%;">Kode SKU</th>
            <th style="width: 27%;">Nama Barang</th>
            <th style="width: 13%;">Dari (From)</th>
            <th class="text-center" style="width: 4%;">&rarr;</th>
            <th style="width: 13%;">Ke (To)</th>
            <th class="text-right" style="width: 9%;">Qty</th>
            <th class="text-center" style="width: 7%;">Satuan</th>
            <th style="width: 14%;">Catatan</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml || '<tr><td colspan="9" class="text-center" style="padding: 20px;">Belum ada item dalam lembar kerja ini.</td></tr>'}
        </tbody>
      </table>

      <!-- Ringkasan Kuantitas -->
      <div class="summary-box">
        <div>
          <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #52525b;">Total Perpindahan:</span>
          <strong style="margin-left: 6px; font-size: 11.5px;">${items.length} Baris SKU</strong>
        </div>
        <div>
          <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #52525b;">Total Unit Dipindahkan:</span>
          <strong style="margin-left: 8px; font-size: 14px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace;">${totalQty.toLocaleString('id-ID')} Unit</strong>
        </div>
      </div>
    </div>

    <!-- ELEMEN FLEKSIBEL: Mendorong Tanda Tangan ke Dasar Kertas -->
    <div class="sheet-spacer"></div>

    <!-- BAGIAN DASAR LEMBAR (Tanda Tangan & Footer Kertas) -->
    <div class="sheet-bottom">
      <div class="signatures-container">
        <div class="sign-box">
          <div class="sign-role">Pelaksana (Picker / Operator)</div>
          <div class="sign-line"></div>
          <div class="sign-name">Tanggal & Tanda Tangan</div>
        </div>
        <div class="sign-box">
          <div class="sign-role">Verifikasi Lokasi Tujuan</div>
          <div class="sign-line"></div>
          <div class="sign-name">Tanggal & Tanda Tangan</div>
        </div>
        <div class="sign-box">
          <div class="sign-role">Disetujui (Kepala Gudang)</div>
          <div class="sign-line"></div>
          <div class="sign-name">Tanggal & Tanda Tangan</div>
        </div>
      </div>

      <div class="footer-note">
        <span>Verifikasi fisik barang di rak asal dan tujuan wajib dilakukan sebelum menandatangani form ini.</span>
        <span>Dicetak pada: ${new Date().toLocaleString('id-ID')}</span>
      </div>
    </div>
  `;

  triggerPrintWindow(content, `Movement_Worksheet_${header.docNo || 'Doc'}`);
}
