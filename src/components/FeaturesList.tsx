import { Box, Typography } from '@mui/material'
import React from 'react'

interface FeaturesListProps {
  features: string[]
}

const FeaturesList: React.FC<FeaturesListProps> = ({ features }) => {
  return (
    <Box
      sx={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '20px',
        margin: '20px auto',
        maxWidth: '700px',
        textAlign: 'center',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        borderTop: '5px solid #048ABF',
        borderLeft: '5px solid #048ABF',
        borderRight: '5px solid orange',
        borderBottom: '5px solid orange',
      }}
    >
      <Typography
        variant="h5"
        sx={{
          fontWeight: 'bold',
          padding: '5px',
          color: '#d81b60',
          border: '5px solid #ccc',
          borderRadius: '8px',
          userSelect: 'none',
        }}
      >
        あなたの恋愛の特徴
      </Typography>
      <Box
        component="ul"
        sx={{
          listStyle: 'none',
          marginTop: '10px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'flex-start',
          padding: 0,
        }}
      >
        {features.map((text, index) => (
          <Box
            component="li"
            key={index}
            sx={{
              width: { xs: '100%', sm: '50%' },
              textAlign: 'left',
              paddingLeft: '10px',
              paddingBottom: '2px',
            }}
          >
            ・{text}
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export default FeaturesList
