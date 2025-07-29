// PowerPoint生成ユーティリティ
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface SlideData {
  title: string;
  content: string | React.ReactNode;
  chartElement?: HTMLElement;
  layout: 'title' | 'content' | 'chart' | 'split' | 'summary';
  backgroundColor?: string;
  textColor?: string;
}

export interface PresentationData {
  title: string;
  subtitle?: string;
  author?: string;
  date?: string;
  slides: SlideData[];
  theme?: 'default' | 'blue' | 'green' | 'dark';
}

// PowerPoint風HTMLスライドを生成
export const generateSlideHTML = (slide: SlideData, index: number): string => {
  const themes = {
    default: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      textColor: '#ffffff',
      accent: '#4CAF50',
    },
    blue: {
      background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
      textColor: '#ffffff',
      accent: '#FFC107',
    },
    green: {
      background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
      textColor: '#ffffff',
      accent: '#FF9800',
    },
    dark: {
      background: 'linear-gradient(135deg, #424242 0%, #212121 100%)',
      textColor: '#ffffff',
      accent: '#00BCD4',
    },
  };

  const theme = themes.default;

  const getLayoutHTML = () => {
    switch (slide.layout) {
      case 'title':
        return `
          <div class="slide-content title-slide">
            <h1 class="slide-title">${slide.title}</h1>
            <div class="slide-text">${slide.content}</div>
          </div>
        `;
      case 'chart':
        return `
          <div class="slide-content chart-slide">
            <h2 class="slide-title">${slide.title}</h2>
            <div class="chart-container">
              ${slide.chartElement ? slide.chartElement.outerHTML : ''}
            </div>
          </div>
        `;
      case 'split':
        return `
          <div class="slide-content split-slide">
            <h2 class="slide-title">${slide.title}</h2>
            <div class="split-container">
              <div class="split-left">
                <div class="slide-text">${slide.content}</div>
              </div>
              <div class="split-right">
                <div class="chart-container">
                  ${slide.chartElement ? slide.chartElement.outerHTML : ''}
                </div>
              </div>
            </div>
          </div>
        `;
      case 'summary':
        return `
          <div class="slide-content summary-slide">
            <h2 class="slide-title">${slide.title}</h2>
            <div class="summary-content">
              ${slide.content}
            </div>
          </div>
        `;
      default:
        return `
          <div class="slide-content content-slide">
            <h2 class="slide-title">${slide.title}</h2>
            <div class="slide-text">${slide.content}</div>
          </div>
        `;
    }
  };

  return `
    <div class="slide" data-slide="${index}" style="
      background: ${theme.background};
      color: ${theme.textColor};
      width: 1920px;
      height: 1080px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 60px;
      box-sizing: border-box;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      position: relative;
    ">
      ${getLayoutHTML()}
      <div class="slide-number" style="
        position: absolute;
        bottom: 30px;
        right: 30px;
        font-size: 24px;
        opacity: 0.7;
      ">
        ${index + 1}
      </div>
    </div>
    <style>
      .slide-title {
        font-size: 48px;
        font-weight: bold;
        margin-bottom: 30px;
        text-align: center;
        color: ${theme.textColor};
      }
      .title-slide .slide-title {
        font-size: 72px;
        margin-bottom: 40px;
      }
      .slide-text {
        font-size: 32px;
        line-height: 1.6;
        text-align: center;
        max-width: 1200px;
      }
      .chart-container {
        width: 100%;
        height: 600px;
        display: flex;
        justify-content: center;
        align-items: center;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        backdrop-filter: blur(10px);
      }
      .split-container {
        display: flex;
        width: 100%;
        height: 700px;
        gap: 40px;
      }
      .split-left, .split-right {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      .summary-content {
        font-size: 36px;
        line-height: 1.8;
        text-align: left;
        max-width: 1400px;
      }
      .summary-content ul {
        list-style-type: none;
        padding: 0;
      }
      .summary-content li {
        margin: 20px 0;
        padding-left: 40px;
        position: relative;
      }
      .summary-content li:before {
        content: '▶';
        position: absolute;
        left: 0;
        color: ${theme.accent};
      }
    </style>
  `;
};

// 分析データからプレゼンテーション用データを生成
export const generatePresentationFromAnalytics = (
  quizTitle: string,
  statistics: any,
  chartElements: HTMLElement[]
): PresentationData => {
  const slides: SlideData[] = [];

  // タイトルスライド
  slides.push({
    title: `${quizTitle} 分析レポート`,
    content: `
      <div style="font-size: 42px; margin-bottom: 30px;">
        詳細な統計分析と洞察
      </div>
      <div style="font-size: 28px; opacity: 0.8;">
        生成日: ${new Date().toLocaleDateString('ja-JP')}
      </div>
    `,
    layout: 'title',
  });

  // サマリースライド
  slides.push({
    title: '分析サマリー',
    content: `
      <ul>
        <li>総回答数: ${statistics.totalResponses?.toLocaleString() || 0}件</li>
        <li>平均スコア: ${statistics.averageScore?.toFixed(1) || 0}点</li>
        <li>完了率: ${statistics.completionRate?.toFixed(1) || 0}%</li>
        <li>平均回答時間: ${Math.round((statistics.responseTimeStats?.average || 0) / 60)}分</li>
      </ul>
    `,
    layout: 'summary',
  });

  // トレンド分析スライド
  if (chartElements[0]) {
    slides.push({
      title: '回答トレンド分析',
      content: '時系列での回答数とスコアの推移を示しています。',
      chartElement: chartElements[0],
      layout: 'split',
    });
  }

  // 人口統計スライド
  if (chartElements[1]) {
    slides.push({
      title: '回答者の人口統計',
      content: '年齢、性別、地域別の回答分布',
      chartElement: chartElements[1],
      layout: 'split',
    });
  }

  // 相関分析スライド
  if (chartElements[2]) {
    slides.push({
      title: '質問間の相関関係',
      content: '各質問項目間の統計的相関を分析',
      chartElement: chartElements[2],
      layout: 'split',
    });
  }

  // スコア分布スライド
  if (chartElements[3]) {
    slides.push({
      title: 'スコア分布分析',
      content: '回答者のスコア分布パターン',
      chartElement: chartElements[3],
      layout: 'split',
    });
  }

  // 洞察と推奨事項スライド
  slides.push({
    title: '主要な洞察',
    content: `
      <ul>
        <li>回答者の${Math.round((statistics.completionRate || 0))}%が最後まで完了</li>
        <li>平均回答時間は${Math.round((statistics.responseTimeStats?.average || 0) / 60)}分で適切</li>
        <li>スコア分布は${statistics.averageScore > 70 ? '良好' : '改善の余地あり'}</li>
        <li>最も多い年齢層: ${Object.keys(statistics.demographicBreakdown?.age || {})[0] || 'データなし'}</li>
      </ul>
    `,
    layout: 'summary',
  });

  // 推奨事項スライド
  slides.push({
    title: '改善推奨事項',
    content: `
      <ul>
        <li>${statistics.completionRate < 80 ? '完了率向上のため質問数を調整' : '現在の完了率は良好'}</li>
        <li>${statistics.averageScore < 60 ? '難易度調整を検討' : '現在の難易度は適切'}</li>
        <li>最も相関の高い質問項目を重点的に分析</li>
        <li>回答者フィードバックの収集と分析</li>
      </ul>
    `,
    layout: 'summary',
  });

  return {
    title: `${quizTitle} 分析レポート`,
    subtitle: '統計分析と洞察',
    author: 'SciscitorAI',
    date: new Date().toLocaleDateString('ja-JP'),
    slides,
    theme: 'blue',
  };
};

// HTMLスライドをPDFに変換
export const convertSlidesToPDF = async (
  presentationData: PresentationData
): Promise<Blob> => {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [1920, 1080],
  });

  for (let i = 0; i < presentationData.slides.length; i++) {
    const slide = presentationData.slides[i];
    
    // 一時的なDIV要素を作成
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = generateSlideHTML(slide, i);
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    document.body.appendChild(tempDiv);

    try {
      // HTML2Canvasでスライドを画像に変換
      const canvas = await html2canvas(tempDiv.firstElementChild as HTMLElement, {
        width: 1920,
        height: 1080,
        scale: 0.5, // パフォーマンス向上のため
        useCORS: true,
        allowTaint: true,
      });

      const imgData = canvas.toDataURL('image/png');
      
      if (i > 0) {
        pdf.addPage();
      }
      
      pdf.addImage(imgData, 'PNG', 0, 0, 1920, 1080);
    } catch (error) {
      console.error('スライド変換エラー:', error);
    } finally {
      // 一時要素を削除
      document.body.removeChild(tempDiv);
    }
  }

  return pdf.output('blob');
};

// PowerPoint風のHTMLプレゼンテーションを生成
export const generateHTMLPresentation = (
  presentationData: PresentationData
): string => {
  const slidesHTML = presentationData.slides
    .map((slide, index) => generateSlideHTML(slide, index))
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${presentationData.title}</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #000;
          overflow: hidden;
        }
        .presentation-container {
          width: 100vw;
          height: 100vh;
          display: flex;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
        }
        .slide {
          min-width: 100vw;
          height: 100vh;
          scroll-snap-align: start;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        .controls {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 10px;
          z-index: 1000;
        }
        .control-btn {
          padding: 10px 20px;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          backdrop-filter: blur(10px);
        }
        .control-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      </style>
    </head>
    <body>
      <div class="presentation-container" id="presentation">
        ${slidesHTML}
      </div>
      <div class="controls">
        <button class="control-btn" onclick="previousSlide()">前へ</button>
        <span class="control-btn" id="slideCounter">1 / ${presentationData.slides.length}</span>
        <button class="control-btn" onclick="nextSlide()">次へ</button>
        <button class="control-btn" onclick="fullscreen()">全画面</button>
      </div>
      <script>
        let currentSlide = 0;
        const totalSlides = ${presentationData.slides.length};
        const container = document.getElementById('presentation');
        
        function updateSlideCounter() {
          document.getElementById('slideCounter').textContent = \`\${currentSlide + 1} / \${totalSlides}\`;
        }
        
        function goToSlide(index) {
          if (index >= 0 && index < totalSlides) {
            currentSlide = index;
            container.scrollLeft = index * window.innerWidth;
            updateSlideCounter();
          }
        }
        
        function nextSlide() {
          goToSlide(currentSlide + 1);
        }
        
        function previousSlide() {
          goToSlide(currentSlide - 1);
        }
        
        function fullscreen() {
          if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
          }
        }
        
        // キーボードナビゲーション
        document.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowRight') nextSlide();
          if (e.key === 'ArrowLeft') previousSlide();
          if (e.key === 'F11') {
            e.preventDefault();
            fullscreen();
          }
        });
        
        // スクロールによるスライド変更を検出
        container.addEventListener('scroll', () => {
          const newSlide = Math.round(container.scrollLeft / window.innerWidth);
          if (newSlide !== currentSlide) {
            currentSlide = newSlide;
            updateSlideCounter();
          }
        });
      </script>
    </body>
    </html>
  `;
};

// ファイルダウンロード
export const downloadFile = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};