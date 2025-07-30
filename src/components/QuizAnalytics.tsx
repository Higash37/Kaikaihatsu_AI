import { BarChart, PieChart, ShowChart, BubbleChart, Timeline, Close, Fullscreen, FilterList } from '@mui/icons-material';
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
  IconButton,
  Modal,
  Backdrop,
  Fade,
  ButtonGroup,
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
import React, { useState, useMemo } from "react";
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

// 診断結果の座標データの型
interface DiagnosisCoordinate {
  x: number;
  y: number;
  resultName: string;
  count: number;
}

interface FilterOptions {
  ageRange: [number, number];
  gender: string;
  location: string;
  responseDate: string;
}

type ChartType = 'bar' | 'pie' | 'line' | 'scatter' | 'radar' | 'stats';

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
  const [chartTypes, setChartTypes] = useState<{ [key: string]: ChartType }>({
    overall: 'pie',
    questions: 'bar'
  });
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [isScrolling, setIsScrolling] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{
    title: string;
    subtitle?: string;
    chartType: ChartType;
    data: any;
    options: any;
    questionId?: string;
  } | null>(null);

  // ウィンドウサイズの変更を検知
  React.useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // スクロール検知
  React.useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;
    
    const handleScroll = () => {
      setIsScrolling(true);
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 1000); // スクロール停止後1秒で元に戻す
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

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

  // モーダルを開く関数
  const openModal = (
    title: string,
    subtitle: string,
    chartType: ChartType,
    data: any,
    options: any,
    questionId?: string
  ) => {
    setModalContent({
      title,
      subtitle,
      chartType,
      data,
      options,
      questionId
    });
    setModalOpen(true);
  };

  // モーダルを閉じる関数
  const closeModal = () => {
    setModalOpen(false);
    setModalContent(null);
  };

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

  // 4軸診断システムの座標分析
  const coordinateAnalysis = useMemo(() => {
    if (!quizData?.questions?.results || filteredResponses.length === 0) {
      return null;
    }

    // 回答から座標を計算する
    const calculateCoordinatesFromAnswers = (answers: any[]) => {
      const questions = quizData.questions?.questions || [];
      let totalXWeight = 0;
      let totalYWeight = 0;
      let questionCount = 0;

      answers.forEach((answer) => {
        const question = questions.find((q: any) => q.id === answer.questionId);
        if (question && answer.value !== undefined) {
          const normalizedScore = (answer.value - 3) / 2; // 1-5を-1〜1に変換
          totalXWeight += normalizedScore * (question.axisWeights?.x || 0);
          totalYWeight += normalizedScore * (question.axisWeights?.y || 0);
          questionCount++;
        }
      });

      return {
        x: questionCount > 0 ? totalXWeight / questionCount : 0,
        y: questionCount > 0 ? totalYWeight / questionCount : 0
      };
    };

    // 各回答の座標を計算
    const coordinateData: DiagnosisCoordinate[] = [];
    const results = quizData.questions.results;

    filteredResponses.forEach((response) => {
      const coord = calculateCoordinatesFromAnswers(response.answers || []);
      
      // 最も近い結果を見つける
      let closestResult = results[0];
      let minDistance = Infinity;

      results.forEach((result: any) => {
        const distance = Math.sqrt(
          Math.pow(result.x - coord.x, 2) + Math.pow(result.y - coord.y, 2)
        );
        if (distance < minDistance) {
          minDistance = distance;
          closestResult = result;
        }
      });

      // 既存の座標データを探す
      const existingCoord = coordinateData.find(
        c => c.resultName === closestResult.name
      );

      if (existingCoord) {
        existingCoord.count++;
      } else {
        coordinateData.push({
          x: coord.x,
          y: coord.y,
          resultName: closestResult.name,
          count: 1
        });
      }
    });

    return coordinateData;
  }, [filteredResponses, quizData]);

  // 軸別スコア分析
  const axisAnalysis = useMemo(() => {
    if (!quizData?.questions?.axes || filteredResponses.length === 0) {
      return null;
    }

    const axes = quizData.questions.axes;
    const questions = quizData.questions.questions || [];

    return axes.map((axis: any) => {
      const axisScores: number[] = [];

      filteredResponses.forEach(response => {
        let axisTotal = 0;
        let axisCount = 0;

        (response.answers || []).forEach((answer: any) => {
          const question = questions.find((q: any) => q.id === answer.questionId);
          if (question && answer.value !== undefined) {
            let axisInfluence = 0;
            if (axis.id === 1) { // X軸
              axisInfluence = Math.abs(question.axisWeights?.x || 0);
            } else if (axis.id === 2) { // Y軸
              axisInfluence = Math.abs(question.axisWeights?.y || 0);
            }

            if (axisInfluence > 0) {
              axisTotal += answer.value;
              axisCount++;
            }
          }
        });

        if (axisCount > 0) {
          axisScores.push(axisTotal / axisCount);
        }
      });

      const stats = calculateStatistics(axisScores);
      return {
        axis,
        scores: axisScores,
        statistics: stats,
        distribution: axisScores.reduce((acc, score) => {
          const bucket = Math.floor(score);
          acc[bucket] = (acc[bucket] || 0) + 1;
          return acc;
        }, {} as Record<number, number>)
      };
    });
  }, [filteredResponses, quizData]);

  // 偏差値計算
  const _calculateZScore = (value: number, mean: number, std: number) => {
    return std === 0 ? 0 : (value - mean) / std;
  };

  // 相関係数計算  
  const _calculateCorrelation = (x: number[], y: number[]) => {
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
  const getBarChartData = (questionId: string, _questionText: string) => {
    const { distribution, stats: _stats } = getQuestionAnalytics(questionId);
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
            "rgba(102, 126, 234, 0.2)",
            "rgba(102, 126, 234, 0.4)",
            "rgba(102, 126, 234, 0.6)",
            "rgba(102, 126, 234, 0.8)",
            "rgba(102, 126, 234, 1.0)",
          ],
          borderColor: [
            "rgba(102, 126, 234, 0.4)",
            "rgba(102, 126, 234, 0.6)",
            "rgba(102, 126, 234, 0.8)",
            "rgba(102, 126, 234, 1.0)",
            "rgba(90, 103, 216, 1.0)",
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

  // 2軸座標グラフデータ（診断結果プロット）
  const getCoordinateGraphData = () => {
    const axes = quizData?.axes || [];
    if (axes.length < 2) return null;

    const data = filteredResponses
      .map((response) => {
        if (!response.result_data?.coordinates) return null;
        return {
          x: response.result_data.coordinates.x || 0,
          y: response.result_data.coordinates.y || 0,
          label: response.user_id?.substring(0, 8) || 'Anonymous'
        };
      })
      .filter(Boolean);

    return {
      datasets: [
        {
          label: '回答者の分布',
          data: data,
          backgroundColor: "rgba(102, 126, 234, 0.6)",
          borderColor: "rgba(102, 126, 234, 1)",
          borderWidth: 1,
          pointRadius: 8,
        },
      ],
    };
  };

  // 4軸座標グラフデータ （レーダーチャート風の4軸表示）
  const get4AxisCoordinateData = () => {
    const axes = quizData?.axes || [];
    if (axes.length < 4) return null;

    // 各回答者の4軸スコアを計算
    const responseData = filteredResponses.map((response, index) => {
      const axisScores = axes.map((axis: any) => {
        // 各軸に対応する質問群のスコアを計算
        const axisQuestions = questions.filter((q) => q.axisId === axis.id);
        if (axisQuestions.length === 0) return 0;

        const questionScores = axisQuestions.map((question) => {
          const answer = response.answers?.find((a: any) => a.questionId === question.id);
          return answer ? answer.value || 0 : 0;
        });

        return questionScores.reduce((sum, score) => sum + score, 0) / questionScores.length;
      });

      return {
        label: `回答者${index + 1}`,
        data: axisScores,
        backgroundColor: `rgba(102, 126, 234, ${0.1 + (index % 10) * 0.05})`,
        borderColor: `rgba(102, 126, 234, ${0.5 + (index % 10) * 0.05})`,
        borderWidth: 1,
        pointBackgroundColor: `rgba(102, 126, 234, ${0.7 + (index % 10) * 0.03})`,
        pointBorderColor: '#fff',
        pointRadius: 3,
      };
    });

    return {
      labels: axes.map((axis: any) => axis.name),
      datasets: responseData.slice(0, 10) // 最大10人まで表示
    };
  };

  // 4軸平均スコア比較データ
  const get4AxisAverageData = () => {
    const axes = quizData?.axes || [];
    if (axes.length < 4) return null;

    // 各軸の平均スコアを計算
    const axisAverages = axes.map((axis: any) => {
      const axisQuestions = questions.filter((q) => q.axisId === axis.id);
      if (axisQuestions.length === 0) return 0;

      const allScores = filteredResponses.flatMap((response) => {
        return axisQuestions.map((question) => {
          const answer = response.answers?.find((a: any) => a.questionId === question.id);
          return answer ? answer.value || 0 : 0;
        });
      });

      return allScores.length > 0 ? allScores.reduce((sum, score) => sum + score, 0) / allScores.length : 0;
    });

    return {
      labels: axes.map((axis: any) => axis.name),
      datasets: [
        {
          label: '平均スコア',
          data: axisAverages,
          backgroundColor: 'rgba(102, 126, 234, 0.3)',
          borderColor: 'rgba(102, 126, 234, 1)',
          borderWidth: 3,
          pointBackgroundColor: 'rgba(102, 126, 234, 1)',
          pointBorderColor: '#fff',
          pointRadius: 6,
          fill: true,
        },
        {
          label: '理想値',
          data: axes.map(() => 4), // 理想的なスコア4
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          borderColor: 'rgba(102, 126, 234, 0.5)',
          borderWidth: 2,
          borderDash: [5, 5],
          pointBackgroundColor: 'rgba(102, 126, 234, 0.5)',
          pointBorderColor: '#fff',
          pointRadius: 4,
          fill: false,
        },
      ],
    };
  };

  // 高度な統計分析
  const _getAdvancedStatistics = () => {
    const allValues = questions.map(q => {
      const values = filteredResponses
        .map(r => r.answers.find((a: any) => a.questionId === q.id)?.value)
        .filter((v): v is number => v != null);
      return { questionId: q.id, values };
    });

    // 歪度（Skewness）計算
    const calculateSkewness = (values: number[]) => {
      const stats = calculateStatistics(values);
      if (stats.std === 0) return 0;
      const n = values.length;
      const skew = values.reduce((sum, v) => sum + Math.pow((v - stats.mean) / stats.std, 3), 0) / n;
      return skew;
    };

    // 尖度（Kurtosis）計算
    const calculateKurtosis = (values: number[]) => {
      const stats = calculateStatistics(values);
      if (stats.std === 0) return 0;
      const n = values.length;
      const kurt = values.reduce((sum, v) => sum + Math.pow((v - stats.mean) / stats.std, 4), 0) / n - 3;
      return kurt;
    };

    // 信頼性係数（クロンバックのα）の簡易計算
    const calculateCronbachAlpha = () => {
      const k = questions.length;
      if (k < 2) return 0;
      
      const itemVariances = allValues.map(({ values }) => {
        const stats = calculateStatistics(values);
        return stats.variance;
      });
      
      const totalScores = filteredResponses.map(r => 
        r.answers.reduce((sum: number, a: any) => sum + (a.value || 0), 0)
      );
      const totalVariance = calculateStatistics(totalScores).variance;
      
      const sumItemVariances = itemVariances.reduce((sum, v) => sum + v, 0);
      const alpha = (k / (k - 1)) * (1 - sumItemVariances / totalVariance);
      
      return alpha;
    };

    return {
      skewness: allValues.map(({ questionId, values }) => ({
        questionId,
        value: calculateSkewness(values)
      })),
      kurtosis: allValues.map(({ questionId, values }) => ({
        questionId,
        value: calculateKurtosis(values)
      })),
      cronbachAlpha: calculateCronbachAlpha(),
      sampleSize: filteredResponses.length,
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
          borderColor: "rgba(102, 126, 234, 1)",
          backgroundColor: "rgba(102, 126, 234, 0.2)",
          borderWidth: 2,
          borderDash: [5, 5],
          tension: 0.1,
          pointBackgroundColor: "rgba(102, 126, 234, 1)",
          pointBorderColor: "#fff",
          pointRadius: 4,
        },
        {
          label: "最小値",
          data: questionStats.map((stat) => stat.min),
          borderColor: "rgba(102, 126, 234, 0.7)",
          backgroundColor: "rgba(102, 126, 234, 0.1)",
          borderWidth: 2,
          borderDash: [3, 3],
          tension: 0.1,
          pointBackgroundColor: "rgba(102, 126, 234, 0.7)",
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
          backgroundColor: "rgba(102, 126, 234, 0.1)",
          borderColor: "rgba(102, 126, 234, 0.5)",
          borderWidth: 1,
          borderDash: [5, 5],
          pointBackgroundColor: "rgba(102, 126, 234, 0.5)",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgba(102, 126, 234, 0.5)",
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
            "rgba(102, 126, 234, 0.2)",
            "rgba(102, 126, 234, 0.4)",
            "rgba(102, 126, 234, 0.6)",
            "rgba(102, 126, 234, 0.8)",
            "rgba(102, 126, 234, 1.0)",
          ],
          borderColor: [
            "rgba(102, 126, 234, 0.4)",
            "rgba(102, 126, 234, 0.6)",
            "rgba(102, 126, 234, 0.8)",
            "rgba(102, 126, 234, 1.0)",
            "rgba(90, 103, 216, 1.0)",
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // 統計サマリー用のデータ作成（箱ひげ図の代替）
  const getStatsSummaryData = (questionId: string) => {
    const { stats, values } = getQuestionAnalytics(questionId);
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)] || 0;
    const q3 = sorted[Math.floor(sorted.length * 0.75)] || 0;
    
    return {
      labels: ['最小値', '第1四分位', '中央値', '第3四分位', '最大値'],
      datasets: [{
        label: '統計値',
        data: [
          Math.min(...values) || 0,
          q1,
          stats.median,
          q3,
          Math.max(...values) || 0
        ],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        tension: 0.4,
        fill: false,
      }]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          padding: 10,
          font: {
            size: 11
          },
          boxWidth: 12,
        }
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: {
            size: 10
          }
        },
        suggestedMin: 0,
        suggestedMax: undefined,
      },
      x: {
        ticks: {
          font: {
            size: 9
          },
          autoSkip: false,
          maxRotation: 45,
          minRotation: 0,
          callback: function (value: any, index: number) {
            const labels = [
              "そう思わない",
              "ややそう思わない",
              "どちらでもない",
              "ややそう思う",
              "そう思う",
            ];
            // モバイルでは短縮表示
            if (windowWidth < 600) {
              const shortLabels = ["1", "2", "3", "4", "5"];
              return shortLabels[index] || value;
            }
            return labels[index] || value;
          },
        },
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: windowWidth < 768 ? "bottom" as const : "right" as const,
        labels: {
          padding: windowWidth < 768 ? 10 : 20,
          font: {
            size: windowWidth < 768 ? 10 : 12
          },
          boxWidth: windowWidth < 768 ? 12 : 16,
        }
      },
      title: {
        display: false,
      },
    },
  };


  const _scatterChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: windowWidth >= 768,
        position: "top" as const,
        labels: {
          font: {
            size: 10
          }
        }
      },
      title: {
        display: true,
        text: windowWidth < 768 ? "相関分析" : "質問間の相関分析",
        font: {
          size: windowWidth < 768 ? 12 : 14
        }
      },
    },
    scales: {
      x: {
        title: {
          display: windowWidth >= 768,
          text: questions[0]?.text?.substring(0, 20) + "..." || "質問1",
          font: {
            size: 10
          }
        },
        min: 0,
        max: 6,
        ticks: {
          font: {
            size: 9
          }
        }
      },
      y: {
        title: {
          display: windowWidth >= 768,
          text: questions[1]?.text?.substring(0, 20) + "..." || "質問2",
          font: {
            size: 10
          }
        },
        min: 0,
        max: 6,
        ticks: {
          font: {
            size: 9
          }
        }
      },
    },
  };

  const timeSeriesOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          font: {
            size: windowWidth < 768 ? 10 : 12
          }
        }
      },
      title: {
        display: true,
        text: windowWidth < 768 ? "時間推移" : "回答の時間推移",
        font: {
          size: windowWidth < 768 ? 12 : 14
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 5,
        ticks: {
          font: {
            size: windowWidth < 768 ? 9 : 11
          }
        }
      },
      x: {
        ticks: {
          font: {
            size: windowWidth < 768 ? 8 : 10
          },
          maxRotation: windowWidth < 768 ? 45 : 0,
          callback: function(value: any, index: number, _values: any[]) {
            if (windowWidth < 768) {
              // モバイルでは日付を短縮
              return index % 2 === 0 ? value : '';
            }
            return value;
          }
        }
      }
    },
  };

  const questionStatsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: windowWidth < 768 ? "bottom" as const : "top" as const,
        labels: {
          font: {
            size: windowWidth < 768 ? 9 : 11
          },
          boxWidth: windowWidth < 768 ? 10 : 15,
        }
      },
      title: {
        display: true,
        text: windowWidth < 768 ? "質問別統計" : "質問別統計 - 平均値・最大値・最小値",
        font: {
          size: windowWidth < 768 ? 12 : 14
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 5,
        min: 0,
        ticks: {
          stepSize: 1,
          font: {
            size: windowWidth < 768 ? 9 : 11
          }
        },
      },
      x: {
        ticks: {
          maxRotation: windowWidth < 768 ? 90 : 45,
          minRotation: windowWidth < 768 ? 45 : 0,
          font: {
            size: windowWidth < 768 ? 8 : 10
          },
          callback: function (value: any, index: number) {
            if (windowWidth < 768) {
              // モバイルでは質問番号のみ
              return `Q${index + 1}`;
            }
            const labels = questions.map((q, i) => {
              const _shortText =
                q.text.length > 20 ? q.text.substring(0, 20) + "..." : q.text;
              return `質問${i + 1}`;
            });
            return labels[index] || value;
          },
        },
      },
    },
  };

  const radarChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          font: {
            size: windowWidth < 768 ? 10 : 12
          }
        }
      },
      title: {
        display: true,
        text: "4軸レーダーチャート",
        font: {
          size: windowWidth < 768 ? 14 : 16
        }
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 5,
        min: 0,
        ticks: {
          stepSize: 1,
          font: {
            size: windowWidth < 768 ? 9 : 11
          }
        },
        pointLabels: {
          font: {
            size: windowWidth < 768 ? 10 : 12,
          },
        },
      },
    },
  };

  // データがない場合でもグラフを表示するため、条件分岐を削除

  return (
    <Box sx={{ pb: { xs: '140px', sm: '160px' } }}>
      <Typography
        variant="h4"
        component="h1"
        sx={{ mb: 1.5, fontWeight: "bold", fontSize: { xs: '1.5rem', sm: '2rem' } }}
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

      {/* 4軸診断システムの座標分析（新機能） */}
      {coordinateAnalysis && coordinateAnalysis.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" component="h2" sx={{ mb: 2, fontWeight: "bold" }}>
              📍 座標分析（4軸診断システム）
            </Typography>
            
            <Grid container spacing={2}>
              {/* 結果分布 */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: "bold" }}>
                  診断結果の分布
                </Typography>
                <Box sx={{ maxHeight: 300, overflowY: "auto" }}>
                  {coordinateAnalysis.map((coord, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        p: 1,
                        mb: 1,
                        backgroundColor: "#f5f5f5",
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="body2">
                        {coord.resultName}
                      </Typography>
                      <Chip 
                        label={`${coord.count}人`} 
                        color="primary" 
                        size="small"
                      />
                    </Box>
                  ))}
                </Box>
              </Grid>

              {/* 座標散布図 */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: "bold" }}>
                  座標分布図
                </Typography>
                <Box sx={{ height: 300, position: "relative" }}>
                  <Scatter
                    data={{
                      datasets: [{
                        label: "診断結果",
                        data: coordinateAnalysis.map(coord => ({
                          x: coord.x * 100, // -1〜1を-100〜100に変換
                          y: coord.y * 100,
                          r: Math.max(coord.count * 3, 5) // バブルサイズを回答数に比例
                        })),
                        backgroundColor: "rgba(54, 162, 235, 0.6)",
                        borderColor: "rgba(54, 162, 235, 1)",
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        x: {
                          min: -100,
                          max: 100,
                          title: {
                            display: true,
                            text: quizData?.questions?.axes?.[0]?.name || "X軸"
                          }
                        },
                        y: {
                          min: -100,
                          max: 100,
                          title: {
                            display: true,
                            text: quizData?.questions?.axes?.[1]?.name || "Y軸"
                          }
                        }
                      },
                      plugins: {
                        tooltip: {
                          callbacks: {
                            label: (context: any) => {
                              const dataIndex = context.dataIndex;
                              const coord = coordinateAnalysis[dataIndex];
                              return `${coord.resultName}: ${coord.count}人`;
                            }
                          }
                        }
                      }
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* 軸別スコア分析（新機能） */}
      {axisAnalysis && axisAnalysis.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" component="h2" sx={{ mb: 2, fontWeight: "bold" }}>
              📊 軸別スコア分析
            </Typography>
            
            <Grid container spacing={2}>
              {axisAnalysis.map((analysis: any, index: any) => (
                <Grid item xs={12} md={6} key={index}>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: "bold" }}>
                    {analysis.axis.name}
                  </Typography>
                  
                  {/* 統計情報 */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      平均: {analysis.statistics.mean.toFixed(2)} | 
                      中央値: {analysis.statistics.median.toFixed(2)} | 
                      標準偏差: {analysis.statistics.std.toFixed(2)}
                    </Typography>
                  </Box>

                  {/* スコア分布バー */}
                  <Box sx={{ height: 200 }}>
                    <Bar
                      data={{
                        labels: ["1点", "2点", "3点", "4点", "5点"],
                        datasets: [{
                          label: "回答数",
                          data: [
                            analysis.distribution[1] || 0,
                            analysis.distribution[2] || 0,
                            analysis.distribution[3] || 0,
                            analysis.distribution[4] || 0,
                            analysis.distribution[5] || 0,
                          ],
                          backgroundColor: "rgba(54, 162, 235, 0.6)",
                          borderColor: "rgba(54, 162, 235, 1)",
                          borderWidth: 1,
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              stepSize: 1
                            }
                          }
                        }
                      }}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* フィルター（フッターより上に固定） - モーダル開いてる時は非表示 */}
      <Box
        sx={{
          position: "fixed",
          bottom: { xs: "56px", sm: "60px" },
          left: 0,
          right: 0,
          zIndex: 9999,
          minHeight: { xs: "70px", sm: "60px" },
          backgroundColor: "#ffffff",
          borderTop: 1,
          borderColor: "divider",
          display: modalOpen ? "none" : "flex",
          alignItems: "center",
          padding: { xs: "8px 12px", sm: "0 16px" },
          overflowX: "auto",
          opacity: isScrolling ? 0.3 : 1,
          transition: "opacity 0.3s ease-in-out",
          "&:hover": {
            opacity: 1,
          },
          "&::-webkit-scrollbar": {
            height: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(0,0,0,0.2)",
            borderRadius: "2px",
          },
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
      <Card sx={{ mb: 1.5, boxShadow: 1 }}>
        <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Typography variant="h6" sx={{ mb: 1.5, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
            基本統計
          </Typography>
          <Grid container spacing={{ xs: 1, sm: 2 }}>
            <Grid item xs={6} md={3}>
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="h5"
                  color="primary.main"
                  sx={{ fontWeight: "bold", fontSize: { xs: "1.5rem", sm: "1.75rem" } }}
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
                  variant="h5"
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
                  variant="h5"
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
                  variant="h5"
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
        <Card sx={{ mb: 1.5, boxShadow: 1 }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 1.5 }}>
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

      {/* メイングラフセクション（2列レイアウト） */}
      <Grid container spacing={{ xs: 1, sm: 2 }}>
        {/* 全体の回答傾向 */}
        <Grid item xs={12} md={6}>
          <Card sx={{ mb: 1.5, boxShadow: 2, height: '100%' }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 1.5,
                flexWrap: 'wrap',
                gap: 1
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ 
                    width: 24, 
                    height: 24, 
                    borderRadius: '50%',
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <PieChart sx={{ fontSize: 14, color: 'white' }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' }, fontWeight: 600 }}>
                    全体の回答傾向
                  </Typography>
                </Box>
                <ToggleButtonGroup
                  value={chartTypes.overall}
                  exclusive
                  onChange={(_, newType) => newType && setChartTypes(prev => ({ ...prev, overall: newType }))}
                  size="small"
                  sx={{
                    '& .MuiToggleButton-root': {
                      border: '1px solid #667eea',
                      color: '#667eea',
                      '&.Mui-selected': {
                        backgroundColor: '#667eea',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: '#5a67d8',
                        }
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                      }
                    }
                  }}
                >
                  <ToggleButton value="pie" aria-label="pie chart">
                    <PieChart fontSize="small" />
                  </ToggleButton>
                  <ToggleButton value="bar" aria-label="bar chart">
                    <BarChart fontSize="small" />
                  </ToggleButton>
                  <ToggleButton value="line" aria-label="line chart">
                    <ShowChart fontSize="small" />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.8rem' }}>
                回答者の選択傾向を可視化
              </Typography>
              <Box sx={{ 
                height: { xs: 250, sm: 280, md: 320 }, 
                position: 'relative',
                flexGrow: 1,
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                borderRadius: 2,
                p: 1,
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 'inset 0 0 10px rgba(102, 126, 234, 0.2)',
                  transition: 'box-shadow 0.3s ease'
                }
              }}
              onClick={() => {
                const data = chartTypes.overall === 'pie' ? getPieChartData() : 
                            chartTypes.overall === 'bar' ? {
                              labels: ["そう思わない", "ややそう思わない", "どちらでもない", "ややそう思う", "そう思う"],
                              datasets: [{
                                label: "回答数",
                                data: (() => {
                                  const pieData = getPieChartData();
                                  return pieData.datasets[0].data;
                                })(),
                                backgroundColor: [
                                  "rgba(102, 126, 234, 0.2)",
                                  "rgba(102, 126, 234, 0.4)",
                                  "rgba(102, 126, 234, 0.6)",
                                  "rgba(102, 126, 234, 0.8)",
                                  "rgba(102, 126, 234, 1.0)",
                                ],
                                borderColor: [
                                  "rgba(102, 126, 234, 0.4)",
                                  "rgba(102, 126, 234, 0.6)",
                                  "rgba(102, 126, 234, 0.8)",
                                  "rgba(102, 126, 234, 1.0)",
                                  "rgba(90, 103, 216, 1.0)",
                                ],
                                borderWidth: 1,
                              }]
                            } : getTimeSeriesData();
                const options = chartTypes.overall === 'pie' ? pieChartOptions : 
                               chartTypes.overall === 'bar' ? chartOptions : timeSeriesOptions;
                openModal(
                  '全体の回答傾向',
                  '回答者の選択傾向を可視化',
                  chartTypes.overall === 'line' ? 'line' : chartTypes.overall,
                  data,
                  options
                );
              }}
              >
                <IconButton 
                  sx={{ 
                    position: 'absolute', 
                    top: 8, 
                    right: 8, 
                    zIndex: 1,
                    backgroundColor: 'rgba(255,255,255,0.8)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.9)',
                    }
                  }}
                  size="small"
                >
                  <Fullscreen fontSize="small" />
                </IconButton>
                {chartTypes.overall === 'pie' && <Pie data={getPieChartData()} options={pieChartOptions} />}
                {chartTypes.overall === 'bar' && (
                  <Bar 
                    data={{
                      labels: ["そう思わない", "ややそう思わない", "どちらでもない", "ややそう思う", "そう思う"],
                      datasets: [{
                        label: "回答数",
                        data: (() => {
                          const pieData = getPieChartData();
                          return pieData.datasets[0].data;
                        })(),
                        backgroundColor: [
                          "rgba(102, 126, 234, 0.2)",
                          "rgba(102, 126, 234, 0.4)",
                          "rgba(102, 126, 234, 0.6)",
                          "rgba(102, 126, 234, 0.8)",
                          "rgba(102, 126, 234, 1.0)",
                        ],
                        borderColor: [
                          "rgba(102, 126, 234, 0.4)",
                          "rgba(102, 126, 234, 0.6)",
                          "rgba(102, 126, 234, 0.8)",
                          "rgba(102, 126, 234, 1.0)",
                          "rgba(90, 103, 216, 1.0)",
                        ],
                        borderWidth: 1,
                      }]
                    }} 
                    options={chartOptions} 
                  />
                )}
                {chartTypes.overall === 'line' && <Line data={getTimeSeriesData()} options={timeSeriesOptions} />}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 4軸レーダーチャート */}
        <Grid item xs={12} md={6}>
          <Card sx={{ mb: 1.5, boxShadow: 2, height: '100%' }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <Box sx={{ 
                  width: 24, 
                  height: 24, 
                  borderRadius: '50%',
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ShowChart sx={{ fontSize: 14, color: 'white' }} />
                </Box>
                <Typography variant="h6" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' }, fontWeight: 600 }}>
                  4軸レーダーチャート
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.8rem' }}>
                軸別の平均スコア比較
              </Typography>
              <Box sx={{ 
                height: { xs: 250, sm: 280, md: 320 }, 
                position: 'relative',
                flexGrow: 1,
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                borderRadius: 2,
                p: 1,
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 'inset 0 0 10px rgba(102, 126, 234, 0.2)',
                  transition: 'box-shadow 0.3s ease'
                }
              }}
              onClick={() => {
                openModal(
                  '4軸レーダーチャート',
                  '軸別の平均スコア比較',
                  'radar',
                  getRadarChartData(),
                  radarChartOptions
                );
              }}
              >
                <IconButton 
                  sx={{ 
                    position: 'absolute', 
                    top: 8, 
                    right: 8, 
                    zIndex: 1,
                    backgroundColor: 'rgba(255,255,255,0.8)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.9)',
                    }
                  }}
                  size="small"
                >
                  <Fullscreen fontSize="small" />
                </IconButton>
                <Radar data={getRadarChartData()} options={radarChartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 高度分析の追加グラフ（2軸座標・相関分析 2列レイアウト） */}
      {viewMode === "advanced" && (
        <>
          <Grid container spacing={{ xs: 1, sm: 2 }}>
            {/* 2軸座標グラフ（診断結果プロット） */}
            {quizData?.axes?.length >= 2 && (
              <Grid item xs={12} md={6}>
                <Card sx={{ mb: 1.5, boxShadow: 2, height: '100%' }}>
                  <CardContent sx={{ p: { xs: 1.5, sm: 2 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                      <Box sx={{ 
                        width: 24, 
                        height: 24, 
                        borderRadius: '50%',
                        background: 'linear-gradient(45deg, #ff6b6b, #ff8e53)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <BubbleChart sx={{ fontSize: 14, color: 'white' }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' }, fontWeight: 600 }}>
                        診断結果マップ
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.8rem' }}>
                      {quizData.axes[0]?.name || 'X軸'} × {quizData.axes[1]?.name || 'Y軸'}
                    </Typography>
                    <Box sx={{ 
                      height: { xs: 250, sm: 280, md: 320 }, 
                      position: 'relative',
                      flexGrow: 1,
                      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                      borderRadius: 2,
                      p: 1,
                      cursor: 'pointer',
                      '&:hover': {
                        boxShadow: 'inset 0 0 10px rgba(102, 126, 234, 0.2)',
                        transition: 'box-shadow 0.3s ease'
                      }
                    }}
                    onClick={() => {
                      const scatterOptions = {
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              display: true,
                              position: 'top' as const,
                              labels: {
                                font: { size: 11, weight: 'normal' },
                                usePointStyle: true,
                                pointStyle: 'circle',
                                boxWidth: 8,
                                padding: 15
                              }
                            },
                            tooltip: {
                              backgroundColor: 'rgba(0,0,0,0.8)',
                              titleColor: 'white',
                              bodyColor: 'white',
                              borderColor: '#ff6b6b',
                              borderWidth: 1,
                              cornerRadius: 8,
                              callbacks: {
                                title: function(context: any) {
                                  return `回答者: ${context[0].raw.label || 'Anonymous'}`;
                                },
                                label: function(context: any) {
                                  return [`${quizData.axes[0]?.name || 'X軸'}: ${context.parsed.x}`, 
                                         `${quizData.axes[1]?.name || 'Y軸'}: ${context.parsed.y}`];
                                }
                              }
                            }
                          },
                          scales: {
                            x: {
                              title: {
                                display: true,
                                text: quizData.axes[0]?.name || 'X軸',
                                font: { size: 13, weight: 'bold' },
                                color: '#4a5568'
                              },
                              min: -100,
                              max: 100,
                              grid: {
                                color: 'rgba(0,0,0,0.1)',
                                lineWidth: 1
                              },
                              ticks: {
                                stepSize: 50,
                                font: { size: 11 },
                                color: '#718096'
                              }
                            },
                            y: {
                              title: {
                                display: true,
                                text: quizData.axes[1]?.name || 'Y軸',
                                font: { size: 13, weight: 'bold' },
                                color: '#4a5568'
                              },
                              min: -100,
                              max: 100,
                              grid: {
                                color: 'rgba(0,0,0,0.1)',
                                lineWidth: 1
                              },
                              ticks: {
                                stepSize: 50,
                                font: { size: 11 },
                                color: '#718096'
                              }
                            },
                          },
                        };
                      openModal(
                        '診断結果マップ',
                        `${quizData.axes[0]?.name || 'X軸'} × ${quizData.axes[1]?.name || 'Y軸'}`,
                        'scatter',
                        getCoordinateGraphData()!,
                        scatterOptions
                      );
                    }}
                    >
                      <IconButton 
                        sx={{ 
                          position: 'absolute', 
                          top: 8, 
                          right: 8, 
                          zIndex: 1,
                          backgroundColor: 'rgba(255,255,255,0.8)',
                          '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.9)',
                          }
                        }}
                        size="small"
                      >
                        <Fullscreen fontSize="small" />
                      </IconButton>
                      <Scatter
                        data={getCoordinateGraphData()!}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              display: true,
                              position: 'top' as const,
                              labels: {
                                font: { size: 11, weight: 'normal' },
                                usePointStyle: true,
                                pointStyle: 'circle',
                                boxWidth: 8,
                                padding: 15
                              }
                            },
                            tooltip: {
                              backgroundColor: 'rgba(0,0,0,0.8)',
                              titleColor: 'white',
                              bodyColor: 'white',
                              borderColor: '#ff6b6b',
                              borderWidth: 1,
                              cornerRadius: 8,
                              callbacks: {
                                title: function(context: any) {
                                  return `回答者: ${context[0].raw.label || 'Anonymous'}`;
                                },
                                label: function(context: any) {
                                  return [`${quizData.axes[0]?.name || 'X軸'}: ${context.parsed.x}`, 
                                         `${quizData.axes[1]?.name || 'Y軸'}: ${context.parsed.y}`];
                                }
                              }
                            }
                          },
                          scales: {
                            x: {
                              title: {
                                display: true,
                                text: quizData.axes[0]?.name || 'X軸',
                                font: { size: windowWidth < 768 ? 11 : 13, weight: 'bold' },
                                color: '#4a5568'
                              },
                              min: -100,
                              max: 100,
                              grid: {
                                color: 'rgba(0,0,0,0.1)',
                                lineWidth: 1
                              },
                              ticks: {
                                stepSize: 50,
                                font: { size: 10 },
                                color: '#718096'
                              }
                            },
                            y: {
                              title: {
                                display: true,
                                text: quizData.axes[1]?.name || 'Y軸',
                                font: { size: windowWidth < 768 ? 11 : 13, weight: 'bold' },
                                color: '#4a5568'
                              },
                              min: -100,
                              max: 100,
                              grid: {
                                color: 'rgba(0,0,0,0.1)',
                                lineWidth: 1
                              },
                              ticks: {
                                stepSize: 50,
                                font: { size: 10 },
                                color: '#718096'
                              }
                            },
                          },
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* 相関分析（散布図） */}
            {questions.length >= 2 && (
              <Grid item xs={12} md={6}>
                <Card sx={{ mb: 1.5, boxShadow: 2, height: '100%' }}>
                  <CardContent sx={{ p: { xs: 1.5, sm: 2 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                      <Box sx={{ 
                        width: 24, 
                        height: 24, 
                        borderRadius: '50%',
                        background: 'linear-gradient(45deg, #667eea, #764ba2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <ShowChart sx={{ fontSize: 14, color: 'white' }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' }, fontWeight: 600 }}>
                        相関分析
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.8rem' }}>
                      {questions[0]?.text?.substring(0, 30)}... × {questions[1]?.text?.substring(0, 30)}...
                    </Typography>
                    <Box sx={{ 
                      height: { xs: 250, sm: 280, md: 320 }, 
                      position: 'relative',
                      flexGrow: 1,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: 2,
                      p: 1,
                      cursor: 'pointer',
                      '&:hover': {
                        boxShadow: 'inset 0 0 10px rgba(255,255,255,0.2)',
                        transition: 'box-shadow 0.3s ease'
                      }
                    }}
                    onClick={() => {
                      const correlationOptions = {
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              display: true,
                              position: 'top' as const,
                              labels: {
                                font: { size: 12, weight: '500' },
                                color: 'white',
                                usePointStyle: true,
                                pointStyle: 'circle',
                                boxWidth: 8,
                                padding: 15
                              }
                            },
                            tooltip: {
                              backgroundColor: 'rgba(255,255,255,0.95)',
                              titleColor: '#2d3748',
                              bodyColor: '#4a5568',
                              borderColor: '#667eea',
                              borderWidth: 2,
                              cornerRadius: 8,
                              callbacks: {
                                title: function() {
                                  return '質問間の相関';
                                },
                                label: function(context: any) {
                                  return [`${questions[0]?.text?.substring(0, 25)}...: ${context.parsed.x}`, 
                                         `${questions[1]?.text?.substring(0, 25)}...: ${context.parsed.y}`];
                                }
                              }
                            }
                          },
                          scales: {
                            x: {
                              title: {
                                display: true,
                                text: questions[0]?.text?.substring(0, 30) + "..." || "質問1",
                                font: { size: 12, weight: 'bold' },
                                color: 'white'
                              },
                              min: 0,
                              max: 6,
                              grid: {
                                color: 'rgba(255,255,255,0.2)',
                                lineWidth: 1
                              },
                              ticks: {
                                font: { size: 10 },
                                color: 'rgba(255,255,255,0.8)',
                                stepSize: 1
                              }
                            },
                            y: {
                              title: {
                                display: true,
                                text: questions[1]?.text?.substring(0, 30) + "..." || "質問2",
                                font: { size: 12, weight: 'bold' },
                                color: 'white'
                              },
                              min: 0,
                              max: 6,
                              grid: {
                                color: 'rgba(255,255,255,0.2)',
                                lineWidth: 1
                              },
                              ticks: {
                                font: { size: 10 },
                                color: 'rgba(255,255,255,0.8)',
                                stepSize: 1
                              }
                            },
                          },
                        };
                      openModal(
                        '相関分析',
                        `${questions[0]?.text?.substring(0, 30)}... × ${questions[1]?.text?.substring(0, 30)}...`,
                        'scatter',
                        getScatterChartData()!,
                        correlationOptions
                      );
                    }}
                    >
                      <IconButton 
                        sx={{ 
                          position: 'absolute', 
                          top: 8, 
                          right: 8, 
                          zIndex: 1,
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.3)',
                          }
                        }}
                        size="small"
                      >
                        <Fullscreen fontSize="small" sx={{ color: 'white' }} />
                      </IconButton>
                      <Scatter
                        data={getScatterChartData()!}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              display: windowWidth >= 768,
                              position: 'top' as const,
                              labels: {
                                font: { size: 10, weight: 'normal' },
                                color: 'white',
                                usePointStyle: true,
                                pointStyle: 'circle',
                                boxWidth: 8,
                                padding: 12
                              }
                            },
                            tooltip: {
                              backgroundColor: 'rgba(255,255,255,0.95)',
                              titleColor: '#2d3748',
                              bodyColor: '#4a5568',
                              borderColor: '#667eea',
                              borderWidth: 2,
                              cornerRadius: 8,
                              callbacks: {
                                title: function() {
                                  return '質問間の相関';
                                },
                                label: function(context: any) {
                                  return [`${questions[0]?.text?.substring(0, 20)}...: ${context.parsed.x}`, 
                                         `${questions[1]?.text?.substring(0, 20)}...: ${context.parsed.y}`];
                                }
                              }
                            }
                          },
                          scales: {
                            x: {
                              title: {
                                display: windowWidth >= 768,
                                text: questions[0]?.text?.substring(0, 25) + "..." || "質問1",
                                font: { size: windowWidth < 768 ? 10 : 11, weight: 'bold' },
                                color: 'white'
                              },
                              min: 0,
                              max: 6,
                              grid: {
                                color: 'rgba(255,255,255,0.2)',
                                lineWidth: 1
                              },
                              ticks: {
                                font: { size: 9 },
                                color: 'rgba(255,255,255,0.8)',
                                stepSize: 1
                              }
                            },
                            y: {
                              title: {
                                display: windowWidth >= 768,
                                text: questions[1]?.text?.substring(0, 25) + "..." || "質問2",
                                font: { size: windowWidth < 768 ? 10 : 11, weight: 'bold' },
                                color: 'white'
                              },
                              min: 0,
                              max: 6,
                              grid: {
                                color: 'rgba(255,255,255,0.2)',
                                lineWidth: 1
                              },
                              ticks: {
                                font: { size: 9 },
                                color: 'rgba(255,255,255,0.8)',
                                stepSize: 1
                              }
                            },
                          },
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>

          {/* 4軸座標グラフ（全軸の診断結果表示） */}
          {quizData?.axes?.length >= 4 && (
            <Card sx={{ mb: 1.5, boxShadow: 2 }}>
              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <Box sx={{ 
                    width: 24, 
                    height: 24, 
                    borderRadius: '50%',
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <ShowChart sx={{ fontSize: 14, color: 'white' }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' }, fontWeight: 600 }}>
                    4軸診断結果（全体表示）
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.8rem' }}>
                  全4軸の診断結果を包括的に可視化
                </Typography>
                
                <Grid container spacing={{ xs: 1, sm: 2 }}>
                  {/* 個別回答者の4軸レーダーチャート */}
                  <Grid item xs={12} md={6}>
                    <Box sx={{ 
                      height: { xs: 300, sm: 320, md: 350 }, 
                      position: 'relative',
                      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                      borderRadius: 2,
                      p: 1,
                      cursor: 'pointer',
                      '&:hover': {
                        boxShadow: 'inset 0 0 10px rgba(102, 126, 234, 0.2)',
                        transition: 'box-shadow 0.3s ease'
                      }
                    }}
                    onClick={() => {
                      const radarOptions = {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: true,
                            position: 'top' as const,
                            labels: {
                              font: { size: 11 },
                              maxWidth: 150,
                              generateLabels: function(chart: any) {
                                const data = chart.data;
                                if (data.datasets.length) {
                                  return data.datasets.slice(0, 5).map((dataset: any, i: number) => ({
                                    text: `回答者${i + 1}`,
                                    fillStyle: dataset.backgroundColor,
                                    strokeStyle: dataset.borderColor,
                                    lineWidth: dataset.borderWidth,
                                    hidden: false,
                                    datasetIndex: i
                                  }));
                                }
                                return [];
                              }
                            }
                          },
                          title: {
                            display: true,
                            text: '個別回答者の4軸分析',
                            font: { size: 14, weight: 'bold' }
                          },
                          tooltip: {
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            titleColor: 'white',
                            bodyColor: 'white',
                            cornerRadius: 8,
                          }
                        },
                        scales: {
                          r: {
                            beginAtZero: true,
                            max: 5,
                            min: 0,
                            ticks: {
                              stepSize: 1,
                              font: { size: 10 }
                            },
                            pointLabels: {
                              font: { size: 12, weight: '500' },
                            },
                            grid: {
                              color: 'rgba(102, 126, 234, 0.2)',
                            },
                            angleLines: {
                              color: 'rgba(102, 126, 234, 0.3)',
                            }
                          },
                        },
                      };
                      openModal(
                        '4軸診断結果（個別）',
                        '各回答者の4軸レーダーチャート',
                        'radar',
                        get4AxisCoordinateData()!,
                        radarOptions
                      );
                    }}
                    >
                      <IconButton 
                        sx={{ 
                          position: 'absolute', 
                          top: 8, 
                          right: 8, 
                          zIndex: 1,
                          backgroundColor: 'rgba(255,255,255,0.8)',
                          '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.9)',
                          }
                        }}
                        size="small"
                      >
                        <Fullscreen fontSize="small" />
                      </IconButton>
                      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, textAlign: 'center', fontWeight: 600 }}>
                          個別回答者の4軸分析
                        </Typography>
                        <Box sx={{ flex: 1 }}>
                          <Radar 
                            data={get4AxisCoordinateData()!} 
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  display: true,
                                  position: 'bottom' as const,
                                  labels: {
                                    font: { size: 9 },
                                    generateLabels: function(chart: any) {
                                      const data = chart.data;
                                      if (data.datasets.length) {
                                        return data.datasets.slice(0, 5).map((dataset: any, i: number) => ({
                                          text: `回答者${i + 1}`,
                                          fillStyle: dataset.backgroundColor,
                                          strokeStyle: dataset.borderColor,
                                          lineWidth: dataset.borderWidth,
                                          hidden: false,
                                          datasetIndex: i
                                        }));
                                      }
                                      return [];
                                    }
                                  }
                                }
                              },
                              scales: {
                                r: {
                                  beginAtZero: true,
                                  max: 5,
                                  min: 0,
                                  ticks: {
                                    stepSize: 1,
                                    font: { size: 8 },
                                    display: false
                                  },
                                  pointLabels: {
                                    font: { size: 10 },
                                  },
                                  grid: {
                                    color: 'rgba(102, 126, 234, 0.2)',
                                  },
                                  angleLines: {
                                    color: 'rgba(102, 126, 234, 0.3)',
                                  }
                                },
                              },
                            }} 
                          />
                        </Box>
                      </Box>
                    </Box>
                  </Grid>

                  {/* 4軸平均比較チャート */}
                  <Grid item xs={12} md={6}>
                    <Box sx={{ 
                      height: { xs: 300, sm: 320, md: 350 }, 
                      position: 'relative',
                      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                      borderRadius: 2,
                      p: 1,
                      cursor: 'pointer',
                      '&:hover': {
                        boxShadow: 'inset 0 0 10px rgba(102, 126, 234, 0.2)',
                        transition: 'box-shadow 0.3s ease'
                      }
                    }}
                    onClick={() => {
                      const averageOptions = {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: true,
                            position: 'top' as const,
                            labels: {
                              font: { size: 12 }
                            }
                          },
                          title: {
                            display: true,
                            text: '4軸平均スコア比較',
                            font: { size: 14, weight: 'bold' }
                          },
                          tooltip: {
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            titleColor: 'white',
                            bodyColor: 'white',
                            cornerRadius: 8,
                          }
                        },
                        scales: {
                          r: {
                            beginAtZero: true,
                            max: 5,
                            min: 0,
                            ticks: {
                              stepSize: 1,
                              font: { size: 11 }
                            },
                            pointLabels: {
                              font: { size: 13, weight: '500' },
                            },
                            grid: {
                              color: 'rgba(102, 126, 234, 0.2)',
                            },
                            angleLines: {
                              color: 'rgba(102, 126, 234, 0.3)',
                            }
                          },
                        },
                      };
                      openModal(
                        '4軸平均スコア比較',
                        '全体の平均スコアと理想値の比較',
                        'radar',
                        get4AxisAverageData()!,
                        averageOptions
                      );
                    }}
                    >
                      <IconButton 
                        sx={{ 
                          position: 'absolute', 
                          top: 8, 
                          right: 8, 
                          zIndex: 1,
                          backgroundColor: 'rgba(255,255,255,0.8)',
                          '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.9)',
                          }
                        }}
                        size="small"
                      >
                        <Fullscreen fontSize="small" />
                      </IconButton>
                      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, textAlign: 'center', fontWeight: 600 }}>
                          4軸平均スコア比較
                        </Typography>
                        <Box sx={{ flex: 1 }}>
                          <Radar 
                            data={get4AxisAverageData()!} 
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  display: true,
                                  position: 'bottom' as const,
                                  labels: {
                                    font: { size: 10 }
                                  }
                                }
                              },
                              scales: {
                                r: {
                                  beginAtZero: true,
                                  max: 5,
                                  min: 0,
                                  ticks: {
                                    stepSize: 1,
                                    font: { size: 8 },
                                    display: true
                                  },
                                  pointLabels: {
                                    font: { size: 10 },
                                  },
                                  grid: {
                                    color: 'rgba(102, 126, 234, 0.2)',
                                  },
                                  angleLines: {
                                    color: 'rgba(102, 126, 234, 0.3)',
                                  }
                                },
                              },
                            }} 
                          />
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* 高度分析グラフ（2列レイアウト） */}
          <Grid container spacing={{ xs: 1, sm: 2 }}>
            {/* 質問別統計 */}
            <Grid item xs={12} md={6}>
              <Card sx={{ mb: 1.5, boxShadow: 2, height: '100%' }}>
                <CardContent sx={{ p: { xs: 1.5, sm: 2 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Box sx={{ 
                      width: 24, 
                      height: 24, 
                      borderRadius: '50%',
                      background: 'linear-gradient(45deg, #667eea, #764ba2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <BarChart sx={{ fontSize: 14, color: 'white' }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' }, fontWeight: 600 }}>
                      質問別統計
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.8rem' }}>
                    平均値・最大値・最小値の推移
                  </Typography>
                  <Box sx={{ 
                    height: { xs: 250, sm: 280, md: 320 }, 
                    position: 'relative', 
                    flexGrow: 1,
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    borderRadius: 2,
                    p: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: 'inset 0 0 10px rgba(102, 126, 234, 0.2)',
                      transition: 'box-shadow 0.3s ease'
                    }
                  }}
                  onClick={() => {
                    openModal(
                      '質問別統計',
                      '平均値・最大値・最小値の推移',
                      'line',
                      getQuestionStatsData(),
                      questionStatsOptions
                    );
                  }}
                  >
                    <IconButton 
                      sx={{ 
                        position: 'absolute', 
                        top: 8, 
                        right: 8, 
                        zIndex: 1,
                        backgroundColor: 'rgba(255,255,255,0.8)',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.9)',
                        }
                      }}
                      size="small"
                    >
                      <Fullscreen fontSize="small" />
                    </IconButton>
                    <Line
                      data={getQuestionStatsData()}
                      options={questionStatsOptions}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* 時系列分析 */}
            <Grid item xs={12} md={6}>
              <Card sx={{ mb: 1.5, boxShadow: 2, height: '100%' }}>
                <CardContent sx={{ p: { xs: 1.5, sm: 2 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Box sx={{ 
                      width: 24, 
                      height: 24, 
                      borderRadius: '50%',
                      background: 'linear-gradient(45deg, #667eea, #764ba2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Timeline sx={{ fontSize: 14, color: 'white' }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' }, fontWeight: 600 }}>
                      時系列分析
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.8rem' }}>
                    回答スコアの時間推移
                  </Typography>
                  <Box sx={{ 
                    height: { xs: 250, sm: 280, md: 320 }, 
                    position: 'relative', 
                    flexGrow: 1,
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    borderRadius: 2,
                    p: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: 'inset 0 0 10px rgba(102, 126, 234, 0.2)',
                      transition: 'box-shadow 0.3s ease'
                    }
                  }}
                  onClick={() => {
                    openModal(
                      '時系列分析',
                      '回答スコアの時間推移',
                      'line',
                      getTimeSeriesData(),
                      timeSeriesOptions
                    );
                  }}
                  >
                    <IconButton 
                      sx={{ 
                        position: 'absolute', 
                        top: 8, 
                        right: 8, 
                        zIndex: 1,
                        backgroundColor: 'rgba(255,255,255,0.8)',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.9)',
                        }
                      }}
                      size="small"
                    >
                      <Fullscreen fontSize="small" />
                    </IconButton>
                    <Line data={getTimeSeriesData()} options={timeSeriesOptions} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      {/* 各質問の詳細分析（切り替え可能） */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 1.5,
        flexWrap: 'wrap',
        gap: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ 
            width: 24, 
            height: 24, 
            borderRadius: '50%',
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <BarChart sx={{ fontSize: 14, color: 'white' }} />
          </Box>
          <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.1rem' }, fontWeight: 600 }}>
            質問別分析
          </Typography>
        </Box>
        <ToggleButtonGroup
          value={chartTypes.questions}
          exclusive
          onChange={(_, newType) => newType && setChartTypes(prev => ({ ...prev, questions: newType }))}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              border: '1px solid #667eea',
              color: '#667eea',
              '&.Mui-selected': {
                backgroundColor: '#667eea',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#5a67d8',
                }
              },
              '&:hover': {
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
              }
            }
          }}
        >
          <ToggleButton value="bar" aria-label="bar chart">
            <BarChart fontSize="small" />
          </ToggleButton>
          <ToggleButton value="line" aria-label="line chart">
            <ShowChart fontSize="small" />
          </ToggleButton>
          <ToggleButton value="stats" aria-label="statistics">
            <Timeline fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Grid container spacing={{ xs: 1, sm: 2 }}>
        {questions.map((question, index) => {
          const { stats } = getQuestionAnalytics(question.id);
          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={question.id}>
              <Card sx={{ boxShadow: 2, height: '100%' }}>
                <CardContent sx={{ 
                  p: { xs: 1.5, sm: 2 },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.5 }}>
                    <Box sx={{ 
                      width: 20, 
                      height: 20, 
                      borderRadius: '50%',
                      background: 'linear-gradient(45deg, #667eea, #764ba2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      mt: 0.2
                    }}>
                      <Typography sx={{ fontSize: 10, color: 'white', fontWeight: 'bold' }}>
                        {index + 1}
                      </Typography>
                    </Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ 
                        fontWeight: 600, 
                        fontSize: { xs: "0.75rem", sm: "0.85rem" }, 
                        lineHeight: 1.3,
                        flex: 1
                      }}
                    >
                      {question.text}
                    </Typography>
                  </Box>

                  {/* 高度分析の統計情報 */}
                  {viewMode === "advanced" && (
                    <Box sx={{ 
                      mb: 1.5, 
                      p: 1, 
                      backgroundColor: 'rgba(102, 126, 234, 0.05)', 
                      borderRadius: 1,
                      border: '1px solid rgba(102, 126, 234, 0.1)'
                    }}>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="caption" sx={{ fontWeight: 500 }}>
                            平均: {stats.mean.toFixed(2)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" sx={{ fontWeight: 500 }}>
                            標準偏差: {stats.std.toFixed(2)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" sx={{ fontWeight: 500 }}>
                            中央値: {stats.median.toFixed(2)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" sx={{ fontWeight: 500 }}>
                            分散: {stats.variance.toFixed(2)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  <Box sx={{ 
                    height: { xs: 160, sm: 180, md: 200 }, 
                    position: 'relative',
                    flexGrow: 1,
                    minHeight: 0,
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    borderRadius: 2,
                    p: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: 'inset 0 0 10px rgba(102, 126, 234, 0.2)',
                      transition: 'box-shadow 0.3s ease'
                    }
                  }}
                  onClick={() => {
                    const data = chartTypes.questions === 'stats' 
                      ? getStatsSummaryData(question.id)
                      : getBarChartData(question.id, question.text);
                    const options = chartTypes.questions === 'stats' 
                      ? { 
                          ...chartOptions, 
                          plugins: {
                            ...chartOptions.plugins,
                            legend: {
                              display: true,
                              position: 'top' as const,
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              max: 5,
                              ticks: {
                                stepSize: 1,
                              }
                            }
                          }
                        }
                      : chartTypes.questions === 'line' 
                        ? { ...chartOptions, elements: { line: { tension: 0.4 } } }
                        : chartOptions;
                    openModal(
                      `質問${index + 1}`,
                      question.text,
                      chartTypes.questions === 'stats' ? 'line' : chartTypes.questions === 'line' ? 'line' : 'bar',
                      data,
                      options,
                      question.id
                    );
                  }}
                  >
                    <IconButton 
                      sx={{ 
                        position: 'absolute', 
                        top: 4, 
                        right: 4, 
                        zIndex: 1,
                        backgroundColor: 'rgba(255,255,255,0.8)',
                        width: 20,
                        height: 20,
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.9)',
                        }
                      }}
                      size="small"
                    >
                      <Fullscreen sx={{ fontSize: 12 }} />
                    </IconButton>
                    {chartTypes.questions === 'bar' && (
                      <Bar
                        data={getBarChartData(question.id, question.text)}
                        options={chartOptions}
                      />
                    )}
                    {chartTypes.questions === 'line' && (
                      <Line
                        data={getBarChartData(question.id, question.text)}
                        options={{ ...chartOptions, elements: { line: { tension: 0.4 } } }}
                      />
                    )}
                    {chartTypes.questions === 'stats' && (
                      <Line
                        data={getStatsSummaryData(question.id)}
                        options={{ 
                          ...chartOptions, 
                          plugins: {
                            ...chartOptions.plugins,
                            legend: {
                              display: true,
                              position: 'top' as const,
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              max: 5,
                              ticks: {
                                stepSize: 1,
                              }
                            }
                          }
                        }}
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* グラフ拡大モーダル */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
          sx: { backgroundColor: 'rgba(0, 0, 0, 0.8)' }
        }}
      >
        <Fade in={modalOpen}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '95vw', sm: '90vw', md: '85vw' },
            height: { xs: '85vh', sm: '80vh', md: '75vh' },
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: 24,
            p: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* モーダルヘッダー */}
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 3,
              borderBottom: '1px solid #e2e8f0',
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              color: 'white'
            }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {modalContent?.title}
                </Typography>
                {modalContent?.subtitle && (
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {modalContent.subtitle}
                  </Typography>
                )}
              </Box>
              <IconButton 
                onClick={closeModal}
                sx={{ 
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                <Close />
              </IconButton>
            </Box>

            {/* フィルターボタン群 */}
            <Box sx={{
              p: 2,
              borderBottom: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FilterList sx={{ fontSize: 20, color: '#667eea' }} />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    クイックフィルター:
                  </Typography>
                </Box>
                
                {/* 年齢フィルター */}
                <ButtonGroup size="small" variant="outlined">
                  {ageRanges.slice(0, 4).map((range) => {
                    const isActive = filterOptions.ageRange[0] === range.value[0] &&
                                   filterOptions.ageRange[1] === range.value[1];
                    return (
                      <Button
                        key={range.label}
                        onClick={() =>
                          setFilterOptions((prev) => ({
                            ...prev,
                            ageRange: range.value as [number, number],
                          }))
                        }
                        variant={isActive ? "contained" : "outlined"}
                        sx={{
                          fontSize: '0.75rem',
                          px: 1.5,
                          backgroundColor: isActive ? '#667eea !important' : 'transparent',
                          borderColor: '#667eea !important',
                          color: isActive ? 'white !important' : '#667eea !important',
                          '&:hover': {
                            backgroundColor: isActive 
                              ? '#5a67d8 !important' 
                              : 'rgba(102, 126, 234, 0.1) !important',
                          },
                          '&:focus': {
                            backgroundColor: isActive ? '#667eea !important' : 'transparent',
                            color: isActive ? 'white !important' : '#667eea !important',
                          }
                        }}
                      >
                        {range.label}
                      </Button>
                    );
                  })}
                </ButtonGroup>

                {/* 性別フィルター */}
                <ButtonGroup size="small" variant="outlined">
                  {genderOptions.map((option) => {
                    const isActive = filterOptions.gender === option.value;
                    return (
                      <Button
                        key={option.value}
                        onClick={() =>
                          setFilterOptions((prev) => ({
                            ...prev,
                            gender: option.value,
                          }))
                        }
                        variant={isActive ? "contained" : "outlined"}
                        sx={{
                          fontSize: '0.75rem',
                          px: 1.5,
                          backgroundColor: isActive ? '#667eea !important' : 'transparent',
                          borderColor: '#667eea !important',
                          color: isActive ? 'white !important' : '#667eea !important',
                          '&:hover': {
                            backgroundColor: isActive 
                              ? '#5a67d8 !important' 
                              : 'rgba(102, 126, 234, 0.1) !important',
                          },
                          '&:focus': {
                            backgroundColor: isActive ? '#667eea !important' : 'transparent',
                            color: isActive ? 'white !important' : '#667eea !important',
                          }
                        }}
                      >
                        {option.label}
                      </Button>
                    );
                  })}
                </ButtonGroup>

                {/* リセットボタン */}
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
                  sx={{
                    fontSize: '0.75rem',
                    px: 2,
                    borderColor: '#e2e8f0',
                    color: '#718096',
                    '&:hover': {
                      backgroundColor: '#f7fafc',
                      borderColor: '#cbd5e0',
                    }
                  }}
                >
                  リセット
                </Button>
              </Box>
            </Box>

            {/* グラフエリア */}
            <Box sx={{
              flex: 1,
              p: 3,
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {modalContent && (
                <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
                  {modalContent.chartType === 'pie' && (
                    <Pie data={modalContent.data} options={{
                      ...modalContent.options,
                      maintainAspectRatio: false,
                      plugins: {
                        ...modalContent.options.plugins,
                        legend: {
                          ...modalContent.options.plugins?.legend,
                          labels: {
                            ...modalContent.options.plugins?.legend?.labels,
                            font: { size: 14 }
                          }
                        }
                      }
                    }} />
                  )}
                  {modalContent.chartType === 'bar' && (
                    <Bar data={modalContent.data} options={{
                      ...modalContent.options,
                      maintainAspectRatio: false,
                      plugins: {
                        ...modalContent.options.plugins,
                        legend: {
                          ...modalContent.options.plugins?.legend,
                          labels: {
                            ...modalContent.options.plugins?.legend?.labels,
                            font: { size: 14 }
                          }
                        }
                      }
                    }} />
                  )}
                  {modalContent.chartType === 'line' && (
                    <Line data={modalContent.data} options={{
                      ...modalContent.options,
                      maintainAspectRatio: false,
                      plugins: {
                        ...modalContent.options.plugins,
                        legend: {
                          ...modalContent.options.plugins?.legend,
                          labels: {
                            ...modalContent.options.plugins?.legend?.labels,
                            font: { size: 14 }
                          }
                        }
                      }
                    }} />
                  )}
                  {modalContent.chartType === 'radar' && (
                    <Radar data={modalContent.data} options={{
                      ...modalContent.options,
                      maintainAspectRatio: false,
                      plugins: {
                        ...modalContent.options.plugins,
                        legend: {
                          ...modalContent.options.plugins?.legend,
                          labels: {
                            ...modalContent.options.plugins?.legend?.labels,
                            font: { size: 14 }
                          }
                        }
                      }
                    }} />
                  )}
                  {modalContent.chartType === 'scatter' && (
                    <Scatter data={modalContent.data} options={{
                      ...modalContent.options,
                      maintainAspectRatio: false,
                      plugins: {
                        ...modalContent.options.plugins,
                        legend: {
                          ...modalContent.options.plugins?.legend,
                          labels: {
                            ...modalContent.options.plugins?.legend?.labels,
                            font: { size: 14 }
                          }
                        }
                      }
                    }} />
                  )}
                </Box>
              )}
            </Box>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
}
