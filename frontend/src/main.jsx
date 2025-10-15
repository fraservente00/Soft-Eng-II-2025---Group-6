import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RoleProvider } from './contexts/RoleContext.jsx'
import App from './App.jsx'
import './index.css'

// MUI theme provider + baseline reset
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'

// Create a basic theme (tweak later if needed)
const theme = createTheme({
    palette: {
        mode: 'light', // change to 'dark' if you want a dark theme
    },
})

createRoot(document.getElementById('root')).render(
    <StrictMode>
        {/* MUI provider should wrap the app so all components inherit the theme */}
        <ThemeProvider theme={theme}>
            {/* Normalize CSS across browsers */}
            <CssBaseline />

            {/* Your app-specific providers go inside ThemeProvider */}
            <RoleProvider>
                <App />
            </RoleProvider>
        </ThemeProvider>
    </StrictMode>,
)
