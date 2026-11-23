import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Gallery } from './dev/Gallery.tsx'
import { loadAssets } from './lib/assets.ts'

const showGallery = import.meta.env.DEV && location.hash === '#gallery'

// Avval tashqi asset'lar ro'yxati (rasm/ovoz/musiqa) o'qiladi, keyin ilova chiziladi
void loadAssets().then(() =>
  createRoot(document.getElementById('root')!).render(<StrictMode>{showGallery ? <Gallery /> : <App />}</StrictMode>),
)
