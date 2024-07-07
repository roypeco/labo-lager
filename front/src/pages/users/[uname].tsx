import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import DrawerAppBar from '@/components/DrawerAppBar'; // ここが正しいコンポーネントを指しているか確認してください
import Box from '@mui/material/Box'; // @mui/material がインストールされていることを確認してください

const aaa = () => {

  const [username, setUsername] = useState<string | null>(null);
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const usernameFromCookie = Cookies.get('username');
    const jwtTokenFromCookie = Cookies.get('jwt');
    setUsername(usernameFromCookie || '');
    setJwtToken(jwtTokenFromCookie || '');
    setLoading(false);
  }, []);

return (
    <Box>
        <DrawerAppBar />
        <Box>
          <p>{ username }</p>
        </Box>
    </Box>
)

}

export default aaa;