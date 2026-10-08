import { useCallback, useState } from 'react'
import { readStored, writeStored } from '../storage'
import { Desktop } from './Desktop'
import { Intro } from './Intro'
import { MobileShell } from './MobileShell'
import { ShutDown } from './ShutDown'
import { useIsMobile } from './useIsMobile'

const INTRO_KEY = 'vb.introSeen'

function wantsIntro() {
  return !readStored(INTRO_KEY) && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function Root() {
  const mobile = useIsMobile()
  const [intro, setIntro] = useState(wantsIntro)
  const [off, setOff] = useState(false)

  const endIntro = useCallback(() => {
    writeStored(INTRO_KEY, '1')
    setIntro(false)
  }, [])

  return (
    <>
      <div inert={intro || off}>
        {mobile ? (
          <MobileShell />
        ) : (
          <Desktop onRestartIntro={() => setIntro(true)} onShutDown={() => setOff(true)} />
        )}
      </div>
      {intro && <Intro onDone={endIntro} />}
      {off && (
        <ShutDown
          onRestart={() => {
            setOff(false)
            setIntro(true)
          }}
        />
      )}
    </>
  )
}
