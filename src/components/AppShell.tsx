'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/supabase/types'
import CheckIn from './CheckIn'
import History from './History'
import Guide from './Guide'
import Admin from './Admin'

const Y  = '#FFE600'
const BK = '#111'

type Page = 'checkin' | 'history' | 'guide' | 'admin'

export default function AppShell({ profile }: { profile: Profile }) {
  const router = useRouter()
  const [page, setPage] = useState<Page>('checkin')
  const [refreshKey, setRefreshKey] = useState(0)

  const navItems: { id: Page; label: string }[] = [
    { id: 'checkin', label: 'Check-in' },
    { id: 'history', label: 'Historie' },
    { id: 'guide',   label: 'Anleitung' },
    ...(profile.role === 'admin' ? [{ id: 'admin' as Page, label: 'Admin' }] : []),
  ]

  const doLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const firstName = profile.first_name ?? profile.name

  return (
    <div style={{ fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif", minHeight: '100vh', background: '#f4f4ef', color: BK }}>

      {/* ── BrandBar ── */}
      <div style={{
        background: '#f4f4ef', borderBottom: `1px solid #ddd`,
        padding: '12px 18px 10px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 900, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 }}>TV Häslach</span>
          <span style={{ background: BK, color: Y, borderRadius: 3, padding: '2px 6px', fontSize: 10, fontWeight: 900, letterSpacing: 0.5 }}>1905</span>
          <span style={{ fontSize: 11, color: '#666', fontWeight: 700, marginLeft: 4 }}>· Pistol Pete</span>
        </div>
        <button
          onClick={doLogout}
          style={{
            background: 'transparent', color: BK, border: `1.5px solid ${BK}`,
            borderRadius: 3, padding: '5px 10px', cursor: 'pointer',
            fontFamily: 'inherit', fontWeight: 800, fontSize: 10,
            letterSpacing: 1, textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', gap: 5,
          }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="M16 17l5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
          Abmelden
        </button>
      </div>

      {/* ── Tab nav ── */}
      <div style={{
        background: '#f4f4ef',
        padding: '8px 18px 10px',
        display: 'flex', gap: 6,
        borderBottom: `1px solid #ddd`,
      }}>
        {navItems.map(n => {
          const on = page === n.id
          return (
            <button
              key={n.id}
              onClick={() => setPage(n.id)}
              style={{
                flex: 1,
                minWidth: 0,
                background: on ? BK : '#fff',
                color: on ? Y : BK,
                border: `1.5px solid ${BK}`,
                borderRadius: 4,
                padding: '8px 4px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontWeight: 900,
                fontSize: 11,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {n.label}
            </button>
          )
        })}
      </div>

      {/* ── Slim greeting ── */}
      <div style={{ padding: '10px 18px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: '#666', letterSpacing: 2, textTransform: 'uppercase' }}>● Online</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: BK }}>
          Hallo, <strong style={{ color: BK, borderBottom: `2px solid ${Y}` }}>{firstName}</strong>
        </span>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '12px 0 40px' }}>
        {page === 'checkin' && <CheckIn profile={profile} onCheckedIn={() => setRefreshKey(k => k + 1)} />}
        {page === 'history' && <History profile={profile} refreshKey={refreshKey} />}
        {page === 'guide'   && <Guide />}
        {page === 'admin' && profile.role === 'admin' && <Admin refreshKey={refreshKey} />}
      </div>

      {/* ── Slim legal footer ── */}
      <div style={{
        padding: '14px 16px 18px', textAlign: 'center',
        fontSize: 10, color: '#777', letterSpacing: 1, textTransform: 'uppercase',
        borderTop: `1px solid #ddd`,
      }}>
        <span style={{ display: 'block', marginBottom: 4 }}>
          TV Häslach 1905 e.V. · Tennis · Pistol Pete
        </span>
        <a href="/impressum" style={{ color: '#777', textDecoration: 'none' }}>Impressum & Datenschutz</a>
        {' · '}
        <a href="/nutzungsbedingungen" style={{ color: '#777', textDecoration: 'none' }}>Nutzungsbedingungen</a>
      </div>
    </div>
  )
}
