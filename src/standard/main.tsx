import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './standard.css'
import { StandardView } from './StandardView'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StandardView />
  </StrictMode>,
)
