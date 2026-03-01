'use client'
// src/components/Admin.tsx
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { calcCost, formatDate, formatTime } from '@/lib/helpers'
import type { Session, CorrectionRequest, Profile } from '@/lib/supabase/types'

const Y = '#FFE600'; const BK = '#111'
const badge = (bg: string): React.CSSProperties => ({ background: bg, color: (bg === Y || bg === '#fff') ? BK : '#fff', borderRadius: 4, padding: '3px 9px', fontSize: 12, fontWeight: 700, display: 'inline-block', border: `1.5px solid ${BK}` })

type CorrWithSession = CorrectionRequest & { sessions: Session | null }

export default function Admin({ refreshKey }: { refreshKey: number }) {
  const [tab, setTab] = useState<'corrections' | 'sessions' | 'users' | 'settings'>('corrections')
  const [lockCode, setLockCode] = useState('')
  const [lockCodeSaving, setLockCodeSaving] = useState(false)
  const [lockCodeMsg, setLockCodeMsg] = useState('')
  const [corrections, setCorrections] = useState<CorrWithSession[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)
  const [resetConfirm, setResetConfirm] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [resetMsg, setResetMsg] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const supabase = createClient()
      const [{ data: corr }, { data: sess }, { data: prof }, codeData] = await Promise.all([
        supabase.from('correction_requests').select('*, sessions(*)').order('created_at', { ascending: false }),
        supabase.from('sessions').select('*').order('start_at', { ascending: false }),
        supabase.from('profiles').select('*').order('name'),
        supabase.from('settings').select('value').eq('id', 'lock_code').single(),
      ])
      setCorrections((corr as CorrWithSession[]) || [])
      setSessions(sess || [])
      setUsers(prof || [])
      if (codeData?.data) setLockCode(codeData.data.value ?? '')
      setLoading(false)
    }
    load()
  }, [tick, refreshKey])

  // ── Korrektur genehmigen / ablehnen ──────────────────────────────────────
  const resolveCorr = async (id: string, approve: boolean) => {
    const supabase = createClient()
    const { error } = await supabase.rpc('resolve_correction', {
      p_correction_id: id,
      p_approve: approve,
    })
    if (error) {
      alert('Fehler: ' + error.message)
      return
    }
    setTick(t => t + 1)
  }


  // ── CSV Export ────────────────────────────────────────────────────────────
  const exportCSV = () => {
    // Nur aktive (nicht stornierte) Sessions
    const active = sessions.filter(s => s.status !== 'cancelled')

    // Gruppieren nach Nutzer
    const byUser: Record<string, { name: string; count: number; minutes: number; cost: number }> = {}
    active.forEach(s => {
      if (!byUser[s.user_id]) {
        byUser[s.user_id] = { name: s.user_name, count: 0, minutes: 0, cost: 0 }
      }
      byUser[s.user_id].count += 1
      byUser[s.user_id].minutes += s.duration_min
      byUser[s.user_id].cost += Number(s.cost)
    })

    const rows = [
      ['Nutzer', 'Anzahl Nutzungen', 'Gesamtdauer (Min.)', 'Gesamtkosten (€)'],
      ...Object.values(byUser).map(u => [
        u.name,
        String(u.count),
        String(u.minutes),
        u.cost.toFixed(2).replace('.', ','),
      ]),
      // Summenzeile
      [
        'GESAMT',
        String(Object.values(byUser).reduce((a, u) => a + u.count, 0)),
        String(Object.values(byUser).reduce((a, u) => a + u.minutes, 0)),
        Object.values(byUser).reduce((a, u) => a + u.cost, 0).toFixed(2).replace('.', ','),
      ],
    ]

    const csv = rows.map(r => r.map(c => `"${c}"`).join(';')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pistol-pete-abrechnung-${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Alle Sessions zurücksetzen ────────────────────────────────────────────
  const doReset = async () => {
    setResetLoading(true)
    const supabase = createClient()
    // Alle Sessions und Korrekturen löschen
    await supabase.from('correction_requests').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('sessions').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    setResetLoading(false)
    setResetConfirm(false)
    setResetMsg(`✅ Reset durchgeführt am ${new Date().toLocaleDateString('de-DE')} – alle Buchungen gelöscht.`)
    setTick(t => t + 1)
  }

  const saveLockCode = async () => {
    const clean = lockCode.replace(/\D/g, '').slice(0, 4)
    if (clean.length !== 4) { setLockCodeMsg('Bitte genau 4 Ziffern eingeben.'); return }
    setLockCodeSaving(true)
    setLockCodeMsg('')
    const supabase = createClient()
    const { error } = await supabase.from('settings').upsert({ id: 'lock_code', value: clean })
    setLockCodeSaving(false)
    setLockCodeMsg(error ? '❌ Fehler: ' + error.message : '✅ Code gespeichert!')
    setLockCode(clean)
  }

  const pending = corrections.filter(c => c.status === 'pending')
  const resolved = corrections.filter(c => c.status !== 'pending')
  const activeSessions = sessions.filter(s => s.status !== 'cancelled')
  const totalCost = activeSessions.reduce((a, s) => a + Number(s.cost), 0)

  const TabBtn = ({ id, label, badgeCount = 0 }: { id: typeof tab; label: string; badgeCount?: number }) => (
    <button onClick={() => setTab(id)} style={{
      padding: '8px 18px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 14,
      border: `2px solid ${BK}`, borderBottom: tab === id ? '2px solid #fff' : `2px solid ${BK}`,
      background: tab === id ? '#fff' : Y, borderRadius: '4px 4px 0 0', marginRight: 4,
      position: 'relative', bottom: -2, color: BK,
    }}>
      {label} {badgeCount > 0 && <span style={{ background: '#ff3b30', color: '#fff', borderRadius: 10, padding: '1px 6px', marginLeft: 4, fontSize: 11 }}>{badgeCount}</span>}
    </button>
  )

  if (loading) return <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>⏳ Lade Daten...</div>

  return (
    <div style={{ background: '#fff', border: `2px solid ${BK}`, borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: Y, borderBottom: `2px solid ${BK}`, padding: '12px 20px', fontWeight: 900, fontSize: 18, textTransform: 'uppercase', letterSpacing: 1 }}>
        🛡️ Admin-Bereich
      </div>
      <div style={{ borderBottom: `2px solid ${BK}`, padding: '0 16px', background: Y }}>
        <TabBtn id="corrections" label="Korrekturen" badgeCount={pending.length} />
        <TabBtn id="sessions" label="Buchungen" />
        <TabBtn id="users" label="Nutzer" />
        <TabBtn id="settings" label="⚙️ Einstellungen" />
      </div>
      <div style={{ padding: 20 }}>

        {/* ── CORRECTIONS ── */}
        {tab === 'corrections' && <>
          <p style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, fontSize: 13, margin: '0 0 14px' }}>
            Offene Anfragen ({pending.length})
          </p>
          {pending.length === 0 && <p style={{ color: '#888' }}>Keine offenen Korrekturen. 👍</p>}
          {pending.map(c => {
            const s = c.sessions
            return (
              <div key={c.id} style={{ border: '2px solid #ff9f0a', borderRadius: 6, padding: 16, marginBottom: 12, background: '#fff9e6' }}>
                <strong>{c.user_name}</strong>
                <div style={{ fontSize: 13, color: '#555', margin: '6px 0 10px', lineHeight: 1.7 }}>
                  Session: {s ? `${formatDate(s.start_at)} ${formatTime(s.start_at)} · ${s.duration_min} Min. · ${Number(s.cost).toFixed(2)} €` : '–'}<br />
                  Gewünschte Änderung: <strong>{c.requested_duration === 0 ? '🗑 Stornieren (0 €)' : `${c.requested_duration} Min. → ${calcCost(c.requested_duration).toFixed(2)} €`}</strong><br />
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
          {/* Export + Reset Buttons */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            <button onClick={exportCSV} style={{ background: BK, color: Y, border: `2px solid ${BK}`, borderRadius: 4, padding: '9px 18px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              📥 CSV exportieren
            </button>
            {!resetConfirm ? (
              <button onClick={() => setResetConfirm(true)} style={{ background: '#fff', color: '#ff3b30', border: `2px solid #ff3b30`, borderRadius: 4, padding: '9px 18px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 14 }}>
                🗑 Abrechnung abgeschlossen – Reset
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff0ee', border: '2px solid #ff3b30', borderRadius: 6, padding: '8px 14px' }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>⚠️ Alle Buchungen unwiderruflich löschen?</span>
                <button onClick={doReset} disabled={resetLoading} style={{ background: '#ff3b30', color: '#fff', border: `2px solid ${BK}`, borderRadius: 4, padding: '5px 12px', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                  {resetLoading ? '⏳...' : 'Ja, löschen'}
                </button>
                <button onClick={() => setResetConfirm(false)} style={{ background: '#fff', color: BK, border: `2px solid ${BK}`, borderRadius: 4, padding: '5px 12px', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                  Abbrechen
                </button>
              </div>
            )}
          </div>
          {resetMsg && (
            <div style={{ border: '2px solid #34c759', borderLeft: '5px solid #34c759', background: '#f0fff4', borderRadius: 4, padding: '10px 14px', marginBottom: 14, fontSize: 14 }}>
              {resetMsg}
            </div>
          )}

          {/* Sessions Tabelle */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead><tr>
                {['Mitglied', 'Datum', 'Zeit', 'Dauer', 'Kosten', 'Status'].map(h => (
                  <th key={h} style={{ background: BK, color: Y, padding: '8px 12px', textAlign: 'left', fontWeight: 700, fontSize: 12, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {sessions.map(s => {
                  const isCancelled = s.status === 'cancelled'
                  return (
                    <tr key={s.id} style={{ background: isCancelled ? '#fff8f8' : '#fff' }}>
                      <td style={{ padding: '10px 12px', borderBottom: '1px solid #eee', color: isCancelled ? '#aaa' : BK }}>{s.user_name}</td>
                      <td style={{ padding: '10px 12px', borderBottom: '1px solid #eee', color: isCancelled ? '#aaa' : BK }}>{formatDate(s.start_at)}</td>
                      <td style={{ padding: '10px 12px', borderBottom: '1px solid #eee', color: isCancelled ? '#aaa' : BK }}>{formatTime(s.start_at)}</td>
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
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: Y }}>
                  <td colSpan={3} style={{ padding: '10px 12px', fontWeight: 900, textTransform: 'uppercase', fontSize: 13 }}>Gesamt (aktive Buchungen)</td>
                  <td style={{ padding: '10px 12px', fontWeight: 900 }}>{activeSessions.reduce((a,s) => a + s.duration_min, 0)} Min.</td>
                  <td style={{ padding: '10px 12px', fontWeight: 900 }}>{totalCost.toFixed(2)} €</td>
                  <td style={{ padding: '10px 12px', fontSize: 12, color: '#555' }}>{activeSessions.length} Buchungen</td>
                </tr>
              </tfoot>
            </table>
            {sessions.length === 0 && <p style={{ textAlign: 'center', color: '#888', padding: 20 }}>Noch keine Sessions.</p>}
          </div>
        </>}

        {/* ── USERS ── */}
        {tab === 'users' && <>
          <div style={{ background: '#f0f4ff', border: `2px solid ${BK}`, borderLeft: `5px solid ${BK}`, borderRadius: 6, padding: 16, marginBottom: 20, fontSize: 14 }}>
            <strong>Neue Nutzer anlegen:</strong> Supabase Dashboard → Authentication → Users → <em>Create new user</em><br />
            Danach Rolle setzen: Table Editor → profiles → Zeile anklicken → role auf <code>member</code> oder <code>admin</code> setzen.
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead><tr>
              {['Name', 'Rolle', 'Seit'].map(h => (
                <th key={h} style={{ background: BK, color: Y, padding: '8px 12px', textAlign: 'left', fontWeight: 700, fontSize: 12, textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid #eee' }}>{[u.first_name, u.last_name].filter(Boolean).join(' ') || u.name}</td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid #eee' }}><span style={badge(u.role === 'admin' ? BK : '#34c759')}>{u.role === 'admin' ? 'Admin' : 'Mitglied'}</span></td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid #eee', fontSize: 12, color: '#888' }}>{formatDate(u.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>}

        {/* ── SETTINGS ── */}
        {tab === 'settings' && <>
          <p style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, fontSize: 13, margin: '0 0 20px' }}>
            🔐 Kettenschloss – Zahlencode
          </p>

          {/* Code-Vorschau */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Aktueller Code</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {(lockCode || '----').split('').map((digit, i) => (
                <div key={i} style={{
                  background: digit === '-' ? '#ccc' : BK, borderRadius: 6, width: 52, height: 64,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                }}>
                  {digit === '0'
                    ? <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', boxShadow: '0 0 0 2px #555' }} />
                    : digit === '-'
                    ? <span style={{ color: '#fff', fontSize: 24, fontWeight: 900, fontFamily: 'monospace' }}>?</span>
                    : <span style={{ color: '#fff', fontSize: 30, fontWeight: 900, fontFamily: 'monospace', lineHeight: 1 }}>{digit}</span>
                  }
                </div>
              ))}
            </div>
          </div>

          {/* Code-Eingabe */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <input
              type="text" inputMode="numeric" maxLength={4}
              value={lockCode}
              onChange={e => setLockCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="0000"
              style={{ border: `2px solid ${BK}`, borderRadius: 4, padding: '10px 16px', fontSize: 28, fontFamily: 'monospace', fontWeight: 900, width: 120, textAlign: 'center', letterSpacing: 8 }}
            />
            <button onClick={saveLockCode} disabled={lockCodeSaving}
              style={{ background: Y, color: BK, border: `2px solid ${BK}`, borderRadius: 4, padding: '11px 22px', cursor: 'pointer', fontWeight: 900, fontSize: 15, fontFamily: 'inherit' }}>
              {lockCodeSaving ? '⏳ Speichern...' : '💾 Speichern'}
            </button>
          </div>
          {lockCodeMsg && <p style={{ marginTop: 10, fontSize: 14, fontWeight: 700 }}>{lockCodeMsg}</p>}
          <p style={{ marginTop: 16, fontSize: 13, color: '#888', lineHeight: 1.6 }}>
            Der Code wird Mitgliedern nach erfolgreichem Check-in angezeigt.<br />
            Bitte jährlich aktualisieren.
          </p>
        </>}

      </div>
    </div>
  )
}
