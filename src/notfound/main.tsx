import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { startAnalytics } from '../analytics'
import '../styles/base.css'
import './notfound.css'
import { getPalette, setPalette } from '../theme'
import { NotFound } from './NotFound'

setPalette(getPalette())

startAnalytics()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NotFound />
  </StrictMode>,
)
