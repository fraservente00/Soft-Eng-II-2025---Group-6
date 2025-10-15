import {useEffect, useState} from "react";
import {
  Box,
  Button,
  Card,
  Grid,
  Typography,
  List,
  ListItem,
  Chip,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {useParams} from "react-router-dom";
import {callNext, getDesk, getQueue, getServiceByDeskId, getTicketById, updateTicketStatus} from "../api/api.js";


export default function OfficerDashboard() {

  const [currentTicketId, setCurrentTicketId] = useState(null); // TODO: get from state (ticket id)

  const {deskId} = useParams();

  const [currentDesk, setCurrenDesk] = useState(null);
  const [services, setServices] = useState([])

  const [queues, setQueues] = useState(new Map());

  const [ticketStatus, setTicketStatus] = useState(null);

  useEffect(() => {
    (async () => {
        if (currentTicketId === null) return;

        const ticket = await getTicketById(currentTicketId);
        setTicketStatus(ticket.status)
      }

    )();
  }, [currentTicketId]);

  useEffect(() => {
    async function initDeskAndService() {
      setCurrenDesk(await getDesk(deskId))
      const ser = await getServiceByDeskId(deskId)
      console.log("useEffect 1 -> services")
      console.log(ser)
      setServices(ser)

    }

    initDeskAndService().then()
  }, [deskId]);

  /*useEffect(() => {
    console.log("useEffect 2 ")
    if (!services || services.length === 0) return;

    async function initQueues() {
      const newQueues = new Map();

      await Promise.all(
        services.map(async (service) => {
          const tickets = await getQueue(service.id);
          newQueues.set(service.id, tickets || []);

          console.log("useEffect 2 -> newQueues ")
          console.log(newQueues)
        })
      );

      setQueues(newQueues);
    }

    initQueues().then()


  }, [services]);

   */

  // sostituisce la useEffect sopra, anzichè chiamare l'api delle code solo la prima volta
  // viene chiamata periodicamente
  useEffect(() => {
    if (!services || services.length === 0) return;

    async function initQueues() {
      const newQueues = new Map();

      await Promise.all(
        services.map(async (service) => {
          const tickets = await getQueue(service.id);
          newQueues.set(service.id, tickets || []);

          console.log("useEffect 2 -> newQueues ")
          console.log(newQueues)
        })
      );

      setQueues(newQueues);
    }
    // subito
    initQueues().then()

    // ogni x sec
    const intervalId = setInterval(initQueues, 5000);
    return () => clearInterval(intervalId);
  }, [services]);


  // Function to close a ticket by its ID
  const closeTicket = async (ticketId) => {
    try {
      // call API to close the ticket
      console.log(ticketId)
      await updateTicketStatus(ticketId, "closed");
      setTicketStatus("closed")
      //if (closed.success) {
      console.log("update queus...")
      //TODO: update timeEnded of the ticket in the backend
      setQueues((prevQueues) => {
        const newQueues = new Map(prevQueues); // copia della mappa esistente

        for (const [serviceId, tickets] of newQueues.entries()) {
          // cerca se il ticket è in questa coda
          const updatedTickets = tickets.map((t) =>
            t.id === ticketId ? {...t, Status: "closed"} : t
          );
          newQueues.set(serviceId, updatedTickets);
        }

        return newQueues;
      });
      //}
    } catch (e) {
      console.error("Error closing the ticket:", e);
    }


  };


  const handleNext = async () => {
      // TODO: update timeStrted of the current ticket in the backend

      try {

        if(currentTicketId !== null && ticketStatus !== "open") {
          // Aggiorna la coda, rimuovendo quello appena chiuso
          setQueues((prevQueues) => {
            const newQueues = new Map(prevQueues);

            for (const [serviceId, tickets] of newQueues.entries()) {
              if (tickets.some((t) => t === currentTicketId)) {
                const updatedTickets = tickets.filter((t) => t !== currentTicketId);
                newQueues.set(serviceId, updatedTickets);
              }
            }

            return newQueues;
          });

        }

        // recupero il next ticket (che diventa current)
        const currentTicket = await callNext(deskId);
        console.log("response of callNext fun")
        console.log(currentTicket)

        if (currentTicket === null) {
          setCurrentTicketId(null)
        } else {
          // Update the currentTicketId state
          setCurrentTicketId(currentTicket.id)
        }

      } catch
        (e) {
        console.error("Error reaching next ticket:", e);
      }
    }
  ;

  /**
   * idDesk -> servizi associati -> queues
   */

  return (

    <Box
      sx={{
        p: 4,
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Typography variant="h4" textAlign="center" gutterBottom>
        {currentDesk?.name}
      </Typography>

      <Typography variant="h4" textAlign="center" gutterBottom>
        🎟 Manage Ticket Queues
      </Typography>

      <Grid container spacing={4} justifyContent="center" sx={{maxWidth: 1200}}>
        {/* sorto per chiave */}
        {Array.from(queues.entries()).sort((a,b) => a[0]-b[0]).map(([serviceId, tickets]) => {
          const service = services.find((s) => s.id === serviceId);
          if (!service) return null;

          return (
            <Grid item xs={12} md={5} key={serviceId}>
              <Card
                sx={{
                  p: 4,
                  borderRadius: 4,
                  boxShadow: 4,
                  border: "1px solid #e0e0e0",
                  transition: "0.3s",
                  "&:hover": {boxShadow: 6, transform: "translateY(-4px)"},
                  minWidth: 300,
                  bgcolor: "background.paper",
                }}
              >
                <Typography variant="h6" gutterBottom sx={{textTransform: "uppercase"}}>
                  {service.name}
                </Typography>

                <List>
                  {tickets?.map((ticket) => (
                    <ListItem
                      key={`${serviceId}-${ticket}`}
                      sx={{
                        borderRadius: 1,
                        border: "1px solid #ddd",
                        mb: 1,
                        bgcolor:
                          ticket === currentTicketId
                            ? "rgba(33, 150, 243, 0.1)"
                            : "transparent",
                        fontWeight: ticket === currentTicketId ? "bold" : "normal",
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>#{ticket}</span>
                      {ticket === currentTicketId && (
                        <Box>
                          {ticketStatus === "open" ? (
                            <Tooltip title="Click to close this ticket">
                              <Chip
                                icon={<CloseIcon/>}
                                label="Close"
                                color="error"
                                size="small"
                                variant="outlined"
                                onClick={() => closeTicket(ticket)}
                                sx={{
                                  ml: 1,
                                  cursor: "pointer",
                                  "&:hover": {backgroundColor: "error.main", color: "white"},
                                }}
                              />
                            </Tooltip>
                          ) : (
                            <Chip
                              label="Closed"
                              color="secondary"
                              size="small"
                              variant="filled"
                              sx={{ml: 1}}
                            />
                          )}

                          <Chip label="Current" color="primary" size="small" sx={{ml: 1}}/>
                        </Box>
                      )}
                    </ListItem>
                  ))}
                </List>
              </Card>
            </Grid>
          );
        })}

        {/* Current Ticket + Next Ticket */}
        <Box
          sx={{
            mt: 4,
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 5,
          }}
        >
          {currentTicketId !== null && (
            <Card
              sx={{
                p: 2,
                minWidth: 200,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                boxShadow: 4,
                borderRadius: 3,
              }}
            >
              <Typography variant="subtitle2" gutterBottom>
                Current Ticket
              </Typography>
              <Box sx={{display: "flex", alignItems: "baseline", gap: 3, mb: 1}}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  #{currentTicketId}
                </Typography>
                {ticketStatus === "open" ? (
                  <Tooltip title="Click to close this ticket">
                    <Chip
                      icon={<CloseIcon/>}
                      label="Close"
                      color="error"
                      size="small"
                      variant="outlined"
                      onClick={() => closeTicket(currentTicketId)}
                      sx={{cursor: "pointer", "&:hover": {backgroundColor: "error.main", color: "white"}}}
                    />
                  </Tooltip>
                ) : (
                  <Chip label="Closed" color="secondary" size="small" variant="filled"/>
                )}
              </Box>
            </Card>
          )}


          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
            disabled={
              Array.from(queues.values()).every((tickets) => tickets.length === 0) ||
              ticketStatus === "open"
            }
            sx={{px: 4, py: 2, fontSize: "1rem", borderRadius: "20px", minWidth: 150, boxShadow: 3}}
          >
            {currentTicketId !== null ? ("▶ Next Ticket") : ("Start Working")}

          </Button>
        </Box>
      </Grid>

    </Box>
  );
}
