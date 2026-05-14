'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { calcCost, formatDate, formatTime } from '@/lib/helpers'
import type { Profile, Session, CorrectionRequest } from '@/lib/supabase/types'

const Y  = '#FFE600'
const BK = '#111'

// ── atoms ────────────────────────────────────────────────────────────────
function PeteHero({ kicker, title, sub, peteHeight = 120 }: {
  kicker?: string; title: React.ReactNode; sub?: string; peteHeight?: number;
}) {
  return (
    <div style={{
      background: Y, border: `3px solid ${BK}`, borderRadius: 12,
      position: 'relative', overflow: 'hidden',
      padding: '14px 16px 0',
      boxShadow: `4px 4px 0 ${BK}`, marginBottom: 14,
    }}>
      <div style={{ position: 'absolute', inset: 0, background: `repeating-linear-gradient(135deg, transparent 0 18px, rgba(0,0,0,0.04) 18px 19px)`, pointerEvents: 'none' }} />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div style={{ flex: 1, paddingBottom: 12 }}>
          {kicker && <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 2 }}>{kicker}</div>}
          <div style={{ fontWeight: 900, fontSize: 28, letterSpacing: 1.5, lineHeight: 0.95, textTransform: 'uppercase' }}>{title}</div>
          {sub && <div style={{ marginTop: 8, fontSize: 11, fontWeight: 700, color: BK, opacity: 0.75 }}>{sub}</div>}
        </div>
        <img src="/icons/pete.png" alt="" style={{ height: peteHeight, marginRight: -8, marginBottom: -2, filter: 'drop-shadow(3px 5px 0 rgba(0,0,0,0.15))', flexShrink: 0 }} />
      </div>
    </div>
  )
}

const monoStyle: React.CSSProperties = {
  fontFamily: 'ui-monospace, "JetBrains Mono", Menlo, monospace',
}

function StatusPill({ children, color, fg = '#fff' }: { children: React.ReactNode; color: string; fg?: string }) {
  return (
    <span style={{
      background: color, color: fg, fontSize: 9, fontWeight: 900,
      padding: '3px 6px', borderRadius: 3, letterSpacing: 1, textTransform: 'uppercase',
      display: 'inline-block', whiteSpace: 'nowrap',
    }}>{children}</span>
  )
}

// ── component ────────────────────────────────────────────────────────────
export default function History({ profile, refreshKey }: { profile: Profile; refreshKey: number }) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [corrMap, setCorrMap] = useState<Record<string, CorrectionRequest>>({})
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
      supabase.from('correction_requests').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }),
    ])
    setSessions(sessData || [])
    const cm: Record<string, CorrectionRequest> = {}
    ;(corrData || []).forEach(c => { if (!cm[c.session_id]) cm[c.session_id] = c })
    setCorrMap(cm)
    setLoading(false)
  }, [profile.id])

  useEffect(() => { load() }, [load, refreshKey])
  useEffect(() => { const t = setInterval(load, 15000); return () => clearInterval(t) }, [load])

  const submitCorr = async () => {
    if (!corrForm) return
    setSubmitting(true)
    const supabase = createClient()
    await supabase.from('correction_requests').insert({
      session_id: corrForm.id, user_id: profile.id,
      user_name: profile.name, requested_duration: corrDur,
      note: corrNote || null,
    })
    setCorrForm(null); setSubmitting(false); load()
  }

  const activeSessions = sessions.filter(s => s.status !== 'cancelled')
  const totalCost = activeSessions.reduce((a, s) => a + Number(s.cost), 0)
  const totalMin = activeSessions.reduce((a, s) => a + s.duration_min, 0)
  const cancelledCount = sessions.filter(s => s.status === 'cancelled').length

  if (loading) return <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>Lade…</div>

  return (
    <div style={{ padding: '0 18px' }}>
      <PeteHero kicker="Mein Konto" title={<>Historie</>} sub={`${activeSessions.length} Sessions · Saison 2026`} peteHeight={100} />

      {/* Stat strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 14 }}>
        {[
          [activeSessions.length, 'Sessions', '#fff'],
          [`${totalMin}`, 'Minuten', '#fff'],
          [`${totalCost.toFixed(2)} €`, 'Kosten', Y],
        ].map(([v, k, bg], i) => (
          <div key={i} style={{
            background: bg as string,
            border: `2px solid ${BK}`,
            borderRadius: 6, padding: '10px 12px',
            boxShadow: bg === Y ? `3px 3px 0 ${BK}` : 'none',
          }}>
            <div style={{ ...monoStyle, fontSize: 20, fontWeight: 900, color: BK, lineHeight: 1, letterSpacing: -0.5 }}>{v}</div>
            <div style={{ fontSize: 9, fontWeight: 800, color: bg === Y ? BK : '#666', letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 4 }}>{k}</div>
          </div>
        ))}
      </div>

      {/* Korrektur-Formular */}
      {corrForm && (
        <div style={{
          background: '#fff9e6', border: `2px solid #ff9f0a`,
          borderRadius: 6, padding: 14, marginBottom: 14,
        }}>
          <div style={{ fontSize: 12, fontWeight: 900, color: BK, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>
            ✏ Korrektur beantragen
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: 'block', fontWeight: 800, fontSize: 11, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1.2, color: '#444' }}>
              Korrigierte Dauer
            </label>
            <select
              value={corrDur} onChange={e => setCorrDur(Number(e.target.value))}
              style={{ width: '100%', border: `2px solid ${BK}`, borderRadius: 4, padding: '10px 12px', fontSize: 15, fontFamily: 'inherit', background: '#fff' }}
            >
              <option value={0}>Stornieren (versehentlich eingecheckt)</option>
              {[15, 30, 45, 60, 75, 90, 120, 150, 180].map(d => (
                <option key={d} value={d}>{d} Min. → {calcCost(d)} €</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontWeight: 800, fontSize: 11, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1.2, color: '#444' }}>
              Begründung
            </label>
            <input
              value={corrNote} onChange={e => setCorrNote(e.target.value)}
              placeholder="z.B. versehentlich eingecheckt, Regen…"
              style={{ width: '100%', boxSizing: 'border-box', border: `2px solid ${BK}`, borderRadius: 4, padding: '10px 12px', fontSize: 15, fontFamily: 'inherit', background: '#fff' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={submitCorr} disabled={submitting}
              style={{
                flex: 1, background: '#34c759', color: '#fff', border: `2px solid #34c759`,
                borderRadius: 4, padding: '10px 16px', cursor: 'pointer',
                fontWeight: 900, fontSize: 13, fontFamily: 'inherit',
                letterSpacing: 1, textTransform: 'uppercase',
              }}
            >
              {submitting ? '…' : '✓ Senden'}
            </button>
            <button
              onClick={() => setCorrForm(null)}
              style={{
                flex: 1, background: '#fff', color: BK, border: `2px solid ${BK}`,
                borderRadius: 4, padding: '10px 16px', cursor: 'pointer',
                fontWeight: 800, fontSize: 13, fontFamily: 'inherit',
                letterSpacing: 1, textTransform: 'uppercase',
              }}
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {sessions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>
          <img
            src="/icons/pete.png" alt=""
            style={{ height: 80, opacity: 0.4, marginBottom: 12 }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          <p style={{ margin: 0, fontSize: 14 }}>Noch keine Nutzungen erfasst. Los geht's!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
          {sessions.map(s => {
            const corr = corrMap[s.id]
            const cancelled = s.status === 'cancelled'
            const pending   = corr?.status === 'pending'
            const approved  = corr?.status === 'approved'
            const rejected  = corr?.status === 'rejected'

            return (
              <div key={s.id} style={{
                background: '#fff',
                border: `2px solid ${BK}`,
                borderLeft: `5px solid ${cancelled ? '#999' : pending ? '#ff9f0a' : Y}`,
                borderRadius: 4, padding: '10px 12px',
                display: 'flex', alignItems: 'center', gap: 10,
                opacity: cancelled ? 0.55 : 1,
              }}>
                <div style={{ textAlign: 'center', minWidth: 50 }}>
                  <div style={{ ...monoStyle, fontSize: 14, fontWeight: 900, color: BK, lineHeight: 1, letterSpacing: -0.5 }}>{formatDate(s.start_at)}</div>
                  <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>{formatTime(s.start_at)}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 900, color: BK, textDecoration: cancelled ? 'line-through' : 'none' }}>
                      {s.duration_min} Min
                    </span>
                    <span style={{ fontSize: 11, color: '#999' }}>·</span>
                    <span style={{ ...monoStyle, fontSize: 13, fontWeight: 800, color: BK }}>
                      {cancelled ? '0,00 €' : `${Number(s.cost).toFixed(2)} €`}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                    <StatusPill color={cancelled ? '#ff3b30' : '#34c759'}>
                      {cancelled ? 'Storniert' : 'OK'}
                    </StatusPill>
                    {pending  && <StatusPill color="#ff9f0a">⏳ Ausstehend</StatusPill>}
                    {approved && <StatusPill color="#0a84ff">✓ Korrigiert</StatusPill>}
                    {rejected && <StatusPill color="#8e8e93">✗ Abgelehnt</StatusPill>}
                  </div>
                </div>
                {!cancelled && !pending && !corrForm && (
                  <button
                    onClick={() => { setCorrForm(s); setCorrDur(s.duration_min); setCorrNote('') }}
                    style={{
                      background: 'transparent', color: BK, border: `1.5px solid ${BK}`,
                      borderRadius: 3, padding: '5px 9px', cursor: 'pointer',
                      fontWeight: 800, fontSize: 10, fontFamily: 'inherit',
                      letterSpacing: 1, textTransform: 'uppercase', whiteSpace: 'nowrap',
                    }}
                  >
                    ✏ Korr.
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Summary footer */}
      {sessions.length > 0 && (
        <div style={{
          background: Y, border: `2px solid ${BK}`, borderRadius: 6,
          padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          boxShadow: `3px 3px 0 ${BK}`,
        }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5 }}>Gesamt</div>
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 1 }}>
              <span style={{ ...monoStyle, fontWeight: 800 }}>{totalMin} Min</span>
              {cancelledCount > 0 && ` · ${cancelledCount} storniert`}
            </div>
          </div>
          <div style={{ ...monoStyle, fontSize: 28, fontWeight: 900, color: BK, lineHeight: 1, letterSpacing: -1 }}>
            {totalCost.toFixed(2)} €
          </div>
        </div>
      )}
    </div>
  )
}
