// src/app/nutzungsbedingungen/page.tsx
export default function Nutzungsbedingungen() {
  const Y = '#FFE600'; const BK = '#111'
  return (
    <div style={{ fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif", minHeight: '100vh', background: '#f4f4ef', color: BK }}>
      <div style={{ background: Y, borderBottom: `4px solid ${BK}`, padding: '0 16px', display: 'flex', alignItems: 'center', height: 64 }}>
        <div style={{ fontWeight: 900, fontSize: 20, textTransform: 'uppercase', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
          TV Häslach
          <span style={{ background: BK, color: Y, borderRadius: 4, padding: '2px 7px', fontSize: 12 }}>1905</span>
          <span style={{ fontWeight: 400, fontSize: 14, borderLeft: `2px solid ${BK}`, paddingLeft: 10, marginLeft: 4 }}>Pistol Pete</span>
        </div>
      </div>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 16px 60px' }}>
        <div style={{ background: '#fff', border: `2px solid ${BK}`, borderRadius: 8, overflow: 'hidden', marginBottom: 24 }}>
          <div style={{ background: Y, borderBottom: `2px solid ${BK}`, padding: '14px 20px', fontWeight: 900, fontSize: 20, textTransform: 'uppercase', letterSpacing: 1 }}>
            📋 Nutzungsbedingungen
          </div>
          <div style={{ padding: 24, lineHeight: 1.7, fontSize: 15 }}>

            <h2 style={{ fontSize: 16, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, marginTop: 0 }}>1. Nutzungsvoraussetzungen</h2>
            <p style={{ margin: '0 0 16px' }}>Die Nutzung der Ballmaschine „Pistol Pete" (Lobster Elite Two) ist ausschließlich Mitgliedern des TV Häslach 1905 e.V. gestattet. Eine Nutzung ist erst nach einer persönlichen Einweisung durch den Ballmaschinenwart zulässig. Mitglieder unter 18 Jahren benötigen das Einverständnis eines Erziehungsberechtigten.</p>

            <h2 style={{ fontSize: 16, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>2. Anmeldung & Freigabe</h2>
            <p style={{ margin: '0 0 16px' }}>Die Registrierung für die App-Nutzung erfolgt über das Anmeldeformular. Jede Registrierung wird manuell durch den Admin geprüft und freigegeben. Nach Freigabe erhält das Mitglied eine E-Mail zur Einrichtung des Passworts. Es besteht kein Anspruch auf sofortige Freigabe.</p>

            <h2 style={{ fontSize: 16, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>3. Abrechnung</h2>
            <p style={{ margin: '0 0 16px' }}>Die Nutzung der Ballmaschine ist kostenpflichtig. Es werden <strong>5,00 € pro angefangene Stunde</strong> berechnet. Die Erfassung erfolgt digital über die Pistol Pete App. Die Abrechnung erfolgt über den Verein.</p>

            <h2 style={{ fontSize: 16, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>4. Sicherheit & Sorgfaltspflichten</h2>
            <ul style={{ margin: '0 0 16px', paddingLeft: 20 }}>
              <li>Niemals in die laufende Maschine fassen — Verletzungsgefahr!</li>
              <li>Die Maschine darf bei Regen oder Nässe nicht verwendet werden.</li>
              <li>Es dürfen ausschließlich die vorgesehenen drucklosen Bälle verwendet werden.</li>
              <li>Die Maschine ist vorsichtig zu transportieren. Bei Stufen ist sie zu tragen.</li>
              <li>Nach der Nutzung ist das Kettenschloss wieder anzubringen.</li>
              <li>Schäden an der Maschine sind unverzüglich dem Ballmaschinenwart zu melden.</li>
            </ul>

            <h2 style={{ fontSize: 16, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>5. Haftung</h2>
            <p style={{ margin: '0 0 16px' }}>Die Nutzung erfolgt auf eigene Gefahr. Der TV Häslach 1905 e.V. übernimmt keine Haftung für Schäden, die durch unsachgemäße Handhabung oder Nichtbeachtung der Sicherheitshinweise entstehen. Für Schäden an der Maschine, die durch grobe Fahrlässigkeit verursacht wurden, haftet der Nutzer.</p>

            <h2 style={{ fontSize: 16, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>6. Datenschutz</h2>
            <p style={{ margin: '0 0 16px' }}>Im Rahmen der Nutzung werden folgende Daten gespeichert: Vorname, Nachname, E-Mail-Adresse sowie Nutzungsdaten (Datum, Dauer, Kosten). Diese Daten werden ausschließlich zur Nutzerverwaltung und Abrechnung der Ballmaschinen-Nutzung innerhalb des TV Häslach 1905 e.V. verwendet. Eine Weitergabe an Dritte erfolgt nicht. Weitere Informationen entnehme bitte dem <a href="/impressum" style={{ color: BK }}>Impressum & Datenschutz</a>.</p>

            <h2 style={{ fontSize: 16, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>7. Änderungen</h2>
            <p style={{ margin: '0 0 0' }}>Der TV Häslach 1905 e.V. behält sich vor, diese Nutzungsbedingungen jederzeit zu ändern. Registrierte Nutzer werden über wesentliche Änderungen per E-Mail informiert.</p>
          </div>
        </div>
        <p style={{ textAlign: 'center', fontSize: 13, color: '#888' }}>
          <a href="/impressum" style={{ color: '#888' }}>Impressum & Datenschutz</a>
          {' · '}
          <a href="/mitmachen" style={{ color: '#888' }}>Zurück zur Anmeldeseite</a>
        </p>
      </div>
    </div>
  )
}
