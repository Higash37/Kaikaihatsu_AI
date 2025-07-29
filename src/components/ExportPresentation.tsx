import {
  Slideshow,
  PictureAsPdf,
  Html,
  GetApp,
  Settings,
  Preview,
  ExpandMore,
  Palette,
  TextFields,
  Image,
} from '@mui/icons-material';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  LinearProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import React, { useState } from 'react';

import {
  generatePresentationFromAnalytics,
  convertSlidesToPDF,
  generateHTMLPresentation,
  downloadFile,
  PresentationData,
} from '@/utils/powerpoint';

interface ExportPresentationProps {
  open: boolean;
  onClose: () => void;
  quizTitle: string;
  statistics: any;
  chartElements: HTMLElement[];
}

interface ExportOptions {
  format: 'pdf' | 'html' | 'pptx';
  theme: 'default' | 'blue' | 'green' | 'dark';
  includeCharts: boolean;
  includeStatistics: boolean;
  customTitle: string;
  customSubtitle: string;
  authorName: string;
}

const ExportPresentation: React.FC<ExportPresentationProps> = ({
  open,
  onClose,
  quizTitle,
  statistics,
  chartElements,
}) => {
  const [options, setOptions] = useState<ExportOptions>({
    format: 'pdf',
    theme: 'blue',
    includeCharts: true,
    includeStatistics: true,
    customTitle: `${quizTitle} 分析レポート`,
    customSubtitle: '統計分析と洞察',
    authorName: 'SciscitorAI',
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<PresentationData | null>(null);

  const handleOptionChange = (key: keyof ExportOptions, value: any) => {
    setOptions(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const generatePreview = () => {
    try {
      const presentationData = generatePresentationFromAnalytics(
        options.customTitle,
        statistics,
        options.includeCharts ? chartElements : []
      );
      
      // カスタム設定を適用
      presentationData.title = options.customTitle;
      presentationData.subtitle = options.customSubtitle;
      presentationData.author = options.authorName;
      presentationData.theme = options.theme;

      setPreviewData(presentationData);
    } catch (error) {
      console.error('プレビュー生成エラー:', error);
      setExportError('プレビューの生成に失敗しました');
    }
  };

  const handleExport = async () => {
    if (!previewData) {
      generatePreview();
      return;
    }

    setIsExporting(true);
    setExportError(null);

    try {
      switch (options.format) {
        case 'pdf':
          const pdfBlob = await convertSlidesToPDF(previewData);
          downloadFile(pdfBlob, `${options.customTitle}.pdf`);
          break;

        case 'html':
          const htmlContent = generateHTMLPresentation(previewData);
          const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
          downloadFile(htmlBlob, `${options.customTitle}.html`);
          break;

        case 'pptx':
          // PowerPoint形式は今後実装
          setExportError('PowerPoint形式は準備中です。PDFまたはHTMLをお選びください。');
          break;

        default:
          throw new Error('未対応の形式です');
      }

      // 成功時は2秒後にダイアログを閉じる
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      console.error('エクスポートエラー:', error);
      setExportError('エクスポートに失敗しました。もう一度お試しください。');
    } finally {
      setIsExporting(false);
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf':
        return <PictureAsPdf />;
      case 'html':
        return <Html />;
      case 'pptx':
        return <Slideshow />;
      default:
        return <GetApp />;
    }
  };

  const getThemePreview = (theme: string) => {
    const themes = {
      default: { primary: '#667eea', secondary: '#764ba2' },
      blue: { primary: '#2196F3', secondary: '#1976D2' },
      green: { primary: '#4CAF50', secondary: '#2E7D32' },
      dark: { primary: '#424242', secondary: '#212121' },
    };
    
    const colors = themes[theme as keyof typeof themes] || themes.default;
    
    return (
      <Box
        sx={{
          width: 60,
          height: 40,
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
          borderRadius: 1,
          border: options.theme === theme ? '2px solid #1976d2' : '1px solid #ccc',
        }}
      />
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Slideshow color="primary" />
          プレゼンテーション エクスポート
        </Box>
      </DialogTitle>

      <DialogContent>
        {exportError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {exportError}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* 基本設定 */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Settings sx={{ mr: 1, verticalAlign: 'middle' }} />
                  基本設定
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="タイトル"
                    value={options.customTitle}
                    onChange={(e) => handleOptionChange('customTitle', e.target.value)}
                    fullWidth
                  />

                  <TextField
                    label="サブタイトル"
                    value={options.customSubtitle}
                    onChange={(e) => handleOptionChange('customSubtitle', e.target.value)}
                    fullWidth
                  />

                  <TextField
                    label="作成者"
                    value={options.authorName}
                    onChange={(e) => handleOptionChange('authorName', e.target.value)}
                    fullWidth
                  />

                  <FormControl fullWidth>
                    <InputLabel>エクスポート形式</InputLabel>
                    <Select
                      value={options.format}
                      label="エクスポート形式"
                      onChange={(e) => handleOptionChange('format', e.target.value)}
                    >
                      <MenuItem value="pdf">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PictureAsPdf />
                          PDF (推奨)
                        </Box>
                      </MenuItem>
                      <MenuItem value="html">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Html />
                          HTML (インタラクティブ)
                        </Box>
                      </MenuItem>
                      <MenuItem value="pptx" disabled>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Slideshow />
                          PowerPoint (準備中)
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* テーマ設定 */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Palette sx={{ mr: 1, verticalAlign: 'middle' }} />
                  デザイン設定
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    テーマ選択
                  </Typography>
                  <Grid container spacing={1}>
                    {['default', 'blue', 'green', 'dark'].map((theme) => (
                      <Grid item key={theme}>
                        <Box
                          sx={{ cursor: 'pointer', textAlign: 'center' }}
                          onClick={() => handleOptionChange('theme', theme)}
                        >
                          {getThemePreview(theme)}
                          <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                            {theme === 'default' ? 'デフォルト' : 
                             theme === 'blue' ? 'ブルー' : 
                             theme === 'green' ? 'グリーン' : 'ダーク'}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="subtitle2">
                    含める内容
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Chip
                      label="グラフ・チャート"
                      color={options.includeCharts ? 'primary' : 'default'}
                      onClick={() => handleOptionChange('includeCharts', !options.includeCharts)}
                      icon={<Image />}
                    />
                    <Chip
                      label="統計データ"
                      color={options.includeStatistics ? 'primary' : 'default'}
                      onClick={() => handleOptionChange('includeStatistics', !options.includeStatistics)}
                      icon={<TextFields />}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* プレビュー */}
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6">
                  <Preview sx={{ mr: 1, verticalAlign: 'middle' }} />
                  プレビュー
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {previewData ? (
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      {previewData.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      {previewData.subtitle} • {previewData.slides.length} スライド
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2">スライド構成:</Typography>
                      {previewData.slides.map((slide, index) => (
                        <Chip
                          key={index}
                          label={`${index + 1}: ${slide.title}`}
                          size="small"
                          sx={{ m: 0.5 }}
                        />
                      ))}
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={generatePreview}
                      startIcon={<Preview />}
                    >
                      プレビューを生成
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
          onClick={handleExport}
          variant="contained"
          disabled={isExporting}
          startIcon={getFormatIcon(options.format)}
        >
          {isExporting ? 'エクスポート中...' : `${options.format.toUpperCase()}で出力`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportPresentation;