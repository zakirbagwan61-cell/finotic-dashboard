import { useEffect, useRef, useState } from 'react'
import { money } from '../utils/format'

export default function AnimatedMoney({ value, duration = 800 }) {
  const [shown, setShown] = useState(0)
  const from = useRef(0)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const startVal = from.current
    const start = performance.now()
    let id

    const tick = (now) => {
      const p = reduce ? 1 : Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3) // ease-out
      const v = startVal + (value - startVal) * eased
      from.current = v
      setShown(v)
      if (p < 1) id = requestAnimationFrame(tick)
    }
    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [value, duration])

  return <>{money(shown)}</>
}