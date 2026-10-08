import { content } from '../content'
import { Icon } from '../icons/Icon'

export function Trash() {
  return (
    <div className="app-pad">
      <p className="list-count">{content.trash.length} items, 0 regrets</p>
      <ul className="file-list">
        {content.trash.map((item) => (
          <li key={item}>
            <Icon name="doc" size={20} fill="var(--paper)" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
