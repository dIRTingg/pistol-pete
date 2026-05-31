'use client'

import { useEffect, useMemo, useState } from 'react'

const Y  = '#FFE600'
const BK = '#111'

const KEYFRAMES = `
@keyframes pp-ball-bounce {
  0%   { transform: translateY(-28px); opacity: 0; animation-timing-function: cubic-bezier(0.36,0,0.9,1); }
  6%   { opacity: 1; }
  34%  { transform: translateY(var(--floor)); animation-timing-function: cubic-bezier(0.05,0,0.2,1); }
  50%  { transform: translateY(calc(var(--floor) - var(--b1))); animation-timing-function: cubic-bezier(0.36,0,0.9,1); }
  64%  { transform: translateY(var(--floor)); animation-timing-function: cubic-bezier(0.05,0,0.2,1); }
  76%  { transform: translateY(calc(var(--floor) - var(--b2))); animation-timing-function: cubic-bezier(0.36,0,0.9,1); }
  86%  { transform: translateY(var(--floor)); animation-timing-function: cubic-bezier(0.05,0,0.2,1); }
  94%  { transform: translateY(calc(var(--floor) - var(--b3))); animation-timing-function: cubic-bezier(0.36,0,0.9,1); }
  100% { transform: translateY(var(--floor)); }
}
@keyframes pp-ball-squash {
  0%, 30%, 46%, 60%, 72%, 100% { transform: scaleY(1) scaleX(1); }
  34%, 64%, 86% { transform: scaleY(0.78) scaleX(1.16); }
  50%, 76%, 94% { transform: scaleY(1.06) scaleX(0.95); }
}
@keyframes pp-ball-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(var(--spin)); }
}
`

function useKeyframes() {
  useEffect(() => {
    if (document.getElementById('pp-ball-kf')) return
    const s = document.createElement('style')
    s.id = 'pp-ball-kf'
    s.textContent = KEYFRAMES
    document.head.appendChild(s)
  }, [])
}

function FallingBall({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block', filter: 'drop-shadow(1px 2px 1px rgba(0,0,0,0.18))' }}>
      <circle cx="12" cy="12" r="11" fill={Y} stroke={BK} strokeWidth="1.3" />
      <path d="M2.4 7.5 Q12 13.5 21.6 7.5" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.85" />
      <path d="M2.4 16.5 Q12 10.5 21.6 16.5" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.85" />
    </svg>
  )
}

type Ball = {
  id: number; left: number; dur: number; delay: number; size: number;
  floor: number; b1: number; b2: number; b3: number; spin: number;
}

export default function TennisBallCelebration({ count = 34, floorY = 720 }: { count?: number; floorY?: number }) {
  useKeyframes()
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
  }, [])

  const balls = useMemo<Ball[]>(() => {
    return Array.from({ length: count }, (_, i) => {
      const size = 16 + Math.random() * 12
      const b1 = 150 + Math.random() * 70
      const b2 = b1 * (0.42 + Math.random() * 0.1)
      const b3 = b2 * (0.4 + Math.random() * 0.1)
      return {
        id: i,
        left: 4 + Math.random() * 90,
        dur: 2.4 + Math.random() * 0.9,
        delay: Math.random() * 0.5,
        size,
        floor: floorY - size,
        b1, b2, b3,
        spin: (60 + Math.random() * 140) * (Math.random() < 0.5 ? 1 : -1),
      }
    })
  }, [count, floorY])

  if (reduced) return null

  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 30 }}>
      {balls.map(b => (
        <div key={b.id} style={{
          position: 'absolute', top: 0, left: `${b.left}%`,
          ['--floor' as any]: `${b.floor}px`,
          ['--b1' as any]: `${b.b1}px`,
          ['--b2' as any]: `${b.b2}px`,
          ['--b3' as any]: `${b.b3}px`,
          animation: `pp-ball-bounce ${b.dur}s ${b.delay}s both`,
        }}>
          <div style={{ ['--spin' as any]: `${b.spin}deg`, animation: `pp-ball-spin ${b.dur}s ${b.delay}s ease-out both` }}>
            <div style={{ transformOrigin: 'center bottom', animation: `pp-ball-squash ${b.dur}s ${b.delay}s both` }}>
              <FallingBall size={b.size} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
