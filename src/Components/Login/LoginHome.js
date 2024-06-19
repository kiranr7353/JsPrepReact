import React, { useContext, useState } from 'react';
import LoginStyles from './Login.module.css';
import GoogleImg from '../../Images/google.png';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { TextField, FormControl, InputAdornment, Snackbar, Alert } from '@mui/material';
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
    signInWithEmailAndPassword(auth, formValues?.email, formValues?.password).then((user) => {
      console.log(user?.user);
      setLoginPayload({
        idToken: user?.user?.stsTokenManager?.accessToken,
        refreshToken: user?.user?.stsTokenManager?.refreshToken
      });
      setObject({ userInfo: user?.user?.stsTokenManager?.accessToken }, 'add');
      SetCookie('userTokenInfo', user?.user?.stsTokenManager?.accessToken, { path: '/' });
      SetCookie('userInfo', user?.user?.reloadUserInfo, { path: '/' });
      dispatch(setUserInfo(user?.user?.reloadUserInfo));
      // setCallLoginApi(true);
    }).catch((error) => {
      const errString = JSON.stringify(error);
      const errorJson = JSON.parse(errString);
      handleLoginErrors(errorJson)
    })

  }

  const onLoginSuccess = res => {
    setCallLoginApi(false);
    console.log(res);
  }

  let loginApi = useFetchAPI("LoginApi", `/user/login`, "POST", loginPayload, Common_headers, fetchQueryParams("", "", "", onLoginSuccess, "", callLoginApi));

  return (
    <>
      <div className={LoginStyles.loginCcontainer}>
        <div className={LoginStyles.loginBox}>
          <div className={LoginStyles.loginLeft}>
            <div className={LoginStyles.loginLogo}>
              <img src="logo-path.png" alt="Logo" />
            </div>
            <h1 className={LoginStyles.loginTitle}>Welcome back!</h1>
            <div className={LoginStyles.loginForm}>
              <FormControl sx={{ width: '100%' }}>
                <label>Email *</label>
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
                <label>Password *</label>
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
            <div className={LoginStyles.loginOr}>Or</div>
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
    </>
  )
}

export default LoginHome