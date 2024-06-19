import React, { useState } from 'react';
import RegisterStyles from './Register.module.css';
import GoogleImg from '../../Images/google.png';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PhoneIcon from '@mui/icons-material/Phone';
import { TextField, FormControl, InputAdornment, Dialog, DialogContent, DialogContentText, Slide, Snackbar, Alert, Autocomplete, Paper, CircularProgress, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const RegisterHome = () => {

    const navigate = useNavigate();

    const [passwordVisibility, setPasswordVisibility] = useState(true);
    const [confirmPasswordVisibility, setConfirmPasswordVisibility] = useState(true);


    const handleLoginText = () => {
        navigate('/login');
    }

    return (
        <div className={RegisterStyles.registerContainer}>
            <div className={RegisterStyles.registerBox}>
                <div className={RegisterStyles.registerLeft}>
                    <div className={RegisterStyles.registerLogo}>
                        <img src="logo-path.png" alt="Logo" />
                    </div>
                    <h1 className={RegisterStyles.registerTitle}>Create Account</h1>
                    <div className={RegisterStyles.registerForm}>
                        <FormControl sx={{ width: '100%' }}>
                            <div className={RegisterStyles.nameContainer}>
                                <div>
                                    <label>First Name *</label>
                                    <TextField
                                        InputProps={{
                                            type: 'text',
                                            startAdornment: <InputAdornment position="start"><AccountCircleIcon /></InputAdornment>
                                        }}
                                        sx={{ input: { "&::placeholder": { opacity: 0.9 } } }}
                                        placeholder={"Enter your first name"} size="small"
                                    />

                                </div>
                                <div>
                                    <label>Last Name *</label>
                                    <TextField
                                        InputProps={{
                                            type: 'text',
                                            startAdornment: <InputAdornment position="start"><AccountCircleIcon /></InputAdornment>
                                        }}
                                        sx={{ input: { "&::placeholder": { opacity: 0.9 } } }}
                                        placeholder={"Enter your last name"} size="small"
                                    />
                                </div>
                            </div>
                            <div className={RegisterStyles.nameContainer}>
                                <div>
                                    <label>Date of Birth *</label>
                                    <TextField
                                        InputProps={{
                                            type: 'text',
                                            startAdornment: <InputAdornment position="start"><CalendarMonthIcon /></InputAdornment>
                                        }}
                                        sx={{ input: { "&::placeholder": { opacity: 0.9 } } }}
                                        placeholder={"Select your date of birth"} size="small"
                                    />
                                </div>
                                <div>
                                    <label>Phone Number *</label>
                                    <TextField
                                        InputProps={{
                                            type: 'text',
                                            startAdornment: <InputAdornment position="start"><PhoneIcon /></InputAdornment>
                                        }}
                                        sx={{ input: { "&::placeholder": { opacity: 0.9 } } }}
                                        placeholder={"Enter your phone number"} size="small"
                                    />
                                </div>
                            </div>
                            <label>Email *</label>
                            <TextField
                                InputProps={{
                                    type: 'text',
                                    startAdornment: <InputAdornment position="start"><EmailIcon /></InputAdornment>
                                }}
                                sx={{ input: { "&::placeholder": { opacity: 0.9 } } }}
                                placeholder={"Enter your mail address"} size="small"
                            />
                            <div className={RegisterStyles.nameContainer}>
                                <div>
                                    <label>Password *</label>
                                    <TextField
                                        InputProps={{
                                            type: 'text',
                                            startAdornment: <InputAdornment position="start"><LockIcon /></InputAdornment>,
                                            endAdornment: <InputAdornment position="end">{passwordVisibility ? <VisibilityOffIcon className={RegisterStyles.VisibilityOffIcon} onClick={() => setPasswordVisibility(false)} /> : <VisibilityIcon className={RegisterStyles.VisibilityIcon} onClick={() => setPasswordVisibility(true)} />}</InputAdornment>
                                        }}
                                        sx={{ input: { "&::placeholder": { opacity: 0.9 } } }}
                                        placeholder={"Enter password"} size="small"
                                    />
                                </div>
                                <div>
                                    <label>Confirm Password *</label>
                                    <TextField
                                        InputProps={{
                                            type: passwordVisibility ? 'password' : 'text',
                                            startAdornment: <InputAdornment position="start"><LockIcon /></InputAdornment>,
                                            endAdornment: <InputAdornment position="end">{confirmPasswordVisibility ? <VisibilityOffIcon className={RegisterStyles.VisibilityOffIcon} onClick={() => setConfirmPasswordVisibility(false)} /> : <VisibilityIcon className={RegisterStyles.VisibilityIcon} onClick={() => setConfirmPasswordVisibility(true)} />}</InputAdornment>
                                        }}
                                        sx={{ input: { "&::placeholder": { opacity: 0.9 } } }}
                                        placeholder={"Confirm password"} size="small"
                                    />
                                </div>
                            </div>


                        </FormControl>
                        {/* <div className={RegisterStyles.loginOptions}>
                            <label>
                                <input type="checkbox" /> <span className={RegisterStyles.remember}>Remember me</span>
                            </label>
                            <a href="/forgot-password" className={RegisterStyles.forgotPassword}>Forgot your password?</a>
                        </div> */}
                        <button type="submit" className={RegisterStyles.registerButton}>Sign Up</button>
                    </div>
                    <div className={RegisterStyles.loginOr}>Or</div>
                    <button className={RegisterStyles.loginGoogle}>
                        <img src={GoogleImg} alt="Google Logo" /> Sign up with Google
                    </button>
                    <p className={RegisterStyles.loginRegister}>
                        Already have an account? <span className={RegisterStyles.loginHere} onClick={handleLoginText}>Login here</span>
                    </p>
                </div>
                <div className={RegisterStyles.loginRight}>
                    <img src="" alt="Background Design" className={RegisterStyles.backgroundImage} />
                </div>
            </div>
        </div>
    )
}

export default RegisterHome