import { ClubLogo } from './ClubLogo'

export function Footer() {
  return (
    <footer className="site-footer">
      <ClubLogo className="club-logo--footer" />
      <p>© {new Date().getFullYear()} הפועל באר שבע | כל הזכויות שמורות</p>
    </footer>
  )
}
