/**
 * Utilitas Pencocokan & Deteksi Kemiripan Teks (Similarity & Fuzzy Matching)
 * Digunakan untuk:
 * 1. Mendeteksi apakah deskripsi barang sudah pernah dibuat di database saat tambah master item.
 * 2. Menghubungkan transaksi tanpa SKU ke SKU yang sudah ada jika deskripsinya serupa / identik.
 */

/**
 * Normalisasi teks untuk perbandingan seragam (lowercase, hilangkan tanda baca, spasi tunggal)
 * @param {string} str 
 * @returns {string}
 */
export function normalizeText(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Menghitung skor kemiripan antara dua teks (skala 0.0 sampai 1.0)
 * Menggabungkan:
 * - Exact normalized match (1.0)
 * - Substring containment / awalan sama
 * - Token Jaccard similarity (kesamaan kata tanpa peduli urutan kata)
 * - Sørensen–Dice Bigram coefficient (menangani typo atau ejaan sedikit berbeda)
 * @param {string} str1 
 * @param {string} str2 
 * @returns {number} Skor 0.0 - 1.0
 */
export function calculateStringSimilarity(str1, str2) {
  const norm1 = normalizeText(str1);
  const norm2 = normalizeText(str2);

  if (!norm1 || !norm2) return 0;
  if (norm1 === norm2) return 1.0;

  // 1. Substring containment (satu string adalah bagian dari string lainnya)
  if (norm1.includes(norm2) || norm2.includes(norm1)) {
    const minLen = Math.min(norm1.length, norm2.length);
    const maxLen = Math.max(norm1.length, norm2.length);
    const containmentRatio = minLen / maxLen;
    if (containmentRatio >= 0.5) {
      return Math.max(0.85, containmentRatio);
    }
  }

  // 2. Token / Word-level Jaccard similarity
  const words1 = new Set(norm1.split(' ').filter(w => w.length > 0));
  const words2 = new Set(norm2.split(' ').filter(w => w.length > 0));

  let wordIntersect = 0;
  for (const w of words1) {
    if (words2.has(w)) wordIntersect++;
  }
  const wordUnion = new Set([...words1, ...words2]).size;
  const wordScore = wordUnion > 0 ? wordIntersect / wordUnion : 0;

  // 3. Character Bigram Sørensen–Dice coefficient
  const getBigrams = (s) => {
    const bg = new Map();
    for (let i = 0; i < s.length - 1; i++) {
      const pair = s.substring(i, i + 2);
      bg.set(pair, (bg.get(pair) || 0) + 1);
    }
    return bg;
  };

  const bg1 = getBigrams(norm1);
  const bg2 = getBigrams(norm2);
  let bgIntersect = 0;

  for (const [pair, count1] of bg1.entries()) {
    if (bg2.has(pair)) {
      bgIntersect += Math.min(count1, bg2.get(pair));
    }
  }

  const totalBg = (norm1.length - 1) + (norm2.length - 1);
  const diceScore = totalBg > 0 ? (2 * bgIntersect) / totalBg : 0;

  // Ambil nilai tertinggi atau pembobotan
  return Math.max(wordScore, diceScore, (wordScore * 0.65 + diceScore * 0.35));
}

/**
 * Mencari item dalam daftar yang memiliki deskripsi mirip atau identik
 * @param {string} targetDesc - Deskripsi yang ingin dicari
 * @param {Array<object>} items - Daftar item eksisting dari database
 * @param {number} threshold - Batas minimal skor kemiripan (default: 0.70 atau 70%)
 * @returns {{ item: object, score: number, isExact: boolean, percentage: number } | null}
 */
export function findSimilarItemByDescription(targetDesc, items = [], threshold = 0.70) {
  if (!targetDesc || !Array.isArray(items) || items.length === 0) return null;

  const normTarget = normalizeText(targetDesc);
  if (!normTarget || normTarget.length < 2) return null;

  let bestMatch = null;
  let highestScore = 0;

  for (const item of items) {
    const itemDesc = item.deskripsi || item['Deskripsi Barang'] || item['Deskripsi'] || item.name || '';
    if (!itemDesc) continue;

    const normItem = normalizeText(itemDesc);
    if (normTarget === normItem) {
      return { 
        item, 
        score: 1.0, 
        isExact: true,
        percentage: 100
      };
    }

    const score = calculateStringSimilarity(targetDesc, itemDesc);
    if (score > highestScore && score >= threshold) {
      highestScore = score;
      bestMatch = { 
        item, 
        score, 
        isExact: false,
        percentage: Math.round(score * 100)
      };
    }
  }

  return bestMatch;
}
