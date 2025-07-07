import { Box, Typography, ButtonBase } from '@mui/material'
import { styled } from '@mui/material/styles'
import { motion } from 'framer-motion'
import React from 'react'

interface Option {
  value: string
  label: string
}

interface FilterButtonProps {
  title: string
  options: Option[]
  selected: string | null
  onSelect: (value: string) => void
}

// ButtonBase をラップするコンポーネント
const HeartShapeButtonWrapper = styled(ButtonBase)({
  width: 60,
  height: 60,
  padding: 0,
  position: 'relative',
})

// motion.svg を用いたコンポーネントのスタイル
const HeartShapeSVG = styled(motion.svg)({
  width: '100%',
  height: '100%',
  display: 'block',
})

// ハート型ボタン単体のProps定義
interface HeartShapeButtonProps {
  selected?: boolean
  onClick: () => void
  label: string
}

const HeartShapeButton: React.FC<HeartShapeButtonProps> = ({ selected, onClick, label }) => {
  return (
    <HeartShapeButtonWrapper onClick={onClick}>
      <HeartShapeSVG
        viewBox="0 0 24 24"
        initial={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <motion.path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 
             2 5.42 4.42 3 7.5 3 
             c1.74 0 3.41.81 4.5 2.09 
             C13.09 3.81 14.76 3 16.5 3 
             19.58 3 22 5.42 22 8.5 
             c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          fill={selected ? '#1976d2' : 'transparent'}
          stroke={selected ? 'none' : '#1976d2'}
          strokeWidth="0.5"
        />
      </HeartShapeSVG>
      <Box
        component="span"
        sx={{
          position: 'absolute',
          top: '47%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: selected ? 'white' : '#1976d2',
          fontWeight: 'bold',
          pointerEvents: 'none',
          fontSize: '0.6rem',
          textAlign: 'center',
        }}
      >
        {label}
      </Box>
    </HeartShapeButtonWrapper>
  )
}

const FilterButton: React.FC<FilterButtonProps> = ({ title, options, selected, onSelect }) => {
  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        {options.map((option) => (
          <HeartShapeButton
            key={option.value}
            selected={selected === option.value}
            label={option.label}
            onClick={() => onSelect(option.value)}
          />
        ))}
      </Box>
    </Box>
  )
}

export default FilterButton
