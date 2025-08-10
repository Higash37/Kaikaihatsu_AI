import React from 'react'

import HeartMark from '@/components/ui/BasicHeart'

const HeartMarkBackground = () => {
  const heartMarks = [
    { size: 100, top: '20%', left: '15%', rotate: -20 },
    { size: 350, top: '38%', left: '85%', rotate: 45 },
    { size: 150, top: '80%', left: '70%', rotate: -45 },
    { size: 350, top: '70%', left: '15%', rotate: -50 },
    { size: 100, top: '90%', left: '90%', rotate: 45 },
    { size: 100, top: '70%', left: '30%', rotate: -45 },
    { size: 100, top: '40%', left: '10%', rotate: -45 },
  ]

  return (
    <>
      {heartMarks.map((heart, index) => (
        <HeartMark
          key={index}
          size={heart.size}
          dashLength={200}
          duration={5 + (index % 3)}
          top={heart.top}
          left={heart.left}
          transform={`translate(-50%, -50%) rotate(${heart.rotate}deg)`}
        />
      ))}
    </>
  )
}

export default HeartMarkBackground
