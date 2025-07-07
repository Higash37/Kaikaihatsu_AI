import { Box } from '@mui/material'
import Image from 'next/legacy/image'
import Link from 'next/link'
import { useRouter } from 'next/router'

const Header = () => {
  const router = useRouter()
  const isHome = router.pathname === '/'

  return (
    <Box
      component="nav"
      sx={{
        position: 'fixed',
        top: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: { xs: 80, sm: 130, md: 90, lg: 67, xl: 120 },
        width: '100vw',
        padding: {
          xs: '0 12px',
          sm: '0 16px',
          md: '0 24px',
          lg: '0 32px',
          xl: '0 40px',
        },
        backgroundColor: '#fff',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        zIndex: 10,
      }}
    >
      {/* ホームの場合はリンクなし */}
      {isHome ? (
        <Box
          sx={{
            width: { xs: 150, sm: 200, md: 240, lg: 260, xl: 280 },
            height: { xs: 80, sm: 110, md: 90, lg: 67, xl: 120 },
            position: 'relative',
          }}
        >
          <Image
            src="images/LoveNavi.png"
            alt="header logo"
            layout="fill"
            objectFit="contain"
            priority
          />
        </Box>
      ) : (
        // ホーム以外では画像をリンク化
        <Link href="/" passHref>
          <Box
            sx={{
              display: 'inline-block', // 余白をクリックできないようにする
              width: { xs: 150, sm: 200, md: 240, lg: 260, xl: 280 },
              height: { xs: 80, sm: 110, md: 90, lg: 67, xl: 120 },
              position: 'relative',
              cursor: 'pointer',
            }}
          >
            <Image
              src="images/LoveNavi.png"
              alt="header logo"
              layout="fill"
              objectFit="contain"
              priority
            />
          </Box>
        </Link>
      )}
    </Box>
  )
}

export default Header
