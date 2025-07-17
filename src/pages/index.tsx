import { Search, TrendingUp, Schedule, Person } from "@mui/icons-material";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Grid,
  Avatar,
  InputAdornment,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";

import Header from "@/components/Header";
import Layout from "@/components/Layout";

// 仮のデータ型（後でFirestoreから取得）
interface PublicQuiz {
  id: string;
  title: string;
  description: string;
  creatorName: string;
  creatorId: string;
  tags: string[];
  popularity: number;
  questionCount: number;
  createdAt: string;
}

export default function Home() {
  const [quizzes, setQuizzes] = useState<PublicQuiz[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"popularity" | "recent">("popularity");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 仮のデータ（後でFirestoreから取得）
    const mockQuizzes: PublicQuiz[] = [
      {
        id: "1",
        title: "あなたの隠れた才能診断",
        description: "5つの質問であなたの知らない才能を発見しましょう",
        creatorName: "田中太郎",
        creatorId: "user1",
        tags: ["才能", "診断", "自己分析"],
        popularity: 1250,
        questionCount: 10,
        createdAt: "2024-01-15",
      },
      {
        id: "2",
        title: "理想のキャリアパス診断",
        description: "あなたに最適なキャリアの方向性を見つけよう",
        creatorName: "佐藤花子",
        creatorId: "user2",
        tags: ["キャリア", "転職", "適性"],
        popularity: 890,
        questionCount: 15,
        createdAt: "2024-01-20",
      },
      {
        id: "3",
        title: "コミュニケーションスタイル診断",
        description: "あなたのコミュニケーションの特徴を知ろう",
        creatorName: "山田次郎",
        creatorId: "user3",
        tags: ["コミュニケーション", "性格", "人間関係"],
        popularity: 2100,
        questionCount: 12,
        createdAt: "2024-01-25",
      },
    ];

    // 実際の実装では、ここでFirestoreからデータを取得
    setTimeout(() => {
      setQuizzes(mockQuizzes);
      setLoading(false);
    }, 1000);
  }, []);

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
        return b.popularity - a.popularity;
      } else {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
    });

  const handleQuizClick = (quizId: string) => {
    // 実際の実装では、選択したクイズのデータを設定してクイズページに遷移
    router.push(`/quiz?id=${quizId}`);
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

            {/* ソート切り替え */}
            <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
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
                      onClick={() => handleQuizClick(quiz.id)}
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

                        {/* 作成者情報 */}
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 1 }}
                        >
                          <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                            <Person />
                          </Avatar>
                          <Typography variant="body2" color="text.secondary">
                            {quiz.creatorName}
                          </Typography>
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
                            {quiz.popularity}回実施
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>

            {filteredQuizzes.length === 0 && !loading && (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography color="text.secondary">
                  該当するアンケートが見つかりませんでした
                </Typography>
              </Box>
            )}
          </motion.div>
        </Box>
      </Box>
    </Layout>
  );
}
