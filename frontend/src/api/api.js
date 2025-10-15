export const API_BASE =
    import.meta.env.VITE_API_BASE?.replace(/\/+$/, '') || '/api';

/* ------------------ DESKS ------------------ */
export async function getDesks() {
  try {
    const res = await fetch(`${API_BASE}/desks`);
    if (!res.ok) throw new Error(`Errore GET /desks: ${res.status} ${res.statusText}`);
    return res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function getDesk(id) {
  try {
    const res = await fetch(`${API_BASE}/desks/${id}`);
    if (!res.ok) throw new Error(`Errore GET /desks/${id}: ${res.status} ${res.statusText}`);
    return res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function callNext(deskId) {
  try {
    const res = await fetch(`${API_BASE}/desks/${deskId}/next`, { method: "GET" });
    if (res.status === 204) return null; // nessun cliente in coda
    if (!res.ok) throw new Error(`Errore GET /desks/${deskId}/next: ${res.status} ${res.statusText}`);
    return res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
}

/* ------------------ SERVICES ------------------ */
export async function getServices() {
  try {
    const res = await fetch(`${API_BASE}/services`);
    if (!res.ok) throw new Error(`Errore GET /services: ${res.status} ${res.statusText}`);
    return res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
}

/* ------------------ TICKETS ------------------ */
export async function createTicket(payload) {
  try {
    const res = await fetch(`${API_BASE}/tickets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Errore POST /tickets: ${res.status} ${res.statusText}`);
    return res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function getTickets() {
  try {
    const res = await fetch(`${API_BASE}/tickets`);
    if (!res.ok) throw new Error(`Errore GET /tickets: ${res.status} ${res.statusText}`);
    return res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
}

/*export async function getTicketETAByCode(code) {
  try {
    const res = await fetch(`${API_BASE}/tickets/code/${encodeURIComponent(code)}/eta`);
    if (!res.ok) throw new Error(`Errore GET /tickets/code/${code}/eta: ${res.status} ${res.statusText}`);
    return res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
}*/

export async function updateTicketStatus(id, status) {
  try {
    const res = await fetch(`${API_BASE}/tickets/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error(`Errore PATCH /tickets/${id}/status: ${res.status} ${res.statusText}`);
    return res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
}


//here you pass the callback function that will handle incoming messages
export function subscribeToTickets(onMessage) {
  const eventSource = new EventSource(`${API_BASE}/subscribe`);

 // When the server sends a "ticketCalled" event
  eventSource.addEventListener("ticketCalled", (event) => {
    const data = JSON.parse(event.data);
    onMessage(data); // Call the provided callback with the data
  });

  eventSource.onerror = (err) => {
    console.error("SSE error:", err);
    eventSource.close();
  };

  // Return a cleanup function to stop listening
  return () => {
    eventSource.close();
    console.log("SSE connection closed");
  };
}


/* ------------------ QUEUES ------------------ */
export async function getQueues() {
  try {
    const res = await fetch(`${API_BASE}/queues`);
    if (!res.ok) throw new Error(`Errore GET /queues: ${res.status} ${res.statusText}`);
    return res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
}

/* ------------------ STATS ------------------ */
/*export async function getDailyStats() {
  try {
    const res = await fetch(`${API_BASE}/stats/daily`);
    if (!res.ok) throw new Error(`Errore GET /stats/daily: ${res.status} ${res.statusText}`);
    return res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
}*/
