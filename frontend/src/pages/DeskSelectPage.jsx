import { useEffect, useState, useMemo } from 'react';
import {
    Autocomplete,
    TextField,
    Container,
    Paper,
    Stack,
    Typography,
    Button,
    CircularProgress,
    Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getDesks } from '../api/api'; // adjust path if needed

export default function DeskSelectPage() {
    const navigate = useNavigate();

    // Remote data state
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [desks, setDesks] = useState([]);

    // Current selection
    const [selected, setSelected] = useState(null);

    // Preselect from localStorage if available (useful on refresh/back)
    useEffect(() => {
        const prev = localStorage.getItem('selectedDesk');
        if (prev) {
            try {
                const parsed = JSON.parse(prev);
                setSelected(parsed);
            } catch { /* ignore parse errors */ }
        }
    }, []);

    // Load desks from API on mount
    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const data = await getDesks();
                // Normalize: we need at least { id, name } for the Autocomplete
                const normalized = Array.isArray(data) ? data.map(d => ({
                    id: d.id ?? d.ID ?? d.Id ?? d.code ?? d.uuid ?? null,
                    name: d.name ?? d.label ?? d.description ?? String(d.id ?? ''),
                    raw: d,
                })) : [];
                setDesks(normalized);
                setError('');
            } catch (e) {
                setError(e?.message || 'Failed to load desks');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // Filter out records without a valid id
    const options = useMemo(() => desks.filter(d => d.id != null), [desks]);

    // Persist selection and continue to the officier dashboard
    const handleConfirm = () => {
        if (!selected || selected.id == null) return;
        localStorage.setItem('selectedDesk', JSON.stringify({ id: selected.id, name: selected.name }));
        navigate('/dashboard', { replace: true });
    };

    return (
        <Container maxWidth="md" sx={{ display: 'flex', alignItems: 'center', minHeight: '100dvh' }}>
            <Paper elevation={2} sx={{ p: 4, width: '100%' }}>
                <Stack spacing={3}>
                    <Typography variant="h5" fontWeight={700}>
                        Select your desk
                    </Typography>

                    {error && <Alert severity="error">{error}</Alert>}

                    {loading ? (
                        <Stack direction="row" alignItems="center" spacing={2}>
                            <CircularProgress size={22} />
                            <Typography>Loading desks…</Typography>
                        </Stack>
                    ) : (
                        <Autocomplete
                            value={selected}
                            onChange={(_e, newValue) => setSelected(newValue)}
                            options={options}
                            autoHighlight
                            fullWidth
                            getOptionLabel={(opt) => (opt?.name ? String(opt.name) : '')}
                            isOptionEqualToValue={(opt, val) => String(opt.id) === String(val?.id)}
                            renderInput={(params) => (
                                <TextField {...params} label="Desk" placeholder="Search or select a desk…" />
                            )}
                        />
                    )}

                    <Stack direction="row" justifyContent="flex-end" spacing={1}>
                        <Button variant="outlined" onClick={() => navigate('/role')} disabled={loading}>
                            Back
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleConfirm}
                            disabled={loading || !selected || selected.id == null}
                        >
                            Confirm
                        </Button>
                    </Stack>
                </Stack>
            </Paper>
        </Container>
    );
}
