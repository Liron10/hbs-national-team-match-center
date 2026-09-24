import { ClubLogo } from './ClubLogo'

export function Footer() {
  return (
    <footer className="site-footer">
      <ClubLogo className="club-logo--footer" />
      <div>
        <p>הנתונים מוזנים ידנית על ידי מנהל הדף</p>
        <p>© {new Date().getFullYear()} הפועל באר שבע | כל הזכויות שמורות</p>
      </div>
    </footer>
  )
}
