import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { startAnalytics } from './analytics'
import { Root } from './shell/Root'
import './styles/base.css'
import { getPalette, setPalette } from './theme'

setPalette(getPalette())

startAnalytics()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
