'use client'
// src/components/CheckIn.tsx
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { calcCost, formatDate, formatTime } from '@/lib/helpers'
import type { Profile } from '@/lib/supabase/types'

const Y = '#FFE600'; const BK = '#111'
const inp: React.CSSProperties = { width: '100%', border: `2px solid ${BK}`, borderRadius: 4, padding: '10px 12px', fontSize: 16, background: '#fff', boxSizing: 'border-box' }
const lbl: React.CSSProperties = { display: 'block', fontWeight: 700, fontSize: 13, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 }

export default function CheckIn({ profile, onCheckedIn }: { profile: Profile; onCheckedIn: () => void }) {
  const now = new Date()
  const today = now.toISOString().slice(0, 10)
  const minDate = `${now.getFullYear()}-01-01`
  const [date, setDate] = useState(today)
  const [time, setTime] = useState(now.toTimeString().slice(0, 5))
  const [dur, setDur] = useState(60)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [done, setDone] = useState<{ startAt: string; durationMin: number; cost: number } | null>(null)

  const cost = calcCost(dur)

  const doCheckin = async () => {
    setLoading(true); setErr('')
    const supabase = createClient()
    const startAt = new Date(`${date}T${time}:00`).toISOString()
    const { error } = await supabase.from('sessions').insert({
      user_id: profile.id,
      user_name: profile.name,
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

  if (done) return (
    <div style={{ background: '#fff', border: `2px solid #34c759`, borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
      <div style={{ background: '#34c759', borderBottom: `2px solid ${BK}`, padding: '12px 20px', fontWeight: 900, fontSize: 18, textTransform: 'uppercase', letterSpacing: 1 }}>
        ✅ Check-in erfolgreich!
      </div>
      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          {/* Pete freigestellt auf weißem Card-Hintergrund */}
          <img
            src="/icons/pete.png"
            alt="Pete"
            style={{ height: 80, width: 'auto', filter: 'drop-shadow(1px 2px 4px rgba(0,0,0,0.15))' }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          <p style={{ margin: 0, fontSize: 18, fontWeight: 700, lineHeight: 1.4 }}>
            Viel Spaß beim Training,<br /><span style={{ color: '#34c759' }}>{profile.name}</span>! 🎾
          </p>
        </div>
        <div style={{ background: '#f8f8f8', border: '1px solid #ddd', borderRadius: 6, padding: 16, marginBottom: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[['Datum', formatDate(done.startAt)], ['Uhrzeit', formatTime(done.startAt)], ['Dauer', `${done.durationMin} Min.`], ['Kosten', `${done.cost} €`]].map(([k, v]) => (
            <div key={k}><div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', marginBottom: 2 }}>{k}</div><strong>{v}</strong></div>
          ))}
        </div>
        {/* Sicherheitshinweise nach Check-in */}
        <div style={{ background: '#fffbea', border: `2px solid ${BK}`, borderLeft: `5px solid ${Y}`, borderRadius: 6, padding: '14px 16px', marginBottom: 16 }}>
          <div style={{ fontWeight: 900, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>⚠️ Sicherheitshinweise</div>
          {[
            'Niemals in die laufende Maschine fassen — Verletzungsgefahr!',
            'Benutzung nur nach Einweisung. Zahlencode vom Ballmaschinenwart erhalten.',
            'Bei Regen und Nässe darf die Maschine nicht verwendet werden.',
            'Nur die vorgesehenen drucklosen Bälle verwenden — keine eigenen beimischen.',
            'Maschine vorsichtig transportieren. Bei Stufen notfalls tragen.',
          ].map((hint, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13, marginBottom: i < 4 ? 7 : 0, lineHeight: 1.4 }}>
              <span style={{ flexShrink: 0, marginTop: 1 }}>•</span>
              <span>{hint}</span>
            </div>
          ))}
        </div>
        <button onClick={() => { setDone(null); setNote('') }} style={{ background: Y, color: BK, border: `2px solid ${BK}`, borderRadius: 4, padding: '11px 22px', cursor: 'pointer', fontWeight: 900, fontSize: 15 }}>
          ➕ Neuer Check-in
        </button>
      </div>
    </div>
  )

  return (
    <div>
      {/* Pete Banner – freigestellt, kein overflow:hidden */}
      <div style={{ background: Y, border: `2px solid ${BK}`, borderRadius: 8, marginBottom: 16, display: 'flex', alignItems: 'flex-end', minHeight: 100, position: 'relative' }}>
        <img
          src="/icons/pete.png"
          alt="Pete"
          style={{ height: 120, width: 'auto', marginBottom: -2, marginLeft: 12, filter: 'drop-shadow(1px 2px 6px rgba(0,0,0,0.2))', flexShrink: 0 }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
        <div style={{ padding: '16px 20px' }}>
          <div style={{ fontWeight: 900, fontSize: 22, textTransform: 'uppercase', letterSpacing: 1 }}>Check-in</div>
          <div style={{ fontSize: 14, marginTop: 2 }}>Erfasse deine Ballmaschinen-Nutzung</div>
        </div>
      </div>

      <div style={{ background: '#fff', border: `2px solid ${BK}`, borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ padding: 20 }}>
          {err && <div style={{ border: '2px solid #ff3b30', borderLeft: '5px solid #ff3b30', background: '#fff0ee', borderRadius: 4, padding: '10px 14px', marginBottom: 14, fontSize: 14 }}>{err}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div style={{ minWidth: 0 }}><label style={lbl}>Datum</label><input style={inp} type="date" value={date} min={minDate} max={today} onChange={e => setDate(e.target.value)} /></div>
            <div style={{ minWidth: 0 }}><label style={lbl}>Startzeit</label><input style={inp} type="time" value={time} onChange={e => setTime(e.target.value)} /></div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>Dauer</label>
            <select style={{ ...inp }} value={dur} onChange={e => setDur(Number(e.target.value))}>
              {[30, 45, 60, 75, 90, 120, 150, 180].map(d => (
                <option key={d} value={d}>{d} Min. ({Math.ceil(d / 60)} Std. → {calcCost(d)} €)</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>Notiz (optional)</label>
            <input style={inp} type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="z.B. Einzel, Training, etc." />
          </div>
          <div style={{ background: Y, border: `2px solid ${BK}`, borderRadius: 6, padding: '12px 16px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: 16 }}>Kosten (5 € / angef. Std.)</span>
            <span style={{ fontWeight: 900, fontSize: 28 }}>{cost} €</span>
          </div>
          <button onClick={doCheckin} disabled={loading} style={{ background: Y, color: BK, border: `2px solid ${BK}`, borderRadius: 4, padding: '14px 24px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 900, fontSize: 18, width: '100%', opacity: loading ? 0.7 : 1 }}>
            {loading ? '⏳ Wird gespeichert...' : '✅ Jetzt einchecken'}
          </button>
        </div>
      </div>
    </div>
  )
}
