import '../styles/globals.css'
import { StacksProvider } from '../contexts/StacksContext'

function MyApp({ Component, pageProps }) {
  return (
    <StacksProvider>
      <Component {...pageProps} />
    </StacksProvider>
  )
}

export default MyApp