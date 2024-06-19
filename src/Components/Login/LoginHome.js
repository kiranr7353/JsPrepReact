import React from 'react';
import LoginStyles from './Login.module.css';
import GoogleImg from '../../Images/google.png';
import EmailIcon from '@mui/icons-material/Email';
import { TextField, FormControl, InputAdornment, Dialog, DialogContent, DialogContentText, Slide, Snackbar, Alert,Autocomplete, Paper, CircularProgress, Box, Typography } from '@mui/material';

const LoginHome = () => {
  return (
    <>
      <div className={LoginStyles.loginCcontainer}>
        <div className={LoginStyles.loginBox}>
          <div className={LoginStyles.loginLeft}>
            <div className={LoginStyles.loginLogo}>
              {/* Replace with your logo path */}
              <img src="logo-path.png" alt="Logo" />
            </div>
            <h1 className={LoginStyles.loginTitle}>Welcome back!</h1>
            <p className={LoginStyles.loginSubtitle}>Enter to get unlimited access to data & information.</p>
            <form className={LoginStyles.loginForm}>
            <FormControl>
                <label>Email *</label>
                <TextField
                  InputProps={{
                    type: 'text',
                    startAdornment: <InputAdornment position="start"><EmailIcon /></InputAdornment>
                  }}
                  sx={{ input: { "&::placeholder": { opacity: 0.9 } } }}
                  placeholder={"Enter your mail address"} size="small"
                />
            </FormControl>
              
              <input type="email" placeholder="Enter your mail address" required />
              <label>Password *</label>
              <input type="password" placeholder="Enter password" required />
              <div className={LoginStyles.loginOptions}>
                <label>
                  <input type="checkbox" /> <span className={LoginStyles.remember}>Remember me</span>
                </label>
                <a href="/forgot-password" className={LoginStyles.forgotPassword}>Forgot your password?</a>
              </div>
              <button type="submit" className={LoginStyles.loginButton}>Log In</button>
            </form>
            <div className={LoginStyles.loginOr}>Or, Login with</div>
            <button className={LoginStyles.loginGoogle}>
              <img src={GoogleImg} alt="Google Logo" /> Sign up with Google
            </button>
            <p className={LoginStyles.loginRegister}>
              Don't have an account? <span className={LoginStyles.registerHere}>Register here</span>
            </p>
          </div>
          <div className={LoginStyles.loginRight}>
            {/* Background design */}
            <img src="" alt="Background Design" className={LoginStyles.backgroundImage} />
          </div>
        </div>
      </div>
    </>
  )
}

export default LoginHome