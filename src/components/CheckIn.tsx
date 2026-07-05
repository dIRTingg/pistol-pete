'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { calcCost, formatDate, formatTime } from '@/lib/helpers'
import type { Profile } from '@/lib/supabase/types'
import TennisBallCelebration from './TennisBallCelebration'
import NewsBanner from './NewsBanner'

const Y  = '#FFE600'
const BK = '#111'

// ── atoms ────────────────────────────────────────────────────────────────
function PeteHero({ kicker, title, sub, peteHeight = 130, compact = true }: {
  kicker?: string; title: React.ReactNode; sub?: string; peteHeight?: number; compact?: boolean;
}) {
  return (
    <div style={{
      background: Y, border: `3px solid ${BK}`, borderRadius: compact ? 12 : 16,
      position: 'relative', overflow: 'hidden',
      padding: compact ? '14px 16px 0' : '20px 18px 0',
      boxShadow: `4px 4px 0 ${BK}`, marginBottom: 14,
    }}>
      <div style={{ position: 'absolute', inset: 0, background: `repeating-linear-gradient(135deg, transparent 0 18px, rgba(0,0,0,0.04) 18px 19px)`, pointerEvents: 'none' }} />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div style={{ flex: 1, paddingBottom: compact ? 12 : 14 }}>
          {kicker && <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 2 }}>{kicker}</div>}
          <div style={{ fontWeight: 900, fontSize: compact ? 28 : 40, letterSpacing: 1.5, lineHeight: 0.95, textTransform: 'uppercase' }}>{title}</div>
          {sub && <div style={{ marginTop: 8, fontSize: 11, fontWeight: 700, color: BK, opacity: 0.75 }}>{sub}</div>}
        </div>
        <img src="/icons/pete.png" alt="" style={{ height: peteHeight, marginRight: -8, marginBottom: -2, filter: 'drop-shadow(3px 5px 0 rgba(0,0,0,0.15))', flexShrink: 0 }} />
      </div>
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ display: 'block', fontWeight: 800, fontSize: 11, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1.2, color: '#444' }}>
      {children}
    </label>
  )
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props} style={{
      width: '100%', boxSizing: 'border-box',
      background: '#fff', color: BK,
      border: `2px solid ${BK}`, borderRadius: 4,
      padding: '12px 14px', fontSize: 15, fontFamily: 'inherit', outline: 'none',
      ...props.style,
    }} />
  )
}

function PrimaryBtn({ children, color = Y, fg = BK, ...rest }:
  { color?: string; fg?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...rest} style={{
      width: '100%', background: color, color: fg, border: `2px solid ${BK}`,
      borderRadius: 4, padding: '14px 22px', fontWeight: 900, fontSize: 15,
      letterSpacing: 1.5, textTransform: 'uppercase', cursor: rest.disabled ? 'not-allowed' : 'pointer',
      boxShadow: `3px 3px 0 ${BK}`, fontFamily: 'inherit', opacity: rest.disabled ? 0.7 : 1,
      ...rest.style,
    }}>{children}</button>
  )
}

// ── component ────────────────────────────────────────────────────────────
export default function CheckIn({ profile, onCheckedIn, onOpenNews }: { profile: Profile; onCheckedIn: () => void; onOpenNews?: () => void }) {
  const now = new Date()
  const today = now.toISOString().slice(0, 10)
  const minDate = `${now.getFullYear()}-01-01`
  const [date, setDate] = useState(today)
  const [time, setTime] = useState(now.toTimeString().slice(0, 5))
  const [dur, setDur]   = useState(60)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [done, setDone] = useState<{ startAt: string; durationMin: number; cost: number } | null>(null)
  const [lockCode, setLockCode] = useState<string | null>(null)

  const cost = calcCost(dur)

  useEffect(() => {
    const fetchCode = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('settings').select('value').eq('id', 'lock_code').single()
      if (data) setLockCode(data.value)
    }
    fetchCode()
  }, [])

  const doCheckin = async () => {
    setLoading(true); setErr('')
    const supabase = createClient()
    const startAt = new Date(`${date}T${time}:00`).toISOString()
    const { error } = await supabase.from('sessions').insert({
      user_id: profile.id,
      user_name: [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.name,
      start_at: startAt,
      duration_min: dur,
      cost,
      note: note || null,
      status: 'confirmed',
    })
    if (error) {
      setErr('Fehler beim Einchecken: ' + error.message)
      setLoading(false)
    } else {
      setDone({ startAt, durationMin: dur, cost })
      onCheckedIn()
      setLoading(false)
    }
  }

  // ── Success state ──────────────────────────────────────────────────────
  if (done) {
    const firstName = profile.first_name ?? profile.name
    return (
      <div style={{ padding: '0 18px', position: 'relative' }}>
        <TennisBallCelebration count={34} />
        <div style={{ position: 'relative', zIndex: 20 }}>
        <PeteHero
          kicker="● Eingecheckt"
          title={<>Viel Spaß,<br />{firstName}!</>}
          sub={`${formatDate(done.startAt)} · ${formatTime(done.startAt)} · ${done.durationMin} Min · ${done.cost} €`}
          peteHeight={130}
          compact
        />

        {lockCode && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#444', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="11" height="13" viewBox="0 0 11 13" fill="none" aria-hidden="true">
                <rect x="0.75" y="5.75" width="9.5" height="6.5" rx="1.25" stroke={BK} strokeWidth="1.5" />
                <path d="M2.5 5.75V4a3 3 0 016 0v1.75" stroke={BK} strokeWidth="1.5" />
              </svg>
              Zahlencode Kettenschloss
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {lockCode.split('').map((d, i) => (
                <div key={i} style={{
                  flex: 1, aspectRatio: '0.78',
                  background: BK, border: `2px solid ${BK}`, borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'ui-monospace, "JetBrains Mono", Menlo, monospace',
                  fontWeight: 900, fontSize: 48, color: '#fff', lineHeight: 1,
                  boxShadow: `3px 3px 0 ${Y}`,
                }}>
                  {d === '0'
                    ? <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#fff', boxShadow: '0 0 0 2px #555' }} />
                    : d
                  }
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, color: '#666', textAlign: 'center', marginTop: 8, letterSpacing: 0.5 }}>
              Nach Nutzung Kettenschloss wieder anbringen.
            </div>
          </div>
        )}

        <div style={{
          background: '#fff', border: `2px solid ${BK}`, borderLeft: `5px solid ${Y}`,
          borderRadius: 4, padding: 12, marginBottom: 14,
        }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: BK, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>
            ⚠ Sicherheit
          </div>
          {[
            'Niemals in die laufende Maschine fassen.',
            'Bei Nässe nicht verwenden.',
            'Nur drucklose Trainingsbälle.',
            'Maschine vorsichtig transportieren.',
            'Schloss nach Nutzung wieder anbringen.',
          ].map((t, i, arr) => (
            <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12.5, color: '#333', marginBottom: i < arr.length - 1 ? 5 : 0, lineHeight: 1.35 }}>
              <span style={{ color: BK, fontWeight: 900 }}>›</span>
              <span>{t}</span>
            </div>
          ))}
        </div>

        </div>{/* end zIndex wrapper */}
      </div>
    )
  }

  // ── Form ───────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '0 18px' }}>
      {onOpenNews && <NewsBanner onOpen={onOpenNews} />}
      <PeteHero kicker="Neue Session" title={<>Ab auf<br />den Platz.</>} peteHeight={130} compact />

      {err && (
        <div style={{ border: '2px solid #ff3b30', borderLeft: '5px solid #ff3b30', background: '#fff0ee', borderRadius: 4, padding: '10px 14px', marginBottom: 12, fontSize: 14 }}>
          {err}
        </div>
      )}

      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: '#fff', border: `2px solid ${BK}`, borderLeft: `5px solid ${Y}`,
        padding: '10px 12px', borderRadius: 4, marginBottom: 14,
      }}>
        <svg width="14" height="16" viewBox="0 0 14 16" fill="none" aria-hidden="true">
          <rect x="1.5" y="7" width="11" height="8" rx="1.5" stroke={BK} strokeWidth="1.8" />
          <path d="M4 7V5a3 3 0 016 0v2" stroke={BK} strokeWidth="1.8" />
        </svg>
        <span style={{ fontSize: 12, color: '#333' }}>Der Schloss-Code erscheint nach dem Check-in.</span>
      </div>

      <div style={{ marginBottom: 12 }}>
        <FieldLabel>Datum</FieldLabel>
        <div style={{ border: `2px solid ${BK}`, borderRadius: 4, background: '#fff', padding: '0 12px', marginBottom: 10 }}>
          <input type="date" value={date} min={minDate} max={today} onChange={e => setDate(e.target.value)}
            style={{ display: 'block', width: '100%', border: 'none', outline: 'none', padding: '10px 0', fontSize: 16, fontFamily: 'inherit', background: 'transparent', color: BK }} />
        </div>
        <FieldLabel>Uhrzeit</FieldLabel>
        <div style={{ border: `2px solid ${BK}`, borderRadius: 4, background: '#fff', padding: '0 12px' }}>
          <input type="time" value={time} onChange={e => setTime(e.target.value)}
            style={{ display: 'block', width: '100%', border: 'none', outline: 'none', padding: '10px 0', fontSize: 16, fontFamily: 'inherit', background: 'transparent', color: BK }} />
        </div>
      </div>

      <FieldLabel>Dauer</FieldLabel>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {[30, 45, 60, 90, 120].map(d => {
          const on = d === dur
          return (
            <button
              key={d}
              type="button"
              onClick={() => setDur(d)}
              style={{
                flex: 1, padding: '10px 0', textAlign: 'center', borderRadius: 4,
                background: on ? Y : '#fff', color: BK,
                border: `2px solid ${BK}`, cursor: 'pointer', fontFamily: 'inherit',
                fontWeight: 900, fontSize: 14, letterSpacing: 0.3,
                boxShadow: on ? `2px 2px 0 ${BK}` : 'none',
              }}
            >
              {d}<span style={{ fontSize: 9, opacity: 0.6, marginLeft: 2 }}>MIN</span>
            </button>
          )
        })}
      </div>
      <select
        value={dur}
        onChange={e => setDur(Number(e.target.value))}
        style={{ marginBottom: 12, width: '100%', border: `2px solid ${BK}`, borderRadius: 4, padding: '10px 12px', fontSize: 14, fontFamily: 'inherit', background: '#fff' }}
      >
        {[30, 45, 60, 75, 90, 120, 150, 180].map(d => (
          <option key={d} value={d}>{d} Min. ({Math.ceil(d / 60)} Std. → {calcCost(d)} €)</option>
        ))}
      </select>

      <FieldLabel>Notiz (optional)</FieldLabel>
      <Input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="z.B. Einzel, Training, Aufschlag…" />

      <div style={{
        marginTop: 14, background: Y, border: `2px solid ${BK}`, borderRadius: 6,
        padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: `3px 3px 0 ${BK}`,
      }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, color: BK, textTransform: 'uppercase', letterSpacing: 1.5 }}>Kosten · 5 € / Std.</div>
          <div style={{ fontSize: 11, color: BK, opacity: 0.7, marginTop: 1 }}>{Math.ceil(dur / 60)} Std. · angefangen</div>
        </div>
        <div style={{
          fontFamily: 'ui-monospace, "JetBrains Mono", Menlo, monospace',
          fontSize: 38, fontWeight: 900, color: BK, lineHeight: 1, letterSpacing: -1,
        }}>{cost} €</div>
      </div>

      <div style={{ marginTop: 14 }}>
        <PrimaryBtn onClick={doCheckin} disabled={loading}>
          {loading ? 'Wird gespeichert…' : 'Jetzt einchecken →'}
        </PrimaryBtn>
      </div>
    </div>
  )
}
