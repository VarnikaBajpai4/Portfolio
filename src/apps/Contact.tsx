import { content } from '../content'

export function Contact() {
  return (
    <div className="contact app-pad">
      <h2>Say hello</h2>
      <p className="read">The fastest way to reach me is email.</p>
      <p>{content.identity.email}</p>
      <ul className="contact-links">
        {content.links.map((link) => (
          <li key={link.label}>
            <a
              className="btn"
              href={link.href}
              {...(link.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
