import { motion } from 'framer-motion'
import React from 'react'

interface BackgroundAnimationProps {
  showLines: boolean
  isBackgroundAnimated: boolean
  onLinesAnimationComplete: () => void
}

const BackgroundAnimation: React.FC<BackgroundAnimationProps> = ({
  showLines,
  isBackgroundAnimated,
  onLinesAnimationComplete,
}) => {
  return (
    <>
      {isBackgroundAnimated && (
        <>
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'white',
              zIndex: -3,
            }}
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(to right, #F28705 50%, #048ABF 50%)',
              zIndex: -3,
            }}
          />
        </>
      )}
      {showLines && (
        <>
          <motion.div
            initial={{ x: '100%', y: '100%' }}
            animate={{ x: '-100%', y: '-100%' }}
            transition={{ duration: 2 }}
            style={{
              position: 'absolute',
              top: 0,
              left: '45%',
              width: '10px',
              height: '150%',
              backgroundColor: '#048ABF',
              transform: 'rotate(45deg)',
              zIndex: -2,
            }}
            onAnimationComplete={onLinesAnimationComplete}
          />
          <motion.div
            initial={{ x: '-100%', y: '-100%' }}
            animate={{ x: '100%', y: '100%' }}
            transition={{ duration: 2, delay: 0.5 }}
            style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              width: '10px',
              height: '150%',
              backgroundColor: '#F28705',
              transform: 'rotate(45deg)',
              zIndex: -2,
            }}
          />
        </>
      )}
    </>
  )
}

export default BackgroundAnimation
