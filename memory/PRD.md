# Gym City Pescara - PRD

## Problem Statement
App per la palestra A.S.D. Gym City Pescara con sistema di prenotazione corsi, autenticazione utenti e gestione abbonamenti.

## Architettura
- **Frontend**: React + TypeScript + TailwindCSS + Framer Motion
- **Backend**: Express.js + TypeScript + FastAPI (proxy)
- **Database**: MongoDB (mongoose)
- **Autenticazione**: JWT + bcrypt

## Contatti Palestra
- **Indirizzo**: Strada della Bonifica, 126 - 65129 Pescara (PE)
- **Email**: gymcityasd@gmail.com
- **Telefono**: 085.693819
- **Instagram**: @asd_gym_city_pescara
- **Facebook**: Gym City Pescara

## User Personas
1. **Admin**: Gestisce utenti, corsi, orari. Crea/modifica/disattiva account, gestisce scadenze abbonamento
2. **Utente**: Prenota corsi (max 1/giorno), visualizza proprie prenotazioni
3. **Istruttore**: Visualizza prenotazioni giornaliere, registra presenze

## Core Requirements
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

## Implemented Features (Apr 2026)
- Backend completo con MongoDB
- Sistema autenticazione JWT con secret sicuro
- 12 corsi precaricati
- 26 lezioni settimanali
- 5 istruttori: Gianluca, Andrea, Sisto, Luca, Hanna
- Pagina login senza credenziali demo
- Calendario interattivo con transizioni
- Banner scorrevole "LA VERA PALESTRA - ACCESSIBILE A TUTTI"
- Transizioni pagina con Framer Motion
- Dashboard Admin completa
- Footer con indirizzo, contatti e social
- Design responsive testato su mobile

## API Endpoints
### Auth
- POST /api/auth/login - Login utente
- GET /api/auth/me - Profilo utente corrente
- POST /api/auth/users - Crea utente (admin)
- GET /api/auth/users - Lista utenti (admin)
- PUT /api/auth/users/:id - Modifica utente (admin)
- DELETE /api/auth/users/:id - Disattiva utente (admin)

### Corsi & Prenotazioni
- GET /api/courses - Lista corsi
- GET /api/schedule - Orario settimanale
- POST /api/bookings - Crea prenotazione
- GET /api/bookings/my - Mie prenotazioni
- DELETE /api/bookings/:id - Cancella prenotazione

## Credenziali (da cambiare in produzione)
- Admin: admin@gymcity.com / admin123
- Utente test: mario.rossi@example.com / user123

## Test Completati
- [x] Login admin
- [x] Dashboard admin
- [x] Creazione utente
- [x] Login utente
- [x] Calendario corsi
- [x] Prenotazione corso
- [x] Responsive mobile (tutte le pagine)

## Backlog P1
- [ ] Notifiche scadenza abbonamento
- [ ] Report presenze mensili
- [ ] Statistiche frequenza corsi

## Backlog P2
- [ ] App mobile (PWA)
- [ ] Integrazione pagamenti
- [ ] Sistema notifiche push
