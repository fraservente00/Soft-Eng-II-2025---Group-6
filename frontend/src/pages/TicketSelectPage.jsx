import { Container, Paper, Stack, Typography, Button, Autocomplete, TextField, CircularProgress, Alert } from '@mui/material';
import BadgeIcon from '@mui/icons-material/Badge';
import { useNavigate } from 'react-router-dom';
import { getServices, createTicket } from '../api/api';
import { useEffect, useState } from 'react';
    
export default function TicketSelectPage() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [creating, setCreating] = useState(false);


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

    try {
      setCreating(true);
      // send a small, serializable payload
      const payload = { service: service,  status: 'open' };
      const createdTicket = await createTicket(payload);
      navigate(`/customer/tickets/${createdTicket.id}`);
    } finally {
      setCreating(false);
    }
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
                  value={selected}
                  onChange={(_e, newValue) => setSelected(newValue)}
                  options={services}
                  autoHighlight
                  fullWidth
                  getOptionLabel={(opt) => opt?.name ? String(opt.name) : ''}
                  isOptionEqualToValue={(opt, val) => String(opt.id) === String(val?.id)}
                  renderOption={(props, option) => {
                    const { key, ...rest } = props;
                    return (
                      <li key={option.id ?? key} {...rest}>
                        <BadgeIcon fontSize="small" sx={{ mr: 1 }} />
                        {option.name}
                      </li>
                    );
                  }}
                  renderInput={(params) => <TextField {...params} label="Choose a service" variant="outlined" />}
                />

                <Stack direction="row" justifyContent="flex-end" spacing={1}>
                  <Button variant="outlined" onClick={() => navigate('/role')} disabled={loading || creating}>
                      Back
                  </Button>
                  <Button
                      variant="contained"
                      onClick={() => selectService(selected)}
                      disabled={loading || creating || !selected || selected.id == null}
                    >
                      {creating ? <CircularProgress size={18} /> : 'Confirm'}
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
