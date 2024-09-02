import React, { useState } from 'react'
import ProgrammingStyles from './ProgrammingStyles.module.css'
import { Accordion, AccordionDetails, AccordionSummary, Pagination, Paper, Skeleton, Table, TableBody, TableHead, TableRow, Typography } from '@mui/material'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import BookmarkRemoveIcon from '@mui/icons-material/BookmarkRemove';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'
import AppNoData from '../AppNoData/AppNoData';
import { useFetchAPI } from '../../Hooks/useAPI';
import { CommonHeaders } from '../CommonHeaders';
import { fetchQueryParams } from '../../Hooks/fetchQueryParams';
import ConfirmationDialog from '../ConfirmationDialog/ConfirmationDialog';
import Loader from '../Loader/Loader';

const BookmarkedProgrammingQA = (props) => {

    const { getBookmarkPQA, setGetBookmarkedPQAPayload, setBookmarkedPageState, bookmarkedPQAData, bookmarkedPageState, setcallBookmarkedPQAApi, getPQA, setValue } = props;

    const [removeBookmarkPayload, setRemoveBookmarkPayload] = useState({});
    const [callRemoveBookmarkApi, setCallRemoveBookmarkApi] = useState(false);
    const [removeBookmarkInfo, setRemoveBookmarkInfo] = useState({ open: false, successMsg: '', errorMsg: '' });

    const handleBookmarkedPageChange = (event, value) => {
        setBookmarkedPageState(value);
        setGetBookmarkedPQAPayload(prev => ({ ...prev, pageNumber: value }));
        setcallBookmarkedPQAApi(true);
    }

    const handleRemoveBookmark = (el) => {
        setRemoveBookmarkPayload({ titleId: el?.titleId });
        setCallRemoveBookmarkApi(true);
    }

    const onRemoveBookmarkSuccess = res => {
        setCallRemoveBookmarkApi(false);
        if ((res?.status === 200 || res?.status === 201)) {
            setRemoveBookmarkInfo({ open: true, successMsg: 'Bookmarked Removed Successfully', errorMsg: '' });
            getPQA?.refetch();
            setValue(1);
        } else {
            setRemoveBookmarkInfo({ open: true, successMsg: '', errorMsg: res?.data?.detail ? res?.data?.detail : 'Something went wrong. Please try again later' });
        }
    }

    const handleRemoveBookmarkClosePopup = () => {
        setRemoveBookmarkInfo({ open: false, successMsg: '', errorMsg: '' });
        setRemoveBookmarkPayload({});
    }

    const removeBookmark = useFetchAPI("removeBookmark", `/programmingQA/removeBookmark`, "POST", removeBookmarkPayload, CommonHeaders(), fetchQueryParams("", "", "", onRemoveBookmarkSuccess, "", callRemoveBookmarkApi));

    return (
        <>
            {(removeBookmark?.Loading || removeBookmark?.Fetching) && <Loader showLoader={removeBookmark?.Loading || removeBookmark?.Fetching} />}
            {(getBookmarkPQA?.Loading || getBookmarkPQA?.Fetching) ? <Skeleton variant="rectangular" width={'100%'} height={120} sx={{ marginBottom: 10 }} /> :
                (bookmarkedPQAData && bookmarkedPQAData?.data?.length > 0) ? bookmarkedPQAData?.data?.map((el, i) => {
                    if (el?.enabled) return (
                        <Accordion key={el?.titleId}
                            slotProps={{ transition: { timeout: 400 } }}>
                            <AccordionSummary
                                expandIcon={<ArrowDownwardIcon sx={{ color: 'white' }} />}
                                aria-controls="panel1-content"
                                id="panel1-header"
                                sx={{ background: 'black', color: 'white', marginBottom: '10px' }}
                            >
                                <div className={ProgrammingStyles.questionFlex}>
                                    <div>
                                        <Typography sx={{ fontWeight: 'bolder' }}>{el?.title}</Typography>
                                    </div>
                                </div>
                            </AccordionSummary>
                            <AccordionDetails sx={{ background: '#fcfcfc', boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px', padding: '8px 16px 30px' }}>
                                {el?.data?.map((pqa, index) => (
                                    <div key={pqa.id + index}>
                                        <div>
                                            <h2><u>Approach {pqa.id}</u></h2>
                                            {pqa?.approachHeader && <h3><u>{pqa?.approachHeader}</u></h3>}
                                            {pqa?.approachExplain && <h3><u>Explanation</u><Typography>{pqa?.approachExplain}</Typography></h3>}
                                            {pqa?.approachCode?.map((appCd, idx) => (
                                                <div key={appCd?.id + idx}>
                                                    <h3><u>Code</u></h3>
                                                    <div className={ProgrammingStyles.codeBlock}>
                                                        {appCd?.fileName && <h4 className={ProgrammingStyles.fileName}>{appCd?.fileName}</h4>}
                                                        <pre>
                                                            <code className={ProgrammingStyles.code}>{appCd?.code}</code>
                                                        </pre>
                                                    </div>
                                                    <h3><u>Code Image</u></h3>
                                                    <div className={ProgrammingStyles.ansImageDiv}>
                                                        {appCd?.snippet?.map(img => (
                                                            <Zoom>
                                                                <img src={img.url} alt={img?.url} />
                                                            </Zoom>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {pqa?.note && <Typography sx={{ paddingTop: 3 }}><b>Note:</b> {pqa?.note}</Typography>}
                                        <hr />
                                    </div>
                                ))}
                                <div className={ProgrammingStyles.iconsDiv}>
                                    <EditIcon titleAccess='Edit' className={ProgrammingStyles.editQAIcon} onClick={() => props.handlePQAEdit(el)} />
                                    <BookmarkRemoveIcon titleAccess='Remove Bookmark' className={ProgrammingStyles.removeBookmarkIcon} onClick={() => handleRemoveBookmark(el)} />
                                    <DeleteIcon titleAccess='Delete' className={ProgrammingStyles.deleteQAIcon} onClick={() => props.handlePQADelete(el)} />
                                </div>
                            </AccordionDetails>
                        </Accordion>
                    )
                }) : <AppNoData />}
            {bookmarkedPQAData?.totalCount > 25 && <div className={ProgrammingStyles.pagination}>
                <Pagination count={bookmarkedPQAData?.totalCount} page={bookmarkedPageState} onChange={handleBookmarkedPageChange} color="primary" />
            </div>}
            <ConfirmationDialog openDialog={removeBookmarkInfo?.open} errorMessage={removeBookmarkInfo?.errorMsg} successMessage={removeBookmarkInfo?.successMsg} handleCloseDialog={handleRemoveBookmarkClosePopup} />
        </>
    )
}

export default BookmarkedProgrammingQA