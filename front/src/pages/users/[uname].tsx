import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import DrawerAppBar from '@/components/DrawerAppBar'; // ここが正しいコンポーネントを指しているか確認してください
import Box from '@mui/material/Box'; // @mui/material がインストールされていることを確認してください

const aaa = () => {

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const usernameFromCookie = Cookies.get('username');
    const jwtTokenFromCookie = Cookies.get('jwt');
    setLoading(false);
  }, []);

return (
    <Box>
        <DrawerAppBar />
    </Box>
)

}

export default aaa;