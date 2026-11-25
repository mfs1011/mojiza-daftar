import react from '@vitejs/plugin-react'
import { realpathSync } from 'node:fs'
import { dirname } from 'node:path'
import { defineConfig, searchForWorkspaceRoot } from 'vite'

// node_modules boshqa papkaga symlink bo'lsa (git worktree), dev server undagi fayllarni
// (masalan @fontsource shriftlari) ham bera olsin
let modulesRoot: string[] = []
try {
  modulesRoot = [dirname(realpathSync('node_modules'))]
} catch {
  // node_modules yo'q — kerak emas
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    fs: { allow: [searchForWorkspaceRoot(process.cwd()), ...modulesRoot] },
  },
})
