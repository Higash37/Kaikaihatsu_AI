import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Alert,
  LinearProgress,
} from "@mui/material";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  ScatterController,
  LineController,
  RadialLinearScale,
} from "chart.js";
import { Bar, Pie, Scatter, Line, Radar } from "react-chartjs-2";
import { Axis } from "@/types/quiz";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  ScatterController,
  LineController,
  RadialLinearScale
);

interface QuizAnalyticsProps {
  quizId: string;
  quizTitle: string;
  responses: any[];
  questions: any[];
  quizData?: any;
}

interface FilterOptions {
  ageRange: [number, number];
  gender: string;
  location: string;
  responseDate: string;
}

export default function QuizAnalytics({
  quizId,
  quizTitle,
  responses,
  questions,
  quizData,
}: QuizAnalyticsProps) {
  const [viewMode, setViewMode] = useState<"basic" | "advanced">("basic");
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    ageRange: [0, 100],
    gender: "all",
    location: "all",
    responseDate: "all",
  });

  // 年齢範囲のプリセット
  const ageRanges = [
    { label: "全年代", value: [0, 100] },
    { label: "10代", value: [10, 19] },
    { label: "20代", value: [20, 29] },
    { label: "30代", value: [30, 39] },
    { label: "40代", value: [40, 49] },
    { label: "50代", value: [50, 59] },
    { label: "60代以上", value: [60, 100] },
  ];

  // 性別オプション
  const genderOptions = [
    { label: "全て", value: "all" },
    { label: "男性", value: "male" },
    { label: "女性", value: "female" },
    { label: "その他", value: "other" },
  ];

  // 地域オプション
  const locationOptions = [
    { label: "全て", value: "all" },
    { label: "東京", value: "tokyo" },
    { label: "大阪", value: "osaka" },
    { label: "京都", value: "kyoto" },
    { label: "その他", value: "other" },
  ];

  // フィルタリングされた回答データ
  const filteredResponses = useMemo(() => {
    return responses.filter((response) => {
      // 年齢フィルター
      if (response.demographics?.age) {
        const age = response.demographics.age;
        if (
          age < filterOptions.ageRange[0] ||
          age > filterOptions.ageRange[1]
        ) {
          return false;
        }
      }

      // 性別フィルター
      if (filterOptions.gender !== "all" && response.demographics?.gender) {
        if (response.demographics.gender !== filterOptions.gender) {
          return false;
        }
      }

      // 地域フィルター
      if (filterOptions.location !== "all" && response.location) {
        if (response.location !== filterOptions.location) {
          return false;
        }
      }

      return true;
    });
  }, [responses, filterOptions]);

  // 回答数の集計
  const totalResponses = filteredResponses.length;

  // 統計計算関数
  const calculateStatistics = (values: number[]) => {
    const n = values.length;
    if (n === 0) return { mean: 0, std: 0, median: 0, variance: 0 };

    const mean = values.reduce((a, b) => a + b, 0) / n;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
    const std = Math.sqrt(variance);

    const sorted = [...values].sort((a, b) => a - b);
    const median =
      n % 2 === 0
        ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
        : sorted[Math.floor(n / 2)];

    return { mean, std, median, variance };
  };

  // 偏差値計算
  const calculateZScore = (value: number, mean: number, std: number) => {
    return std === 0 ? 0 : (value - mean) / std;
  };

  // 相関係数計算
  const calculateCorrelation = (x: number[], y: number[]) => {
    const n = x.length;
    if (n !== y.length || n === 0) return 0;

    const xStats = calculateStatistics(x);
    const yStats = calculateStatistics(y);

    let sum = 0;
    for (let i = 0; i < n; i++) {
      sum += (x[i] - xStats.mean) * (y[i] - yStats.mean);
    }

    return sum / (n * xStats.std * yStats.std);
  };

  // 各質問の回答分布を計算（高さ変動対応）
  const getQuestionAnalytics = (questionId: string) => {
    const questionResponses = filteredResponses
      .map((response) =>
        response.answers.find((a: any) => a.questionId === questionId)
      )
      .filter(Boolean);

    const distribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    questionResponses.forEach((answer: any) => {
      if (answer && answer.value >= 1 && answer.value <= 5) {
        distribution[answer.value as keyof typeof distribution]++;
      }
    });

    // データがない場合はデフォルト値を設定
    if (questionResponses.length === 0) {
      distribution[3] = 1; // デフォルトで「どちらでもない」を1件表示
    }

    // 統計情報を計算
    const values = questionResponses
      .map((a: any) => a?.value)
      .filter((v: number) => v >= 1 && v <= 5);

    // データがない場合はデフォルト値を設定
    const defaultValues = values.length === 0 ? [3] : values;
    const stats = calculateStatistics(defaultValues);

    return { distribution, stats, values: defaultValues };
  };

  // 棒グラフのデータ（高さ変動対応）
  const getBarChartData = (questionId: string, questionText: string) => {
    const { distribution, stats } = getQuestionAnalytics(questionId);
    const maxValue = Math.max(...Object.values(distribution));

    // デバッグ情報を出力
    console.log(`質問 ${questionId} の分布:`, distribution);
    console.log(`最大値: ${maxValue}`);

    return {
      labels: ["1", "2", "3", "4", "5"],
      datasets: [
        {
          label: "回答数",
          data: [
            distribution[1],
            distribution[2],
            distribution[3],
            distribution[4],
            distribution[5],
          ],
          backgroundColor: [
            "rgba(255, 99, 132, 0.8)",
            "rgba(255, 159, 64, 0.8)",
            "rgba(255, 205, 86, 0.8)",
            "rgba(75, 192, 192, 0.8)",
            "rgba(54, 162, 235, 0.8)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(255, 159, 64, 1)",
            "rgba(255, 205, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(54, 162, 235, 1)",
          ],
          borderWidth: 1,
          barPercentage: 0.8,
          categoryPercentage: 0.9,
        },
      ],
    };
  };

  // 散布図データ（質問間の相関）
  const getScatterChartData = () => {
    if (questions.length < 2) return null;

    const q1Id = questions[0].id;
    const q2Id = questions[1].id;

    const data = filteredResponses
      .map((response) => {
        const a1 = response.answers.find((a: any) => a.questionId === q1Id);
        const a2 = response.answers.find((a: any) => a.questionId === q2Id);

        if (a1 && a2 && a1.value && a2.value) {
          return { x: a1.value, y: a2.value };
        }
        return null;
      })
      .filter(Boolean);

    return {
      datasets: [
        {
          label: `${questions[0].text} vs ${questions[1].text}`,
          data: data,
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
          pointRadius: 6,
        },
      ],
    };
  };

  // 時系列データ（回答の時間推移）
  const getTimeSeriesData = () => {
    const timeData = filteredResponses
      .map((response) => ({
        date: new Date(response.createdAt || response.timestamp),
        avgScore:
          response.answers.reduce(
            (sum: number, a: any) => sum + (a.value || 0),
            0
          ) / response.answers.length,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    return {
      labels: timeData.map((d) => d.date.toLocaleDateString()),
      datasets: [
        {
          label: "平均スコアの推移",
          data: timeData.map((d) => d.avgScore),
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          tension: 0.1,
        },
      ],
    };
  };

  // 質問別統計データ（平均値、最大値、最小値）
  const getQuestionStatsData = () => {
    const questionStats = questions.map((question) => {
      const questionResponses = filteredResponses
        .map((response) => {
          const answer = response.answers.find(
            (a: any) => a.questionId === question.id
          );
          return answer ? answer.value : null;
        })
        .filter((value): value is number => value !== null);

      if (questionResponses.length === 0) {
        return {
          average: 0,
          max: 0,
          min: 0,
        };
      }

      const average =
        questionResponses.reduce((sum, val) => sum + val, 0) /
        questionResponses.length;
      const max = Math.max(...questionResponses);
      const min = Math.min(...questionResponses);

      return { average, max, min };
    });

    return {
      labels: questions.map((q, index) => {
        // 質問文が長い場合は短縮
        const shortText =
          q.text.length > 20 ? q.text.substring(0, 20) + "..." : q.text;
        return `質問${index + 1}\n${shortText}`;
      }),
      datasets: [
        {
          label: "平均値",
          data: questionStats.map((stat) => stat.average),
          borderColor: "rgba(54, 162, 235, 1)",
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          borderWidth: 3,
          tension: 0.1,
          pointBackgroundColor: "rgba(54, 162, 235, 1)",
          pointBorderColor: "#fff",
          pointRadius: 6,
        },
        {
          label: "最大値",
          data: questionStats.map((stat) => stat.max),
          borderColor: "rgba(255, 99, 132, 1)",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderWidth: 2,
          borderDash: [5, 5],
          tension: 0.1,
          pointBackgroundColor: "rgba(255, 99, 132, 1)",
          pointBorderColor: "#fff",
          pointRadius: 4,
        },
        {
          label: "最小値",
          data: questionStats.map((stat) => stat.min),
          borderColor: "rgba(255, 159, 64, 1)",
          backgroundColor: "rgba(255, 159, 64, 0.2)",
          borderWidth: 2,
          borderDash: [3, 3],
          tension: 0.1,
          pointBackgroundColor: "rgba(255, 159, 64, 1)",
          pointBorderColor: "#fff",
          pointRadius: 4,
        },
      ],
    };
  };

  // 4軸レーダーチャートデータ（軸別の平均スコア）
  const getRadarChartData = () => {
    // クイズデータから軸情報を取得（サンプルデータの場合はデフォルト軸を使用）
    const axes = quizData?.axes || [
      { id: 1, name: "軸1", description: "第1軸" },
      { id: 2, name: "軸2", description: "第2軸" },
      { id: 3, name: "軸3", description: "第3軸" },
      { id: 4, name: "軸4", description: "第4軸" },
    ];

    // 各軸の平均スコアを計算
    const axisAverages = axes.map((axis: Axis) => {
      // その軸に対応する質問を取得
      const axisQuestions = questions.filter((q) => q.axisId === axis.id);

      if (axisQuestions.length === 0) return 0;

      // 各質問の平均スコアを計算
      const questionAverages = axisQuestions.map((question) => {
        const questionResponses = filteredResponses
          .map((response) => {
            const answer = response.answers.find(
              (a: any) => a.questionId === question.id
            );
            return answer ? answer.value : null;
          })
          .filter((value): value is number => value !== null);

        return questionResponses.length > 0
          ? questionResponses.reduce((sum, val) => sum + val, 0) /
              questionResponses.length
          : 0;
      });

      // 軸の平均スコアを計算
      return (
        questionAverages.reduce((sum, val) => sum + val, 0) /
        questionAverages.length
      );
    });

    return {
      labels: axes.map((axis: Axis) => axis.name),
      datasets: [
        {
          label: "軸別平均スコア",
          data: axisAverages,
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 2,
          pointBackgroundColor: "rgba(54, 162, 235, 1)",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgba(54, 162, 235, 1)",
        },
        {
          label: "全体平均",
          data: axes.map(() => 3), // 中央値
          backgroundColor: "rgba(255, 99, 132, 0.1)",
          borderColor: "rgba(255, 99, 132, 0.5)",
          borderWidth: 1,
          borderDash: [5, 5],
          pointBackgroundColor: "rgba(255, 99, 132, 0.5)",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgba(255, 99, 132, 0.5)",
        },
      ],
    };
  };

  // 円グラフのデータ（全体の傾向）
  const getPieChartData = () => {
    const allAnswers = filteredResponses.flatMap((response: any) =>
      response.answers
        .map((a: any) => a.value)
        .filter((v: number) => v >= 1 && v <= 5)
    );

    const distribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    allAnswers.forEach((value: number) => {
      distribution[value as keyof typeof distribution]++;
    });

    // データがない場合はデフォルト値を設定
    if (allAnswers.length === 0) {
      distribution[3] = 1; // デフォルトで「どちらでもない」を1件表示
    }

    return {
      labels: [
        "そう思わない",
        "ややそう思わない",
        "どちらでもない",
        "ややそう思う",
        "そう思う",
      ],
      datasets: [
        {
          data: [
            distribution[1],
            distribution[2],
            distribution[3],
            distribution[4],
            distribution[5],
          ],
          backgroundColor: [
            "rgba(255, 99, 132, 0.8)",
            "rgba(255, 159, 64, 0.8)",
            "rgba(255, 205, 86, 0.8)",
            "rgba(75, 192, 192, 0.8)",
            "rgba(54, 162, 235, 0.8)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(255, 159, 64, 1)",
            "rgba(255, 205, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(54, 162, 235, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "回答分布",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
        // 動的なスケール調整
        suggestedMin: 0,
        suggestedMax: undefined, // 自動調整
      },
      x: {
        ticks: {
          callback: function (value: any, index: number) {
            const labels = [
              "そう思わない",
              "ややそう思わない",
              "どちらでもない",
              "ややそう思う",
              "そう思う",
            ];
            return labels[index] || value;
          },
        },
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
      title: {
        display: true,
        text: "全体の回答傾向",
      },
    },
  };

  const scatterChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "質問間の相関分析",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: questions[0]?.text || "質問1",
        },
        min: 0,
        max: 6,
      },
      y: {
        title: {
          display: true,
          text: questions[1]?.text || "質問2",
        },
        min: 0,
        max: 6,
      },
    },
  };

  const timeSeriesOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "回答の時間推移",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 5,
      },
    },
  };

  const questionStatsOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "質問別統計 - 平均値・最大値・最小値",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 5,
        min: 0,
        ticks: {
          stepSize: 1,
        },
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 0,
          callback: function (value: any, index: number) {
            const labels = questions.map((q, i) => {
              // 質問文が長い場合は短縮
              const shortText =
                q.text.length > 20 ? q.text.substring(0, 20) + "..." : q.text;
              return `質問${i + 1}\n${shortText}`;
            });
            return labels[index] || value;
          },
        },
      },
    },
  };

  const radarChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "4軸レーダーチャート - 質問別平均スコア",
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 5,
        min: 0,
        ticks: {
          stepSize: 1,
        },
        pointLabels: {
          font: {
            size: 12,
          },
        },
      },
    },
  };

  // データがない場合でもグラフを表示するため、条件分岐を削除

  return (
    <Box sx={{ p: 3, pb: 20 }}>
      <Typography
        variant="h4"
        component="h1"
        sx={{ mb: 3, fontWeight: "bold" }}
      >
        {quizTitle} - 分析結果
      </Typography>

      {/* ビューモード切り替え */}
      <Box sx={{ mb: 3 }}>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, newMode) => newMode && setViewMode(newMode)}
          aria-label="view mode"
        >
          <ToggleButton value="basic">基本分析</ToggleButton>
          <ToggleButton value="advanced">高度分析</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* フィルター（フッターより上に固定） */}
      <Box
        sx={{
          position: "fixed",
          bottom: "60px", // フッターの高さ分上に配置
          left: 0,
          right: 0,
          zIndex: 9999,
          height: "60px", // フッターと同じくらいの高さ
          backgroundColor: "#ffffff",
          borderTop: 1,
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
            width: "100%",
            "@media (max-width: 600px)": {
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 1,
            },
          }}
        >
          {/* 年齢フィルター */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="caption"
              sx={{ fontWeight: "bold", minWidth: "60px" }}
            >
              年齢:
            </Typography>
            <Box sx={{ display: "flex", gap: 0.5 }}>
              {ageRanges.map((range) => (
                <Chip
                  key={range.label}
                  label={range.label}
                  size="small"
                  onClick={() =>
                    setFilterOptions((prev) => ({
                      ...prev,
                      ageRange: range.value as [number, number],
                    }))
                  }
                  color={
                    filterOptions.ageRange[0] === range.value[0] &&
                    filterOptions.ageRange[1] === range.value[1]
                      ? "primary"
                      : "default"
                  }
                  variant={
                    filterOptions.ageRange[0] === range.value[0] &&
                    filterOptions.ageRange[1] === range.value[1]
                      ? "filled"
                      : "outlined"
                  }
                  sx={{ cursor: "pointer", fontSize: "0.7rem" }}
                />
              ))}
            </Box>
          </Box>

          {/* 性別フィルター */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              position: "relative",
            }}
          >
            <Typography
              variant="caption"
              sx={{ fontWeight: "bold", minWidth: "40px" }}
            >
              性別:
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 0.5,
                "@media (max-width: 600px)": {
                  position: "relative",
                },
              }}
            >
              {genderOptions.map((option, index) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  size="small"
                  onClick={() =>
                    setFilterOptions((prev) => ({
                      ...prev,
                      gender: option.value,
                    }))
                  }
                  color={
                    filterOptions.gender === option.value
                      ? "primary"
                      : "default"
                  }
                  variant={
                    filterOptions.gender === option.value
                      ? "filled"
                      : "outlined"
                  }
                  sx={{
                    cursor: "pointer",
                    fontSize: "0.7rem",
                    "@media (max-width: 600px)": {
                      position: index > 0 ? "absolute" : "static",
                      bottom: index > 0 ? `${index * 35 + 40}px` : "auto",
                      left: index > 0 ? "50%" : "auto",
                      transform: index > 0 ? "translateX(-50%)" : "none",
                      zIndex: 1000 - index,
                      borderRadius: index > 0 ? "50% 50% 0 0" : "16px",
                      width: index > 0 ? "40px" : "auto",
                      height: index > 0 ? "40px" : "auto",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.6rem",

                      backgroundColor: index === 0 ? "primary.main" : undefined,
                      color: index === 0 ? "white" : undefined,
                    },
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* 地域フィルター */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="caption"
              sx={{ fontWeight: "bold", minWidth: "40px" }}
            >
              地域:
            </Typography>
            <Box sx={{ display: "flex", gap: 0.5 }}>
              {locationOptions.map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  size="small"
                  onClick={() =>
                    setFilterOptions((prev) => ({
                      ...prev,
                      location: option.value,
                    }))
                  }
                  color={
                    filterOptions.location === option.value
                      ? "primary"
                      : "default"
                  }
                  variant={
                    filterOptions.location === option.value
                      ? "filled"
                      : "outlined"
                  }
                  sx={{ cursor: "pointer", fontSize: "0.7rem" }}
                />
              ))}
            </Box>
          </Box>

          {/* フィルター情報とリセット */}
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 1, ml: "auto" }}
          >
            <Typography variant="caption" color="text.secondary">
              {filteredResponses.length} / {responses.length} 件
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() =>
                setFilterOptions({
                  ageRange: [0, 100],
                  gender: "all",
                  location: "all",
                  responseDate: "all",
                })
              }
              sx={{ fontSize: "0.7rem", py: 0.5 }}
            >
              リセット
            </Button>
          </Box>
        </Box>
      </Box>

      {/* 基本統計 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            基本統計
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}>
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="h4"
                  color="primary.main"
                  sx={{ fontWeight: "bold" }}
                >
                  {totalResponses}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  総回答数
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="h4"
                  color="secondary.main"
                  sx={{ fontWeight: "bold" }}
                >
                  {questions.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  質問数
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="h4"
                  color="success.main"
                  sx={{ fontWeight: "bold" }}
                >
                  {Math.round((totalResponses / 100) * 100) / 100}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  平均回答率
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="h4"
                  color="info.main"
                  sx={{ fontWeight: "bold" }}
                >
                  {new Date().toLocaleDateString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  最終更新
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* 高度分析の統計情報 */}
      {viewMode === "advanced" && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              高度統計情報
            </Typography>
            <Grid container spacing={2}>
              {questions.map((question, index) => {
                const { stats } = getQuestionAnalytics(question.id);
                return (
                  <Grid item xs={12} md={6} key={question.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                          質問{index + 1}: {question.text}
                        </Typography>
                        <Grid container spacing={1}>
                          <Grid item xs={6}>
                            <Typography variant="caption">平均値</Typography>
                            <Typography variant="body2">
                              {stats.mean.toFixed(2)}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption">標準偏差</Typography>
                            <Typography variant="body2">
                              {stats.std.toFixed(2)}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption">中央値</Typography>
                            <Typography variant="body2">
                              {stats.median.toFixed(2)}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption">分散</Typography>
                            <Typography variant="body2">
                              {stats.variance.toFixed(2)}
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* 全体の回答傾向（円グラフ） */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            全体の回答傾向
          </Typography>
          <Box sx={{ height: 400, display: "flex", justifyContent: "center" }}>
            <Pie data={getPieChartData()} options={pieChartOptions} />
          </Box>
        </CardContent>
      </Card>

      {/* 高度分析の追加グラフ */}
      {viewMode === "advanced" && (
        <>
          {/* 相関分析（散布図） */}
          {questions.length >= 2 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  質問間の相関分析
                </Typography>
                <Box sx={{ height: 400 }}>
                  <Scatter
                    data={getScatterChartData()!}
                    options={scatterChartOptions}
                  />
                </Box>
              </CardContent>
            </Card>
          )}

          {/* 4軸レーダーチャート */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                4軸レーダーチャート - 質問別分析
              </Typography>
              <Box sx={{ height: 400 }}>
                <Radar data={getRadarChartData()} options={radarChartOptions} />
              </Box>
            </CardContent>
          </Card>

          {/* 質問別統計（線グラフ） */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                質問別統計 - 平均値・最大値・最小値
              </Typography>
              <Box sx={{ height: 400 }}>
                <Line
                  data={getQuestionStatsData()}
                  options={questionStatsOptions}
                />
              </Box>
            </CardContent>
          </Card>

          {/* 時系列分析 */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                回答の時間推移
              </Typography>
              <Box sx={{ height: 400 }}>
                <Line data={getTimeSeriesData()} options={timeSeriesOptions} />
              </Box>
            </CardContent>
          </Card>
        </>
      )}

      {/* 各質問の詳細分析（棒グラフ） */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        質問別分析（回答分布）
      </Typography>
      <Grid container spacing={3}>
        {questions.map((question, index) => {
          const { stats } = getQuestionAnalytics(question.id);
          return (
            <Grid item xs={12} md={6} lg={4} key={question.id}>
              <Card>
                <CardContent>
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 2, fontWeight: "bold", fontSize: "0.9rem" }}
                  >
                    質問{index + 1}: {question.text}
                  </Typography>

                  {/* 高度分析の統計情報 */}
                  {viewMode === "advanced" && (
                    <Box sx={{ mb: 2 }}>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="caption">
                            平均: {stats.mean.toFixed(2)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption">
                            標準偏差: {stats.std.toFixed(2)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption">
                            中央値: {stats.median.toFixed(2)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption">
                            分散: {stats.variance.toFixed(2)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  <Box sx={{ height: 250 }}>
                    <Bar
                      data={getBarChartData(question.id, question.text)}
                      options={chartOptions}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
