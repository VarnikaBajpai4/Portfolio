import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../styles/base.css'
import './notfound.css'
import { getPalette, setPalette } from '../theme'
import { NotFound } from './NotFound'

setPalette(getPalette())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NotFound />
  </StrictMode>,
)
