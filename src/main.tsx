import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Desktop } from './shell/Desktop'
import './styles/base.css'
import { getPalette, setPalette } from './theme'

setPalette(getPalette())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Desktop onRestartIntro={() => {}} onShutDown={() => {}} />
  </StrictMode>,
)
