import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  Autocomplete,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import React, { useState } from "react";

import Header from "@/components/Header";
import Layout from "@/components/Layout";

export default function Create() {
  const [theme, setTheme] = useState("");
  const [questionCount, setQuestionCount] = useState(10);
  const [tags, setTags] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  const [enableDemographics, setEnableDemographics] = useState(false);
  const [enableLocationTracking, setEnableLocationTracking] = useState(false);
  const [enableRating, setEnableRating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const muiTheme = useTheme();

  // 推奨タグ
  const suggestedTags = [
    "性格診断",
    "適性検査",
    "キャリア",
    "恋愛",
    "趣味",
    "ライフスタイル",
    "健康",
    "ビジネス",
    "学習",
    "エンターテイメント",
    "心理テスト",
    "自己分析",
    "コミュニケーション",
    "リーダーシップ",
    "創造性",
    "ストレス",
    "モチベーション",
  ];

  const handleGenerateQuiz = async () => {
    if (!theme.trim()) {
      setError("テーマを入力してください。");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          theme,
          questionCount,
          tags,
          isPublic,
          enableDemographics,
          enableLocationTracking,
          enableRating,
        }),
      });

      if (!response.ok) {
        throw new Error("アンケートの生成に失敗しました。");
      }

      const quizData = await response.json();

      // 生成されたデータをセッションストレージに保存
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("quizData", JSON.stringify(quizData));
      }

      // クイズページに遷移
      router.push("/quiz");
    } catch (err: any) {
      setError(err.message || "エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.3, delayChildren: 0.5 },
    },
  };

  return (
    <Layout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            textAlign: "center",
            padding: { xs: 2, md: 4 },
            paddingTop: { xs: "80px", sm: "90px" }, // ヘッダー分のマージン
            position: "relative",
            backgroundColor: muiTheme.palette.background.default,
            width: "100%",
            maxWidth: "100vw",
            overflowX: "hidden",
            userSelect: "none",
            WebkitUserSelect: "none",
            MozUserSelect: "none",
            msUserSelect: "none",
          }}
        >
          <Header />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            style={{ zIndex: 2, width: "100%", maxWidth: "600px" }}
          >
            <Typography
              variant="h4"
              component="h1"
              sx={{
                mb: 2,
                color: muiTheme.palette.text.primary,
                fontWeight: "bold",
              }}
            >
              新しいアンケートを作成
            </Typography>
            <Typography
              variant="body1"
              sx={{ mb: 4, color: muiTheme.palette.text.secondary }}
            >
              作成したいアンケートのテーマを入力してください。AIが質問を生成します。
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              placeholder="例：チームメンバーの隠れた強みを見つけるための適性診断"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  backgroundColor: muiTheme.palette.background.paper,
                  "& fieldset": {
                    borderColor: muiTheme.palette.divider,
                  },
                  "&:hover fieldset": {
                    borderColor: muiTheme.palette.primary.main,
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: muiTheme.palette.primary.main,
                  },
                },
              }}
            />

            {/* 問題数選択ドロップダウン */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="question-count-label">問題数</InputLabel>
              <Select
                labelId="question-count-label"
                id="question-count-select"
                value={questionCount}
                label="問題数"
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: muiTheme.palette.background.paper,
                  },
                  "& fieldset": {
                    borderColor: muiTheme.palette.divider,
                  },
                  "&:hover fieldset": {
                    borderColor: muiTheme.palette.primary.main,
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: muiTheme.palette.primary.main,
                  },
                }}
              >
                <MenuItem value={5}>5問</MenuItem>
                <MenuItem value={10}>10問</MenuItem>
                <MenuItem value={15}>15問</MenuItem>
                <MenuItem value={20}>20問</MenuItem>
                <MenuItem value={25}>25問</MenuItem>
                <MenuItem value={30}>30問</MenuItem>
              </Select>
            </FormControl>

            {/* タグ入力セクション */}
            <Card sx={{ mb: 2, textAlign: "left" }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  タグ設定
                </Typography>
                <Autocomplete
                  multiple
                  freeSolo
                  options={suggestedTags}
                  value={tags}
                  onChange={(event, newValue) => {
                    setTags(newValue.slice(0, 5)); // 最大5つまで
                  }}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        variant="outlined"
                        label={option}
                        {...getTagProps({ index })}
                        key={option}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      placeholder="タグを追加（最大5つ）"
                      helperText="アンケートのカテゴリを表すタグを追加してください"
                    />
                  )}
                />
              </CardContent>
            </Card>

            {/* 公開設定 */}
            <Card sx={{ mb: 2, textAlign: "left" }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  公開設定
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                    />
                  }
                  label="一般公開する"
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  他のユーザーもこのアンケートを利用できるようになります
                </Typography>
              </CardContent>
            </Card>

            {/* 分析オプション */}
            <Card sx={{ mb: 2, textAlign: "left" }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  分析オプション
                </Typography>

                <FormControlLabel
                  control={
                    <Switch
                      checked={enableDemographics}
                      onChange={(e) => setEnableDemographics(e.target.checked)}
                    />
                  }
                  label="人口統計分析を有効にする"
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  年齢、性別、職業などによる回答分析を行います
                </Typography>

                <FormControlLabel
                  control={
                    <Switch
                      checked={enableLocationTracking}
                      onChange={(e) =>
                        setEnableLocationTracking(e.target.checked)
                      }
                    />
                  }
                  label="位置情報分析を有効にする"
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  回答者の位置情報をヒートマップで表示します
                </Typography>

                <FormControlLabel
                  control={
                    <Switch
                      checked={enableRating}
                      onChange={(e) => setEnableRating(e.target.checked)}
                    />
                  }
                  label="評価機能を有効にする"
                />
                <Typography variant="body2" color="text.secondary">
                  回答者がアンケートを評価できるようになります
                </Typography>
              </CardContent>
            </Card>

            <Button
              variant="contained"
              size="large"
              onClick={handleGenerateQuiz}
              disabled={loading}
              sx={{
                width: "100%",
                py: 2,
                fontSize: "1.2rem",
                fontWeight: "bold",
                backgroundColor: "#007AFF !important",
                color: "#FFFFFF !important",
                borderRadius: 2,
                boxShadow: "0 3px 6px rgba(0, 0, 0, 0.1)",
                "&:hover": {
                  backgroundColor: "#0056CC !important",
                  boxShadow: "0 6px 12px rgba(0, 0, 0, 0.2)",
                },
                "&:focus": {
                  backgroundColor: "#007AFF !important",
                },
                "&.Mui-disabled": {
                  backgroundColor: "#CCCCCC !important",
                  color: "#888888 !important",
                  opacity: "0.7 !important",
                },
              }}
            >
              {loading ? (
                <CircularProgress size={28} color="inherit" />
              ) : (
                "アンケートを生成する"
              )}
            </Button>
            {error && (
              <Typography color="error" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}
          </motion.div>
        </Box>
      </motion.div>
    </Layout>
  );
}
