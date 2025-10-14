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
} from "@mui/material";

//import { useState } from "react";

// TODO: add id to props
export default function OfficerDashboard({ idDesk }) {
  // TODO: fetch queues from API based on idDesk
  // const [queues, setQueues] = useState([]);
  // useEffect(() => {
  //   getQueues(idDesk).then((data) => setQueues(data));
  // }, [idDesk]);

  // Mock data for queues and tickets
  const [queues, setQueues] = useState([
    {
      id: 1,
      name: "Service 1",
      tickets: [{ number: 105 }, { number: 103 }, { number: 102 }],
      currentIndex: 0,
      lastServed: null,
    },
    {
      id: 2,
      name: "Service 2",
      tickets: [{ number: 104 }, { number: 101 }, { number: 100 }],
      currentIndex: 1, // currently serving #102
      lastServed: null,
    },
  ]);

  const [currentTicket, setCurrentTicket] = useState(100); // TODO: get from state (ticke number)

  const handleNext = () => {
    // Update queues removing the current ticket from its queue
    setQueues((prevQueues) =>
      prevQueues.map((queue) => {
        // If the queue contains the current ticket
        if (queue.tickets.some((t) => t.number === currentTicket)) {
          return {
            ...queue,
            // Remove the current ticket from tickets
            tickets: queue.tickets.filter((t) => t.number !== currentTicket),
            // Update lastServed
            lastServed: queue.tickets.find((t) => t.number === currentTicket),
          };
        }
        // Otherwise return the queue unchanged
        return queue;
      })
    );

    // Increment current ticket (for demo purposes)
    setCurrentTicket((prev) => prev + 1);
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
                      key={ticket.number}
                      sx={{
                        borderRadius: 1,
                        border: "1px solid #ddd",
                        mb: 1,
                        bgcolor:
                          ticket.number === currentTicket
                            ? "rgba(33, 150, 243, 0.1)"
                            : "transparent",
                        fontWeight:
                          ticket.number === currentTicket ? "bold" : "normal",
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>#{ticket.number}</span>
                      {ticket.number === currentTicket && (
                        <Chip
                          label="Current"
                          color="primary"
                          size="small"
                          sx={{ ml: 1 }}
                        />
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
                    Last served: #{queue.lastServed.number}
                  </Typography>
                )}
              </Card>
            </Grid>
          );
        })}

        {/** Next ticket button -> disable when all queues are empty */}
        <Box sx={{ mt: 4, width: "100%", textAlign: "center" }}>
          <Button
            variant="contained"
            color="primary"
            sx={{ px: 3, py: 1, fontSize: "1rem" }}
            onClick={handleNext}
            disabled={queues.every((queue) => queue.tickets.length === 0)}
          >
            ▶ Next Ticket
          </Button>
        </Box>
      </Grid>
    </Box>
  );
}
