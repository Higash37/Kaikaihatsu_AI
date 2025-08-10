// データエクスポートユーティリティ
import { getSafeDisplayName } from './user-display';

import { safeDownload } from '@/lib/security/sanitization';

export interface ExportData {
  filename: string;
  data: any[];
  format: 'csv' | 'json' | 'excel' | 'xml';
  headers?: string[];
  metadata?: {
    title?: string;
    description?: string;
    generatedAt?: string;
    source?: string;
  };
}

// CSV形式でエクスポート
export const exportToCSV = (data: any[], filename: string, headers?: string[]): void => {
  if (data.length === 0) {
    throw new Error('エクスポートするデータがありません');
  }

  // ヘッダーを決定
  const csvHeaders = headers || Object.keys(data[0]);
  
  // CSV内容を生成
  const csvContent = [
    csvHeaders.join(','), // ヘッダー行
    ...data.map(row => 
      csvHeaders.map(header => {
        const value = row[header];
        // 値をCSV形式に変換（カンマや改行を含む場合は引用符で囲む）
        if (typeof value === 'string' && (value.includes(',') || value.includes('\n') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  // BOM付きUTF-8でエンコード（Excel対応）
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  downloadBlob(blob, `${filename}.csv`);
};

// JSON形式でエクスポート
export const exportToJSON = (data: any[], filename: string, metadata?: any): void => {
  const exportData = {
    metadata: {
      exportedAt: new Date().toISOString(),
      totalRecords: data.length,
      ...metadata,
    },
    data,
  };

  const jsonContent = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  
  downloadBlob(blob, `${filename}.json`);
};

// Excel形式でエクスポート（シンプルなHTML table形式）
export const exportToExcel = (data: any[], filename: string, headers?: string[]): void => {
  if (data.length === 0) {
    throw new Error('エクスポートするデータがありません');
  }

  const excelHeaders = headers || Object.keys(data[0]);
  
  // HTMLテーブルを生成
  const htmlTable = `
    <table border="1">
      <thead>
        <tr>
          ${excelHeaders.map(header => `<th>${header}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${data.map(row => `
          <tr>
            ${excelHeaders.map(header => `<td>${row[header] || ''}</td>`).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  const blob = new Blob([htmlTable], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  downloadBlob(blob, `${filename}.xls`);
};

// XML形式でエクスポート
export const exportToXML = (data: any[], filename: string, rootElement: string = 'data'): void => {
  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<${rootElement}>
  ${data.map((item, index) => `
  <item id="${index + 1}">
    ${Object.entries(item).map(([key, value]) => `
    <${key}>${escapeXML(String(value))}</${key}>`).join('')}
  </item>`).join('')}
</${rootElement}>`;

  const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8;' });
  downloadBlob(blob, `${filename}.xml`);
};

// XMLエスケープ
const escapeXML = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

// ファイルダウンロード - セキュアな実装
const downloadBlob = (blob: Blob, filename: string): void => {
  safeDownload(blob, filename);
};

// クイズデータをエクスポート用に変換
export const transformQuizData = (quizzes: any[]): any[] => {
  return quizzes.map(quiz => ({
    ID: quiz.id,
    タイトル: quiz.title,
    説明: quiz.description,
    作成者: getSafeDisplayName(quiz.creatorName),
    作成日: new Date(quiz.createdAt).toLocaleDateString('ja-JP'),
    質問数: quiz.questionCount,
    公開状態: quiz.isPublic ? '公開' : '非公開',
    総回答数: quiz.totalResponses || 0,
    完了数: quiz.completedResponses || 0,
    進行中: quiz.inProgressResponses || 0,
    平均評価: quiz.averageRating || 0,
    カテゴリ: quiz.category || '',
    タグ: Array.isArray(quiz.tags) ? quiz.tags.join(', ') : '',
  }));
};

// 回答データをエクスポート用に変換
export const transformResponseData = (responses: any[]): any[] => {
  return responses.map(response => ({
    ID: response.id,
    ユーザーID: response.user_id,
    クイズID: response.quiz_id,
    スコア: response.result_data?.score || 0,
    完了日時: response.completed_at 
      ? new Date(response.completed_at).toLocaleString('ja-JP')
      : '',
    回答時間: response.response_time ? `${Math.round(response.response_time / 60)}分` : '',
    年齢: response.demographics?.age || '',
    性別: response.demographics?.gender || '',
    地域: response.demographics?.location || '',
  }));
};

// 統計データをエクスポート用に変換
export const transformStatisticsData = (statistics: any): any[] => {
  return [
    {
      項目: '総回答数',
      値: statistics.totalResponses || 0,
      単位: '件',
    },
    {
      項目: '平均スコア',
      値: (statistics.averageScore || 0).toFixed(2),
      単位: '点',
    },
    {
      項目: '完了率',
      値: (statistics.completionRate || 0).toFixed(2),
      単位: '%',
    },
    {
      項目: '平均回答時間',
      値: Math.round((statistics.responseTimeStats?.average || 0) / 60),
      単位: '分',
    },
    {
      項目: '中央値回答時間',
      値: Math.round((statistics.responseTimeStats?.median || 0) / 60),
      単位: '分',
    },
    {
      項目: '最短回答時間',
      値: Math.round((statistics.responseTimeStats?.min || 0) / 60),
      単位: '分',
    },
    {
      項目: '最長回答時間',
      値: Math.round((statistics.responseTimeStats?.max || 0) / 60),
      単位: '分',
    },
  ];
};

// 一括エクスポート機能
export const bulkExport = async (exportConfigs: ExportData[]): Promise<void> => {
  const zip = await import('jszip');
  const JSZip = zip.default;
  
  const zipFile = new JSZip();

  for (const config of exportConfigs) {
    let content: string;

    switch (config.format) {
      case 'csv': {
        const csvHeaders = config.headers || Object.keys(config.data[0] || {});
        content = [
          csvHeaders.join(','),
          ...config.data.map(row => 
            csvHeaders.map(header => {
              const value = row[header];
              if (typeof value === 'string' && (value.includes(',') || value.includes('\n'))) {
                return `"${value.replace(/"/g, '""')}"`;
              }
              return value;
            }).join(',')
          )
        ].join('\n');
        const _mimeType3 = 'text/csv';
        break;
      }

      case 'json': {
        content = JSON.stringify({
          metadata: config.metadata,
          data: config.data,
        }, null, 2);
        const _mimeType2 = 'application/json';
        break;
      }

      case 'xml': {
        content = `<?xml version="1.0" encoding="UTF-8"?>
<data>
  ${config.data.map((item, index) => `
  <item id="${index + 1}">
    ${Object.entries(item).map(([key, value]) => `
    <${key}>${escapeXML(String(value))}</${key}>`).join('')}
  </item>`).join('')}
</data>`;
        const _mimeType = 'application/xml';
        break;
      }

      default:
        continue;
    }

    zipFile.file(`${config.filename}.${config.format}`, content);
  }

  // メタデータファイルを追加
  const metadata = {
    exportDate: new Date().toISOString(),
    files: exportConfigs.map(config => ({
      filename: `${config.filename}.${config.format}`,
      format: config.format,
      recordCount: config.data.length,
    })),
  };
  
  zipFile.file('export_info.json', JSON.stringify(metadata, null, 2));

  // ZIPファイルを生成してダウンロード
  const zipBlob = await zipFile.generateAsync({ type: 'blob' });
  downloadBlob(zipBlob, `data_export_${new Date().toISOString().split('T')[0]}.zip`);
};

// エクスポート履歴を管理
export class ExportHistory {
  private static readonly STORAGE_KEY = 'export_history';
  private static readonly MAX_HISTORY = 10;

  static addExport(filename: string, format: string, recordCount: number): void {
    const history = this.getHistory();
    const newEntry = {
      id: Date.now().toString(),
      filename,
      format,
      recordCount,
      exportedAt: new Date().toISOString(),
    };

    history.unshift(newEntry);
    
    // 最大履歴数を超えた場合は古いものを削除
    if (history.length > this.MAX_HISTORY) {
      history.splice(this.MAX_HISTORY);
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
  }

  static getHistory(): any[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  static clearHistory(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

// カスタムエクスポートフィルター
export const applyFilters = (data: any[], filters: any): any[] => {
  return data.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true; // フィルターが空の場合はスキップ
      
      const itemValue = item[key];
      
      if (typeof value === 'string') {
        return String(itemValue).toLowerCase().includes(value.toLowerCase());
      }
      
      if (typeof value === 'object' && value !== null && 'min' in value && 'max' in value) {
        const numValue = Number(itemValue);
        const rangeValue = value as { min: number; max: number };
        return numValue >= rangeValue.min && numValue <= rangeValue.max;
      }
      
      return itemValue === value;
    });
  });
};

// データ変換パイプライン
export const transformData = (data: any[], transformations: any[]): any[] => {
  return transformations.reduce((acc, transform) => {
    switch (transform.type) {
      case 'filter':
        return applyFilters(acc, transform.filters);
      case 'sort':
        return [...acc].sort((a, b) => {
          const aVal = a[transform.field];
          const bVal = b[transform.field];
          return transform.order === 'desc' ? bVal - aVal : aVal - bVal;
        });
      case 'limit':
        return acc.slice(0, transform.count);
      case 'map':
        return acc.map(transform.mapper);
      default:
        return acc;
    }
  }, data);
};