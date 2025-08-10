// テーマ別の診断結果データ
export type PersonResult = {
  name: string;
  description: string;
  traits: string[];
  image?: string;
};

export type ThemeResults = {
  high: PersonResult[];
  medium: PersonResult[];
  low: PersonResult[];
};

// 各テーマに対応した診断結果
export const diagnosisResultsMap: { [theme: string]: ThemeResults } = {
  // 野球選手テーマ
  野球選手: {
    high: [
      {
        name: "大谷翔平",
        description: "二刀流のスーパースター。完璧主義で努力を怠らない天才型",
        traits: ["努力家", "完璧主義", "天才肌", "国際的"],
      },
      {
        name: "イチロー",
        description: "ストイックで完璧な技術を追求する職人気質の選手",
        traits: ["職人気質", "ストイック", "技術重視", "継続力"],
      },
      {
        name: "松井秀喜",
        description: "温厚な人格者でありながら勝負強い頼れるスラッガー",
        traits: ["人格者", "勝負強い", "リーダーシップ", "安定感"],
      },
    ],
    medium: [
      {
        name: "田中将大",
        description: "チームを支える安定感抜群のエース投手",
        traits: ["安定感", "チームワーク", "責任感", "バランス型"],
      },
      {
        name: "坂本勇人",
        description: "華麗な守備と確実な打撃を兼ね備えたオールラウンダー",
        traits: ["オールラウンド", "華麗", "確実性", "チームプレー"],
      },
    ],
    low: [
      {
        name: "新庄剛志",
        description: "型破りで自由奔放、エンターテイナー精神溢れる個性派",
        traits: ["自由奔放", "エンターテイナー", "個性的", "挑戦的"],
      },
      {
        name: "山田哲人",
        description: "成長意欲旺盛で常に進化し続ける努力型プレイヤー",
        traits: ["成長志向", "進化", "努力型", "柔軟性"],
      },
    ],
  },

  // サッカー選手テーマ
  サッカー選手: {
    high: [
      {
        name: "クリスティアーノ・ロナウド",
        description:
          "完璧主義でストイック、圧倒的な実力を持つ世界的スーパースター",
        traits: ["完璧主義", "ストイック", "リーダーシップ", "勝負強い"],
      },
      {
        name: "リオネル・メッシ",
        description: "天才的な技術と創造性で魅了する芸術的プレイヤー",
        traits: ["天才肌", "創造性", "技術力", "謙虚"],
      },
      {
        name: "ネイマール",
        description: "華麗な技術とエンターテイナー性を兼ね備えた魅力的な選手",
        traits: ["技術力", "エンターテイナー", "創造性", "個性的"],
      },
    ],
    medium: [
      {
        name: "ルカ・モドリッチ",
        description: "中盤を支配する知的で安定したゲームメーカー",
        traits: ["知性", "安定感", "チームワーク", "リーダーシップ"],
      },
      {
        name: "セルヒオ・ラモス",
        description: "守備の要として信頼される頼れるキャプテン",
        traits: ["リーダーシップ", "守備力", "精神力", "経験"],
      },
    ],
    low: [
      {
        name: "キリアン・ムバッペ",
        description: "無限の可能性を秘めた次世代のスーパースター",
        traits: ["成長性", "スピード", "向上心", "将来性"],
      },
      {
        name: "エルリング・ハーランド",
        description: "圧倒的な得点力で未来を切り開く若きストライカー",
        traits: ["得点力", "成長志向", "野心", "フィジカル"],
      },
    ],
  },

  // アニメキャラテーマ
  アニメキャラクター: {
    high: [
      {
        name: "竈門炭治郎",
        description: "優しさと強さを兼ね備えた理想的な主人公タイプ",
        traits: ["優しい", "責任感", "家族思い", "成長型"],
      },
      {
        name: "モンキー・D・ルフィ",
        description: "自由奔放で仲間思い、天真爛漫なリーダータイプ",
        traits: ["自由", "仲間思い", "天真爛漫", "カリスマ"],
      },
      {
        name: "うずまきナルト",
        description: "諦めない心と仲間への愛に溢れた努力家タイプ",
        traits: ["努力家", "諦めない", "仲間愛", "明るい"],
      },
    ],
    medium: [
      {
        name: "緑谷出久",
        description: "分析力と正義感を持つバランスの取れたヒーロータイプ",
        traits: ["分析力", "正義感", "バランス", "成長志向"],
      },
      {
        name: "冨岡義勇",
        description: "冷静沈着で責任感が強い職人気質タイプ",
        traits: ["冷静", "責任感", "職人気質", "寡黙"],
      },
    ],
    low: [
      {
        name: "我妻善逸",
        description: "普段は弱気だが本当の危機では力を発揮する成長型",
        traits: ["成長型", "潜在能力", "仲間思い", "個性的"],
      },
      {
        name: "嘴平伊之助",
        description: "野生的で自由奔放、独自の価値観を持つ個性派",
        traits: ["野生的", "自由", "個性的", "直感型"],
      },
    ],
  },

  // 映画監督テーマ
  映画監督: {
    high: [
      {
        name: "宮崎駿",
        description: "完璧主義で細部へのこだわりが強い天才クリエイター",
        traits: ["完璧主義", "創造性", "こだわり", "芸術性"],
      },
      {
        name: "黒澤明",
        description: "壮大なスケールと人間ドラマを描く巨匠タイプ",
        traits: ["巨匠", "壮大", "人間性", "影響力"],
      },
      {
        name: "新海誠",
        description: "繊細な感情表現と美しい映像で心を動かすアーティスト",
        traits: ["繊細", "感情表現", "美意識", "現代的"],
      },
    ],
    medium: [
      {
        name: "是枝裕和",
        description: "日常の中の深い人間性を丁寧に描く職人監督",
        traits: ["職人的", "人間性", "日常", "丁寧"],
      },
      {
        name: "庵野秀明",
        description: "独創的な世界観とキャラクター描写が得意な個性派",
        traits: ["独創的", "個性的", "キャラクター", "世界観"],
      },
    ],
    low: [
      {
        name: "細田守",
        description: "成長と変化を温かく描く次世代のストーリーテラー",
        traits: ["成長志向", "温かさ", "ストーリー", "次世代"],
      },
      {
        name: "山田尚子",
        description: "繊細な演出と音楽性で新しい表現を追求する革新者",
        traits: ["繊細", "音楽性", "革新", "表現力"],
      },
    ],
  },

  // 歴史上の人物テーマ
  歴史上の人物: {
    high: [
      {
        name: "織田信長",
        description: "革新的で大胆、常識を覆す天才的リーダー",
        traits: ["革新的", "大胆", "リーダーシップ", "天才"],
      },
      {
        name: "坂本龍馬",
        description: "自由な発想と行動力で時代を変えた志士",
        traits: ["自由", "行動力", "時代の先駆者", "志"],
      },
      {
        name: "徳川家康",
        description: "忍耐強く戦略的思考に長けた天下統一の覇者",
        traits: ["忍耐", "戦略性", "統率力", "安定"],
      },
    ],
    medium: [
      {
        name: "上杉謙信",
        description: "義を重んじ武勇に優れたバランス型の名将",
        traits: ["義理堅い", "武勇", "バランス", "名将"],
      },
      {
        name: "武田信玄",
        description: "戦略と人心掌握に長けた知略型リーダー",
        traits: ["戦略家", "人心掌握", "知略", "カリスマ"],
      },
    ],
    low: [
      {
        name: "真田幸村",
        description: "不屈の精神と成長への意欲を持つ挑戦者",
        traits: ["不屈", "挑戦", "成長", "勇敢"],
      },
      {
        name: "石田三成",
        description: "理想と正義を追求する純粋で成長志向な人物",
        traits: ["理想主義", "正義感", "純粋", "成長志向"],
      },
    ],
  },

  // 野球ポジションテーマ
  野球ポジション: {
    high: [
      {
        name: "エース投手",
        description:
          "チームの柱となる絶対的なエース。責任感が強く、プレッシャーに負けない精神力を持つ",
        traits: ["責任感", "精神力", "集中力", "リーダーシップ"],
      },
      {
        name: "正捕手",
        description: "チーム全体を見渡し、ゲームをコントロールする司令塔的存在",
        traits: ["統率力", "観察力", "戦略性", "コミュニケーション"],
      },
      {
        name: "4番バッター",
        description: "チームの得点源として期待される勝負強いクリーンナップ",
        traits: ["勝負強さ", "集中力", "決断力", "プレッシャー耐性"],
      },
    ],
    medium: [
      {
        name: "ショート",
        description:
          "内野の要として華麗な守備と安定した打撃を両立するオールラウンダー",
        traits: ["バランス", "安定感", "技術力", "チームワーク"],
      },
      {
        name: "セカンド",
        description: "堅実な守備と機動力でチームを支える縁の下の力持ち",
        traits: ["堅実性", "機動力", "サポート力", "協調性"],
      },
      {
        name: "センター",
        description: "外野の中心として広い範囲をカバーする俊足の守備職人",
        traits: ["俊敏性", "カバー力", "判断力", "持久力"],
      },
    ],
    low: [
      {
        name: "代打の切り札",
        description: "ここぞという場面で力を発揮する勝負師タイプ",
        traits: ["勝負勘", "集中力", "瞬発力", "チャンス力"],
      },
      {
        name: "ユーティリティプレイヤー",
        description: "どこでも守れる器用さと適応力を持つマルチプレイヤー",
        traits: ["器用さ", "適応力", "学習力", "チーム貢献"],
      },
    ],
  },

  // 会社ポジションテーマ
  会社ポジション: {
    high: [
      {
        name: "CEO（最高経営責任者）",
        description: "組織全体を統率し、ビジョンを示すトップリーダー",
        traits: ["リーダーシップ", "ビジョン", "決断力", "責任感"],
      },
      {
        name: "CTO（最高技術責任者）",
        description:
          "技術戦略を立案し、イノベーションを推進する技術のエキスパート",
        traits: ["技術力", "革新性", "戦略思考", "問題解決力"],
      },
      {
        name: "事業部長",
        description:
          "特定事業の責任者として成果を出し続ける実行力のあるリーダー",
        traits: ["実行力", "成果志向", "マネジメント", "責任感"],
      },
    ],
    medium: [
      {
        name: "プロジェクトマネージャー",
        description: "複数のタスクを調整し、プロジェクトを成功に導く調整役",
        traits: ["調整力", "計画性", "コミュニケーション", "バランス"],
      },
      {
        name: "チームリーダー",
        description:
          "小規模チームをまとめ、メンバーの力を最大化する現場リーダー",
        traits: ["チームワーク", "サポート力", "指導力", "協調性"],
      },
    ],
    low: [
      {
        name: "スペシャリスト",
        description: "特定分野の専門性を活かして価値を生み出すエキスパート",
        traits: ["専門性", "探究心", "集中力", "技術追求"],
      },
      {
        name: "新規事業開発",
        description: "新しいことに挑戦し、未来を切り開くイノベーター",
        traits: ["挑戦心", "創造性", "柔軟性", "先見性"],
      },
    ],
  },

  // サッカーポジションテーマ
  サッカーポジション: {
    high: [
      {
        name: "ストライカー",
        description:
          "ゴールを量産する絶対的な得点源。決定力と勝負強さを兼ね備えた攻撃の要",
        traits: ["決定力", "勝負強さ", "瞬発力", "ゴール嗅覚"],
      },
      {
        name: "ゲームメーカー",
        description:
          "チーム全体の攻撃を組み立てる司令塔。創造性と視野の広さで試合を支配",
        traits: ["創造性", "視野", "パス精度", "ゲーム理解"],
      },
      {
        name: "キャプテン",
        description:
          "チームを統率し、勝利に導くリーダー。責任感と統率力でチームを牽引",
        traits: ["リーダーシップ", "責任感", "統率力", "精神力"],
      },
    ],
    medium: [
      {
        name: "センターバック",
        description: "守備の中心として安定感を提供する頼れる守護神",
        traits: ["安定感", "守備力", "空中戦", "判断力"],
      },
      {
        name: "ボランチ",
        description:
          "攻守のバランスを取り、チームの心臓部として機能するオールラウンダー",
        traits: ["バランス", "運動量", "戦術理解", "サポート力"],
      },
    ],
    low: [
      {
        name: "スーパーサブ",
        description: "途中出場で試合の流れを変える切り札的存在",
        traits: ["インパクト", "集中力", "適応力", "勝負勘"],
      },
      {
        name: "若手有望株",
        description: "無限の可能性を秘めた成長株。将来性と向上心が武器",
        traits: ["成長性", "向上心", "柔軟性", "吸収力"],
      },
    ],
  },

  // RPG職業テーマ
  RPG職業: {
    high: [
      {
        name: "勇者",
        description: "バランスの取れた能力で仲間を率いる正統派主人公",
        traits: ["リーダーシップ", "バランス", "正義感", "成長力"],
      },
      {
        name: "大魔法使い",
        description: "圧倒的な魔力で敵を殲滅する知的なスペシャリスト",
        traits: ["知力", "魔法力", "戦略性", "集中力"],
      },
      {
        name: "聖騎士",
        description: "強固な防御力と仲間を守る意志を持つ守護者",
        traits: ["守護力", "正義感", "忍耐力", "信頼性"],
      },
    ],
    medium: [
      {
        name: "騎士",
        description: "攻守バランスの取れた頼れる前衛職",
        traits: ["バランス", "安定感", "忠誠心", "規律"],
      },
      {
        name: "レンジャー",
        description: "機動力と遠距離攻撃で戦場を駆け回る自由な戦士",
        traits: ["機動力", "射撃精度", "自由", "野生の勘"],
      },
    ],
    low: [
      {
        name: "盗賊",
        description: "トリッキーな戦法と隠密行動で活躍する技巧派",
        traits: ["器用さ", "隠密", "技巧", "機転"],
      },
      {
        name: "吟遊詩人",
        description: "仲間をサポートし、場を和ませる芸術肌の支援者",
        traits: ["サポート力", "芸術性", "コミュニケーション", "創造性"],
      },
    ],
  },

  // デフォルトの汎用的な診断結果
  default: {
    high: [
      {
        name: "リーダータイプ",
        description: "強いリーダーシップと決断力を持つ人物",
        traits: ["リーダーシップ", "決断力", "責任感", "影響力"],
      },
      {
        name: "完璧主義者タイプ",
        description: "高い基準を持ち、質の高い成果を追求する人物",
        traits: ["完璧主義", "高品質", "こだわり", "専門性"],
      },
    ],
    medium: [
      {
        name: "バランサータイプ",
        description: "様々な要素をバランスよく調整できる安定した人物",
        traits: ["バランス", "安定", "調整力", "協調性"],
      },
      {
        name: "サポータータイプ",
        description: "周囲を支え、チームワークを重視する協力的な人物",
        traits: ["サポート", "チームワーク", "協力", "信頼"],
      },
    ],
    low: [
      {
        name: "チャレンジャータイプ",
        description: "新しいことに挑戦し、成長を続ける冒険的な人物",
        traits: ["挑戦", "成長", "冒険", "柔軟性"],
      },
      {
        name: "クリエータータイプ",
        description: "独創性と創造力に富んだアーティスティックな人物",
        traits: ["創造性", "独創性", "芸術性", "表現力"],
      },
    ],
  },
};

// 診断結果の詳細項目の型定義
export type DetailItem = {
  name: string;
  description: string;
};

// テーマ別の詳細項目データ
export const themeDetailItems: { [theme: string]: DetailItem[] } = {
  // 野球選手テーマ
  野球選手: [
    { name: "打撃力", description: "バットでボールを打つ技術と力強さ" },
    { name: "守備力", description: "エラーをしない安定した守備技術" },
    { name: "走塁センス", description: "ベースランニングの判断力と俊敏性" },
    { name: "投球術", description: "コントロールと球種の豊富さ" },
    { name: "勝負強さ", description: "プレッシャーに負けない精神力" },
    { name: "チームワーク", description: "仲間との連携プレー能力" },
    { name: "野球IQ", description: "試合状況を読む判断力" },
    { name: "持久力", description: "長いシーズンを戦い抜く体力" },
  ],

  // サッカー選手テーマ
  サッカー選手: [
    { name: "テクニック", description: "ボールを扱う技術力と正確性" },
    { name: "スピード", description: "加速力と最高速度" },
    { name: "シュート力", description: "正確で威力のあるシュート能力" },
    { name: "パス精度", description: "味方に正確にボールを届ける能力" },
    { name: "ドリブル", description: "相手を抜き去るボールコントロール" },
    { name: "守備力", description: "相手の攻撃を阻止する防御能力" },
    { name: "フィジカル", description: "当たり負けしない体の強さ" },
    { name: "戦術理解", description: "チーム戦術への理解度" },
  ],

  // 野球ポジション テーマ
  野球ポジション: [
    { name: "リーダーシップ", description: "チームを牽引する統率力" },
    { name: "判断力", description: "瞬時の状況判断能力" },
    { name: "技術力", description: "そのポジションに必要な専門技術" },
    { name: "体力・持久力", description: "試合を通じて活躍する体力" },
    { name: "集中力", description: "重要な場面での集中力" },
    { name: "コミュニケーション", description: "チームメイトとの連携能力" },
    { name: "プレッシャー耐性", description: "重要な場面での精神力" },
    { name: "戦略理解", description: "試合全体の流れを読む力" },
  ],

  // アニメキャラクターテーマ
  アニメキャラクター: [
    { name: "正義感", description: "正しいことを貫く強い意志" },
    { name: "仲間思い", description: "大切な人を守る気持ち" },
    { name: "成長力", description: "困難を乗り越えて成長する力" },
    { name: "特殊能力", description: "独自の力や才能" },
    { name: "優しさ", description: "他者への思いやりと慈悲深さ" },
    { name: "勇気", description: "恐れに立ち向かう勇敢さ" },
    { name: "努力", description: "目標に向かって努力する姿勢" },
    { name: "カリスマ", description: "人を惹きつける魅力" },
  ],

  // 映画監督テーマ
  映画監督: [
    { name: "創造性", description: "新しいアイデアを生み出す力" },
    { name: "映像美", description: "美しい映像を作り出すセンス" },
    { name: "ストーリーテリング", description: "物語を魅力的に伝える技術" },
    { name: "キャラクター描写", description: "人物を深く描く能力" },
    { name: "演出力", description: "役者から最高の演技を引き出す力" },
    { name: "技術革新", description: "新しい映像技術への挑戦" },
    { name: "感情表現", description: "観客の心を動かす表現力" },
    { name: "世界観構築", description: "独特な世界を作り上げる力" },
  ],

  // 歴史上の人物テーマ
  歴史上の人物: [
    { name: "戦略性", description: "長期的な戦略を立てる能力" },
    { name: "カリスマ性", description: "人を惹きつけ従わせる魅力" },
    { name: "革新性", description: "新しい時代を切り開く発想力" },
    { name: "決断力", description: "重要な局面での決断力" },
    { name: "統率力", description: "多くの人を束ねる力" },
    { name: "政治力", description: "複雑な人間関係を操る能力" },
    { name: "軍事力", description: "戦場での指揮能力" },
    { name: "文化貢献", description: "後世に残る文化的功績" },
  ],

  // サッカーポジション テーマ
  サッカーポジション: [
    { name: "テクニック", description: "ボールを扱う技術力" },
    { name: "フィジカル", description: "体の強さと持久力" },
    { name: "戦術理解", description: "チーム戦術への理解度" },
    { name: "判断力", description: "瞬時の状況判断能力" },
    { name: "リーダーシップ", description: "チームを牽引する力" },
    { name: "創造性", description: "予想外のプレーを生み出す力" },
    { name: "メンタル", description: "プレッシャーに負けない精神力" },
    { name: "チームワーク", description: "仲間との連携プレー能力" },
  ],

  // 会社ポジション テーマ
  会社ポジション: [
    { name: "経営戦略", description: "会社全体の方向性を決める力" },
    { name: "マネジメント", description: "チームや部下を効果的に管理する力" },
    { name: "専門性", description: "特定分野での深い知識と経験" },
    { name: "コミュニケーション", description: "社内外との効果的な意思疎通" },
    { name: "問題解決", description: "複雑な課題を解決する能力" },
    { name: "革新性", description: "新しいアイデアや手法を生み出す力" },
    { name: "責任感", description: "与えられた役割を確実に果たす力" },
    { name: "成果創出", description: "具体的な結果を出す実行力" },
  ],

  // RPG職業テーマ
  RPG職業: [
    { name: "戦闘力", description: "敵との戦いにおける実力" },
    { name: "魔法力", description: "神秘的な力を操る能力" },
    { name: "守備力", description: "攻撃から身を守る防御能力" },
    { name: "サポート力", description: "仲間を支援する能力" },
    { name: "スキル多様性", description: "様々な特技を習得する才能" },
    { name: "成長性", description: "経験を積んで強くなる力" },
    { name: "冒険心", description: "未知の場所に向かう勇気" },
    { name: "仲間との絆", description: "パーティメンバーとの結束力" },
  ],
};

// デフォルトの詳細項目
export const defaultDetailItems: DetailItem[] = [
  { name: "感情スコア", description: "感情的な判断を重視する度合い" },
  { name: "論理スコア", description: "論理的な思考を重視する度合い" },
  { name: "行動スコア", description: "積極的に行動する度合い" },
  { name: "受動スコア", description: "慎重に判断する度合い" },
];

// テーマキーワードから最適なテーマを判定する関数
export function getThemeKey(title: string): string {
  const titleLower = title.toLowerCase();

  // ポジション関連のキーワードを優先的にチェック
  if (
    titleLower.includes("ポジション") ||
    titleLower.includes("役職") ||
    titleLower.includes("守備位置") ||
    titleLower.includes("打順") ||
    titleLower.includes("職業") ||
    titleLower.includes("ジョブ") ||
    titleLower.includes("クラス")
  ) {
    // 野球関連
    if (
      titleLower.includes("野球") ||
      titleLower.includes("ベースボール") ||
      titleLower.includes("球団") ||
      titleLower.includes("ピッチャー") ||
      titleLower.includes("バッター")
    ) {
      return "野球ポジション";
    }
    // サッカー関連
    else if (
      titleLower.includes("サッカー") ||
      titleLower.includes("フットボール") ||
      titleLower.includes("ゴール") ||
      titleLower.includes("キーパー") ||
      titleLower.includes("フォワード")
    ) {
      return "サッカーポジション";
    }
    // RPG関連
    else if (
      titleLower.includes("rpg") ||
      titleLower.includes("ゲーム") ||
      titleLower.includes("勇者") ||
      titleLower.includes("魔法") ||
      titleLower.includes("ファンタジー") ||
      titleLower.includes("冒険")
    ) {
      return "RPG職業";
    }
    // ビジネス関連
    else if (
      titleLower.includes("会社") ||
      titleLower.includes("企業") ||
      titleLower.includes("ビジネス") ||
      titleLower.includes("組織") ||
      titleLower.includes("職場") ||
      titleLower.includes("管理職")
    ) {
      return "会社ポジション";
    }
    // デフォルトは野球ポジション
    else {
      return "野球ポジション";
    }
  }

  // 具体的なテーマ判定（重複を避けるため順序を整理）
  // 野球関連
  if (
    titleLower.includes("野球") ||
    titleLower.includes("ベースボール") ||
    titleLower.includes("球団")
  ) {
    return "野球選手";
  }

  // サッカー関連
  if (
    titleLower.includes("サッカー") ||
    titleLower.includes("フットボール") ||
    titleLower.includes("ゴール") ||
    titleLower.includes("シュート")
  ) {
    return "サッカー選手";
  }

  // 汎用的な選手・スポーツ（具体的なスポーツが指定されていない場合）
  if (titleLower.includes("選手") || titleLower.includes("スポーツ")) {
    return "サッカー選手";
  }

  // エンターテイメント関連
  if (
    titleLower.includes("アニメ") ||
    titleLower.includes("キャラ") ||
    titleLower.includes("マンガ") ||
    titleLower.includes("漫画")
  ) {
    return "アニメキャラクター";
  }

  // 映画関連
  if (
    titleLower.includes("映画") ||
    titleLower.includes("監督") ||
    titleLower.includes("映像") ||
    titleLower.includes("シネマ")
  ) {
    return "映画監督";
  }

  // 歴史関連
  if (
    titleLower.includes("歴史") ||
    titleLower.includes("戦国") ||
    titleLower.includes("武将") ||
    titleLower.includes("偉人")
  ) {
    return "歴史上の人物";
  }

  // RPG関連（ポジションチェック後に再度チェック）
  if (
    titleLower.includes("rpg") ||
    titleLower.includes("ロールプレイング") ||
    titleLower.includes("ファンタジー") ||
    titleLower.includes("冒険")
  ) {
    return "RPG職業";
  }

  return "default";
}

// スコアに基づいて適切な人物を選択する関数
export function selectPersonResult(
  themeResults: ThemeResults,
  averageScore: number,
  answers: { [id: number]: number | undefined }
): PersonResult {
  let targetArray: PersonResult[];

  if (averageScore >= 4) {
    targetArray = themeResults.high;
  } else if (averageScore >= 3) {
    targetArray = themeResults.medium;
  } else {
    targetArray = themeResults.low;
  }

  // 回答の傾向から最適な人物を選択（簡単な例）
  const validAnswers = Object.values(answers).filter(
    (a) => typeof a === "number"
  ) as number[];
  const maxAnswer = Math.max(...validAnswers);
  const minAnswer = Math.min(...validAnswers);
  const range = maxAnswer - minAnswer;

  let index: number;
  if (range <= 1) {
    // 回答が安定している場合は最初の人物
    index = 0;
  } else if (range >= 3) {
    // 回答にばらつきがある場合は最後の人物
    index = targetArray.length - 1;
  } else {
    // 中間の場合は中央の人物
    index = Math.floor(targetArray.length / 2);
  }

  return targetArray[index] || targetArray[0];
}

// AIを使用して動的に詳細項目を生成する関数
export function generateDetailItemsFromTheme(themeTitle: string): DetailItem[] {
  // テーマのキーワードを解析して関連する詳細項目を生成
  const titleLower = themeTitle.toLowerCase();

  // スポーツ関連
  if (
    titleLower.includes("スポーツ") ||
    titleLower.includes("競技") ||
    titleLower.includes("試合")
  ) {
    return [
      { name: "技術力", description: "その競技に必要な技術レベル" },
      { name: "体力", description: "持久力と身体的強さ" },
      { name: "精神力", description: "プレッシャーに負けない心の強さ" },
      { name: "戦術理解", description: "ゲームプランへの理解度" },
      { name: "チームワーク", description: "チームメイトとの連携能力" },
      { name: "判断力", description: "瞬時の状況判断能力" },
      { name: "リーダーシップ", description: "チームを牽引する力" },
      { name: "成長性", description: "継続的な向上への意欲" },
    ];
  }

  // 職業・キャリア関連
  if (
    titleLower.includes("職業") ||
    titleLower.includes("キャリア") ||
    titleLower.includes("仕事") ||
    titleLower.includes("転職")
  ) {
    return [
      { name: "専門性", description: "特定分野での深い知識と経験" },
      { name: "コミュニケーション", description: "効果的な意思疎通能力" },
      { name: "問題解決", description: "複雑な課題を解決する能力" },
      { name: "創造性", description: "新しいアイデアを生み出す力" },
      { name: "適応性", description: "変化に対応する柔軟性" },
      { name: "リーダーシップ", description: "チームを率いる統率力" },
      { name: "責任感", description: "与えられた役割を確実に果たす力" },
      { name: "学習意欲", description: "新しいスキルを習得する意欲" },
    ];
  }

  // エンターテイメント関連
  if (
    titleLower.includes("芸能") ||
    titleLower.includes("音楽") ||
    titleLower.includes("芸術") ||
    titleLower.includes("パフォーマンス")
  ) {
    return [
      { name: "表現力", description: "感情や思いを表現する能力" },
      { name: "創造性", description: "独創的なアイデアを生み出す力" },
      { name: "技術力", description: "その分野に必要な技術レベル" },
      { name: "感受性", description: "様々な感情を感じ取る能力" },
      { name: "カリスマ性", description: "人を惹きつける魅力" },
      { name: "継続力", description: "長期間にわたって努力する力" },
      { name: "協調性", description: "他者と協力する能力" },
      { name: "独創性", description: "他にない独自の発想力" },
    ];
  }

  // 学習・教育関連
  if (
    titleLower.includes("学習") ||
    titleLower.includes("教育") ||
    titleLower.includes("勉強") ||
    titleLower.includes("学問")
  ) {
    return [
      { name: "理解力", description: "複雑な概念を理解する能力" },
      { name: "記憶力", description: "情報を効率的に記憶する力" },
      { name: "集中力", description: "長時間集中して取り組む力" },
      { name: "探究心", description: "新しい知識への好奇心" },
      { name: "論理的思考", description: "筋道立てて考える能力" },
      { name: "創造的思考", description: "新しい視点で物事を考える力" },
      { name: "継続性", description: "長期間にわたって学習を続ける力" },
      { name: "応用力", description: "学んだ知識を実際に活用する力" },
    ];
  }

  // 旅行・冒険関連
  if (
    titleLower.includes("旅行") ||
    titleLower.includes("冒険") ||
    titleLower.includes("探検") ||
    titleLower.includes("旅")
  ) {
    return [
      { name: "冒険心", description: "未知の場所に向かう勇気" },
      { name: "適応力", description: "新しい環境に馴染む能力" },
      { name: "計画性", description: "旅行プランを立てる能力" },
      { name: "コミュニケーション", description: "現地の人々との交流能力" },
      { name: "好奇心", description: "新しい文化や体験への関心" },
      { name: "忍耐力", description: "困難な状況に耐える力" },
      { name: "観察力", description: "周囲の状況を把握する能力" },
      { name: "柔軟性", description: "予想外の状況に対応する力" },
    ];
  }

  // 料理・食事関連
  if (
    titleLower.includes("料理") ||
    titleLower.includes("食事") ||
    titleLower.includes("グルメ") ||
    titleLower.includes("食べ物")
  ) {
    return [
      { name: "味覚", description: "繊細な味の違いを感じ取る能力" },
      { name: "創造性", description: "新しい料理を考案する発想力" },
      { name: "技術力", description: "調理技術の習熟度" },
      { name: "計画性", description: "効率的な調理プロセスを組み立てる力" },
      { name: "探究心", description: "新しい食材や技法への興味" },
      { name: "集中力", description: "料理に集中して取り組む力" },
      { name: "おもてなし", description: "相手を喜ばせる心配り" },
      { name: "継続性", description: "毎日の料理を続ける力" },
    ];
  }

  // 動物関連
  if (
    titleLower.includes("動物") ||
    titleLower.includes("ペット") ||
    titleLower.includes("生き物")
  ) {
    return [
      { name: "愛情", description: "動物への深い愛情" },
      { name: "観察力", description: "動物の行動や状態を読み取る力" },
      { name: "責任感", description: "生き物を最後まで世話する責任感" },
      { name: "忍耐力", description: "しつけや世話を根気強く続ける力" },
      { name: "共感力", description: "動物の気持ちを理解する能力" },
      { name: "学習意欲", description: "動物について学ぶ意欲" },
      { name: "コミュニケーション", description: "動物との意思疎通能力" },
      { name: "優しさ", description: "弱い存在を守る優しい心" },
    ];
  }

  // 技術・IT関連
  if (
    titleLower.includes("技術") ||
    titleLower.includes("it") ||
    titleLower.includes("プログラミング") ||
    titleLower.includes("システム")
  ) {
    return [
      { name: "論理的思考", description: "筋道立てて問題を解決する能力" },
      { name: "創造性", description: "新しいソリューションを生み出す力" },
      { name: "集中力", description: "長時間コードに向き合う集中力" },
      { name: "学習意欲", description: "新しい技術を習得する意欲" },
      { name: "問題解決", description: "複雑な技術的課題を解決する能力" },
      { name: "協調性", description: "チーム開発での協力能力" },
      { name: "継続性", description: "長期プロジェクトを完遂する力" },
      { name: "適応性", description: "技術の変化に対応する柔軟性" },
    ];
  }

  // 汎用的な項目（どのテーマにも当てはまらない場合）
  return [
    { name: "創造性", description: "新しいアイデアを生み出す力" },
    { name: "コミュニケーション", description: "効果的な意思疎通能力" },
    { name: "問題解決", description: "様々な課題を解決する能力" },
    { name: "適応性", description: "変化に対応する柔軟性" },
    { name: "リーダーシップ", description: "チームを率いる統率力" },
    { name: "継続性", description: "長期間にわたって努力する力" },
    { name: "学習意欲", description: "新しいことを学ぶ意欲" },
    { name: "協調性", description: "他者と協力する能力" },
    { name: "責任感", description: "与えられた役割を確実に果たす力" },
    { name: "集中力", description: "一つのことに集中する能力" },
  ];
}

// テーマに応じた詳細項目を取得する関数（改良版）
export function getDetailItems(
  themeKey: string,
  themeTitle?: string
): DetailItem[] {
  // 事前定義されたテーマがある場合はそれを使用
  if (themeDetailItems[themeKey]) {
    return themeDetailItems[themeKey];
  }

  // 事前定義されていない場合は、テーマタイトルから動的に生成
  if (themeTitle) {
    return generateDetailItemsFromTheme(themeTitle);
  }

  // どちらもない場合はデフォルトを返す
  return defaultDetailItems;
}

// 回答データから詳細スコアを計算する関数
export function calculateDetailScores(
  answers: { [id: number]: number | undefined },
  detailItems: DetailItem[]
): { name: string; description: string; score: number }[] {
  const validAnswers = Object.values(answers).filter(
    (answer) => typeof answer === "number" && answer > 0
  ) as number[];

  if (validAnswers.length === 0) {
    return detailItems.map((item) => ({
      ...item,
      score: 50, // デフォルトスコア
    }));
  }

  const averageScore =
    validAnswers.reduce((sum, score) => sum + score, 0) / validAnswers.length;
  const baseScore = averageScore * 20; // 5段階を100点満点に変換

  return detailItems.map((item, index) => {
    // 各項目に少し変化を付けるため、回答の傾向を反映
    const variation =
      (validAnswers[index % validAnswers.length] - averageScore) * 5;
    const finalScore = Math.max(0, Math.min(100, baseScore + variation));

    return {
      ...item,
      score: Math.round(finalScore),
    };
  });
}

// テーマから動的に人物結果を生成する関数
export function generatePersonResultsFromTheme(
  themeTitle: string
): ThemeResults {
  const titleLower = themeTitle.toLowerCase();

  // スポーツ関連
  if (
    titleLower.includes("スポーツ") ||
    titleLower.includes("競技") ||
    titleLower.includes("試合")
  ) {
    return {
      high: [
        {
          name: "プロアスリートタイプ",
          description: "その競技で頂点を目指す本格派",
          traits: ["技術力", "精神力", "継続力", "プロ意識"],
        },
        {
          name: "チームキャプテンタイプ",
          description: "チームを牽引するリーダー",
          traits: ["リーダーシップ", "責任感", "統率力", "模範性"],
        },
        {
          name: "技術職人タイプ",
          description: "技術を極めることに情熱を燃やす",
          traits: ["技術追求", "完璧主義", "継続力", "専門性"],
        },
      ],
      medium: [
        {
          name: "オールラウンダータイプ",
          description: "バランスの取れた万能選手",
          traits: ["バランス", "安定感", "協調性", "柔軟性"],
        },
        {
          name: "サポーター役タイプ",
          description: "チームを支える縁の下の力持ち",
          traits: ["サポート力", "協調性", "気配り", "安定感"],
        },
      ],
      low: [
        {
          name: "楽しさ重視タイプ",
          description: "勝敗よりも楽しさを大切にする",
          traits: ["楽しさ", "自由", "創造性", "柔軟性"],
        },
        {
          name: "成長追求タイプ",
          description: "上達することに喜びを感じる",
          traits: ["成長志向", "学習意欲", "向上心", "挑戦心"],
        },
      ],
    };
  }

  // 職業・キャリア関連
  if (
    titleLower.includes("職業") ||
    titleLower.includes("キャリア") ||
    titleLower.includes("仕事") ||
    titleLower.includes("転職")
  ) {
    return {
      high: [
        {
          name: "エグゼクティブタイプ",
          description: "組織の頂点で活躍する経営者",
          traits: ["リーダーシップ", "戦略思考", "決断力", "影響力"],
        },
        {
          name: "スペシャリストタイプ",
          description: "特定分野の専門家として活躍",
          traits: ["専門性", "技術力", "探究心", "集中力"],
        },
        {
          name: "イノベータータイプ",
          description: "新しいことを生み出す革新者",
          traits: ["創造性", "革新性", "挑戦心", "先見性"],
        },
      ],
      medium: [
        {
          name: "チームプレイヤータイプ",
          description: "チームで成果を出すことが得意",
          traits: ["協調性", "コミュニケーション", "サポート力", "信頼性"],
        },
        {
          name: "バランサータイプ",
          description: "様々な業務をバランスよくこなす",
          traits: ["バランス", "安定感", "調整力", "適応性"],
        },
      ],
      low: [
        {
          name: "フリーランサータイプ",
          description: "自由な働き方を求める独立派",
          traits: ["自由", "独立性", "柔軟性", "創造性"],
        },
        {
          name: "学習者タイプ",
          description: "常に新しいことを学び続ける",
          traits: ["学習意欲", "成長志向", "好奇心", "挑戦心"],
        },
      ],
    };
  }

  // エンターテイメント関連
  if (
    titleLower.includes("芸能") ||
    titleLower.includes("音楽") ||
    titleLower.includes("芸術") ||
    titleLower.includes("パフォーマンス")
  ) {
    return {
      high: [
        {
          name: "スタータイプ",
          description: "多くの人を魅了するトップパフォーマー",
          traits: ["カリスマ性", "表現力", "影響力", "完璧主義"],
        },
        {
          name: "アーティストタイプ",
          description: "芸術性を追求するクリエイター",
          traits: ["創造性", "芸術性", "感受性", "独創性"],
        },
        {
          name: "プロデューサータイプ",
          description: "作品全体を統括する総合プロデューサー",
          traits: ["統率力", "企画力", "マネジメント", "ビジョン"],
        },
      ],
      medium: [
        {
          name: "職人タイプ",
          description: "技術を磨き続ける専門家",
          traits: ["技術力", "継続力", "職人気質", "向上心"],
        },
        {
          name: "アンサンブルタイプ",
          description: "チームで作品を作り上げる協調派",
          traits: ["協調性", "チームワーク", "サポート力", "柔軟性"],
        },
      ],
      low: [
        {
          name: "自由表現タイプ",
          description: "型にはまらない自由な表現者",
          traits: ["自由", "独創性", "実験性", "挑戦心"],
        },
        {
          name: "趣味重視タイプ",
          description: "楽しさを最優先に活動する",
          traits: ["楽しさ", "自由", "創造性", "リラックス"],
        },
      ],
    };
  }

  // 学習・教育関連
  if (
    titleLower.includes("学習") ||
    titleLower.includes("教育") ||
    titleLower.includes("勉強") ||
    titleLower.includes("学問")
  ) {
    return {
      high: [
        {
          name: "研究者タイプ",
          description: "深い知識を追求する学者",
          traits: ["探究心", "理解力", "集中力", "論理的思考"],
        },
        {
          name: "指導者タイプ",
          description: "他者の学習をサポートする教育者",
          traits: ["指導力", "コミュニケーション", "忍耐力", "責任感"],
        },
        {
          name: "知識コレクタータイプ",
          description: "幅広い知識を収集する博学者",
          traits: ["記憶力", "好奇心", "学習意欲", "情報処理"],
        },
      ],
      medium: [
        {
          name: "実践者タイプ",
          description: "学んだことを実際に活用する",
          traits: ["応用力", "実践力", "バランス", "柔軟性"],
        },
        {
          name: "協力学習者タイプ",
          description: "仲間と一緒に学ぶことが得意",
          traits: [
            "協調性",
            "コミュニケーション",
            "サポート力",
            "チームワーク",
          ],
        },
      ],
      low: [
        {
          name: "独学者タイプ",
          description: "自分のペースで学習を進める",
          traits: ["独立性", "自律性", "集中力", "継続性"],
        },
        {
          name: "体験重視タイプ",
          description: "実際に体験することで学ぶ",
          traits: ["体験重視", "実践力", "好奇心", "柔軟性"],
        },
      ],
    };
  }

  // 汎用的な結果（どのテーマにも当てはまらない場合）
  return {
    high: [
      {
        name: "リーダータイプ",
        description: "そのテーマで他者を牽引する存在",
        traits: ["リーダーシップ", "責任感", "決断力", "影響力"],
      },
      {
        name: "エキスパートタイプ",
        description: "そのテーマの専門家として活躍",
        traits: ["専門性", "技術力", "探究心", "完璧主義"],
      },
      {
        name: "イノベータータイプ",
        description: "そのテーマで新しいことを生み出す",
        traits: ["創造性", "革新性", "挑戦心", "独創性"],
      },
    ],
    medium: [
      {
        name: "バランサータイプ",
        description: "そのテーマで安定した成果を出す",
        traits: ["バランス", "安定感", "協調性", "信頼性"],
      },
      {
        name: "サポータータイプ",
        description: "そのテーマで他者を支援する",
        traits: ["サポート力", "協調性", "気配り", "チームワーク"],
      },
    ],
    low: [
      {
        name: "チャレンジャータイプ",
        description: "そのテーマで新しいことに挑戦する",
        traits: ["挑戦心", "成長志向", "好奇心", "柔軟性"],
      },
      {
        name: "自由人タイプ",
        description: "そのテーマで自由な発想を大切にする",
        traits: ["自由", "独立性", "創造性", "柔軟性"],
      },
    ],
  };
}

// テーマに応じた人物結果を取得する関数（改良版）
export function getThemeResults(
  themeKey: string,
  themeTitle?: string
): ThemeResults {
  // 事前定義されたテーマがある場合はそれを使用
  if (diagnosisResultsMap[themeKey]) {
    return diagnosisResultsMap[themeKey];
  }

  // 事前定義されていない場合は、テーマタイトルから動的に生成
  if (themeTitle) {
    return generatePersonResultsFromTheme(themeTitle);
  }

  // どちらもない場合はデフォルトを返す
  return diagnosisResultsMap["default"];
}
