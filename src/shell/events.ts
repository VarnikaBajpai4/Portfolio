import type { AppId } from '../wm/reducer'

/** Ask the cat to speak or to walk to an app's window. */
export interface PetRequest {
  say?: string
  goto?: AppId
}

export const PET_EVENT = 'vb:pet'
export const GRAVITY_EVENT = 'vb:gravity'

export function askPet(request: PetRequest): void {
  window.dispatchEvent(new CustomEvent<PetRequest>(PET_EVENT, { detail: request }))
}

export function dropEverything(): void {
  window.dispatchEvent(new Event(GRAVITY_EVENT))
}
