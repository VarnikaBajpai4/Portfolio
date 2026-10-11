import { PixelGrid } from './PixelGrid'
import { PEOPLE, PEOPLE_LEGEND, PERSON_W } from './people'
import type { FamilyId } from './people'

/** A small pixel person. One grid pixel is drawn as `scale` screen pixels. */
export function Person({ who, scale = 3 }: { who: FamilyId; scale?: number }) {
  return <PixelGrid rows={PEOPLE[who].rows} legend={PEOPLE_LEGEND} size={PERSON_W * scale} />
}
