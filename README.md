# 🎾 Pistol Pete – Ballmaschinen-App
**TV Häslach 1905 e.V. · Tennis**

---

## 🗂 Projektstruktur

```
pistol-pete/
├── public/
│   ├── manifest.json          ← PWA-Manifest (Homescreen-Icon)
│   ├── schnellanleitung.jpg   ← PDF-Scan (schon drin)
│   └── icons/
│       ├── pete.png           ← Pete-Bild für die App
│       ├── icon-192.png       ← Android-Icon
│       ├── icon-512.png       ← Android Splash-Icon
│       └── apple-touch-icon.png ← iOS Homescreen-Icon
├── src/
│   ├── app/
│   │   ├── layout.tsx         ← Root Layout + PWA Meta-Tags
│   │   ├── page.tsx           ← Hauptseite (Auth-Check)
│   │   └── login/page.tsx     ← Login-Seite
│   ├── components/
│   │   ├── AppShell.tsx       ← Navigation + Layout
│   │   ├── CheckIn.tsx        ← Check-in Formular
│   │   ├── History.tsx        ← Nutzungshistorie
│   │   ├── Guide.tsx          ← Schnellanleitung
│   │   └── Admin.tsx          ← Admin-Bereich
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts      ← Browser-Client
│   │   │   ├── server.ts      ← Server-Client
│   │   │   └── types.ts       ← TypeScript-Typen
│   │   └── helpers.ts         ← Hilfsfunktionen
│   └── middleware.ts           ← Auth-Schutz aller Routen
├── supabase/
│   └── schema.sql             ← Datenbankschema (einmalig ausführen)
├── .env.local                 ← Supabase-Keys (NICHT einchecken!)
├── .env.local.example         ← Template für .env.local
└── .gitignore                 ← Schützt .env.local vor Git
```

---

## 🚀 Setup in 5 Schritten

### Schritt 1 – Supabase-Projekt anlegen
1. Gehe zu [supabase.com](https://supabase.com) → **New Project**
2. Name: `pistol-pete`, Region: `Frankfurt (eu-central-1)`
3. Notiere dir: **Project URL** und **anon public key**
   (unter: Project Settings → API)

### Schritt 2 – Datenbank einrichten
1. Im Supabase Dashboard: **SQL Editor** → **New Query**
2. Inhalt von `supabase/schema.sql` einfügen und **Run** klicken
3. ✅ Tabellen `profiles`, `sessions`, `correction_requests` werden angelegt

### Schritt 3 – Admin-User anlegen
1. Supabase Dashboard → **Authentication** → **Users** → **Invite user**
2. Deine E-Mail eingeben → Einladungsmail kommt → Passwort setzen
3. Danach Rolle setzen – im **SQL Editor**:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE id = 'DEINE-USER-ID';
   ```
   (User-ID findest du unter Authentication → Users)

### Schritt 4 – Weitere Mitglieder anlegen
Gleicher Weg: Authentication → Users → Invite user  
→ Rolle bleibt automatisch `member`

### Schritt 5 – Lokal entwickeln
```bash
# Ins Projektverzeichnis
cd pistol-pete

# Abhängigkeiten installieren
npm install

# .env.local befüllen (Supabase URL + anon key)
cp .env.local.example .env.local
# → Öffne .env.local und trage deine Keys ein

# Entwicklungsserver starten
npm run dev
# → http://localhost:3000
```

---

## ☁️ Deployment auf Vercel

```bash
# Vercel CLI installieren (einmalig)
npm i -g vercel

# Deployen
vercel

# Oder: GitHub Repo verbinden unter vercel.com
# → Vercel erkennt Next.js automatisch
```

**Umgebungsvariablen in Vercel setzen:**
1. Vercel Dashboard → Dein Projekt → Settings → Environment Variables
2. Hinzufügen:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://xxx.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `dein-anon-key`

---

## 📱 PWA / Homescreen-Icon

Die App ist als **Progressive Web App (PWA)** konfiguriert.

**iOS (iPhone/iPad):**
1. App im Safari öffnen
2. Teilen-Symbol → „Zum Home-Bildschirm"
3. → Pete-Icon erscheint auf dem Homescreen

**Android:**
1. App in Chrome öffnen
2. Drei-Punkte-Menü → „Zum Startbildschirm hinzufügen"
3. Oder: Chrome zeigt automatisch einen Banner

**Icons bereits generiert:**
- `public/icons/icon-192.png` – Android
- `public/icons/icon-512.png` – Android Splash
- `public/icons/apple-touch-icon.png` – iOS

---

## 🗄️ Datenbank-Übersicht

| Tabelle | Beschreibung |
|---|---|
| `profiles` | Nutzerprofile (Name, Rolle) – verknüpft mit Supabase Auth |
| `sessions` | Ballmaschinen-Nutzungen (Check-ins) |
| `correction_requests` | Korrekturanfragen von Mitgliedern |

**Row Level Security (RLS) ist aktiviert:**
- Mitglieder sehen nur ihre eigenen Daten
- Admins sehen alle Daten
- Niemand kann fremde Sessions manipulieren

---

## 💡 Hinweise

- **Passwörter vergessen?** Supabase Dashboard → Authentication → Users → Reset password
- **Neues Mitglied?** Authentication → Users → Invite user (bekommt E-Mail)
- **Rolle ändern?** SQL Editor: `UPDATE profiles SET role = 'admin' WHERE id = '...'`
- **Kosten:** Supabase Free Tier reicht für diesen Use Case locker aus (500MB, unbegrenzte Auth-Users)
