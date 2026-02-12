# Automatische Astro-Aktualisierung bei Payload CMS Änderungen

Diese Dokumentation beschreibt die Implementierung der automatischen Aktualisierung von Astro, wenn Inhalte in Payload CMS geändert werden.

## Übersicht

Das System verwendet Payload CMS Hooks, um einen Webhook-Endpunkt in Astro aufzurufen, sobald Inhalte geändert werden. Dies ermöglicht es, dass die Astro-Website immer die aktuellsten Daten von Payload CMS anzeigt.

## Architektur

```
Payload CMS (Port 3001)
    │
    ├─ afterChange Hook (Events, Pages, Testimonials)
    ├─ afterDelete Hook
    ├─ afterChange Hook (SiteSettings)
    │
    └─> POST /api/revalidate ──> Astro (Port 4400)
                                       │
                                       └─> SSR holt frische Daten beim nächsten Request
```

## Implementierung

### 1. Payload CMS Seite

#### Hook-Implementierung (`cms/src/lib/triggerRevalidate.ts`)
- Zentrale Funktion zum Auslösen der Revalidierung
- Sendet POST-Request an Astro Revalidation-Endpunkt
- Enthält Fehlerbehandlung und Logging
- Benötigt `REVALIDATE_SECRET` für Authentifizierung

#### Collections mit Hooks:
- **Events** (`cms/src/collections/Events.ts`): Löst Revalidierung aus, wenn ein Event veröffentlicht, aktualisiert oder gelöscht wird
- **Pages** (`cms/src/collections/Pages.ts`): Löst Revalidierung aus, wenn eine Seite veröffentlicht, aktualisiert oder gelöscht wird
- **Testimonials** (`cms/src/collections/Testimonials.ts`): Löst Revalidierung aus, wenn ein Testimonial veröffentlicht oder der Status geändert wird

#### Globals mit Hooks:
- **SiteSettings** (`cms/src/globals/SiteSettings.ts`): Löst vollständige Revalidierung aus, wenn Einstellungen geändert werden

### 2. Astro Seite

#### Revalidation Endpoint (`web/src/pages/api/revalidate.ts`)
- Empfängt Webhook-Aufrufe von Payload CMS
- Validiert das Secret-Token
- Loggt Revalidierungsanfragen
- In SSR-Modus werden automatisch frische Daten bei jedem Request geholt

## Konfiguration

### Umgebungsvariablen

#### Payload CMS (`cms/.env`)
```bash
# Astro URL für Revalidierung (ERFORDERLICH in Produktion)
ASTRO_REVALIDATE_URL=http://localhost:4400

# Shared Secret für Authentifizierung (ERFORDERLICH)
REVALIDATE_SECRET=your-secret-here
```

**Wichtig:** Beide Umgebungsvariablen müssen gesetzt sein, sonst wird die Revalidierung übersprungen.

#### Astro (`web/.env`)
```bash
# Shared Secret (muss mit Payload CMS übereinstimmen, ERFORDERLICH)
REVALIDATE_SECRET=your-secret-here
```

### Lokale Entwicklung

1. Kopiere die `.env.example` Dateien:
```bash
cp cms/.env.example cms/.env
cp web/.env.example web/.env
```

2. Generiere ein sicheres Secret (z.B. mit `openssl rand -base64 32`)

3. Setze das gleiche Secret in beiden `.env` Dateien:
```bash
REVALIDATE_SECRET=dein-generiertes-secret
```

### Production

In der Produktion solltest du:
1. Ein starkes, zufälliges Secret generieren
2. Die URLs auf deine Production-Domains setzen:
   - `ASTRO_REVALIDATE_URL=https://your-domain.com`
3. Die Secrets als Umgebungsvariablen im Hosting-System setzen (z.B. Coolify, Docker Compose)

## Funktionsweise

### SSR-Modus (aktueller Stand)

Da Astro im SSR-Modus mit dem Bun-Adapter läuft:
- Jeder Request holt frische Daten von Payload CMS
- Kein statischer Build-Cache, der invalidiert werden muss
- Der Webhook dient primär als Benachrichtigung und für zukünftige Optimierungen

### Zukünftige Optimierungen

Der Revalidation-Endpoint kann erweitert werden für:
- **Cache-Invalidierung**: Implementierung eines Application-Level-Caches
- **Pub/Sub Pattern**: Benachrichtigung mehrerer Astro-Instanzen
- **CI/CD Trigger**: Auslösen eines statischen Rebuilds für statische Exports
- **Selective Revalidation**: Nur spezifische Routen neu laden

## Testen

### Manueller Test

1. Starte beide Services:
```bash
# Terminal 1: CMS
cd cms
bun run dev

# Terminal 2: Astro
cd web
bun run dev
```

2. Melde dich im CMS an: http://localhost:3001/admin

3. Ändere ein Event, eine Page oder ein Testimonial und veröffentliche es

4. Überprüfe die Logs:
   - CMS-Terminal: Sollte "Astro revalidation triggered..." zeigen
   - Astro-Terminal: Sollte "Revalidation triggered..." zeigen

5. Besuche die entsprechende Seite in Astro: http://localhost:4400

### Troubleshooting

**Keine Logs sichtbar:**
- Überprüfe, ob `REVALIDATE_SECRET` in beiden `.env` Dateien gesetzt ist
- Stelle sicher, dass die Secrets übereinstimmen
- Überprüfe die `ASTRO_REVALIDATE_URL` in der CMS-Konfiguration

**401 Unauthorized:**
- Die Secrets stimmen nicht überein
- Überprüfe beide `.env` Dateien

**500 Internal Server Error:**
- `REVALIDATE_SECRET` ist nicht in der Astro `.env` gesetzt
- Überprüfe die Astro-Server-Logs für Details

## Best Practices

1. **Sichere Secrets**: Verwende starke, zufällige Secrets in der Produktion
2. **Umgebungsspezifische Konfiguration**: Verwende unterschiedliche URLs für Dev/Staging/Production
3. **Monitoring**: Überwache die Logs, um sicherzustellen, dass Revalidierungen erfolgreich sind
4. **Fehlerbehandlung**: Die Implementierung läuft auch weiter, wenn die Revalidierung fehlschlägt (graceful degradation)

## Weiterführende Ressourcen

- [Payload CMS Hooks Documentation](https://payloadcms.com/docs/hooks/overview)
- [Astro SSR Documentation](https://docs.astro.build/en/guides/server-side-rendering/)
- [Webhook Security Best Practices](https://webhooks.fyi/security/best-practices)
