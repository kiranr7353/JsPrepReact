import React, { useState } from 'react'
import ForgotPasswordStyles from './ForgotPassword.module.css'
import { Alert, Dialog, DialogContent, DialogContentText, FormControl, InputAdornment, Slide, Snackbar, TextField } from '@mui/material'
import Loader from '../../CommonComponents/Loader/Loader'
import ForgotPasswordImg from '../../Images/ForgotPassword.jpg';
import CommonButton from '../../CommonComponents/CommonButton'
import EmailIcon from '@mui/icons-material/Email';
import IconButton from '@mui/material/IconButton';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import WestIcon from '@mui/icons-material/West';
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../../firebaseConfig'
import { useNavigate } from 'react-router-dom'

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ForgotPasswordHome = () => {

  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snakbarMsg, setSnakbarMsg] = useState('');
  const [openDialog, setOpenDialog] = useState({ open: false, message: '' });
  const [isFetching, setIsFetching] = useState(false);

  const handleChange = e => {
    setEmail(e.target.value);
  }

  const handleTriggerEmail = () => {
    setOpenDialog({ open: false, message: '' })
    setIsFetching(true);
    sendPasswordResetEmail(auth, email).then(() => {
      setIsFetching(false);
      setOpenDialog({ open: true, message: "Please check your inbox for password reset email!!" })
    }).catch((error) => {
      setIsFetching(false);
      setSnakbarMsg(error.message)
      setOpenSnackbar(true);
    })
  }

  const handleKeyDown = e => {
    if (e.keyCode === 13 || e.key === "Enter") {
      if (!email) {
        return;
      } else {
        handleTriggerEmail();
      }
    }
  }

  const handleOk = () => {
    setOpenDialog({ open: false, message: "" });
    navigate('/login');
  }

  return (
    <>
      {(isFetching) && <Loader showLoader={isFetching} />}
      <div className={ForgotPasswordStyles.loginCcontainer}>
        <div className={ForgotPasswordStyles.registerBox}>
          <div className={ForgotPasswordStyles.registerLeft}>
            <div className={ForgotPasswordStyles.loginLogo}>
              <img src={'gs://jsprep-ed0c8.appspot.com/LoginPageImages/login.jpg'} alt="Logo" />
            </div>
            <div onClick={() => navigate('/login')} className={ForgotPasswordStyles.back}>
              <WestIcon /> <h4>Back</h4>
            </div>
            <h1 className={ForgotPasswordStyles.loginTitle}>Reset Password!</h1>
            <div className={ForgotPasswordStyles.loginForm}>
              <FormControl sx={{ width: '100%' }}>
                <label>Email <span className={ForgotPasswordStyles.required}>*</span></label>
                <TextField
                  name='email'
                  value={email}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  InputProps={{
                    type: 'text',
                    startAdornment: <InputAdornment position="start"><EmailIcon /></InputAdornment>
                  }}
                  sx={{ input: { "&::placeholder": { opacity: 0.9 } } }}
                  placeholder={"Enter your mail address"} size="small"
                />
              </FormControl>
              <CommonButton variant="contained" bgColor={'#5b67f1'} color={'white'} padding={'15px'} borderRadius={'5px'} fontWeight={'bold'} width={'100%'} height={'45px'} margin={'20px 0 0 0'} disabled={!email} onClick={handleTriggerEmail}>Send Reset Password Email</CommonButton>
            </div>
          </div>
          <div className={ForgotPasswordStyles.loginRight}>
            <img src={ForgotPasswordImg} loading='lazy' alt="Background Design" className={ForgotPasswordStyles.backgroundImage} />
          </div>
        </div>
      </div>
      <Snackbar open={openSnackbar} autoHideDuration={5000} onClose={() => setOpenSnackbar(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity="error"
          sx={{ width: '100%' }}
        >
          {snakbarMsg}
        </Alert>
      </Snackbar>
      <Dialog open={openDialog.open} TransitionComponent={Transition} keepMounted onClose={() => setOpenDialog({ open: false, message: '' })} aria-describedby="alert-dialog-slide-description" fullWidth={false} maxWidth="sm" className={ForgotPasswordStyles.dialogWrapper}>
        <div className={ForgotPasswordStyles.modalinnerwrapper}>
          <div className={ForgotPasswordStyles.successDiv}><CheckCircleIcon className={ForgotPasswordStyles.successIcon} /><h4 className={ForgotPasswordStyles.headerText}>Success..</h4></div>
          <IconButton aria-label="close" onClick={() => setOpenDialog({ open: false, message: '' })} sx={{ position: 'absolute', right: 8, top: 8, color: "#666" }}>
            <CloseIcon />
          </IconButton>
          <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">
              <div className={ForgotPasswordStyles.errorMessage}>{openDialog.message}</div>
            </DialogContentText>
          </DialogContent>
          <div className={ForgotPasswordStyles.modalabuttons}>
            <div className={ForgotPasswordStyles.modalactionsection}>
              <button onClick={handleOk} className={ForgotPasswordStyles.okButton}>
                Ok
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  )
}

export default ForgotPasswordHome