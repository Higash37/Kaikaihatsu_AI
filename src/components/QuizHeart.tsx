import { motion } from 'framer-motion'

// 指定のボタン位置にスクロール
const scrollToNextButton = (currentQuestionId: number) => {
  //document.getElementById(id)関数 : JavaScript の標準的な関数 該当する箇所(id)をHTML形式で受け取る。
  const nextButton = document.getElementById(
    // currentQuestionId に +1 をすることで id を作り出している。(例：今が1番目である場合 → question- 2)
    `question-${currentQuestionId + 1}`,
  )
  //nextButton が押されたら...
  if (nextButton) {
    //1. window.scrollYプロパティ :  ページ全体の画面上部からの現在の画面上部(y座標)を求めるプロパティ
    //2. nextButton.getBoundingClientRect()関数 : JavaScript の標準関数現在の要素の位置を求める。
    //今回は nextButton.getBoundingClientRect().top なので、現在の見えている画面上部（ビューボート）からの高さを求める。
    //3. window.innerHeightプロパティ : 見えている画面全体の高さを求める。

    // 例： 1. = 500, 2. = 200, 3. = 800
    //targetY = 200 + 500 - (800 * 0.2) = 540
    const startY = window.scrollY
    const targetY =
      nextButton.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.2 // 画面の20%分下げるため0.2をかけている。これがないと、ボタンを押すと画面の最上部に毎回行ってしまう
    const duration = 500 // スクロール時間 (ミリ秒) 1000 = 1秒

    //startTime変数を定義 ユニオン型にして始めは null にしている。これを =0 にすると、始めから 0 が代入され false になってしまう
    let startTime: number | null = null

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp //timestampプロパティ : 標準的なjavaScriptのプロパティ startTime に現在時刻を記録
      const progress = timestamp - startTime // 例： 137.890 - 120.456 (ミリ秒)
      //math.min()関数 : javaScript の標準的な関数 ()の中の最小値を返す
      const percentage = Math.min(progress / duration, 1) // 進行率 (0 ~ 1) 100% を超えないようにする
      const easeInOutCubic =
        percentage < 0.5 // 50%よりも小さければ...
          ? // T :  例： 4 * 0.1³ = 0.004, 4 * 0.4³ = 0.256 %が大きくなるほど数字が大きくなり速くなる！
            4 * percentage * percentage * percentage
          : //math.pow(a, b) aのb乗を計算する標準的な関数
            // F :  例： 1 - (-2 * 0.6 + 2)³ / 2 = 0.744 %が大きくなるほど数字が減っていき減速していく
            1 - Math.pow(-2 * percentage + 2, 3) / 2

      //まあなので f(x)=(−2x+2)³ の3次関数を使って ease in-out を実現してます。
      //最後これでスクロールpxを求めている。
      window.scrollTo(0, startY + (targetY - startY) * easeInOutCubic) // window.scrollTo(x, y)関数: javaScriptの標準的な関数
      //duration が最大値になるので、完了していなければ step() をやり直す
      if (progress < duration) {
        requestAnimationFrame(step)
      }
    }
    // requestAnimationFrame()関数 : javaScript の標準的な関数 キャッシュレート(60fps)に合わせて1秒間に60回実施
    requestAnimationFrame(step)
  }
}

// Props型定義
type Props = {
  onClick?: () => void
  selected: boolean
  size?: number
  questionId: number // 質問ID
}

// ハート型SVGコンポーネント
const HeartShape: React.FC<Props & { borderColor: string; fillColor: string }> = ({
  onClick,
  selected,
  borderColor,
  fillColor,
  size = 100,
  questionId,
}) => {
  const handleClick = () => {
    if (onClick) onClick()

    // すでに押されているボタンがリセットされた場合はスクロールしない
    if (selected) return

    setTimeout(() => {
      scrollToNextButton(questionId) // クリック後にスクロールを遅らせる
    }, 100)
  }

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      initial={{ scale: 1.0 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 1.1 }}
      style={{
        cursor: 'pointer',
        display: 'inline-block',
        outline: 'none',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
      onClick={handleClick}
    >
      <motion.path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
             2 5.42 4.42 3 7.5 3
             c1.74 0 3.41.81 4.5 2.09
             C13.09 3.81 14.76 3 16.5 3
             19.58 3 22 5.42 22 8.5
             c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill={selected ? fillColor : 'transparent'}
        stroke={selected ? borderColor : '#d3d3d3'}
        strokeWidth="0.5"
      />
    </motion.svg>
  )
}

// 各CircleBoxコンポーネント
const CircleBoxBigleft: React.FC<Props> = (props) => (
  <HeartShape {...props} borderColor="#F28705" fillColor="#F28705" size={130} />
)

const CircleBoxMiddleLeft: React.FC<Props> = (props) => (
  <HeartShape {...props} borderColor="#F2C166" fillColor="#F2C166" size={110} />
)

const CircleBoxSmall: React.FC<Props> = (props) => (
  <HeartShape {...props} borderColor="gray" fillColor="silver" size={90} />
)

const CircleBoxMiddleRight: React.FC<Props> = (props) => (
  <HeartShape {...props} borderColor="#87cefa" fillColor="#87cefa" size={110} />
)

const CircleBoxBigright: React.FC<Props> = (props) => (
  <HeartShape {...props} borderColor="#0477BF" fillColor="#0477BF" size={130} />
)

// エクスポート
export {
  CircleBoxBigleft,
  CircleBoxMiddleLeft,
  CircleBoxSmall,
  CircleBoxMiddleRight,
  CircleBoxBigright,
}
