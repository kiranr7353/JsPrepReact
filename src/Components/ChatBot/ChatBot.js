import React, { useEffect, useMemo, useRef, useState } from 'react'
import ChatBotStylesStyles from './ChatBotStyles.module.css';
import AddIcon from '@mui/icons-material/Add';
import { Alert, Box, Dialog, DialogContent, DialogContentText, Fab, Fade, Slide, Snackbar, styled, TextField, Tooltip, tooltipClasses, Typography } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import MinimizeIcon from '@mui/icons-material/Minimize';
import AIChat from "../../Images/ai1.jpg";
import MicIcon from '@mui/icons-material/Mic';
import SendIcon from '@mui/icons-material/Send';
import moment from 'moment';
import moment_timezone from 'moment-timezone';
import { useSelector } from 'react-redux';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { CommonHeaders } from '../../CommonComponents/CommonHeaders';
import { useFetchAPI } from '../../Hooks/useAPI';
import { fetchQueryParams } from '../../Hooks/fetchQueryParams';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const HtmlTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} TransitionComponent={Fade} disableHoverListener placement="top-start" />
))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: '#296CE2',
        color: 'white',
        fontWeight: 'bold',
        maxWidth: 400,
        fontSize: theme.typography.pxToRem(12),
        border: '1px solid #dadde9'
    },
}));

const ChatBot = ({ firstName, lastName }) => {

    const [chatOpen, setChatOpen] = useState(false);
    const [userInput, setUserInput] = useState('');
    const [lockForInput, setLockForInput] = useState(false);
    const [completeConversation, setCompleteConversation] = useState([]);
    const [newFormedQuestion, setNewFormedQuestion] = useState([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [userInfo, setUserInfo] = useState();
    const [queryApi, setQueryApi] = useState(false);
    const [payload, setPayload] = useState({});
    const allBotResponse = useRef([]);
    const chatBotLastMsgRef = useRef(null);
    const [openMicDialog, setOpenMicDialog] = useState(false);
    const [openMicSnackbar, setOpenMicSnackbar] = useState(false);
    const [micPermissionError, setMicPermissionError] = useState('');
    const [transcribing, setTranscribing] = useState(true);
    const [openTooltip, setOpenTooltip] = useState(true);
    const [showAnimation, setShowAnimation] = useState(true);
    const [clearTranscriptOnListen, setClearTranscriptOnListen] = useState(true);
    const toggleTranscribing = () => setTranscribing(!transcribing)
    const toggleClearTranscriptOnListen = () => setClearTranscriptOnListen(!clearTranscriptOnListen)

    const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition, isMicrophoneAvailable } = useSpeechRecognition({ toggleClearTranscriptOnListen });

    const appState = useSelector(state => state);
    const breadCrumbReducer = appState?.breadCrumbItem1;

    let hide = { display: 'none' };

    let show = { display: 'block' };

    let placeholder = `Ask me anything`;


    const toggleChat = () => {
        setChatOpen(!chatOpen);
        setShowAnimation(false);
        setOpenTooltip(false);
    }

    const aiSmartSearchkeyDownInput = (event) => {
        if (event.key === 'Enter' && userInput?.length > 0) {
            setLockForInput(true);
            handleSendIcon();
        }
    }

    const createBotResponse = (msg) => {
        allBotResponse.current = { msg };
        streamResponseUI();
    }

    const handleSendIcon = (inputValue = '') => {
        const queryPayload = { message: userInput };
        setLockForInput(true)
        let msg = []
        msg.push(userInput)
        setCompleteConversation(prev => [...prev, ...msg]);
        setNewFormedQuestion(prev => [...prev, ...msg]);
        allBotResponse.current = [];
        setIsStreaming(!isStreaming);
        setPayload(queryPayload);
        setQueryApi(true);
    }

    const setLock = () => {
        setLockForInput(false);
        setUserInput('')
    }

    useEffect(() => {
        if (chatBotLastMsgRef.current) {
            chatBotLastMsgRef.current.scrollTop = chatBotLastMsgRef.current.scrollHeight - chatBotLastMsgRef.current.clientHeight;
        }
    }, [completeConversation]);

    const getData = (message) => {
        createBotResponse(message)
    }

    useEffect(() => {
        if (newFormedQuestion?.length > 0) {
            getData();
        }
    }, [newFormedQuestion?.length]);

    const streamResponseUI = () => {
        setCompleteConversation((prev) => {
            const newConversation = [...prev]
            newConversation[newFormedQuestion?.length * 2 - 1] = allBotResponse.current
            return newConversation
        })
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

    const handleOk = () => {
        setUserInput(transcript);
        setLockForInput(true)
        handleMicDialogClose();
        handleSendIcon(transcript)
        setTimeout(() => {
            SpeechRecognition.stopListening();
            SpeechRecognition.abortListening();
        }, 100);
    }

    const handleReset = () => {
        resetTranscript();
    }

    const handleClear = () => {
        setCompleteConversation([]);
        setNewFormedQuestion([]);
    }

    const handleChatClear = () => {
        handleClear();
        setChatOpen(false);
    }

    const handleTooltipOpen = () => {
        setOpenTooltip(true)
    };

    const handleTooltipClose = () => {
        setOpenTooltip(false)
    };

    const handleTooltipIcon = () => {
        handleTooltipClose();
        setShowAnimation(false);
    }

    const onAISuccess = res => {
        setQueryApi(false);
        if ((res?.status === 200 || res?.status === 201)) {
            getData(res.data.response)
        } else {
            let respAnswer = "We are facing some issue please try again later."
            createBotResponse(respAnswer);
            setLock();
        }
    }

    let AIAPI = useFetchAPI("AIAPI", `/user/aiChat`, "POST", payload, CommonHeaders(), fetchQueryParams("", "", "", onAISuccess, "", queryApi));

    return (
        <>
            <div className={ChatBotStylesStyles.chatContainer}>
                <div className={ChatBotStylesStyles.chatBox} style={chatOpen ? show : hide}>
                    <div className={ChatBotStylesStyles.chatContent}>
                        <div className={ChatBotStylesStyles.chatHeader}>
                            <div className={ChatBotStylesStyles.headerFlex}>
                                <img src={AIChat} alt='aiChat' className={ChatBotStylesStyles.aiHeadingChatImage} />
                                <h4 className={ChatBotStylesStyles.chatHeaderText}>AI JsPrep</h4>
                            </div>
                            <div className={ChatBotStylesStyles.iconsContainer}>
                                <RefreshIcon titleAccess='Restart' className={ChatBotStylesStyles.refreshIcon} onClick={handleClear} />
                                <MinimizeIcon titleAccess='Close' className={ChatBotStylesStyles.clearChatIcon} onClick={handleChatClear} />
                            </div>
                        </div>
                        <div className={ChatBotStylesStyles.chatArea} ref={chatBotLastMsgRef}>
                            <Box ref={chatBotLastMsgRef} className={ChatBotStylesStyles.chatparent}>
                                <Box sx={{ display: 'flex', marginBottom: '10px' }}>
                                    <Box sx={{ width: '50px', marginRight: '10px' }}>
                                        <img src={AIChat} alt="image" height={50} width={50} style={{ borderRadius: '50%' }} />
                                    </Box>
                                    <Box sx={{ width: '75% !important' }}>
                                        <Typography sx={{ whiteSpace: 'pre-wrap', backgroundColor: '#f4f1f1', padding: '4px 8px', borderRadius: '10px', fontSize: '0.9rem !important' }} >
                                            Hey {firstName ? firstName : ''}! I am here to guide you through any information that you need
                                        </Typography>
                                    </Box>
                                </Box>
                                {completeConversation?.length > 0 &&
                                    completeConversation.map((msg, idx) => {
                                        if (idx % 2 === 0) {
                                            return (
                                                <Box sx={{ display: 'flex', marginBottom: '10px', alignItems: 'center' }}>
                                                    <Box sx={{ width: '50px', marginRight: '10px' }}>
                                                        <Typography sx={{ height: '25px', width: '25px', backgroundColor: '#1565c0;', borderRadius: '50%', padding: '10px', fontWeight: '600', color: 'white' }}>{firstName ? `${ firstName.split('')[0]}${lastName.split('')[0]}` : `UR`}</Typography>
                                                    </Box>
                                                    <Box>
                                                        <Typography sx={{ backgroundColor: 'rgba(13,169,230,0.24)', padding: '4px 8px', borderRadius: '10px', fontSize: '0.8rem !important' }} >{msg}</Typography>
                                                    </Box>
                                                </Box>
                                            )
                                        }
                                        else {
                                            return (
                                                <Box sx={{ display: 'flex', marginBottom: '10px' }}>
                                                    <Box sx={{ width: '50px', marginRight: '10px' }}>
                                                        <img src={AIChat} alt="image" height={50} width={50} style={{ borderRadius: '50%' }} />
                                                    </Box>
                                                    <Box sx={{ width: '75% !important' }}>
                                                        <Typography sx={{ whiteSpace: 'pre-wrap', backgroundColor: '#f4f1f1', padding: '4px 8px', borderRadius: '10px', fontSize: '0.8rem  !important' }} >{msg?.msg}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            )
                                        }
                                    })
                                }
                                {
                                    completeConversation?.length < newFormedQuestion?.length * 2 ?
                                        <Box sx={{ display: 'flex', marginBottom: '10px', alignItems: 'center' }}>
                                            <Box sx={{ width: '50px', marginRight: '10px' }}>
                                                <img src={AIChat} alt="image" height={50} width={50} style={{ borderRadius: '50%' }} />
                                            </Box>
                                            <Box sx={{ backgroundColor: '#f4f1f1', borderRadius: '10px', minWidth: '60px', height: '40px' }}>
                                                <Box className={ChatBotStylesStyles.loading}> ...</Box>
                                            </Box>
                                        </Box>
                                        :
                                        null
                                }
                            </Box>
                        </div>
                        <div className={ChatBotStylesStyles.footer}>
                            <div className={ChatBotStylesStyles.inputDiv}>
                                <TextField autoComplete='off' placeholder={placeholder} value={userInput} onChange={(e) => { setUserInput(e.target.value) }} onKeyDown={aiSmartSearchkeyDownInput} className={ChatBotStylesStyles.inputtextfield} sx={{ input: { "&::placeholder": { color: 'black', opacity: '0.8' } } }} />
                                <MicIcon titleAccess='Ask by voice' onClick={handleMicIconClick} sx={{ cursor: 'pointer', color: '#296CE2', marginRight: '10px' }} />
                                <SendIcon sx={{ pointerEvents: (userInput?.length > 0) ? '' : 'none', opacity: (userInput?.length > 0) ? '1' : '0.4', cursor: 'pointer', color: '#296CE2' }} disabled={userInput?.length <= 0} onClick={handleSendIcon} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <HtmlTooltip
                 open={openTooltip} onClose={handleTooltipClose} onOpen={handleTooltipOpen} arrow
                title={
                    <div className={ChatBotStylesStyles.tooltipContainer}>
                        <Typography color="inherit">Hi {firstName ? firstName : ''}. How can I help you today?</Typography>
                        <ClearIcon titleAccess='Close' className={ChatBotStylesStyles.tooltipClose} onClick={handleTooltipIcon}  />
                    </div>
                }
            >
                <Fab color="primary" aria-label="add" className={showAnimation ? `${ChatBotStylesStyles.floatingBtnAnimate} ${ChatBotStylesStyles.floatingBtn}` : ChatBotStylesStyles.floatingBtn} onClick={toggleChat}>
                    {chatOpen ? <ClearIcon className={ChatBotStylesStyles.clearIcon} onClick={handleClear} /> : <img src={AIChat} alt='aiChat' className={ChatBotStylesStyles.aiChatImage} />}
                </Fab>
            </HtmlTooltip>
            <Dialog open={openMicDialog} TransitionComponent={Transition} keepMounted onClose={handleMicDialogClose} aria-describedby="alert-dialog-slide-description" fullWidth={false} maxWidth="sm" className={ChatBotStylesStyles.dialogWrapper}>
                <div className={ChatBotStylesStyles.modalinnerwrapper}>
                    <div><h4 className={ChatBotStylesStyles.headerTextVoice}>AI JsPrep</h4></div>
                    <IconButton aria-label="close" onClick={handleMicDialogClose} sx={{ position: 'absolute', right: 8, top: 8, color: "#666" }}>
                        <CloseIcon />
                    </IconButton>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-slide-description">
                            <p>{listening ? <div className={ChatBotStylesStyles.speakNow}>{transcript?.length > 0 ? <><h6>Listening<span className={ChatBotStylesStyles.listeningLoading}>...</span></h6><div><h6 style={{ textAlign: 'center' }}>Please speak closer to microphone for better results</h6></div></> : <h6>Speak Now</h6>}</div> : <div className={ChatBotStylesStyles.speakNowErr}>{transcript?.length > 0 ? <><span>It's not what you spoke? </span><span onClick={handleMicToggle}>Try speaking again </span><span>close to microphone</span></> : <><span>Didn't get that. </span><span onClick={handleMicToggle}>Try speaking again</span></>}</div>}</p>
                            <div className={listening ? ChatBotStylesStyles.center : ChatBotStylesStyles.centerMicOff} onClick={handleMicToggle}>
                                <div className={listening ? ChatBotStylesStyles.microphoneActive : ChatBotStylesStyles.microphoneInActive}>
                                    <MicIcon className={listening ? ChatBotStylesStyles.micIconActive : ChatBotStylesStyles.micIconInactive} />
                                </div>
                            </div>
                        </DialogContentText>
                        <div className={ChatBotStylesStyles.transcript}>{transcript}</div>
                    </DialogContent>
                    {transcript?.length > 0 &&
                        <div className={ChatBotStylesStyles.modalabuttons}>
                            <div className={ChatBotStylesStyles.modalactionsection}>
                                <button onClick={handleReset} className={ChatBotStylesStyles.okButton}>
                                    Reset
                                </button>
                            </div>
                            <div className={ChatBotStylesStyles.modalactionsection}>
                                <button onClick={handleOk} className={ChatBotStylesStyles.okButton}>
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

export default ChatBot