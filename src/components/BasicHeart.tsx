import { motion } from 'framer-motion'
import React from 'react'

// 白い線 (stroke) のハートマークを一筆書きのように描画するコンポーネント。
interface WhiteHeartMarkProps {
  //ハートの幅・高さ (px)
  size?: number
  // 一筆書き風に描画する際のストローク長
  dashLength?: number
  //アニメーションにかける時間 (秒)
  duration?: number
  //ハートを配置する top の値
  top?: string
  // ハートを配置する left の値
  left?: string
  // CSS の transform プロパティ (例: rotate(30deg))
  transform?: string
}
//React
const WhiteHeartMark: React.FC<WhiteHeartMarkProps> = ({
  size = 200,
  dashLength = 400,
  duration = 3,
  top = '50%',
  left = '50%',
  transform = 'translate(-50%, -50%)', //translate(x, y)
}) => {
  return (
    //motion.svgを用いることで、回転、描画などをsvgタグ内で実装出来る。
    <motion.svg
      xmlns="http://www.w3.org/2000/svg" //XML NameSpaceの略。SVGがどの名前空間の要素かを特定するために必要。
      viewBox="0 0 24 24" //"minX(左上のx座標) minY(左上のy座標) width height"
      width={size} //21行目
      height={size} //21行目
      style={{
        position: 'absolute',
        top, //24行目
        left, //25行目
        transform, //26行目
        zIndex: -1,
      }}
    >
      <motion.path
        //d: 軌道を指定（どうなってるかは知らない。100% AI）
        d="
          M12 21.35
          l-1.45-1.32
          C5.4 15.36 2 12.28 2 8.5
          2 5.42 4.42 3 7.5 3
          c1.74 0 3.41.81 4.5 2.09
          C13.09 3.81 14.76 3 16.5 3
          19.58 3 22 5.42 22 8.5
          c0 3.78-3.4 6.86-8.55 11.54
          L12 21.35z
        "
        fill="transparent" //何色で埋めつくすか
        stroke="#FFFFFF" // 白色のストローク
        strokeWidth="0.5" //線の太さ
        strokeLinecap="round" //結合部分 miter(尖) | round(丸) | bevel(平)
        strokeLinejoin="round" //線の端  butt(直線的にカット) | round(半円形) | square(四角形)
        strokeDasharray={dashLength} //指定のdashLengthの部分を破線にする設定
        strokeDashoffset={dashLength} //破線の場所を設定。
        initial={{ strokeDashoffset: dashLength }} //始めは400から始め0にしていく。
        animate={{ strokeDashoffset: 0 }} //最後に0にしていく。
        //duration: 23行目, ease: linear(一定) | ease| ease-in(out) | easeInOut
        transition={{ duration, ease: 'easeInOut' }}
      />
    </motion.svg>
  )
}

export default WhiteHeartMark
