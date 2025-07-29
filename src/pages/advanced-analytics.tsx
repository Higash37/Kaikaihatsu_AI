import {
  Analytics,
  Dashboard,
  Assessment,
  Slideshow,
  GetApp,
  Description,
  Notifications,
  Menu as MenuIcon,
  Home,
  ArrowBack,
  Share,
  Favorite,
  TrendingUp,
  PieChart,
  Timeline,
  BarChart,
} from '@mui/icons-material';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Alert,
  Breadcrumbs,
  Link,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  AppBar,
  Toolbar,
} from '@mui/material';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState, useEffect, useRef } from 'react';

import AdvancedAnalytics from '@/components/AdvancedAnalytics';
import AdvancedDashboard from '@/components/AdvancedDashboard';
import DataExporter from '@/components/DataExporter';
import ExportPresentation from '@/components/ExportPresentation';
import NotificationCenter from '@/components/NotificationCenter';
import ReportGenerator from '@/components/ReportGenerator';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { getSafeDisplayName } from '@/utils/userDisplay';
import { getQuiz } from '@/utils/supabase';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const AdvancedAnalyticsPage: NextPage = () => {
  const router = useRouter();
  const { user, profile } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { quizId } = router.query;
  const [tabValue, setTabValue] = useState(0);
  const [quiz, setQuiz] = useState<any>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [showExportPresentation, setShowExportPresentation] = useState(false);
  const [showReportGenerator, setShowReportGenerator] = useState(false);
  const [showDataExporter, setShowDataExporter] = useState(false);
  const [chartElements, setChartElements] = useState<HTMLElement[]>([]);
  
  const analyticsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }

    if (quizId && typeof quizId === 'string') {
      loadQuizData(quizId);
    }
  }, [user, quizId]);

  useEffect(() => {
    // チャート要素を収集（エクスポート用）
    const timer = setTimeout(() => {
      if (analyticsRef.current) {
        const charts = analyticsRef.current.querySelectorAll('[data-chart]');
        setChartElements(Array.from(charts) as HTMLElement[]);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [tabValue]);

  const loadQuizData = async (id: string) => {
    try {
      const quizData = await getQuiz(id);
      setQuiz(quizData);
    } catch (error) {
      console.error('Quiz loading error:', error);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setMobileDrawerOpen(false);
  };

  const handleSpeedDialAction = (action: string) => {
    switch (action) {
      case 'export-presentation':
        setShowExportPresentation(true);
        break;
      case 'generate-report':
        setShowReportGenerator(true);
        break;
      case 'export-data':
        setShowDataExporter(true);
        break;
      case 'share':
        if (navigator.share) {
          navigator.share({
            title: `${quiz?.title || 'クイズ'} 分析`,
            text: '詳細な分析結果をご覧ください',
            url: window.location.href,
          });
        }
        break;
    }
  };

  const speedDialActions = [
    { icon: <Slideshow />, name: 'プレゼン作成', action: 'export-presentation' },
    { icon: <Description />, name: 'レポート生成', action: 'generate-report' },
    { icon: <GetApp />, name: 'データエクスポート', action: 'export-data' },
    { icon: <Share />, name: '共有', action: 'share' },
  ];

  const navigationItems = [
    { icon: <Dashboard />, label: 'ダッシュボード', value: 0 },
    { icon: <Analytics />, label: '高度分析', value: 1 },
    { icon: <TrendingUp />, label: 'トレンド', value: 2 },
    { icon: <PieChart />, label: '人口統計', value: 3 },
    { icon: <BarChart />, label: '比較分析', value: 4 },
  ];

  const renderMobileNavigation = () => (
    <Drawer
      anchor="left"
      open={mobileDrawerOpen}
      onClose={() => setMobileDrawerOpen(false)}
      PaperProps={{
        sx: { width: 280 }
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          分析メニュー
        </Typography>
      </Box>
      <List>
        {navigationItems.map((item) => (
          <ListItem
            button
            key={item.value}
            onClick={() => handleTabChange({} as any, item.value)}
            selected={tabValue === item.value}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          ログインが必要です。
        </Alert>
      </Container>
    );
  }

  return (
    <>
      <Head>
        <title>高度分析 - SciscitorAI</title>
        <meta name="description" content="高度な分析機能とレポート生成" />
      </Head>

      {/* モバイル用ヘッダー */}
      {isMobile && (
        <AppBar position="sticky">
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setMobileDrawerOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              高度分析
            </Typography>
            <NotificationCenter />
          </Toolbar>
        </AppBar>
      )}

      <Container maxWidth="xl" sx={{ py: 2 }}>
        {/* パンくずリスト */}
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link
            underline="hover"
            color="inherit"
            onClick={() => router.push('/')}
            sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <Home sx={{ mr: 0.5, fontSize: 'inherit' }} />
            ホーム
          </Link>
          {quiz && (
            <Link
              underline="hover"
              color="inherit"
              onClick={() => router.push('/analytics')}
              sx={{ cursor: 'pointer' }}
            >
              分析
            </Link>
          )}
          <Typography color="text.primary">
            {quiz ? `${quiz.title} - 高度分析` : '高度分析'}
          </Typography>
        </Breadcrumbs>

        {/* ヘッダー */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              <Analytics sx={{ mr: 1, verticalAlign: 'middle' }} />
              {quiz ? `${quiz.title} - 高度分析` : '高度分析'}
            </Typography>
            {quiz && (
              <Typography variant="subtitle1" color="textSecondary">
                作成者: {getSafeDisplayName(profile?.username)} • 最終更新: {new Date().toLocaleDateString('ja-JP')}
              </Typography>
            )}
          </Box>
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <NotificationCenter />
              <IconButton onClick={() => router.back()}>
                <ArrowBack />
              </IconButton>
            </Box>
          )}
        </Box>

        {/* タブナビゲーション */}
        <Paper sx={{ mb: 3 }}>
          {!isMobile ? (
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab icon={<Dashboard />} label="ダッシュボード" />
              <Tab icon={<Analytics />} label="高度分析" />
              <Tab icon={<TrendingUp />} label="トレンド分析" />
              <Tab icon={<PieChart />} label="人口統計" />
              <Tab icon={<BarChart />} label="比較分析" />
            </Tabs>
          ) : (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">
                {navigationItems.find(item => item.value === tabValue)?.label}
              </Typography>
            </Box>
          )}
        </Paper>

        {/* タブコンテンツ */}
        <Box ref={analyticsRef}>
          <TabPanel value={tabValue} index={0}>
            <AdvancedDashboard />
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            {quizId && typeof quizId === 'string' ? (
              <AdvancedAnalytics 
                quizId={quizId} 
                title={quiz?.title}
              />
            ) : (
              <Alert severity="info">
                クイズを選択して詳細分析を開始してください
              </Alert>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Timeline sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                トレンド分析
              </Typography>
              <Typography variant="body1" color="textSecondary">
                時系列データの詳細なトレンド分析機能は準備中です
              </Typography>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <PieChart sx={{ fontSize: 64, color: 'secondary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                人口統計分析
              </Typography>
              <Typography variant="body1" color="textSecondary">
                詳細な人口統計学的分析機能は準備中です
              </Typography>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <BarChart sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                比較分析
              </Typography>
              <Typography variant="body1" color="textSecondary">
                複数クイズの比較分析機能は準備中です
              </Typography>
            </Box>
          </TabPanel>
        </Box>

        {/* スピードダイアル */}
        <SpeedDial
          ariaLabel="分析アクション"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          icon={<SpeedDialIcon />}
        >
          {speedDialActions.map((action) => (
            <SpeedDialAction
              key={action.action}
              icon={action.icon}
              tooltipTitle={action.name}
              onClick={() => handleSpeedDialAction(action.action)}
            />
          ))}
        </SpeedDial>

        {/* モバイル用ナビゲーション */}
        {renderMobileNavigation()}

        {/* ダイアログ */}
        <ExportPresentation
          open={showExportPresentation}
          onClose={() => setShowExportPresentation(false)}
          quizTitle={quiz?.title || 'クイズ'}
          statistics={null} // 実際の統計データを渡す
          chartElements={chartElements}
        />

        <ReportGenerator
          open={showReportGenerator}
          onClose={() => setShowReportGenerator(false)}
          quizId={typeof quizId === 'string' ? quizId : undefined}
          quizTitle={quiz?.title}
        />

        <DataExporter
          open={showDataExporter}
          onClose={() => setShowDataExporter(false)}
          userId={user?.id}
          quizId={typeof quizId === 'string' ? quizId : undefined}
        />
      </Container>

      {/* パフォーマンス向上のためのプリロード */}
      <style>{`
        .recharts-wrapper {
          font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
        }
        .recharts-cartesian-axis-tick-value {
          font-size: 12px;
        }
        .recharts-legend-wrapper {
          font-size: 14px;
        }
      `}</style>
    </>
  );
};

export default AdvancedAnalyticsPage;