import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Root } from './shell/Root'
import './styles/base.css'
import { getPalette, setPalette } from './theme'

setPalette(getPalette())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
