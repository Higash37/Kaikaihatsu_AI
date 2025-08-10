import {
  Dashboard,
  TrendingUp,
  TrendingDown,
  People,
  Quiz,
  Refresh,
  Settings,
  Timeline,
  Assessment,
  Speed,
  Favorite,
  Share,
  PieChart,
  ShowChart,
  InsertChart,
} from '@mui/icons-material';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  LinearProgress,
  IconButton,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  Tooltip,
  Badge,
  Switch,
  FormControlLabel,
} from '@mui/material';
import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
} from 'recharts';

import NotificationCenter from '../../shared/NotificationCenter';

import { useAuth } from '@/contexts/AuthContext';
import {
  getUserStats,
  getQuizzes,
  getQuizDetailedStats,
} from '@/utils/supabase';
import { getSafeDisplayName } from '@/utils/user-display';

interface DashboardStats {
  quizzesCreated: number;
  quizzesTaken: number;
  totalScore: number;
  averageScore: number;
  followers: number;
  following: number;
  likes: number;
}

interface QuizOverview {
  id: string;
  title: string;
  totalResponses: number;
  averageScore: number;
  completionRate: number;
  trend: 'up' | 'down' | 'stable';
  recentActivity: number;
}

interface ActivityData {
  date: string;
  quizzes: number;
  responses: number;
  views: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AdvancedDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentQuizzes, setRecentQuizzes] = useState<QuizOverview[]>([]);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [settingsAnchor, setSettingsAnchor] = useState<null | HTMLElement>(null);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);

  const loadDashboardData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // 並列でデータを取得
      const [userStats, userQuizzes] = await Promise.all([
        getUserStats(user.id),
        getQuizzes(user.id),
      ]);

      setStats(userStats);

      // クイズの概要データを生成
      const quizOverviews: QuizOverview[] = [];
      for (const quiz of userQuizzes.slice(0, 5)) {
        try {
          const quizStats = await getQuizDetailedStats(quiz.id);
          quizOverviews.push({
            id: quiz.id,
            title: quiz.title,
            totalResponses: quizStats.totalResponses,
            averageScore: quizStats.averageScore,
            completionRate: quizStats.completionRate,
            trend: Math.random() > 0.5 ? 'up' : 'down', // サンプルトレンド
            recentActivity: Math.floor(Math.random() * 20) + 1,
          });
        } catch (error) {
          console.error('Quiz stats error:', error);
        }
      }
      setRecentQuizzes(quizOverviews);

      // アクティビティデータ（サンプル）
      const activities: ActivityData[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        activities.push({
          date: date.toISOString().split('T')[0],
          quizzes: Math.floor(Math.random() * 5),
          responses: Math.floor(Math.random() * 50) + 10,
          views: Math.floor(Math.random() * 100) + 20,
        });
      }
      setActivityData(activities);

    } catch (error) {
      console.error('Dashboard data loading error:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user, loadDashboardData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleSettingsClick = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsAnchor(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setSettingsAnchor(null);
  };

  const getStatCard = (
    title: string,
    value: number | string,
    icon: React.ReactNode,
    trend?: number,
    color?: string
  ) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Typography>
            {trend !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {trend > 0 ? (
                  <TrendingUp color="success" fontSize="small" />
                ) : (
                  <TrendingDown color="error" fontSize="small" />
                )}
                <Typography
                  variant="body2"
                  color={trend > 0 ? 'success.main' : 'error.main'}
                  sx={{ ml: 0.5 }}
                >
                  {Math.abs(trend)}%
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar sx={{ bgcolor: color || 'primary.main', width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          ダッシュボード
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          <Dashboard sx={{ mr: 1, verticalAlign: 'middle' }} />
          ダッシュボード
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NotificationCenter />
          <Tooltip title="更新">
            <IconButton onClick={handleRefresh} disabled={refreshing}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <IconButton onClick={handleSettingsClick}>
            <Settings />
          </IconButton>
        </Box>
      </Box>

      {/* ウェルカムメッセージ */}
      <Alert severity="info" sx={{ mb: 3 }}>
        こんにちは、{getSafeDisplayName(profile?.username)}さん！
        今日も分析とクイズ作成を楽しみましょう 🎯
      </Alert>

      {/* 統計カード */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          {getStatCard(
            '作成クイズ数',
            stats?.quizzesCreated || 0,
            <Quiz />,
            12,
            '#1976d2'
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {getStatCard(
            '回答クイズ数',
            stats?.quizzesTaken || 0,
            <Assessment />,
            8,
            '#388e3c'
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {getStatCard(
            'フォロワー',
            stats?.followers || 0,
            <People />,
            15,
            '#f57c00'
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {getStatCard(
            '獲得いいね',
            stats?.likes || 0,
            <Favorite />,
            23,
            '#d32f2f'
          )}
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* アクティビティチャート */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  <Timeline sx={{ mr: 1, verticalAlign: 'middle' }} />
                  週間アクティビティ
                </Typography>
                <Chip label="過去7日" size="small" />
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <RechartsTooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString('ja-JP')}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="responses" stackId="1" stroke="#8884d8" fill="#8884d8" name="回答数" />
                  <Area type="monotone" dataKey="views" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="閲覧数" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* 最近のクイズ */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Speed sx={{ mr: 1, verticalAlign: 'middle' }} />
                クイズパフォーマンス
              </Typography>
              <List>
                {recentQuizzes.slice(0, 4).map((quiz, index) => (
                  <React.Fragment key={quiz.id}>
                    <ListItem>
                      <ListItemIcon>
                        <Badge badgeContent={quiz.recentActivity} color="secondary">
                          <Quiz />
                        </Badge>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" noWrap>
                            {quiz.title}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption" color="textSecondary">
                              {quiz.totalResponses}回答
                            </Typography>
                            {quiz.trend === 'up' ? (
                              <TrendingUp color="success" fontSize="small" />
                            ) : (
                              <TrendingDown color="error" fontSize="small" />
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < recentQuizzes.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* スコア分布 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <PieChart sx={{ mr: 1, verticalAlign: 'middle' }} />
                スコア分布
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPieChart>
                  <Pie
                    data={[
                      { name: '90-100点', value: 15, fill: COLORS[0] },
                      { name: '80-89点', value: 25, fill: COLORS[1] },
                      { name: '70-79点', value: 30, fill: COLORS[2] },
                      { name: '60-69点', value: 20, fill: COLORS[3] },
                      { name: '60点未満', value: 10, fill: COLORS[4] },
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* 月別トレンド */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <ShowChart sx={{ mr: 1, verticalAlign: 'middle' }} />
                平均スコアトレンド
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart
                  data={[
                    { month: '1月', score: 72 },
                    { month: '2月', score: 75 },
                    { month: '3月', score: 78 },
                    { month: '4月', score: 82 },
                    { month: '5月', score: 85 },
                    { month: '6月', score: 88 },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[60, 100]} />
                  <RechartsTooltip />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#8884d8" 
                    strokeWidth={3}
                    dot={{ fill: '#8884d8', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* クイックアクション */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                クイックアクション
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Button variant="contained" startIcon={<Quiz />}>
                  新しいクイズを作成
                </Button>
                <Button variant="outlined" startIcon={<Assessment />}>
                  詳細分析を見る
                </Button>
                <Button variant="outlined" startIcon={<Share />}>
                  レポートを共有
                </Button>
                <Button variant="outlined" startIcon={<InsertChart />}>
                  プレゼン作成
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 設定メニュー */}
      <Menu
        anchorEl={settingsAnchor}
        open={Boolean(settingsAnchor)}
        onClose={handleSettingsClose}
      >
        <MenuItem>
          <FormControlLabel
            control={
              <Switch
                checked={realTimeUpdates}
                onChange={(e) => setRealTimeUpdates(e.target.checked)}
              />
            }
            label="リアルタイム更新"
          />
        </MenuItem>
        <MenuItem onClick={handleSettingsClose}>
          <Settings sx={{ mr: 1 }} />
          設定
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default AdvancedDashboard;