import React from 'react'
import CommonButton from '../CommonButton'
import { Alert, Dialog, DialogContent, Slide } from '@mui/material'
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import DialogStyles from './DialogStyles.module.css';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const ConfirmationDialog = (props) => {

    const { openDialog, handleCloseDialog, errorMessage, successMessage } = props

    return (
        <Dialog open={openDialog} TransitionComponent={Transition} keepMounted onClose={handleCloseDialog} aria-describedby="alert-dialog-slide-description" fullWidth={false} maxWidth="sm" >
            <div className={DialogStyles.modalinnerwrapper}>
                <div><h4 className={DialogStyles.headerText}>{errorMessage?.length > 0 ? 'Failed' : 'Success'}</h4></div>
                <IconButton aria-label="close" onClick={handleCloseDialog} sx={{ position: 'absolute', right: 8, top: 8, color: "#666" }}>
                    <CloseIcon />
                </IconButton>
                <DialogContent>
                    <Alert
                        anchorOrigin={{ vertical: "top", horizontal: "center" }}
                        severity={errorMessage?.length > 0 ? "error" : "success"}
                    >
                        {errorMessage?.length > 0 ? errorMessage : successMessage}
                    </Alert>
                </DialogContent>
                <div className={DialogStyles.modalactionsection}>
                    <CommonButton variant="contained" bgColor={'white'} color={'#286ce2'} padding={'0.2rem 2.6rem'} borderRadius={'8px'} fontWeight={'bold'} border={'1px solid #286ce2'} onClick={handleCloseDialog}>Ok</CommonButton>
                </div>
            </div>
        </Dialog>
    )
}

export default ConfirmationDialog