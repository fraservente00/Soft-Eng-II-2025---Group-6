import { useState } from "react";
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
import { TicketDto } from "../DTOs/ticketDto";
import CloseIcon from "@mui/icons-material/Close";

//import { useState } from "react";

// TODO: add id to props
export default function OfficerDashboard({ idDesk }) {
  // TODO: fetch queues from API based on idDesk
  // const [queues, setQueues] = useState([]);
  // useEffect(() => {
  //   getQueuesByDeskId(idDesk).then((data) => setQueues(data));
  // }, [idDesk]);

  // Mock data for queues and tickets
  const [queues, setQueues] = useState([
    {
      id: 1,
      name: "Service 1",
      tickets: [
        new TicketDto({ id: 105, Status: "open" }),
        new TicketDto({ id: 103, Status: "open" }),
        new TicketDto({ id: 102, Status: "open" }),
      ],
      currentIndex: 0,
      lastServed: null,
    },
    {
      id: 2,
      name: "Service 2",
      tickets: [
        new TicketDto({ id: 104, Status: "open" }),
        new TicketDto({ id: 101, Status: "open" }),
        new TicketDto({ id: 100, Status: "open" }),
      ],
      currentIndex: 1,
      lastServed: null,
    },
  ]);

  const [currentTicketId, setCurrentTicketId] = useState(100); // TODO: get from state (ticket id)

  // Function to close a ticket by its ID
  const closeTicket = (ticketId) => {
    //TODO: call API to close the ticket
    //TODO: update timeEnded of the ticket in the backend
    setQueues((prevQueues) =>
      prevQueues.map((queue) => ({
        ...queue,
        tickets: queue.tickets.map((ticket) =>
          ticket.id === ticketId ? { ...ticket, Status: "closed" } : ticket
        ),
      }))
    );
  };

  const getStatusTicket = (ticketId) => {
    const ticket = queues
      .flatMap((queue) => queue.tickets)
      .find((t) => t.id === ticketId);
    return ticket ? ticket.Status : null;
  };

  const handleNext = () => {
    // TODO: update timeStrted of the current ticket in the backend
    // Update queues removing the current ticket from its queue
    setQueues((prevQueues) =>
      prevQueues.map((queue) => {
        // If the queue contains the current ticket
        if (queue.tickets.some((t) => t.id === currentTicketId)) {
          return {
            ...queue,
            // Remove the current ticket from tickets
            tickets: queue.tickets.filter((t) => t.id !== currentTicketId),
            // Update lastServed
            lastServed: queue.tickets.find((t) => t.id === currentTicketId),
          };
        }
        // Otherwise return the queue unchanged
        return queue;
      })
    );

    // Increment current ticket (for demo purposes)
    setCurrentTicketId((prev) => prev + 1);
  };

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
        🎟 Manage Ticket Queues
      </Typography>

      <Grid
        container
        spacing={4}
        justifyContent="center"
        sx={{ maxWidth: 1200 }}
      >
        {queues.map((queue) => {
          return (
            <Grid item xs={12} md={5} key={queue.id}>
              <Card
                sx={{
                  p: 4,
                  borderRadius: 4,
                  boxShadow: 4,
                  border: "1px solid #e0e0e0",
                  transition: "0.3s",
                  "&:hover": {
                    boxShadow: 6,
                    transform: "translateY(-4px)",
                  },
                  minWidth: 300,
                  bgcolor: "background.paper",
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ textTransform: "uppercase" }}
                >
                  #{queue.name}
                </Typography>

                <List>
                  {queue.tickets.map((ticket, index) => (
                    <ListItem
                      key={ticket.id}
                      sx={{
                        borderRadius: 1,
                        border: "1px solid #ddd",
                        mb: 1,
                        bgcolor:
                          ticket.id === currentTicketId
                            ? "rgba(33, 150, 243, 0.1)"
                            : "transparent",
                        fontWeight:
                          ticket.id === currentTicketId ? "bold" : "normal",
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>#{ticket.id}</span>
                      {ticket.id === currentTicketId && (
                        <Box>
                          {getStatusTicket(ticket.id) === "open" ? (
                            <Tooltip title="Click to close this ticket">
                              <Chip
                                icon={<CloseIcon />}
                                label="Close"
                                color="error"
                                size="small"
                                variant="outlined"
                                onClick={() => closeTicket(ticket.id)}
                                sx={{
                                  ml: 1,
                                  cursor: "pointer",
                                  "&:hover": {
                                    backgroundColor: "error.main",
                                    color: "white",
                                  },
                                }}
                              />
                            </Tooltip>
                          ) : (
                            <Chip
                              label="Closed"
                              color="secondary"
                              size="small"
                              variant="filled"
                              sx={{
                                ml: 1,
                                cursor: "pointer",
                                "&:hover": {
                                  backgroundColor: "secondary.main",
                                  color: "white",
                                },
                              }}
                            />
                          )}

                          <Chip
                            label="Current"
                            color="primary"
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        </Box>
                      )}
                    </ListItem>
                  ))}
                </List>

                {queue.lastServed && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Last served: #{queue.lastServed.id}
                  </Typography>
                )}
              </Card>
            </Grid>
          );
        })}

        {/* Next Ticket + Current Ticket Info */}
        <Box
          sx={{
            mt: 4,
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 5, // spazio tra le due sezioni
          }}
        >
          {/* Current ticket info */}
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
            <Box
              sx={{
                display: "flex",
                alignItems: "baseline",
                gap: 3,
                mb: 1,
              }}
            >
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                #{currentTicketId}
              </Typography>
              {getStatusTicket(currentTicketId) === "open" ? (
                <Tooltip title="Click to close this ticket">
                  <Chip
                    icon={<CloseIcon />}
                    label="Close"
                    color="error"
                    size="small"
                    variant="outlined"
                    onClick={() => closeTicket(currentTicketId)}
                    sx={{
                      cursor: "pointer",
                      "&:hover": {
                        backgroundColor: "error.main",
                        color: "white",
                      },
                    }}
                  />
                </Tooltip>
              ) : (
                <Chip
                  label="Closed"
                  color="secondary"
                  size="small"
                  variant="filled"
                  sx={{ cursor: "pointer" }}
                />
              )}
            </Box>
          </Card>

          {/* Next Ticket button */}
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
            disabled={
              queues.every((queue) => queue.tickets.length === 0) ||
              getStatusTicket(currentTicketId) === "open"
            }
            sx={{
              px: 4,
              py: 2,
              fontSize: "1rem",
              borderRadius: "20px",
              minWidth: 150,
              boxShadow: 3,
            }}
          >
            ▶ Next Ticket
          </Button>
        </Box>
      </Grid>
    </Box>
  );
}
