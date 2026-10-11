import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { startAnalytics } from '../analytics'
import './standard.css'
import { StandardView } from './StandardView'

startAnalytics()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StandardView />
  </StrictMode>,
)
