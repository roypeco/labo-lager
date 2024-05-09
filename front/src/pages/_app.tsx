import type { AppProps } from "next/app";
import { RecoilRoot } from 'recoil'
import dayjs from 'dayjs'
import 'dayjs/locale/ja'


export default function App({ Component, pageProps }: AppProps) {
  dayjs.locale('ja')
  return (
    <RecoilRoot>
      <Component {...pageProps} />
    </RecoilRoot>
  )
}
