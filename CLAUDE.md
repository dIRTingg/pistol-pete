# CLAUDE.md — Pistol Pete App
# TV Häslach 1905 e.V. · Abteilung Tennis

> Lies diese Datei vollständig bevor du irgendetwas änderst.
> Sie enthält alle Entscheidungen, Strukturen und Konventionen die in
> langen Gesprächen mit Claude.ai erarbeitet wurden.

---

## Projekt-Überblick

**Name:** Pistol Pete – Ballmaschinen-Buchungssystem  
**URL:** https://pistol-pete.vercel.app  
**Stack:** Next.js 15 (App Router) + Supabase + Vercel + Resend  
**Status:** Produktiv in Betrieb  
**Verantwortlich:** Florian Haustein (Ballmaschinenwart), WhatsApp 01742418407

Die App ermöglicht Mitgliedern des TV Häslach 1905 e.V. das digitale
Einchecken bei der Nutzung der Ballmaschine „Pistol Pete" (Lobster Elite Two),
zeigt den Zahlencode für das Kettenschloss nach erfolgreichem Check-in und
bietet Admins ein vollständiges Dashboard zur Nutzerverwaltung.

---

## Tech-Stack

| Technologie | Version | Zweck |
|---|---|---|
| Next.js | 15.2.1 | App Router, Server Components, API Routes |
| React | 18.3.0 | UI |
| TypeScript | 5 | Typisierung |
| Supabase | @supabase/supabase-js 2.45.0 | DB, Auth, RLS |
| @supabase/ssr | 0.5.0 | Server-Side Rendering |
| Vercel | Hobby-Plan | Hosting, CI/CD, Edge Network |
| Resend | Free Tier | Admin E-Mail-Benachrichtigungen |

---

## Projektstruktur

```
pistol-pete/
  src/
    app/
      page.tsx                  # Hauptseite (Auth-Guard → AppShell)
      layout.tsx                # Root Layout + PWA Meta-Tags
      login/page.tsx            # Login + PWA Install-Banner
      mitmachen/page.tsx        # Landingpage (öffentlich)
      registrierung/page.tsx    # Registrierungsformular (öffentlich)
      nutzungsbedingungen/      # Nutzungsbedingungen (öffentlich)
      impressum/page.tsx        # Impressum & Datenschutz (öffentlich)
      auth/
        callback/route.ts       # token_hash Verarbeitung (Invite/Reset)
        confirm/page.tsx        # Passwort festlegen nach Invite
      api/
        admin/invite/route.ts   # Nutzer einladen (SERVICE_ROLE_KEY!)
        notify-admin/route.ts   # E-Mail via Resend bei neuer Registrierung
    components/
      AppShell.tsx              # Navigation (5 Tabs) + Layout + Ungelesen-Badge (News)
      CheckIn.tsx               # Check-in Formular + Erfolgs-Screen + Schloss-Code + News-Banner + Celebration
      History.tsx               # Nutzungshistorie + Korrekturanfragen
      Guide.tsx                 # Schnellanleitung Ballmaschine + PDF-Download
      Admin.tsx                 # Admin-Dashboard (6 Tabs)
      News.tsx                  # Schwarzes Brett — Feed (Mitglieder-Ansicht)
      NewsBanner.tsx            # Wegklickbares News-Banner auf dem Check-in-Screen
      NewsAdmin.tsx             # Schwarzes Brett — Admin-CRUD (Liste + Formular + Bild-Upload)
      TennisBallCelebration.tsx # Einmal-Animation (fallende Tennisbälle) nach Check-in
    lib/
      supabase/
        client.ts               # Browser-seitiger Supabase-Client
        server.ts               # Server-seitiger Supabase-Client
        types.ts                # TypeScript-Typen (Tabellen + RPC-Signaturen)
      helpers.ts                # calcCost, formatDate, formatTime, formatDateTime
    middleware.ts               # Auth-Guard für alle Routen
  public/
    manifest.json               # PWA-Manifest
    icons/                      # icon-192, icon-512, icon-512-maskable, apple-touch-icon, pete.png
    Schnellanleitung_Ballmaschine.pdf
  next.config.js                # Security Headers
  package.json
```

---

## Design-System

Alle Komponenten verwenden inline styles — keine CSS-Dateien, keine Tailwind.

```typescript
const Y  = '#FFE600'  // TV Häslach Gelb — Primärfarbe
const BK = '#111111'  // Fast-Schwarz — Text, Borders
// Weitere: '#f4f4ef' Hintergrund, '#34c759' Grün, '#ff3b30' Rot
```

**Schriften:** System-Font-Stack via `fontFamily: 'inherit'`  
**Kein** externes CSS-Framework. Kein Tailwind. Kein styled-components.

---

## Supabase — Datenbank

**Projekt-Region:** eu-central-1 (Frankfurt, AWS) — DSGVO-konform  
**Authentifizierung:** E-Mail / Passwort + Admin-Invite-Flow

### Tabellen

#### `profiles`
```sql
id          UUID (PK) — Referenz auf auth.users
first_name  TEXT
last_name   TEXT
name        TEXT — Legacy-Feld (first_name + last_name zusammen)
email       TEXT — gespiegelt aus auth.users (per Trigger + Invite-Route befüllt)
role        TEXT — 'member' | 'admin'
created_at  TIMESTAMPTZ
```
> ℹ️ `email` wurde nachträglich hinzugefügt und wird von `handle_new_user()` sowie
> der Invite-Route gepflegt. Für den letzten Login gibt es KEIN Feld in `profiles` —
> `auth.users.last_sign_in_at` wird über die RPC `get_profiles_with_last_login()` gelesen.

#### `sessions`
```sql
id            UUID (PK)
user_id       UUID (FK → profiles.id)
user_name     TEXT — denormalisiert (first_name + last_name zum Zeitpunkt des Check-ins)
start_at      TIMESTAMPTZ
duration_min  INTEGER (30–180)
cost          NUMERIC
note          TEXT nullable
status        TEXT — 'confirmed' | 'cancelled'   (CHECK-Constraint!)
created_at    TIMESTAMPTZ
```
> ⚠️ Der Check-Constraint `sessions_status_check` erlaubt NUR `'confirmed'` und
> `'cancelled'`. Beim Check-in immer `status: 'confirmed'` setzen — NICHT `'active'`.

#### `correction_requests`
```sql
id                  UUID (PK)
session_id          UUID (FK → sessions.id)
user_id             UUID (FK → profiles.id)
user_name           TEXT
requested_duration  INTEGER (0 = Stornierung)
reason              TEXT
status              TEXT — 'pending' | 'approved' | 'rejected'
created_at          TIMESTAMPTZ
```

#### `registration_requests`
```sql
id               UUID (PK)
first_name       TEXT
last_name        TEXT
email            TEXT
accepted_terms   BOOLEAN
accepted_billing BOOLEAN
accepted_privacy BOOLEAN
status           TEXT — 'pending' | 'invited' | 'rejected'
created_at       TIMESTAMPTZ
```

#### `settings`
```sql
id     TEXT (PK) — z.B. 'lock_code'
value  TEXT
```

#### `news` — Schwarzes Brett
```sql
id           UUID (PK)
title        TEXT — Headline
body         TEXT — Fließtext
image_url    TEXT nullable — Supabase-Storage-URL ODER externe URL
link_target  TEXT nullable — App-Bereich: 'checkin' | 'history' | 'guide'
                             | '/nutzungsbedingungen' | '/impressum'
link_label   TEXT nullable — Button-Beschriftung (z.B. 'Anleitung öffnen')
published_at TIMESTAMPTZ — „Sichtbar ab"
expires_at   TIMESTAMPTZ nullable — „Sichtbar bis" (null = läuft nie ab)
created_at   TIMESTAMPTZ
created_by   UUID (FK → profiles.id) nullable
```
> Status wird NICHT gespeichert, sondern client-seitig aus `published_at`/`expires_at`
> abgeleitet: `geplant` (vor ab) · `aktiv` (im Fenster) · `abgelaufen` (nach bis).

#### `news_reads` — Lese-Status pro Nutzer
```sql
user_id  UUID (FK → profiles.id)
news_id  UUID (FK → news.id)
read_at  TIMESTAMPTZ
PRIMARY KEY (user_id, news_id)
```
> Treibt den Ungelesen-Badge. Öffnen des News-Tabs ruft `mark_all_news_read()`.
> Banner-Dismissal läuft separat über `localStorage` (Key `pp-news-banner-dismissed`).

### Datenbank-Trigger
```sql
-- Legt profiles-Eintrag beim Erstellen eines Auth-Users an
-- Liest first_name, last_name, role aus raw_user_meta_data, spiegelt email
on_auth_user_created → handle_new_user()
```

### Datenbank-Funktionen (RPC)
Aufruf per `supabase.rpc('name', args)`. Alle als `SECURITY DEFINER` (umgehen RLS gezielt).

| Funktion | Args | Zweck |
|---|---|---|
| `is_admin()` | – | Prüft ob aktueller Nutzer Admin ist (in RLS-Policies verwendet) |
| `calc_cost(duration_minutes)` | int | Kostenberechnung serverseitig |
| `resolve_correction(p_correction_id, p_approve)` | uuid, bool | Korrektur genehmigen/ablehnen |
| `check_email_available(p_email)` | text | Registrierungs-Duplikat-Check (RLS-sicher). Liefert `available` / `registered` / `pending` / `invited` / `rejected`. Nimmt den **neuesten** Eintrag (`ORDER BY created_at DESC`), damit eine alte Ablehnung eine neue Bewerbung nicht blockiert. |
| `get_profiles_with_last_login()` | – | Nutzerliste + `last_sign_in_at` (JOIN auf `auth.users`) für Admin |
| `get_unread_news_count()` | – | Anzahl ungelesener aktiver Nachrichten (Badge) |
| `mark_all_news_read()` | – | Markiert alle aktiven Nachrichten für den Nutzer als gelesen |

### Supabase Storage
- Bucket **`news-images`** (public read) — Bilder fürs Schwarze Brett
- Upload/Update/Delete nur für Admins (`is_admin()` in den storage.objects-Policies)
- Öffentliche URLs → müssen in der CSP unter `img-src` erlaubt sein (`https:`)
- Beim Löschen einer Nachricht wird das zugehörige Bild mitgelöscht
  (nur eigene Uploads mit `/news-images/` im Pfad; externe URLs bleiben unberührt)

### Row-Level Security
Alle Tabellen haben RLS aktiviert. Zusammenfassung:
- `profiles`: Nutzer sieht nur eigenes Profil, Admins sehen alle
- `sessions`: Nutzer sieht nur eigene, INSERT nur authenticated
- `correction_requests`: Nutzer sieht nur eigene, INSERT nur authenticated
- `registration_requests`: INSERT auch anonym (öffentliches Formular), SELECT/UPDATE nur Admins
- `settings`: SELECT alle authenticated, ALL-write nur Admins
- `news`: SELECT für aktive Nachrichten (published_at ≤ now < expires_at) ODER Admin;
  INSERT/UPDATE/DELETE nur Admins
- `news_reads`: jeder Nutzer verwaltet nur seine eigenen Zeilen (`user_id = auth.uid()`)

---

## Umgebungsvariablen

```bash
# Vercel — alle hinterlegt unter Settings → Environment Variables
NEXT_PUBLIC_SUPABASE_URL        # Supabase Projekt-URL (öffentlich)
NEXT_PUBLIC_SUPABASE_ANON_KEY   # Anon Key (öffentlich — by design)
SUPABASE_SERVICE_ROLE_KEY       # Service Role Key — NUR serverseitig, nie NEXT_PUBLIC_!
RESEND_API_KEY                  # Resend API Key für Admin-Mails
ADMIN_EMAIL                     # f.haustein@gmx.net
```

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` darf NIEMALS mit `NEXT_PUBLIC_`-Prefix verwendet werden.
> Er wird ausschließlich in `src/app/api/admin/invite/route.ts` (Server-Route) verwendet.

---

## Öffentliche Routen (kein Login nötig)

```typescript
// src/middleware.ts
const publicPaths = [
  '/login',
  '/auth/callback',
  '/auth/confirm',
  '/impressum',
  '/mitmachen',
  '/registrierung',
  '/nutzungsbedingungen',
  '/api/notify-admin',
]
```

---

## Wichtige Implementierungsdetails

### Rollen
- Rollen **immer** aus `profiles.role` lesen — niemals aus `user_metadata` oder JWT-Claims
- Nur zwei Rollen: `'member'` und `'admin'`
- Rollenvergabe: App → Admin-Tab → Nutzer → Bearbeiten, oder direkt in Supabase Table Editor

### Invite-Flow
1. Admin lädt über App ein (Admin → Nutzer-Tab → Formular)
2. API Route `/api/admin/invite` prüft Admin-Rolle serverseitig
3. `supabase.auth.admin.inviteUserByEmail()` mit Metadaten (first_name, last_name, role)
4. Trigger `handle_new_user()` liest Metadaten und befüllt `profiles`
5. Nutzer klickt Link → `/auth/callback?token_hash=...&type=invite` → `verifyOtp()` → `/auth/confirm`

### Schloss-Code
- Gespeichert in `settings` Tabelle mit `id = 'lock_code'`
- Wird nur im Erfolgs-Screen nach Check-in angezeigt
- Admin pflegt ihn unter Admin → Einstellungen
- RLS: Alle authentifizierten Nutzer dürfen lesen, nur Admins dürfen schreiben

### Kostenberechnung
```typescript
// src/lib/helpers.ts
export const calcCost = (durationMin: number) =>
  Math.ceil(durationMin / 60) * 5
// 5 € pro angefangene Stunde
```

### PDF (Schnellanleitung)
- Liegt unter `public/Schnellanleitung_Ballmaschine.pdf`
- Im Middleware-Matcher von Auth ausgenommen: `.*\\.pdf` im exclude-Pattern
- Direktlink: `https://pistol-pete.vercel.app/Schnellanleitung_Ballmaschine.pdf`

### Schwarzes Brett (Neuigkeiten)
- **Tab „Neues"** in der Hauptnavigation (`AppShell`) mit rotem Ungelesen-Badge
  (Zähler aus `get_unread_news_count()`, gedeckelt bei „9+")
- **Feed** (`News.tsx`): aktive Nachrichten, neueste oben; ungelesene mit gelbem
  Rand + „NEU"-Badge. Beim Öffnen `mark_all_news_read()` → Badge auf 0
- **Banner** (`NewsBanner.tsx`): neueste ungelesene Nachricht auf dem Check-in-Screen.
  Tap → News-Tab, X → wegklicken (localStorage, bis eine neuere Nachricht kommt)
- **Interne Links**: `link_target` ist ein Tab-Name (`checkin`/`history`/`guide`) oder
  ein Pfad (`/nutzungsbedingungen`/`/impressum`). `navigateTo()` in AppShell entscheidet:
  Pfad → `router.push`, sonst → `setPage`
- **Admin** (`NewsAdmin.tsx`, unter Admin → Brett): Liste mit Status-Pills
  (Aktiv/Geplant/Abgelaufen), Formular mit Bild-Upload (Supabase Storage) **oder** URL,
  internem Link-Picker, Sichtbarkeitsfenster (ab/bis). „Abgelaufene löschen"-Button
  (erscheint nur bei vorhandenen abgelaufenen) räumt DB + Bilder auf
- **Bild-Upload**: `supabase-js upload()` liefert keine Progress-Events →
  indeterminater Balken. Limit 5 MB, nur Bilddateien

---

## Security-Konfiguration

### next.config.js — Security Headers
```javascript
// Alle gesetzt via async headers()
'X-Frame-Options': 'DENY'
'X-Content-Type-Options': 'nosniff'
'Referrer-Policy': 'strict-origin-when-cross-origin'
'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.resend.com; frame-ancestors 'none'; object-src 'none'"
```
> `img-src` enthält `https:` — nötig für News-Bilder (Supabase Storage + externe URLs).
> `style-src`/`font-src` enthalten Google Fonts (Barlow Condensed).

### Bekannte Tradeoffs
- `unsafe-inline` in CSP `script-src` — Next.js App Router Requirement, nicht vermeidbar ohne Nonce-System
- Supabase Anon Key im Client-Bundle — by design, Sicherheit über RLS
- Kein Rate Limiting auf Login — Supabase built-in ausreichend für Vereinsgröße
- Open Signup: **deaktiviert** (Supabase → Authentication → Sign In/Providers)

---

## PWA-Konfiguration

```json
// public/manifest.json
{
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#FFE600",
  "theme_color": "#FFE600",
  "icons": [
    { "src": "/icons/icon-192.png",          "sizes": "192x192", "purpose": "any" },
    { "src": "/icons/icon-512.png",          "sizes": "512x512", "purpose": "any" },
    { "src": "/icons/icon-512-maskable.png", "sizes": "512x512", "purpose": "maskable" },
    { "src": "/icons/apple-touch-icon.png",  "sizes": "180x180" }
  ]
}
```

iOS Install-Banner und Android `beforeinstallprompt` sind in `login/page.tsx` implementiert.

---

## Admin-Dashboard Tabs

| Tab | Interne ID | Funktion |
|---|---|---|
| Korrekturen | `corrections` | Offene Korrekturanfragen genehmigen/ablehnen (Badge-Zähler) |
| Anfragen | `registrations` | Registrierungsanfragen aus `/registrierung` — direkt einladen |
| Buchungen | `sessions` | Alle Sessions aller Nutzer + CSV-Export + Reset |
| Nutzer | `users` | Einladeformular + Bearbeiten (Name, Rolle), letzter Login + Session-Anzahl |
| Brett | `brett` | Schwarzes Brett — Nachrichten anlegen/bearbeiten/löschen (`NewsAdmin`) |
| Einstellungen | `settings` | Zahlencode Kettenschloss pflegen |

---

## Externe Dienste

### Vercel
- Hobby-Plan (kostenlos)
- Auto-Deploy bei `git push` auf main
- Build: `next build`
- Domain: `pistol-pete.vercel.app`

### Supabase
- Free Tier (kostenlos)
- Auth E-Mail-Limit: 3/Stunde auf Free Tier → bei Masseneinladungen staffeln
- Geplant: eigene SMTP-Domain via Resend sobald Vereinsdomain verfügbar

### Resend
- Free Tier (100 Mails/Tag)
- Verwendung: Admin-Benachrichtigung bei neuer Registrierung (`/api/notify-admin`)
- Konto-E-Mail muss mit `ADMIN_EMAIL` übereinstimmen (Free Tier Einschränkung)

---

## Deployment

```bash
# Standard-Workflow
git add .
git commit -m "Beschreibung"
git push  # Vercel deployt automatisch (~60 Sek.)

# Redeploy ohne Code-Änderung (z.B. nach Env-Variablen-Änderung)
git commit --allow-empty -m "trigger redeploy" && git push
```

---

## Offene Punkte / Bekannte TODOs

- [ ] Eigene SMTP-Domain in Supabase hinterlegen sobald Vereinsdomain verfügbar
      (dann kein 3/Stunde Limit mehr bei Auth-Mails)
- [ ] 20 bestehende Nutzer migrieren: über Supabase Authentication → Add user,
      dann Mail mit "Passwort vergessen"-Anleitung versenden
- [ ] iOS/Android: Nach Icon-Update PWA neu installieren (Cache-Problem)
- [ ] Bewässerungs-Feature: geparkt, Konzept in separatem Dokument vorhanden

---

## Nicht anfassen ohne Rücksprache

- `SUPABASE_SERVICE_ROLE_KEY` — nur in Server-Routes verwenden
- RLS-Policies — vor Änderungen immer alle Policies prüfen
- `handle_new_user()` Trigger — beeinflusst Profil-Anlage bei Invite (befüllt auch `email`)
- `src/middleware.ts` publicPaths — falsches Whitelisting bricht Auth-Flow
- SECURITY-DEFINER-Funktionen (`check_email_available`, `get_unread_news_count`,
  `mark_all_news_read`, `get_profiles_with_last_login`) — umgehen RLS bewusst,
  Änderungen mit Bedacht
- Storage-Bucket `news-images` + dessen Policies — Bild-Upload des Schwarzen Bretts

---

## Wichtige Konvention: Supabase-Client & TypeScript

Der Browser-Client ist NICHT mit dem `Database`-Generic typisiert → Supabase-Queries
(`.insert()`, `.update()`, `.rpc()`) erzeugen `never`-Typfehler. Das ist im gesamten
Projekt so und **gewollt toleriert**: `next.config.js` hat `typescript.ignoreBuildErrors: true`,
d.h. diese Fehler blockieren den Build NICHT und die Queries laufen zur Laufzeit korrekt.
Bei `npx tsc --noEmit` sind diese `never`-Fehler daher zu erwarten und kein echtes Problem.

---

*Zuletzt aktualisiert: Juli 2026 — Schwarzes Brett (Neuigkeiten-Feature) ergänzt,
E-Mail-Feld/Last-Login/RPCs dokumentiert*
