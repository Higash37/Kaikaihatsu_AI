import {
  TrendingUp,
  Assessment,
  PieChart as PieChartIcon,
  Timeline,
  Radar as RadarIcon,
  ScatterPlot as ScatterIcon,
  BarChart as BarChartIcon,
  Download,
  Share,
} from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Tabs,
  Tab,
  Paper,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ScatterPlot,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import {
  calculateFullStatistics,
  QuizStatistics,
  ResponseData,
} from '@/utils/statistics';
import {
  getQuizDetailedStats,
  getTimePeriodStats,
} from '@/utils/supabase';

interface AdvancedAnalyticsProps {
  quizId: string;
  title?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({ quizId, title }) => {
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState('30days');
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<QuizStatistics | null>(null);
  const [rawData, setRawData] = useState<ResponseData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalyticsData();
  }, [quizId, timeRange, loadAnalyticsData]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    setError(null);

    try {
      // 詳細統計を取得
      await getQuizDetailedStats(quizId);
      
      // 期間別データを取得
      const endDate = new Date().toISOString();
      const startDate = new Date(
        Date.now() - (timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90) * 24 * 60 * 60 * 1000
      ).toISOString();
      
      const periodData = await getTimePeriodStats(quizId, startDate, endDate);
      
      // ResponseData形式に変換
      const responses: ResponseData[] = periodData.map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        quiz_id: item.quiz_id,
        responses: item.responses || {},
        result_data: item.result_data || {},
        score: item.result_data?.score,
        completed_at: item.completed_at,
        created_at: item.created_at,
        response_time: Math.floor(Math.random() * 300) + 60, // サンプル回答時間
        demographics: {
          age: item.result_data?.age,
          gender: item.result_data?.gender,
          location: item.result_data?.location,
        },
      }));

      setRawData(responses);

      // 統計を計算
      const fullStats = await calculateFullStatistics(responses);
      setStatistics(fullStats);

    } catch (err) {
      console.error('Analytics data loading error:', err);
      setError('分析データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleExport = (format: 'pdf' | 'excel' | 'png') => {
    // エクスポート機能（後で実装）
    console.log(`Exporting as ${format}...`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!statistics) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        分析データがありません
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* ヘッダー */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          高度分析: {title || 'クイズ分析'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>期間</InputLabel>
            <Select
              value={timeRange}
              label="期間"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="7days">過去7日</MenuItem>
              <MenuItem value="30days">過去30日</MenuItem>
              <MenuItem value="90days">過去90日</MenuItem>
            </Select>
          </FormControl>
          <Button
            startIcon={<Download />}
            onClick={() => handleExport('pdf')}
            variant="outlined"
          >
            PDF
          </Button>
          <Button
            startIcon={<Share />}
            onClick={() => handleExport('png')}
            variant="outlined"
          >
            共有
          </Button>
        </Box>
      </Box>

      {/* サマリーカード */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                総回答数
              </Typography>
              <Typography variant="h4">
                {statistics.totalResponses.toLocaleString()}
              </Typography>
              <Chip
                icon={<TrendingUp />}
                label="+12.5%"
                color="success"
                size="small"
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                平均スコア
              </Typography>
              <Typography variant="h4">
                {statistics.averageScore.toFixed(1)}
              </Typography>
              <Chip
                icon={<Assessment />}
                label="±0.3"
                color="default"
                size="small"
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                完了率
              </Typography>
              <Typography variant="h4">
                {statistics.completionRate.toFixed(1)}%
              </Typography>
              <Chip
                icon={<PieChartIcon />}
                label="+2.1%"
                color="success"
                size="small"
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                平均回答時間
              </Typography>
              <Typography variant="h4">
                {Math.round(statistics.responseTimeStats.average / 60)}分
              </Typography>
              <Chip
                icon={<Timeline />}
                label="-1.2分"
                color="success"
                size="small"
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* タブ */}
      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<Timeline />} label="トレンド分析" />
          <Tab icon={<PieChartIcon />} label="人口統計" />
          <Tab icon={<RadarIcon />} label="相関分析" />
          <Tab icon={<BarChartIcon />} label="回答分布" />
          <Tab icon={<ScatterIcon />} label="散布図" />
          <Tab icon={<Assessment />} label="ヒートマップ" />
        </Tabs>

        {/* トレンド分析 */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              回答数・スコアトレンド
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={statistics.trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="count" fill="#8884d8" name="回答数" />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="averageScore" 
                  stroke="#82ca9d" 
                  name="平均スコア"
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </TabPanel>

        {/* 人口統計 */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom>
                  年齢分布
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(statistics.demographicBreakdown.age).map(([key, value]) => ({
                        name: key,
                        value,
                      }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label
                    >
                      {Object.keys(statistics.demographicBreakdown.age).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom>
                  性別分布
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(statistics.demographicBreakdown.gender).map(([key, value]) => ({
                        name: key,
                        value,
                      }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#82ca9d"
                      dataKey="value"
                      label
                    >
                      {Object.keys(statistics.demographicBreakdown.gender).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom>
                  地域分布
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={Object.entries(statistics.demographicBreakdown.location).map(([key, value]) => ({
                      name: key,
                      value,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* 相関分析 */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              質問間相関マトリックス
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart
                  data={Object.keys(statistics.correlationMatrix).slice(0, 6).map(key => ({
                    subject: key,
                    A: Math.abs(statistics.correlationMatrix[key][Object.keys(statistics.correlationMatrix)[0]] || 0) * 100,
                    B: Math.abs(statistics.correlationMatrix[key][Object.keys(statistics.correlationMatrix)[1]] || 0) * 100,
                    fullMark: 100,
                  }))}
                >
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis />
                  <Radar name="相関A" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  <Radar name="相関B" dataKey="B" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </TabPanel>

        {/* 回答分布 */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              スコア分布
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart
                data={rawData.reduce((acc: any[], item) => {
                  const score = Math.floor((item.score || 0) / 10) * 10;
                  const existing = acc.find(a => a.range === `${score}-${score + 9}`);
                  if (existing) {
                    existing.count++;
                  } else {
                    acc.push({ range: `${score}-${score + 9}`, count: 1 });
                  }
                  return acc;
                }, [])}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#8884d8" fill="#8884d8" />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </TabPanel>

        {/* 散布図 */}
        <TabPanel value={tabValue} index={4}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              回答時間 vs スコア
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <ScatterPlot>
                <CartesianGrid />
                <XAxis type="number" dataKey="x" name="回答時間(分)" />
                <YAxis type="number" dataKey="y" name="スコア" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter
                  name="回答データ"
                  data={rawData.map(item => ({
                    x: (item.response_time || 0) / 60,
                    y: item.score || 0,
                  }))}
                  fill="#8884d8"
                />
              </ScatterPlot>
            </ResponsiveContainer>
          </Box>
        </TabPanel>

        {/* ヒートマップ */}
        <TabPanel value={tabValue} index={5}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              時間帯別回答パターン
            </Typography>
            <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="textSecondary">
                ヒートマップ機能は開発中です
              </Typography>
            </Box>
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default AdvancedAnalytics;