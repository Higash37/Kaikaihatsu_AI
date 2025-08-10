import {
  Box,
  Button,
  Chip,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useState } from "react";

import { AnalyticsFilters } from "./AnalyticsFilters";
import { AnalyticsModal } from "./AnalyticsModal";
import { ChartCard } from "./ChartCard";
import { useAnalyticsData } from "../hooks/useAnalyticsData";
import { useChartData } from "../hooks/useChartData";
import {
  ChartType,
  FilterOption,
  FilterOptions,
  ModalContent,
  Question,
  QuizData,
  QuizResponse,
} from "../types/analytics";

interface QuizAnalyticsProps {
  readonly quizTitle: string;
  readonly responses: readonly QuizResponse[];
  readonly questions: readonly Question[];
  readonly quizData?: QuizData;
}

/**
 * Refactored QuizAnalytics component with improved structure and reduced complexity
 */
export default function QuizAnalytics({
  quizTitle,
  responses,
  questions,
  quizData,
}: QuizAnalyticsProps) {
  // State management
  const [viewMode, setViewMode] = useState<"basic" | "advanced">("basic");
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    ageRange: [0, 100],
    gender: "all",
    location: "all",
    responseDate: "all",
  });
  const [chartTypes, setChartTypes] = useState<{ [key: string]: ChartType }>({
    overall: "pie",
    questions: "bar",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<ModalContent | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Configuration data with proper typing
  const ageRanges: readonly FilterOption<readonly [number, number]>[] = [
    { label: "全年代", value: [0, 100] as const },
    { label: "10代", value: [10, 19] as const },
    { label: "20代", value: [20, 29] as const },
    { label: "30代", value: [30, 39] as const },
    { label: "40代", value: [40, 49] as const },
    { label: "50代", value: [50, 59] as const },
    { label: "60代以上", value: [60, 100] as const },
  ];

  const genderOptions: readonly FilterOption[] = [
    { label: "全て", value: "all" },
    { label: "男性", value: "male" },
    { label: "女性", value: "female" },
    { label: "その他", value: "other" },
  ];

  const locationOptions: readonly FilterOption[] = [
    { label: "全て", value: "all" },
    { label: "東京", value: "tokyo" },
    { label: "大阪", value: "osaka" },
    { label: "京都", value: "kyoto" },
    { label: "その他", value: "other" },
  ];

  // Custom hooks for data processing
  const {
    filteredResponses,
    totalResponses,
    calculateStatistics,
    coordinateAnalysis,
    axisAnalysis,
  } = useAnalyticsData(responses, filterOptions, quizData);

  const {
    getPieChartData,
    getBarChartData,
    getTimeSeriesData,
    getStatsSummaryData,
    chartOptions,
    pieChartOptions,
    timeSeriesOptions,
  } = useChartData(filteredResponses, questions, calculateStatistics);

  // Modal management functions
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
      questionId,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalContent(null);
  };

  // Chart data preparation functions
  const getOverallChartData = () => {
    if (chartTypes.overall === "pie") return getPieChartData();
    if (chartTypes.overall === "bar") {
      const pieData = getPieChartData();
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
            label: "回答数",
            data: pieData.datasets[0].data,
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
    }
    return getTimeSeriesData();
  };

  const getOverallChartOptions = () => {
    if (chartTypes.overall === "pie") return pieChartOptions;
    if (chartTypes.overall === "bar") return chartOptions;
    return timeSeriesOptions;
  };

  const handleOverallChartExpand = () => {
    const data = getOverallChartData();
    const options = getOverallChartOptions();
    const chartType =
      chartTypes.overall === "line" ? "line" : chartTypes.overall;

    openModal(
      "全体の回答傾向",
      "回答者の選択傾向を可視化",
      chartType,
      data,
      options
    );
  };

  const handleQuestionChartExpand = (question: any, index: number) => {
    const getQuestionData = () => {
      if (chartTypes.questions === "stats") {
        return getStatsSummaryData(question.id);
      }
      return getBarChartData(question.id, question.text);
    };

    const getQuestionOptions = () => {
      if (chartTypes.questions === "stats") {
        return {
          ...chartOptions,
          plugins: {
            ...chartOptions.plugins,
            legend: {
              display: true,
              position: "top" as const,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 5,
              ticks: { stepSize: 1 },
            },
          },
        };
      }
      if (chartTypes.questions === "line") {
        return { ...chartOptions, elements: { line: { tension: 0.4 } } };
      }
      return chartOptions;
    };

    const getQuestionChartType = (): ChartType => {
      if (chartTypes.questions === "stats") return "line";
      if (chartTypes.questions === "line") return "line";
      return "bar";
    };

    const data = getQuestionData();
    const options = getQuestionOptions();

    openModal(
      `質問${index + 1}`,
      question.text,
      getQuestionChartType(),
      data,
      options,
      question.id
    );
  };

  // Report generation function (simplified)
  const generateReport = async () => {
    setIsGeneratingReport(true);
    try {
      // Simulate report generation
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("Report generated successfully");
    } catch (error) {
      console.error("Report generation failed:", error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 600,
            mb: 2,
            background: "linear-gradient(45deg, #667eea, #764ba2)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          📊 {quizTitle} - 分析レポート
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Chip
            label={`総回答数: ${totalResponses}`}
            color="primary"
            sx={{ fontWeight: 500 }}
          />
          <Chip label={`質問数: ${questions.length}`} variant="outlined" />
        </Box>

        {/* View Mode Toggle */}
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, value) => value && setViewMode(value)}
          size="small"
          sx={{ mb: 2 }}
        >
          <ToggleButton value="basic">基本ビュー</ToggleButton>
          <ToggleButton value="advanced">詳細ビュー</ToggleButton>
        </ToggleButtonGroup>

        <Button
          variant="contained"
          onClick={generateReport}
          disabled={isGeneratingReport}
          sx={{ ml: 2 }}
        >
          {isGeneratingReport ? "生成中..." : "レポート生成"}
        </Button>
      </Box>

      {/* Filters */}
      <AnalyticsFilters
        filterOptions={filterOptions}
        chartTypes={chartTypes}
        ageRanges={ageRanges}
        genderOptions={genderOptions}
        locationOptions={locationOptions}
        onFilterChange={setFilterOptions}
        onChartTypeChange={setChartTypes}
      />

      {/* Main Charts Grid */}
      <Grid container spacing={3}>
        {/* Overall Response Trend */}
        <Grid item xs={12} lg={6}>
          <ChartCard
            title="全体の回答傾向"
            subtitle={`${totalResponses}件の回答を分析`}
            chartType={chartTypes.overall}
            data={getOverallChartData()}
            options={getOverallChartOptions()}
            height={300}
            onExpand={handleOverallChartExpand}
          />
        </Grid>

        {/* Coordinate Analysis (if available) */}
        {coordinateAnalysis && (
          <Grid item xs={12} lg={6}>
            <ChartCard
              title="診断結果の分布"
              subtitle="4軸診断による結果分布"
              chartType="pie"
              data={{
                labels: coordinateAnalysis.map((coord) => coord.resultName),
                datasets: [
                  {
                    data: coordinateAnalysis.map((coord) => coord.count),
                    backgroundColor: [
                      "rgba(102, 126, 234, 0.8)",
                      "rgba(34, 197, 94, 0.8)",
                      "rgba(251, 146, 60, 0.8)",
                      "rgba(239, 68, 68, 0.8)",
                    ],
                  },
                ],
              }}
              options={pieChartOptions}
              height={300}
            />
          </Grid>
        )}

        {/* Individual Question Charts */}
        {questions.map((question, index) => (
          <Grid
            item
            xs={12}
            md={6}
            lg={4}
            key={`question-${question.id}-${index}`}
          >
            <ChartCard
              title={`質問 ${index + 1}`}
              subtitle={question.text}
              chartType={chartTypes.questions}
              data={
                chartTypes.questions === "stats"
                  ? getStatsSummaryData(question.id)
                  : getBarChartData(question.id, question.text)
              }
              options={
                chartTypes.questions === "line"
                  ? { ...chartOptions, elements: { line: { tension: 0.4 } } }
                  : chartOptions
              }
              height={200}
              onExpand={() => handleQuestionChartExpand(question, index)}
            />
          </Grid>
        ))}
      </Grid>

      {/* Advanced View - Axis Analysis */}
      {viewMode === "advanced" && axisAnalysis && axisAnalysis.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            📊 軸別スコア分析
          </Typography>

          <Grid container spacing={2}>
            {axisAnalysis.map((analysis: any, index: any) => (
              <Grid
                item
                xs={12}
                md={6}
                key={`axis-${analysis.axis.name}-${index}`}
              >
                <Box
                  sx={{ p: 2, border: "1px solid #e2e8f0", borderRadius: 2 }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 1, fontWeight: "bold" }}
                  >
                    {analysis.axis.name}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      平均: {analysis.statistics.mean.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      標準偏差: {analysis.statistics.std.toFixed(2)}
                    </Typography>
                    <Typography variant="body2">
                      中央値: {analysis.statistics.median.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Analytics Modal */}
      <AnalyticsModal
        open={modalOpen}
        content={modalContent}
        filterOptions={filterOptions}
        ageRanges={ageRanges}
        genderOptions={genderOptions}
        onClose={closeModal}
        onFilterChange={setFilterOptions}
      />
    </Box>
  );
}
