import React, { useCallback, useRef, useState } from 'react'
import InterviewQAStyles from './InterviewQAStyles.module.css'
import CommonButton from '../CommonButton'
import PropTypes from 'prop-types';
import parse from "html-react-parser";
import AddQA from '../AddQA/AddQA';
import { AntTab, AntTabs } from './TabsStyles';
import { useFetchAPI } from '../../Hooks/useAPI';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { CommonHeaders } from '../CommonHeaders';
import { fetchQueryParams } from '../../Hooks/fetchQueryParams';
import { Accordion, AccordionDetails, AccordionSummary, Dialog, DialogContent, Fade, InputAdornment, Pagination, Paper, Skeleton, Slide, Table, TableBody, TableHead, TableRow, TextField, Typography } from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded';
import Loader from '../Loader/Loader';
import { CustomizedTable, StyledTableCell, StyledTableRow } from '../TableStyles';
import AppNoData from '../AppNoData/AppNoData';
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'
import ConfirmationDialog from '../ConfirmationDialog/ConfirmationDialog';
import { ref as storageRef, deleteObject } from "firebase/storage";
import { storage } from '../../firebaseConfig';
import BookmarkedTab from './BookmarkedTab';
import SearchQA from './SearchQA';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});



const InterviewQA = (props) => {

    const { params, locationDetails } = props;

    const [addQAClicked, setAddQAClicked] = useState(false);
    const [value, setValue] = useState(0);
    const [pageState, setPageState] = useState(1);
    const [hiddenPageState, setHiddenPageState] = useState(1);
    const [bookmarkedPageState, setBookmarkedPageState] = useState(1);
    const [totalDocs, setTotalDocs] = useState();
    const [callBookmarkedQAApi, setcallBookmarkedQAApi] = useState(false);
    const [getInterviewQAPayload, setGetInterviewQAPayload] = useState({ topicId: params?.topicId, categoryId: params?.categoryId, pageSize: 25, pageNumber: pageState })
    const [getBookmarkedQAPayload, setGetBookmarkedQAPayload] = useState({ topicId: params?.topicId, categoryId: params?.categoryId, pageSize: 25, pageNumber: bookmarkedPageState })
    const [allInterviewQAData, setAllInterviewQAData] = useState([]);
    const [bookmarkedInterviewQAData, setBookmarkedInterviewQAData] = useState([]);
    const [editClicked, setEditClicked] = useState(false);
    const [editItem, setEditItem] = useState({});
    const [deletePayload, setDeletePayload] = useState({});
    const [deleteInfo, setDeleteInfo] = useState({});
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [callDeleteApi, setCallDeleteApi] = useState(false);
    const [showHiddenTab, setShowHiddenTab] = useState(false);
    const [deleteConfirmationInfo, setDeleteConfirmationInfo] = useState({ open: false, successMsg: '', errorMsg: '' });
    const [bookmarkQuestionPayload, setBookmarkQuestionPayload] = useState({});
    const [callBookmarkApi, setCallBookmarkApi] = useState(false);
    const [bookmarkApiInfo, setBookmarkApiInfo] = useState({ open: false, successMsg: '', errorMsg: '' });
    const [searchInput, setSearchInput] = useState('')

    const TabPanel = (props) => {
        const { children, value, index, ...other } = props;
        return (
            <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other} style={{ marginTop: 20 }}>
                {value === index && (<>{children}</>)}
            </div>);
    }
    TabPanel.propTypes = { children: PropTypes.node, index: PropTypes.number.isRequired, value: PropTypes.number.isRequired };
    function a11yProps(index) { return { id: `simple-tab-${index}`, 'aria-controls': `simple-tabpanel-${index}`, }; }


    const handleChange = (event, newValue) => {
        setValue(newValue);
        setSearchInput('');
        setGetInterviewQAPayload(prev => ({ ...prev, searchText: undefined, pageNumber: 1 }))
        if (newValue === 1) {
            setGetBookmarkedQAPayload(prev => ({ ...prev, searchText: undefined, pageNumber: 1 }));
            setcallBookmarkedQAApi(true);
        }
    }

    const toggleDrawer = () => {
        setAddQAClicked(true);
    }

    const onGetQASuccess = res => {
        if ((res?.status === 200 || res?.status === 201)) {
            setcallBookmarkedQAApi(true);
            setAllInterviewQAData(res?.data?.data);
            setTotalDocs(res?.data?.totalCount);
            let filterHidden = res?.data?.data?.filter(el => !el?.enabled);
            if (filterHidden && filterHidden?.length > 0) {
                setShowHiddenTab(true);
            } else {
                setShowHiddenTab(false);
                setValue(value === 1 ? value : 0);
            }
        } else {
            setAllInterviewQAData([])
        }
    }

    const handlePageChange = (event, value) => {
        setPageState(value);
        setGetInterviewQAPayload(prev => ({ ...prev, pageNumber: value }))
    }

    const handleHiddenPageChange = (event, value) => {
        setHiddenPageState(value);
        setGetInterviewQAPayload(prev => ({ ...prev, pageNumber: value }))
    }

    const handleQAEdit = el => {
        setEditClicked(true);
        setEditItem(el);
    }

    const handleQADelete = el => {
        setOpenDeleteModal(true);
        setDeleteInfo(el);
    }

    const handleQACloseDialog = () => {
        setOpenDeleteModal(false);
    }

    const genericRemoveUploadedImage = (image) => {
        const imageRef = storageRef(storage, image);
        deleteObject(imageRef).then(() => {
        }).catch((error) => {
        });
    }

    const handleDeleteQAConfirm = () => {
        deleteInfo?.data?.forEach(el => {
            if (el?.snippets?.length > 0) {
                el?.snippets?.forEach(img => {
                    genericRemoveUploadedImage(img?.url)
                })
            }
            if (el?.pointsData?.length > 0) {
                el?.pointsData?.forEach(point => {
                    if (point?.snippets?.length > 0) {
                        point?.snippets?.forEach(image => {
                            genericRemoveUploadedImage(image?.url);
                        })
                    }
                })
            }
        })
        setDeletePayload({ questionId: deleteInfo?.questionId });
        setCallDeleteApi(true);
        handleQACloseDialog(false);
    }

    const onDeleteSuccess = (res) => {
        setCallDeleteApi(false);
        if ((res?.status === 200 || res?.status === 201)) {
            setDeleteConfirmationInfo({ open: true, successMsg: 'Deleted Successfully', errorMsg: '' })
            getQA?.refetch();
        } else {
            setDeleteConfirmationInfo({ open: true, successMsg: '', errorMsg: res?.data?.detail ? res?.data?.detail : 'Something went wrong. Please try again later' })
        }
    }

    const handleDeleteQAClosePopup = () => {
        setDeleteConfirmationInfo({ open: false, successMsg: '', errorMsg: '' });
        setDeleteInfo({});
        setDeletePayload({});
    }

    const handleBookmark = el => {
        setBookmarkQuestionPayload({ questionId: el?.questionId });
        setCallBookmarkApi(true);
    }

    const onBookmarkSuccess = res => {
        setCallBookmarkApi(false);
        if ((res?.status === 200 || res?.status === 201)) {
            setBookmarkApiInfo({ open: true, successMsg: 'Bookmarked Successfully', errorMsg: '' });
            getQA?.refetch()
        } else {
            setBookmarkApiInfo({ open: true, successMsg: '', errorMsg: res?.data?.detail ? res?.data?.detail : 'Something went wrong. Please try again later' });
        }
    }

    const handleBookmarkQAClosePopup = () => {
        setBookmarkApiInfo({ open: false, successMsg: '', errorMsg: '' });
        setBookmarkQuestionPayload({});
    }

    const checkBookmarked = (allQA, bookmarkedQA) => {
        const results = allQA?.filter(({ questionId: id1 }) => bookmarkedQA?.some(({ questionId: id2 }) => id2 === id1));
        if (results?.length > 0) {
            const modified = results?.map(el => ({ ...el, bookmarked: true }));
            if (modified && modified?.length > 0) {
                const res = allInterviewQAData?.map(el => {
                    let item = modified?.find(id => id.questionId === el.questionId)
                    if (item) {
                        return item;
                    }
                    return el;
                })
                setAllInterviewQAData(res);
            }
        }
    }

    const onGetBookmarkSuccess = res => {
        setcallBookmarkedQAApi(false);
        if ((res?.status === 200 || res?.status === 201)) {
            checkBookmarked(allInterviewQAData, res?.data?.data);
            setBookmarkedInterviewQAData(res?.data);
        } else {
            setBookmarkedInterviewQAData([]);
        }
    }

    const handleInputChange = (e) => {
        setSearchInput(e.target.value)
    }

    const handleKeyDown = (e) => {
        if (e.keyCode === 13 || e.key === "Enter") {
            if (searchInput?.length > 0 && value === 0) {
                setGetInterviewQAPayload(prev => ({ ...prev, searchText: searchInput, pageNumber: 1 }))
            } else if (searchInput?.length > 0 && value === 1) {
                setGetBookmarkedQAPayload(prev => ({ ...prev, searchText: searchInput, pageNumber: 1 }))
                setcallBookmarkedQAApi(true);
            }
        }
    }

    const handleClear = (e) => {
        setSearchInput('');
        if (value === 0) {
            setGetInterviewQAPayload(prev => ({ ...prev, searchText: undefined, pageNumber: 1 }))
        } else if (value === 1) {
            setcallBookmarkedQAApi(true);
            setGetBookmarkedQAPayload(prev => ({ ...prev, searchText: undefined, pageNumber: 1 }))
        }
    }


    const getQA = useFetchAPI("getQA", `/categories/getInterviewQA`, "POST", getInterviewQAPayload, CommonHeaders(), fetchQueryParams("", "", "", onGetQASuccess));
    const deleteQA = useFetchAPI("deleteQA", `/categories/deleteInterviewQuestion`, "POST", deletePayload, CommonHeaders(), fetchQueryParams("", "", "", onDeleteSuccess, "", callDeleteApi));
    const bookmarkQA = useFetchAPI("bookmarkQA", `/categories/bookmarkInterviewQuestion`, "POST", bookmarkQuestionPayload, CommonHeaders(), fetchQueryParams("", "", "", onBookmarkSuccess, "", callBookmarkApi));
    const getBookmarkQA = useFetchAPI("getBookmarkQA", `/categories/getBookmarkedQA`, "POST", getBookmarkedQAPayload, CommonHeaders(), fetchQueryParams("", "", "", onGetBookmarkSuccess, "", callBookmarkedQAApi));

    const fetching = getQA?.Loading || getQA?.Fetching || deleteQA?.Loading || deleteQA?.Fetching || bookmarkQA?.Loading || bookmarkQA?.Fetching;

    return (
        <>
            {(fetching) && <Loader showLoader={fetching} />}
            <div className={InterviewQAStyles.mainContentContainer}>
                <div className={InterviewQAStyles.addQuestionBtn}>
                    <CommonButton variant="contained" bgColor={'#5b67f1'} color={'white'} padding={'15px'} borderRadius={'5px'} fontWeight={'bold'} width={'100%'} height={'45px'} margin={'20px 0 0 0'} onClick={toggleDrawer}>Add Question</CommonButton>
                </div>
                <div className={InterviewQAStyles.tabs}>
                    <div className={InterviewQAStyles.searchBar}>
                        <TextField
                            name='search'
                            value={searchInput}
                            onChange={(e) => handleInputChange(e)}
                            onKeyDown={(e) => handleKeyDown(e)}
                            InputProps={{
                                type: 'text',
                                startAdornment: <InputAdornment position="start"><SearchIcon className={searchInput?.length > 0 ? InterviewQAStyles.searchIcon : InterviewQAStyles.searchIconDisabled} /></InputAdornment>,
                                endAdornment: (
                                    <>
                                        <InputAdornment position="end">{searchInput?.length > 0 && <ClearIcon className={InterviewQAStyles.clearIcon} onClick={() => handleClear()} />}</InputAdornment>
                                    </>
                                )
                            }}
                            sx={{ input: { "&::placeholder": { opacity: 0.7, zIndex: 10000 } } }}
                            className={InterviewQAStyles.textField}
                            placeholder={'Search Question'} size="large"
                        />
                    </div>
                    <AntTabs value={value} onChange={handleChange} aria-label="basic tabs example">
                        <AntTab label="All Interview Question and Answers" {...a11yProps(0)} />
                        <AntTab label="Bookmarked Interview Question and Answers" {...a11yProps(1)} />
                        {showHiddenTab && <AntTab label="Hidden Interview Question and Answers" {...a11yProps(2)} />}
                    </AntTabs>
                    <TabPanel value={value} index={0}>
                        {fetching ? <Skeleton variant="rectangular" width={'100%'} height={120} sx={{ marginBottom: 10 }} /> :
                            (allInterviewQAData && allInterviewQAData?.length > 0) ? allInterviewQAData?.map((el, i) => {
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
                                        <AccordionDetails sx={{ background: '#fcfcfc', boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px', padding: '8px 16px 30px' }}>
                                            {el?.data?.map((ans, index) => (
                                                <div key={ans.answer + index} className={InterviewQAStyles.ansBlock}>
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
                                                            <li>{ele.value}</li>
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
                                                <EditIcon titleAccess='Edit' className={InterviewQAStyles.editQAIcon} onClick={() => handleQAEdit(el)} />
                                                {el?.bookmarked ? <BookmarkAddedIcon titleAccess='Bookmarked' className={InterviewQAStyles.bookmarkedIcon} /> : <BookmarkBorderIcon titleAccess='Bookmark' className={InterviewQAStyles.bookmarkQAIcon} onClick={() => handleBookmark(el)} />}
                                                <DeleteIcon titleAccess='Delete' className={InterviewQAStyles.deleteQAIcon} onClick={() => handleQADelete(el)} />
                                            </div>
                                        </AccordionDetails>
                                    </Accordion>
                                )
                            }) : <AppNoData />}
                        {totalDocs > 25 && <div className={InterviewQAStyles.pagination}>
                            <Pagination count={totalDocs} page={pageState} onChange={handlePageChange} color="primary" />
                        </div>}
                    </TabPanel>
                    <TabPanel value={value} index={1}>
                        <BookmarkedTab getBookmarkQA={getBookmarkQA} setGetBookmarkedQAPayload={setGetBookmarkedQAPayload} setBookmarkedPageState={setBookmarkedPageState} bookmarkedInterviewQAData={bookmarkedInterviewQAData} bookmarkedPageState={bookmarkedPageState} handleQAEdit={handleQAEdit} handleQADelete={handleQADelete} setcallBookmarkedQAApi={setcallBookmarkedQAApi} getQA={getQA} setValue={setValue} />
                    </TabPanel>
                    {showHiddenTab && <TabPanel value={value} index={2}>
                        {fetching ? <Skeleton variant="rectangular" width={'100%'} height={120} sx={{ marginBottom: 10 }} /> :
                            (allInterviewQAData && allInterviewQAData?.length > 0) ? allInterviewQAData?.map((el, i) => {
                                if (!el?.enabled) return (
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
                                                <div key={ans.answer + index} className={InterviewQAStyles.ansBlock}>
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
                                                    {ans?.note && <Typography className={InterviewQAStyles.noteDiv}><b>Note:</b> {ans?.note}</Typography>}
                                                </div>
                                            ))}
                                            <div className={InterviewQAStyles.iconsDiv}>
                                                <EditIcon titleAccess='Edit' className={InterviewQAStyles.editQAIcon} onClick={() => handleQAEdit(el)} />
                                                <DeleteIcon titleAccess='Delete' className={InterviewQAStyles.deleteQAIcon} onClick={() => handleQADelete(el)} />
                                            </div>
                                        </AccordionDetails>
                                    </Accordion>
                                )
                            }) : <AppNoData />}
                        {totalDocs > 25 && <div className={InterviewQAStyles.pagination}>
                            <Pagination count={totalDocs} page={hiddenPageState} onChange={handleHiddenPageChange} color="primary" />
                        </div>}
                    </TabPanel>}
                </div>
                {(addQAClicked || editClicked) && <AddQA setAddQAClicked={setAddQAClicked} setEditClicked={setEditClicked} editClicked={editClicked} params={params} locationDetails={locationDetails} getQA={getQA} editItem={editItem} />}
            </div>
            <Dialog open={openDeleteModal} TransitionComponent={Transition} keepMounted onClose={handleQACloseDialog} aria-describedby="alert-dialog-slide-description" fullWidth={false} maxWidth="sm" >
                <div className={InterviewQAStyles.modalinnerwrapper}>
                    <div><h4 className={InterviewQAStyles.headerText}>Delete QA</h4></div>
                    <IconButton aria-label="close" onClick={handleQACloseDialog} sx={{ position: 'absolute', right: 8, top: 8, color: "#666" }}>
                        <CloseIcon />
                    </IconButton>
                    <DialogContent>
                        Are you sure you want to delete this QA?
                    </DialogContent>
                    <div className={InterviewQAStyles.modalactionsection}>
                        <CommonButton variant="contained" bgColor={'#5b67f1'} color={'white'} padding={'0.2rem 2.6rem'} borderRadius={'8px'} fontWeight={'bold'} border={'1px solid #286ce2'} onClick={handleDeleteQAConfirm}>Delete</CommonButton>
                        <CommonButton variant="contained" bgColor={'#f8f8f8'} color={'black'} padding={'0.2rem 2.6rem'} borderRadius={'8px'} fontWeight={'bold'} border={'1px solid #ddd'} onClick={handleQACloseDialog}>Cancel</CommonButton>
                    </div>
                </div>
            </Dialog>
            <ConfirmationDialog openDialog={deleteConfirmationInfo?.open} errorMessage={deleteConfirmationInfo?.errorMsg} successMessage={deleteConfirmationInfo?.successMsg} handleCloseDialog={handleDeleteQAClosePopup} />
            <ConfirmationDialog openDialog={bookmarkApiInfo?.open} errorMessage={bookmarkApiInfo?.errorMsg} successMessage={bookmarkApiInfo?.successMsg} handleCloseDialog={handleBookmarkQAClosePopup} />
        </>
    )
}

export default InterviewQA