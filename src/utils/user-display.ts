// ユーザー表示名を安全に処理するユーティリティ

// ランダムな名前の候補
const randomNames = [
  'クリエイター',
  'チャレンジャー',
  'エクスプローラー',
  'ドリーマー',
  'イノベーター',
  'アドベンチャー',
  'ファンタジスト',
  'パイオニア',
  'ナビゲーター',
  'ビジョナリー',
  'アーティスト',
  'サイエンティスト',
  'フィロソファー',
  'エンジニア',
  'ストーリーテラー',
  'ミュージシャン',
  'デザイナー',
  'リサーチャー',
  'テクノロジスト',
  'クラフター'
];

const adjectives = [
  'ユニーク',
  'クリエイティブ',
  'ブリリアント',
  'インスパイア',
  'エネルギッシュ',
  'カラフル',
  'スマート',
  'ファンタスティック',
  'ダイナミック',
  'フレンドリー'
];

/**
 * 一意のランダム名前を生成
 */
const _generateRandomName = (seed?: string): string => {
  // シードがある場合は決定的に生成（同じシードなら同じ名前）
  let hash = 0;
  if (seed) {
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32bit整数に変換
    }
  } else {
    hash = Math.floor(Math.random() * 1000000);
  }
  
  const adjIndex = Math.abs(hash) % adjectives.length;
  const nameIndex = Math.abs(hash >> 8) % randomNames.length;
  const number = Math.abs(hash >> 16) % 999 + 1;
  
  return `${adjectives[adjIndex]}${randomNames[nameIndex]}${number}`;
};

/**
 * ユーザー名を安全に表示するためのヘルパー関数
 * 常にデフォルトユーザー名を返す（認証システム簡略化のため）
 */
export const getSafeDisplayName = (_name: string | null | undefined): string => {
  // 常にデフォルトユーザー名を返す
  return "デフォルトユーザー";
};

/**
 * ユーザーイニシャルを取得（アバター用）
 */
export const getUserInitials = (name: string | null | undefined): string => {
  const safeName = getSafeDisplayName(name);
  
  // 日本語が含まれる場合は最初の1文字
  if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(safeName)) {
    return safeName.charAt(0);
  }

  // 英語の場合は最初の2文字を大文字にして返す
  return safeName.substring(0, 2).toUpperCase();
};