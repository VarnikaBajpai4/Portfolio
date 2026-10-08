import { Icon } from '../icons/Icon'
import { HOME_URL } from '../shell/links'

export function NotFound() {
  return (
    <main className="nf checker">
      <div className="nf-card px-border px-shadow" role="alertdialog" aria-labelledby="nf-title" aria-describedby="nf-text">
        <Icon name="bomb" size={56} />
        <div className="nf-copy">
          <h1 id="nf-title">Sorry, a system error occurred.</h1>
          <p id="nf-text">This page does not exist.</p>
        </div>
        <a className="btn" href={HOME_URL}>
          Restart
        </a>
      </div>
    </main>
  )
}
