'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { News as NewsType } from '@/lib/supabase/types'

const Y  = '#FFE600'
const BK = '#111'

const DISMISS_KEY = 'pp-news-banner-dismissed'

export default function NewsBanner({ onOpen }: { onOpen: () => void }) {
  const [item, setItem] = useState<NewsType | null>(null)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const nowIso = new Date().toISOString()

      // Neueste aktive Nachrichten + eigene Lese-Markierungen holen
      const [{ data: news }, { data: reads }] = await Promise.all([
        supabase.from('news').select('*')
          .lte('published_at', nowIso)
          .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
          .order('published_at', { ascending: false }),
        supabase.from('news_reads').select('news_id'),
      ])

      const readSet = new Set((reads ?? []).map(r => r.news_id))
      const dismissed = localStorage.getItem(DISMISS_KEY)
      const latestUnread = (news ?? []).find(n => !readSet.has(n.id))

      if (latestUnread && latestUnread.id !== dismissed) {
        setItem(latestUnread)
      }
    }
    load()
  }, [])

  if (!item) return null

  const teaser = item.body.replace(/\s+/g, ' ').trim().slice(0, 80)

  const dismiss = (e: React.MouseEvent) => {
    e.stopPropagation()
    localStorage.setItem(DISMISS_KEY, item.id)
    setItem(null)
  }

  return (
    <div
      onClick={onOpen}
      style={{
        background: BK, border: `2px solid ${BK}`, borderRadius: 8,
        boxShadow: `3px 3px 0 ${Y}`, padding: '11px 12px',
        display: 'flex', alignItems: 'center', gap: 11, cursor: 'pointer',
        position: 'relative', marginBottom: 14,
      }}
    >
      {item.image_url && (
        <div style={{ width: 46, height: 46, flexShrink: 0, borderRadius: 5, overflow: 'hidden', border: `1.5px solid ${Y}`, background: '#2a2a2a' }}>
          <img src={item.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = 'none' }} />
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0, paddingRight: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
          <span style={{ background: Y, color: BK, fontSize: 9, fontWeight: 900, padding: '2px 6px', borderRadius: 3, letterSpacing: 1.2, textTransform: 'uppercase' }}>Neu</span>
          <span style={{ fontSize: 10, fontWeight: 800, color: '#888', letterSpacing: 1.5, textTransform: 'uppercase' }}>Schwarzes Brett</span>
        </div>
        <div style={{ fontSize: 15, fontWeight: 900, color: Y, textTransform: 'uppercase', letterSpacing: 0.5, lineHeight: 1.05, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {item.title}
        </div>
        <div style={{ fontSize: 12, color: '#cfcbc0', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {teaser}
        </div>
      </div>

      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={Y} strokeWidth="1.6" strokeLinecap="round" style={{ flexShrink: 0, alignSelf: 'center' }}>
        <path d="M9 6l6 6-6 6" />
      </svg>

      <button aria-label="Schließen" onClick={dismiss} style={{
        position: 'absolute', top: -9, right: -9, width: 24, height: 24, borderRadius: '50%',
        background: '#fff', border: `2px solid ${BK}`, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
      }}>
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke={BK} strokeWidth="2.2" strokeLinecap="round"><path d="M2 2l8 8M10 2l-8 8" /></svg>
      </button>
    </div>
  )
}
