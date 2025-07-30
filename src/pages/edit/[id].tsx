import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Preview as PreviewIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Chip,
  Grid,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";

import { useAuth } from "../../contexts/SupabaseAuthContext";

import Header from "@/components/Header";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";

// 型定義
type Question = {
  id: string;
  text: string;
  axisId: number;
  type: string;
  required: boolean;
  order: number;
};

type Axis = {
  id: number;
  name: string;
  description: string;
  positiveName?: string; // プラス方向の指標名
  negativeName?: string; // マイナス方向の指標名
};

type QuizData = {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  axes: Axis[];
  questionCount: number;
  isPublic: boolean;
  tags: string[];
  totalResponses: number;
  popularity: number;
  averageRating?: number;
  creatorId: string;
  creatorName: string;
  createdAt: string;
  updatedAt: string;
  enableDemographics: boolean;
  enableLocationTracking: boolean;
  enableRating: boolean;
};

function EditQuiz() {
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuth();
  const { id } = router.query;

  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // クイズデータを取得
  useEffect(() => {
    if (!id || typeof id !== "string") return;

    const fetchQuiz = async () => {
      try {
        const response = await fetch(`/api/quiz/${id}`);
        if (!response.ok) {
          throw new Error("クイズの取得に失敗しました");
        }
        const data = await response.json();
        setQuizData(data);
      } catch (error) {
        console.error("クイズ取得エラー:", error);
        setError("クイズの読み込みに失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id]);

  // 権限チェック
  useEffect(() => {
    if (quizData && user && quizData.creatorId !== user.id) {
      setError("このクイズを編集する権限がありません");
    }
  }, [quizData, user]);

  // タイトルの更新
  const updateTitle = (newTitle: string) => {
    if (!quizData) return;
    setQuizData({ ...quizData, title: newTitle });
  };

  // 説明の更新
  const updateDescription = (newDescription: string) => {
    if (!quizData) return;
    setQuizData({ ...quizData, description: newDescription });
  };

  // 軸の更新
  const updateAxis = (axisId: number, field: keyof Axis, value: string) => {
    if (!quizData) return;
    const updatedAxes = quizData.axes.map(axis =>
      axis.id === axisId ? { ...axis, [field]: value } : axis
    );
    setQuizData({ ...quizData, axes: updatedAxes });
  };

  // 質問の更新
  const updateQuestion = (questionId: string, newText: string) => {
    if (!quizData) return;
    const updatedQuestions = quizData.questions.map(q =>
      q.id === questionId ? { ...q, text: newText } : q
    );
    setQuizData({ ...quizData, questions: updatedQuestions });
  };

  // 質問の軸を変更
  const updateQuestionAxis = (questionId: string, newAxisId: number) => {
    if (!quizData) return;
    const updatedQuestions = quizData.questions.map(q =>
      q.id === questionId ? { ...q, axisId: newAxisId } : q
    );
    setQuizData({ ...quizData, questions: updatedQuestions });
  };

  // 質問を追加
  const addQuestion = () => {
    if (!quizData) return;
    const newQuestion: Question = {
      id: `q_${Date.now()}`,
      text: "新しい質問",
      axisId: 1,
      type: "scale",
      required: true,
      order: quizData.questions.length + 1,
    };
    setQuizData({
      ...quizData,
      questions: [...quizData.questions, newQuestion],
      questionCount: quizData.questions.length + 1,
    });
  };

  // 質問を削除
  const deleteQuestion = (questionId: string) => {
    if (!quizData) return;
    const updatedQuestions = quizData.questions.filter(q => q.id !== questionId);
    setQuizData({
      ...quizData,
      questions: updatedQuestions,
      questionCount: updatedQuestions.length,
    });
  };

  // 軸ごとの質問数を取得
  const getAxisQuestionCount = (axisId: number): number => {
    if (!quizData) return 0;
    return quizData.questions.filter(q => q.axisId === axisId).length;
  };

  // 軸ごとの質問バランスを計算（プラス方向の質問が多いか、マイナス方向が多いか）
  const getAxisQuestionBalance = (axisId: number): number => {
    if (!quizData) return 0;
    const axisQuestions = quizData.questions.filter(q => q.axisId === axisId);
    
    if (axisQuestions.length === 0) return 0;
    
    // より広範囲なキーワードで判定し、デフォルトでは交互に配置
    let balance = 0;
    axisQuestions.forEach((question, index) => {
      const text = question.text.toLowerCase();
      
      if (axisId === 1) { // X軸
        // 感情的・主観的な表現
        if (text.includes('感情') || text.includes('気持ち') || text.includes('心') || text.includes('素直') || 
            text.includes('感じ') || text.includes('思い') || text.includes('好き') || text.includes('嫌い') ||
            text.includes('楽しい') || text.includes('つらい') || text.includes('うれしい') || text.includes('悲しい')) {
          balance += 1;
        } 
        // 論理的・客観的な表現
        else if (text.includes('論理') || text.includes('理性') || text.includes('冷静') || text.includes('分析') || 
                 text.includes('客観') || text.includes('合理') || text.includes('効率') || text.includes('データ') ||
                 text.includes('計算') || text.includes('統計') || text.includes('証拠') || text.includes('事実')) {
          balance -= 1;
        }
        // キーワードがない場合は交互に配置
        else {
          balance += (index % 2 === 0) ? 1 : -1;
        }
      } else { // Y軸
        // 慎重・計画的な表現（下側/マイナス方向）
        if (text.includes('慎重') || text.includes('じっくり') || text.includes('計画') || text.includes('検討') || 
            text.includes('考え') || text.includes('準備') || text.includes('時間をかけ') || text.includes('よく考え') ||
            text.includes('調べ') || text.includes('確認') || text.includes('比較') || text.includes('検証') ||
            text.includes('アグレッシブ') || text.includes('aggressive') || text.includes('攻撃的') || 
            text.includes('積極的') || text.includes('強引')) {
          balance -= 1;
        }
        // 直感的・瞬発的な表現（上側/プラス方向）
        else if (text.includes('直感') || text.includes('すぐに') || text.includes('即座') || text.includes('瞬間') || 
                 text.includes('信じて') || text.includes('感覚') || text.includes('ひらめき') || text.includes('最初') ||
                 text.includes('とっさ') || text.includes('瞬時') || text.includes('パッと') || text.includes('思いつく')) {
          balance += 1;
        }
        // キーワードがない場合は交互に配置
        else {
          balance += (index % 2 === 0) ? 1 : -1;
        }
      }
    });
    
    return balance;
  };

  // 保存
  const saveQuiz = async () => {
    if (!quizData) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/quiz/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...quizData,
          updatedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("保存に失敗しました");
      }

      setSuccess("クイズが保存されました！");
    } catch (error) {
      console.error("保存エラー:", error);
      setError("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
          }}
        >
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (!quizData) {
    return (
      <Layout>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
          }}
        >
          <Typography>クイズが見つかりません</Typography>
        </Box>
      </Layout>
    );
  }

  if (user && quizData.creatorId !== user.id) {
    return (
      <Layout>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
          }}
        >
          <Alert severity="error">このクイズを編集する権限がありません</Alert>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box
        sx={{
          backgroundColor: theme.palette.background.default,
          minHeight: "100vh",
          paddingTop: { xs: "70px", sm: "80px" },
          paddingBottom: "40px",
        }}
      >
        <Header />
        
        <Box
          sx={{
            width: { xs: "100%", lg: "75%" },
            maxWidth: "1200px",
            mx: "auto",
            p: { xs: 2, md: 3 },
          }}
        >
          {/* ヘッダー */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              クイズを編集
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<PreviewIcon />}
                onClick={() => router.push(`/quiz?id=${id}`)}
              >
                プレビュー
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={saveQuiz}
                disabled={saving}
                sx={{
                  backgroundColor: "#007AFF !important",
                  "&:hover": { backgroundColor: "#0056CC !important" },
                }}
              >
                {saving ? "保存中..." : "保存"}
              </Button>
            </Box>
          </Box>

          {/* エラー・成功メッセージ */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          {/* タイトル編集 */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <TextField
              fullWidth
              variant="standard"
              placeholder="アンケートのタイトル"
              value={quizData.title}
              onChange={(e) => updateTitle(e.target.value)}
              sx={{
                "& .MuiInput-input": {
                  fontSize: "2rem",
                  fontWeight: "bold",
                },
              }}
            />
            <TextField
              fullWidth
              variant="standard"
              placeholder="アンケートの説明（任意）"
              value={quizData.description || ""}
              onChange={(e) => updateDescription(e.target.value)}
              sx={{ mt: 2 }}
            />
          </Paper>

          {/* 診断軸の編集 */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: "bold" }}>
              診断軸の設定
            </Typography>
            
            <Grid container spacing={3}>
              {/* 左列: X軸、Y軸の設定 */}
              <Grid item xs={12} md={7}>
                <Grid container spacing={2}>
                  {quizData.axes.map((axis) => (
                    <Grid item xs={12} sm={6} key={axis.id}>
                      <Card sx={{ height: "100%" }}>
                        <CardContent>
                          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: "bold", color: theme.palette.primary.main }}>
                            {axis.id === 1 ? "X軸 (横軸)" : "Y軸 (縦軸)"}
                          </Typography>
                          
                          <TextField
                            fullWidth
                            label="軸の名前"
                            value={axis.name}
                            onChange={(e) => updateAxis(axis.id, "name", e.target.value)}
                            sx={{ mb: 2 }}
                          />
                          
                          <TextField
                            fullWidth
                            label="軸の説明"
                            multiline
                            rows={2}
                            value={axis.description}
                            onChange={(e) => updateAxis(axis.id, "description", e.target.value)}
                            sx={{ mb: 2 }}
                          />
                          
                          {/* 方向表示 */}
                          <Typography variant="caption" sx={{ color: "text.secondary", mb: 1, display: "block" }}>
                            この軸の質問がどちら方向に振っているか:
                          </Typography>
                          <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                            {/* プラス方向のボタン */}
                            <Box 
                              sx={{ 
                                display: "flex", 
                                alignItems: "center", 
                                flex: 1,
                                p: 1,
                                backgroundColor: (() => {
                                  const currentBalance = getAxisQuestionBalance(axis.id);
                                  const otherAxisBalance = getAxisQuestionBalance(axis.id === 1 ? 2 : 1);
                                  // 現在の軸がプラス、または他の軸がマイナスの場合にアクティブ
                                  const isActive = currentBalance > 0 || (currentBalance === 0 && otherAxisBalance < 0);
                                  return isActive ? "rgba(0,128,0,0.2)" : "rgba(0,128,0,0.05)";
                                })(),
                                borderRadius: 1,
                                border: (() => {
                                  const currentBalance = getAxisQuestionBalance(axis.id);
                                  const otherAxisBalance = getAxisQuestionBalance(axis.id === 1 ? 2 : 1);
                                  const isActive = currentBalance > 0 || (currentBalance === 0 && otherAxisBalance < 0);
                                  return isActive ? "2px solid rgba(0,128,0,0.5)" : "1px solid rgba(0,128,0,0.2)";
                                })(),
                                opacity: (() => {
                                  const currentBalance = getAxisQuestionBalance(axis.id);
                                  const otherAxisBalance = getAxisQuestionBalance(axis.id === 1 ? 2 : 1);
                                  const isActive = currentBalance > 0 || (currentBalance === 0 && otherAxisBalance < 0);
                                  return isActive ? 1 : 0.5;
                                })(),
                                transition: "all 0.3s ease",
                                cursor: "default"
                              }}
                            >
                              {axis.id === 1 ? <ArrowForwardIcon sx={{ color: "green", fontSize: "1rem", mr: 0.5 }} /> : <ArrowUpwardIcon sx={{ color: "green", fontSize: "1rem", mr: 0.5 }} />}
                              <Typography variant="caption" sx={{ color: "green", fontWeight: "bold" }}>
                                {axis.positiveName || (axis.id === 1 ? "右側" : "上側")}
                              </Typography>
                            </Box>
                            
                            {/* マイナス方向のボタン */}
                            <Box 
                              sx={{ 
                                display: "flex", 
                                alignItems: "center", 
                                flex: 1,
                                p: 1,
                                backgroundColor: (() => {
                                  const currentBalance = getAxisQuestionBalance(axis.id);
                                  const otherAxisBalance = getAxisQuestionBalance(axis.id === 1 ? 2 : 1);
                                  // 現在の軸がマイナス、または他の軸がプラスの場合にアクティブ
                                  const isActive = currentBalance < 0 || (currentBalance === 0 && otherAxisBalance > 0);
                                  return isActive ? "rgba(255,165,0,0.2)" : "rgba(255,165,0,0.05)";
                                })(),
                                borderRadius: 1,
                                border: (() => {
                                  const currentBalance = getAxisQuestionBalance(axis.id);
                                  const otherAxisBalance = getAxisQuestionBalance(axis.id === 1 ? 2 : 1);
                                  const isActive = currentBalance < 0 || (currentBalance === 0 && otherAxisBalance > 0);
                                  return isActive ? "2px solid rgba(255,165,0,0.5)" : "1px solid rgba(255,165,0,0.2)";
                                })(),
                                opacity: (() => {
                                  const currentBalance = getAxisQuestionBalance(axis.id);
                                  const otherAxisBalance = getAxisQuestionBalance(axis.id === 1 ? 2 : 1);
                                  const isActive = currentBalance < 0 || (currentBalance === 0 && otherAxisBalance > 0);
                                  return isActive ? 1 : 0.5;
                                })(),
                                transition: "all 0.3s ease",
                                cursor: "default"
                              }}
                            >
                              {axis.id === 1 ? <ArrowBackIcon sx={{ color: "orange", fontSize: "1rem", mr: 0.5 }} /> : <ArrowDownwardIcon sx={{ color: "orange", fontSize: "1rem", mr: 0.5 }} />}
                              <Typography variant="caption" sx={{ color: "orange", fontWeight: "bold" }}>
                                {axis.negativeName || (axis.id === 1 ? "左側" : "下側")}
                              </Typography>
                            </Box>
                          </Box>
                          
                          {/* バランス情報 */}
                          <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.5, display: "block", textAlign: "center" }}>
                            バランス: {getAxisQuestionBalance(axis.id) > 0 ? "+" : ""}{getAxisQuestionBalance(axis.id)}
                            ({getAxisQuestionCount(axis.id)}問中)
                            {getAxisQuestionBalance(axis.id) === 0 && " - 中立"}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
              
              {/* 右列: プレビュー座標グラフ */}
              <Grid item xs={12} md={5}>
                <Card sx={{ height: "100%" }}>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: "bold", textAlign: "center" }}>
                      プレビュー
                    </Typography>
                    
                    {/* ミニ座標グラフ */}
                    <Box
                      sx={{
                        position: "relative",
                        width: "100%",
                        height: 300,
                        backgroundColor: "#f8f9fa",
                        borderRadius: 2,
                        border: "2px solid #e0e0e0",
                        mb: 2,
                      }}
                    >
                      {/* X軸 */}
                      <Box
                        sx={{
                          position: "absolute",
                          top: "50%",
                          left: 10,
                          right: 10,
                          height: 2,
                          backgroundColor: "#ccc",
                        }}
                      />
                      {/* Y軸 */}
                      <Box
                        sx={{
                          position: "absolute",
                          left: "50%",
                          top: 10,
                          bottom: 10,
                          width: 2,
                          backgroundColor: "#ccc",
                        }}
                      />
                      
                      {/* Y軸ラベル */}
                      {quizData.axes[1] && (
                        <>
                          <Typography
                            sx={{
                              position: "absolute",
                              left: "50%",
                              top: 5,
                              transform: "translateX(-50%)",
                              fontSize: "0.75rem",
                              fontWeight: "bold",
                              color: "green",
                              backgroundColor: "white",
                              px: 1,
                              borderRadius: 1,
                              maxWidth: "120px",
                              textAlign: "center",
                              lineHeight: 1.2,
                              opacity: getAxisQuestionBalance(2) > 0 ? 1 : 0.6,
                              border: getAxisQuestionBalance(2) > 0 ? "2px solid green" : "1px solid rgba(0,128,0,0.3)",
                            }}
                          >
                            {quizData.axes[1].positiveName || quizData.axes[1].name || "Y軸"}
                          </Typography>
                          <Typography
                            sx={{
                              position: "absolute",
                              left: "50%",
                              bottom: 5,
                              transform: "translateX(-50%)",
                              fontSize: "0.75rem",
                              fontWeight: "bold",
                              color: "orange",
                              backgroundColor: "white",
                              px: 1,
                              borderRadius: 1,
                              maxWidth: "120px",
                              textAlign: "center",
                              lineHeight: 1.2,
                              opacity: getAxisQuestionBalance(2) < 0 ? 1 : 0.6,
                              border: getAxisQuestionBalance(2) < 0 ? "2px solid orange" : "1px solid rgba(255,165,0,0.3)",
                            }}
                          >
                            {quizData.axes[1].negativeName || quizData.axes[1].name || "Y軸"}
                          </Typography>
                        </>
                      )}
                      
                      {/* X軸ラベル（縦書き） */}
                      {quizData.axes[0] && (
                        <>
                          <Typography
                            sx={{
                              position: "absolute",
                              right: 5,
                              top: "50%",
                              transform: "translateY(-50%)",
                              fontSize: "0.75rem",
                              fontWeight: "bold",
                              color: "green",
                              backgroundColor: "white",
                              px: 0.5,
                              py: 1,
                              borderRadius: 1,
                              writingMode: "vertical-rl",
                              textOrientation: "mixed",
                              maxHeight: "120px",
                              lineHeight: 1.2,
                              opacity: getAxisQuestionBalance(1) > 0 ? 1 : 0.6,
                              border: getAxisQuestionBalance(1) > 0 ? "2px solid green" : "1px solid rgba(0,128,0,0.3)",
                            }}
                          >
                            {quizData.axes[0].positiveName || quizData.axes[0].name || "X軸"}
                          </Typography>
                          <Typography
                            sx={{
                              position: "absolute",
                              left: 5,
                              top: "50%",
                              transform: "translateY(-50%)",
                              fontSize: "0.75rem",
                              fontWeight: "bold",
                              color: "orange",
                              backgroundColor: "white",
                              px: 0.5,
                              py: 1,
                              borderRadius: 1,
                              writingMode: "vertical-rl",
                              textOrientation: "mixed",
                              maxHeight: "120px",
                              lineHeight: 1.2,
                              opacity: getAxisQuestionBalance(1) < 0 ? 1 : 0.6,
                              border: getAxisQuestionBalance(1) < 0 ? "2px solid orange" : "1px solid rgba(255,165,0,0.3)",
                            }}
                          >
                            {quizData.axes[0].negativeName || quizData.axes[0].name || "X軸"}
                          </Typography>
                        </>
                      )}
                      
                      {/* 中心点 */}
                      <Box
                        sx={{
                          position: "absolute",
                          left: "50%",
                          top: "50%",
                          transform: "translate(-50%, -50%)",
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: theme.palette.primary.main,
                          border: "2px solid white",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                        }}
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
                      このグラフ上に回答者のポジションが表示されます
                    </Typography>
                    
                    {/* デバッグ用表示 */}
                    <Typography variant="caption" sx={{ mt: 1, display: "block", textAlign: "center", fontSize: "0.7rem" }}>
                      デバッグ: Y軸上={quizData.axes[1]?.positiveName || "未設定"} / Y軸下={quizData.axes[1]?.negativeName || "未設定"}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>

          {/* 質問リスト */}
          <Paper sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                質問 ({quizData.questions.length}問)
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addQuestion}
                size="small"
              >
                質問を追加
              </Button>
            </Box>

            {quizData.questions.map((question, index) => (
              <Card key={question.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 2,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      質問 {index + 1}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => deleteQuestion(question.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>

                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="質問文を入力してください"
                    value={question.text}
                    onChange={(e) => updateQuestion(question.id, e.target.value)}
                    sx={{ mb: 2 }}
                  />

                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <Typography variant="body2">対象軸:</Typography>
                    <Chip
                      label={`${question.axisId === 1 ? "X軸" : "Y軸"}: ${quizData.axes.find(a => a.id === question.axisId)?.name || ""}`}
                      variant="outlined"
                      onClick={() => updateQuestionAxis(question.id, question.axisId === 1 ? 2 : 1)}
                      sx={{ cursor: "pointer" }}
                    />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Paper>
        </Box>
      </Box>
    </Layout>
  );
}

// ページをProtectedRouteでラップ
function EditQuizPage() {
  return (
    <ProtectedRoute>
      <EditQuiz />
    </ProtectedRoute>
  );
}

export default EditQuizPage;