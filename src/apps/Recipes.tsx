import { useState } from 'react'
import { content } from '../content'
import type { Recipe } from '../content'
import { PixelGrid } from '../icons/PixelGrid'
import './recipes.css'

// '#' ink, 'B' cake, 'D' dark chocolate, 'W' white chocolate, 'L' liner, 'o' paper
const ART: Record<Recipe['id'], string[]> = {
  muffins: [
    '................',
    '.....######.....',
    '...##BBBBBB##...',
    '..#BBDBBBBDBB#..',
    '.#BBBBBDBBBBBB#.',
    '.#BDBBBBBBBDBB#.',
    '#BBBBBDBBBBBBBB#',
    '#BBDBBBBBDBBBDB#',
    '.##############.',
    '..#LoLoLoLoLo#..',
    '..#LoLoLoLoLo#..',
    '...#LoLoLoLo#...',
    '...#LoLoLoLo#...',
    '....########....',
    '................',
    '................',
  ],
  truffles: [
    '................',
    '................',
    '.....####.......',
    '....#DDDD#......',
    '...#DDoDDD#.....',
    '...#DDDDDD#.....',
    '..###DDDD####...',
    '.#WWW####DDDD#..',
    '#WWoWWW#DDoDDD#.',
    '#WWWWWW#DDDDDD#.',
    '#WWWWWW#DDDDDD#.',
    '.#WWWW#.#DDDD#..',
    '..####...####...',
    '................',
    '................',
    '................',
  ],
}
const LEGEND = { '#': 'var(--ink)', B: '#8a5a3c', D: '#3d2418', W: '#fff4dc', L: 'var(--c4)', o: 'var(--paper)' }

// a small house, as on the Home button of a card stack
const HOME = ['....##....', '...####...', '..######..', '.########.', '##########', '.#......#.', '.#..##..#.', '.#..##..#.', '.########.']

/** My recipes as a stack of cards: a home card, then one card for each recipe, with arrows to go through them. */
export function Recipes() {
  const recipes = content.recipes
  // card 0 is the home card
  const [card, setCard] = useState(0)
  const count = recipes.length + 1
  const recipe = card === 0 ? null : recipes[card - 1]
  const go = (step: number) => setCard((card + step + count) % count)

  return (
    <div className="stack-app">
      <div className="stack-card px-border" key={card} aria-live="polite">
        {recipe ? (
          <>
            <header className="stack-head">
              <div>
                <h2>{recipe.title}</h2>
                <p>Makes {recipe.makes}</p>
              </div>
              <PixelGrid rows={ART[recipe.id]} legend={LEGEND} size={64} />
            </header>
            <div className="stack-body">
              <ul className="stack-field" aria-label="Ingredients">
                {recipe.ingredients.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div>
                <ol aria-label="Method">
                  {recipe.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
                <p className="stack-tip">{recipe.tip}</p>
              </div>
            </div>
          </>
        ) : (
          <div className="stack-home">
            <h2>Varnika’s Recipe Stack</h2>
            <p>Two things I bake that people ask for again.</p>
            <ul>
              {recipes.map((item, i) => (
                <li key={item.id}>
                  <button type="button" className="stack-button" onClick={() => setCard(i + 1)}>
                    <PixelGrid rows={ART[item.id]} legend={LEGEND} size={56} />
                    <span>{item.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <nav className="stack-nav" aria-label="Cards">
        <button type="button" className="stack-button" aria-label="Previous card" onClick={() => go(-1)}>
          ◀
        </button>
        <button type="button" className="stack-button" aria-label="Home card" disabled={card === 0} onClick={() => setCard(0)}>
          <PixelGrid rows={HOME} legend={{ '#': 'currentColor' }} size={20} />
        </button>
        <button type="button" className="stack-button" aria-label="Next card" onClick={() => go(1)}>
          ▶
        </button>
        <span className="stack-count">
          Card {card + 1} of {count}
        </span>
      </nav>
    </div>
  )
}
