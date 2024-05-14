import { useEffect } from 'react';
import { atom, useRecoilState } from 'recoil';

export const userAtom = atom<string>({
  key: 'userAtom',
  default: '',
});

export function useAuth(name: string) {
  const [user, setUser] = useRecoilState(userAtom);

  useEffect(() => {
    if (user === '') {
      setUser(name);
    }
  }, [name, user, setUser]);

  console.log(user); // useEffectの外でログを出力

  return { user };
}
