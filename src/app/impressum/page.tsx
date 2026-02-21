'use client'
// src/app/impressum/page.tsx
import { useRouter } from 'next/navigation'

const Y = '#FFE600'
const BK = '#111'

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 28 }}>
    <div style={{ fontWeight: 900, fontSize: 16, textTransform: 'uppercase', letterSpacing: 1, borderBottom: `3px solid ${BK}`, paddingBottom: 6, marginBottom: 12 }}>
      {title}
    </div>
    <div style={{ fontSize: 15, lineHeight: 1.7, color: '#333' }}>
      {children}
    </div>
  </div>
)

export default function ImpressumPage() {
  const router = useRouter()

  return (
    <div style={{ minHeight: '100vh', background: '#f4f4ef', fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif" }}>
      {/* Header */}
      <div style={{ background: Y, borderBottom: `4px solid ${BK}`, padding: '0 16px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <span style={{ fontWeight: 900, fontSize: 20, textTransform: 'uppercase', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
          TV Häslach
          <span style={{ background: BK, color: Y, borderRadius: 4, padding: '2px 7px', fontSize: 12 }}>1905</span>
          <span style={{ fontWeight: 400, fontSize: 14, borderLeft: `2px solid ${BK}`, paddingLeft: 10, marginLeft: 4 }}>Pistol Pete</span>
        </span>
        <button onClick={() => router.back()}
          style={{ background: 'transparent', color: BK, border: `2px solid ${BK}`, borderRadius: 4, padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 14 }}>
          ← Zurück
        </button>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '28px 16px 60px' }}>

        {/* Titel */}
        <div style={{ background: Y, border: `2px solid ${BK}`, borderRadius: 8, padding: '16px 20px', marginBottom: 24 }}>
          <div style={{ fontWeight: 900, fontSize: 26, textTransform: 'uppercase', letterSpacing: 1 }}>Impressum & Datenschutz</div>
          <div style={{ fontSize: 14, marginTop: 4, color: '#555' }}>Pistol Pete – Ballmaschinen-App · TV Häslach 1905 e.V.</div>
        </div>

        <div style={{ background: '#fff', border: `2px solid ${BK}`, borderRadius: 8, padding: 24 }}>

          {/* ── IMPRESSUM ── */}
          <Section title="Impressum">
            <strong>TV Häslach 1905 e.V. – Abteilung Tennis</strong><br />
            Verantwortlich für diese Anwendung:<br /><br />
            <strong>Florian Haustein</strong><br />
            Ballmaschinenwart / technischer Betreiber<br />
            Kontakt: WhatsApp 01742418407<br /><br />
            Diese App ist eine interne Vereinsanwendung und nicht öffentlich zugänglich. Sie dient ausschließlich der Verwaltung der Ballmaschinennutzung durch Mitglieder des TV Häslach 1905 e.V.
          </Section>

          {/* ── DATENSCHUTZ ── */}
          <Section title="Datenschutzerklärung">
            Der Schutz deiner persönlichen Daten ist uns wichtig. Diese Erklärung informiert dich darüber, welche Daten wir erheben, wie wir sie verwenden und wie lange wir sie speichern.
          </Section>

          <Section title="Welche Daten werden gespeichert?">
            Im Rahmen der Nutzung dieser App werden folgende Daten erhoben und gespeichert:
            <ul style={{ marginTop: 8, paddingLeft: 20, lineHeight: 2 }}>
              <li><strong>Accountdaten:</strong> Name und E-Mail-Adresse (werden beim Anlegen des Accounts durch den Administrator erfasst)</li>
              <li><strong>Nutzungsdaten:</strong> Datum, Uhrzeit, Dauer und Kosten jeder Ballmaschinen-Session</li>
              <li><strong>Korrekturen:</strong> Anpassungen von Buchungen inkl. Begründung</li>
              <li><strong>Technische Logs:</strong> Supabase und Vercel protokollieren serverseitig anonymisierte Zugriffsdaten (IP-Adressen, Zeitstempel) im Rahmen ihres regulären Betriebs</li>
            </ul>
          </Section>

          <Section title="Wofür werden die Daten genutzt?">
            Die gespeicherten Daten dienen ausschließlich folgenden Zwecken:
            <ul style={{ marginTop: 8, paddingLeft: 20, lineHeight: 2 }}>
              <li>Abrechnung der Ballmaschinennutzung (5 € pro angefangene Stunde)</li>
              <li>Verwaltung und Nachverfolgung der Buchungen durch den Ballmaschinenwart</li>
              <li>Erstellung von Abrechnungsübersichten für den Verein</li>
            </ul>
            Es findet kein App-Tracking, keine Weitergabe an Dritte und keine Nutzung für Werbezwecke statt.
          </Section>

          <Section title="Wo werden die Daten gespeichert?">
            Diese App nutzt folgende externe Dienste:<br /><br />
            <strong>Supabase</strong> (Datenbank & Authentifizierung)<br />
            Anbieter: Supabase Inc., 970 Toa Payoh North, Singapur<br />
            Serverstandort: Frankfurt, Deutschland (EU)<br />
            Datenschutz: <a href="https://supabase.com/privacy" target="_blank" rel="noreferrer" style={{ color: BK }}>supabase.com/privacy</a><br /><br />

            <strong>Vercel</strong> (Hosting der Webanwendung)<br />
            Anbieter: Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA, USA<br />
            Serverstandort: Washington D.C., USA (mit EU-Datentransfer-Garantien)<br />
            Datenschutz: <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noreferrer" style={{ color: BK }}>vercel.com/legal/privacy-policy</a>
          </Section>

          <Section title="Wie lange werden die Daten gespeichert?">
            <ul style={{ marginTop: 8, paddingLeft: 20, lineHeight: 2 }}>
              <li><strong>Buchungsdaten</strong> werden nach Abschluss der Abrechnung durch den Administrator manuell zurückgesetzt (Reset-Funktion)</li>
              <li><strong>Accountdaten</strong> bleiben bestehen solange du Mitglied bist und einen Zugang benötigst</li>
              <li><strong>Technische Logs</strong> werden von Supabase und Vercel gemäß deren eigenen Datenschutzrichtlinien automatisch gelöscht (in der Regel nach 30–90 Tagen)</li>
            </ul>
          </Section>

          <Section title="Deine Rechte (DSGVO)">
            Als betroffene Person hast du folgende Rechte:
            <ul style={{ marginTop: 8, paddingLeft: 20, lineHeight: 2 }}>
              <li><strong>Auskunft:</strong> Du kannst jederzeit Auskunft über deine gespeicherten Daten verlangen</li>
              <li><strong>Berichtigung:</strong> Fehlerhafte Daten werden auf Anfrage korrigiert</li>
              <li><strong>Löschung:</strong> Du kannst die Löschung deines Accounts und aller zugehörigen Daten beantragen</li>
              <li><strong>Widerspruch:</strong> Du kannst der Verarbeitung deiner Daten widersprechen</li>
            </ul>
            Wende dich dazu an: <strong>Florian Haustein</strong> · WhatsApp 01742418407
          </Section>

          <Section title="Cookies & lokale Speicherung">
            Diese App verwendet ausschließlich technisch notwendige Cookies zur Aufrechterhaltung deiner Anmeldesitzung (Session-Cookie von Supabase). Es werden keine Tracking-Cookies, keine Werbe-Cookies und keine Analyse-Dienste eingesetzt.
          </Section>

          <Section title="Änderungen dieser Erklärung">
            Diese Datenschutzerklärung kann bei Bedarf angepasst werden. Die jeweils aktuelle Version ist in der App abrufbar.
          </Section>

          <div style={{ borderTop: `2px solid #eee`, paddingTop: 16, marginTop: 8, fontSize: 13, color: '#888' }}>
            Stand: Februar 2026 · TV Häslach 1905 e.V. – Abteilung Tennis
          </div>
        </div>
      </div>
    </div>
  )
}
