'use client'
// src/components/Admin.tsx
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { calcCost, formatDate, formatTime } from '@/lib/helpers'
import type { Session, CorrectionRequest, Profile } from '@/lib/supabase/types'

const Y = '#FFE600'; const BK = '#111'
const badge = (bg: string): React.CSSProperties => ({ background: bg, color: (bg === Y || bg === '#fff') ? BK : '#fff', borderRadius: 4, padding: '3px 9px', fontSize: 12, fontWeight: 700, display: 'inline-block', border: `1.5px solid ${BK}` })
const inp: React.CSSProperties = { width: '100%', border: `2px solid ${BK}`, borderRadius: 4, padding: '8px 10px', fontSize: 14, background: '#fff', boxSizing: 'border-box' }

type CorrWithSession = CorrectionRequest & { sessions: Session | null }

export default function Admin({ refreshKey }: { refreshKey: number }) {
  const [tab, setTab] = useState<'corrections' | 'sessions' | 'users'>('corrections')
  const [corrections, setCorrections] = useState<CorrWithSession[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [newU, setNewU] = useState({ name: '', email: '', password: '' })
  const [msg, setMsg] = useState('')
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const supabase = createClient()
      const [{ data: corr }, { data: sess }, { data: prof }] = await Promise.all([
        supabase.from('correction_requests').select('*, sessions(*)').order('created_at', { ascending: false }),
        supabase.from('sessions').select('*').order('start_at', { ascending: false }),
        supabase.from('profiles').select('*').order('name'),
      ])
      setCorrections((corr as CorrWithSession[]) || [])
      setSessions(sess || [])
      setUsers(prof || [])
      setLoading(false)
    }
    load()
  }, [tick, refreshKey])

  const resolveCorr = async (id: string, approve: boolean) => {
    const supabase = createClient()
    const corr = corrections.find(c => c.id === id)
    if (!corr) return

    await supabase.from('correction_requests').update({
      status: approve ? 'approved' : 'rejected',
      resolved_at: new Date().toISOString(),
    }).eq('id', id)

    if (approve) {
      await supabase.from('sessions').update({
        duration_min: corr.requested_duration,
        cost: calcCost(corr.requested_duration),
        status: corr.requested_duration === 0 ? 'cancelled' : 'confirmed',
      }).eq('id', corr.session_id)
    }
    setTick(t => t + 1)
  }

  const addUser = async () => {
    if (!newU.name || !newU.email || !newU.password) { setMsg('❌ Alle Felder ausfüllen.'); return }
    const supabase = createClient()

    // Supabase Admin API ist clientseitig nicht verfügbar.
    // Nutzer müssen über das Supabase Dashboard angelegt werden.
    // Alternativ: eigene API Route /api/users/create (Server-seitig mit service_role key)
    setMsg('ℹ️ Neue Nutzer über Supabase Dashboard anlegen: Authentication → Users → Invite user')
  }

  const pending = corrections.filter(c => c.status === 'pending')
  const resolved = corrections.filter(c => c.status !== 'pending')

  const TabBtn = ({ id, label, badge: b = 0 }: { id: typeof tab; label: string; badge?: number }) => (
    <button onClick={() => setTab(id)} style={{
      padding: '8px 18px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 14,
      border: `2px solid ${BK}`, borderBottom: tab === id ? '2px solid #fff' : `2px solid ${BK}`,
      background: tab === id ? '#fff' : Y, borderRadius: '4px 4px 0 0', marginRight: 4,
      position: 'relative', bottom: -2, color: BK,
    }}>
      {label} {b > 0 && <span style={{ background: '#ff3b30', color: '#fff', borderRadius: 10, padding: '1px 6px', marginLeft: 4, fontSize: 11 }}>{b}</span>}
    </button>
  )

  if (loading) return <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>⏳ Lade Daten...</div>

  return (
    <div style={{ background: '#fff', border: `2px solid ${BK}`, borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: Y, borderBottom: `2px solid ${BK}`, padding: '12px 20px', fontWeight: 900, fontSize: 18, textTransform: 'uppercase', letterSpacing: 1 }}>
        🛡️ Admin-Bereich
      </div>
      <div style={{ borderBottom: `2px solid ${BK}`, padding: '0 16px', background: Y }}>
        <TabBtn id="corrections" label="Korrekturen" badge={pending.length} />
        <TabBtn id="sessions" label="Alle Sessions" />
        <TabBtn id="users" label="Nutzer" />
      </div>
      <div style={{ padding: 20 }}>

        {/* ── CORRECTIONS ── */}
        {tab === 'corrections' && <>
          <p style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, fontSize: 13, margin: '0 0 14px' }}>Offene Anfragen ({pending.length})</p>
          {pending.length === 0 && <p style={{ color: '#888' }}>Keine offenen Korrekturen. 👍</p>}
          {pending.map(c => {
            const s = c.sessions
            return (
              <div key={c.id} style={{ border: '2px solid #ff9f0a', borderRadius: 6, padding: 16, marginBottom: 12, background: '#fff9e6' }}>
                <strong>{c.user_name}</strong>
                <div style={{ fontSize: 13, color: '#555', margin: '6px 0 10px', lineHeight: 1.7 }}>
                  Session: {s ? `${formatDate(s.start_at)} ${formatTime(s.start_at)} · ${s.duration_min} Min. · ${s.cost} €` : '–'}<br />
                  Gewünschte Dauer: <strong>{c.requested_duration === 0 ? '🗑 Stornieren' : `${c.requested_duration} Min. (${calcCost(c.requested_duration)} €)`}</strong><br />
                  Begründung: {c.note || '–'}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => resolveCorr(c.id, true)} style={{ background: '#34c759', color: '#fff', border: `2px solid ${BK}`, borderRadius: 4, padding: '6px 12px', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>✅ Genehmigen</button>
                  <button onClick={() => resolveCorr(c.id, false)} style={{ background: '#ff3b30', color: '#fff', border: `2px solid ${BK}`, borderRadius: 4, padding: '6px 12px', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>❌ Ablehnen</button>
                </div>
              </div>
            )
          })}
          {resolved.length > 0 && <>
            <p style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: 12, color: '#888', margin: '20px 0 10px' }}>Erledigte Anfragen</p>
            {resolved.map(c => (
              <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #ddd', borderRadius: 6, padding: '10px 14px', marginBottom: 8 }}>
                <span style={{ fontSize: 13 }}>{c.user_name} — {c.requested_duration === 0 ? 'Stornierung' : `${c.requested_duration} Min.`}</span>
                <span style={badge(c.status === 'approved' ? '#34c759' : '#ff3b30')}>{c.status === 'approved' ? 'Genehmigt' : 'Abgelehnt'}</span>
              </div>
            ))}
          </>}
        </>}

        {/* ── SESSIONS ── */}
        {tab === 'sessions' && <>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead><tr>
                {['Mitglied', 'Datum', 'Zeit', 'Dauer', 'Kosten', 'Status'].map(h => (
                  <th key={h} style={{ background: BK, color: Y, padding: '8px 12px', textAlign: 'left', fontWeight: 700, fontSize: 12, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {sessions.map(s => (
                  <tr key={s.id}>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid #eee' }}>{s.user_name}</td>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid #eee' }}>{formatDate(s.start_at)}</td>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid #eee' }}>{formatTime(s.start_at)}</td>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid #eee' }}>{s.duration_min} Min.</td>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid #eee' }}>{s.cost} €</td>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid #eee' }}><span style={badge(s.status === 'confirmed' ? '#34c759' : '#ff3b30')}>{s.status === 'confirmed' ? 'OK' : 'Storniert'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {sessions.length === 0 && <p style={{ textAlign: 'center', color: '#888', padding: 20 }}>Noch keine Sessions.</p>}
          </div>
          <div style={{ marginTop: 14, background: Y, border: `2px solid ${BK}`, borderRadius: 6, padding: '12px 16px', display: 'flex', justifyContent: 'space-between' }}>
            <strong>Gesamt (bestätigte Sessions)</strong>
            <strong>{sessions.filter(s => s.status !== 'cancelled').reduce((a, s) => a + Number(s.cost), 0).toFixed(2)} €</strong>
          </div>
        </>}

        {/* ── USERS ── */}
        {tab === 'users' && <>
          <div style={{ background: '#f0f4ff', border: `2px solid ${BK}`, borderLeft: `5px solid ${BK}`, borderRadius: 6, padding: 16, marginBottom: 20, fontSize: 14 }}>
            <strong>Neue Nutzer anlegen:</strong> Supabase Dashboard → Authentication → Users → <em>Invite user</em><br />
            Danach Rolle setzen: Supabase Dashboard → Table Editor → profiles → Rolle auf <code>admin</code> oder <code>member</code> setzen.
          </div>
          <p style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: 13, letterSpacing: 1, margin: '0 0 12px' }}>Aktive Nutzer ({users.length})</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead><tr>
              {['Name', 'Rolle', 'Seit'].map(h => (
                <th key={h} style={{ background: BK, color: Y, padding: '8px 12px', textAlign: 'left', fontWeight: 700, fontSize: 12, textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid #eee' }}>{u.name}</td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid #eee' }}><span style={badge(u.role === 'admin' ? BK : '#34c759')}>{u.role === 'admin' ? 'Admin' : 'Mitglied'}</span></td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid #eee', fontSize: 12, color: '#888' }}>{formatDate(u.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>}
      </div>
    </div>
  )
}
