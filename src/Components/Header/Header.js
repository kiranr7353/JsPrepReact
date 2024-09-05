import React, { useEffect, useState } from 'react'
import CommonButton from '../../CommonComponents/CommonButton'
import { InputAdornment, TextField, Dialog, DialogContent, DialogContentText, Slide, Snackbar, Alert } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ClearIcon from '@mui/icons-material/Clear';
import MicIcon from '@mui/icons-material/Mic';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import HeaderStyles from './HeaderStyles.module.css';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { Outlet, useNavigate } from 'react-router-dom';
import { useFetchAPI } from '../../Hooks/useAPI';
import { useDispatch, useSelector } from 'react-redux';
import { CommonHeaders } from '../../CommonComponents/CommonHeaders';
import { fetchQueryParams } from '../../Hooks/fetchQueryParams';
import Loader from '../../CommonComponents/Loader/Loader';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { setRole } from '../../Redux/Actions/ReduxOperations';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const Header = () => {

    const appState = useSelector(state => state);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [searchInput, setSearchInput] = useState('');
    const [detailsResponse, setDetailsResponse] = useState({});
    const [isFetching, setIsFetching] = useState(false);
    const [detailErrorMessage, setDetailErrorMessage] = useState('');
    const [openDetailErrorDialog, setOpenDetailErrorDialog] = useState(false);
    const [callSearchApi, setCallSearchApi] = useState(false);
    const [searchApiInfo, setsearchApiInfo] = useState({ data: [], successMsg: '', errorMsg: '' });
    const [openMicDialog, setOpenMicDialog] = useState(false);
    const [snackBarOpen, setSnackBarOpen] = useState(false);
    const [openMicSnackbar, setOpenMicSnackbar] = useState(false);
    const [micPermissionError, setMicPermissionError] = useState('');
    const [transcribing, setTranscribing] = useState(true);
    const [placeholder, setPlaceholder] = useState('');
    const [clearTranscriptOnListen, setClearTranscriptOnListen] = useState(true)
    const toggleTranscribing = () => setTranscribing(!transcribing)
    const toggleClearTranscriptOnListen = () => setClearTranscriptOnListen(!clearTranscriptOnListen)

    const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition, isMicrophoneAvailable } = useSpeechRecognition({ toggleClearTranscriptOnListen });

    const onDetailSuccess = res => {
        if ((res?.status === 200 || res?.status === 201)) {
            setDetailsResponse(res?.data?.userInfo);
            dispatch(setRole(res?.data?.userInfo?.role));
        } else {
            if (res?.status === 401) {
                setDetailErrorMessage("Session Expired. Please login again!!");
            } else {
                setDetailErrorMessage(res?.data?.detail ? res?.data?.detail : 'Something went wrong. Please try again later.');
            }
            setOpenDetailErrorDialog(true);
        }
    }


    const handleChange = (e) => {
        setSearchInput(e?.target?.value);
    }

    const handleClear = () => {
        setSearchInput('');
    }

    const handleLogout = () => {
        setIsFetching(true);
        signOut(auth).then((result) => {
            setIsFetching(false);
            if (result) {
                navigate('/logout', { replace: true })
            }
        }).catch((error) => {
            setIsFetching(false);
        })
    }

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            if (user) {
            } else {
                navigate('/logout', { replace: true })
            }
        });
        return () => unsub();
    }, []);

    const handleDetailErrorModalClose = () => {
        setOpenDetailErrorDialog(false);
        navigate('/login');
    }

    const handleKeyDown = e => {
        if (e.keyCode === 13 || e.key === "Enter") {
            setCallSearchApi(true);
        }
    }

    const onSearchSuccess = res => {
        setCallSearchApi(false);
        if ((res?.status === 200 || res?.status === 201)) {
            setsearchApiInfo({ data: res?.data?.topics, successMsg: 'Success', errorMsg: '' });
            navigate(`/home/search`, { state: { topics: res?.data?.topics, inputText: searchInput } })
        } else {
            setsearchApiInfo({ data: [], successMsg: '', errorMsg: res?.data?.detail ? res?.data?.detail : 'Something went wrong. Please try again later' });
            navigate(`/home/search`, { state: { topics: [], inputText: searchInput, errorMsg: res?.data?.detail ? res?.data?.detail : 'Something went wrong. Please try again later' } })
            // setSnackBarOpen(true);
        }
    }

    const handleSnackBarClose = () => {
        setSnackBarOpen(false);
    }

    useEffect(() => {
        if (!isMicrophoneAvailable) {
            setMicPermissionError("Please allow access to the microphone");
            setOpenMicSnackbar(true);
            setOpenMicDialog(false);
        }
    }, [isMicrophoneAvailable])

    useEffect(() => {
        if (!browserSupportsSpeechRecognition) {
            setMicPermissionError("This Browser doesn't support speech recognition. Please try again with differnt browser");
            setOpenMicSnackbar(true);
            setOpenMicDialog(false);
        }
    }, [browserSupportsSpeechRecognition])

    const handleMicIconClick = () => {
        resetTranscript();
        setMicPermissionError('');
        setOpenMicSnackbar(false);
        if (!browserSupportsSpeechRecognition) {
            setMicPermissionError("This Browser doesn't support speech recognition. Please try again with differnt browser");
            setOpenMicSnackbar(true);
            setOpenMicDialog(false);
        } else if (!isMicrophoneAvailable) {
            setMicPermissionError("Please allow access to the microphone");
            setOpenMicSnackbar(true);
            setOpenMicDialog(false);
        } else {
            setOpenMicDialog(true);
            setTimeout(() => {
                SpeechRecognition.startListening({ continuous: true });
            }, 100);
        }
    }

    const handleMicDialogClose = () => {
        resetTranscript();
        setOpenMicDialog(false);
        setMicPermissionError('');
        setOpenMicSnackbar(false);
        setTimeout(() => {
            SpeechRecognition.abortListening();
            SpeechRecognition.stopListening();
        }, 100);
    }

    const handleMicToggle = () => {
        resetTranscript();
        if (!listening) {
            SpeechRecognition.startListening({ continuous: true });
            setTimeout(() => {
                if (transcript?.length === 0) {
                    SpeechRecognition.stopListening();
                }
            }, 4000);
        } else {
            SpeechRecognition.stopListening();
        }
    }

    const handleOk = () => {
        setSearchInput(transcript);
        setCallSearchApi(true);
        handleMicDialogClose();
        setTimeout(() => {
            SpeechRecognition.stopListening();
            SpeechRecognition.abortListening();
        }, 100);
    }

    const handleReset = () => {
        resetTranscript();
    }

    const randomPlaceholder = (arr, min, max) => {
        return arr[Math.floor(Math.random()
            * (max - min + 1)) + min];
    };

    const onPlaceholderSuccess = res => {
        if ((res?.status === 200 || res?.status === 201)) {
            let data = res?.data?.placeholders?.length > 0 ? res?.data?.placeholders : ['Topics'];
            setInterval(() => {
                setPlaceholder(randomPlaceholder(data, 0, data.length - 1))
            }, 2000);
        } else {
            setPlaceholder('Topics');
        }
    }

    let detailsApi = useFetchAPI("DetailsApi", `/user/${appState?.userInfo?.localId}`, "GET", '', CommonHeaders(), fetchQueryParams("", "", "", onDetailSuccess));
    let searchApi = useFetchAPI("searchApi", `/categories/searchTopics/${searchInput}`, "GET", '', CommonHeaders(), fetchQueryParams("", "", "", onSearchSuccess, "", callSearchApi));
    let placeholderApi = useFetchAPI("placeholderApi", `/config/getPlaceholders`, "GET", '', CommonHeaders(), fetchQueryParams("", "", "", onPlaceholderSuccess));

    const fetching = detailsApi?.Loading || detailsApi?.Fetching || searchApi?.Loading || searchApi?.Fetching;

    return (
        <>
            {(isFetching || fetching) && <Loader showLoader={fetching} />}
            <div style={{ background: '#f7f9fa' }}>
                <div className={HeaderStyles.container}>
                    <div className={HeaderStyles.topBar}>
                        <div className={HeaderStyles.topBarContainer}>
                            <div className={HeaderStyles.logo}>
                                <img src="logo-path.png" alt="Logo" />
                            </div>
                            <div className={HeaderStyles.searchBar}>
                                <TextField
                                    name='search'
                                    value={searchInput}
                                    onChange={handleChange}
                                    onKeyDown={handleKeyDown}
                                    InputProps={{
                                        type: 'text',
                                        startAdornment: <InputAdornment position="start"><SearchIcon className={searchInput?.length > 0 ? HeaderStyles.searchIcon : HeaderStyles.searchIconDisabled} /></InputAdornment>,
                                        endAdornment: (
                                            <>
                                                <InputAdornment position="end">{searchInput?.length > 0 && <ClearIcon className={HeaderStyles.clearIcon} onClick={handleClear} />}</InputAdornment>
                                                <MicIcon titleAccess='Ask by voice' onClick={handleMicIconClick} sx={{ cursor: 'pointer', color: '#296CE2', marginRight: '20px' }} />
                                            </>
                                        )
                                    }}
                                    sx={{ input: { "&::placeholder": { opacity: 0.7, zIndex: 10000 } }, height: '50px' }}
                                    className={HeaderStyles.textField}
                                    placeholder={'Search ' + placeholder} size="large"
                                />
                            </div>
                            <div className={HeaderStyles.requestSection}>
                                <div className={HeaderStyles.requestSectionContainer}>
                                    <div>
                                        <h5 className={HeaderStyles.requestText}>Request a Topic</h5>
                                    </div>
                                </div>
                            </div>
                            <div className={HeaderStyles.profileSection}>
                                <div className={HeaderStyles.profileSectionContainer}>
                                    { appState?.role === 'superAdmin' && <div className={HeaderStyles.notifyDiv}>
                                        <NotificationsNoneIcon className={HeaderStyles.notifyIcon} />
                                    </div>}
                                    {detailsResponse?.firstName && <div className={HeaderStyles.avatar}>
                                        <h5>{detailsResponse?.firstName?.charAt(0) + detailsResponse?.lastName?.charAt(0)}</h5>
                                    </div>}
                                    <div>
                                        <CommonButton variant="contained" bgColor={'#5b67f1'} color={'white'} padding={'15px'} borderRadius={'5px'} fontWeight={'bold'} width={'100%'} height={'37px'} onClick={handleLogout}>Log Out</CommonButton>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={HeaderStyles.footer}>

                    </div>
                </div>
                <Dialog open={openDetailErrorDialog} TransitionComponent={Transition} keepMounted onClose={handleDetailErrorModalClose} aria-describedby="alert-dialog-slide-description" fullWidth={false} maxWidth="sm" className={HeaderStyles.dialogWrapper}>
                    <div className={HeaderStyles.modalinnerwrapper}>
                        <div><h4 className={HeaderStyles.headerText}>Oops..</h4></div>
                        <IconButton aria-label="close" onClick={handleDetailErrorModalClose} sx={{ position: 'absolute', right: 8, top: 8, color: "#666" }}>
                            <CloseIcon />
                        </IconButton>
                        <DialogContent>
                            <DialogContentText id="alert-dialog-slide-description">

                            </DialogContentText>
                            <div className={HeaderStyles.errorMessage}>{detailErrorMessage}</div>
                        </DialogContent>
                        <div className={HeaderStyles.modalabuttons}>
                            <div className={HeaderStyles.modalactionsection}>
                                <button onClick={handleDetailErrorModalClose} className={HeaderStyles.okButton}>
                                    Ok
                                </button>
                            </div>
                        </div>
                    </div>
                </Dialog>
            </div>
            <div>
                <Outlet />
            </div>
            {/* <Snackbar autoHideDuration={3000} open={snackBarOpen} onClose={handleSnackBarClose} anchorOrigin={{ vertical: "top", horizontal: "center" }} >
                <Alert severity={"error"} onClose={handleSnackBarClose} sx={{ width: '100%' }}>{ searchApiInfo?.errorMsg > 0 && searchApiInfo?.errorMsg }</Alert>
            </Snackbar> */}
            <Dialog open={openMicDialog} TransitionComponent={Transition} keepMounted onClose={handleMicDialogClose} aria-describedby="alert-dialog-slide-description" fullWidth={false} maxWidth="sm" className={HeaderStyles.dialogWrapper}>
                <div className={HeaderStyles.modalinnerwrapper}>
                    <div><h4 className={HeaderStyles.headerTextVoice}>Search Topics</h4></div>
                    <IconButton aria-label="close" onClick={handleMicDialogClose} sx={{ position: 'absolute', right: 8, top: 8, color: "#666" }}>
                        <CloseIcon />
                    </IconButton>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-slide-description">
                            <p>{listening ? <div className={HeaderStyles.speakNow}>{transcript?.length > 0 ? <><h6>Listening<span className={HeaderStyles.listeningLoading}>...</span></h6><div><h6 style={{ textAlign: 'center' }}>Please speak closer to microphone for better results</h6></div></> : <h6>Speak Now</h6>}</div> : <div className={HeaderStyles.speakNowErr}>{transcript?.length > 0 ? <><span>It's not what you spoke? </span><span onClick={handleMicToggle}>Try speaking again </span><span>close to microphone</span></> : <><span>Didn't get that. </span><span onClick={handleMicToggle}>Try speaking again</span></>}</div>}</p>
                            <div className={listening ? HeaderStyles.center : HeaderStyles.centerMicOff} onClick={handleMicToggle}>
                                <div className={listening ? HeaderStyles.microphoneActive : HeaderStyles.microphoneInActive}>
                                    <MicIcon className={listening ? HeaderStyles.micIconActive : HeaderStyles.micIconInactive} />
                                </div>
                            </div>
                        </DialogContentText>
                        <div className={HeaderStyles.transcript}>{transcript}</div>
                    </DialogContent>
                    {transcript?.length > 0 &&
                        <div className={HeaderStyles.modalabuttons}>
                            <div className={HeaderStyles.modalactionsection}>
                                <button onClick={handleReset} className={HeaderStyles.okButton}>
                                    Reset
                                </button>
                            </div>
                            <div className={HeaderStyles.modalactionsection}>
                                <button onClick={handleOk} className={HeaderStyles.okButton}>
                                    Ok
                                </button>
                            </div>
                        </div>
                    }
                </div>
            </Dialog>
            <Snackbar open={openMicSnackbar} autoHideDuration={4000} onClose={() => setOpenMicSnackbar(false)} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
                <Alert
                    onClose={() => setOpenMicSnackbar(false)}
                    anchorOrigin={{ vertical: "top", horizontal: "center" }}
                    severity="error"
                    sx={{ width: '100%' }}
                >
                    {micPermissionError}
                </Alert>
            </Snackbar>
        </>
    )
}

export default Header