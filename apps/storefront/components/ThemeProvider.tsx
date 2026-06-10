// Intentionally a pass-through. Dark mode is handled by the inline script in layout.tsx
// and toggled directly by ThemeToggle — no React context needed.
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
