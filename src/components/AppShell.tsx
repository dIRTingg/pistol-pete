'use client'
// src/components/AppShell.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/supabase/types'
import CheckIn from './CheckIn'
import History from './History'
import Guide from './Guide'
import Admin from './Admin'

const Y = '#FFE600'
const BK = '#111'

type Page = 'checkin' | 'history' | 'guide' | 'admin'

export default function AppShell({ profile }: { profile: Profile }) {
  const router = useRouter()
  const [page, setPage] = useState<Page>('checkin')
  const [refreshKey, setRefreshKey] = useState(0)

  const navItems: { id: Page; label: string; icon: string }[] = [
    { id: 'checkin', label: 'Check-in', icon: '➕' },
    { id: 'history', label: 'Historie', icon: '📋' },
    { id: 'guide', label: 'Anleitung', icon: '📖' },
    ...(profile.role === 'admin' ? [{ id: 'admin' as Page, label: 'Admin', icon: '🛡️' }] : []),
  ]

  const doLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div style={{ fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif", minHeight: '100vh', background: '#f4f4ef', color: BK }}>

      {/* ── Header ── */}
      <div style={{ background: Y, borderBottom: `4px solid ${BK}`, padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ fontWeight: 900, fontSize: 20, textTransform: 'uppercase', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Pete freigestellt – kein weißer Hintergrund, overflow sichtbar */}
          <div style={{ position: 'relative', width: 48, height: 64, flexShrink: 0 }}>
            <img
              src="/icons/pete.png"
              alt="Pete"
              style={{ position: 'absolute', bottom: 0, left: 0, height: 72, width: 'auto', filter: 'drop-shadow(1px 1px 3px rgba(0,0,0,0.25))' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          </div>
          TV Häslach
          <span style={{ background: BK, color: Y, borderRadius: 4, padding: '2px 7px', fontSize: 12 }}>1905</span>
          <span style={{ fontWeight: 400, fontSize: 14, borderLeft: `2px solid ${BK}`, paddingLeft: 10, marginLeft: 4 }}>
            Pistol Pete
          </span>
        </div>
        <button
          onClick={doLogout}
          style={{ background: 'transparent', color: BK, border: `2px solid ${BK}`, borderRadius: 4, padding: '7px 14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}
        >
          🚪 Abmelden
        </button>
      </div>

      {/* ── Navigation ── */}
      <div style={{ background: '#fff', borderBottom: `2px solid ${BK}`, display: 'flex', justifyContent: 'center', gap: 4, padding: '8px 12px', flexWrap: 'wrap' }}>
        {navItems.map(n => (
          <button
            key={n.id}
            onClick={() => setPage(n.id)}
            style={{ background: page === n.id ? BK : 'transparent', color: page === n.id ? Y : BK, border: `2px solid ${BK}`, borderRadius: 4, padding: '7px 14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 14, letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            {n.icon} {n.label}
          </button>
        ))}
      </div>

      {/* ── Welcome bar ── */}
      <div style={{ background: Y, borderBottom: `2px solid ${BK}`, padding: '6px 20px', fontSize: 13, fontWeight: 700 }}>
        👋 Hallo, {profile.name}
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px 60px' }}>
        {page === 'checkin' && <CheckIn profile={profile} onCheckedIn={() => setRefreshKey(k => k + 1)} />}
        {page === 'history' && <History profile={profile} refreshKey={refreshKey} />}
        {page === 'guide' && <Guide />}
        {page === 'admin' && profile.role === 'admin' && <Admin refreshKey={refreshKey} />}
      </div>

      {/* ── Footer ── */}
      <div style={{ textAlign: 'center', padding: '14px 20px', borderTop: `2px solid ${BK}`, background: Y, fontSize: 12, fontWeight: 700 }}>
        TV Häslach 1905 e.V. · Tennis · „Pistol Pete" · Florian Haustein · 01742418407
      </div>
    </div>
  )
}
