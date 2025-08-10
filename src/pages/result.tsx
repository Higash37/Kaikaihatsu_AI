import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/router";
import React, { useState, useEffect, useCallback } from "react";

import Header from "@/components/layout/Header";
import Layout from "@/components/layout/Layout";
// Supabaseインポートに変更
import { saveQuizResponse } from "@/utils/supabase";

// 型定義
type Question = { 
  id: string; 
  text: string; 
  axisId?: number;
  type: string;
  required: boolean;
  order: number;
};
type Indicator = { id: number; name: string; description: string };
type Axis = { 
  id: number; 
  name: string; 
  description: string;
  positiveName?: string;
  negativeName?: string;
};
type Answers = { [id: string]: number | undefined };

// 新しい診断結果の型
type DiagnosisResult = {
  id: string;
  name: string;
  description: string;
  coordinates: {
    x: number; // -1 to 1
    y: number; // -1 to 1
  };
  axisScores: {
    axisId: number;
    axisName: string;
    score: number; // 1-5のスケール
    percentage: number; // 0-100%
  }[];
};

type QuizResult = {
  id: string;
  title: string;
  questions: Question[];
  indicators?: Indicator[];
  axes?: Axis[];
  answers: Answers;
  diagnosis?: DiagnosisResult; // 新しい診断結果
  quizTitle?: string;
  quizDescription?: string;
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

// 拡張された診断結果の型
type ExtendedDiagnosisResult = {
  id: string;
  gender: string;
  age: number;
  emotion_score: number;
  rational_score: number;
  active_score: number;
  passive_score: number;
  resultName?: string;
  resultDescription?: string;
  traits?: string[];
  axisScores?: { axisId: number; averageScore: number; percentage: number }[];
  coordinates?: { x: number; y: number };
};

export default function ResultPage() {
  const router = useRouter();
  const [resultData, setResultData] = useState<QuizResult | null>(null);
  const [diagnosisResult, setDiagnosisResult] =
    useState<ExtendedDiagnosisResult | null>(null);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [saveMessage, setSaveMessage] = useState("");
  const [autoSaveAttempted, setAutoSaveAttempted] = useState(false);
  const theme = useTheme();

  // 自動保存関数（useEffectより前に定義）
  const handleAutoSave = useCallback(async () => {
    if (!resultData || !diagnosisResult) return;

    setSaveStatus("saving");
    setSaveMessage("結果を自動保存しています...");

    try {
      const saveData = {
        quizId: resultData.id,
        userId: resultData.creatorId,
        responses: resultData.answers,  // answersカラム用
        result: {
          name: diagnosisResult.resultName,
          description: diagnosisResult.resultDescription,
          coordinates: diagnosisResult.coordinates,
          axisScores: diagnosisResult.axisScores,
          traits: diagnosisResult.traits || []
        },
        userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "",
      };

      await saveQuizResponse(saveData);
      setSaveStatus("saved");
      setSaveMessage(`結果が自動保存されました！`);
    } catch (error) {
      console.error("自動保存エラー:", error);
      setSaveStatus("error");
      setSaveMessage("自動保存に失敗しました。手動で保存してください。");
    }
  }, [resultData, diagnosisResult]);

  useEffect(() => {
    // ブラウザ環境でのみsessionStorageにアクセス
    if (typeof window !== "undefined") {
      const storedData = window.sessionStorage.getItem("quizResult");
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setResultData(parsedData);

        // 新しい4軸診断システムの結果がある場合はそれを使用
        if (parsedData.diagnosis) {
          const newDiagnosisResult: ExtendedDiagnosisResult = {
            id: parsedData.diagnosis.id,
            gender: "診断結果",
            age: 0,
            emotion_score: 0,
            rational_score: 0,
            active_score: 0,
            passive_score: 0,
            resultName: parsedData.diagnosis.name,
            resultDescription: parsedData.diagnosis.description,
            traits: parsedData.tags || [],
            axisScores: parsedData.diagnosis.axisScores?.map((axis: any) => ({
              axisId: axis.axisId,
              averageScore: axis.score,
              percentage: axis.percentage
            })) || [],
            coordinates: parsedData.diagnosis.coordinates
          };
          setDiagnosisResult(newDiagnosisResult);
        } else {
          // 従来の診断結果生成（互換性のため）
          const generateLocalResult = (): ExtendedDiagnosisResult => {
            // 軸ごとのスコアを計算
            const axisScores: { [axisId: number]: { total: number; count: number } } = {};
            
            // axesが存在する場合の新しい計算方法
            if (parsedData.axes && parsedData.axes.length > 0) {
              parsedData.questions.forEach((question: Question) => {
                const answer = parsedData.answers[question.id];
                if (answer !== undefined && question.axisId) {
                  if (!axisScores[question.axisId]) {
                    axisScores[question.axisId] = { total: 0, count: 0 };
                  }
                  axisScores[question.axisId].total += answer;
                  axisScores[question.axisId].count += 1;
                }
              });
              
              // 各軸の平均スコアを計算
              const averageAxisScores = Object.entries(axisScores).map(([axisId, data]) => ({
                axisId: parseInt(axisId),
                averageScore: data.count > 0 ? data.total / data.count : 3,
                percentage: data.count > 0 ? Math.round((data.total / data.count - 1) * 25) : 50
              }));
              
              // 最も高いスコアの軸を取得
              const topAxis = averageAxisScores.reduce((prev, current) => 
                prev.averageScore > current.averageScore ? prev : current
              );
              
              const topAxisData = parsedData.axes.find((axis: Axis) => axis.id === topAxis.axisId);
              
              return {
                id: "1",
                gender: "分析結果",
                age: 0,
                emotion_score: 0,
                rational_score: 0,
                active_score: 0,
                passive_score: 0,
                resultName: topAxisData?.name || "診断結果",
                resultDescription: topAxisData?.description || "あなたの診断結果です。",
                traits: parsedData.tags || [],
                axisScores: averageAxisScores
              };
            } else {
              // 旧形式の処理（互換性のため）
              const scores = Object.values(parsedData.answers) as number[];
              const validScores = scores.filter(
                (score) => typeof score === "number" && score > 0
              );
              const averageScore =
                validScores.length > 0
                  ? validScores.reduce((sum, score) => sum + score, 0) /
                    validScores.length
                  : 3;

              // シンプルな結果を生成
              const resultName = parsedData.title || "診断結果";
              const resultDescription = "あなたの診断結果です";

              return {
                id: "1",
                gender: "分析結果",
                age: Math.round(averageScore * 20),
                emotion_score: Math.round(averageScore * 20),
                rational_score: Math.round(averageScore * 20),
                active_score: Math.round(averageScore * 15),
                passive_score: Math.round((5 - averageScore) * 15),
                resultName: resultName,
                resultDescription: resultDescription,
                traits: parsedData.tags || [],
              };
            }
          };

          setDiagnosisResult(generateLocalResult());
        }
      } else {
        router.replace("/");
      }
    }

    // 初期化処理完了
  }, [router]); // 初期化処理なので router のみに依存

  // 自動保存処理用の別のuseEffect
  useEffect(() => {
    if (resultData && diagnosisResult && saveStatus === "idle" && !autoSaveAttempted) {
      setAutoSaveAttempted(true);
      handleAutoSave();
    }
  }, [resultData, diagnosisResult, saveStatus, autoSaveAttempted, handleAutoSave]);

  // Supabaseに結果を保存する関数（手動保存用）
  const handleSaveResult = async () => {
    if (!resultData || !diagnosisResult) {
      setSaveMessage("保存できるデータがありません。");
      setSaveStatus("error");
      return;
    }

    setSaveStatus("saving");
    setSaveMessage("結果を保存しています...");

    try {
      const saveData = {
        quizId: resultData.id,
        userId: resultData.creatorId, // 現在のユーザーID
        responses: resultData.answers,  // answersカラム用
        result: {
          name: diagnosisResult.resultName,
          description: diagnosisResult.resultDescription,
          coordinates: diagnosisResult.coordinates,
          axisScores: diagnosisResult.axisScores,
          traits: diagnosisResult.traits || []
        },
        userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "",
      };

      const responseId = await saveQuizResponse(saveData);
      setSaveStatus("saved");
      setSaveMessage(`結果が保存されました！ ID: ${responseId}`);
    } catch (error) {
      console.error("保存エラー:", error);
      setSaveStatus("error");
      setSaveMessage("保存に失敗しました。もう一度お試しください。");
    }
  };

  if (!resultData || !diagnosisResult) {
    return <Typography>結果を読み込んでいます...</Typography>;
  }

  // diagnosisResultから表示用のデータを作成
  const topIndicator = {
    name: diagnosisResult?.resultName || "診断結果",
    description: diagnosisResult?.resultDescription || "あなたの診断結果です。",
  };

  // X軸、Y軸の座標を計算（-100から100の範囲）
  const calculateCoordinates = () => {
    // 新しい診断システムの座標がある場合はそれを使用
    if (resultData?.diagnosis?.coordinates) {
      return {
        x: resultData.diagnosis.coordinates.x * 100, // -1〜1を-100〜100に変換
        y: resultData.diagnosis.coordinates.y * 100
      };
    }
    
    // 従来の方法（互換性のため）
    if (!diagnosisResult.axisScores || diagnosisResult.axisScores.length < 2) {
      return { x: 0, y: 0 };
    }
    
    // X軸（ID=1）、Y軸（ID=2）のスコアを取得
    const xAxis = diagnosisResult.axisScores.find(score => score.axisId === 1);
    const yAxis = diagnosisResult.axisScores.find(score => score.axisId === 2);
    
    // -100から100の範囲に変換（平均スコア3を中心に）
    const xCoord = xAxis ? (xAxis.averageScore - 3) * 50 : 0;
    const yCoord = yAxis ? (yAxis.averageScore - 3) * 50 : 0;
    
    return { x: xCoord, y: yCoord };
  };
  
  const coordinates = calculateCoordinates();

  return (
    <Layout>
      <Box
        sx={{
          backgroundColor: theme.palette.background.default,
          minHeight: "100vh",
          paddingTop: { xs: "70px", sm: "80px" }, // ヘッダー分のマージン
          width: "100%",
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
        }}
      >
        <Header />
        <Box
          sx={{
            pt: { xs: 12, sm: 14, md: 16 },
            pb: 6,
            px: { xs: 2, sm: 4, md: 6 },
            width: { xs: "100%", lg: "75%" },
            maxWidth: "1200px",
            mx: "auto",
            userSelect: "none",
            WebkitUserSelect: "none",
            MozUserSelect: "none",
            msUserSelect: "none",
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 4 },
              mb: 4,
              borderRadius: theme.shape.borderRadius,
              backgroundColor: theme.palette.background.paper,
              boxShadow: theme.shadows[1],
              position: "relative",
              userSelect: "none",
              WebkitUserSelect: "none",
              MozUserSelect: "none",
              msUserSelect: "none",
              pointerEvents: "auto",
            }}
          >
            <Typography
              variant="h4"
              component="h1"
              textAlign="center"
              sx={{
                fontWeight: "bold",
                mb: 1,
                color: theme.palette.text.primary,
              }}
            >
              アンケート結果
            </Typography>
            <Typography
              variant="h6"
              component="h2"
              textAlign="center"
              sx={{ mb: 4, color: theme.palette.text.secondary }}
            >
              {resultData.title}
            </Typography>

            <Box
              sx={{
                textAlign: "center",
                p: 3,
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.common.white,
                borderRadius: theme.shape.borderRadius,
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                最も顕著な特性は...
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: "bold", my: 2 }}>
                {topIndicator.name}
              </Typography>
              <Typography variant="body1">
                {topIndicator.description}
              </Typography>
            </Box>
          </Paper>

          {/* 特性（Traits）表示セクション */}
          {diagnosisResult.traits && diagnosisResult.traits.length > 0 && (
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, md: 4 },
                borderRadius: theme.shape.borderRadius,
                backgroundColor: theme.palette.background.paper,
                boxShadow: theme.shadows[1],
                position: "relative",
                userSelect: "none",
                WebkitUserSelect: "none",
                MozUserSelect: "none",
                msUserSelect: "none",
                pointerEvents: "auto",
              }}
            >
              <Typography
                variant="h5"
                component="h3"
                sx={{
                  fontWeight: "bold",
                  mb: 3,
                  color: theme.palette.text.primary,
                }}
              >
                あなたの特性
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {diagnosisResult.traits.map((trait, index) => (
                  <Chip
                    key={index}
                    label={trait}
                    variant="outlined"
                    color="primary"
                    sx={{
                      fontSize: "0.9rem",
                      fontWeight: "medium",
                    }}
                  />
                ))}
              </Box>
            </Paper>
          )}

          {/* 座標グラフ表示セクション */}
          {(resultData?.diagnosis || (resultData.axes && resultData.axes.length >= 2)) && (
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, md: 4 },
                mb: 4,
                borderRadius: theme.shape.borderRadius,
                backgroundColor: theme.palette.background.paper,
                boxShadow: theme.shadows[1],
                position: "relative",
              }}
            >
              <Typography
                variant="h5"
                component="h3"
                sx={{
                  fontWeight: "bold",
                  mb: 3,
                  color: theme.palette.text.primary,
                  textAlign: "center",
                }}
              >
                あなたのポジション
              </Typography>
              
              {/* 座標グラフ */}
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  maxWidth: 500,
                  height: 500,
                  mx: "auto",
                  mb: 3,
                  backgroundColor: "#f8f9fa",
                  borderRadius: 2,
                  border: "2px solid #e0e0e0",
                }}
              >
                {/* X軸 */}
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: 0,
                    right: 0,
                    height: 2,
                    backgroundColor: "#ccc",
                  }}
                />
                {/* Y軸 */}
                <Box
                  sx={{
                    position: "absolute",
                    left: "50%",
                    top: 0,
                    bottom: 0,
                    width: 2,
                    backgroundColor: "#ccc",
                  }}
                />
                
                {/* 軸ラベル（新しい診断システム対応） */}
                {resultData?.diagnosis?.axisScores ? (
                  // 新しい診断システムの軸ラベル
                  <>
                    {resultData.diagnosis.axisScores.map((axis, _index) => {
                      if (axis.axisId === 1) { // X軸
                        return (
                          <React.Fragment key={axis.axisId}>
                            <Typography
                              sx={{
                                position: "absolute",
                                right: 10,
                                top: "50%",
                                transform: "translateY(-50%)",
                                fontSize: "0.875rem",
                                fontWeight: "bold",
                                color: "#666",
                                backgroundColor: "rgba(255,255,255,0.8)",
                                padding: "2px 6px",
                                borderRadius: "4px",
                              }}
                            >
                              {axis.axisName}+
                            </Typography>
                            <Typography
                              sx={{
                                position: "absolute",
                                left: 10,
                                top: "50%",
                                transform: "translateY(-50%)",
                                fontSize: "0.875rem",
                                fontWeight: "bold",
                                color: "#666",
                                backgroundColor: "rgba(255,255,255,0.8)",
                                padding: "2px 6px",
                                borderRadius: "4px",
                              }}
                            >
                              {axis.axisName}-
                            </Typography>
                          </React.Fragment>
                        );
                      } else if (axis.axisId === 2) { // Y軸
                        return (
                          <React.Fragment key={axis.axisId}>
                            <Typography
                              sx={{
                                position: "absolute",
                                left: "50%",
                                top: 10,
                                transform: "translateX(-50%)",
                                fontSize: "0.875rem",
                                fontWeight: "bold",
                                color: "#666",
                                backgroundColor: "rgba(255,255,255,0.8)",
                                padding: "2px 6px",
                                borderRadius: "4px",
                              }}
                            >
                              {axis.axisName}+
                            </Typography>
                            <Typography
                              sx={{
                                position: "absolute",
                                left: "50%",
                                bottom: 10,
                                transform: "translateX(-50%)",
                                fontSize: "0.875rem",
                                fontWeight: "bold",
                                color: "#666",
                                backgroundColor: "rgba(255,255,255,0.8)",
                                padding: "2px 6px",
                                borderRadius: "4px",
                              }}
                            >
                              {axis.axisName}-
                            </Typography>
                          </React.Fragment>
                        );
                      }
                      return null;
                    })}
                  </>
                ) : (
                  // 従来の軸ラベル表示
                  <>
                    {/* X軸ラベル */}
                    {resultData.axes && resultData.axes[0] && (
                      <>
                        <Typography
                          sx={{
                            position: "absolute",
                            right: 10,
                            top: "50%",
                            transform: "translateY(-50%)",
                            fontSize: "0.875rem",
                            fontWeight: "bold",
                            color: "#666",
                            backgroundColor: "rgba(255,255,255,0.8)",
                            padding: "2px 6px",
                            borderRadius: "4px",
                          }}
                        >
                          {resultData.axes[0].positiveName || resultData.axes[0].name + "+"}
                        </Typography>
                        <Typography
                          sx={{
                            position: "absolute",
                            left: 10,
                            top: "50%",
                            transform: "translateY(-50%)",
                            fontSize: "0.875rem",
                            fontWeight: "bold",
                            color: "#666",
                            backgroundColor: "rgba(255,255,255,0.8)",
                            padding: "2px 6px",
                            borderRadius: "4px",
                          }}
                        >
                          {resultData.axes[0].negativeName || resultData.axes[0].name + "-"}
                        </Typography>
                      </>
                    )}
                    
                    {/* Y軸ラベル */}
                    {resultData.axes && resultData.axes[1] && (
                      <>
                        <Typography
                          sx={{
                            position: "absolute",
                            left: "50%",
                            top: 10,
                            transform: "translateX(-50%)",
                            fontSize: "0.875rem",
                            fontWeight: "bold",
                            color: "#666",
                            backgroundColor: "rgba(255,255,255,0.8)",
                            padding: "2px 6px",
                            borderRadius: "4px",
                          }}
                        >
                          {resultData.axes[1].positiveName || resultData.axes[1].name + "+"}
                        </Typography>
                        <Typography
                          sx={{
                            position: "absolute",
                            left: "50%",
                            bottom: 10,
                            transform: "translateX(-50%)",
                            fontSize: "0.875rem",
                            fontWeight: "bold",
                            color: "#666",
                            backgroundColor: "rgba(255,255,255,0.8)",
                            padding: "2px 6px",
                            borderRadius: "4px",
                          }}
                        >
                          {resultData.axes[1].negativeName || resultData.axes[1].name + "-"}
                        </Typography>
                      </>
                    )}
                  </>
                )}
                
                {/* ユーザーのポイント */}
                <Box
                  sx={{
                    position: "absolute",
                    left: `${50 + coordinates.x * 0.4}%`,
                    top: `${50 - coordinates.y * 0.4}%`,
                    transform: "translate(-50%, -50%)",
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    backgroundColor: theme.palette.primary.main,
                    border: "3px solid white",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                    zIndex: 10,
                  }}
                />
              </Box>
              
              {/* スコア表示 */}
              <Box sx={{ textAlign: "center", mt: 2 }}>
                {resultData?.diagnosis?.axisScores ? (
                  // 新しい診断システムのスコア表示
                  resultData.diagnosis.axisScores.map((axis) => (
                    <Typography key={axis.axisId} variant="body1" sx={{ mb: 1 }}>
                      <strong>{axis.axisName}:</strong> {axis.score.toFixed(1)}点 
                      ({axis.percentage}%)
                    </Typography>
                  ))
                ) : (
                  // 従来のスコア表示
                  <>
                    {resultData.axes && resultData.axes[0] && (
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>{resultData.axes[0].name}:</strong> {coordinates.x > 0 
                          ? (resultData.axes[0].positiveName || resultData.axes[0].name + "方向")
                          : (resultData.axes[0].negativeName || resultData.axes[0].name + "逆方向")
                        } 寄り
                        （{Math.abs(Math.round(coordinates.x))}点）
                      </Typography>
                    )}
                    {resultData.axes && resultData.axes[1] && (
                      <Typography variant="body1">
                        <strong>{resultData.axes[1].name}:</strong> {coordinates.y > 0 
                          ? (resultData.axes[1].positiveName || resultData.axes[1].name + "方向")
                          : (resultData.axes[1].negativeName || resultData.axes[1].name + "逆方向")
                        } 寄り
                        （{Math.abs(Math.round(coordinates.y))}点）
                      </Typography>
                    )}
                  </>
                )}
              </Box>
            </Paper>
          )}


          {/* 保存ボタンとステータス */}
          <Paper
            elevation={3}
            sx={{
              padding: 3,
              marginTop: 3,
              backgroundColor: theme.palette.background.paper,
              borderRadius: 2,
              position: "relative",
              userSelect: "none",
              WebkitUserSelect: "none",
              MozUserSelect: "none",
              msUserSelect: "none",
              pointerEvents: "auto",
            }}
          >
            <Box sx={{ textAlign: "center" }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleSaveResult}
                disabled={saveStatus === "saving"}
                sx={{
                  backgroundColor: "#007AFF !important",
                  color: "#FFFFFF !important",
                  mb: 2,
                  mr: 1,
                  minWidth: 200,
                  height: 50,
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  borderRadius: 2,
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  "&:hover": {
                    backgroundColor: "#0056CC !important",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                  },
                  "&:disabled": {
                    backgroundColor: "#CCCCCC !important",
                    color: "#888888 !important",
                  },
                }}
              >
                {saveStatus === "saving"
                  ? "保存中..."
                  : "結果をデータベースに保存"}
              </Button>

              {/* トップページに戻るボタン */}
              <Button
                variant="contained"
                size="large"
                onClick={() => router.push("/")}
                sx={{
                  backgroundColor: "#28A745 !important",
                  color: "#FFFFFF !important",
                  mb: 2,
                  ml: 1,
                  minWidth: 200,
                  height: 50,
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  borderRadius: 2,
                  border: "none",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  "&:hover": {
                    backgroundColor: "#218838 !important",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                  },
                }}
              >
                トップページへ戻る
              </Button>

              {saveMessage && (
                <Alert
                  severity={
                    saveStatus === "saved"
                      ? "success"
                      : saveStatus === "error"
                        ? "error"
                        : "info"
                  }
                  sx={{ mt: 2 }}
                >
                  {saveMessage}
                </Alert>
              )}
            </Box>
          </Paper>
        </Box>
      </Box>
    </Layout>
  );
}
