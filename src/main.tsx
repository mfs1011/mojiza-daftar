import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Gallery } from './dev/Gallery.tsx'

const showGallery = import.meta.env.DEV && location.hash === '#gallery'

createRoot(document.getElementById('root')!).render(
  <StrictMode>{showGallery ? <Gallery /> : <App />}</StrictMode>,
)
