import { Container, Paper, Stack, Typography, Button } from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import BadgeIcon from '@mui/icons-material/Badge';
import { useNavigate } from 'react-router-dom';
import useRole from '../hooks/useRole';

export default function RoleSelectPage() {
    const navigate = useNavigate();
    const { setRole } = useRole();

    // Choose "customer": set the role, clear any previously selected desk,
    // then go to the customer ticket selection (by Era).
    const onSelectCustomer = () => {
        setRole('customer');
        localStorage.removeItem('selectedDesk');
        navigate('/customer/tickets', { replace: true });
    };

    // Choose "officier": set the role, clear any previously selected desk,
    // then go to the desk selection flow.
    const onSelectOfficier = () => {
        setRole('officier');
        localStorage.removeItem('selectedDesk');
        navigate('/desk', { replace: true });
    };

    return (
        <Container maxWidth="sm" sx={{ display: 'flex', alignItems: 'center', minHeight: '100dvh' }}>
            <Paper elevation={2} sx={{ p: 4, width: '100%' }}>
                <Stack spacing={3}>
                    <Typography variant="h5" fontWeight={700}>
                        Select your role
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Choose how you want to use the application.
                    </Typography>

                    <Stack spacing={2}>
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<PersonOutlineIcon />}
                            onClick={onSelectCustomer}
                            sx={{ py: 1.5 }}
                        >
                            Customer
                        </Button>

                        <Button
                            variant="outlined"
                            size="large"
                            startIcon={<BadgeIcon />}
                            onClick={onSelectOfficier}
                            sx={{ py: 1.5 }}
                        >
                            Officier (Staff)
                        </Button>
                    </Stack>
                </Stack>
            </Paper>
        </Container>
    );
}
