import { Box, Typography, Button } from '@mui/material'
import { motion } from 'framer-motion'
import { useRouter } from 'next/router'
import React, { useState } from 'react'

import Header from '@/components/Header'
import Pulldown from '@/components/Pulldown'

// CircleBoxのProps定義
interface Props {
  onClick: () => void
  selected: boolean
  color: string
}

// CircleBoxコンポーネント
const CircleBox: React.FC<Props> = ({ onClick, selected, color }) => {
  return (
    <Box
      component={motion.div}
      onClick={onClick}
      sx={{ position: 'relative', textAlign: 'center', zIndex: 1 }}
    >
      {selected && (
        <Box
          component={motion.div}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 100, opacity: 0.2 }}
          transition={{ duration: 1 }}
          sx={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100vw',
            height: '100vh',
            borderRadius: '50%',
            backgroundColor: color,
            pointerEvents: 'none',
            zIndex: -1,
          }}
        />
      )}
      <Box component={motion.button} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
        <Box
          sx={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            border: `2px solid ${color}`,
            backgroundColor: selected ? color : 'transparent',
            opacity: selected ? 1 : 0.9,
            transition: 'all 0.3s ease',
            cursor: 'pointer',
          }}
        />
      </Box>
    </Box>
  )
}

const PersonalInfoForm: React.FC = () => {
  const router = useRouter()
  const [selectedGender, setSelectedGender] = useState<string>('')
  const [selectedAge, setSelectedAge] = useState<number | null>(null)

  const handleGenderSelect = (gender: string) => {
    setSelectedGender(gender)
  }

  const handleSubmit = () => {
    if (!selectedGender) {
      alert('性別を選択してください')
      return
    }
    if (!selectedAge) {
      alert('年齢を選択してください')
      return
    }

    // **既存の `userScores` を取得**
    const storedScores = localStorage.getItem('userScores')
    const parsedScores = storedScores ? JSON.parse(storedScores) : null

    if (!parsedScores) {
      console.error('❌ 診断スコアが `localStorage` に存在しません！')
      return
    }

    // **新しいユーザー情報を作成**
    const newUserInfo = {
      ...parsedScores, // 診断スコアを含める
      gender: selectedGender,
      age: selectedAge,
    }

    // **`localStorage` に保存**
    localStorage.setItem('userInfo', JSON.stringify(newUserInfo))

    // **結果ページへ遷移**
    router.push('/result')
  }

  return (
    <Box>
      <Header />
      <Box sx={{ pt: '100px', px: '16px' }}>
        <Box
          component={motion.div}
          sx={{
            maxWidth: '500px',
            mx: 'auto',
            textAlign: 'center',
            p: '20px',
            borderRadius: '12px',
            backgroundColor: '#fff',
            color: '#000',
          }}
        >
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: '20px' }}>
            あなたについて教えてください
          </Typography>

          {/* 性別選択 */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: '30px',
              mb: '20px',
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <CircleBox
                onClick={() => handleGenderSelect('male')}
                selected={selectedGender === 'male'}
                color="#048ABF"
              />
              <Typography variant="body2" sx={{ mt: '10px', color: '#000' }}>
                男性
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <CircleBox
                onClick={() => handleGenderSelect('female')}
                selected={selectedGender === 'female'}
                color="#F2C166"
              />
              <Typography variant="body2" sx={{ mt: '10px', color: '#000' }}>
                女性
              </Typography>
            </Box>
          </Box>

          {/* 選択結果とプルダウン */}
          {selectedGender && (
            <>
              <Typography variant="body1" sx={{ mt: '10px', color: '#000' }}>
                選択された性別：{selectedGender === 'male' ? '男性' : '女性'}
              </Typography>

              <Pulldown
                label="年齢を選択してください："
                options={Array.from({ length: 100 }, (_, i) => i + 1)}
                value={selectedAge}
                onChange={(value) => setSelectedAge(value)}
              />
            </>
          )}

          {/* 送信ボタン */}
          <Button
            onClick={handleSubmit}
            sx={{
              mt: '30px',
              backgroundColor: '#048ABF',
              color: '#fff',
              fontSize: '1.3rem',
              p: '10px 20px',
              borderRadius: '8px',
              '&:hover': { backgroundColor: '#036d94' },
            }}
          >
            結果を見る
          </Button>
        </Box>
      </Box>
    </Box>
  )
}

export default PersonalInfoForm
