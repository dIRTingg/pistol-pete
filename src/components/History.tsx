'use client'
// src/components/History.tsx
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { calcCost, formatDate, formatTime } from '@/lib/helpers'
import type { Profile, Session, CorrectionRequest } from '@/lib/supabase/types'

const Y = '#FFE600'; const BK = '#111'
const badge = (bg: string): React.CSSProperties => ({ background: bg, color: (bg === Y || bg === '#fff') ? BK : '#fff', borderRadius: 4, padding: '3px 9px', fontSize: 12, fontWeight: 700, display: 'inline-block', border: `1.5px solid ${BK}` })
const inp: React.CSSProperties = { width: '100%', border: `2px solid ${BK}`, borderRadius: 4, padding: '10px 12px', fontSize: 16, background: '#fff', boxSizing: 'border-box' }

export default function History({ profile, refreshKey }: { profile: Profile; refreshKey: number }) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [pendingMap, setPendingMap] = useState<Record<string, CorrectionRequest>>({})
  const [loading, setLoading] = useState(true)
  const [corrForm, setCorrForm] = useState<Session | null>(null)
  const [corrDur, setCorrDur] = useState(60)
  const [corrNote, setCorrNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async () => {
    const supabase = createClient()
    setLoading(true)
    const [{ data: sessData }, { data: corrData }] = await Promise.all([
      supabase.from('sessions').select('*').eq('user_id', profile.id).order('start_at', { ascending: false }),
      supabase.from('correction_requests').select('*').eq('user_id', profile.id).eq('status', 'pending'),
    ])
    setSessions(sessData || [])
    const pm: Record<string, CorrectionRequest> = {}
    ;(corrData || []).forEach(c => { pm[c.session_id] = c })
    setPendingMap(pm)
    setLoading(false)
  }, [profile.id])

  useEffect(() => { load() }, [load, refreshKey])

  const submitCorr = async () => {
    if (!corrForm) return
    setSubmitting(true)
    const supabase = createClient()
    await supabase.from('correction_requests').insert({
      session_id: corrForm.id,
      user_id: profile.id,
      user_name: profile.name,
      requested_duration: corrDur,
      note: corrNote || null,
    })
    setCorrForm(null)
    setSubmitting(false)
    load()
  }

  // Nur bestätigte (nicht stornierte) Sessions für die Summe
  const activeSessions = sessions.filter(s => s.status !== 'cancelled')
  const total = activeSessions.reduce((a, s) => a + Number(s.cost), 0)
  const totalMin = activeSessions.reduce((a, s) => a + s.duration_min, 0)

  if (loading) return <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>⏳ Lade Daten...</div>

  return (
    <div>
      {/* Summary */}
      <div style={{ background: '#fff', border: `2px solid ${BK}`, borderRadius: 8, marginBottom: 16, overflow: 'hidden' }}>
        <div style={{ background: Y, borderBottom: `2px solid ${BK}`, padding: '12px 20px', fontWeight: 900, fontSize: 18, textTransform: 'uppercase', letterSpacing: 1 }}>
          📋 Meine Nutzungshistorie
        </div>
        <div style={{ padding: 20, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          {[
            [activeSessions.length, 'Sessions', '#f8f8f8'],
            [`${totalMin} Min`, 'Gesamt', '#f8f8f8'],
            [`${total.toFixed(2)} €`, 'Kosten', Y]
          ].map(([v, k, bg]) => (
            <div key={String(k)} style={{ textAlign: 'center', background: String(bg), border: bg === Y ? `2px solid ${BK}` : 'none', borderRadius: 6, padding: 14 }}>
              <div style={{ fontSize: 26, fontWeight: 900 }}>{v}</div>
              <div style={{ fontSize: 11, textTransform: 'uppercase', color: '#555' }}>{k}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Correction Form */}
      {corrForm && (
        <div style={{ background: '#fff', border: `2px solid #ff9f0a`, borderRadius: 8, marginBottom: 16, overflow: 'hidden' }}>
          <div style={{ background: '#ff9f0a', borderBottom: `2px solid ${BK}`, padding: '12px 20px', fontWeight: 900, fontSize: 18, textTransform: 'uppercase', letterSpacing: 1 }}>✏️ Korrektur beantragen</div>
          <div style={{ padding: 20 }}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: 13, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Korrigierte Dauer</label>
              <select style={{ ...inp }} value={corrDur} onChange={e => setCorrDur(Number(e.target.value))}>
                <option value={0}>Stornieren (versehentlich eingecheckt)</option>
                {[15, 30, 45, 60, 75, 90, 120, 150, 180].map(d => <option key={d} value={d}>{d} Min. → {calcCost(d)} €</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: 13, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Begründung</label>
              <input style={inp} value={corrNote} onChange={e => setCorrNote(e.target.value)} placeholder="z.B. versehentlich eingecheckt, Regen, etc." />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={submitCorr} disabled={submitting} style={{ background: '#34c759', color: '#fff', border: `2px solid ${BK}`, borderRadius: 4, padding: '6px 12px', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                {submitting ? '⏳...' : '✅ Anfrage senden'}
              </button>
              <button onClick={() => setCorrForm(null)} style={{ background: '#fff', color: BK, border: `2px solid ${BK}`, borderRadius: 4, padding: '6px 12px', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>❌ Abbrechen</button>
            </div>
          </div>
        </div>
      )}

      {/* Sessions Table */}
      {sessions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>
          <img src="/icons/pete.png" alt="Pete" style={{ height: 80, opacity: 0.4, marginBottom: 12 }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          <p>Noch keine Nutzungen erfasst. Los geht's!</p>
        </div>
      ) : (
        <div style={{ background: '#fff', border: `2px solid ${BK}`, borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr>
                  {['Datum', 'Zeit', 'Dauer', 'Kosten', 'Status', ''].map(h => (
                    <th key={h} style={{ background: BK, color: Y, padding: '8px 12px', textAlign: 'left', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sessions.map(s => {
                  const hasPending = !!pendingMap[s.id]
                  const isCancelled = s.status === 'cancelled'
                  return (
                    <tr key={s.id} style={{ background: isCancelled ? '#fff8f8' : '#fff' }}>
                      <td style={{ padding: '10px 12px', borderBottom: '1px solid #eee', textDecoration: isCancelled ? 'line-through' : 'none', color: isCancelled ? '#aaa' : BK }}>{formatDate(s.start_at)}</td>
                      <td style={{ padding: '10px 12px', borderBottom: '1px solid #eee', textDecoration: isCancelled ? 'line-through' : 'none', color: isCancelled ? '#aaa' : BK }}>{formatTime(s.start_at)}</td>
                      <td style={{ padding: '10px 12px', borderBottom: '1px solid #eee', color: isCancelled ? '#aaa' : BK }}>
                        {isCancelled ? <s>{s.duration_min} Min.</s> : `${s.duration_min} Min.`}
                      </td>
                      <td style={{ padding: '10px 12px', borderBottom: '1px solid #eee' }}>
                        <strong style={{ color: isCancelled ? '#aaa' : BK }}>
                          {isCancelled ? '0,00 €' : `${Number(s.cost).toFixed(2)} €`}
                        </strong>
                      </td>
                      <td style={{ padding: '10px 12px', borderBottom: '1px solid #eee' }}>
                        <span style={badge(isCancelled ? '#ff3b30' : '#34c759')}>
                          {isCancelled ? 'Storniert' : 'OK'}
                        </span>
                        {hasPending && <span style={{ ...badge('#ff9f0a'), marginLeft: 4 }}>⏳ Korrektur</span>}
                      </td>
                      <td style={{ padding: '10px 12px', borderBottom: '1px solid #eee' }}>
                        {!isCancelled && !hasPending && !corrForm && (
                          <button onClick={() => { setCorrForm(s); setCorrDur(s.duration_min); setCorrNote('') }}
                            style={{ background: '#fff', color: BK, border: `2px solid ${BK}`, borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontWeight: 700, fontSize: 12 }}>
                            ✏️ Korrektur
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              {/* Summenzeile */}
              <tfoot>
                <tr style={{ background: Y }}>
                  <td colSpan={2} style={{ padding: '10px 12px', fontWeight: 900, fontSize: 13, textTransform: 'uppercase' }}>Gesamt</td>
                  <td style={{ padding: '10px 12px', fontWeight: 900 }}>{totalMin} Min.</td>
                  <td style={{ padding: '10px 12px', fontWeight: 900 }}>{total.toFixed(2)} €</td>
                  <td colSpan={2} style={{ padding: '10px 12px', fontSize: 12, color: '#555' }}>
                    {sessions.filter(s => s.status === 'cancelled').length > 0 &&
                      `(${sessions.filter(s => s.status === 'cancelled').length} storniert)`}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
