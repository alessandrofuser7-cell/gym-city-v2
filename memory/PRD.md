# Gym City Pescara - PRD

## Problem Statement
App per la palestra A.S.D. Gym City Pescara con sistema di prenotazione corsi, autenticazione utenti e gestione abbonamenti.

## Architettura
- **Frontend**: React + TypeScript + TailwindCSS + Framer Motion
- **Backend**: Express.js + TypeScript + FastAPI (proxy)
- **Database**: MongoDB (mongoose)
- **Autenticazione**: JWT + bcrypt
- **Email**: SendGrid

## Contatti Palestra
- **Indirizzo**: Strada della Bonifica, 126 - 65129 Pescara (PE)
- **Email**: gymcityasd@gmail.com
- **Telefono**: 085.693819
- **Instagram**: @asd_gym_city_pescara
- **Facebook**: Gym City Pescara

## User Personas
1. **Admin**: Gestisce utenti, corsi, orari. Crea/modifica/disattiva account, gestisce scadenze abbonamento, invia notifiche email
2. **Utente**: Prenota corsi (max 1/giorno), visualizza proprie prenotazioni
3. **Istruttore**: Visualizza prenotazioni giornaliere, registra presenze

## Core Requirements - TUTTI COMPLETATI ✅
- [x] Autenticazione con JWT (secret sicuro in variabile ambiente)
- [x] Password crittografate con bcrypt (salt 12)
- [x] 3 ruoli: admin, user, instructor
- [x] Solo admin può creare account
- [x] Scadenza abbonamento per utenti
- [x] Protezione API con middleware
- [x] Prenotazione max 1 corso al giorno
- [x] Prenotazioni aperte solo giorno precedente
- [x] Dashboard admin completa
- [x] Design responsive (mobile-first)
- [x] Credenziali demo rimosse da login
- [x] **Cambio password forzato al primo login**
- [x] **Backup database manuale (JSON) + automatico (script cron)**
- [x] **Monitoraggio scadenze abbonamenti (dashboard)**
- [x] **Notifiche email con SendGrid**

## Implemented Features (Apr 2026)
- Backend completo con MongoDB
- Sistema autenticazione JWT con secret sicuro
- Cambio password obbligatorio al primo accesso
- 12 corsi precaricati
- 26 lezioni settimanali
- 5 istruttori: Gianluca, Andrea, Sisto, Luca, Hanna
- Pagina login senza credenziali demo
- Calendario interattivo con transizioni
- Banner scorrevole "LA VERA PALESTRA - ACCESSIBILE A TUTTI"
- Transizioni pagina con Framer Motion
- Dashboard Admin con:
  - Tab Utenti: gestione completa
  - Tab Scadenze: monitoraggio abbonamenti (scaduti, 7gg, 30gg)
  - Tab Corsi: lista corsi
  - Pulsante Backup (download JSON)
  - Pulsante Invia Notifiche Email
- Footer con indirizzo, contatti e social
- Design responsive testato su mobile
- Notifiche email automatiche scadenza abbonamento

## API Endpoints
### Auth
- POST /api/auth/login
- GET /api/auth/me
- PUT /api/auth/change-password
- POST /api/auth/users (admin)
- GET /api/auth/users (admin)
- PUT /api/auth/users/:id (admin)

### Admin
- GET /api/admin/expiring-subscriptions
- GET /api/admin/backup
- POST /api/admin/send-expiry-notifications

### Corsi & Prenotazioni
- GET /api/courses
- GET /api/schedule
- POST /api/bookings
- GET /api/bookings/my
- DELETE /api/bookings/:id

## Configurazione Cron (per backup automatico)
```bash
# Backup giornaliero alle 2:00
0 2 * * * /app/server/jobs/backup.sh

# Notifiche scadenza giornaliere alle 9:00
0 9 * * * cd /app && npx tsx server/jobs/send-expiry-notifications.ts
```

## Variabili Ambiente
- MONGO_URI
- JWT_SECRET
- SENDGRID_API_KEY

## Test Completati
- [x] Backend: 95.2% (20/21 tests)
- [x] Frontend: 100%
- [x] Mobile responsive: 100%

## Pronto per Deploy ✅
