/**
 * セキュリティ関連のサニタイゼーション関数
 */

import DOMPurify from 'dompurify';

/**
 * HTMLコンテンツをサニタイズ
 */
export function sanitizeHtml(html: string): string {
  if (typeof window === 'undefined') {
    // サーバーサイドの場合は基本的なサニタイズ
    return html
      .replace(/[<>&"']/g, (char) => {
        switch (char) {
          case '<': return '&lt;';
          case '>': return '&gt;';
          case '&': return '&amp;';
          case '"': return '&quot;';
          case "'": return '&#x27;';
          default: return char;
        }
      });
  }
  
  // クライアントサイドではDOMPurifyを使用
  return DOMPurify.sanitize(html);
}

/**
 * ファイル名をサニタイズ
 */
export function sanitizeFileName(fileName: string): string {
  return fileName
    // eslint-disable-next-line no-control-regex
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '_') // 危険な文字を置換
    .replace(/\s+/g, '_') // 空白をアンダースコアに
    .slice(0, 50) // 長さ制限
    .trim();
}

/**
 * URLをサニタイズ
 */
export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // HTTPSまたはHTTPのみ許可
    if (!['https:', 'http:'].includes(parsed.protocol)) {
      throw new Error('Invalid protocol');
    }
    return parsed.toString();
  } catch {
    return '';
  }
}

/**
 * ダウンロードリンクを安全に作成
 */
export function createSafeDownloadLink(blob: Blob, fileName: string): HTMLAnchorElement { // eslint-disable-line no-undef
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = sanitizeFileName(fileName);
  a.style.display = 'none';
  
  return a;
}

/**
 * 安全にダウンロードを実行
 */
export function safeDownload(blob: Blob, fileName: string): void {
  if (typeof window === 'undefined') return;
  
  const a = createSafeDownloadLink(blob, fileName);
  
  document.body.appendChild(a);
  try {
    a.click();
  } finally {
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  }
}