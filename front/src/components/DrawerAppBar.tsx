import * as React from 'react';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from "next/image";
import logoImage from "../../public/img/Labolager.png";
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

interface Props {
  window?: () => Window;
}

const drawerWidth = 240;

export default function DrawerAppBar(props: Props) {
  const { window } = props;
  const [username, setUsername] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const usernameFromCookie = Cookies.get('username');
    setUsername(usernameFromCookie || '');
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const handleLogout = () => {
    Cookies.remove('username');
    Cookies.remove('jwt');
    
    if (router.pathname === '/') {
      router.reload();
    } else {
      router.push('/');
    }
  };
  

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        <Link href="/">
          <Image src={logoImage} alt='ロゴ画像' width='200' height='35' fetchPriority='high' loading='lazy' />
        </Link>
      </Typography>
      <Divider />
      {username ? (
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ my: 2 }}>
            ようこそ {username} さん
          </Typography>
          <Button onClick={handleLogout} sx={{ color: '#000' }}>
            ログアウト
          </Button>
        </Box>
      ) : (
        <List>
          <ListItem key="Login" disablePadding>
            <Link href="/login">
              <ListItemText primary="ログイン" />
            </Link>
          </ListItem>
          <ListItem key="Sign up" disablePadding>
            <Link href="/signup">
              <ListItemText primary="アカウント登録" />
            </Link>
          </ListItem>
        </List>
      )}
    </Box>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: 'flex', marginBottom: 15 }}>
      <CssBaseline />
      <AppBar component="nav">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
          >
            <Link href="/">
              <Image src={logoImage} alt='ロゴ画像' width='200' height='35' fetchPriority='high' loading='lazy' />
            </Link>
          </Typography>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            {username ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography>
                  ようこそ {username} さん
                </Typography>
                <Button onClick={handleLogout} sx={{ color: '#fff' }}>
                  (ログアウト)
                </Button>
              </Box>
            ) : (
              <>
                <Link href="/login">
                  <Button key="login" sx={{ color: '#fff' }}>
                    ログイン
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button key="Sign up" sx={{ color: '#fff' }}>
                    アカウント登録
                  </Button>
                </Link>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      <nav>
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
      </nav>
    </Box>
  );
}
