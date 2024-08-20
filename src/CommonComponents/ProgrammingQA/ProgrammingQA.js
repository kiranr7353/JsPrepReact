import React, { useState } from 'react'
import ProgrammingStyles from './ProgrammingStyles.module.css'
import CommonButton from '../CommonButton'
import AddProgrammingQA from '../AddProgrammingQA/AddProgrammingQA';
import { AntTab, AntTabs } from '../InterviewQA/TabsStyles';
import PropTypes from 'prop-types';
import { Accordion, AccordionDetails, AccordionSummary, Dialog, DialogContent, Pagination, Skeleton, Slide, Typography } from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'
import AppNoData from '../AppNoData/AppNoData';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded';
import { ref as storageRef, deleteObject } from "firebase/storage";
import { storage } from '../../firebaseConfig';
import { useFetchAPI } from '../../Hooks/useAPI';
import { CommonHeaders } from '../CommonHeaders';
import { fetchQueryParams } from '../../Hooks/fetchQueryParams';
import ConfirmationDialog from '../ConfirmationDialog/ConfirmationDialog';
import BookmarkedProgrammingQA from './BookmarkedProgrammingQA';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const ProgrammingQA = (props) => {

    const { params, locationDetails } = props;

    const [addPQAClicked, setAddPQAClicked] = useState(false);
    const [editClicked, setEditClicked] = useState(false);
    const [editItem, setEditItem] = useState({});
    const [value, setValue] = useState(0);
    const [pageState, setPageState] = useState(1);
    const [hiddenPageState, setHiddenPageState] = useState(1);
    const [bookmarkedPageState, setBookmarkedPageState] = useState(1);
    const [totalDocs, setTotalDocs] = useState();
    const [callBookmarkedPQAApi, setcallBookmarkedPQAApi] = useState(false);
    const [getPQAPayload, setGetPQAPayload] = useState({ topicId: params?.topicId, categoryId: params?.categoryId, pageSize: 10, pageNumber: pageState })
    const [getBookmarkedPQAPayload, setGetBookmarkedPQAPayload] = useState({ topicId: params?.topicId, categoryId: params?.categoryId, pageSize: 10, pageNumber: bookmarkedPageState })
    const [allPQAData, setAllInterviewPQAData] = useState([]);
    const [bookmarkedPQAData, setBookmarkedPQAData] = useState([]);
    const [deletePayload, setDeletePayload] = useState({});
    const [deleteInfo, setDeleteInfo] = useState({});
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [callDeleteApi, setCallDeleteApi] = useState(false);
    const [showHiddenTab, setShowHiddenTab] = useState(false);
    const [deleteConfirmationInfo, setDeleteConfirmationInfo] = useState({ open: false, successMsg: '', errorMsg: '' });
    const [bookmarkPQAPayload, setBookmarkPQAPayload] = useState({});
    const [callBookmarkApi, setCallBookmarkApi] = useState(false);
    const [bookmarkApiInfo, setBookmarkApiInfo] = useState({ open: false, successMsg: '', errorMsg: '' })

    const toggleDrawer = () => {
        setAddPQAClicked(true);
    }

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
    }

    const onGetPQASuccess = res => {
        if ((res?.status === 200 || res?.status === 201)) {
            setcallBookmarkedPQAApi(true);
            setAllInterviewPQAData(res?.data?.data);
            setTotalDocs(res?.data?.totalCount);
            let filterHidden = res?.data?.data?.filter(el => !el?.enabled);
            if (filterHidden && filterHidden?.length > 0) {
                setShowHiddenTab(true);
            } else {
                setShowHiddenTab(false);
                setValue(value === 1 ? value : 0);
            }
        } else {
            setAllInterviewPQAData([])
        }
    }

    const handlePageChange = (event, value) => {
        setPageState(value);
        setGetPQAPayload(prev => ({ ...prev, pageNumber: value }))
    }

    const handleHiddenPageChange = (event, value) => {
        setHiddenPageState(value);
        setGetPQAPayload(prev => ({ ...prev, pageNumber: value }))
    }

    const handlePQAEdit = el => {
        setEditClicked(true);
        setEditItem(el);
    }

    const handlePQADelete = el => {
        setOpenDeleteModal(true);
        setDeleteInfo(el);
    }

    const handlePQACloseDialog = () => {
        setOpenDeleteModal(false);
    }

    const genericRemoveUploadedImage = (image) => {
        const imageRef = storageRef(storage, image);
        deleteObject(imageRef).then(() => {
        }).catch((error) => {
        });
    }

    const handleDeletePQAConfirm = () => {
        deleteInfo?.data?.forEach(el => {
            if (el?.approachCode?.length > 0) {
                el?.approachCode?.forEach(appCd => {
                    if (appCd?.snippet?.length > 0) {
                        appCd?.snippet?.forEach(image => {
                            genericRemoveUploadedImage(image?.url);
                        })
                    }
                })
            }
        })
        setDeletePayload({ titleId: deleteInfo?.titleId });
        setCallDeleteApi(true);
        handlePQACloseDialog(false);
    }

    const onDeleteSuccess = (res) => {
        setCallDeleteApi(false);
        if ((res?.status === 200 || res?.status === 201)) {
            setDeleteConfirmationInfo({ open: true, successMsg: 'Deleted Successfully', errorMsg: '' })
            getPQA?.refetch();
        } else {
            setDeleteConfirmationInfo({ open: true, successMsg: '', errorMsg: res?.data?.detail ? res?.data?.detail : 'Something went wrong. Please try again later' })
        }
    }

    const handleDeletePQAClosePopup = () => {
        setDeleteConfirmationInfo({ open: false, successMsg: '', errorMsg: '' });
        setDeleteInfo({});
        setDeletePayload({});
    }

    const handleBookmark = el => {
        setBookmarkPQAPayload({ titleId: el?.titleId });
        setCallBookmarkApi(true);
    }

    const onBookmarkSuccess = res => {
        setCallBookmarkApi(false);
        if ((res?.status === 200 || res?.status === 201)) {
            setBookmarkApiInfo({ open: true, successMsg: 'Bookmarked Successfully', errorMsg: '' });
            getPQA?.refetch()
        } else {
            setBookmarkApiInfo({ open: true, successMsg: '', errorMsg: res?.data?.detail ? res?.data?.detail : 'Something went wrong. Please try again later' });
        }
    }

    const handleBookmarkPQAClosePopup = () => {
        setBookmarkApiInfo({ open: false, successMsg: '', errorMsg: '' });
        setBookmarkPQAPayload({});
    }

    const checkBookmarked = (allPQA, bookmarkedPQA) => {
        const results = allPQA?.filter(({ titleId: id1 }) => bookmarkedPQA?.some(({ titleId: id2 }) => id2 === id1));
        if (results?.length > 0) {
            const modified = results?.map(el => ({ ...el, bookmarked: true }));
            if (modified && modified?.length > 0) {
                const res = allPQAData?.map(el => {
                    let item = modified?.find(id => id.titleId === el.titleId)
                    if (item) {
                        return item;
                    }
                    return el;
                })
                setAllInterviewPQAData(res);
            }
        }
    }

    const onGetBookmarkSuccess = res => {
        setcallBookmarkedPQAApi(false);
        if ((res?.status === 200 || res?.status === 201)) {
            checkBookmarked(allPQAData, res?.data?.data);
            setBookmarkedPQAData(res?.data);
        } else {
            setBookmarkedPQAData([]);
        }
    }


    const getPQA = useFetchAPI("getPQA", `/programmingQA/getProgrammingQA`, "POST", getPQAPayload, CommonHeaders(), fetchQueryParams("", "", "", onGetPQASuccess));
    const deletePQA = useFetchAPI("deletePQA", `/programmingQA/deleteProgrammingQA`, "POST", deletePayload, CommonHeaders(), fetchQueryParams("", "", "", onDeleteSuccess, "", callDeleteApi));
    const bookmarkPQA = useFetchAPI("bookmarkPQA", `/programmingQA/bookmarkProgrammingQA`, "POST", bookmarkPQAPayload, CommonHeaders(), fetchQueryParams("", "", "", onBookmarkSuccess, "", callBookmarkApi));
    const getBookmarkPQA = useFetchAPI("getBookmarkPQA", `/programmingQA/getBookmarkedPQA`, "POST", getBookmarkedPQAPayload, CommonHeaders(), fetchQueryParams("", "", "", onGetBookmarkSuccess, "", callBookmarkedPQAApi));

    const fetching = getPQA?.Loading || getPQA?.Fetching || deletePQA?.Loading || deletePQA?.Fetching || bookmarkPQA?.Loading || bookmarkPQA?.Fetching;

    return (
        <>
            <div className={ProgrammingStyles.mainContentContainer}>
                <div className={ProgrammingStyles.addQuestionBtn}>
                    <CommonButton variant="contained" bgColor={'#5b67f1'} color={'white'} padding={'15px'} borderRadius={'5px'} fontWeight={'bold'} width={'100%'} height={'45px'} margin={'20px 0 0 0'} onClick={toggleDrawer}>Add ProgrammingQA</CommonButton>
                </div>
                <div className={ProgrammingStyles.tabs}>
                    <AntTabs value={value} onChange={handleChange} aria-label="basic tabs example">
                        <AntTab label="All Programming Question & Answers" {...a11yProps(0)} />
                        <AntTab label="Bookmarked Programming Question & Answers" {...a11yProps(1)} />
                        {showHiddenTab && <AntTab label="Hidden Programming Question & Answers" {...a11yProps(2)} />}
                    </AntTabs>
                    <TabPanel value={value} index={0}>
                        {fetching ? <Skeleton variant="rectangular" width={'100%'} height={120} sx={{ marginBottom: 10 }} /> :
                            (allPQAData && allPQAData?.length > 0) ? allPQAData?.map((el, i) => {
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
                                                <EditIcon titleAccess='Edit' className={ProgrammingStyles.editQAIcon} onClick={() => handlePQAEdit(el)} />
                                                {el?.bookmarked ? <BookmarkAddedIcon titleAccess='Bookmarked' className={ProgrammingStyles.bookmarkedIcon} /> : <BookmarkBorderIcon titleAccess='Bookmark' className={ProgrammingStyles.bookmarkQAIcon} onClick={() => handleBookmark(el)} />}
                                                <DeleteIcon titleAccess='Delete' className={ProgrammingStyles.deleteQAIcon} onClick={() => handlePQADelete(el)} />
                                            </div>
                                        </AccordionDetails>
                                    </Accordion>
                                )
                            }) : <AppNoData />}
                        {totalDocs > 10 && <div className={ProgrammingStyles.pagination}>
                            <Pagination count={totalDocs} page={pageState} onChange={handlePageChange} color="primary" />
                        </div>}
                    </TabPanel>
                    <TabPanel value={value} index={1}>
                        <BookmarkedProgrammingQA getBookmarkPQA={getBookmarkPQA} setGetBookmarkedPQAPayload={setGetBookmarkedPQAPayload} setBookmarkedPageState={setBookmarkedPageState} bookmarkedPQAData={bookmarkedPQAData} bookmarkedPageState={bookmarkedPageState} handlePQAEdit={handlePQAEdit} handlePQADelete={handlePQADelete} setcallBookmarkedPQAApi={setcallBookmarkedPQAApi} getPQA={getPQA} setValue={setValue} />
                    </TabPanel>
                    {showHiddenTab && <TabPanel value={value} index={2}>
                        {fetching ? <Skeleton variant="rectangular" width={'100%'} height={120} sx={{ marginBottom: 10 }} /> :
                            (allPQAData && allPQAData?.length > 0) ? allPQAData?.map((el, i) => {
                                if (!el?.enabled) return (
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
                                        <AccordionDetails sx={{ background: '#fcfcfc' }}>
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
                                                <EditIcon titleAccess='Edit' className={ProgrammingStyles.editQAIcon} onClick={() => handlePQAEdit(el)} />
                                                <DeleteIcon titleAccess='Delete' className={ProgrammingStyles.deleteQAIcon} onClick={() => handlePQADelete(el)} />
                                            </div>
                                        </AccordionDetails>
                                    </Accordion>
                                )
                            }) : <AppNoData />}
                        {totalDocs > 10 && <div className={ProgrammingStyles.pagination}>
                            <Pagination count={totalDocs} page={hiddenPageState} onChange={handleHiddenPageChange} color="primary" />
                        </div>}
                    </TabPanel>}
                </div>
                {(addPQAClicked || editClicked) && <AddProgrammingQA setAddPQAClicked={setAddPQAClicked} setEditClicked={setEditClicked} editClicked={editClicked} params={params} locationDetails={locationDetails} editItem={editItem} getPQA={getPQA} />}
            </div>
            <Dialog open={openDeleteModal} TransitionComponent={Transition} keepMounted onClose={handlePQACloseDialog} aria-describedby="alert-dialog-slide-description" fullWidth={false} maxWidth="sm" >
                <div className={ProgrammingStyles.modalinnerwrapper}>
                    <div><h4 className={ProgrammingStyles.headerText}>Delete Programming Question & Answer</h4></div>
                    <IconButton aria-label="close" onClick={handlePQACloseDialog} sx={{ position: 'absolute', right: 8, top: 8, color: "#666" }}>
                        <CloseIcon />
                    </IconButton>
                    <DialogContent>
                        Are you sure you want to delete this Programming Question & Answer?
                    </DialogContent>
                    <div className={ProgrammingStyles.modalactionsection}>
                        <CommonButton variant="contained" bgColor={'#5b67f1'} color={'white'} padding={'0.2rem 2.6rem'} borderRadius={'8px'} fontWeight={'bold'} border={'1px solid #286ce2'} onClick={handleDeletePQAConfirm}>Delete</CommonButton>
                        <CommonButton variant="contained" bgColor={'#f8f8f8'} color={'black'} padding={'0.2rem 2.6rem'} borderRadius={'8px'} fontWeight={'bold'} border={'1px solid #ddd'} onClick={handlePQACloseDialog}>Cancel</CommonButton>
                    </div>
                </div>
            </Dialog>
            <ConfirmationDialog openDialog={deleteConfirmationInfo?.open} errorMessage={deleteConfirmationInfo?.errorMsg} successMessage={deleteConfirmationInfo?.successMsg} handleCloseDialog={handleDeletePQAClosePopup} />
            <ConfirmationDialog openDialog={bookmarkApiInfo?.open} errorMessage={bookmarkApiInfo?.errorMsg} successMessage={bookmarkApiInfo?.successMsg} handleCloseDialog={handleBookmarkPQAClosePopup} />
        </>
    )
}

export default ProgrammingQA