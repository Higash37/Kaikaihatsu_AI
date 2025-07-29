import {
  GetApp,
  TableChart,
  Code,
  PictureAsPdf,
  CloudDownload,
  FilterList,
  Sort,
  History,
  Delete,
  Preview,
  ExpandMore,
  Tune,
} from '@mui/icons-material';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Alert,
  LinearProgress,
  Chip,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  Switch,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ja } from 'date-fns/locale';
import React, { useState, useEffect } from 'react';

import {
  exportToCSV,
  exportToJSON,
  exportToExcel,
  exportToXML,
  bulkExport,
  transformQuizData,
  transformResponseData,
  transformStatisticsData,
  ExportHistory,
  applyFilters,
  transformData,
} from '@/utils/dataExport';
import {
  getQuizzes,
  getQuizDetailedStats,
  getQuizResponses,
} from '@/utils/supabase';

interface DataExporterProps {
  open: boolean;
  onClose: () => void;
  userId?: string;
  quizId?: string;
}

interface ExportConfig {
  dataType: 'quizzes' | 'responses' | 'statistics' | 'all';
  format: 'csv' | 'json' | 'excel' | 'xml';
  dateRange: {
    start: Date;
    end: Date;
  };
  filters: {
    includePrivate: boolean;
    minResponses: number;
    scoreRange: [number, number];
    completedOnly: boolean;
  };
  fields: string[];
  transformations: any[];
  bulkExport: boolean;
}

const DataExporter: React.FC<DataExporterProps> = ({
  open,
  onClose,
  userId,
  quizId,
}) => {
  const [config, setConfig] = useState<ExportConfig>({
    dataType: 'quizzes',
    format: 'csv',
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date(),
    },
    filters: {
      includePrivate: true,
      minResponses: 0,
      scoreRange: [0, 100],
      completedOnly: false,
    },
    fields: [],
    transformations: [],
    bulkExport: false,
  });
  
  const [availableFields, setAvailableFields] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportHistory, setExportHistory] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadExportHistory();
      updateAvailableFields();
    }
  }, [open, config.dataType]);

  const loadExportHistory = () => {
    setExportHistory(ExportHistory.getHistory());
  };

  const updateAvailableFields = () => {
    switch (config.dataType) {
      case 'quizzes': {
        setAvailableFields([
          'ID', 'タイトル', '説明', '作成者', '作成日', '質問数',
          '公開状態', '総回答数', '完了数', '進行中', '平均評価', 'カテゴリ', 'タグ'
        ]);
        setConfig(prev => ({
          ...prev,
          fields: ['ID', 'タイトル', '作成者', '作成日', '質問数', '公開状態', '総回答数', '完了数']
        }));
        break;
      }
      case 'responses':
        setAvailableFields([
          'ID', 'ユーザーID', 'クイズID', 'スコア', '完了日時',
          '回答時間', '年齢', '性別', '地域'
        ]);
        setConfig(prev => ({
          ...prev,
          fields: ['ID', 'ユーザーID', 'クイズID', 'スコア', '完了日時']
        }));
        break;
      case 'statistics':
        setAvailableFields([
          '項目', '値', '単位'
        ]);
        setConfig(prev => ({
          ...prev,
          fields: ['項目', '値', '単位']
        }));
        break;
      default:
        setAvailableFields([]);
    }
  };

  const updateConfig = (key: keyof ExportConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateFilters = (key: keyof ExportConfig['filters'], value: any) => {
    setConfig(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [key]: value,
      },
    }));
  };

  const toggleField = (field: string) => {
    setConfig(prev => ({
      ...prev,
      fields: prev.fields.includes(field)
        ? prev.fields.filter(f => f !== field)
        : [...prev.fields, field],
    }));
  };

  const generatePreview = async () => {
    try {
      let rawData: any[] = [];

      switch (config.dataType) {
        case 'quizzes': {
          const quizzes = userId ? await getQuizzes(userId) : [];
          rawData = transformQuizData(quizzes);
          break;
        case 'responses':
          if (quizId) {
            const responses = await getQuizResponses(quizId);
            rawData = transformResponseData(responses);
          }
          break;
        case 'statistics':
          if (quizId) {
            const stats = await getQuizDetailedStats(quizId);
            rawData = transformStatisticsData(stats);
          }
          break;
      }

      // フィルターを適用
      let filteredData = rawData;
      
      if (config.dataType === 'quizzes' && !config.filters.includePrivate) {
        filteredData = filteredData.filter(item => item.公開状態 === '公開');
      }

      if (config.dataType === 'responses') {
        if (config.filters.completedOnly) {
          filteredData = filteredData.filter(item => item.完了日時);
        }
        if (config.filters.minResponses > 0) {
          filteredData = filteredData.filter(item => item.スコア >= config.filters.minResponses);
        }
      }

      // 選択されたフィールドのみに絞る
      if (config.fields.length > 0) {
        filteredData = filteredData.map(item => {
          const filtered: any = {};
          config.fields.forEach(field => {
            filtered[field] = item[field];
          });
          return filtered;
        });
      }

      setPreviewData(filteredData.slice(0, 10)); // プレビューは最大10件
    } catch (err) {
      console.error('Preview generation error:', err);
      setError('プレビューの生成に失敗しました');
    }
  };

  const executeExport = async () => {
    setIsExporting(true);
    setError(null);

    try {
      let exportData: any[] = [];

      switch (config.dataType) {
        case 'quizzes': {
          const quizzes = userId ? await getQuizzes(userId) : [];
          exportData = transformQuizData(quizzes);
          break;
        case 'responses':
          if (quizId) {
            const responses = await getQuizResponses(quizId);
            exportData = transformResponseData(responses);
          }
          break;
        case 'statistics':
          if (quizId) {
            const stats = await getQuizDetailedStats(quizId);
            exportData = transformStatisticsData(stats);
          }
          break;
        case 'all':
          // 複数データタイプの一括エクスポート
          if (config.bulkExport) {
            const exportConfigs = [
              {
                filename: 'quizzes',
                data: transformQuizData(userId ? await getQuizzes(userId) : []),
                format: config.format as any,
              },
              {
                filename: 'responses',
                data: quizId ? transformResponseData(await getQuizResponses(quizId)) : [],
                format: config.format as any,
              },
            ];
            await bulkExport(exportConfigs);
            ExportHistory.addExport(
              'bulk_export', 
              'zip', 
              exportConfigs.reduce((sum, cfg) => sum + cfg.data.length, 0)
            );
            loadExportHistory();
            return;
          }
          break;
      }

      // フィルターと変換を適用
      const processedData = transformData(exportData, config.transformations);

      // 選択されたフィールドのみに絞る
      const finalData = config.fields.length > 0 
        ? processedData.map(item => {
            const filtered: any = {};
            config.fields.forEach(field => {
              filtered[field] = item[field];
            });
            return filtered;
          })
        : processedData;

      const filename = `${config.dataType}_export_${new Date().toISOString().split('T')[0]}`;

      // エクスポート実行
      switch (config.format) {
        case 'csv':
          exportToCSV(finalData, filename, config.fields);
          break;
        case 'json':
          exportToJSON(finalData, filename, {
            title: `${config.dataType} Export`,
            exportConfig: config,
          });
          break;
        case 'excel':
          exportToExcel(finalData, filename, config.fields);
          break;
        case 'xml':
          exportToXML(finalData, filename, config.dataType);
          break;
      }

      // 履歴に追加
      ExportHistory.addExport(filename, config.format, finalData.length);
      loadExportHistory();

      // 成功メッセージ
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (err) {
      console.error('Export error:', err);
      setError('エクスポートに失敗しました。もう一度お試しください。');
    } finally {
      setIsExporting(false);
    }
  };

  const clearHistory = () => {
    ExportHistory.clearHistory();
    setExportHistory([]);
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'csv':
        return <TableChart />;
      case 'json':
        return <Code />;
      case 'excel':
        return <TableChart color="success" />;
      case 'xml':
        return <Code color="warning" />;
      default:
        return <GetApp />;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CloudDownload />
          データエクスポート
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* 基本設定 */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  基本設定
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>データタイプ</InputLabel>
                    <Select
                      value={config.dataType}
                      label="データタイプ"
                      onChange={(e) => updateConfig('dataType', e.target.value)}
                    >
                      <MenuItem value="quizzes">クイズデータ</MenuItem>
                      <MenuItem value="responses">回答データ</MenuItem>
                      <MenuItem value="statistics">統計データ</MenuItem>
                      <MenuItem value="all">すべて（一括）</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>出力形式</InputLabel>
                    <Select
                      value={config.format}
                      label="出力形式"
                      onChange={(e) => updateConfig('format', e.target.value)}
                    >
                      <MenuItem value="csv">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TableChart />
                          CSV
                        </Box>
                      </MenuItem>
                      <MenuItem value="json">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Code />
                          JSON
                        </Box>
                      </MenuItem>
                      <MenuItem value="excel">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TableChart color="success" />
                          Excel
                        </Box>
                      </MenuItem>
                      <MenuItem value="xml">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Code color="warning" />
                          XML
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>

                  {config.dataType === 'all' && (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={config.bulkExport}
                          onChange={(e) => updateConfig('bulkExport', e.target.checked)}
                        />
                      }
                      label="ZIPファイルで一括エクスポート"
                    />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* フィールド選択 */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  エクスポートフィールド
                </Typography>

                <FormGroup>
                  {availableFields.map((field) => (
                    <FormControlLabel
                      key={field}
                      control={
                        <Checkbox
                          checked={config.fields.includes(field)}
                          onChange={() => toggleField(field)}
                        />
                      }
                      label={field}
                    />
                  ))}
                </FormGroup>

                <Box sx={{ mt: 2 }}>
                  <Button
                    size="small"
                    onClick={() => updateConfig('fields', availableFields)}
                  >
                    すべて選択
                  </Button>
                  <Button
                    size="small"
                    onClick={() => updateConfig('fields', [])}
                    sx={{ ml: 1 }}
                  >
                    すべて解除
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* フィルター設定 */}
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6">
                  <FilterList sx={{ mr: 1, verticalAlign: 'middle' }} />
                  フィルター設定
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {config.dataType === 'quizzes' && (
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={config.filters.includePrivate}
                            onChange={(e) => updateFilters('includePrivate', e.target.checked)}
                          />
                        }
                        label="非公開クイズを含める"
                      />
                    </Grid>
                  )}
                  {config.dataType === 'responses' && (
                    <>
                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={config.filters.completedOnly}
                              onChange={(e) => updateFilters('completedOnly', e.target.checked)}
                            />
                          }
                          label="完了した回答のみ"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography gutterBottom>
                          最小回答数: {config.filters.minResponses}
                        </Typography>
                        <Slider
                          value={config.filters.minResponses}
                          onChange={(e, value) => updateFilters('minResponses', value)}
                          min={0}
                          max={100}
                          valueLabelDisplay="auto"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Typography gutterBottom>
                          スコア範囲: {config.filters.scoreRange[0]} - {config.filters.scoreRange[1]}
                        </Typography>
                        <Slider
                          value={config.filters.scoreRange}
                          onChange={(e, value) => updateFilters('scoreRange', value)}
                          min={0}
                          max={100}
                          valueLabelDisplay="auto"
                          range
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>

          {/* プレビュー */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    <Preview sx={{ mr: 1, verticalAlign: 'middle' }} />
                    データプレビュー
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={generatePreview}
                    startIcon={<Preview />}
                  >
                    プレビュー生成
                  </Button>
                </Box>

                {previewData.length > 0 ? (
                  <Box sx={{ overflow: 'auto', maxHeight: 300 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          {Object.keys(previewData[0]).map((key) => (
                            <th key={key} style={{ border: '1px solid #ddd', padding: 8 }}>
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.map((row, index) => (
                          <tr key={index}>
                            {Object.values(row).map((value, cellIndex) => (
                              <td key={cellIndex} style={{ border: '1px solid #ddd', padding: 8 }}>
                                {String(value)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Box>
                ) : (
                  <Alert severity="info">
                    プレビューを生成するには「プレビュー生成」をクリックしてください
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* エクスポート履歴 */}
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6">
                  <History sx={{ mr: 1, verticalAlign: 'middle' }} />
                  エクスポート履歴
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {exportHistory.length > 0 ? (
                  <List>
                    {exportHistory.map((item) => (
                      <ListItem key={item.id}>
                        <ListItemIcon>
                          {getFormatIcon(item.format)}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.filename}
                          secondary={`${item.format.toUpperCase()} • ${item.recordCount}件 • ${new Date(item.exportedAt).toLocaleString('ja-JP')}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography color="textSecondary">
                    エクスポート履歴はありません
                  </Typography>
                )}
                
                {exportHistory.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Button
                      startIcon={<Delete />}
                      onClick={clearHistory}
                      color="error"
                      size="small"
                    >
                      履歴をクリア
                    </Button>
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid>

        {isExporting && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              エクスポート中...
            </Typography>
            <LinearProgress />
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isExporting}>
          キャンセル
        </Button>
        <Button
          onClick={executeExport}
          variant="contained"
          disabled={isExporting || config.fields.length === 0}
          startIcon={getFormatIcon(config.format)}
        >
          {isExporting ? 'エクスポート中...' : 'エクスポート実行'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DataExporter;