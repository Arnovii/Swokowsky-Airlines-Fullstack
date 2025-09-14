import type { JSX } from 'react'
import { Link } from 'react-router-dom'

export default function NotFound(): JSX.Element {
  return (
    <div>
      <h2>404 - Página no encontrada</h2>
      <Link to="/">Volver al inicio</Link>
    </div>
  )
}
