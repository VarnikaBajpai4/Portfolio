import { Portrait } from '../icons/Portrait'

export function ShutDown({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="overlay shutdown" role="dialog" aria-label="Shut down">
      <div className="overlay-card px-border">
        <Portrait size={96} detailed />
        <p className="overlay-text">See you soon.</p>
        <button type="button" className="btn" autoFocus onClick={onRestart}>
          Restart
        </button>
      </div>
    </div>
  )
}
