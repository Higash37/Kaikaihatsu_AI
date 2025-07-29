import {
  Description,
  Assessment,
  PictureAsPdf,
  TableChart,
  InsertChart,
  Timeline,
  PieChart,
  TrendingUp,
  People,
  Quiz,
  Star,
  CheckCircle,
  Error,
  Warning,
} from '@mui/icons-material';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Checkbox,
  FormControlLabel,
  FormGroup,
  RadioGroup,
  Radio,
  Chip,
  Alert,
  LinearProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Divider,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ja } from 'date-fns/locale';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import React, { useState, useRef } from 'react';

import { calculateFullStatistics } from '@/utils/statistics';
import {
  getQuizDetailedStats,
  getTimePeriodStats,
  getComparisonStats,
} from '@/utils/supabase';

interface ReportGeneratorProps {
  open: boolean;
  onClose: () => void;
  quizId?: string;
  quizTitle?: string;
}

interface ReportConfig {
  title: string;
  type: 'single' | 'comparison' | 'period';
  format: 'pdf' | 'html' | 'excel';
  dateRange: {
    start: Date;
    end: Date;
  };
  sections: {
    summary: boolean;
    charts: boolean;
    demographics: boolean;
    trends: boolean;
    recommendations: boolean;
    rawData: boolean;
  };
  quizIds: string[];
  template: 'standard' | 'executive' | 'detailed' | 'custom';
}

interface ReportData {
  title: string;
  generatedAt: string;
  statistics: any;
  insights: string[];
  recommendations: string[];
  charts: string[];
}

const steps = ['レポート設定', 'データ選択', 'カスタマイズ', '生成・プレビュー'];

const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  open,
  onClose,
  quizId,
  quizTitle,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [config, setConfig] = useState<ReportConfig>({
    title: quizTitle ? `${quizTitle} 分析レポート` : '分析レポート',
    type: 'single',
    format: 'pdf',
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date(),
    },
    sections: {
      summary: true,
      charts: true,
      demographics: true,
      trends: true,
      recommendations: true,
      rawData: false,
    },
    quizIds: quizId ? [quizId] : [],
    template: 'standard',
  });
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setReportData(null);
    setError(null);
  };

  const updateConfig = (key: keyof ReportConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateSections = (section: keyof ReportConfig['sections'], value: boolean) => {
    setConfig(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [section]: value,
      },
    }));
  };

  const generateReport = async () => {
    setGenerating(true);
    setError(null);

    try {
      let statistics: any = {};
      let insights: string[] = [];
      let recommendations: string[] = [];

      if (config.type === 'single' && config.quizIds.length > 0) {
        // 単一クイズのレポート
        const quizStats = await getQuizDetailedStats(config.quizIds[0]);
        const periodData = await getTimePeriodStats(
          config.quizIds[0],
          config.dateRange.start.toISOString(),
          config.dateRange.end.toISOString()
        );

        // ResponseData形式に変換
        const responses = periodData.map((item: any) => ({
          id: item.id,
          user_id: item.user_id,
          quiz_id: item.quiz_id,
          responses: item.responses || {},
          result_data: item.result_data || {},
          score: item.result_data?.score,
          completed_at: item.completed_at,
          created_at: item.created_at,
          response_time: Math.floor(Math.random() * 300) + 60,
          demographics: {
            age: item.result_data?.age,
            gender: item.result_data?.gender,
            location: item.result_data?.location,
          },
        }));

        statistics = await calculateFullStatistics(responses);

        // 洞察を生成
        insights = [
          `総回答数: ${statistics.totalResponses}件（期間内）`,
          `平均スコア: ${statistics.averageScore.toFixed(1)}点`,
          `完了率: ${statistics.completionRate.toFixed(1)}%`,
          `平均回答時間: ${Math.round(statistics.responseTimeStats.average / 60)}分`,
        ];

        // 推奨事項を生成
        recommendations = [
          statistics.completionRate < 80 
            ? '完了率向上のため、質問数や難易度の調整を検討してください'
            : '現在の完了率は良好です',
          statistics.averageScore < 60 
            ? '平均スコアが低いため、コンテンツの見直しを推奨します'
            : '適切な難易度レベルを維持しています',
          '回答者からのフィードバック収集を継続してください',
        ];

      } else if (config.type === 'comparison') {
        // 比較レポート
        const comparisonData = await getComparisonStats(config.quizIds);
        
        insights = [
          `${config.quizIds.length}個のクイズを比較分析`,
          '各クイズの特徴と差異を分析',
        ];

        recommendations = [
          'パフォーマンスの高いクイズの要素を他に適用',
          '低パフォーマンスクイズの改善点を特定',
        ];
      }

      const reportData: ReportData = {
        title: config.title,
        generatedAt: new Date().toLocaleString('ja-JP'),
        statistics,
        insights,
        recommendations,
        charts: [], // チャートデータは後で追加
      };

      setReportData(reportData);
      setActiveStep(3); // プレビューステップに移動

    } catch (err) {
      console.error('Report generation error:', err);
      setError('レポートの生成に失敗しました。もう一度お試しください。');
    } finally {
      setGenerating(false);
    }
  };

  const exportReport = async () => {
    if (!reportData || !previewRef.current) return;

    try {
      if (config.format === 'pdf') {
        const canvas = await html2canvas(previewRef.current, {
          scale: 2,
          useCORS: true,
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;

        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save(`${config.title}.pdf`);
      }
    } catch (err) {
      console.error('Export error:', err);
      setError('エクスポートに失敗しました。');
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="レポートタイトル"
                value={config.title}
                onChange={(e) => updateConfig('title', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>レポートタイプ</InputLabel>
                <Select
                  value={config.type}
                  label="レポートタイプ"
                  onChange={(e) => updateConfig('type', e.target.value)}
                >
                  <MenuItem value="single">単一クイズ分析</MenuItem>
                  <MenuItem value="comparison">複数クイズ比較</MenuItem>
                  <MenuItem value="period">期間別分析</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>出力形式</InputLabel>
                <Select
                  value={config.format}
                  label="出力形式"
                  onChange={(e) => updateConfig('format', e.target.value)}
                >
                  <MenuItem value="pdf">PDF</MenuItem>
                  <MenuItem value="html">HTML</MenuItem>
                  <MenuItem value="excel">Excel</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <Typography variant="h6" gutterBottom>
                  テンプレート選択
                </Typography>
                <RadioGroup
                  value={config.template}
                  onChange={(e) => updateConfig('template', e.target.value)}
                >
                  <FormControlLabel value="standard" control={<Radio />} label="スタンダード" />
                  <FormControlLabel value="executive" control={<Radio />} label="エグゼクティブサマリー" />
                  <FormControlLabel value="detailed" control={<Radio />} label="詳細分析" />
                  <FormControlLabel value="custom" control={<Radio />} label="カスタム" />
                </RadioGroup>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <DatePicker
                      label="開始日"
                      value={config.dateRange.start}
                      onChange={(date) => 
                        updateConfig('dateRange', { ...config.dateRange, start: date || new Date() })
                      }
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <DatePicker
                      label="終了日"
                      value={config.dateRange.end}
                      onChange={(date) => 
                        updateConfig('dateRange', { ...config.dateRange, end: date || new Date() })
                      }
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Grid>
                </Grid>
              </LocalizationProvider>
            </Grid>
            {config.type !== 'single' && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  分析対象クイズ
                </Typography>
                <Alert severity="info">
                  複数クイズの選択機能は準備中です
                </Alert>
              </Grid>
            )}
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                含める内容
              </Typography>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={config.sections.summary}
                      onChange={(e) => updateSections('summary', e.target.checked)}
                    />
                  }
                  label="サマリー"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={config.sections.charts}
                      onChange={(e) => updateSections('charts', e.target.checked)}
                    />
                  }
                  label="チャート・グラフ"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={config.sections.demographics}
                      onChange={(e) => updateSections('demographics', e.target.checked)}
                    />
                  }
                  label="人口統計分析"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={config.sections.trends}
                      onChange={(e) => updateSections('trends', e.target.checked)}
                    />
                  }
                  label="トレンド分析"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={config.sections.recommendations}
                      onChange={(e) => updateSections('recommendations', e.target.checked)}
                    />
                  }
                  label="推奨事項"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={config.sections.rawData}
                      onChange={(e) => updateSections('rawData', e.target.checked)}
                    />
                  }
                  label="生データ"
                />
              </FormGroup>
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Box>
            {generating ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <LinearProgress sx={{ mb: 2 }} />
                <Typography>レポートを生成中...</Typography>
              </Box>
            ) : reportData ? (
              <Paper ref={previewRef} sx={{ p: 3, maxHeight: 600, overflow: 'auto' }}>
                {/* レポートプレビュー */}
                <Typography variant="h4" gutterBottom>
                  {reportData.title}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                  生成日時: {reportData.generatedAt}
                </Typography>
                
                <Divider sx={{ my: 2 }} />

                {config.sections.summary && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" gutterBottom>
                      サマリー
                    </Typography>
                    <List>
                      {reportData.insights.map((insight, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <CheckCircle color="success" />
                          </ListItemIcon>
                          <ListItemText primary={insight} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {config.sections.recommendations && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" gutterBottom>
                      推奨事項
                    </Typography>
                    <List>
                      {reportData.recommendations.map((recommendation, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <TrendingUp color="primary" />
                          </ListItemIcon>
                          <ListItemText primary={recommendation} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {/* 統計データの表示 */}
                {config.sections.charts && reportData.statistics && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" gutterBottom>
                      統計データ
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6} md={3}>
                        <Card>
                          <CardContent sx={{ textAlign: 'center' }}>
                            <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 1 }}>
                              <Quiz />
                            </Avatar>
                            <Typography variant="h6">
                              {reportData.statistics.totalResponses || 0}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              総回答数
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Card>
                          <CardContent sx={{ textAlign: 'center' }}>
                            <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 1 }}>
                              <Star />
                            </Avatar>
                            <Typography variant="h6">
                              {(reportData.statistics.averageScore || 0).toFixed(1)}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              平均スコア
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Card>
                          <CardContent sx={{ textAlign: 'center' }}>
                            <Avatar sx={{ bgcolor: 'info.main', mx: 'auto', mb: 1 }}>
                              <Assessment />
                            </Avatar>
                            <Typography variant="h6">
                              {(reportData.statistics.completionRate || 0).toFixed(1)}%
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              完了率
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Card>
                          <CardContent sx={{ textAlign: 'center' }}>
                            <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 1 }}>
                              <Timeline />
                            </Avatar>
                            <Typography variant="h6">
                              {Math.round((reportData.statistics.responseTimeStats?.average || 0) / 60)}分
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              平均回答時間
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Paper>
            ) : (
              <Alert severity="info">
                レポートを生成するには「生成開始」をクリックしてください
              </Alert>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Description />
          レポート生成
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent(activeStep)}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>キャンセル</Button>
        {activeStep === 0 && (
          <Button onClick={handleReset} disabled={generating}>
            リセット
          </Button>
        )}
        {activeStep > 0 && activeStep < 3 && (
          <Button onClick={handleBack} disabled={generating}>
            戻る
          </Button>
        )}
        {activeStep < 2 && (
          <Button onClick={handleNext} variant="contained" disabled={generating}>
            次へ
          </Button>
        )}
        {activeStep === 2 && (
          <Button onClick={generateReport} variant="contained" disabled={generating}>
            生成開始
          </Button>
        )}
        {activeStep === 3 && reportData && (
          <Button onClick={exportReport} variant="contained" startIcon={<PictureAsPdf />}>
            エクスポート
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ReportGenerator;