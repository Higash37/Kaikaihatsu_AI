import { Select, MenuItem, Typography } from '@mui/material'
import { SelectChangeEvent } from '@mui/material/Select'
import React from 'react'

// Propsの型定義
interface PulldownProps {
  label: string // ラベルテキスト
  options: number[] // 選択肢
  value: number | null // 現在選択されている値
  onChange: (value: number) => void // 値が変更されたときのコールバック
}

const Pulldown: React.FC<PulldownProps> = ({ label, options, value, onChange }) => {
  const handleChange = (event: SelectChangeEvent<number>) => {
    onChange(Number(event.target.value)) // 値を数値に変換してコールバックを呼び出す
  }

  return (
    <div>
      <Typography variant="body1">{label}</Typography>
      <Select value={value !== null ? value : ''} onChange={handleChange} displayEmpty fullWidth>
        <MenuItem value="" disabled>
          選択してください
        </MenuItem>
        {options.map((option) => (
          <MenuItem key={option} value={option}>
            {option}歳
          </MenuItem>
        ))}
      </Select>
    </div>
  )
}

export default Pulldown
