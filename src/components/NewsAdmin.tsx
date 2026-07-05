'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/helpers'
import type { News as NewsType } from '@/lib/supabase/types'

const Y   = '#FFE600'
const BK  = '#111'
const RED = '#ff3b30'
const GRN = '#34c759'
const ORG = '#ff9f0a'

const mono: React.CSSProperties = { fontFamily: 'ui-monospace, "JetBrains Mono", Menlo, monospace' }

// Interne Link-Ziele
const LINK_OPTIONS: { label: string; value: string }[] = [
  { label: '— Kein Link —',          value: '' },
  { label: 'Check-in',               value: 'checkin' },
  { label: 'Historie',               value: 'history' },
  { label: 'Anleitung',              value: 'guide' },
  { label: 'Nutzungsbedingungen',    value: '/nutzungsbedingungen' },
  { label: 'Impressum',              value: '/impressum' },
]

type Status = 'active' | 'planned' | 'expired'
function deriveStatus(n: NewsType): Status {
  const now = Date.now()
  const pub = new Date(n.published_at).getTime()
  const exp = n.expires_at ? new Date(n.expires_at).getTime() : null
  if (pub > now) return 'planned'
  if (exp !== null && exp <= now) return 'expired'
  return 'active'
}

// ISO ↔ datetime-local
function isoToLocalInput(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const off = d.getTimezoneOffset()
  const local = new Date(d.getTime() - off * 60000)
  return local.toISOString().slice(0, 16)
}
function localInputToIso(v: string): string | null {
  if (!v) return null
  return new Date(v).toISOString()
}

// ── atoms ────────────────────────────────────────────────────────────────
function AdminHero({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{
      background: Y, border: `2px solid ${BK}`, borderRadius: 10,
      padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10,
      marginBottom: 12, position: 'relative', overflow: 'hidden', boxShadow: `3px 3px 0 ${BK}`,
    }}>
      <div style={{ position: 'absolute', inset: 0, background: `repeating-linear-gradient(135deg, transparent 0 16px, rgba(0,0,0,0.04) 16px 17px)` }} />
      <div style={{ position: 'relative', width: 38, height: 38, background: BK, color: Y, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={Y} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z" /></svg>
      </div>
      <div style={{ position: 'relative', flex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: BK, opacity: 0.7 }}>Admin · TV Häslach</div>
        <div style={{ fontSize: 22, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1, lineHeight: 1, color: BK, marginTop: 2 }}>{title}</div>
        {sub && <div style={{ fontSize: 11, fontWeight: 700, color: BK, opacity: 0.7, marginTop: 4 }}>{sub}</div>}
      </div>
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label style={{ display: 'block', fontWeight: 800, fontSize: 11, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1.2, color: '#444' }}>{children}</label>
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={{
    width: '100%', boxSizing: 'border-box', background: '#fff', color: BK,
    border: `2px solid ${BK}`, borderRadius: 4, padding: '12px 14px', fontSize: 15, fontFamily: 'inherit', outline: 'none',
    ...props.style,
  }} />
}

function PrimaryBtn({ children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...rest} style={{
    width: '100%', background: Y, color: BK, border: `2px solid ${BK}`, borderRadius: 4,
    padding: '14px 22px', fontWeight: 900, fontSize: 15, letterSpacing: 1.5, textTransform: 'uppercase',
    cursor: rest.disabled ? 'not-allowed' : 'pointer', boxShadow: `3px 3px 0 ${BK}`, fontFamily: 'inherit',
    opacity: rest.disabled ? 0.7 : 1, ...rest.style,
  }}>{children}</button>
}

function SecondaryBtn({ children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...rest} style={{
    width: '100%', background: '#fff', color: BK, border: `2px solid ${BK}`, borderRadius: 4,
    padding: '12px 22px', fontWeight: 800, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase',
    cursor: 'pointer', fontFamily: 'inherit', ...rest.style,
  }}>{children}</button>
}

function StatusPill({ status }: { status: Status }) {
  const map: Record<Status, { c: string; l: string; dot?: boolean }> = {
    active:  { c: GRN,   l: 'Aktiv', dot: true },
    planned: { c: ORG,   l: 'Geplant' },
    expired: { c: '#999', l: 'Abgelaufen' },
  }
  const s = map[status]
  return (
    <span style={{ background: s.c, color: '#fff', fontSize: 9.5, fontWeight: 900, padding: '3px 7px', borderRadius: 3, letterSpacing: 1, textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      {s.dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
      {s.l}
    </span>
  )
}

// ── component ────────────────────────────────────────────────────────────
type FormState = {
  id: string | null
  title: string
  body: string
  image_url: string
  link_target: string
  link_label: string
  published_at: string  // datetime-local
  expires_at: string    // datetime-local
}

const emptyForm = (): FormState => {
  const now = new Date()
  const off = now.getTimezoneOffset()
  const local = new Date(now.getTime() - off * 60000).toISOString().slice(0, 16)
  return { id: null, title: '', body: '', image_url: '', link_target: '', link_label: '', published_at: local, expires_at: '' }
}

export default function NewsAdmin({ onChanged }: { onChanged?: () => void }) {
  const [items, setItems] = useState<NewsType[]>([])
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<'list' | 'form'>('list')
  const [form, setForm] = useState<FormState>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState('')
  const [confirmDel, setConfirmDel] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const supabase = createClient()
      const { data } = await supabase.from('news').select('*').order('published_at', { ascending: false })
      setItems(data ?? [])
      setLoading(false)
    }
    load()
  }, [tick])

  const openNew = () => { setForm(emptyForm()); setMsg(''); setMode('form') }
  const openEdit = (n: NewsType) => {
    setForm({
      id: n.id, title: n.title, body: n.body,
      image_url: n.image_url ?? '', link_target: n.link_target ?? '', link_label: n.link_label ?? '',
      published_at: isoToLocalInput(n.published_at), expires_at: isoToLocalInput(n.expires_at),
    })
    setMsg(''); setMode('form')
  }

  const handleUpload = async (file: File) => {
    setUploading(true); setMsg('')
    const supabase = createClient()
    const ext = file.name.split('.').pop() || 'jpg'
    const path = `${crypto.randomUUID()}.${ext}`
    const { error } = await supabase.storage.from('news-images').upload(path, file, { cacheControl: '3600', upsert: false })
    if (error) { setMsg('✕ Upload-Fehler: ' + error.message); setUploading(false); return }
    const { data } = supabase.storage.from('news-images').getPublicUrl(path)
    setForm(f => ({ ...f, image_url: data.publicUrl }))
    setUploading(false)
  }

  const save = async () => {
    if (!form.title.trim()) { setMsg('Bitte eine Headline eingeben.'); return }
    if (!form.body.trim())  { setMsg('Bitte einen Fließtext eingeben.'); return }
    setSaving(true); setMsg('')
    const supabase = createClient()

    const payload = {
      title: form.title.trim(),
      body: form.body.trim(),
      image_url: form.image_url.trim() || null,
      link_target: form.link_target || null,
      link_label: form.link_target ? (form.link_label.trim() || 'Öffnen') : null,
      published_at: localInputToIso(form.published_at) ?? new Date().toISOString(),
      expires_at: localInputToIso(form.expires_at),
    }

    let error
    if (form.id) {
      ({ error } = await supabase.from('news').update(payload).eq('id', form.id))
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      ;({ error } = await supabase.from('news').insert({ ...payload, created_by: user?.id ?? null }))
    }

    setSaving(false)
    if (error) { setMsg('✕ Fehler: ' + error.message); return }
    setMode('list'); setTick(t => t + 1); onChanged?.()
  }

  const del = async (id: string) => {
    const supabase = createClient()
    await supabase.from('news').delete().eq('id', id)
    setConfirmDel(null); setTick(t => t + 1); onChanged?.()
  }

  // ── FORM ────────────────────────────────────────────────────────────────
  if (mode === 'form') {
    return (
      <div style={{ padding: '0 18px 24px' }}>
        <AdminHero title="Nachricht" sub={form.id ? 'Bearbeiten · Schwarzes Brett' : 'Neu · Schwarzes Brett'} />

        {msg && <div style={{ border: `2px solid ${RED}`, borderLeft: `5px solid ${RED}`, background: '#fff0ee', borderRadius: 4, padding: '10px 14px', marginBottom: 12, fontSize: 14 }}>{msg}</div>}

        <FieldLabel>Headline</FieldLabel>
        <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="z.B. Neue Trainingsbälle" />
        <div style={{ height: 14 }} />

        <FieldLabel>Fließtext</FieldLabel>
        <textarea
          value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} rows={5}
          placeholder="Was gibt es Neues?"
          style={{ width: '100%', boxSizing: 'border-box', background: '#fff', color: BK, border: `2px solid ${BK}`, borderRadius: 4, padding: '12px 14px', fontSize: 15, fontFamily: 'inherit', outline: 'none', resize: 'vertical', lineHeight: 1.5 }}
        />
        <div style={{ height: 16 }} />

        {/* Bild */}
        <FieldLabel>Bild</FieldLabel>
        {form.image_url ? (
          <div style={{ position: 'relative', marginBottom: 10 }}>
            <div style={{ width: '100%', aspectRatio: '16 / 9', border: `2px solid ${BK}`, borderRadius: 8, overflow: 'hidden', background: '#e9e6dd' }}>
              <img src={form.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
            <button onClick={() => setForm(f => ({ ...f, image_url: '' }))} aria-label="Bild entfernen" style={{
              position: 'absolute', top: -9, right: -9, width: 26, height: 26, borderRadius: '50%',
              background: '#fff', border: `2px solid ${BK}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
            }}>
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke={BK} strokeWidth="2.2" strokeLinecap="round"><path d="M2 2l8 8M10 2l-8 8" /></svg>
            </button>
          </div>
        ) : (
          <label style={{
            border: `2px dashed ${BK}`, borderRadius: 6, background: '#fff', padding: '20px 14px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textAlign: 'center', cursor: 'pointer',
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 6, background: Y, border: `2px solid ${BK}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={BK} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
            </div>
            <div style={{ fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.5 }}>{uploading ? 'Wird hochgeladen…' : 'Bild hochladen'}</div>
            <div style={{ fontSize: 12, color: '#888' }}>Tippen · JPG, PNG</div>
            <input type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f) }} />
          </label>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '12px 0' }}>
          <div style={{ flex: 1, height: 2, background: '#ddd' }} />
          <span style={{ fontSize: 11, fontWeight: 800, color: '#999', letterSpacing: 1.5, textTransform: 'uppercase' }}>oder URL</span>
          <div style={{ flex: 1, height: 2, background: '#ddd' }} />
        </div>
        <Input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="https://…/foto.jpg" />
        <div style={{ height: 16 }} />

        {/* Interner Link */}
        <FieldLabel>Interner Link (optional)</FieldLabel>
        <select
          value={form.link_target} onChange={e => setForm(f => ({ ...f, link_target: e.target.value }))}
          style={{ width: '100%', boxSizing: 'border-box', background: '#fff', color: BK, border: `2px solid ${BK}`, borderRadius: 4, padding: '12px 14px', fontSize: 15, fontFamily: 'inherit' }}
        >
          {LINK_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        {form.link_target && (
          <>
            <div style={{ height: 10 }} />
            <Input value={form.link_label} onChange={e => setForm(f => ({ ...f, link_label: e.target.value }))} placeholder="Button-Beschriftung, z.B. Anleitung öffnen" />
          </>
        )}
        <div style={{ fontSize: 11, color: '#888', marginTop: 6, lineHeight: 1.4 }}>
          Verlinkt auf einen App-Bereich: Check-in, Historie, Anleitung, Nutzungsbedingungen oder Impressum.
        </div>
        <div style={{ height: 16 }} />

        {/* Sichtbarkeit */}
        <FieldLabel>Sichtbarkeit</FieldLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 }}>Sichtbar ab</div>
            <div style={{ border: `2px solid ${BK}`, borderRadius: 4, background: '#fff', padding: '0 10px' }}>
              <input type="datetime-local" value={form.published_at} onChange={e => setForm(f => ({ ...f, published_at: e.target.value }))}
                style={{ display: 'block', width: '100%', border: 'none', outline: 'none', padding: '11px 0', fontSize: 14, fontFamily: 'inherit', background: 'transparent', color: BK }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 }}>Sichtbar bis</div>
            <div style={{ border: `2px solid ${BK}`, borderRadius: 4, background: '#fff', padding: '0 10px' }}>
              <input type="datetime-local" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))}
                style={{ display: 'block', width: '100%', border: 'none', outline: 'none', padding: '11px 0', fontSize: 14, fontFamily: 'inherit', background: 'transparent', color: BK }} />
            </div>
          </div>
        </div>
        <div style={{ fontSize: 11, color: '#888', marginTop: 6 }}>„Sichtbar bis" leer lassen = läuft nie ab.</div>
        <div style={{ height: 20 }} />

        <PrimaryBtn onClick={save} disabled={saving || uploading}>{saving ? 'Speichern…' : 'Nachricht speichern →'}</PrimaryBtn>
        <div style={{ height: 10 }} />
        <SecondaryBtn onClick={() => setMode('list')}>Abbrechen</SecondaryBtn>
      </div>
    )
  }

  // ── LIST ────────────────────────────────────────────────────────────────
  const active  = items.filter(n => deriveStatus(n) === 'active').length
  const planned = items.filter(n => deriveStatus(n) === 'planned').length

  return (
    <div style={{ padding: '0 18px 24px' }}>
      <AdminHero title="Schwarzes Brett" sub={`${active} aktiv · ${planned} geplant`} />

      <PrimaryBtn onClick={openNew} style={{ marginBottom: 16 }}>+ Neue Nachricht</PrimaryBtn>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 30, color: '#888' }}>Lade…</div>
      ) : items.length === 0 ? (
        <p style={{ color: '#888', fontSize: 13, textAlign: 'center', padding: 20 }}>Noch keine Nachrichten.</p>
      ) : (
        <>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#666', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
            Alle Nachrichten · {items.length}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {items.map(n => {
              const status = deriveStatus(n)
              const dim = status === 'expired'
              const dateLabel = status === 'planned' ? `ab ${formatDate(n.published_at)}`
                : status === 'expired' && n.expires_at ? `bis ${formatDate(n.expires_at)}`
                : `seit ${formatDate(n.published_at)}`
              return (
                <div key={n.id} style={{
                  background: '#fff', border: `2px solid ${BK}`,
                  borderLeft: `5px solid ${status === 'active' ? GRN : status === 'planned' ? ORG : '#999'}`,
                  borderRadius: 4, padding: '12px 14px', opacity: dim ? 0.62 : 1,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                    <StatusPill status={status} />
                    <span style={{ ...mono, fontSize: 11.5, fontWeight: 700, color: '#888' }}>{dateLabel}</span>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.4, lineHeight: 1.05 }}>{n.title}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 7 }}>
                    {n.image_url && <span style={{ fontSize: 9.5, fontWeight: 800, color: '#777', letterSpacing: 0.5, textTransform: 'uppercase', border: '1.5px solid #ccc', borderRadius: 3, padding: '2px 6px' }}>Bild</span>}
                    {n.link_target && <span style={{ fontSize: 9.5, fontWeight: 800, color: '#777', letterSpacing: 0.5, textTransform: 'uppercase', border: '1.5px solid #ccc', borderRadius: 3, padding: '2px 6px' }}>Link</span>}
                  </div>

                  {confirmDel === n.id ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, background: '#fff0ee', border: `2px solid ${RED}`, borderRadius: 4, padding: '8px 10px' }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: RED, flex: 1 }}>⚠ Wirklich löschen?</span>
                      <button onClick={() => del(n.id)} style={{ background: RED, color: '#fff', border: 'none', borderRadius: 3, padding: '6px 12px', cursor: 'pointer', fontWeight: 800, fontSize: 11, fontFamily: 'inherit' }}>Ja</button>
                      <button onClick={() => setConfirmDel(null)} style={{ background: '#fff', color: BK, border: `1.5px solid ${BK}`, borderRadius: 3, padding: '6px 12px', cursor: 'pointer', fontWeight: 700, fontSize: 11, fontFamily: 'inherit' }}>Abbr.</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      <button onClick={() => openEdit(n)} style={{ flex: 1, justifyContent: 'center', background: '#fff', color: BK, border: `1.5px solid ${BK}`, borderRadius: 4, padding: '7px 12px', fontFamily: 'inherit', fontWeight: 800, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={BK} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></svg>
                        Bearbeiten
                      </button>
                      <button onClick={() => setConfirmDel(n.id)} style={{ flex: 1, justifyContent: 'center', background: '#fff', color: RED, border: `1.5px solid ${RED}`, borderRadius: 4, padding: '7px 12px', fontFamily: 'inherit', fontWeight: 800, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></svg>
                        Löschen
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
