'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'

export default function DebugAuthPage() {
  const { user, token, loading } = useAuth()
  const [cookies, setCookies] = useState<string>('')
  const [localStorage, setLocalStorage] = useState<{ token: string | null, user: string | null }>({
    token: null,
    user: null
  })

  useEffect(() => {
    // Get cookies
    setCookies(document.cookie)
    
    // Get localStorage
    setLocalStorage({
      token: window.localStorage.getItem('auth-token'),
      user: window.localStorage.getItem('auth-user')
    })
  }, [])

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Authentication Debug</h1>
      
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Auth Context State</h2>
          <div className="space-y-2">
            <p><strong>Loading:</strong> {loading.toString()}</p>
            <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'null'}</p>
            <p><strong>Token:</strong> {token ? `${token.substring(0, 20)}...` : 'null'}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">LocalStorage</h2>
          <div className="space-y-2">
            <p><strong>Token:</strong> {localStorage.token ? `${localStorage.token.substring(0, 20)}...` : 'null'}</p>
            <p><strong>User:</strong> <pre className="text-xs bg-gray-100 p-2 rounded">{localStorage.user || 'null'}</pre></p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Cookies</h2>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
            {cookies || 'No cookies found'}
          </pre>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Test Admin Access</h2>
          <button
            onClick={async () => {
              try {
                const response = await fetch('/api/admin/products')
                const data = await response.json()
                alert(`API Response: ${JSON.stringify(data, null, 2)}`)
              } catch (error) {
                alert(`Error: ${error}`)
              }
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Test Admin API
          </button>
        </div>
      </div>
    </div>
  )
}
