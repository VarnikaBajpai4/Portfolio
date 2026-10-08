import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../styles/base.css'
import '../apps/apps.css'
import './standard.css'
import { getPalette, setPalette } from '../theme'
import { StandardView } from './StandardView'

setPalette(getPalette())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StandardView />
  </StrictMode>,
)
