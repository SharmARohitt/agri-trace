import { useState } from 'react'
import Link from 'next/link'
import { useStacks } from '../contexts/StacksContext'
import { Menu, X, User, LogOut, Wallet } from 'lucide-react'
import NotificationSystem from './NotificationSystem'

export default function Layout({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isSignedIn, userData, connectWallet, disconnectWallet, stxAddress } = useStacks()

  const navigation = [
    { name: 'Dashboard', href: '/' },
    { name: 'Farmers', href: '/farmers' },
    { name: 'Products', href: '/products' },
    { name: 'Marketplace', href: '/marketplace' },
    { name: 'Track', href: '/track' },
    { name: 'Debug', href: '/debug-farmer' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <NotificationSystem />
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AT</span>
                </div>
                <span className="text-xl font-bold text-gray-900">AgriTrace</span>
              </Link>
              
              {/* Desktop Navigation */}
              <div className="hidden md:ml-10 md:flex md:space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Wallet Connection */}
            <div className="flex items-center space-x-4">
              {isSignedIn ? (
                <div className="flex items-center space-x-3">
                  <div className="hidden sm:block text-sm text-gray-600">
                    {stxAddress?.slice(0, 6)}...{stxAddress?.slice(-4)}
                  </div>
                  <button
                    onClick={disconnectWallet}
                    className="flex items-center space-x-2 text-gray-500 hover:text-gray-700"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Disconnect</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Connect Wallet</span>
                </button>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-500 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              © 2024 AgriTrace. Ensuring transparency in agriculture supply chain.
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900">Privacy</a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900">Terms</a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}