import { Question } from "@/types";

// 感情重視を測る質問リスト
export const emotionalQuestions: Question[] = [
  { id: 1, text: "自分の直感を信じて行動することが多い。", type: "emotion" },
  {
    id: 2,
    text: "相手との関係において、未来のことよりも今のことを考える方だ。",
    type: "emotion",
  },
  {
    id: 3,
    text: "目の前の気持ちに素直に従うことが大切だと思う。",
    type: "emotion",
  },
  {
    id: 4,
    text: "相手に対して感情的な共感を求めることが多い。",
    type: "emotion",
  },
  {
    id: 5,
    text: "感情を抑え込むよりも、素直に表現したいと思う。",
    type: "emotion",
  },
  {
    id: 6,
    text: "恋愛では論理よりも心のつながりが大事だと思う。",
    type: "emotion",
  },
  {
    id: 7,
    text: "恋愛では「フィーリング」が最も大切だと思う。",
    type: "emotion",
  },
  { id: 8, text: "相手の感情の変化に敏感だと思う。", type: "emotion" },
  {
    id: 9,
    text: "相手との関係では「心のつながり」を重視する方だ。",
    type: "emotion",
  },
  {
    id: 10,
    text: "恋愛では何かを決めるとき、心が動かされる方を選ぶことが多い。",
    type: "emotion",
  },
  {
    id: 11,
    text: "好きな人には自分の気持ちを全力で伝えたいタイプだ。",
    type: "emotion",
  },
  { id: 12, text: "恋愛では心のときめきを最優先する。", type: "emotion" },
  {
    id: 13,
    text: "恋愛では自分の気持ちを素直に表現する方だ。",
    type: "emotion",
  },
  {
    id: 14,
    text: "感情が高ぶると、それに引きずられて行動が変わることがある。",
    type: "emotion",
  },
  {
    id: 15,
    text: "ロマンチックなシチュエーションに喜びを感じることが多い。",
    type: "emotion",
  },
  {
    id: 16,
    text: "恋愛では直感的につながりを感じる瞬間が重要だと思う。",
    type: "emotion",
  },
  {
    id: 17,
    text: "好きな人と一緒にいる時間は特別な満足感を得られる。",
    type: "emotion",
  },
  {
    id: 18,
    text: "恋愛では感情的に盛り上がる出来事に期待してしまうことがある。",
    type: "emotion",
  },
  {
    id: 19,
    text: "自分の気持ちを相手に伝える方法を工夫することが好きだ。",
    type: "emotion",
  },
  {
    id: 20,
    text: "デートプランは、その時々の感情や雰囲気で決めたい。",
    type: "emotion",
  },
  {
    id: 21,
    text: "相手への好意は理屈よりも感覚的なものだと感じる。",
    type: "emotion",
  },
  {
    id: 22,
    text: "恋愛中は普段よりも感情的になりやすいと感じる。",
    type: "emotion",
  },
  {
    id: 23,
    text: "ロマンチックなシチュエーションには特別な魅力を感じる。",
    type: "emotion",
  },
  {
    id: 24,
    text: "感情的な出来事には強く心を動かされることが多い。",
    type: "emotion",
  },
  {
    id: 25,
    text: "好きな人との思い出には特別な価値を感じる方だ。",
    type: "emotion",
  },
  {
    id: 26,
    text: "恋人との記念日や特別な日を大切にしたいと思う。",
    type: "emotion",
  },
  {
    id: 27,
    text: "感情豊かな人との会話には安心感を覚えることが多い。",
    type: "emotion",
  },
  {
    id: 28,
    text: "自分の気持ちに正直でありたいと常に思っている。",
    type: "emotion",
  },
  {
    id: 29,
    text: "感情的なつながりによって恋愛は深まると感じる方だ。",
    type: "emotion",
  },
  {
    id: 30,
    text: "好きな人には自分の気持ちをそのまま伝えたいと思う。",
    type: "emotion",
  },
];

// 理性重視を測る質問リスト
export const rationalQuestions: Question[] = [
  {
    id: 1,
    text: "恋愛でも冷静な判断を心掛けるべきだと思う。",
    type: "rational",
  },
  { id: 2, text: "恋人との将来設計を具体的に考える方だ。", type: "rational" },
  {
    id: 3,
    text: "人と対立が起きたときは、まず原因を分析する癖がある。",
    type: "rational",
  },
  {
    id: 4,
    text: "感情的になるよりも、合理的な解決策を探す方が得意だ。",
    type: "rational",
  },
  { id: 5, text: "恋愛でもリスク管理は必要だと思う。", type: "rational" },
  {
    id: 6,
    text: "相手との相性は、価値観やライフスタイルの一致で決まると思う。",
    type: "rational",
  },
  {
    id: 7,
    text: "衝動的な行動よりも計画的な行動を優先する方だ。",
    type: "rational",
  },
  {
    id: 8,
    text: "感情に振り回されないよう、自分をコントロールしている。",
    type: "rational",
  },
  { id: 9, text: "恋愛では現実的な目標設定が重要だと思う。", type: "rational" },
  { id: 10, text: "長期的な視点で物事を見る癖がある。", type: "rational" },
  { id: 11, text: "恋愛では慎重なステップが必要だと思う。", type: "rational" },
  {
    id: 12,
    text: "相手の性格や価値観をよく観察してから行動する方だ。",
    type: "rational",
  },
  {
    id: 13,
    text: "感情的な判断よりも事実やデータに基づいて決めたいと思う。",
    type: "rational",
  },
  {
    id: 14,
    text: "計画性がないと恋愛はうまくいかないと考える。",
    type: "rational",
  },
  {
    id: 15,
    text: "恋人との関係では論理的な話し合いが重要だと思う。",
    type: "rational",
  },
  {
    id: 16,
    text: "衝動的な行動よりも、慎重に考えた行動を選ぶことが多い。",
    type: "rational",
  },
  {
    id: 17,
    text: "相手との将来について具体的で現実的な話し合いを重視する。",
    type: "rational",
  },
  {
    id: 18,
    text: "感情よりも状況やタイミングに基づいて判断する方だ。",
    type: "rational",
  },
  {
    id: 19,
    text: "問題が起きた際には感情に流されず冷静に解決策を探す。",
    type: "rational",
  },
  {
    id: 20,
    text: "デートプランは事前に詳細まで計画する方だ。",
    type: "rational",
  },
  {
    id: 21,
    text: "恋愛では相手の経済状況や将来性など現実的な要素も考慮する。",
    type: "rational",
  },
  {
    id: 22,
    text: "自分の恋愛観は感情よりも論理に基づいていると感じる。",
    type: "rational",
  },
  {
    id: 23,
    text: "感情に左右されず、安定した関係を築くことを優先する。",
    type: "rational",
  },
  {
    id: 24,
    text: "恋愛ではリスクを最小限に抑えるための計画が重要だと思う。",
    type: "rational",
  },
  {
    id: 25,
    text: "相手との関係性を進展させる際、現実的な条件を重視する方だ。",
    type: "rational",
  },
  {
    id: 26,
    text: "自分の気持ちだけでなく、相手の状況も冷静に考慮して行動することが多い。",
    type: "rational",
  },
  {
    id: 27,
    text: "物事を決める際には、感情よりも論理やデータを優先する傾向がある。",
    type: "rational",
  },
  {
    id: 28,
    text: "恋人との未来について具体的なビジョンを描くことが好きだ。",
    type: "rational",
  },
  {
    id: 29,
    text: "長期的な安定を求めて、慎重にパートナーシップを築く方だ。",
    type: "rational",
  },
  {
    id: 30,
    text: "自分の恋愛スタイルは計画性と現実性が特徴だと感じる。",
    type: "rational",
  },
];

// 消極的な質問リスト
export const passiveQuestions: Question[] = [
  {
    id: 1,
    text: "自分から告白するよりも、相手から告白されたいと思う。",
    type: "passive",
  },
  {
    id: 2,
    text: "好きな人にはまず相手の出方を見るタイプだ。",
    type: "passive",
  },
  {
    id: 3,
    text: "恋愛では慎重にタイミングを見計らう方だと思う。",
    type: "passive",
  },
  {
    id: 4,
    text: "相手からアプローチされるまで待つことが多い。",
    type: "passive",
  },
  {
    id: 5,
    text: "自分の気持ちを伝えることには少し抵抗がある。",
    type: "passive",
  },
  {
    id: 6,
    text: "恋愛では受け身でいる方が安心感があると感じる。",
    type: "passive",
  },
  {
    id: 7,
    text: "新しい出会いには躊躇してしまうことが多い。",
    type: "passive",
  },
  {
    id: 8,
    text: "自分から関係を進展させるよりも、自然な流れに任せたい。",
    type: "passive",
  },
  {
    id: 9,
    text: "自分から誘うよりも、相手から誘われたいと思うことが多い。",
    type: "passive",
  },
  {
    id: 10,
    text: "恋愛では慎重になりすぎてチャンスを逃すことがある。",
    type: "passive",
  },
  {
    id: 11,
    text: "好きな人にはまず相手の反応を見るタイプだと思う。",
    type: "passive",
  },
  {
    id: 12,
    text: "恋愛では「待つ」ことで自然な流れになるのを期待する方だ。",
    type: "passive",
  },
  {
    id: 13,
    text: "相手からアプローチされるまで、自分からは動かないタイプだと思う。",
    type: "passive",
  },
  {
    id: 14,
    text: "新しい出会いには少し不安や緊張感を覚えることが多い。",
    type: "passive",
  },
  {
    id: 15,
    text: "自分から話しかけるよりも、相手から声をかけられるのを待つ方だと思う。",
    type: "passive",
  },
  {
    id: 16,
    text: "失敗する可能性があるときは、行動を控えることが多い。",
    type: "passive",
  },
  {
    id: 17,
    text: "自分の気持ちを伝える前に、慎重にタイミングを図りすぎてしまうことがある。",
    type: "passive",
  },
  {
    id: 18,
    text: "恋愛で失敗するリスクを考えると行動に移せないことがある。",
    type: "passive",
  },
  {
    id: 19,
    text: "恋愛では自分から動くよりも受け身でいる方が気楽だと感じる。",
    type: "passive",
  },
  {
    id: 20,
    text: "相手との関係が進展しなくても、自分から行動することには抵抗がある。",
    type: "passive",
  },
  {
    id: 21,
    text: "デートに誘う際、自分から行動するのは難しいと感じる。",
    type: "passive",
  },
  {
    id: 22,
    text: "恋愛では積極的に関わるよりも、一歩引いて様子を見る方だ。",
    type: "passive",
  },
  {
    id: 23,
    text: "好きな人との会話でも、自分から話題を切り出すのは苦手だ。",
    type: "passive",
  },
  {
    id: 24,
    text: "相手との距離感を縮めるための行動には時間をかけたいと思う。",
    type: "passive",
  },
  {
    id: 25,
    text: "恋愛では自分の気持ちよりも相手のペースに合わせようとする。",
    type: "passive",
  },
  {
    id: 26,
    text: "自分から積極的になることで相手に迷惑をかけたくないと思う。",
    type: "passive",
  },
  {
    id: 27,
    text: "初対面では自分から話しかけるよりも聞き役になることが多い。",
    type: "passive",
  },
  {
    id: 28,
    text: "相手との関係が自然に進展するのを待つ方だと感じることが多い。",
    type: "passive",
  },
  {
    id: 29,
    text: "自分の気持ちを伝える際、失敗したらどうしようと考えてしまうことがある。",
    type: "passive",
  },
  {
    id: 30,
    text: "恋愛では相手へのアプローチ方法に迷って行動できないことがある。",
    type: "passive",
  },
];

// 積極的な質問リスト
export const activeQuestions: Question[] = [
  { id: 1, text: "好きな人には自分から話しかけるタイプだ。", type: "active" },
  { id: 2, text: "恋愛では自分からデートに誘うことが多い。", type: "active" },
  {
    id: 3,
    text: "自分の気持ちはストレートに伝えるべきだと思う。",
    type: "active",
  },
  { id: 4, text: "新しい出会いには積極的に飛び込む方だ。", type: "active" },
  {
    id: 5,
    text: "好きな人のためなら大胆な行動もできる自信がある。",
    type: "active",
  },
  {
    id: 6,
    text: "自分から関係を進展させようと努力するタイプだ。",
    type: "active",
  },
  {
    id: 7,
    text: "恋愛では「待つ」よりも「攻める」方が性に合っている。",
    type: "active",
  },
  { id: 8, text: "相手の気持ちを知りたいときは直接聞く方だ。", type: "active" },
  { id: 9, text: "一目惚れしたらすぐ行動に移すタイプだ。", type: "active" },
  { id: 10, text: "好きな人には自分から連絡することが多い。", type: "active" },
  {
    id: 11,
    text: "恋愛では自分から行動しないと始まらないと思う。",
    type: "active",
  },
  {
    id: 12,
    text: "自分の気持ちを隠すよりもオープンにしたいタイプだ。",
    type: "active",
  },
  {
    id: 13,
    text: "好きな人には積極的に自分の存在をアピールする方だ。",
    type: "active",
  },
  {
    id: 14,
    text: "チャンスがあれば迷わず行動に移すタイプだと思う。",
    type: "active",
  },
  { id: 15, text: "恋愛では「攻め」の姿勢が大切だと思う。", type: "active" },
  {
    id: 16,
    text: "周囲の目よりも、自分の気持ちを優先して行動する方だ。",
    type: "active",
  },
  {
    id: 17,
    text: "デートプランを自分から提案することで関係をリードしたいと思う。",
    type: "active",
  },
  {
    id: 18,
    text: "初対面でも相手との会話を自分から始められる方だと思う。",
    type: "active",
  },
  {
    id: 19,
    text: "自ら関係を深めるために積極的に行動することが楽しいと感じる。",
    type: "active",
  },
  { id: 20, text: "気になる相手には迷わず話しかける方だ。", type: "active" },
  {
    id: 21,
    text: "デートの誘いは相手任せではなく、自分から提案することが多い。",
    type: "active",
  },
  {
    id: 22,
    text: "相手からの反応を待つよりも、自らアクションを起こすことが多い。",
    type: "active",
  },
  {
    id: 23,
    text: "相手との関係を進展させるためには積極的に努力する方だ。",
    type: "active",
  },
  {
    id: 24,
    text: "恋愛では相手任せではなく、自分主導で進めたいと考える。",
    type: "active",
  },
  {
    id: 25,
    text: "恋愛では相手との距離感を縮めるため、自分から話題作りを意識している。",
    type: "active",
  },
  {
    id: 26,
    text: "好きな人との時間を増やすため、自ら予定調整など積極的に働きかける。",
    type: "active",
  },
  {
    id: 27,
    text: "自分からアプローチすることで、恋愛のチャンスを広げたいと思う。",
    type: "active",
  },
  {
    id: 28,
    text: "恋愛ではタイミングよりも行動力が重要だと考える。",
    type: "active",
  },
  {
    id: 29,
    text: "自分からリードして関係性を築くことに喜びを感じる。",
    type: "active",
  },
  {
    id: 30,
    text: "相手との関係性が停滞していると感じたら、自ら変化を起こそうとする。",
    type: "active",
  },
];
