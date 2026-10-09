import { useCallback, useState } from 'react'
import { prefersReducedMotion } from '../motion'
import { readSession, writeSession } from '../storage'
import { Desktop } from './Desktop'
import { Loader } from './Loader'
import { MobileShell } from './MobileShell'
import { ShutDown } from './ShutDown'
import { useIsMobile } from './useIsMobile'

// once per browser session, so a reload does not replay it
const INTRO_KEY = 'vb.introSeen'

function wantsIntro() {
  return !readSession(INTRO_KEY) && !prefersReducedMotion()
}

export function Root() {
  const mobile = useIsMobile()
  const [intro, setIntro] = useState(wantsIntro)
  const [played, setPlayed] = useState(intro)
  const [off, setOff] = useState(false)

  const startIntro = () => {
    setPlayed(true)
    setIntro(true)
  }

  const endIntro = useCallback(() => {
    writeSession(INTRO_KEY, '1')
    setIntro(false)
  }, [])

  return (
    <>
      <div inert={intro || off}>
        {mobile ? (
          <MobileShell />
        ) : (
          <Desktop
            entrance={!played ? 'none' : intro ? 'wait' : 'go'}
            onRestartIntro={startIntro}
            onShutDown={() => setOff(true)}
          />
        )}
      </div>
      {intro && <Loader onDone={endIntro} />}
      {off && (
        <ShutDown
          onRestart={() => {
            setOff(false)
            startIntro()
          }}
        />
      )}
    </>
  )
}
