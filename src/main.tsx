import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './shared/lib/i18n'
import { RouterProvider } from 'react-router-dom'
import { ThemeProvider } from './app/providers/ThemeProvider.tsx'
import { router } from './app/router'
import { QueryProvider } from './app/providers/QueryProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryProvider>
        <RouterProvider router={router} />
      </QueryProvider>
    </ThemeProvider>
  </StrictMode>,
)
