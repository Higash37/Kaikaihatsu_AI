import { Box } from '@mui/material'
import { motion } from 'framer-motion'
import React from 'react'

interface HeartGradientProps {
  dashLength?: number
  duration?: number
}
const HeartGradient: React.FC<HeartGradientProps> = ({ dashLength = 400, duration = 8 }) => {
  return (
    <Box
      sx={{
        position: 'absolute',
        // ヘッダー領域と被らないように top をブレークポイントごとに調整
        top: { xs: '51%', sm: '50%', md: '53%', lg: '50%', xl: '50%' },
        left: '50%',
        transform: 'translate(-50%, -50%)',
        // width は各ブレークポイントで同じように設定し、
        // height はデバイスごとに異なる値を指定可能
        width: { xs: 440, sm: 700, md: 800, lg: 600, xl: 700 },
        height: { xs: 440, sm: 700, md: 800, lg: 600, xl: 750 },
        zIndex: -1, // ヘッダー（zIndex:10）より下層に配置
      }}
    >
      <motion.svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%">
        {/* グラデーション定義 */}
        <defs>
          <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            {/* 左半分: 青 (#048ABF) */}
            <stop offset="0%" stopColor="#048ABF" />
            <stop offset="50%" stopColor="#048ABF" />
            {/* 右半分: オレンジ (#F28705) */}
            <stop offset="50%" stopColor="#F28705" />
            <stop offset="100%" stopColor="#F28705" />
          </linearGradient>
        </defs>

        <motion.path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
             2 5.42 4.42 3 7.5 3
             c1.74 0 3.41.81 4.5 2.09
             C13.09 3.81 14.76 3 16.5 3
             19.58 3 22 5.42 22 8.5
             c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          fill="white"
          stroke="url(#heartGradient)"
          strokeWidth="0.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={dashLength}
          strokeDashoffset={dashLength}
          initial={{ strokeDashoffset: dashLength }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration, ease: 'easeInOut' }}
        />
      </motion.svg>
    </Box>
  )
}

export default HeartGradient
