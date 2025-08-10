import { useMemo } from 'react';
import { QuizResponse, Question, StatisticsResult } from '../types/analytics';

/**
 * Custom hook for generating chart data configurations
 */
export const useChartData = (
  filteredResponses: readonly QuizResponse[],
  questions: readonly Question[],
  calculateStatistics: (values: number[]) => StatisticsResult
) => {
  // Generate pie chart data for overall response distribution
  const getPieChartData = useMemo(() => {
    return () => {
      const responseCounts = [0, 0, 0, 0, 0]; // For scale 1-5
      
      filteredResponses.forEach((response) => {
        response.answers.forEach((answer: any) => {
          if (answer.value >= 1 && answer.value <= 5) {
            responseCounts[answer.value - 1]++;
          }
        });
      });

      return {
        labels: ["そう思わない", "ややそう思わない", "どちらでもない", "ややそう思う", "そう思う"],
        datasets: [{
          data: responseCounts,
          backgroundColor: [
            "rgba(239, 68, 68, 0.8)",
            "rgba(251, 146, 60, 0.8)",
            "rgba(163, 163, 163, 0.8)",
            "rgba(34, 197, 94, 0.8)",
            "rgba(34, 197, 94, 1.0)",
          ],
          borderColor: [
            "rgba(239, 68, 68, 1)",
            "rgba(251, 146, 60, 1)",
            "rgba(163, 163, 163, 1)",
            "rgba(34, 197, 94, 1)",
            "rgba(34, 197, 94, 1)",
          ],
          borderWidth: 1,
        }]
      };
    };
  }, [filteredResponses]);

  // Generate bar chart data for individual questions
  const getBarChartData = useMemo(() => {
    return (questionId: string, questionText: string) => {
      const questionResponses = filteredResponses
        .map((response) => 
          response.answers.find((answer: any) => answer.questionId === questionId)?.value
        )
        .filter((value) => value !== undefined);

      const responseCounts = [0, 0, 0, 0, 0];
      questionResponses.forEach((value) => {
        if (value >= 1 && value <= 5) {
          responseCounts[value - 1]++;
        }
      });

      return {
        labels: ["そう思わない", "ややそう思わない", "どちらでもない", "ややそう思う", "そう思う"],
        datasets: [{
          label: "回答数",
          data: responseCounts,
          backgroundColor: [
            "rgba(239, 68, 68, 0.7)",
            "rgba(251, 146, 60, 0.7)",
            "rgba(163, 163, 163, 0.7)",
            "rgba(34, 197, 94, 0.7)",
            "rgba(34, 197, 94, 0.9)",
          ],
          borderColor: [
            "rgba(239, 68, 68, 1)",
            "rgba(251, 146, 60, 1)",
            "rgba(163, 163, 163, 1)",
            "rgba(34, 197, 94, 1)",
            "rgba(34, 197, 94, 1)",
          ],
          borderWidth: 1,
        }]
      };
    };
  }, [filteredResponses]);

  // Generate time series data for response trends
  const getTimeSeriesData = useMemo(() => {
    return () => {
      const timeData = filteredResponses
        .filter(response => response.createdAt || response.timestamp)
        .map(response => ({
          date: new Date(response.createdAt || response.timestamp || Date.now()),
          avgScore: response.answers.reduce(
            (sum: number, a: any) => sum + (a.value || 0),
            0
          ) / response.answers.length
        }))
        .sort((a, b) => a.date.getTime() - b.date.getTime());

      const groupedData = timeData.reduce((acc, item) => {
        const dateKey = item.date.toISOString().split('T')[0];
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(item.avgScore);
        return acc;
      }, {} as Record<string, number[]>);

      const labels = Object.keys(groupedData).sort();
      const data = labels.map(date => {
        const scores = groupedData[date];
        return scores.reduce((sum, score) => sum + score, 0) / scores.length;
      });

      return {
        labels,
        datasets: [{
          label: "平均スコア",
          data,
          borderColor: "rgba(102, 126, 234, 1)",
          backgroundColor: "rgba(102, 126, 234, 0.1)",
          tension: 0.4,
          fill: true,
        }]
      };
    };
  }, [filteredResponses]);

  // Generate statistical summary data for specific questions
  const getStatsSummaryData = useMemo(() => {
    return (questionId: string) => {
      const questionResponses = filteredResponses
        .map((response) => 
          response.answers.find((answer: any) => answer.questionId === questionId)?.value
        )
        .filter((value) => value !== undefined);

      if (questionResponses.length === 0) {
        return {
          labels: ["統計データなし"],
          datasets: [{
            label: "データなし",
            data: [0],
            backgroundColor: "rgba(163, 163, 163, 0.5)",
          }]
        };
      }

      const stats = calculateStatistics(questionResponses);
      const average = questionResponses.reduce((sum, val) => sum + val, 0) / questionResponses.length;
      const max = Math.max(...questionResponses);
      const min = Math.min(...questionResponses);

      return {
        labels: ["平均", "最大値", "最小値", "中央値"],
        datasets: [{
          label: "統計値",
          data: [average, max, min, stats.median],
          backgroundColor: [
            "rgba(102, 126, 234, 0.8)",
            "rgba(34, 197, 94, 0.8)",
            "rgba(239, 68, 68, 0.8)",
            "rgba(251, 146, 60, 0.8)",
          ],
          borderColor: [
            "rgba(102, 126, 234, 1)",
            "rgba(34, 197, 94, 1)",
            "rgba(239, 68, 68, 1)",
            "rgba(251, 146, 60, 1)",
          ],
          borderWidth: 1,
        }]
      };
    };
  }, [filteredResponses, calculateStatistics]);

  // Chart options configurations
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: 12,
            family: "'Noto Sans JP', sans-serif",
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1a202c',
        bodyColor: '#4a5568',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        titleFont: {
          size: 13,
          weight: '600' as const,
        },
        bodyFont: {
          size: 12,
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          font: {
            size: 11,
            family: "'Noto Sans JP', sans-serif",
          },
          color: '#64748b'
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          font: {
            size: 11,
            family: "'Noto Sans JP', sans-serif",
          },
          color: '#64748b'
        }
      }
    }
  }), []);

  const pieChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          font: {
            size: 11,
            family: "'Noto Sans JP', sans-serif",
          },
          padding: 15,
          usePointStyle: true,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1a202c',
        bodyColor: '#4a5568',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        titleFont: {
          size: 13,
          weight: '600' as const,
        },
        bodyFont: {
          size: 12,
        },
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  }), []);

  const timeSeriesOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: 12,
            family: "'Noto Sans JP', sans-serif",
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1a202c',
        bodyColor: '#4a5568',
        borderColor: '#e2e8f0',
        borderWidth: 1,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 5,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          stepSize: 1,
          font: {
            size: 11,
            family: "'Noto Sans JP', sans-serif",
          },
          color: '#64748b'
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          font: {
            size: 11,
            family: "'Noto Sans JP', sans-serif",
          },
          color: '#64748b'
        }
      }
    }
  }), []);

  return {
    getPieChartData,
    getBarChartData,
    getTimeSeriesData,
    getStatsSummaryData,
    chartOptions,
    pieChartOptions,
    timeSeriesOptions,
  };
};