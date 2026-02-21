'use client'
// src/components/History.tsx
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { calcCost, formatDate, formatTime } from '@/lib/helpers'
import type { Profile, Session, CorrectionRequest } from '@/lib/supabase/types'

const Y = '#FFE600'; const BK = '#111'
const inp: React.CSSProperties = {
  width: '100%', border: `2px solid ${BK}`, borderRadius: 4,
  padding: '10px 12px', fontSize: 16, background: '#fff', boxSizing: 'border-box'
}

type StatusBadgeProps = { isCancelled: boolean; isPending: boolean; isApproved: boolean; isRejected: boolean }
function StatusBadges({ isCancelled, isPending, isApproved, isRejected }: StatusBadgeProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
      {/* Haupt-Status */}
      <span style={{
        background: isCancelled ? '#ff3b30' : '#34c759',
        color: '#fff', borderRadius: 4, padding: '3px 8px',
        fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap'
      }}>
        {isCancelled ? 'Storniert' : 'OK'}
      </span>
      {/* Korrektur-Status */}
      {isPending && (
        <span style={{ background: '#ff9f0a', color: '#fff', borderRadius: 4, padding: '3px 8px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
          ⏳ Ausstehend
        </span>
      )}
      {isApproved && (
        <span style={{ background: '#007aff', color: '#fff', borderRadius: 4, padding: '3px 8px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
          ✓ Korrigiert
        </span>
      )}
      {isRejected && (
        <span style={{ background: '#8e8e93', color: '#fff', borderRadius: 4, padding: '3px 8px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
          ✗ Abgelehnt
        </span>
      )}
    </div>
  )
}

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
  const total = activeSessions.reduce((a, s) => a + Number(s.cost), 0)
  const totalMin = activeSessions.reduce((a, s) => a + s.duration_min, 0)

  if (loading) return <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>⏳ Lade Daten...</div>

  return (
    <div>
      {/* Übersicht */}
      <div style={{ background: '#fff', border: `2px solid ${BK}`, borderRadius: 8, marginBottom: 16, overflow: 'hidden' }}>
        <div style={{ background: Y, borderBottom: `2px solid ${BK}`, padding: '12px 20px', fontWeight: 900, fontSize: 18, textTransform: 'uppercase', letterSpacing: 1 }}>
          📋 Meine Nutzungshistorie
        </div>
        <div style={{ padding: 20, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          {([
            [activeSessions.length, 'Sessions', '#f8f8f8'],
            [`${totalMin} Min`, 'Gesamt', '#f8f8f8'],
            [`${total.toFixed(2)} €`, 'Kosten', Y],
          ] as [string|number, string, string][]).map(([v, k, bg]) => (
            <div key={String(k)} style={{ textAlign: 'center', background: bg, border: bg === Y ? `2px solid ${BK}` : '1px solid #eee', borderRadius: 6, padding: 14 }}>
              <div style={{ fontSize: 22, fontWeight: 900 }}>{v}</div>
              <div style={{ fontSize: 11, textTransform: 'uppercase', color: '#555', marginTop: 2 }}>{k}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Korrektur-Formular */}
      {corrForm && (
        <div style={{ background: '#fff', border: `2px solid #ff9f0a`, borderRadius: 8, marginBottom: 16, overflow: 'hidden' }}>
          <div style={{ background: '#ff9f0a', borderBottom: `2px solid ${BK}`, padding: '12px 20px', fontWeight: 900, fontSize: 16, textTransform: 'uppercase' }}>
            ✏️ Korrektur beantragen
          </div>
          <div style={{ padding: 16 }}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: 12, marginBottom: 4, textTransform: 'uppercase' }}>Korrigierte Dauer</label>
              <select style={inp} value={corrDur} onChange={e => setCorrDur(Number(e.target.value))}>
                <option value={0}>Stornieren (versehentlich eingecheckt)</option>
                {[15,30,45,60,75,90,120,150,180].map(d =>
                  <option key={d} value={d}>{d} Min. → {calcCost(d)} €</option>
                )}
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: 12, marginBottom: 4, textTransform: 'uppercase' }}>Begründung</label>
              <input style={inp} value={corrNote} onChange={e => setCorrNote(e.target.value)} placeholder="z.B. versehentlich eingecheckt, Regen..." />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={submitCorr} disabled={submitting}
                style={{ background: '#34c759', color: '#fff', border: `2px solid ${BK}`, borderRadius: 4, padding: '8px 16px', cursor: 'pointer', fontWeight: 700, fontSize: 14, flex: 1 }}>
                {submitting ? '⏳...' : '✅ Senden'}
              </button>
              <button onClick={() => setCorrForm(null)}
                style={{ background: '#fff', color: BK, border: `2px solid ${BK}`, borderRadius: 4, padding: '8px 16px', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sessions — Karten-Layout statt Tabelle, kein horizontales Scrollen */}
      {sessions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>
          <img src="/icons/pete.png" alt="Pete" style={{ height: 80, opacity: 0.4, marginBottom: 12 }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          <p>Noch keine Nutzungen erfasst. Los geht's!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sessions.map(s => {
            const corr = corrMap[s.id]
            const isCancelled = s.status === 'cancelled'
            const isPending = corr?.status === 'pending'
            const isApproved = corr?.status === 'approved'
            const isRejected = corr?.status === 'rejected'

            return (
              <div key={s.id} style={{
                background: isCancelled ? '#fff8f8' : '#fff',
                border: `2px solid ${isCancelled ? '#ffcdd2' : isPending ? '#ff9f0a' : BK}`,
                borderRadius: 8, overflow: 'hidden'
              }}>
                {/* Kopfzeile: Datum + Zeit */}
                <div style={{ background: isCancelled ? '#ffcdd2' : BK, padding: '6px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: isCancelled ? '#c62828' : Y }}>
                    {formatDate(s.start_at)}
                  </span>
                  <span style={{ fontSize: 13, color: isCancelled ? '#c62828' : '#aaa' }}>
                    {formatTime(s.start_at)}
                  </span>
                </div>

                {/* Inhalt: Dauer | Kosten | Status | Aktion */}
                <div style={{ padding: '10px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8, alignItems: 'center' }}>
                  {/* Dauer + Kosten */}
                  <div>
                    <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', marginBottom: 2 }}>Dauer</div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: isCancelled ? '#aaa' : BK, textDecoration: isCancelled ? 'line-through' : 'none' }}>
                      {s.duration_min} Min.
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', marginBottom: 2 }}>Kosten</div>
                    <div style={{ fontWeight: 900, fontSize: 17, color: isCancelled ? '#aaa' : BK }}>
                      {isCancelled ? '0,00 €' : `${Number(s.cost).toFixed(2)} €`}
                    </div>
                  </div>

                  {/* Status + Korrektur-Button */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                    <StatusBadges isCancelled={isCancelled} isPending={isPending} isApproved={isApproved} isRejected={isRejected} />
                    {!isCancelled && !isPending && !corrForm && (
                      <button onClick={() => { setCorrForm(s); setCorrDur(s.duration_min); setCorrNote('') }}
                        style={{ background: '#fff', color: BK, border: `1.5px solid ${BK}`, borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontWeight: 700, fontSize: 12, marginTop: 2 }}>
                        ✏️ Korrektur
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          {/* Summenzeile */}
          <div style={{ background: Y, border: `2px solid ${BK}`, borderRadius: 8, padding: '12px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', marginBottom: 2 }}>Gesamt</div>
              <div style={{ fontWeight: 900, fontSize: 15 }}>{totalMin} Min.</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', marginBottom: 2 }}>Kosten</div>
              <div style={{ fontWeight: 900, fontSize: 17 }}>{total.toFixed(2)} €</div>
            </div>
            <div style={{ fontSize: 12, color: '#555', textAlign: 'right' }}>
              {sessions.filter(s => s.status === 'cancelled').length > 0 &&
                `${sessions.filter(s => s.status === 'cancelled').length} storniert`}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
