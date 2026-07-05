'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/helpers'
import type { News as NewsType } from '@/lib/supabase/types'

const Y  = '#FFE600'
const BK = '#111'

// ── atoms ────────────────────────────────────────────────────────────────
function PeteHero({ kicker, title, sub }: { kicker?: string; title: React.ReactNode; sub?: string }) {
  return (
    <div style={{
      background: Y, border: `3px solid ${BK}`, borderRadius: 12,
      position: 'relative', overflow: 'hidden', padding: '14px 16px 0',
      boxShadow: `4px 4px 0 ${BK}`, marginBottom: 16,
    }}>
      <div style={{ position: 'absolute', inset: 0, background: `repeating-linear-gradient(135deg, transparent 0 18px, rgba(0,0,0,0.04) 18px 19px)`, pointerEvents: 'none' }} />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div style={{ flex: 1, paddingBottom: 12 }}>
          {kicker && <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 2 }}>{kicker}</div>}
          <div style={{ fontWeight: 900, fontSize: 28, letterSpacing: 1.5, lineHeight: 0.95, textTransform: 'uppercase' }}>{title}</div>
          {sub && <div style={{ marginTop: 8, fontSize: 11, fontWeight: 700, color: BK, opacity: 0.75 }}>{sub}</div>}
        </div>
        <img src="/icons/pete.png" alt="" style={{ height: 120, marginRight: -8, marginBottom: -2, filter: 'drop-shadow(3px 5px 0 rgba(0,0,0,0.15))', flexShrink: 0 }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
      </div>
    </div>
  )
}

function NewBadge() {
  return (
    <span style={{
      background: BK, color: Y, fontSize: 10, fontWeight: 900,
      padding: '3px 8px', borderRadius: 3, letterSpacing: 1.5, textTransform: 'uppercase',
      display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: Y }} />
      Neu
    </span>
  )
}

function DateStamp({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontFamily: 'ui-monospace, "JetBrains Mono", Menlo, monospace', fontSize: 11.5, fontWeight: 700, color: '#888', letterSpacing: 0.3 }}>
      {children}
    </span>
  )
}

function NewsCard({ n, unread, onNavigate }: { n: NewsType; unread: boolean; onNavigate: (target: string) => void }) {
  return (
    <article style={{
      background: '#fff', border: `2px solid ${BK}`,
      borderLeft: unread ? `6px solid ${Y}` : `2px solid ${BK}`,
      borderRadius: 6, padding: 14, boxShadow: `3px 3px 0 ${BK}`,
      display: 'flex', flexDirection: 'column', gap: 11,
      opacity: unread ? 1 : 0.92,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <DateStamp>{formatDate(n.published_at)}</DateStamp>
        {unread && <NewBadge />}
      </div>
      <h3 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: BK, textTransform: 'uppercase', letterSpacing: 0.8, lineHeight: 1.02 }}>
        {n.title}
      </h3>
      {n.image_url && (
        <div style={{ width: '100%', aspectRatio: '16 / 9', border: `2px solid ${BK}`, borderRadius: 8, overflow: 'hidden', background: '#e9e6dd' }}>
          <img src={n.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = 'none' }} />
        </div>
      )}
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: '#333', whiteSpace: 'pre-wrap' }}>{n.body}</p>
      {n.link_target && n.link_label && (
        <button
          onClick={() => onNavigate(n.link_target!)}
          style={{
            alignSelf: 'flex-start', background: Y, color: BK,
            border: `2px solid ${BK}`, borderRadius: 4, padding: '9px 16px',
            fontFamily: 'inherit', fontWeight: 900, fontSize: 12.5,
            letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer',
            boxShadow: `3px 3px 0 ${BK}`, display: 'inline-flex', alignItems: 'center', gap: 6,
          }}
        >
          {n.link_label} →
        </button>
      )}
    </article>
  )
}

// ── component ────────────────────────────────────────────────────────────
export default function News({ onNavigate, onRead }: { onNavigate: (target: string) => void; onRead: () => void }) {
  const [items, setItems] = useState<NewsType[]>([])
  const [unreadIds, setUnreadIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const nowIso = new Date().toISOString()
      const [{ data: news }, { data: reads }] = await Promise.all([
        supabase.from('news').select('*')
          .lte('published_at', nowIso)
          .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
          .order('published_at', { ascending: false }),
        supabase.from('news_reads').select('news_id'),
      ])
      const readSet = new Set((reads ?? []).map(r => r.news_id))
      const list = news ?? []
      setItems(list)
      setUnreadIds(new Set(list.filter(n => !readSet.has(n.id)).map(n => n.id)))
      setLoading(false)

      // Alle sichtbaren als gelesen markieren + Badge aktualisieren
      if (list.some(n => !readSet.has(n.id))) {
        await supabase.rpc('mark_all_news_read')
        onRead()
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) return <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>Lade Neuigkeiten…</div>

  return (
    <div style={{ padding: '0 18px 24px' }}>
      <PeteHero kicker="Schwarzes Brett" title={<>Neuig-<br />keiten</>} sub={unreadIds.size > 0 ? `${unreadIds.size} ungelesen` : undefined} />

      {items.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 20px', gap: 4 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', background: '#fff',
            border: `2px solid ${BK}`, boxShadow: `3px 3px 0 ${Y}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
          }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={BK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.7 21a2 2 0 0 1-3.4 0" />
            </svg>
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1, color: BK }}>Keine Neuigkeiten</div>
          <div style={{ fontSize: 14, color: '#777', lineHeight: 1.5, maxWidth: 240 }}>
            Sobald es etwas Neues vom Verein gibt, erscheint es hier am Schwarzen Brett.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {items.map(n => (
            <NewsCard key={n.id} n={n} unread={unreadIds.has(n.id)} onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </div>
  )
}
