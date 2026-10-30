import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import { ModerationConsole } from './components/ModerationConsole'
import { TechnologyExplorer } from './TechnologyExplorer'
import './styles.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      gcTime: 5 * 60 * 1000,
    },
  },
})

const normalizedPath = window.location.pathname.endsWith('/') ? window.location.pathname.slice(0, -1) : window.location.pathname
const RootComponent = normalizedPath === '/moderation' ? ModerationConsole : normalizedPath === '/technology' ? TechnologyExplorer : App

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RootComponent />
    </QueryClientProvider>
  </React.StrictMode>,
)
