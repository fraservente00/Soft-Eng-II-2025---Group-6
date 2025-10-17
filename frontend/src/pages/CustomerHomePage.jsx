import { useEffect, useState } from 'react';
import {
  Button,
  Container,
  Paper,
  Stack,
  Typography,
  Avatar,
  Chip,
  Box,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { subscribeToTickets } from '../api/api';
import { getTicketById } from '../api/api';

export default function DeskSelectPage() {
  const navigate = useNavigate();
  const [isServedTicket, setIsServedTicket] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [service, setService] = useState(null);
  const [desk, setDesk] = useState(null);
  const {ticketId} = useParams();


  useEffect(() => {
    if (!ticket) return; // don't subscribe if there's no ticket


    // Subscribe to ticket updates
    const unsubscribe = subscribeToTickets((data) => {
      // Check if the event is for this specific ticket
      setDesk(data?.managedBy);
      const calledId = data?.id;
      if (ticket && calledId === ticket.id) {
        setIsServedTicket(true);
      }
    });

    // Cleanup when the component unmounts
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [ticket]);

  useEffect(() => {
    if (!ticketId) return;

    // Fetch ticket details using ticketId
    const fetchTicket = async () => {
      try {
        const ticket = await getTicketById(ticketId);
        setTicket(ticket);
        setService(ticket.service);

      } catch (error) {
        console.error('Error fetching ticket:', error);
      }
    };

    fetchTicket();
  }, [ticketId]);

  

  return (
    <Container
      maxWidth="md"
      sx={{ display: 'flex', alignItems: 'center', minHeight: '100dvh' }}
    >
      <Paper elevation={2} sx={{ p: 4, width: '100%' }}>
        {!isServedTicket ? (
          <Stack spacing={3}>
            <Typography variant="h5" fontWeight={700}>
              You are queued
            </Typography>

            {service && ticket && (
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64, fontSize: 24 }}>
                  {String(ticket.id ?? '').slice(-3)}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight={700}>{service.name}</Typography>
                  <Typography variant="body2" color="text.secondary">Ticket #{ticket.id}</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>Created at: {new Date(ticket.createdAt).toLocaleString()}</Typography>
                </Box>
                <Box>
                  <Chip label={`${service.estimatedTime} min`} color="primary" />
                </Box>
              </Box>
            )}
          </Stack>
        ) : (
          <>
            <Stack spacing={2} alignItems="center">
              <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                Your ticket is now being served!
              </Typography>
              <Typography variant="body1">
                Please proceed to desk <strong>{desk?.name}</strong>.
              </Typography>
              <Button variant="contained" onClick={() => navigate('/role')}>Back</Button>
            </Stack>
          </>
        )}
      </Paper>
    </Container>
  );
}
