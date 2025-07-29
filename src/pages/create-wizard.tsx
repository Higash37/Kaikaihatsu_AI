import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  Grid,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useRouter } from "next/router";
import React, { useState } from "react";

import AxisCoordinateInput from "@/components/AxisCoordinateInput";
import Header from "@/components/Header";
import Layout from "@/components/Layout";
import ProgressGauge from "@/components/ProgressGauge";
import ProtectedRoute from "@/components/ProtectedRoute";
import QuestionEditor from "@/components/QuestionEditor";
import ResultPlacementGrid from "@/components/ResultPlacementGrid";

// ステップ定義
const STEPS = [
  "4つの指標設定",
  "結果配置設定", 
  "質問内容編集"
];

interface Axis {
  id: number;
  name: string;
  description: string;
  positiveName: string;
  negativeName: string;
}

interface Result {
  id: string;
  name: string;
  description: string;
  x: number; // -1 to 1 (left to right)
  y: number; // -1 to 1 (bottom to top)
}

interface Question {
  id: string;
  text: string;
  axisWeights: {
    x: number; // -1 to 1
    y: number; // -1 to 1
  };
}

interface WizardData {
  theme: string;
  questionCount: number;
  resultType: string; // 結果として診断したいもの（人、場所、動物など）
  axes: Axis[];
  results: Result[];
  questions: Question[];
}

function CreateWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [wizardData, setWizardData] = useState<WizardData>({
    theme: "",
    questionCount: 10,
    resultType: "",
    axes: [
      { id: 1, name: "", description: "", positiveName: "", negativeName: "" },
      { id: 2, name: "", description: "", positiveName: "", negativeName: "" },
    ],
    results: [],
    questions: [],
  });

  // URLパラメータからテーマと問題数を取得
  React.useEffect(() => {
    if (router.isReady) {
      const { theme, questionCount } = router.query;
      if (theme && typeof theme === "string") {
        // テーマに基づいてサンプルデータを生成
        const sampleData = generateSampleData(theme);
        
        setWizardData(prev => ({
          ...prev,
          theme: theme,
          questionCount: questionCount ? parseInt(questionCount as string) : 10,
          resultType: sampleData.resultType,
          axes: [
            { 
              id: 1, 
              name: sampleData.axes.x.name, 
              description: sampleData.axes.x.description, 
              positiveName: sampleData.axes.x.positive, 
              negativeName: sampleData.axes.x.negative 
            },
            { 
              id: 2, 
              name: sampleData.axes.y.name, 
              description: sampleData.axes.y.description, 
              positiveName: sampleData.axes.y.positive, 
              negativeName: sampleData.axes.y.negative 
            },
          ],
        }));
      }
    }
  }, [router.isReady, router.query]);

  // テーマから結果タイプを生成する関数
  const generateResultTypeFromTheme = (theme: string, fallback: string) => {
    const themeKeywords = theme.toLowerCase();
    
    // サッカー関連
    if (themeKeywords.includes('サッカー') || themeKeywords.includes('フットボール')) {
      if (themeKeywords.includes('プレミアリーグ')) return "プレミアリーグ選手";
      if (themeKeywords.includes('ワールドカップ')) return "代表選手";
      return "サッカー選手";
    }
    
    // スポーツ関連
    if (themeKeywords.includes('野球')) return "野球選手";
    if (themeKeywords.includes('バスケ')) return "バスケ選手";
    if (themeKeywords.includes('テニス')) return "テニス選手";
    if (themeKeywords.includes('スポーツ')) return "アスリート";
    
    // ビジネス関連
    if (themeKeywords.includes('営業')) return "営業職";
    if (themeKeywords.includes('エンジニア') || themeKeywords.includes('開発')) return "エンジニア";
    if (themeKeywords.includes('マネージャー') || themeKeywords.includes('管理')) return "マネージャー";
    if (themeKeywords.includes('起業') || themeKeywords.includes('経営')) return "経営者";
    
    // エンターテイメント関連
    if (themeKeywords.includes('アニメ') || themeKeywords.includes('漫画')) return "アニメキャラクター";
    if (themeKeywords.includes('映画')) return "映画キャラクター";
    if (themeKeywords.includes('ゲーム')) return "ゲームキャラクター";
    if (themeKeywords.includes('音楽') || themeKeywords.includes('アーティスト')) return "ミュージシャン";
    
    // 動物関連
    if (themeKeywords.includes('動物') || themeKeywords.includes('ペット')) return "動物";
    if (themeKeywords.includes('犬')) return "犬の種類";
    if (themeKeywords.includes('猫')) return "猫の種類";
    
    // 食べ物関連
    if (themeKeywords.includes('料理') || themeKeywords.includes('食べ物')) return "料理・食べ物";
    if (themeKeywords.includes('ラーメン')) return "ラーメン";
    if (themeKeywords.includes('カフェ') || themeKeywords.includes('コーヒー')) return "カフェメニュー";
    
    // 旅行・場所関連
    if (themeKeywords.includes('旅行') || themeKeywords.includes('観光')) return "旅行先・観光地";
    if (themeKeywords.includes('国')) return "国・地域";
    if (themeKeywords.includes('都市') || themeKeywords.includes('街')) return "都市・街";
    
    // 色・デザイン関連
    if (themeKeywords.includes('色') || themeKeywords.includes('カラー')) return "色・カラー";
    if (themeKeywords.includes('ファッション')) return "ファッションスタイル";
    
    return fallback;
  };

  // テーマに基づいてサンプルデータを生成する関数
  const generateSampleData = (theme: string) => {
    // キーワードベースでサンプルデータを生成
    const themeKeywords = theme.toLowerCase();
    
    if (themeKeywords.includes('チーム') || themeKeywords.includes('メンバー') || themeKeywords.includes('適性')) {
      return {
        resultType: generateResultTypeFromTheme(theme, "職種・役割"),
        axes: {
          x: {
            name: "アプローチスタイル",
            description: "問題解決や作業へのアプローチ方法",
            positive: "積極的・行動重視",
            negative: "慎重・分析重視"
          },
          y: {
            name: "コミュニケーション傾向",
            description: "他者との関わり方や情報共有スタイル",
            positive: "協調・チーム重視",
            negative: "独立・個人重視"
          }
        }
      };
    } else if (themeKeywords.includes('性格') || themeKeywords.includes('心理') || themeKeywords.includes('タイプ')) {
      return {
        resultType: generateResultTypeFromTheme(theme, "キャラクター・人物"),
        axes: {
          x: {
            name: "外向性",
            description: "エネルギーの向かう方向",
            positive: "外向的・社交的",
            negative: "内向的・集中型"
          },
          y: {
            name: "判断スタイル",
            description: "意思決定の基準",
            positive: "感情・価値観重視",
            negative: "論理・分析重視"
          }
        }
      };
    } else if (themeKeywords.includes('学習') || themeKeywords.includes('勉強') || themeKeywords.includes('教育')) {
      return {
        resultType: generateResultTypeFromTheme(theme, "学習者タイプ"),
        axes: {
          x: {
            name: "学習アプローチ",
            description: "知識の習得方法",
            positive: "実践・体験重視",
            negative: "理論・概念重視"
          },
          y: {
            name: "学習ペース",
            description: "学習の進め方",
            positive: "集中・短期集約型",
            negative: "継続・長期分散型"
          }
        }
      };
    } else if (themeKeywords.includes('恋愛') || themeKeywords.includes('相性') || themeKeywords.includes('関係')) {
      return {
        resultType: generateResultTypeFromTheme(theme, "恋人・パートナータイプ"),
        axes: {
          x: {
            name: "表現スタイル",
            description: "感情の表現方法",
            positive: "直接的・積極的",
            negative: "間接的・控えめ"
          },
          y: {
            name: "関係性の重視",
            description: "関係における価値観",
            positive: "感情・ロマンス重視",
            negative: "安定・信頼重視"
          }
        }
      };
    } else {
      // デフォルトのサンプル
      return {
        resultType: generateResultTypeFromTheme(theme, "タイプ・分類"),
        axes: {
          x: {
            name: "行動特性",
            description: "行動パターンや傾向",
            positive: "能動的・積極的",
            negative: "慎重・計画的"
          },
          y: {
            name: "思考特性",
            description: "思考方法や判断基準",
            positive: "直感・感覚重視",
            negative: "論理・分析重視"
          }
        }
      };
    }
  };

  // ステップ1: 4つの指標設定画面
  const generateAxes = async () => {
    if (!wizardData.theme.trim()) {
      setError("テーマを入力してください。");
      return;
    }
    if (!wizardData.resultType.trim()) {
      setError("結果として診断したいものを入力してください。");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/generate-axes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          theme: wizardData.theme,
          resultType: wizardData.resultType,
          questionCount: wizardData.questionCount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "指標の生成に失敗しました。");
      }

      const data = await response.json();
      setWizardData(prev => ({
        ...prev,
        axes: data.axes,
      }));
    } catch (err: any) {
      setError(err.message || "エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  const handleAxisChange = (axisId: number, field: string, value: string) => {
    setWizardData(prev => ({
      ...prev,
      axes: prev.axes.map(axis => 
        axis.id === axisId ? { ...axis, [field]: value } : axis
      ),
    }));
  };

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      // Step1からStep2への遷移時に結果を自動生成
      if (currentStep === 0 && wizardData.results.length === 0) {
        generateInitialResults();
      }
      
      // Step2からStep3への遷移時に質問を自動生成
      if (currentStep === 1 && wizardData.questions.length === 0) {
        await generateInitialQuestions();
      }
      
      setCurrentStep(prev => prev + 1);
    } else {
      // 最後のステップで完了ボタンが押された場合、アンケートを保存してホームに遷移
      await saveQuiz();
    }
  };

  // アンケートを保存する関数
  const saveQuiz = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          theme: wizardData.theme,
          questionCount: wizardData.questions.length,
          questions: wizardData.questions,
          results: wizardData.results,
          axes: wizardData.axes,
          tags: [], // 必要に応じて追加
          isPublic: true,
          enableDemographics: false,
          enableLocationTracking: false,
          enableRating: false,
          creatorId: user?.id || "temp_user_001",
          creatorName: user?.username || user?.profile?.displayName || "テストユーザー",
          // ウィザードで作成されたことを示すフラグ
          isWizardCreated: true,
          resultType: wizardData.resultType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "アンケートの保存に失敗しました。");
      }

      const quizData = await response.json();

      // 生成されたデータをセッションストレージに保存
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("quizData", JSON.stringify(quizData));
      }

      // 成功メッセージを表示
      alert("アンケートが正常に作成されました！");

      // ホーム画面に遷移
      router.push("/");
    } catch (err: any) {
      setError(err.message || "エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  // 初期結果を自動生成する関数
  const generateInitialResults = () => {
    const sampleResults = generateSampleResults(wizardData.theme, wizardData.resultType);
    setWizardData(prev => ({ 
      ...prev, 
      results: sampleResults,
      // デフォルトで16箇所モードに設定
    }));
  };

  // テーマと結果タイプに基づいて16個のサンプル結果を生成する関数
  const generateSampleResults = (theme: string, resultType: string): Result[] => {
    const themeKeywords = theme.toLowerCase();
    
    // 16箇所の座標を生成（4x4グリッド）
    const generate16Positions = (): { x: number; y: number }[] => {
      const positions: { x: number; y: number }[] = [];
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          positions.push({
            x: -0.75 + (j * 0.5),
            y: 0.75 - (i * 0.5)
          });
        }
      }
      return positions;
    };

    const positions = generate16Positions();
    
    // サッカー関連
    if (themeKeywords.includes('サッカー') || themeKeywords.includes('フットボール')) {
      const names = [
        'メッシ', 'ロナウド', 'ネイマール', 'ムバッペ',
        'イニエスタ', 'モドリッチ', 'デ・ブライネ', 'サラー',
        'レヴァンドフスキ', 'ベンゼマ', 'ハーランド', 'ヴィニシウス',
        'ペドリ', 'ガビ', 'ベリンガム', 'カンテ'
      ];
      const descriptions = [
        '創造性と技術の天才', '完璧主義の努力家', '華麗なテクニシャン', 'スピードスター',
        '冷静な司令塔', '万能なミッドフィールダー', 'パスの名手', 'ゴールハンター',
        '得点マシーン', 'エレガントなストライカー', 'フィジカルモンスター', 'ドリブルの魔術師',
        '次世代の司令塔', 'テクニカルな若手', 'バランス型オールラウンダー', '献身的な守備職人'
      ];
      
      return positions.map((pos, index) => ({
        id: `r${index + 1}`,
        name: names[index],
        description: descriptions[index],
        x: pos.x,
        y: pos.y
      }));
    }
    
    // 職業・チーム関連
    if (themeKeywords.includes('チーム') || themeKeywords.includes('職') || themeKeywords.includes('適性')) {
      const names = [
        'リーダー', 'アナリスト', 'クリエイター', 'イノベーター',
        'サポーター', 'メンター', 'エキスパート', 'コーディネーター',
        'ストラテジスト', 'エンジニア', 'デザイナー', 'マーケター',
        'セールス', 'コンサルタント', 'プロジェクトマネージャー', 'リサーチャー'
      ];
      const descriptions = [
        'チームを牽引する', '分析と戦略立案', '新しいアイデア創出', '革新的な発想力',
        'チームを支える', '他者の成長支援', '専門分野のプロ', '全体の調整役',
        '戦略設計の専門家', '技術的問題解決', '視覚的表現力', '市場分析の達人',
        '顧客との関係構築', '課題解決の提案', '計画実行の管理', '情報収集と分析'
      ];
      
      return positions.map((pos, index) => ({
        id: `r${index + 1}`,
        name: names[index],
        description: descriptions[index],
        x: pos.x,
        y: pos.y
      }));
    }
    
    // 性格・キャラクター関連
    if (themeKeywords.includes('性格') || themeKeywords.includes('キャラ')) {
      const names = [
        'リーダー気質', '思慮深い', '社交家', '職人気質',
        '冒険家', '平和主義者', '完璧主義者', '自由人',
        'カリスマ', '研究者', 'エンターテイナー', '守護者',
        'チャレンジャー', '調停者', 'アーティスト', 'サポーター'
      ];
      const descriptions = [
        '天性のリーダーシップ', '深く考える思慮家', '人とのつながり重視', '技術を極める職人',
        '新しい体験を求める', '調和と平和を愛する', '高い基準を持つ', '束縛を嫌う自由',
        '人を引きつける魅力', '知識探求を愛する', '人を楽しませる才能', '他者を守り支える',
        '困難に立ち向かう', '対立を仲裁する', '美を創造する感性', '縁の下の力持ち'
      ];
      
      return positions.map((pos, index) => ({
        id: `r${index + 1}`,
        name: names[index],
        description: descriptions[index],
        x: pos.x,
        y: pos.y
      }));
    }
    
    // デフォルト - 汎用的な16タイプ
    const defaultNames = [
      'イノベーター', 'アナリスト', 'リーダー', 'クリエイター',
      'サポーター', 'エキスパート', 'コミュニケーター', 'ストラテジスト',
      'ビルダー', 'オーガナイザー', 'アドバイザー', 'ファシリテーター',
      'エクスプローラー', 'オプティマイザー', 'モチベーター', 'ガーディアン'
    ];
    const defaultDescriptions = [
      '革新的なアイデア創出', '論理的分析と洞察', 'チーム牽引力', '創造的表現力',
      '他者をサポート', '専門知識の深さ', '円滑なコミュニケーション', '戦略的思考',
      '実現力と構築力', '効率的な組織化', '的確なアドバイス', '合意形成の促進',
      '新たな可能性発見', '継続的な改善', '周囲のやる気向上', '安定と安心の提供'
    ];
    
    return positions.map((pos, index) => ({
      id: `r${index + 1}`,
      name: defaultNames[index],
      description: defaultDescriptions[index],
      x: pos.x,
      y: pos.y
    }));
  };

  // 初期質問を自動生成する関数
  const generateInitialQuestions = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: wizardData.theme,
          resultType: wizardData.resultType,
          axes: wizardData.axes,
          questionCount: wizardData.questionCount,
          results: wizardData.results, // 配置された結果も送信
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "質問の生成に失敗しました。");
      }

      const data = await response.json();
      setWizardData(prev => ({
        ...prev,
        questions: data.questions,
      }));
    } catch (err: any) {
      setError(err.message || "エラーが発生しました。");
      console.error("質問生成エラー:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const renderStep1 = () => (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, textAlign: "center", fontWeight: "bold" }}>
        診断の4つの指標を設定
      </Typography>
      
      {/* テーマ・結果タイプ入力 */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>診断テーマ</Typography>
              <TextField
                fullWidth
                multiline
                rows={2}
                value={wizardData.theme}
                onChange={(e) => setWizardData(prev => ({ ...prev, theme: e.target.value }))}
                placeholder="例：チームメンバーの隠れた強みを見つけるための適性診断"
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>結果として診断したいもの</Typography>
              <TextField
                fullWidth
                value={wizardData.resultType}
                onChange={(e) => setWizardData(prev => ({ ...prev, resultType: e.target.value }))}
                placeholder="例：人、場所、動物、職業など"
                helperText="何の診断結果を表示しますか？"
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 生成ボタン */}
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Button
          variant="contained"
          onClick={generateAxes}
          disabled={loading || !wizardData.theme.trim() || !wizardData.resultType.trim()}
          sx={{
            backgroundColor: "#667eea !important",
            color: "#ffffff !important",
            borderRadius: 3,
            px: 4,
            py: 1.5,
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
            "&:hover": {
              backgroundColor: "#5a67d8 !important",
              boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
              transform: 'translateY(-1px)',
            },
            "&:disabled": {
              backgroundColor: "#cccccc !important",
              color: "#888888 !important",
              boxShadow: 'none',
              transform: 'none',
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : "AIで指標を再生成"}
        </Button>
      </Box>

      {/* 座標式指標入力 */}
      <AxisCoordinateInput
        values={{
          yTop: wizardData.axes.find(a => a.id === 2)?.positiveName || "",
          yBottom: wizardData.axes.find(a => a.id === 2)?.negativeName || "",
          xRight: wizardData.axes.find(a => a.id === 1)?.positiveName || "",
          xLeft: wizardData.axes.find(a => a.id === 1)?.negativeName || "",
        }}
        onChange={(values) => {
          setWizardData(prev => ({
            ...prev,
            axes: [
              { 
                ...prev.axes[0], 
                positiveName: values.xRight, 
                negativeName: values.xLeft 
              },
              { 
                ...prev.axes[1], 
                positiveName: values.yTop, 
                negativeName: values.yBottom 
              },
            ],
          }));
        }}
      />

    </Box>
  );

  const renderStep2 = () => (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, textAlign: "center", fontWeight: "bold" }}>
        診断結果の配置設定
      </Typography>
      
      <Card sx={{ mb: 3, p: 2 }}>
        <Typography variant="body1" sx={{ textAlign: "center", color: "text.secondary" }}>
          座標グラフ上に診断結果を配置してください。結果をドラッグして位置を調整できます。
        </Typography>
      </Card>

      <ResultPlacementGrid
        results={wizardData.results}
        axisData={{
          yTop: wizardData.axes.find(a => a.id === 2)?.positiveName || "Y軸上部",
          yBottom: wizardData.axes.find(a => a.id === 2)?.negativeName || "Y軸下部",
          xRight: wizardData.axes.find(a => a.id === 1)?.positiveName || "X軸右部",
          xLeft: wizardData.axes.find(a => a.id === 1)?.negativeName || "X軸左部",
        }}
        onChange={(results) => {
          setWizardData(prev => ({ ...prev, results }));
        }}
      />
    </Box>
  );

  const renderStep3 = () => (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, textAlign: "center", fontWeight: "bold" }}>
        質問内容編集
      </Typography>
      
      <QuestionEditor
        questions={wizardData.questions}
        axes={wizardData.axes}
        theme={wizardData.theme}
        resultType={wizardData.resultType}
        onChange={(questions) => {
          setWizardData(prev => ({ ...prev, questions }));
        }}
      />
    </Box>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return renderStep1();
      case 1: return renderStep2();
      case 2: return renderStep3();
      default: return renderStep1();
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return wizardData.axes.every(axis => 
          axis.positiveName && axis.negativeName
        );
      case 1:
        return wizardData.results.length >= 2; // 最低2つの結果が必要
      case 2:
        return wizardData.questions.length >= 5; // 最低5問必要（ハート評価システム）
      default:
        return false;
    }
  };

  return (
    <Layout>
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "#f5f5f5",
          paddingTop: { xs: "70px", sm: "80px" },
          paddingBottom: { xs: "120px", sm: "100px" },
        }}
      >
        <Header />
        
        <Box
          sx={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: { xs: 2, md: 3 },
          }}
        >
          {/* 進捗ゲージ */}
          <ProgressGauge currentStep={currentStep} steps={STEPS} />

          {/* エラー表示 */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* 現在のステップコンテンツ */}
          <Box sx={{ mb: 4 }}>
            {renderCurrentStep()}
          </Box>

          {/* ナビゲーションボタン */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mt: 4,
            }}
          >
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={currentStep === 0}
              sx={{
                borderColor: "#667eea",
                color: "#667eea",
                "&:hover": {
                  borderColor: "#5a67d8",
                  backgroundColor: "rgba(102, 126, 234, 0.04)",
                },
              }}
            >
              戻る
            </Button>
            
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!canProceed() || loading}
              sx={{
                backgroundColor: "#667eea !important",
                color: "#ffffff !important",
                "&:hover": {
                  backgroundColor: "#5a67d8 !important",
                },
                "&:disabled": {
                  backgroundColor: "#cccccc !important",
                  color: "#888888 !important",
                },
              }}
            >
              {loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                currentStep === STEPS.length - 1 ? "完了" : "次へ"
              )}
            </Button>
          </Box>
        </Box>
      </Box>
    </Layout>
  );
}

function CreateWizardPage() {
  return (
    <ProtectedRoute>
      <CreateWizard />
    </ProtectedRoute>
  );
}

export default CreateWizardPage;