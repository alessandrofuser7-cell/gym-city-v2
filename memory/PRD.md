# Gym City Pescara - PRD

## Problem Statement
App per la palestra A.S.D. Gym City Pescara con sistema di prenotazione corsi, autenticazione utenti e gestione abbonamenti.

## Architettura
- **Frontend**: React + TypeScript + TailwindCSS + Framer Motion
- **Backend**: Express.js + TypeScript
- **Database**: MongoDB (mongoose)
- **Autenticazione**: JWT + bcrypt

## User Personas
1. **Admin**: Gestisce utenti, corsi, orari. Crea/modifica/disattiva account
2. **Utente**: Prenota corsi (max 1/giorno), visualizza proprie prenotazioni
3. **Istruttore**: Visualizza prenotazioni giornaliere, registra presenze

## Core Requirements
- [x] Autenticazione con JWT
- [x] Password crittografate con bcrypt (salt 12)
- [x] 3 ruoli: admin, user, instructor
- [x] Solo admin può creare account
- [x] Scadenza abbonamento per utenti
- [x] Protezione API con middleware
- [x] Prenotazione max 1 corso al giorno
- [x] Prenotazioni aperte solo giorno precedente

## Implemented Features (Feb 2026)
- Backend completo con MongoDB
- Sistema autenticazione JWT
- 12 corsi precaricati
- 26 lezioni settimanali
- Pagina login con validazione
- Calendario interattivo con transizioni
- Banner scorrevole "LA VERA PALESTRA - ACCESSIBILE A TUTTI"
- Transizioni pagina con Framer Motion

## API Endpoints
- POST /api/auth/login - Login utente
- GET /api/auth/me - Profilo utente corrente
- POST /api/auth/users - Crea utente (admin)
- GET /api/auth/users - Lista utenti (admin)
- PUT /api/auth/users/:id - Modifica utente (admin)
- DELETE /api/auth/users/:id - Disattiva utente (admin)
- GET /api/courses - Lista corsi
- GET /api/schedule - Orario settimanale
- POST /api/bookings - Crea prenotazione
- GET /api/bookings/my - Mie prenotazioni
- DELETE /api/bookings/:id - Cancella prenotazione

## Credenziali Demo
- Admin: admin@gymcity.com / admin123
- Utente: mario.rossi@example.com / user123
- Istruttore: gianluca@gymcity.com / instructor123

## Backlog P0 (Prossimi step)
- [ ] Dashboard admin completa per gestione utenti
- [ ] Form creazione nuovo utente
- [ ] Visualizzazione/modifica scadenza abbonamento
- [ ] Notifiche scadenza abbonamento

## Backlog P1
- [ ] Email reminder prenotazioni
- [ ] Report presenze mensili
- [ ] Statistiche frequenza corsi

## Backlog P2
- [ ] App mobile (PWA)
- [ ] Integrazione pagamenti
- [ ] Sistema notifiche push
