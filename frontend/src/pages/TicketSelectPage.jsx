import { Container, Paper, Stack, Typography, Button, Autocomplete, TextField } from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import BadgeIcon from '@mui/icons-material/Badge';
import { useNavigate } from 'react-router-dom';
import useRole from '../hooks/useRole';
import { getServices, createTicket } from '../api/api';
import { useEffect, useState } from 'react';
    
export default function TicketSelectPage() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);


  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const services = await getServices();
        setServices(services);
        setError('');
      } catch (e) {
        setError(e?.message || 'Failed to load services');
      } finally {
        setLoading(false);
      }
    })();
  }, []);


  const selectService = async (service) => {
    if (!service || service.id == null) return;

    const ticket = {
      service: service,
      status: 'open',
      createdAt: Date.now(),
    }

    const createdTicket = await createTicket(ticket);
    navigate(`/customer/tickets/${createdTicket.id}`);
  }



  return (
    <Container maxWidth="sm" sx={{ display: 'flex', alignItems: 'center', minHeight: '100dvh' }}>
      <Paper elevation={2} sx={{ p: 4, width: '100%' }}>
        <Stack spacing={3}>
          <Typography variant="h5" fontWeight={700}>
            Select your Ticket
          </Typography>
          <Typography variant="body2" color="text.secondary">
            What service do you want to use?
          </Typography>

          <Stack spacing={2}>
            {loading && <Typography>Loading services…</Typography>}
            {error && <Typography color="error">{error}</Typography>}

            {!loading && !error && (
              <>
                <Autocomplete
                  options={services}
                  getOptionLabel={(opt) => opt.name || ''}
                  onChange={(_, value) => setSelected(value)}
                  renderOption={(props, option) => (
                    <li {...props}>
                      <BadgeIcon fontSize="small" sx={{ mr: 1 }} />
                      {option.name}
                    </li>
                  )}
                  renderInput={(params) => <TextField {...params} label="Choose a service" variant="outlined" />}
                  isOptionEqualToValue={(o, v) => o.id === v.id}
                />

                <Stack direction="row" justifyContent="flex-end" spacing={1}>
                  <Button variant="outlined" onClick={() => navigate('/role')} disabled={loading}>
                      Back
                  </Button>
                  <Button
                      variant="contained"
                      onClick={() => selectService(selected)}
                      disabled={loading || !selected || selected.id == null}
                    >
                      Confirm
                  </Button>
              </Stack>
              </>
            )}
          </Stack>

        </Stack>
      </Paper>
    </Container>
  );
}
