'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { calcCost, formatDate, formatTime } from '@/lib/helpers'
import type { Session, CorrectionRequest, Profile } from '@/lib/supabase/types'

const Y  = '#FFE600'
const BK = '#111'

type CorrWithSession = CorrectionRequest & { sessions: Session | null }
type Tab = 'corrections' | 'sessions' | 'users' | 'settings' | 'registrations'

// ── atoms ────────────────────────────────────────────────────────────────
const monoStyle: React.CSSProperties = {
  fontFamily: 'ui-monospace, "JetBrains Mono", Menlo, monospace',
}

function AdminHero({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{
      background: Y, border: `2px solid ${BK}`, borderRadius: 10,
      padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10,
      marginBottom: 12, position: 'relative', overflow: 'hidden',
      boxShadow: `3px 3px 0 ${BK}`,
    }}>
      <div style={{ position: 'absolute', inset: 0, background: `repeating-linear-gradient(135deg, transparent 0 16px, rgba(0,0,0,0.04) 16px 17px)` }} />
      <div style={{
        position: 'relative', width: 38, height: 38, background: BK, color: Y,
        borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={Y} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z" />
        </svg>
      </div>
      <div style={{ position: 'relative', flex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: BK, opacity: 0.7 }}>Admin · TV Häslach</div>
        <div style={{ fontSize: 22, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1, lineHeight: 1, color: BK, marginTop: 2 }}>{title}</div>
        {sub && <div style={{ fontSize: 11, fontWeight: 700, color: BK, opacity: 0.7, marginTop: 4 }}>{sub}</div>}
      </div>
    </div>
  )
}

function AdminTabs({ active, onChange, badges }:
  { active: Tab; onChange: (t: Tab) => void; badges: Partial<Record<Tab, number>> }) {
  const items: { id: Tab; label: string }[] = [
    { id: 'corrections',   label: 'Korr.' },
    { id: 'registrations', label: 'Anträge' },
    { id: 'sessions',      label: 'Buchg.' },
    { id: 'users',         label: 'Nutzer' },
    { id: 'settings',      label: 'Set.' },
  ]
  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
      {items.map(it => {
        const on = it.id === active
        const badge = badges[it.id]
        return (
          <button
            key={it.id}
            onClick={() => onChange(it.id)}
            style={{
              flex: 1, position: 'relative',
              padding: '8px 2px', textAlign: 'center',
              background: on ? BK : '#fff', color: on ? Y : BK,
              border: `1.5px solid ${BK}`, borderRadius: 4,
              fontSize: 10, fontWeight: 900, letterSpacing: 0.4, textTransform: 'uppercase',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            {it.label}
            {badge ? (
              <span style={{
                position: 'absolute', top: -5, right: -3,
                background: '#ff3b30', color: '#fff',
                fontSize: 9, fontWeight: 900, minWidth: 16, height: 16,
                borderRadius: 8, padding: '0 4px', lineHeight: '16px',
                border: `1.5px solid #fff`,
              }}>{badge}</span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
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
export default function Admin({ refreshKey }: { refreshKey: number }) {
  const [tab, setTab] = useState<Tab>('corrections')
  const [registrations, setRegistrations] = useState<any[]>([])
  const [invFirst, setInvFirst] = useState('')
  const [invLast,  setInvLast]  = useState('')
  const [invEmail, setInvEmail] = useState('')
  const [invRole,  setInvRole]  = useState<'member' | 'admin'>('member')
  const [invLoading, setInvLoading] = useState(false)
  const [invMsg,   setInvMsg]   = useState('')
  const [rowLoading, setRowLoading] = useState<string | null>(null)
  const [rowMsg,     setRowMsg]     = useState<Record<string, string>>({})
  const [editId,    setEditId]    = useState<string | null>(null)
  const [editFirst, setEditFirst] = useState('')
  const [editLast,  setEditLast]  = useState('')
  const [editRole,  setEditRole]  = useState<'member' | 'admin'>('member')
  const [editLoading, setEditLoading] = useState(false)
  const [editMsg,   setEditMsg]   = useState('')
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
      const [{ data: corr }, { data: sess }, { data: prof }, codeData, regs] = await Promise.all([
        supabase.from('correction_requests').select('*, sessions(*)').order('created_at', { ascending: false }),
        supabase.from('sessions').select('*').order('start_at', { ascending: false }),
        supabase.rpc('get_profiles_with_last_login'),
        supabase.from('settings').select('value').eq('id', 'lock_code').single(),
        supabase.from('registration_requests').select('*').order('created_at', { ascending: false }),
      ])
      setCorrections((corr as CorrWithSession[]) || [])
      setSessions(sess || [])
      setUsers(prof || [])
      if (codeData?.data) setLockCode(codeData.data.value ?? '')
      setRegistrations(regs?.data || [])
      setLoading(false)
    }
    load()
  }, [tick, refreshKey])

  const resolveCorr = async (id: string, approve: boolean) => {
    const supabase = createClient()
    const { error } = await supabase.rpc('resolve_correction', {
      p_correction_id: id, p_approve: approve,
    })
    if (error) { alert('Fehler: ' + error.message); return }
    setTick(t => t + 1)
  }

  const exportCSV = () => {
    const active = sessions.filter(s => s.status !== 'cancelled')
    const byUser: Record<string, { name: string; count: number; minutes: number; cost: number }> = {}
    active.forEach(s => {
      if (!byUser[s.user_id]) byUser[s.user_id] = { name: s.user_name, count: 0, minutes: 0, cost: 0 }
      byUser[s.user_id].count += 1
      byUser[s.user_id].minutes += s.duration_min
      byUser[s.user_id].cost += Number(s.cost)
    })
    const rows = [
      ['Nutzer', 'Anzahl Nutzungen', 'Gesamtdauer (Min.)', 'Gesamtkosten (€)'],
      ...Object.values(byUser).map(u => [u.name, String(u.count), String(u.minutes), u.cost.toFixed(2).replace('.', ',')]),
      ['GESAMT', String(Object.values(byUser).reduce((a, u) => a + u.count, 0)),
       String(Object.values(byUser).reduce((a, u) => a + u.minutes, 0)),
       Object.values(byUser).reduce((a, u) => a + u.cost, 0).toFixed(2).replace('.', ',')],
    ]
    const csv = rows.map(r => r.map(c => `"${c}"`).join(';')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pistol-pete-abrechnung-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const doReset = async () => {
    setResetLoading(true)
    const supabase = createClient()
    await supabase.from('correction_requests').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('sessions').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    setResetLoading(false); setResetConfirm(false)
    setResetMsg(`✓ Reset durchgeführt am ${new Date().toLocaleDateString('de-DE')} – alle Buchungen gelöscht.`)
    setTick(t => t + 1)
  }

  const doInvite = async (firstName: string, lastName: string, email: string, role: string, onDone: () => void) => {
    setInvLoading(true); setInvMsg('')
    const res = await fetch('/api/admin/invite', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ first_name: firstName, last_name: lastName, email, role }),
    })
    const data = await res.json()
    setInvLoading(false)
    if (!res.ok) { setInvMsg('✕ ' + (data.error ?? 'Fehler')); return }
    setInvMsg('✓ Einladung gesendet!')
    onDone(); setTick(t => t + 1)
  }

  const doInviteRow = async (r: any) => {
    setRowLoading(r.id); setRowMsg(m => ({ ...m, [r.id]: '' }))
    const res = await fetch('/api/admin/invite', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ first_name: r.first_name, last_name: r.last_name, email: r.email, role: 'member' }),
    })
    const data = await res.json()
    setRowLoading(null)
    if (!res.ok) { setRowMsg(m => ({ ...m, [r.id]: '✕ ' + (data.error ?? 'Fehler') })); return }
    const supabase = createClient()
    await supabase.from('registration_requests').update({ status: 'invited' }).eq('id', r.id)
    setRowMsg(m => ({ ...m, [r.id]: '✓ Einladung gesendet!' }))
    setTick(t => t + 1)
  }

  const doEdit = async () => {
    if (!editId) return
    setEditLoading(true); setEditMsg('')
    const res = await fetch('/api/admin/invite', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editId, first_name: editFirst, last_name: editLast, role: editRole }),
    })
    const data = await res.json()
    setEditLoading(false)
    if (!res.ok) { setEditMsg('✕ ' + (data.error ?? 'Fehler')); return }
    setEditMsg('✓ Gespeichert!')
    setTick(t => t + 1)
    setTimeout(() => { setEditId(null); setEditMsg('') }, 1200)
  }

  const saveLockCode = async () => {
    const clean = lockCode.replace(/\D/g, '').slice(0, 4)
    if (clean.length !== 4) { setLockCodeMsg('Bitte genau 4 Ziffern eingeben.'); return }
    setLockCodeSaving(true); setLockCodeMsg('')
    const supabase = createClient()
    const { error } = await supabase.from('settings').upsert({ id: 'lock_code', value: clean })
    setLockCodeSaving(false)
    setLockCodeMsg(error ? '✕ Fehler: ' + error.message : '✓ Code gespeichert!')
    setLockCode(clean)
  }

  const updateRegistration = async (id: string, status: 'invited' | 'rejected') => {
    const supabase = createClient()
    await supabase.from('registration_requests').update({ status }).eq('id', id)
    setTick(t => t + 1)
  }

  // ── derived ──
  const pendingCorr = corrections.filter(c => c.status === 'pending')
  const resolvedCorr = corrections.filter(c => c.status !== 'pending')
  const pendingRegs = registrations.filter(r => r.status === 'pending')
  const doneRegs = registrations.filter(r => r.status !== 'pending')
  const activeSessions = sessions.filter(s => s.status !== 'cancelled')
  const totalCost = activeSessions.reduce((a, s) => a + Number(s.cost), 0)
  const totalMin  = activeSessions.reduce((a, s) => a + s.duration_min, 0)

  const heroSub: Record<Tab, string> = {
    corrections:   `${pendingCorr.length} offen · ${resolvedCorr.length} erledigt`,
    registrations: `${pendingRegs.length} neu · ${doneRegs.length} erledigt`,
    sessions:      `${activeSessions.length} aktiv · ${totalMin} Min · ${totalCost.toFixed(2)} €`,
    users:         `${users.length} aktiv · ${users.filter(u => u.role === 'admin').length} Admin`,
    settings:      'Schloss-Code · App-Konfiguration',
  }
  const heroTitle: Record<Tab, string> = {
    corrections:   'Korrekturen',
    registrations: 'Anfragen',
    sessions:      'Buchungen',
    users:         'Nutzer',
    settings:      'Einstellungen',
  }

  const badges = {
    corrections:   pendingCorr.length,
    registrations: pendingRegs.length,
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>Lade Daten…</div>

  return (
    <div style={{ padding: '0 18px 24px' }}>
      <AdminTabs active={tab} onChange={setTab} badges={badges} />
      <AdminHero title={heroTitle[tab]} sub={heroSub[tab]} />

      {/* ── CORRECTIONS ── */}
      {tab === 'corrections' && (
        <>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#666', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
            Offen · {pendingCorr.length}
          </div>
          {pendingCorr.length === 0 && <p style={{ color: '#888', fontSize: 13 }}>Keine offenen Korrekturen.</p>}
          {pendingCorr.map(c => {
            const s = c.sessions
            return (
              <div key={c.id} style={{
                background: '#fff9e6', border: `2px solid #ff9f0a`,
                borderRadius: 6, padding: 14, marginBottom: 10,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontWeight: 900, fontSize: 15 }}>{c.user_name}</div>
                  <StatusPill color="#ff9f0a">⏳ Ausstehend</StatusPill>
                </div>
                <div style={{ marginTop: 8, fontSize: 11, fontWeight: 800, color: '#666', letterSpacing: 1.5, textTransform: 'uppercase' }}>Bisher</div>
                <div style={{ fontSize: 12.5, color: '#333', lineHeight: 1.4, marginTop: 2 }}>
                  {s ? `${formatDate(s.start_at)} · ${formatTime(s.start_at)} · ${s.duration_min} Min · ${Number(s.cost).toFixed(2)} €` : '–'}
                </div>
                <div style={{ marginTop: 8, fontSize: 11, fontWeight: 800, color: '#666', letterSpacing: 1.5, textTransform: 'uppercase' }}>Gewünscht</div>
                <div style={{
                  marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: BK, color: Y, padding: '4px 10px', borderRadius: 3,
                  fontWeight: 900, fontSize: 13, letterSpacing: 0.5,
                }}>
                  {c.requested_duration === 0
                    ? <span>STORNIEREN · 0 €</span>
                    : <><span style={{ ...monoStyle }}>{c.requested_duration}</span> MIN · <span style={{ ...monoStyle }}>{calcCost(c.requested_duration).toFixed(2)} €</span></>
                  }
                </div>
                {c.note && (
                  <>
                    <div style={{ marginTop: 10, fontSize: 11, fontWeight: 800, color: '#666', letterSpacing: 1.5, textTransform: 'uppercase' }}>Begründung</div>
                    <div style={{ fontSize: 12.5, color: '#333', fontStyle: 'italic', marginTop: 2, lineHeight: 1.4 }}>„{c.note}"</div>
                  </>
                )}
                <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                  <button
                    onClick={() => resolveCorr(c.id, true)}
                    style={{ flex: 1, background: '#34c759', color: '#fff', border: `2px solid #34c759`, borderRadius: 4, padding: '8px 12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 800, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' }}
                  >✓ Genehmigen</button>
                  <button
                    onClick={() => resolveCorr(c.id, false)}
                    style={{ flex: 1, background: '#fff', color: '#ff3b30', border: `2px solid #ff3b30`, borderRadius: 4, padding: '8px 12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 800, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' }}
                  >✕ Ablehnen</button>
                </div>
              </div>
            )
          })}
          {resolvedCorr.length > 0 && (
            <>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#666', letterSpacing: 2, textTransform: 'uppercase', marginTop: 14, marginBottom: 8 }}>
                Erledigt · {resolvedCorr.length}
              </div>
              {resolvedCorr.map(c => {
                const s = c.sessions
                return (
                  <div key={c.id} style={{
                    background: '#fff', border: '1.5px solid #ddd', borderRadius: 4,
                    padding: '8px 12px', marginBottom: 6,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: BK }}>{c.user_name}</div>
                      <div style={{ fontSize: 11, color: '#888' }}>
                        {c.requested_duration === 0 ? 'Stornierung' : `${c.requested_duration} Min.`}
                        {s && ` · ${formatDate(s.start_at)}`}
                      </div>
                    </div>
                    <StatusPill color={c.status === 'approved' ? '#34c759' : '#ff3b30'}>
                      {c.status === 'approved' ? 'Genehmigt' : 'Abgelehnt'}
                    </StatusPill>
                  </div>
                )
              })}
            </>
          )}
        </>
      )}

      {/* ── REGISTRATIONS ── */}
      {tab === 'registrations' && (
        <>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#666', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
            Neu · {pendingRegs.length}
          </div>
          {pendingRegs.length === 0 && <p style={{ color: '#888', fontSize: 13 }}>Keine Anfragen vorhanden.</p>}
          {pendingRegs.map(r => (
            <div key={r.id} style={{
              background: '#fffbea', border: `2px solid ${BK}`, borderLeft: `5px solid ${Y}`,
              borderRadius: 6, padding: 14, marginBottom: 10,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 16 }}>{r.first_name} {r.last_name}</div>
                  <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>{r.email}</div>
                  <div style={{ fontSize: 10, color: '#888', marginTop: 4, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                    Eingegangen {formatDate(r.created_at)}
                  </div>
                </div>
                <StatusPill color="#ff9f0a">Offen</StatusPill>
              </div>
              {rowMsg[r.id] ? (
                <div style={{ marginTop: 12, fontSize: 13, fontWeight: 700 }}>{rowMsg[r.id]}</div>
              ) : (
                <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                  <button
                    onClick={() => doInviteRow(r)} disabled={rowLoading === r.id}
                    style={{ flex: 1, background: '#34c759', color: '#fff', border: `2px solid #34c759`, borderRadius: 4, padding: '8px 12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 800, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' }}
                  >{rowLoading === r.id ? '…' : '✓ Einladen'}</button>
                  <button
                    onClick={() => updateRegistration(r.id, 'rejected')}
                    style={{ flex: 1, background: '#fff', color: '#ff3b30', border: `2px solid #ff3b30`, borderRadius: 4, padding: '8px 12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 800, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' }}
                  >✕ Ablehnen</button>
                </div>
              )}
              {!rowMsg[r.id] && (
                <div style={{ marginTop: 10, fontSize: 11, color: '#666', display: 'flex', gap: 6, alignItems: 'flex-start', lineHeight: 1.4 }}>
                  <span style={{ color: BK, fontWeight: 900 }}>›</span>
                  <span>Nach dem Einladen erhält die Person automatisch eine E-Mail zur Passwort-Einrichtung.</span>
                </div>
              )}
            </div>
          ))}
          {doneRegs.length > 0 && (
            <>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#666', letterSpacing: 2, textTransform: 'uppercase', marginTop: 14, marginBottom: 8 }}>
                Erledigt · {doneRegs.length}
              </div>
              {doneRegs.map(r => (
                <div key={r.id} style={{
                  background: '#fff', border: '1.5px solid #ddd', borderRadius: 4,
                  padding: '8px 12px', marginBottom: 6,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: BK }}>{r.first_name} {r.last_name}</div>
                    <div style={{ fontSize: 11, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.email}</div>
                  </div>
                  <StatusPill color={r.status === 'invited' ? '#34c759' : '#ff3b30'}>
                    {r.status === 'invited' ? 'Eingeladen' : 'Abgelehnt'}
                  </StatusPill>
                </div>
              ))}
            </>
          )}
        </>
      )}

      {/* ── SESSIONS ── */}
      {tab === 'sessions' && (
        <>
          <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
            <button onClick={exportCSV} style={{
              flex: 1, background: BK, color: Y, border: `2px solid ${BK}`, borderRadius: 4,
              padding: '10px 12px', fontFamily: 'inherit', fontWeight: 900, fontSize: 11,
              letterSpacing: 1.2, textTransform: 'uppercase', cursor: 'pointer',
            }}>↓ CSV Export</button>
            {!resetConfirm ? (
              <button onClick={() => setResetConfirm(true)} style={{
                flex: 1, background: '#fff', color: '#ff3b30', border: `2px solid #ff3b30`, borderRadius: 4,
                padding: '10px 12px', fontFamily: 'inherit', fontWeight: 800, fontSize: 11,
                letterSpacing: 1.2, textTransform: 'uppercase', cursor: 'pointer',
              }}>🗑 Reset</button>
            ) : (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6, flex: 2,
                background: '#fff0ee', border: `2px solid #ff3b30`, borderRadius: 4, padding: '6px 10px',
              }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#ff3b30' }}>⚠ Alles löschen?</span>
                <button onClick={doReset} disabled={resetLoading} style={{ background: '#ff3b30', color: '#fff', border: 'none', borderRadius: 3, padding: '5px 10px', cursor: 'pointer', fontWeight: 800, fontSize: 11, fontFamily: 'inherit' }}>
                  {resetLoading ? '…' : 'Ja'}
                </button>
                <button onClick={() => setResetConfirm(false)} style={{ background: '#fff', color: BK, border: `1.5px solid ${BK}`, borderRadius: 3, padding: '5px 10px', cursor: 'pointer', fontWeight: 700, fontSize: 11, fontFamily: 'inherit' }}>
                  Abbr.
                </button>
              </div>
            )}
          </div>
          {resetMsg && (
            <div style={{ border: '2px solid #34c759', borderLeft: '5px solid #34c759', background: '#f0fff4', borderRadius: 4, padding: '10px 14px', marginBottom: 12, fontSize: 13 }}>
              {resetMsg}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginBottom: 14 }}>
            {[
              ['Sessions', activeSessions.length, '#fff'],
              ['Minuten',  totalMin, '#fff'],
              ['Erlöse',   `${totalCost.toFixed(2)} €`, Y],
            ].map(([k, v, bg], i) => (
              <div key={i} style={{
                background: bg as string, border: `2px solid ${BK}`, borderRadius: 6, padding: '8px 10px',
                boxShadow: bg === Y ? `2px 2px 0 ${BK}` : 'none',
              }}>
                <div style={{ ...monoStyle, fontSize: 18, fontWeight: 900, color: BK, letterSpacing: -0.5, lineHeight: 1 }}>{v}</div>
                <div style={{ fontSize: 9, fontWeight: 800, color: bg === Y ? BK : '#666', letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 3 }}>{k}</div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 11, fontWeight: 800, color: '#666', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
            Alle Buchungen · {sessions.length}
          </div>
          {sessions.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#888', padding: 20, fontSize: 13 }}>Noch keine Sessions.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {sessions.map(s => {
                const cancelled = s.status === 'cancelled'
                return (
                  <div key={s.id} style={{
                    background: '#fff', border: `1.5px solid ${BK}`,
                    borderLeft: `5px solid ${cancelled ? '#999' : Y}`,
                    borderRadius: 4, padding: '8px 10px',
                    display: 'flex', alignItems: 'center', gap: 10,
                    opacity: cancelled ? 0.55 : 1,
                  }}>
                    <div style={{ textAlign: 'center', minWidth: 50 }}>
                      <div style={{ ...monoStyle, fontSize: 13, fontWeight: 900, color: BK, letterSpacing: -0.5, lineHeight: 1 }}>{formatDate(s.start_at)}</div>
                      <div style={{ fontSize: 9, color: '#666', marginTop: 1 }}>{formatTime(s.start_at)}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 800, color: BK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.user_name}</div>
                      <div style={{ fontSize: 10, color: '#666', marginTop: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span>{s.duration_min} Min</span><span>·</span>
                        <span style={{ ...monoStyle, fontWeight: 800 }}>{cancelled ? '0,00 €' : `${Number(s.cost).toFixed(2)} €`}</span>
                      </div>
                    </div>
                    <StatusPill color={cancelled ? '#ff3b30' : '#34c759'}>
                      {cancelled ? 'Storniert' : 'OK'}
                    </StatusPill>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* ── USERS ── */}
      {tab === 'users' && (
        <>
          <div style={{
            background: '#fffbea', border: `2px solid ${BK}`, borderLeft: `5px solid ${Y}`,
            borderRadius: 6, padding: 14, marginBottom: 16,
          }}>
            <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>
              Neuen Nutzer einladen
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
              <div><FieldLabel>Vorname</FieldLabel><Input value={invFirst} onChange={e => setInvFirst(e.target.value)} placeholder="Max" /></div>
              <div><FieldLabel>Nachname</FieldLabel><Input value={invLast} onChange={e => setInvLast(e.target.value)} placeholder="Mustermann" /></div>
            </div>
            <FieldLabel>E-Mail</FieldLabel>
            <Input type="email" value={invEmail} onChange={e => setInvEmail(e.target.value)} placeholder="max@beispiel.de" />
            <div style={{ height: 10 }} />
            <FieldLabel>Rolle</FieldLabel>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['member', 'admin'] as const).map(r => {
                const on = invRole === r
                return (
                  <button
                    key={r} type="button" onClick={() => setInvRole(r)}
                    style={{
                      flex: 1, padding: '10px 0', borderRadius: 4,
                      background: on ? Y : '#fff', color: BK, border: `2px solid ${BK}`,
                      fontSize: 13, fontWeight: 900, letterSpacing: 0.5, textTransform: 'uppercase',
                      boxShadow: on ? `2px 2px 0 ${BK}` : 'none', cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    {r === 'member' ? 'Mitglied' : 'Admin'}
                  </button>
                )
              })}
            </div>
            <div style={{ marginTop: 12 }}>
              <PrimaryBtn
                onClick={() => doInvite(invFirst, invLast, invEmail, invRole, () => { setInvFirst(''); setInvLast(''); setInvEmail(''); setInvRole('member') })}
                disabled={invLoading}
              >
                {invLoading ? '…' : 'Einladung senden →'}
              </PrimaryBtn>
            </div>
            {invMsg && <div style={{ marginTop: 8, fontSize: 12, fontWeight: 700 }}>{invMsg}</div>}
          </div>

          <div style={{ fontSize: 11, fontWeight: 800, color: '#666', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
            Registrierte Nutzer · {users.length}
          </div>
          {users.map(u => {
            const isEditing = editId === u.id
            const display = [u.first_name, u.last_name].filter(Boolean).join(' ') || u.name || '–'
            const initials = ((u.first_name?.[0] || '') + (u.last_name?.[0] || '')).toUpperCase() || '?'
            if (isEditing) {
              return (
                <div key={u.id} style={{ background: '#fffbea', border: `2px solid ${BK}`, borderRadius: 4, padding: 12, marginBottom: 6 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                    <Input value={editFirst} onChange={e => setEditFirst(e.target.value)} placeholder="Vorname" />
                    <Input value={editLast}  onChange={e => setEditLast(e.target.value)}  placeholder="Nachname" />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <select
                      value={editRole} onChange={e => setEditRole(e.target.value as 'member' | 'admin')}
                      style={{ border: `2px solid ${BK}`, borderRadius: 4, padding: '8px 10px', fontSize: 13, fontFamily: 'inherit', background: '#fff' }}
                    >
                      <option value="member">Mitglied</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button onClick={doEdit} disabled={editLoading} style={{ background: '#34c759', color: '#fff', border: '2px solid #34c759', borderRadius: 4, padding: '7px 14px', cursor: 'pointer', fontWeight: 800, fontSize: 12, fontFamily: 'inherit' }}>
                      {editLoading ? '…' : '✓ Speichern'}
                    </button>
                    <button onClick={() => { setEditId(null); setEditMsg('') }} style={{ background: 'transparent', color: '#888', border: '1px solid #ddd', borderRadius: 4, padding: '7px 12px', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>
                      Abbrechen
                    </button>
                    {editMsg && <span style={{ fontSize: 12, fontWeight: 700 }}>{editMsg}</span>}
                  </div>
                </div>
              )
            }
            const userSessions = sessions.filter(s => s.user_id === u.id && s.status !== 'cancelled')
            const lastLogin = u.last_login_at
              ? new Date(u.last_login_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
              : 'Noch nie'
            return (
              <div key={u.id} style={{
                background: '#fff', border: `2px solid ${BK}`, borderRadius: 4,
                padding: '10px 12px', marginBottom: 6,
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: u.role === 'admin' ? BK : Y, color: u.role === 'admin' ? Y : BK,
                  border: `2px solid ${BK}`, fontWeight: 900, fontSize: 13,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>{initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 900, color: BK }}>{display}</div>
                  <div style={{ fontSize: 11, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {u.email ?? '–'}
                  </div>
                  <div style={{ fontSize: 10, color: '#aaa', marginTop: 2, display: 'flex', gap: 8 }}>
                    <span>🕐 {lastLogin}</span>
                    <span>·</span>
                    <span>{userSessions.length} Session{userSessions.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                <StatusPill color={u.role === 'admin' ? BK : '#34c759'} fg={u.role === 'admin' ? Y : '#fff'}>
                  {u.role === 'admin' ? 'Admin' : 'Mitglied'}
                </StatusPill>
                <button
                  onClick={() => { setEditId(u.id); setEditFirst(u.first_name ?? ''); setEditLast(u.last_name ?? ''); setEditRole((u.role as 'member' | 'admin') ?? 'member'); setEditMsg('') }}
                  style={{
                    background: 'transparent', border: '1.5px solid #ddd', borderRadius: 4,
                    padding: '5px 8px', cursor: 'pointer', fontSize: 10, fontFamily: 'inherit',
                    color: '#666', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
                  }}
                >Edit</button>
              </div>
            )
          })}
        </>
      )}

      {/* ── SETTINGS ── */}
      {tab === 'settings' && (
        <>
          <div style={{ background: '#fff', border: `2px solid ${BK}`, borderRadius: 8, padding: 16, marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
                <rect x="1.5" y="7" width="11" height="8" rx="1.5" stroke={BK} strokeWidth="1.8" />
                <path d="M4 7V5a3 3 0 016 0v2" stroke={BK} strokeWidth="1.8" />
              </svg>
              <div style={{ fontSize: 14, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1 }}>Kettenschloss</div>
            </div>

            <div style={{ fontSize: 11, fontWeight: 800, color: '#666', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
              Aktueller Code
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {(lockCode || '----').split('').map((d, i) => (
                <div key={i} style={{
                  flex: 1, aspectRatio: '0.78',
                  background: d === '-' ? '#ccc' : BK, border: `2px solid ${BK}`, borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  ...monoStyle, fontWeight: 900, fontSize: 40, color: '#fff', lineHeight: 1,
                  boxShadow: d === '-' ? 'none' : `3px 3px 0 ${Y}`,
                }}>
                  {d === '0'
                    ? <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', boxShadow: '0 0 0 2px #555' }} />
                    : d === '-' ? '?' : d
                  }
                </div>
              ))}
            </div>

            <FieldLabel>Neuer Code (4 Ziffern)</FieldLabel>
            <input
              type="text" inputMode="numeric" maxLength={4} placeholder="0000"
              value={lockCode}
              onChange={e => setLockCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
              style={{
                width: '100%', boxSizing: 'border-box',
                border: `2px solid ${BK}`, borderRadius: 4,
                padding: '12px 14px', fontSize: 24, fontWeight: 900,
                ...monoStyle, textAlign: 'center', letterSpacing: 8,
                background: '#fff', color: BK, outline: 'none', marginBottom: 10,
              }}
            />
            <PrimaryBtn onClick={saveLockCode} disabled={lockCodeSaving}>
              {lockCodeSaving ? 'Speichern…' : 'Speichern'}
            </PrimaryBtn>
            {lockCodeMsg && <div style={{ marginTop: 10, fontSize: 13, fontWeight: 700 }}>{lockCodeMsg}</div>}

            <div style={{ marginTop: 12, fontSize: 11, color: '#666', lineHeight: 1.5 }}>
              Wird Mitgliedern nach erfolgreichem Check-in angezeigt.<br />
              Bitte jährlich aktualisieren.
            </div>
          </div>
        </>
      )}
    </div>
  )
}
