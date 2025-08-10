import { useMemo } from 'react';
import {
  FilterOptions,
  DiagnosisCoordinate,
  StatisticsResult,
  QuizResponse,
  QuizData,
  AxisAnalysis
} from '../types/analytics';

/**
 * Custom hook for processing and filtering analytics data
 */
export const useAnalyticsData = (
  responses: readonly QuizResponse[],
  filterOptions: FilterOptions,
  quizData?: QuizData
) => {
  // Filter responses based on demographics and other criteria
  const filteredResponses = useMemo(() => {
    return responses.filter((response) => {
      // Age filter
      if (response.demographics?.age) {
        const age = response.demographics.age;
        if (
          age < filterOptions.ageRange[0] ||
          age > filterOptions.ageRange[1]
        ) {
          return false;
        }
      }

      // Gender filter
      if (filterOptions.gender !== "all" && response.demographics?.gender) {
        if (response.demographics.gender !== filterOptions.gender) {
          return false;
        }
      }

      // Location filter
      if (filterOptions.location !== "all" && response.location) {
        if (response.location !== filterOptions.location) {
          return false;
        }
      }

      return true;
    });
  }, [responses, filterOptions]);

  // Calculate statistics for numeric values
  const calculateStatistics = useMemo(() => {
    return (values: number[]): StatisticsResult => {
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
  }, []);

  // Coordinate analysis for 4-axis diagnosis system
  const coordinateAnalysis = useMemo(() => {
    if (!quizData?.questions?.results || filteredResponses.length === 0) {
      return null;
    }

    const calculateCoordinatesFromAnswers = (answers: readonly any[]) => {
      const questions = quizData.questions?.questions || [];
      let totalXWeight = 0;
      let totalYWeight = 0;
      let questionCount = 0;

      answers.forEach((answer) => {
        const question = questions.find((q: any) => q.id === answer.questionId);
        if (question && answer.value !== undefined) {
          const normalizedScore = (answer.value - 3) / 2; // Convert 1-5 to -1~1
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

    const coordinateData: DiagnosisCoordinate[] = [];
    const results = quizData.questions.results;

    filteredResponses.forEach((response) => {
      const coord = calculateCoordinatesFromAnswers(response.answers || []);
      
      // Find closest result
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

      // Find or create coordinate data
      const existingCoord = coordinateData.find(
        c => c.resultName === closestResult.name
      );

      if (existingCoord) {
        existingCoord.count++;
      } else {
        coordinateData.push({
          x: closestResult.x,
          y: closestResult.y,
          resultName: closestResult.name,
          count: 1
        });
      }
    });

    return coordinateData.sort((a, b) => b.count - a.count);
  }, [filteredResponses, quizData]);

  // Axis analysis for multi-dimensional data
  const axisAnalysis = useMemo(() => {
    if (!quizData?.questions?.axes || filteredResponses.length === 0) {
      return [];
    }

    const analysisResults = quizData.questions?.axes?.map((axis: any) => {
      const axisQuestions = quizData.questions?.questions?.filter(
        (q: any) => q.axisWeights && Math.abs(q.axisWeights[axis.key] || 0) > 0.3
      );

      const axisScores = filteredResponses.map((response) => {
        const relevantAnswers = response.answers.filter((answer: any) =>
          axisQuestions?.some((q: any) => q.id === answer.questionId) || false
        );

        if (relevantAnswers.length === 0) return 0;

        return relevantAnswers.reduce((sum: number, answer: any) => 
          sum + (answer.value || 0), 0
        ) / relevantAnswers.length;
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
    }) || []; // Ensure we return an empty array if axes is undefined
    
    return analysisResults;
  }, [filteredResponses, quizData, calculateStatistics]);

  return {
    filteredResponses,
    totalResponses: filteredResponses.length,
    calculateStatistics,
    coordinateAnalysis,
    axisAnalysis,
  };
};