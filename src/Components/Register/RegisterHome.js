import React, { useContext, useEffect, useRef, useState } from 'react';
import RegisterStyles from './Register.module.css';
import GoogleImg from '../../Images/google.png';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import PhoneIcon from '@mui/icons-material/Phone';
import { TextField, FormControl, InputAdornment, Dialog, DialogContent, DialogContentText, Slide, Snackbar, Alert, Select, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CommonButton from '../../CommonComponents/CommonButton';
import { createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import Loader from '../../CommonComponents/Loader/Loader';
import { setUserInfo } from '../../Redux/Actions/ReduxOperations';
import { UserContext } from '../../CommonComponents/UserContextProvider';
import { useDispatch } from 'react-redux';
import { SetCookie } from '../../Utils/util-functions';
import { useFetchAPI } from '../../Hooks/useAPI';
import { fetchQueryParams } from '../../Hooks/fetchQueryParams';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const RegisterHome = () => {

    const navigate = useNavigate();
    let dispatch = useDispatch();

    const { infoObject, setObject } = useContext(UserContext);

    const [passwordVisibility, setPasswordVisibility] = useState(true);
    const [confirmPasswordVisibility, setConfirmPasswordVisibility] = useState(true);
    const [registerFormValues, setRegisterFormValues] = useState({ firstName: '', lastName: '', dob: null, code: '+91', phoneNumber: '', email: '', password: '', confirmPassword: '' });
    const passwordMatchedError = useRef('');
    const [openRegisterSnackbar, setOpenRegisterSnackbar] = useState(false);
    const [snakbarRegisterMsg, setSnakbarRegisterMsg] = useState('');
    const [isFetching, setIsFetching] = useState(false);
    const [passwordMatch, setPasswordMatch] = useState(true);
    const [callRegisterApi, setCallRegisterApi] = useState(false);
    const [registerPayload, setRegisterPayload] = useState({});
    const [errorMessage, setErrorMessage] = useState('');
    const [openRegisterErrorDialog, setOpenRegisterErrorDialog] = useState(false);

    const codes = ['+91', '+92'];

    const Common_headers = {
        "content-type": "application/json",
        "accept": "application/json"
    }

    const handleLoginText = () => {
        navigate('/login');
    }

    const handleRegisterChange = event => {
        setRegisterFormValues({ ...registerFormValues, [event.target.name]: event.target.value });

    }

    useEffect(() => {
        if (registerFormValues?.password?.length > 0 && registerFormValues?.confirmPassword?.length > 0) {
            if (registerFormValues?.password !== registerFormValues?.confirmPassword) {
                passwordMatchedError.current = "Password's must match";
                setPasswordMatch(false);
            } else {
                passwordMatchedError.current = "";
                setPasswordMatch(true);
            }
        }
    }, [registerFormValues?.password, registerFormValues?.confirmPassword])

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            if (user) {
                console.log(user, 'authChange');
            } else {
                console.log("user not authenticated");
            }
        });
        return () => unsub();
    }, []);

    const handleRegisterErrors = (errors) => {
        switch (errors?.code) {
            case 'auth/email-already-in-use':
                setOpenRegisterSnackbar(true);
                setSnakbarRegisterMsg('Account already exists. Try again with different Email.');
                break;
            case 'auth/missing-password':
                setOpenRegisterSnackbar(true);
                setSnakbarRegisterMsg('Please enter valid email or password!!');
                break;
            case 'auth/invalid-email':
                setOpenRegisterSnackbar(true);
                setSnakbarRegisterMsg('Please enter valid email!!');
                break;
            default:
                setOpenRegisterSnackbar(true);
                setSnakbarRegisterMsg('Please enter valid email or password!!');
                break;
        }
    }

    const handleRegister = () => {
        setIsFetching(true);
        createUserWithEmailAndPassword(auth, registerFormValues?.email, registerFormValues?.password).then((user) => {
            setIsFetching(false);
            console.log(user);
            setObject({ userInfo: user?.user?.stsTokenManager?.accessToken }, 'add');
            SetCookie('userTokenInfo', user?.user?.stsTokenManager?.accessToken, { path: '/' });
            SetCookie('userInfo', user?.user?.reloadUserInfo, { path: '/' });
            dispatch(setUserInfo(user?.user?.reloadUserInfo));
            setRegisterPayload({
                firstName: registerFormValues?.firstName,
                lastName: registerFormValues?.lastName,
                code: registerFormValues?.code,
                phoneNumber: registerFormValues?.phoneNumber,
                dob: registerFormValues?.dob,
                password: registerFormValues?.password,
                confirmPassword: registerFormValues?.confirmPassword,
                email: registerFormValues?.email,
                idToken: user?.user?.stsTokenManager?.accessToken,
                refreshToken: user?.user?.stsTokenManager?.refreshToken,
            })
            setCallRegisterApi(true);
        }).catch((error) => {
            console.log(error);
            setIsFetching(false);
            const errString = JSON.stringify(error);
            const errorJson = JSON.parse(errString);
            handleRegisterErrors(errorJson)
        })
    }

    const onRegisterSuccess = res => {
        setCallRegisterApi(false);
        console.log(res);
        if ((res?.status === 200 || res?.status === 201)) {
            navigate('/home');
        } else {
            setErrorMessage(res?.data?.detail ? res?.data?.detail : 'Something went wrong. Please try again later.');
            setOpenRegisterErrorDialog(true);
        }
    }

    let registerApi = useFetchAPI("RegisterApi", `/user/register`, "POST", registerPayload, Common_headers, fetchQueryParams("", "", "", onRegisterSuccess, "", callRegisterApi));
    const fetching = registerApi?.Loading || registerApi?.Fetching;

    return (
        <>
            {(isFetching || fetching) && <Loader showLoader={isFetching} />}
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
                                        <label>First Name <span className={RegisterStyles.required}>*</span></label>
                                        <TextField
                                            name='firstName'
                                            value={registerFormValues?.firstName}
                                            onChange={handleRegisterChange}
                                            InputProps={{
                                                type: 'text',
                                                startAdornment: <InputAdornment position="start"><AccountCircleIcon /></InputAdornment>
                                            }}
                                            sx={{ input: { "&::placeholder": { opacity: 0.9 } } }}
                                            placeholder={"Enter your first name"} size="small"
                                        />

                                    </div>
                                    <div>
                                        <label>Last Name <span className={RegisterStyles.required}>*</span></label>
                                        <TextField
                                            name='lastName'
                                            value={registerFormValues?.lastName}
                                            onChange={handleRegisterChange}
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
                                        <label>Date of Birth <span className={RegisterStyles.required}>*</span></label>
                                        <TextField
                                            name='dob'
                                            value={registerFormValues?.dob}
                                            onChange={handleRegisterChange}
                                            InputProps={{
                                                type: 'date',
                                                startAdornment: <InputAdornment position="start"><CalendarMonthIcon /></InputAdornment>
                                            }}
                                            sx={{ input: { "&::placeholder": { opacity: 0.9 } } }}
                                            placeholder={"Select your date of birth"} size="small"
                                        />
                                    </div>
                                    <div className={RegisterStyles.phoneNumberDiv}>
                                        <div className={RegisterStyles.code}>
                                            <FormControl>
                                                <label>Code</label>
                                                <Select
                                                    defaultValue=""
                                                    id="outlined-select-licence"
                                                    select
                                                    size='small'
                                                    name='code'
                                                    value={registerFormValues?.code}
                                                    onChange={handleRegisterChange}
                                                >
                                                    {codes?.map((option) => (
                                                        <MenuItem key={option} value={option} >
                                                            {option}
                                                        </MenuItem>
                                                    )
                                                    )}
                                                </Select>
                                            </FormControl>
                                        </div>
                                        <div>
                                            <label>Phone Number <span className={RegisterStyles.required}>*</span></label>
                                            <TextField
                                                name='phoneNumber'
                                                value={registerFormValues?.phoneNumber}
                                                onChange={handleRegisterChange}
                                                InputProps={{
                                                    type: 'text',
                                                    startAdornment: <InputAdornment position="start"><PhoneIcon /></InputAdornment>
                                                }}
                                                sx={{ input: { "&::placeholder": { opacity: 0.9 } } }}
                                                placeholder={"Enter your phone number"} size="small"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <label>Email <span className={RegisterStyles.required}>*</span></label>
                                <TextField
                                    name='email'
                                    value={registerFormValues?.email}
                                    onChange={handleRegisterChange}
                                    InputProps={{
                                        type: 'text',
                                        startAdornment: <InputAdornment position="start"><EmailIcon /></InputAdornment>
                                    }}
                                    sx={{ input: { "&::placeholder": { opacity: 0.9 } } }}
                                    placeholder={"Enter your mail address"} size="small"
                                />
                                <div className={RegisterStyles.nameContainer}>
                                    <div>
                                        <label>Password <span className={RegisterStyles.required}>*</span></label>
                                        <TextField
                                            name='password'
                                            value={registerFormValues?.password}
                                            onChange={handleRegisterChange}
                                            InputProps={{
                                                type: passwordVisibility ? 'password' : 'text',
                                                startAdornment: <InputAdornment position="start"><LockIcon /></InputAdornment>,
                                                endAdornment: <InputAdornment position="end">{passwordVisibility ? <VisibilityOffIcon className={RegisterStyles.VisibilityOffIcon} onClick={() => setPasswordVisibility(false)} /> : <VisibilityIcon className={RegisterStyles.VisibilityIcon} onClick={() => setPasswordVisibility(true)} />}</InputAdornment>
                                            }}
                                            sx={{ input: { "&::placeholder": { opacity: 0.9 } } }}
                                            placeholder={"Enter password"} size="small"
                                        />
                                    </div>
                                    <div>
                                        <label>Confirm Password <span className={RegisterStyles.required}>*</span></label>
                                        <TextField
                                            name='confirmPassword'
                                            value={registerFormValues?.confirmPassword}
                                            onChange={handleRegisterChange}
                                            InputProps={{
                                                type: confirmPasswordVisibility ? 'password' : 'text',
                                                startAdornment: <InputAdornment position="start"><LockIcon /></InputAdornment>,
                                                endAdornment: <InputAdornment position="end">{confirmPasswordVisibility ? <VisibilityOffIcon className={RegisterStyles.VisibilityOffIcon} onClick={() => setConfirmPasswordVisibility(false)} /> : <VisibilityIcon className={RegisterStyles.VisibilityIcon} onClick={() => setConfirmPasswordVisibility(true)} />}</InputAdornment>
                                            }}
                                            sx={{ input: { "&::placeholder": { opacity: 0.9 } } }}
                                            placeholder={"Confirm password"} size="small"
                                        />
                                    </div>
                                </div>
                                {!passwordMatch && <span className={RegisterStyles.passwordMismatch}>*{passwordMatchedError.current}</span>}
                            </FormControl>
                            {/* <div className={RegisterStyles.loginOptions}>
                            <label>
                                <input type="checkbox" /> <span className={RegisterStyles.remember}>Remember me</span>
                            </label>
                        </div> */}

                        </div>
                        <div className={RegisterStyles.buttonsDiv}>
                            <div className={RegisterStyles.signUpBtn}>
                                <CommonButton variant="contained" bgColor={'#5b67f1'} color={'white'} padding={'15px'} borderRadius={'5px'} fontWeight={'bold'} width={'100%'} height={'45px'} marign={'20px 0 0 0'} disabled={!registerFormValues?.email || !registerFormValues?.password || !registerFormValues?.confirmPassword || !registerFormValues?.firstName || !registerFormValues?.lastName || !registerFormValues?.phoneNumber || !registerFormValues?.dob || !passwordMatch} onClick={handleRegister}>Sign Up</CommonButton>
                            </div>
                            <div className={RegisterStyles.googleBtn}>
                                <CommonButton variant="contained" bgColor={'#f8f8f8'} color={'black'} padding={'15px'} borderRadius={'5px'} fontWeight={'bold'} width={'100%'} height={'45px'} marign={'20px 0 0 0'} border={'1px solid #ddd'}>
                                    <img className={RegisterStyles.googleImage} src={GoogleImg} alt="Google Logo" /> Sign up with Google
                                </CommonButton>
                            </div>
                        </div>
                        <p className={RegisterStyles.loginRegister}>
                            Already have an account? <span className={RegisterStyles.loginHere} onClick={handleLoginText}>Login here</span>
                        </p>
                    </div>
                    <div className={RegisterStyles.loginRight}>
                        <img src="" alt="Background Design" className={RegisterStyles.backgroundImage} />
                    </div>
                </div>
            </div>
            <Snackbar open={openRegisterSnackbar} autoHideDuration={5000} onClose={() => setOpenRegisterSnackbar(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert
                    onClose={() => setOpenRegisterSnackbar(false)}
                    severity="error"
                    sx={{ width: '100%' }}
                >
                    {snakbarRegisterMsg}
                </Alert>
            </Snackbar>
            <Dialog open={openRegisterErrorDialog} TransitionComponent={Transition} keepMounted onClose={() => setOpenRegisterErrorDialog(false)} aria-describedby="alert-dialog-slide-description" fullWidth={false} maxWidth="sm" className={RegisterStyles.dialogWrapper}>
                <div className={RegisterStyles.modalinnerwrapper}>
                    <div><h4 className={RegisterStyles.headerText}>Oops..</h4></div>
                    <IconButton aria-label="close" onClick={() => setOpenRegisterErrorDialog(false)} sx={{ position: 'absolute', right: 8, top: 8, color: "#666" }}>
                        <CloseIcon />
                    </IconButton>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-slide-description">

                        </DialogContentText>
                        <div className={RegisterStyles.errorMessage}>{errorMessage}</div>
                    </DialogContent>
                    <div className={RegisterStyles.modalabuttons}>
                        <div className={RegisterStyles.modalactionsection}>
                            <button onClick={() => setOpenRegisterErrorDialog(false)} className={RegisterStyles.okButton}>
                                Ok
                            </button>
                        </div>
                    </div>
                </div>
            </Dialog>
        </>
    )
}

export default RegisterHome