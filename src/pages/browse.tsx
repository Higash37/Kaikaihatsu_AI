import { Search, TrendingUp, Schedule } from "@mui/icons-material";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Grid,
  InputAdornment,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Button,
} from "@mui/material";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";

import Header from "@/components/layout/Header";
import Layout from "@/components/layout/Layout";
import { Quiz } from "@/types/quiz";
import { getSafeDisplayName } from "@/utils/user-display";

export default function Browse() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"popularity" | "recent">("popularity");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchPublicQuizzes = async () => {
      try {
        console.log("公開クイズ取得開始...");
        // 公開クイズを取得
        const response = await fetch(
          `/api/public-quizzes?sort=${sortBy}&limit=20`
        );
        if (response.ok) {
          const data = await response.json();
          console.log("取得したクイズデータ:", data);
          setQuizzes(data.quizzes || []);
        } else {
          console.error(
            "APIレスポンスエラー:",
            response.status,
            response.statusText
          );
          setQuizzes([]);
        }
      } catch (error) {
        console.error("クイズの取得に失敗しました:", error);
        setQuizzes([]); // エラー時は空配列
      } finally {
        setLoading(false);
      }
    };

    fetchPublicQuizzes();
  }, [sortBy]);

  const filteredQuizzes = quizzes
    .filter(
      (quiz) =>
        quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quiz.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quiz.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        )
    )
    .sort((a, b) => {
      if (sortBy === "popularity") {
        return (b.totalResponses || 0) - (a.totalResponses || 0);
      } else {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
    });

  const handleQuizClick = async (quiz: Quiz) => {
    try {
      // まずクイズの詳細データを取得
      const response = await fetch(`/api/quiz/${quiz.id}`);
      if (response.ok) {
        const quizData = await response.json();
        
        // sessionStorageにクイズデータを保存
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem("quizData", JSON.stringify(quizData));
        }
        
        // クイズページに遷移
        router.push(`/quiz?id=${quiz.id}`);
      } else {
        console.error("クイズデータの取得に失敗しました");
        // エラー時はIDだけでクイズページに遷移
        router.push(`/quiz?id=${quiz.id}`);
      }
    } catch (error) {
      console.error("クイズデータの取得エラー:", error);
      // エラー時はIDだけでクイズページに遷移
      router.push(`/quiz?id=${quiz.id}`);
    }
  };

  const handleSortChange = (
    _event: React.MouseEvent<unknown>,
    newSortBy: "popularity" | "recent"
  ) => {
    if (newSortBy !== null) {
      setSortBy(newSortBy);
    }
  };


  return (
    <Layout>
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "#f5f5f5",
          paddingTop: { xs: "70px", sm: "80px" }, // ヘッダー分のマージン
          paddingBottom: "80px", // フッターの高さ分のパディング
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
            <Typography
              variant="h4"
              component="h1"
              sx={{
                mb: 1,
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              みんなのアンケート
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mb: 3,
                textAlign: "center",
                color: "text.secondary",
              }}
            >
              他のユーザーが作成したアンケートに挑戦しよう
            </Typography>

            {/* 検索バー */}
            <TextField
              fullWidth
              variant="outlined"
              placeholder="アンケートを検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />

            {/* ソート切り替えとデバッグボタン */}
            <Box
              sx={{ display: "flex", justifyContent: "center", mb: 3, gap: 2 }}
            >
              <ToggleButtonGroup
                value={sortBy}
                exclusive
                onChange={handleSortChange}
                aria-label="sort by"
                size="small"
              >
                <ToggleButton value="popularity" aria-label="popularity">
                  <TrendingUp sx={{ mr: 1 }} />
                  人気順
                </ToggleButton>
                <ToggleButton value="recent" aria-label="recent">
                  <Schedule sx={{ mr: 1 }} />
                  新着順
                </ToggleButton>
              </ToggleButtonGroup>

            </Box>

            {/* アンケートカード一覧 */}
            <Grid container spacing={2}>
              {filteredQuizzes.map((quiz) => (
                <Grid item xs={12} sm={6} md={4} key={quiz.id}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        cursor: "pointer",
                        "&:hover": {
                          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                        },
                      }}
                      onClick={() => handleQuizClick(quiz)}
                    >
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography
                          variant="h6"
                          component="h2"
                          sx={{
                            fontWeight: "bold",
                            mb: 1,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {quiz.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mb: 2,
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {quiz.description}
                        </Typography>

                        {/* 回答数と作成者情報 */}
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 2,
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            {getSafeDisplayName(quiz.creatorName)}
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <Typography
                              variant="caption"
                              color="primary.main"
                              sx={{ fontWeight: "bold" }}
                            >
                              {quiz.totalResponses || 0} 回答
                            </Typography>
                            {(quiz.completedResponses !== undefined || quiz.inProgressResponses !== undefined) && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontSize: '0.7rem' }}
                              >
                                完了: {quiz.completedResponses || 0} | 進行中: {quiz.inProgressResponses || 0}
                              </Typography>
                            )}
                          </Box>
                        </Box>

                        {/* アクションボタン */}
                        <Box sx={{ display: "flex", gap: 1, mt: "auto" }}>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/analytics?id=${quiz.id}`);
                            }}
                            sx={{
                              flex: 1,
                              fontSize: "0.75rem",
                              py: 0.5,
                            }}
                          >
                            分析を見る
                          </Button>
                        </Box>

                        {/* タグ */}
                        <Box sx={{ mb: 2 }}>
                          {quiz.tags.slice(0, 3).map((tag, index) => (
                            <Chip
                              key={index}
                              label={tag}
                              size="small"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                        </Box>

                        {/* 統計情報 */}
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            {quiz.questionCount}問
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {quiz.totalResponses || 0}回実施
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>

            {loading ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography color="text.secondary">
                  クイズを読み込み中...
                </Typography>
              </Box>
            ) : filteredQuizzes.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {searchQuery
                    ? "該当するクイズが見つかりませんでした"
                    : "まだ公開クイズがありません"}
                </Typography>
                {!searchQuery && (
                  <Typography color="text.secondary">
                    クリエイターが作成したクイズがここに表示されます
                  </Typography>
                )}
              </Box>
            ) : null}
          </motion.div>
        </Box>
      </Box>
    </Layout>
  );
}