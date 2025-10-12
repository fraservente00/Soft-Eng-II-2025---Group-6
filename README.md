# Soft-Eng-II-2025---Group-6


---

## ⚡ API Backend

### **Desk Routes**

| Metodo | Endpoint                  | Descrizione |
|--------|---------------------------|-------------|
| GET    | `/api/desks`              | Restituisce tutti i desk |
| GET    | `/api/desks/:id`          | Restituisce un desk per ID |
| POST   | `/api/desks/:id/next`     | Chiede al desk di servire il prossimo cliente |

### **Service Routes**

| Metodo | Endpoint                  | Descrizione |
|--------|---------------------------|-------------|
| GET    | `/api/services`           | Restituisce tutti i servizi |
| GET    | `/api/services/:id`       | Restituisce un servizio per ID |

### **Ticket Routes**

| Metodo | Endpoint                       | Descrizione |
|--------|--------------------------------|-------------|
| GET    | `/api/tickets`                 | Restituisce tutti i ticket |
| GET    | `/api/tickets/:id`             | Restituisce un ticket per ID |
| POST   | `/api/tickets`                 | Crea un nuovo ticket |
| PATCH  | `/api/tickets/:id/status`      | Aggiorna lo status di un ticket |
| GET    | `/api/tickets/code/:code/eta` | Restituisce il tempo di attesa stimato per un ticket |

### **Queues**

| Metodo | Endpoint          | Descrizione |
|--------|-----------------|-------------|
| GET    | `/api/queues`    | Restituisce le code attuali per tutti i servizi |

### **Stats**

| Metodo | Endpoint             | Descrizione |
|--------|--------------------|-------------|
| GET    | `/api/stats/daily`  | Restituisce statistiche giornaliere |

---

## 📄 Frontend - `api.js`

Il file `api.js` contiene funzioni che interagiscono con le API del backend usando il **fetch nativo**, gestendo gli errori in ciascuna funzione.  

### **Esempio di funzioni principali**

```js
// Desks
getDesks()              // GET /api/desks
getDesk(id)             // GET /api/desks/:id
callNext(deskId)        // POST /api/desks/:id/next

// Services
getServices()           // GET /api/services

// Tickets
getTickets()            // GET /api/tickets
createTicket(payload)   // POST /api/tickets
getTicketETAByCode(code)// GET /api/tickets/code/:code/eta
updateTicketStatus(id, status) // PATCH /api/tickets/:id/status

// Queues
getQueues()             // GET /api/queues

// Stats
getDailyStats()         // GET /api/stats/daily
