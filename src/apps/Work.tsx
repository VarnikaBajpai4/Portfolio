import { content } from '../content'
import { CardStack } from './CardStack'

export function Work() {
  return <CardStack jobs={content.work} />
}

export function Community() {
  return <CardStack jobs={content.community} />
}
