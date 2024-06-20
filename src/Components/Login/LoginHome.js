import React, { useContext, useState } from 'react';
import LoginStyles from './Login.module.css';
import GoogleImg from '../../Images/google.png';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { TextField, FormControl, InputAdornment, Snackbar, Alert, Dialog, DialogContent, DialogContentText, Slide } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CommonButton from '../../CommonComponents/CommonButton';
import { fetchQueryParams } from '../../Hooks/fetchQueryParams';
import { useFetchAPI } from '../../Hooks/useAPI';
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../firebaseConfig';
import { UserContext } from '../../CommonComponents/UserContextProvider';
import { SetCookie } from '../../Utils/util-functions';
import { useDispatch } from 'react-redux';
import { setUserInfo } from '../../Redux/Actions/ReduxOperations';
import Loader from '../../CommonComponents/Loader/Loader';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const LoginHome = () => {

  const navigate = useNavigate();
  let dispatch = useDispatch();

  const Common_headers = {
    "content-type": "application/json",
    "accept": "application/json"
  }

  const { infoObject, setObject } = useContext(UserContext);

  const [passwordVisibility, setPasswordVisibility] = useState(true);
  const [formValues, setFormValues] = useState({ email: '', password: '' });
  const [loginPayload, setLoginPayload] = useState({});
  const [callLoginApi, setCallLoginApi] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snakbarMsg, setSnakbarMsg] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [openLoginErrorDialog, setOpenLoginErrorDialog] = useState(false);

  const handleRegisterText = () => {
    navigate('/register');
  }

  const handleLoginForm = (event) => {
    setFormValues({ ...formValues, [event.target.name]: event.target.value });
  }

  const handleLoginErrors = (errors) => {
    switch (errors?.code) {
      case 'auth/invalid-email':
        setOpenSnackbar(true);
        setSnakbarMsg('Please enter valid email or password!!');
        break;
      case 'auth/missing-password':
        setOpenSnackbar(true);
        setSnakbarMsg('Please enter valid email or password!!');
        break;
      case 'auth/invalid-credential':
        setOpenSnackbar(true);
        setSnakbarMsg('Please enter valid email or password!!');
        break;
      default:
        setOpenSnackbar(true);
        setSnakbarMsg('Please enter valid email or password!!');
        break;
    }
  }

  const handleLogin = () => {
    setIsFetching(true);
    signInWithEmailAndPassword(auth, formValues?.email, formValues?.password).then((user) => {
      setIsFetching(false);
      console.log(user?.user);
      setLoginPayload({
        idToken: user?.user?.stsTokenManager?.accessToken,
        refreshToken: user?.user?.stsTokenManager?.refreshToken
      });
      setObject({ userInfo: user?.user?.stsTokenManager?.accessToken }, 'add');
      SetCookie('userTokenInfo', user?.user?.stsTokenManager?.accessToken, { path: '/' });
      SetCookie('userInfo', user?.user?.reloadUserInfo, { path: '/' });
      SetCookie('idleTime', user?.user?.stsTokenManager?.expirationTime, { path: '/' });
      dispatch(setUserInfo(user?.user?.reloadUserInfo));
      setCallLoginApi(true);
    }).catch((error) => {
      setIsFetching(false);
      const errString = JSON.stringify(error);
      const errorJson = JSON.parse(errString);
      handleLoginErrors(errorJson)
    })

  }

  const onLoginSuccess = res => {
    setCallLoginApi(false);
    console.log(res);
    if ((res?.status === 200 || res?.status === 201)) {
        navigate('/home');
    } else {
        setErrorMessage(res?.data?.detail ? res?.data?.detail : 'Something went wrong. Please try again later.');
        setOpenLoginErrorDialog(true);
    }
  }

  let loginApi = useFetchAPI("LoginApi", `/user/login`, "POST", loginPayload, Common_headers, fetchQueryParams("", "", "", onLoginSuccess, "", callLoginApi));
  const fetching = loginApi?.Loading || loginApi?.Fetching;

  return (
    <>
      {(isFetching || fetching) && <Loader showLoader={isFetching} />}
      <div className={LoginStyles.loginCcontainer}>
        <div className={LoginStyles.loginBox}>
          <div className={LoginStyles.loginLeft}>
            <div className={LoginStyles.loginLogo}>
              <img src="logo-path.png" alt="Logo" />
            </div>
            <h1 className={LoginStyles.loginTitle}>Welcome back!</h1>
            <div className={LoginStyles.loginForm}>
              <FormControl sx={{ width: '100%' }}>
                <label>Email <span className={LoginStyles.required}>*</span></label>
                <TextField
                  name='email'
                  value={formValues?.email}
                  onChange={handleLoginForm}
                  InputProps={{
                    type: 'text',
                    startAdornment: <InputAdornment position="start"><EmailIcon /></InputAdornment>
                  }}
                  sx={{ input: { "&::placeholder": { opacity: 0.9 } } }}
                  placeholder={"Enter your mail address"} size="small"
                />
                <label>Password <span className={LoginStyles.required}>*</span></label>
                <TextField
                  name='password'
                  value={formValues?.password}
                  onChange={handleLoginForm}
                  InputProps={{
                    type: passwordVisibility ? 'password' : 'text',
                    startAdornment: <InputAdornment position="start"><LockIcon /></InputAdornment>,
                    endAdornment: <InputAdornment position="end">{passwordVisibility ? <VisibilityOffIcon className={LoginStyles.VisibilityOffIcon} onClick={() => setPasswordVisibility(false)} /> : <VisibilityIcon className={LoginStyles.VisibilityIcon} onClick={() => setPasswordVisibility(true)} />}</InputAdornment>
                  }}
                  sx={{ input: { "&::placeholder": { opacity: 0.9 } } }}
                  placeholder={"Enter password"} size="small"
                />
              </FormControl>

              <div className={LoginStyles.loginOptions}>
                <label>
                  <input type="checkbox" /> <span className={LoginStyles.remember}>Remember me</span>
                </label>
                <a href="/forgot-password" className={LoginStyles.forgotPassword}>Forgot your password?</a>
              </div>
              <CommonButton variant="contained" bgColor={'#5b67f1'} color={'white'} padding={'15px'} borderRadius={'5px'} fontWeight={'bold'} width={'100%'} height={'45px'} marign={'20px 0 0 0'} disabled={!formValues?.email || !formValues?.password} onClick={handleLogin}>Log In</CommonButton>
            </div>
            <CommonButton variant="contained" bgColor={'#f8f8f8'} color={'black'} padding={'15px'} borderRadius={'5px'} fontWeight={'bold'} width={'100%'} height={'45px'} marign={'20px 0 0 0'} border={'1px solid #ddd'}>
              <img className={LoginStyles.googleImage} src={GoogleImg} alt="Google Logo" /> Sign up with Google
            </CommonButton>
            <p className={LoginStyles.loginRegister}>
              Don't have an account? <span className={LoginStyles.registerHere} onClick={handleRegisterText}>Register here</span>
            </p>
          </div>
          <div className={LoginStyles.loginRight}>
            <img src="" alt="Background Design" className={LoginStyles.backgroundImage} />
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
      <Dialog open={openLoginErrorDialog} TransitionComponent={Transition} keepMounted onClose={() => setOpenLoginErrorDialog(false)} aria-describedby="alert-dialog-slide-description" fullWidth={false} maxWidth="sm" className={LoginStyles.dialogWrapper}>
        <div className={LoginStyles.modalinnerwrapper}>
          <div><h4 className={LoginStyles.headerText}>Oops..</h4></div>
          <IconButton aria-label="close" onClick={() => setOpenLoginErrorDialog(false)} sx={{ position: 'absolute', right: 8, top: 8, color: "#666" }}>
            <CloseIcon />
          </IconButton>
          <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">

            </DialogContentText>
            <div className={LoginStyles.errorMessage}>{errorMessage}</div>
          </DialogContent>
          <div className={LoginStyles.modalabuttons}>
            <div className={LoginStyles.modalactionsection}>
              <button onClick={() => setOpenLoginErrorDialog(false)} className={LoginStyles.okButton}>
                Ok
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  )
}

export default LoginHome