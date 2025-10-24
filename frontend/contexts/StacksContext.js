import { createContext, useContext, useEffect, useState } from 'react'
import { AppConfig, UserSession, showConnect } from '@stacks/connect'
import { StacksTestnet, StacksMainnet } from '@stacks/network'

const StacksContext = createContext()

export const useStacks = () => {
  const context = useContext(StacksContext)
  if (!context) {
    throw new Error('useStacks must be used within a StacksProvider')
  }
  return context
}

export const StacksProvider = ({ children }) => {
  const [userData, setUserData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const appConfig = new AppConfig(['store_write', 'publish_data'])
  const userSession = new UserSession({ appConfig })

  const network = process.env.NEXT_PUBLIC_STACKS_NETWORK === 'mainnet' 
    ? new StacksMainnet() 
    : new StacksTestnet()

  useEffect(() => {
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((userData) => {
        setUserData(userData)
        setIsLoading(false)
      })
    } else if (userSession.isUserSignedIn()) {
      setUserData(userSession.loadUserData())
      setIsLoading(false)
    } else {
      setIsLoading(false)
    }
  }, [])

  const connectWallet = () => {
    showConnect({
      appDetails: {
        name: 'AgriTrace',
        icon: '/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        window.location.reload()
      },
      userSession,
    })
  }

  const disconnectWallet = () => {
    userSession.signUserOut()
    setUserData(null)
    window.location.reload()
  }

  const value = {
    userData,
    userSession,
    network,
    isLoading,
    isSignedIn: !!userData,
    connectWallet,
    disconnectWallet,
    stxAddress: userData?.profile?.stxAddress?.testnet || userData?.profile?.stxAddress?.mainnet,
  }

  return (
    <StacksContext.Provider value={value}>
      {children}
    </StacksContext.Provider>
  )
}