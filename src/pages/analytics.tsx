import { Map, TrendingUp } from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import React, { useState, useEffect, useCallback } from "react";

import Header from "@/components/Header";
import Layout from "@/components/Layout";
import { QuizAnalytics } from "@/types/quiz";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function QuizAnalyticsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [analytics, setAnalytics] = useState<QuizAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState(0);

  const loadAnalytics = useCallback(async () => {
    try {
      const response = await fetch(`/api/quiz/analytics?id=${id}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error("分析データの読み込みエラー:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadAnalytics();
    }
  }, [id, loadAnalytics]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const renderDemographicChart = (
    title: string,
    data: Record<string, number>
  ) => {
    const total = Object.values(data).reduce((sum, count) => sum + count, 0);

    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {title}
          </Typography>
          {Object.entries(data).map(([key, count]) => {
            const percentage = total > 0 ? (count / total) * 100 : 0;
            return (
              <Box key={key} sx={{ mb: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2">{key}</Typography>
                  <Typography variant="body2">
                    {count}人 ({percentage.toFixed(1)}%)
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={percentage}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            );
          })}
        </CardContent>
      </Card>
    );
  };

  const renderQuestionAnalytics = () => {
    if (!analytics?.questionAnalytics) return null;

    return (
      <Box>
        {analytics.questionAnalytics.map((question, index) => (
          <Card key={question.questionId} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                質問 {index + 1}: {question.questionText}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                回答数: {question.responseCount}
              </Typography>

              {question.optionCounts && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    選択肢別回答数
                  </Typography>
                  {Object.entries(question.optionCounts).map(
                    ([option, count]) => {
                      const percentage =
                        question.responseCount > 0
                          ? (count / question.responseCount) * 100
                          : 0;
                      return (
                        <Box key={option} sx={{ mb: 1 }}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              mb: 0.5,
                            }}
                          >
                            <Typography variant="body2">{option}</Typography>
                            <Typography variant="body2">
                              {count} ({percentage.toFixed(1)}%)
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={percentage}
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                        </Box>
                      );
                    }
                  )}
                </Box>
              )}

              {question.scaleStats && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    スケール統計
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={3}>
                      <Typography variant="body2">
                        平均: {question.scaleStats.average.toFixed(1)}
                      </Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="body2">
                        中央値: {question.scaleStats.median}
                      </Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="body2">
                        最頻値: {question.scaleStats.mode}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  };

  const renderLocationAnalytics = () => {
    if (!analytics?.locationAnalytics) return null;

    return (
      <Box>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              人気エリア
            </Typography>
            <List>
              {analytics.locationAnalytics.popularAreas.map((area) => (
                <ListItem key={`${area.prefecture}-${area.city}`}>
                  <ListItemText
                    primary={`${area.prefecture} ${area.city}`}
                    secondary={`${area.responseCount}件 (${area.percentage.toFixed(1)}%)`}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              ヒートマップ
            </Typography>
            <Typography variant="body2" color="text.secondary">
              位置情報データが収集されている場合、ここにヒートマップが表示されます。
            </Typography>
            <Box
              sx={{
                height: 300,
                backgroundColor: "#f5f5f5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mt: 2,
                borderRadius: 1,
              }}
            >
              <Map sx={{ fontSize: 48, color: "text.disabled" }} />
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  };

  if (loading) {
    return (
      <Layout>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "50vh",
          }}
        >
          <Typography>分析データを読み込み中...</Typography>
        </Box>
      </Layout>
    );
  }

  if (!analytics) {
    return (
      <Layout>
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h5" color="text.secondary">
            分析データが見つかりません
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push("/history")}
            sx={{ mt: 2 }}
          >
            履歴に戻る
          </Button>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "#f5f5f5",
          paddingTop: { xs: "70px", sm: "80px" }, // ヘッダー分のマージン
          paddingBottom: "80px",
        }}
      >
        <Header />

        <Box
          sx={{
            padding: { xs: 2, md: 3 },
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* ヘッダー情報 */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
                  アンケート分析
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                  総回答数: {analytics.totalResponses}件
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography variant="h3" color="primary">
                        {analytics.totalResponses}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        総回答数
                      </Typography>
                    </Box>
                  </Grid>

                  {analytics.ratingAnalytics && (
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: "center" }}>
                        <Typography variant="h3" color="primary">
                          {analytics.ratingAnalytics.averageRating.toFixed(1)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          平均評価
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>

            {/* タブナビゲーション */}
            <Card sx={{ mb: 3 }}>
              <Tabs
                value={currentTab}
                onChange={handleTabChange}
                aria-label="analytics tabs"
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="人口統計" />
                <Tab label="質問分析" />
                <Tab label="位置情報" />
                <Tab label="時系列" />
              </Tabs>
            </Card>

            {/* タブコンテンツ */}
            <TabPanel value={currentTab} index={0}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  {renderDemographicChart(
                    "性別分布",
                    analytics.demographicBreakdown.gender
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  {renderDemographicChart(
                    "年代分布",
                    analytics.demographicBreakdown.ageRange
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  {renderDemographicChart(
                    "地域分布",
                    analytics.demographicBreakdown.location
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  {renderDemographicChart(
                    "職業分布",
                    analytics.demographicBreakdown.occupation
                  )}
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={currentTab} index={1}>
              {renderQuestionAnalytics()}
            </TabPanel>

            <TabPanel value={currentTab} index={2}>
              {renderLocationAnalytics()}
            </TabPanel>

            <TabPanel value={currentTab} index={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    時系列分析
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    回答数の時系列変化をグラフで表示します。
                  </Typography>
                  <Box
                    sx={{
                      height: 300,
                      backgroundColor: "#f5f5f5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mt: 2,
                      borderRadius: 1,
                    }}
                  >
                    <TrendingUp sx={{ fontSize: 48, color: "text.disabled" }} />
                  </Box>
                </CardContent>
              </Card>
            </TabPanel>
          </motion.div>
        </Box>
      </Box>
    </Layout>
  );
}
