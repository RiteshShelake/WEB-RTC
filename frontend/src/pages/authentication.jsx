import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthContext } from '../contexts/AuthContext';
import { Snackbar } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VideocamIcon from '@mui/icons-material/Videocam';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const defaultTheme = createTheme();

export default function Authentication() {
    const [username, setUsername] = React.useState();
    const [password, setPassword] = React.useState();
    const [name, setName] = React.useState();
    const [error, setError] = React.useState();
    const [message, setMessage] = React.useState();
    const [formState, setFormState] = React.useState(0);
    const [open, setOpen] = React.useState(false);

    const { handleRegister, handleLogin } = React.useContext(AuthContext);

    let handleAuth = async () => {
        try {
            if (formState === 0) {
                let result = await handleLogin(username, password)
            }
            if (formState === 1) {
                let result = await handleRegister(name, username, password);
                console.log(result);
                setUsername("");
                setMessage(result);
                setOpen(true);
                setError("")
                setFormState(0)
                setPassword("")
            }
        } catch (err) {
            console.log(err);
            let message = (err.response.data.message);
            setError(message);
        }
    }

    return (
        <ThemeProvider theme={defaultTheme}>
            <Grid container component="main" sx={{ height: '100vh' }}>
                <CssBaseline />
                <Grid
                    item
                    xs={false}
                    sm={4}
                    md={7}
                    sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'url(https://source.unsplash.com/random?video-call)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            opacity: 0.3,
                        }
                    }}
                >
                    <Box
                        sx={{
                            position: 'relative',
                            zIndex: 1,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            color: 'white',
                            textAlign: 'center',
                            p: 4
                        }}
                    >
                        <Box
                            sx={{
                                width: '120px',
                                height: '120px',
                                background: 'rgba(255, 255, 255, 0.2)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '30px',
                                backdropFilter: 'blur(10px)',
                                border: '2px solid rgba(255, 255, 255, 0.3)'
                            }}
                        >
                            <VideocamIcon sx={{ fontSize: '60px', color: 'white' }} />
                        </Box>
                        <Typography variant="h3" sx={{ 
                            fontWeight: 'bold', 
                            marginBottom: '20px',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                        }}>
                            Welcome to WEB RTC Video Call
                        </Typography>
                        <Typography variant="h6" sx={{ 
                            opacity: 0.9,
                            maxWidth: '500px',
                            lineHeight: 1.6,
                            textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                        }}>
                            Connect with your loved ones through crystal-clear video calls. 
                            Join millions of users worldwide for seamless communication.
                        </Typography>
                    </Box>
                </Grid>
                
                <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                    <Box
                        sx={{
                            my: 8,
                            mx: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Box
                            sx={{
                                width: '80px',
                                height: '80px',
                                background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '20px',
                                boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)'
                            }}
                        >
                            <LockOutlinedIcon sx={{ fontSize: '40px', color: 'white' }} />
                        </Box>

                        <Typography variant="h4" sx={{ 
                            fontWeight: 'bold', 
                            color: '#2c3e50',
                            marginBottom: '10px'
                        }}>
                            {formState === 0 ? 'Welcome Back' : 'Create Account'}
                        </Typography>
                        
                        <Typography variant="body1" sx={{ 
                            color: '#7f8c8d', 
                            marginBottom: '30px',
                            textAlign: 'center'
                        }}>
                            {formState === 0 ? 'Sign in to continue to your video calls' : 'Join us and start connecting with others'}
                        </Typography>

                        <Box sx={{ 
                            display: 'flex', 
                            background: '#f8f9fa', 
                            borderRadius: '12px', 
                            padding: '4px',
                            marginBottom: '30px',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                        }}>
                            <Button 
                                variant={formState === 0 ? "contained" : "text"} 
                                onClick={() => { setFormState(0) }}
                                startIcon={<LoginIcon />}
                                sx={{
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    fontWeight: '600',
                                    px: 3,
                                    py: 1,
                                    ...(formState === 0 && {
                                        background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                                    })
                                }}
                            >
                                Sign In
                            </Button>
                            <Button 
                                variant={formState === 1 ? "contained" : "text"} 
                                onClick={() => { setFormState(1) }}
                                startIcon={<PersonAddIcon />}
                                sx={{
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    fontWeight: '600',
                                    px: 3,
                                    py: 1,
                                    ...(formState === 1 && {
                                        background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                                    })
                                }}
                            >
                                Sign Up
                            </Button>
                        </Box>

                        <Box component="form" noValidate sx={{ mt: 1, width: '100%' }}>
                            {formState === 1 && (
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="name"
                                    label="Full Name"
                                    name="name"
                                    value={name}
                                    autoFocus
                                    onChange={(e) => setName(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <PersonIcon sx={{ mr: 1, color: '#7f8c8d' }} />
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '12px',
                                            '&:hover fieldset': {
                                                borderColor: '#667eea',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#667eea',
                                            },
                                        },
                                    }}
                                />
                            )}

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="username"
                                label="Username"
                                name="username"
                                value={username}
                                autoFocus={formState === 0}
                                onChange={(e) => setUsername(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <EmailIcon sx={{ mr: 1, color: '#7f8c8d' }} />
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px',
                                        '&:hover fieldset': {
                                            borderColor: '#667eea',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#667eea',
                                        },
                                    },
                                }}
                            />
                            
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                value={password}
                                type="password"
                                onChange={(e) => setPassword(e.target.value)}
                                id="password"
                                InputProps={{
                                    startAdornment: (
                                        <LockIcon sx={{ mr: 1, color: '#7f8c8d' }} />
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px',
                                        '&:hover fieldset': {
                                            borderColor: '#667eea',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#667eea',
                                        },
                                    },
                                }}
                            />

                            {error && (
                                <Box sx={{ 
                                    mt: 2, 
                                    p: 2, 
                                    background: '#fee', 
                                    borderRadius: '8px',
                                    border: '1px solid #fcc',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}>
                                    <Typography variant="body2" sx={{ color: '#e74c3c', fontWeight: '500' }}>
                                        {error}
                                    </Typography>
                                </Box>
                            )}

                            <Button
                                type="button"
                                fullWidth
                                variant="contained"
                                onClick={handleAuth}
                                startIcon={formState === 0 ? <LoginIcon /> : <PersonAddIcon />}
                                sx={{ 
                                    mt: 4, 
                                    mb: 2,
                                    py: 1.5,
                                    background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                                    borderRadius: '12px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    textTransform: 'none',
                                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)',
                                    }
                                }}
                            >
                                {formState === 0 ? "Sign In" : "Create Account"}
                            </Button>

                            <Box sx={{ textAlign: 'center', mt: 3 }}>
                                <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                                    {formState === 0 ? "Don't have an account? " : "Already have an account? "}
                                    <Link
                                        component="button"
                                        variant="body2"
                                        onClick={() => setFormState(formState === 0 ? 1 : 0)}
                                        sx={{ 
                                            color: '#667eea', 
                                            fontWeight: '600',
                                            textDecoration: 'none',
                                            '&:hover': {
                                                textDecoration: 'underline'
                                            }
                                        }}
                                    >
                                        {formState === 0 ? "Sign Up" : "Sign In"}
                                    </Link>
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Grid>
            </Grid>

            <Snackbar
                open={open}
                autoHideDuration={4000}
                message={message}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            />
        </ThemeProvider>
    );
}