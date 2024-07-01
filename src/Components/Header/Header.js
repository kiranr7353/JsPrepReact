import React, { useState } from 'react'
import CommonButton from '../../CommonComponents/CommonButton'
import { InputAdornment, TextField, Dialog, DialogContent, DialogContentText, Slide } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ClearIcon from '@mui/icons-material/Clear';
import HeaderStyles from './HeaderStyles.module.css';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { Outlet, useNavigate } from 'react-router-dom';
import { useFetchAPI } from '../../Hooks/useAPI';
import { useSelector } from 'react-redux';
import { CommonHeaders } from '../../CommonComponents/CommonHeaders';
import { fetchQueryParams } from '../../Hooks/fetchQueryParams';
import Loader from '../../CommonComponents/Loader/Loader';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const Header = () => {

    const appState = useSelector(state => state);
    const navigate = useNavigate();

    const [searchInput, setSearchInput] = useState('');
    const [detailsResponse, setDetailsResponse] = useState({});
    const [isFetching, setIsFetching] = useState(false);
    const [detailErrorMessage, setDetailErrorMessage] = useState('');
    const [openDetailErrorDialog, setOpenDetailErrorDialog] = useState(false);

    const onDetailSuccess = res => {
        if ((res?.status === 200 || res?.status === 201)) {
            setDetailsResponse(res?.data?.userInfo);
        } else {
            setDetailErrorMessage(res?.data?.detail ? res?.data?.detail : 'Something went wrong. Please try again later.');
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
        console.log(auth);
        signOut(auth).then((result) => {
            setIsFetching(false);
            if (result) {
                navigate('/logout', { replace: true })
            }
        }).catch((error) => {
            setIsFetching(false);
        })
    }

    const handleDetailErrorModalClose = () => {
        setOpenDetailErrorDialog(false);
        navigate('/login');
    }

    let detailsApi = useFetchAPI("DetailsApi", `/user/${appState?.userInfo?.localId}`, "GET", '', CommonHeaders(), fetchQueryParams("", "", "", onDetailSuccess));
    const fetching = detailsApi?.Loading || detailsApi?.Fetching;

    return (
        <>
            {(isFetching || fetching) && <Loader showLoader={fetching} />}
            <div>
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
                                    InputProps={{
                                        type: 'text',
                                        startAdornment: <InputAdornment position="start"><SearchIcon className={searchInput?.length > 0 ? HeaderStyles.searchIcon : HeaderStyles.searchIconDisabled} /></InputAdornment>,
                                        endAdornment: <InputAdornment position="end">{searchInput?.length > 0 && <ClearIcon className={HeaderStyles.clearIcon} onClick={handleClear} />}</InputAdornment>
                                    }}
                                    sx={{ input: { "&::placeholder": { opacity: 0.7, zIndex: 10000 } } }}
                                    className={HeaderStyles.textField}
                                    placeholder={"Search for anything"} size="large"
                                />
                            </div>
                            <div className={HeaderStyles.requestSection}>
                                <div className={HeaderStyles.requestSectionContainer}>
                                    <div>
                                        <h5 className={HeaderStyles.requestText}>Request a Category</h5>
                                    </div>
                                    <div>
                                        <h5 className={HeaderStyles.requestText}>Request a Topic</h5>
                                    </div>
                                </div>
                            </div>
                            <div className={HeaderStyles.profileSection}>
                                <div className={HeaderStyles.profileSectionContainer}>
                                    <div className={HeaderStyles.avatar}>
                                        <h5>{detailsResponse?.firstName?.charAt(0) + detailsResponse?.lastName?.charAt(0)}</h5>
                                    </div>
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
        </>
    )
}

export default Header