import { ALL_ANIMALS, AnimalArt } from '../art/Animal'
import { ALL_FRUITS, FruitArt } from '../art/Fruit'
import { Mascot, type Mood } from '../art/Mascot'
import { ALL_PEOPLE, BasketArt, CoinArt, DECOR_POOL, DecorArt, DomeArt, PersonArt, StationIcon } from '../art/Scenery'
import { ALL_TILES, TileArt } from '../art/Tile'
import type { StationId } from '../types'

// Faqat dev: http://localhost:5173/#gallery — barcha rasmlarni bir joyda ko'rish uchun.
const box = { width: 90, height: 90, display: 'inline-block', margin: 4, background: '#fff', borderRadius: 12, padding: 6 }
const STATIONS: StationId[] = ['rasm', 'bog', 'bozor', 'ferma', 'ustaxona', 'qora', 'harflar']
const MOODS: Mood[] = ['idle', 'happy', 'oops', 'sleep']

export function Gallery() {
  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'auto', background: '#cfe8d5', padding: 8 }}>
      <div>{ALL_FRUITS.map((f) => <span key={f} style={box}><FruitArt kind={f} /></span>)}</div>
      <div>{ALL_ANIMALS.map((a) => <span key={a} style={box}><AnimalArt id={a} /></span>)}
        {ALL_ANIMALS.slice(0, 4).map((a) => <span key={a + 's'} style={box}><AnimalArt id={a} shadow /></span>)}</div>
      <div>{MOODS.map((m) => <span key={m} style={box}><Mascot mood={m} /></span>)}
        {ALL_TILES.map((t) => <span key={t} style={box}><TileArt id={t} /></span>)}</div>
      <div>{ALL_PEOPLE.map((p) => <span key={p} style={box}><PersonArt id={p} /></span>)}
        <span style={box}><PersonArt id="opa" happy /></span><span style={box}><BasketArt ribbon="#e63946" /></span>
        <span style={box}><CoinArt /></span><span style={box}><DomeArt /></span></div>
      <div>{STATIONS.map((s) => <span key={s} style={box}><StationIcon id={s} /></span>)}
        {DECOR_POOL.slice(0, 10).map((d) => <span key={d} style={box}><DecorArt kind={d} /></span>)}</div>
    </div>
  )
}
