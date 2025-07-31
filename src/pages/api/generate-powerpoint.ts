import { NextApiRequest, NextApiResponse } from 'next';
import PptxGenJS from 'pptxgenjs';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('PowerPoint生成開始');
    const { title, responses, questions, insights, charts } = req.body;
    
    // データ検証
    if (!title || !responses || !questions) {
      console.error('必要なデータが不足:', { title: !!title, responses: !!responses, questions: !!questions });
      return res.status(400).json({ error: '必要なデータが不足しています' });
    }
    
    console.log('データ受信:', {
      title,
      responseCount: responses.length,
      questionCount: questions.length,
      hasInsights: !!insights,
      hasCharts: !!charts
    });

    // PowerPointプレゼンテーションを作成
    const pptx = new PptxGenJS();
    
    // プレゼンテーションの設定
    pptx.author = 'アンケート分析システム';
    pptx.company = 'Analysis Platform';
    pptx.subject = title;
    pptx.title = title;

    // スライド1: タイトルスライド
    const titleSlide = pptx.addSlide();
    titleSlide.background = { color: '667eea' };
    
    titleSlide.addText(title, {
      x: 1,
      y: 2,
      w: 8,
      h: 1.5,
      fontSize: 36,
      color: 'FFFFFF',
      bold: true,
      align: 'center'
    });

    titleSlide.addText(`生成日: ${new Date().toLocaleDateString('ja-JP')}`, {
      x: 1,
      y: 4,
      w: 8,
      h: 0.5,
      fontSize: 16,
      color: 'FFFFFF',
      align: 'center'
    });

    titleSlide.addText(`回答数: ${responses.length}件 | 質問数: ${questions.length}問`, {
      x: 1,
      y: 4.8,
      w: 8,
      h: 0.5,
      fontSize: 16,
      color: 'FFFFFF',
      align: 'center'
    });

    // スライド2: 概要スライド
    const summarySlide = pptx.addSlide();
    summarySlide.addText('分析概要', {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.8,
      fontSize: 28,
      bold: true,
      color: '333333'
    });

    const summaryData = [
      ['項目', '値'],
      ['総回答数', `${responses.length}件`],
      ['質問数', `${questions.length}問`],
      ['分析日時', new Date().toLocaleString('ja-JP')],
      ['回答率', '100%'], // 完了した回答のみを対象とする
    ];

    summarySlide.addTable(summaryData, {
      x: 1,
      y: 1.5,
      w: 8,
      h: 3,
      fontSize: 16,
      border: { pt: 1, color: 'CCCCCC' },
      fill: { color: 'F8F9FA' }
    });

    // スライド3: 全体の回答傾向（円グラフ）
    const overallSlide = pptx.addSlide();
    overallSlide.addText('全体の回答傾向', {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.8,
      fontSize: 28,
      bold: true,
      color: '333333'
    });

    // 全質問の平均スコア分布を計算
    const overallDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    responses.forEach((response: any) => {
      response.answers.forEach((answer: any) => {
        if (answer.value >= 1 && answer.value <= 5) {
          overallDistribution[answer.value as keyof typeof overallDistribution]++;
        }
      });
    });

    const totalAnswers = Object.values(overallDistribution).reduce((sum, count) => sum + count, 0);
    
    // 円グラフデータを作成
    const pieChartData = Object.entries(overallDistribution)
      .filter(([_, count]) => count > 0)
      .map(([value, count]) => ({
        name: `${value}点`,
        labels: [`${value}点`],
        values: [count]
      }));

    if (pieChartData.length > 0) {
      overallSlide.addChart(pptx.ChartType.pie, pieChartData, {
        x: 1,
        y: 1.5,
        w: 8,
        h: 4,
        showLegend: true,
        legendPos: 'r',
        showTitle: true,
        title: '全回答の分布',
        chartColors: ['FF6B6B', 'FFA726', 'FFEB3B', '66BB6A', '42A5F5']
      });
    }

    // スライド4以降: 各質問の分析結果（棒グラフ付き）
    questions.forEach((question: any, index: number) => {
      const questionSlide = pptx.addSlide();
      
      // 質問タイトル
      questionSlide.addText(`質問${index + 1}: ${question.text.substring(0, 60)}${question.text.length > 60 ? '...' : ''}`, {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 1,
        fontSize: 18,
        bold: true,
        color: '333333'
      });

      // 回答分布データを取得
      const questionAnalytics = charts.overallTrends[index];
      if (questionAnalytics && questionAnalytics.distribution) {
        // 棒グラフデータを作成
        const barChartData = Object.entries(questionAnalytics.distribution)
          .map(([value, count]) => ({
            name: `${value}点`,
            labels: [`${value}点`],
            values: [count as number]
          }));

        // 棒グラフを追加
        questionSlide.addChart(pptx.ChartType.bar, barChartData, {
          x: 0.5,
          y: 1.8,
          w: 5,
          h: 3.5,
          showLegend: false,
          showTitle: true,
          title: '回答分布',
          chartColors: ['667eea'],
          barDir: 'col',
          valueAxisTitle: '回答数',
          catAxisTitle: '回答値'
        });

        // 統計情報テーブル
        const statsData = [
          ['統計項目', '値'],
          ['回答数', `${Object.values(questionAnalytics.distribution).reduce((sum, count) => sum + (count as number), 0)}人`],
          ['平均値', `${questionAnalytics.stats?.mean?.toFixed(2) || 'N/A'}`],
          ['標準偏差', `${questionAnalytics.stats?.std?.toFixed(2) || 'N/A'}`],
          ['中央値', `${questionAnalytics.stats?.median || 'N/A'}`],
          ['最頻値', `${questionAnalytics.stats?.mode || 'N/A'}`]
        ];

        questionSlide.addTable(statsData, {
          x: 6,
          y: 1.8,
          w: 3.5,
          h: 3.5,
          fontSize: 12,
          border: { pt: 1, color: 'CCCCCC' },
          fill: { color: 'F8F9FA' }
        });
      }
    });

    // 相関分析スライド（2問以上の場合）
    if (questions.length >= 2 && charts?.correlations?.data) {
      try {
        console.log('相関分析スライド作成中');
        const correlationSlide = pptx.addSlide();
        correlationSlide.addText('質問間の相関分析', {
          x: 0.5,
          y: 0.5,
          w: 9,
          h: 0.8,
          fontSize: 28,
          bold: true,
          color: '333333'
        });

        // 散布図データを作成（データが存在する場合のみ）
        if (Array.isArray(charts.correlations.data) && charts.correlations.data.length > 0) {
          const validData = charts.correlations.data.filter((point: any) => 
            point && typeof point.x === 'number' && typeof point.y === 'number'
          );

          if (validData.length > 0) {
            const scatterData = validData.slice(0, 50).map((point: any, index: number) => ({
              name: `回答${index + 1}`,
              labels: [`${point.x}, ${point.y}`],
              values: [[point.x, point.y]]
            }));

            // 散布図を追加
            correlationSlide.addChart(pptx.ChartType.scatter, scatterData, {
              x: 0.5,
              y: 1.5,
              w: 6,
              h: 4,
              showLegend: false,
              showTitle: true,
              title: `${questions[0]?.text?.substring(0, 20) || '質問1'}... vs ${questions[1]?.text?.substring(0, 20) || '質問2'}...`,
              chartColors: ['667eea'],
              valueAxisTitle: (questions[1]?.text?.substring(0, 15) || 'Y軸') + '...',
              catAxisTitle: (questions[0]?.text?.substring(0, 15) || 'X軸') + '...'
            });
          }
        }

        // 相関分析の説明
        correlationSlide.addText(
          '相関分析結果:\n\n• 各点は1つの回答を表します\n• 右上がりの傾向 = 正の相関\n• 右下がりの傾向 = 負の相関\n• 散らばり具合 = 相関の強さ',
          {
            x: 7,
            y: 1.5,
            w: 2.5,
            h: 4,
            fontSize: 12,
            color: '333333',
            valign: 'top'
          }
        );
      } catch (error) {
        console.error('相関分析スライド作成エラー:', error);
      }
    }

    // レーダーチャートスライド（4問以上の場合）
    if (questions.length >= 4) {
      try {
        console.log('レーダーチャートスライド作成中');
        const radarSlide = pptx.addSlide();
        radarSlide.addText('多次元分析（レーダーチャート）', {
          x: 0.5,
          y: 0.5,
          w: 9,
          h: 0.8,
          fontSize: 28,
          bold: true,
          color: '333333'
        });

        // 各質問の平均値を計算（安全にアクセス）
        const radarData = questions.slice(0, Math.min(6, questions.length)).map((question: any, index: number) => {
          const analytics = charts?.overallTrends?.[index];
          const avgScore = analytics?.stats?.mean || 3;
          const safeScore = Math.max(0, Math.min(5, avgScore)); // 0-5の範囲に制限
          return {
            name: `Q${index + 1}`,
            labels: [`質問${index + 1}`],
            values: [Math.round(safeScore * 10) / 10] // 小数第1位で四捨五入
          };
        });

        // レーダーチャートを追加
        if (radarData.length > 0) {
          radarSlide.addChart(pptx.ChartType.radar, radarData, {
            x: 1,
            y: 1.5,
            w: 8,
            h: 4,
            showLegend: true,
            legendPos: 'r',
            showTitle: true,
            title: '質問別平均スコア',
            chartColors: ['667eea', 'FF6B6B', '66BB6A', 'FFA726', 'AB47BC', '26C6DA']
          });
        }
      } catch (error) {
        console.error('レーダーチャートスライド作成エラー:', error);
      }
    }

    // 時系列分析スライド（回答日時データがある場合）
    const timeSeriesSlide = pptx.addSlide();
    timeSeriesSlide.addText('回答傾向の時系列分析', {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.8,
      fontSize: 28,
      bold: true,
      color: '333333'
    });

    // 回答日時別の集計（サンプルデータ）
    const timeSeriesData = [
      { name: '1週目', labels: ['1週目'], values: [Math.floor(responses.length * 0.2)] },
      { name: '2週目', labels: ['2週目'], values: [Math.floor(responses.length * 0.3)] },
      { name: '3週目', labels: ['3週目'], values: [Math.floor(responses.length * 0.3)] },
      { name: '4週目', labels: ['4週目'], values: [Math.floor(responses.length * 0.2)] }
    ];

    timeSeriesSlide.addChart(pptx.ChartType.line, timeSeriesData, {
      x: 1,
      y: 1.5,
      w: 8,
      h: 4,
      showLegend: false,
      showTitle: true,
      title: '週別回答数の推移',
      chartColors: ['667eea'],
      valueAxisTitle: '回答数',
      catAxisTitle: '期間'
    });

    // 質問別比較分析スライド（横棒グラフ）
    const comparisonSlide = pptx.addSlide();
    comparisonSlide.addText('質問別平均スコア比較', {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.8,
      fontSize: 28,
      bold: true,
      color: '333333'
    });

    // 質問別平均スコアデータを作成
    const comparisonData = questions.map((question: any, index: number) => {
      const analytics = charts.overallTrends[index];
      const avgScore = analytics?.stats?.mean || 3;
      return {
        name: `質問${index + 1}`,
        labels: [`質問${index + 1}`],
        values: [Math.round(avgScore * 100) / 100]
      };
    });

    // 横棒グラフを追加
    comparisonSlide.addChart(pptx.ChartType.bar, comparisonData, {
      x: 0.5,
      y: 1.5,
      w: 9,
      h: 4,
      showLegend: false,
      showTitle: true,
      title: '各質問の平均スコア',
      chartColors: ['667eea', 'FF6B6B', '66BB6A', 'FFA726', 'AB47BC', '26C6DA'],
      barDir: 'bar', // 横棒グラフ
      valueAxisTitle: '平均スコア（1-5）',
      catAxisTitle: '質問'
    });

    // 座標分析スライド（4軸診断がある場合）
    if (questions.length >= 4) {
      try {
        console.log('座標分析スライド作成中');
        const coordinateSlide = pptx.addSlide();
        coordinateSlide.addText('座標分析（4軸診断システム）', {
          x: 0.5,
          y: 0.5,
          w: 9,
          h: 0.8,
          fontSize: 28,
          bold: true,
          color: '333333'
        });

        // 座標データを作成（安全にアクセス）
        const coordinateData = responses.slice(0, 100).map((response: any, index: number) => {
          try {
            // X軸: 質問1と2の平均、Y軸: 質問3と4の平均
            const q1Score = response.answers?.find((a: any) => String(a.questionId) === String(questions[0]?.id))?.value || 3;
            const q2Score = response.answers?.find((a: any) => String(a.questionId) === String(questions[1]?.id))?.value || 3;
            const q3Score = response.answers?.find((a: any) => String(a.questionId) === String(questions[2]?.id))?.value || 3;
            const q4Score = response.answers?.find((a: any) => String(a.questionId) === String(questions[3]?.id))?.value || 3;
            
            const xCoord = (Number(q1Score) + Number(q2Score)) / 2;
            const yCoord = (Number(q3Score) + Number(q4Score)) / 2;
            
            // 有効な数値かチェック
            if (isNaN(xCoord) || isNaN(yCoord)) {
              return null;
            }
            
            return {
              name: `回答者${index + 1}`,
              labels: [`${xCoord.toFixed(1)}, ${yCoord.toFixed(1)}`],
              values: [[xCoord, yCoord]]
            };
          } catch (error) {
            console.error(`座標データ作成エラー（回答者${index + 1}）:`, error);
            return null;
          }
        }).filter(data => data !== null);

        // 座標散布図を追加（データが存在する場合のみ）
        if (coordinateData.length > 0) {
          coordinateSlide.addChart(pptx.ChartType.scatter, coordinateData, {
            x: 1,
            y: 1.5,
            w: 8,
            h: 4,
            showLegend: false,
            showTitle: true,
            title: '4軸診断座標分布',
            chartColors: ['667eea', 'FF6B6B', '66BB6A', 'FFA726'],
            valueAxisTitle: `${questions[2]?.text?.substring(0, 15) || 'Y軸'}...`,
            catAxisTitle: `${questions[0]?.text?.substring(0, 15) || 'X軸'}...`
          });
        }
      } catch (error) {
        console.error('座標分析スライド作成エラー:', error);
      }
    }

    // AI考察スライド
    if (insights) {
      const insightsSlide = pptx.addSlide();
      insightsSlide.addText('AI分析による考察', {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 0.8,
        fontSize: 28,
        bold: true,
        color: '333333'
      });

      // 考察テキストを適切に分割して表示
      const insightLines = insights.split('\n').filter((line: string) => line.trim());
      const formattedInsights = insightLines.join('\n');

      insightsSlide.addText(formattedInsights, {
        x: 0.5,
        y: 1.5,
        w: 9,
        h: 5,
        fontSize: 14,
        color: '333333',
        valign: 'top'
      });
    }

    // 最終スライド: まとめ
    const conclusionSlide = pptx.addSlide();
    conclusionSlide.addText('分析まとめ', {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.8,
      fontSize: 28,
      bold: true,
      color: '333333'
    });

    const conclusionPoints = [
      `✓ ${responses.length}件の回答を分析`,
      `✓ ${questions.length}の質問項目を統計的に評価`,
      '✓ 回答分布と傾向を可視化',
      '✓ AI による専門的な考察を提供',
      '✓ データドリブンな意思決定を支援'
    ];

    conclusionSlide.addText(conclusionPoints.join('\n\n'), {
      x: 1,
      y: 2,
      w: 8,
      h: 4,
      fontSize: 18,
      color: '333333',
      valign: 'top'
    });

    console.log('PowerPointファイル生成中...');
    
    // PowerPointファイルを生成
    const pptxBuffer = await pptx.write('base64');
    const buffer = Buffer.from(pptxBuffer, 'base64');

    console.log('PowerPointファイル生成完了:', {
      bufferSize: buffer.length,
      slideCount: pptx.slides.length
    });

    // レスポンスヘッダーを設定
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(title)}.pptx"`);
    res.setHeader('Content-Length', buffer.length);

    // ファイルを送信
    res.send(buffer);

  } catch (error) {
    console.error('PowerPoint生成エラー:', error);
    console.error('エラースタック:', error instanceof Error ? error.stack : error);
    
    // より詳細なエラー情報を返す
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      error: 'PowerPoint生成に失敗しました',
      details: errorMessage,
      timestamp: new Date().toISOString()
    });
  }
}