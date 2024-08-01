import React, { useState, useEffect } from 'react'
import LoaderStyles from './Loader.module.css';
import { Backdrop } from '@mui/material';

const Loader = ({ showLoader }) => {

    const [open, setOpen] = useState(false);

    useEffect(() => {
        showLoader && setOpen(true);
    }, [showLoader])
    

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <>
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1, zIndex: 1000 }}
                open={open}
            >
                <div className={LoaderStyles.spinner}></div>
            </Backdrop>
        </>
    )
}

export default Loader