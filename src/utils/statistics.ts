// 統計計算ユーティリティ

export interface QuizStatistics {
  totalResponses: number;
  averageScore: number;
  completionRate: number;
  responseTimeStats: {
    average: number;
    median: number;
    min: number;
    max: number;
  };
  demographicBreakdown: {
    age: Record<string, number>;
    gender: Record<string, number>;
    location: Record<string, number>;
  };
  trendData: Array<{
    date: string;
    count: number;
    averageScore: number;
  }>;
  correlationMatrix: Record<string, Record<string, number>>;
}

export interface ResponseData {
  id: string;
  user_id: string;
  quiz_id: string;
  responses: any;
  result_data: any;
  score?: number;
  completed_at: string;
  created_at: string;
  response_time?: number; // 回答時間（秒）
  demographics?: {
    age?: string;
    gender?: string;
    location?: string;
  };
}

// 基本統計計算
export const calculateBasicStats = (responses: ResponseData[]): Partial<QuizStatistics> => {
  if (responses.length === 0) {
    return {
      totalResponses: 0,
      averageScore: 0,
      completionRate: 0,
    };
  }

  const completedResponses = responses.filter(r => r.completed_at);
  const scoresWithValue = responses.filter(r => r.score != null).map(r => r.score!);

  return {
    totalResponses: responses.length,
    averageScore: scoresWithValue.length > 0 
      ? scoresWithValue.reduce((sum, score) => sum + score, 0) / scoresWithValue.length 
      : 0,
    completionRate: responses.length > 0 
      ? (completedResponses.length / responses.length) * 100 
      : 0,
  };
};

// 回答時間統計
export const calculateResponseTimeStats = (responses: ResponseData[]) => {
  const responseTimes = responses
    .filter(r => r.response_time != null)
    .map(r => r.response_time!)
    .sort((a, b) => a - b);

  if (responseTimes.length === 0) {
    return {
      average: 0,
      median: 0,
      min: 0,
      max: 0,
    };
  }

  const average = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
  const median = responseTimes.length % 2 === 0
    ? (responseTimes[responseTimes.length / 2 - 1] + responseTimes[responseTimes.length / 2]) / 2
    : responseTimes[Math.floor(responseTimes.length / 2)];

  return {
    average,
    median,
    min: responseTimes[0],
    max: responseTimes[responseTimes.length - 1],
  };
};

// 人口統計学的分析
export const calculateDemographicBreakdown = (responses: ResponseData[]) => {
  const breakdown = {
    age: {} as Record<string, number>,
    gender: {} as Record<string, number>,
    location: {} as Record<string, number>,
  };

  responses.forEach(response => {
    const demographics = response.demographics || {};
    
    // 年齢分析
    if (demographics.age) {
      const ageGroup = getAgeGroup(demographics.age);
      breakdown.age[ageGroup] = (breakdown.age[ageGroup] || 0) + 1;
    }

    // 性別分析
    if (demographics.gender) {
      breakdown.gender[demographics.gender] = (breakdown.gender[demographics.gender] || 0) + 1;
    }

    // 地域分析
    if (demographics.location) {
      breakdown.location[demographics.location] = (breakdown.location[demographics.location] || 0) + 1;
    }
  });

  return breakdown;
};

// 年齢グループ分類
const getAgeGroup = (age: string): string => {
  const ageNum = parseInt(age);
  if (ageNum < 18) return '18歳未満';
  if (ageNum < 25) return '18-24歳';
  if (ageNum < 35) return '25-34歳';
  if (ageNum < 45) return '35-44歳';
  if (ageNum < 55) return '45-54歳';  
  if (ageNum < 65) return '55-64歳';
  return '65歳以上';
};

// トレンド分析（日別集計）
export const calculateTrendData = (responses: ResponseData[], days: number = 30) => {
  const now = new Date();
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  
  const trendData: Array<{
    date: string;
    count: number;
    averageScore: number;
  }> = [];

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    const dateString = date.toISOString().split('T')[0];
    
    const dayResponses = responses.filter(r => {
      const responseDate = new Date(r.created_at).toISOString().split('T')[0];
      return responseDate === dateString;
    });

    const dayScores = dayResponses.filter(r => r.score != null).map(r => r.score!);
    const averageScore = dayScores.length > 0 
      ? dayScores.reduce((sum, score) => sum + score, 0) / dayScores.length 
      : 0;

    trendData.push({
      date: dateString,
      count: dayResponses.length,
      averageScore,
    });
  }

  return trendData;
};

// 相関分析
export const calculateCorrelationMatrix = (responses: ResponseData[]) => {
  // 回答データから数値データを抽出
  const numericData: Record<string, number[]> = {};
  
  responses.forEach(response => {
    const answers = response.responses || {};
    
    Object.keys(answers).forEach(key => {
      const value = answers[key];
      if (typeof value === 'number') {
        if (!numericData[key]) {
          numericData[key] = [];
        }
        numericData[key].push(value);
      }
    });

    // スコアも含める
    if (response.score != null) {
      if (!numericData['score']) {
        numericData['score'] = [];
      }
      numericData['score'].push(response.score);
    }
  });

  // 相関行列を計算
  const correlationMatrix: Record<string, Record<string, number>> = {};
  const keys = Object.keys(numericData);

  keys.forEach(key1 => {
    correlationMatrix[key1] = {};
    keys.forEach(key2 => {
      correlationMatrix[key1][key2] = calculateCorrelation(
        numericData[key1],
        numericData[key2]
      );
    });
  });

  return correlationMatrix;
};

// ピアソンの相関係数
const calculateCorrelation = (x: number[], y: number[]): number => {
  if (x.length !== y.length || x.length === 0) return 0;

  const n = x.length;
  const sumX = x.reduce((sum, val) => sum + val, 0);
  const sumY = y.reduce((sum, val) => sum + val, 0);
  const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
  const sumXX = x.reduce((sum, val) => sum + val * val, 0);
  const sumYY = y.reduce((sum, val) => sum + val * val, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
};

// 統計的有意性検定
export const calculateSignificance = (
  group1: number[], 
  group2: number[]
): { pValue: number; isSignificant: boolean } => {
  // 簡単なt検定の実装
  if (group1.length === 0 || group2.length === 0) {
    return { pValue: 1, isSignificant: false };
  }

  const mean1 = group1.reduce((sum, val) => sum + val, 0) / group1.length;
  const mean2 = group2.reduce((sum, val) => sum + val, 0) / group2.length;
  
  const variance1 = group1.reduce((sum, val) => sum + Math.pow(val - mean1, 2), 0) / (group1.length - 1);
  const variance2 = group2.reduce((sum, val) => sum + Math.pow(val - mean2, 2), 0) / (group2.length - 1);
  
  const pooledVariance = ((group1.length - 1) * variance1 + (group2.length - 1) * variance2) / 
                        (group1.length + group2.length - 2);
  
  const standardError = Math.sqrt(pooledVariance * (1/group1.length + 1/group2.length));
  
  if (standardError === 0) {
    return { pValue: 1, isSignificant: false };
  }

  const tStatistic = Math.abs(mean1 - mean2) / standardError;
  
  // 簡易的なp値計算（より正確には自由度を考慮したt分布を使用）
  const pValue = 2 * (1 - Math.min(0.99, tStatistic / 3));
  
  return {
    pValue,
    isSignificant: pValue < 0.05,
  };
};

// 信頼区間計算
export const calculateConfidenceInterval = (
  data: number[], 
  confidence: number = 0.95
): { lower: number; upper: number; mean: number } => {
  if (data.length === 0) {
    return { lower: 0, upper: 0, mean: 0 };
  }

  const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
  const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (data.length - 1);
  const standardError = Math.sqrt(variance / data.length);
  
  // t値（簡易計算、実際にはt分布表を使用）
  const tValue = 1.96; // 95%信頼区間の場合
  const margin = tValue * standardError;

  return {
    lower: mean - margin,
    upper: mean + margin,
    mean,
  };
};

// 完全な統計計算
export const calculateFullStatistics = async (responses: ResponseData[]): Promise<QuizStatistics> => {
  const basicStats = calculateBasicStats(responses);
  const responseTimeStats = calculateResponseTimeStats(responses);
  const demographicBreakdown = calculateDemographicBreakdown(responses);
  const trendData = calculateTrendData(responses);
  const correlationMatrix = calculateCorrelationMatrix(responses);

  return {
    totalResponses: basicStats.totalResponses || 0,
    averageScore: basicStats.averageScore || 0,
    completionRate: basicStats.completionRate || 0,
    responseTimeStats,
    demographicBreakdown,
    trendData,
    correlationMatrix,
  };
};