import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Yumaloq bolalar shrifti (OFL) — ilova ichida, internetsiz ishlaydi
import '@fontsource/baloo-2/latin-600.css'
import '@fontsource/baloo-2/latin-700.css'
import '@fontsource/baloo-2/latin-800.css'
import './index.css'
import App from './App.tsx'
import { Gallery } from './dev/Gallery.tsx'
import { loadAssets } from './lib/assets.ts'

const showGallery = import.meta.env.DEV && location.hash === '#gallery'

// Avval tashqi asset'lar ro'yxati (rasm/ovoz/musiqa) o'qiladi, keyin ilova chiziladi
void loadAssets().then(() =>
  createRoot(document.getElementById('root')!).render(<StrictMode>{showGallery ? <Gallery /> : <App />}</StrictMode>),
)
