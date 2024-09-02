import React, { useEffect, useState } from 'react'
import InterviewQAStyles from './InterviewQAStyles.module.css'
import { Accordion, AccordionDetails, AccordionSummary, Pagination, Paper, Skeleton, Table, TableBody, TableHead, TableRow, Typography } from '@mui/material'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import BookmarkRemoveIcon from '@mui/icons-material/BookmarkRemove';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'
import { CustomizedTable, StyledTableCell, StyledTableRow } from '../TableStyles';
import AppNoData from '../AppNoData/AppNoData';
import { useFetchAPI } from '../../Hooks/useAPI';
import { CommonHeaders } from '../CommonHeaders';
import { fetchQueryParams } from '../../Hooks/fetchQueryParams';
import ConfirmationDialog from '../ConfirmationDialog/ConfirmationDialog';
import Loader from '../Loader/Loader';

const BookmarkedTab = (props) => {

    const { getBookmarkQA, setGetBookmarkedQAPayload, setBookmarkedPageState, bookmarkedInterviewQAData, bookmarkedPageState, setcallBookmarkedQAApi, getQA, setValue } = props;

    const [removeBookmarkPayload, setRemoveBookmarkPayload] = useState({});
    const [callRemoveBookmarkApi, setCallRemoveBookmarkApi] = useState(false);
    const [removeBookmarkInfo, setRemoveBookmarkInfo] = useState({ open: false, successMsg: '', errorMsg: '' });

    const handleBookmarkedPageChange = (event, value) => {
        setBookmarkedPageState(value);
        setGetBookmarkedQAPayload(prev => ({ ...prev, pageNumber: value }));
        setcallBookmarkedQAApi(true);
    }

    const handleRemoveBookmark = (el) => {
        setRemoveBookmarkPayload({ questionId: el?.questionId });
        setCallRemoveBookmarkApi(true);
    }

    const onRemoveBookmarkSuccess = res => {
        setCallRemoveBookmarkApi(false);
        if ((res?.status === 200 || res?.status === 201)) {
            setRemoveBookmarkInfo({ open: true, successMsg: 'Bookmarked Removed Successfully', errorMsg: '' });
            getQA?.refetch();
            setValue(1);
        } else {
            setRemoveBookmarkInfo({ open: true, successMsg: '', errorMsg: res?.data?.detail ? res?.data?.detail : 'Something went wrong. Please try again later' });
        }
    }

    const handleRemoveBookmarkClosePopup = () => {
        setRemoveBookmarkInfo({ open: false, successMsg: '', errorMsg: '' });
        setRemoveBookmarkPayload({});
    }

    const removeBookmark = useFetchAPI("removeBookmark", `/categories/removeBookmark`, "POST", removeBookmarkPayload, CommonHeaders(), fetchQueryParams("", "", "", onRemoveBookmarkSuccess, "", callRemoveBookmarkApi));

    return (
        <>
            {(removeBookmark?.Loading || removeBookmark?.Fetching) && <Loader showLoader={removeBookmark?.Loading || removeBookmark?.Fetching} />}
            {(getBookmarkQA?.Loading || getBookmarkQA?.Fetching) ? <Skeleton variant="rectangular" width={'100%'} height={120} sx={{ marginBottom: 10 }} /> :
                (bookmarkedInterviewQAData && bookmarkedInterviewQAData?.data?.length > 0) ? bookmarkedInterviewQAData?.data?.map((el, i) => {
                    if (el?.enabled) return (
                        <Accordion key={el?.questionId}
                            slotProps={{ transition: { timeout: 400 } }}>
                            <AccordionSummary
                                expandIcon={<ArrowDownwardIcon sx={{ color: 'white' }} />}
                                aria-controls="panel1-content"
                                id="panel1-header"
                                sx={{ background: 'black', color: 'white', marginBottom: '10px' }}
                            >
                                <div className={InterviewQAStyles.questionFlex}>
                                    <div>
                                        <Typography sx={{ fontWeight: 'bolder' }}>{el?.question}</Typography>
                                    </div>

                                </div>
                            </AccordionSummary>
                            <AccordionDetails sx={{ background: '#fcfcfc' }}>
                                {el?.data?.map((ans, index) => (
                                    <div key={ans.answer + index}>
                                        <Typography>{ans.answer}</Typography>
                                        {ans?.code && <div>
                                            <h3><u>Code</u></h3>
                                            <div className={InterviewQAStyles.codeBlock}>
                                                <pre>
                                                    <code className={InterviewQAStyles.code}>{ans?.code}</code>
                                                </pre>
                                            </div>
                                        </div>}
                                        <div className={InterviewQAStyles.ansImageDiv}>
                                            {ans.snippets.map(img => (
                                                <Zoom>
                                                    <img src={img.url} alt={img?.url} />
                                                </Zoom>
                                            ))}
                                        </div>
                                        {ans?.hasPoints && ans?.pointsData?.map((ele, i) => (
                                            <>

                                                {ans?.showPointsStyles ? <ul style={{ listStyle: ans?.pointsStyles }}><li>{ele.pointHeader}</li></ul> : <h4>{ele.pointHeader}</h4>}
                                                <Typography>{ele.value}</Typography>
                                                {ele?.code && <div>
                                                    <h3><u>Code</u></h3>
                                                    <div className={InterviewQAStyles.codeBlock}>
                                                        <pre>
                                                            <code className={InterviewQAStyles.code}>{ele?.code}</code>
                                                        </pre>
                                                    </div>
                                                </div>}
                                                <div className={InterviewQAStyles.ansImageDiv}>
                                                    {ele?.snippets?.map(imge => (
                                                        <Zoom>
                                                            <img src={imge?.url} alt={imge?.url} />
                                                        </Zoom>
                                                    ))}
                                                </div>
                                            </>
                                        ))}
                                        {ans?.hasTable && (
                                            <div className={InterviewQAStyles.tableDiv}>
                                                <CustomizedTable component={Paper} elevation={6}>
                                                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                                        <TableHead>
                                                            <TableRow>
                                                                {ans?.tableColumns?.map((column, i) => (
                                                                    <StyledTableCell align="center" key={i}>{column?.value}</StyledTableCell>
                                                                ))}
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {ans?.tableData?.map((res, tableIndex) => (
                                                                <StyledTableRow key={tableIndex} sx={{ '&:first-of-type td, &:first-of-type th': { border: 0 } }}>
                                                                    <StyledTableCell align="center">{res.value1}</StyledTableCell>
                                                                    <StyledTableCell align="center">{res?.value2}</StyledTableCell>
                                                                </StyledTableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </CustomizedTable>
                                            </div>
                                        )}
                                        {ans?.note && <Typography><b>Note:</b> {ans?.note}</Typography>}
                                    </div>
                                ))}
                                <div className={InterviewQAStyles.iconsDiv}>
                                    <EditIcon titleAccess='Edit' className={InterviewQAStyles.editQAIcon} onClick={() => props.handleQAEdit(el)} />
                                    <BookmarkRemoveIcon titleAccess='Remove Bookmark' className={InterviewQAStyles.removeBookmarkIcon} onClick={() => handleRemoveBookmark(el)} />
                                    <DeleteIcon titleAccess='Delete' className={InterviewQAStyles.deleteQAIcon} onClick={() => props.handleQADelete(el)} />
                                </div>
                            </AccordionDetails>
                        </Accordion>
                    )
                }) : <AppNoData />}
            {bookmarkedInterviewQAData?.totalCount > 25 && <div className={InterviewQAStyles.pagination}>
                <Pagination count={bookmarkedInterviewQAData?.totalCount} page={bookmarkedPageState} onChange={handleBookmarkedPageChange} color="primary" />
            </div>}
            <ConfirmationDialog openDialog={removeBookmarkInfo?.open} errorMessage={removeBookmarkInfo?.errorMsg} successMessage={removeBookmarkInfo?.successMsg} handleCloseDialog={handleRemoveBookmarkClosePopup} />
        </>
    )
}

export default BookmarkedTab