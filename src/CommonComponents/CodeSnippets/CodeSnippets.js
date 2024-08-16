import React, { useEffect, useState } from 'react';
import CodeSnippetsStyles from './CodeSnippetsStyles.module.css';
import CommonButton from '../CommonButton';
import { AntTab, AntTabs } from '../InterviewQA/TabsStyles';
import PropTypes from 'prop-types';
import { Accordion, AccordionDetails, AccordionSummary, Pagination, Skeleton, Slide, Typography } from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'
import AppNoData from '../AppNoData/AppNoData';
import AddSnippet from '../AddSnippet/AddSnippet';
import BookmarkedSnippet from './BookmarkedSnippet';
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

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const CodeSnippets = (props) => {

    const { params, locationDetails } = props;

    const [value, setValue] = useState(0);
    const [addSnippetClicked, setAddSnippetClicked] = useState(false);
    const [editClicked, setEditClicked] = useState(false);
    const [pageState, setPageState] = useState(1);
    const [hiddenPageState, setHiddenPageState] = useState(1);
    const [bookmarkedPageState, setBookmarkedPageState] = useState(1);
    const [totalDocs, setTotalDocs] = useState();
    const [callBookmarkedSnippetApi, setcallBookmarkedSnippetApi] = useState(false);
    const [getSnippetPayload, setGetSnippetPayload] = useState({ topicId: params?.topicId, categoryId: params?.categoryId, pageSize: 10, pageNumber: pageState })
    const [getBookmarkedSnippetPayload, setGetBookmarkedSnippetPayload] = useState({ topicId: params?.topicId, categoryId: params?.categoryId, pageSize: 10, pageNumber: bookmarkedPageState })
    const [allSnippetData, setAllInterviewSnippetData] = useState([]);
    const [bookmarkedSnippetData, setBookmarkedSnippetData] = useState([]);
    const [editItem, setEditItem] = useState({});
    const [deletePayload, setDeletePayload] = useState({});
    const [deleteInfo, setDeleteInfo] = useState({});
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [callDeleteApi, setCallDeleteApi] = useState(false);
    const [showHiddenTab, setShowHiddenTab] = useState(false);
    const [deleteConfirmationInfo, setDeleteConfirmationInfo] = useState({ open: false, successMsg: '', errorMsg: '' });
    const [bookmarkSnippetPayload, setBookmarkSnippetPayload] = useState({});
    const [callBookmarkApi, setCallBookmarkApi] = useState(false);
    const [bookmarkApiInfo, setBookmarkApiInfo] = useState({ open: false, successMsg: '', errorMsg: '' })



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

    const toggleDrawer = () => {
        setAddSnippetClicked(true);
    }

    const onGetSnippetSuccess = res => {
        if ((res?.status === 200 || res?.status === 201)) {
            setcallBookmarkedSnippetApi(true);
            setAllInterviewSnippetData(res?.data?.data);
            setTotalDocs(res?.data?.totalCount);
            let filterHidden = res?.data?.data?.filter(el => !el?.enabled);
            if (filterHidden && filterHidden?.length > 0) {
                setShowHiddenTab(true);
            } else {
                setShowHiddenTab(false);
                setValue(value === 1 ? value : 0);
            }
        } else {
            setAllInterviewSnippetData([])
        }
    }

    const handlePageChange = (event, value) => {
        setPageState(value);
        setGetSnippetPayload(prev => ({ ...prev, pageNumber: value }))
    }

    const handleHiddenPageChange = (event, value) => {
        setHiddenPageState(value);
        setGetSnippetPayload(prev => ({ ...prev, pageNumber: value }))
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
            getSnippet?.refetch();
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
        setBookmarkSnippetPayload({ questionId: el?.questionId });
        setCallBookmarkApi(true);
    }

    const onBookmarkSuccess = res => {
        setCallBookmarkApi(false);
        if ((res?.status === 200 || res?.status === 201)) {
            setBookmarkApiInfo({ open: true, successMsg: 'Bookmarked Successfully', errorMsg: '' });
            getSnippet?.refetch()
        } else {
            setBookmarkApiInfo({ open: true, successMsg: '', errorMsg: res?.data?.detail ? res?.data?.detail : 'Something went wrong. Please try again later' });
        }
    }

    const handleBookmarkQAClosePopup = () => {
        setBookmarkApiInfo({ open: false, successMsg: '', errorMsg: '' });
        setBookmarkSnippetPayload({});
    }

    const checkBookmarked = (allQA, bookmarkedQA) => {
        const results = allQA?.filter(({ questionId: id1 }) => bookmarkedQA?.some(({ questionId: id2 }) => id2 === id1));
        if(results?.length > 0) {
            const modified = results?.map(el => ({ ...el, bookmarked: true }));
            if(modified && modified?.length > 0) {
                const res = allSnippetData?.map(el => {
                    let item = modified?.find(id => id.questionId === el.questionId)
                    if(item) {
                        return item;
                    }
                    return el; 
                })
                setAllInterviewSnippetData(res);
            }
        }
    }

    const onGetBookmarkSuccess = res => {
        setcallBookmarkedSnippetApi(false);
        if ((res?.status === 200 || res?.status === 201)) {
            checkBookmarked(allSnippetData, res?.data?.data);
            setBookmarkedSnippetData(res?.data);
        } else {
            setBookmarkedSnippetData([]);
        }
    }    
    
    const getSnippet = useFetchAPI("getSnippet", `/snippets/getSnippets`, "POST", getSnippetPayload, CommonHeaders(), fetchQueryParams("", "", "", onGetSnippetSuccess));
    const deleteSnippet = useFetchAPI("deleteSnippet", `/snippets/deleteSnippet`, "POST", deletePayload, CommonHeaders(), fetchQueryParams("", "", "", onDeleteSuccess, "", callDeleteApi));
    const bookmarkSnippet = useFetchAPI("bookmarkSnippet", `/snippets/bookmarkSnippet`, "POST", bookmarkSnippetPayload, CommonHeaders(), fetchQueryParams("", "", "", onBookmarkSuccess, "", callBookmarkApi));
    const getBookmarkSnippet = useFetchAPI("getBookmarkSnippet", `/snippets/getBookmarkedSnippet`, "POST", getBookmarkedSnippetPayload, CommonHeaders(), fetchQueryParams("", "", "", onGetBookmarkSuccess, "", callBookmarkedSnippetApi));

    const fetching = getSnippet?.Loading || getSnippet?.Fetching || deleteSnippet?.Loading || deleteSnippet?.Fetching || bookmarkSnippet?.Loading || bookmarkSnippet?.Fetching;

    return (
        <>
            <div className={CodeSnippetsStyles.mainContentContainer}>
                <div className={CodeSnippetsStyles.addQuestionBtn}>
                    <CommonButton variant="contained" bgColor={'#5b67f1'} color={'white'} padding={'15px'} borderRadius={'5px'} fontWeight={'bold'} width={'100%'} height={'45px'} margin={'20px 0 0 0'} onClick={toggleDrawer}>Add Snippet</CommonButton>
                </div>
                <div className={CodeSnippetsStyles.tabs}>
                    <AntTabs value={value} onChange={handleChange} aria-label="basic tabs example">
                        <AntTab label="All Snippets" {...a11yProps(0)} />
                        <AntTab label="Bookmarked Snippets" {...a11yProps(1)} />
                        {showHiddenTab && <AntTab label="Hidden Snippets" {...a11yProps(2)} />}
                    </AntTabs>
                    <TabPanel value={value} index={0}>
                        {fetching ? <Skeleton variant="rectangular" width={'100%'} height={120} sx={{ marginBottom: 10 }} /> :
                            (allSnippetData && allSnippetData?.length > 0) ? allSnippetData?.map((el, i) => {
                                if (el?.enabled) return (
                                    <Accordion key={el?.titleId}
                                        slotProps={{ transition: { timeout: 400 } }}>
                                        <AccordionSummary
                                            expandIcon={<ArrowDownwardIcon sx={{ color: 'white' }} />}
                                            aria-controls="panel1-content"
                                            id="panel1-header"
                                            sx={{ background: 'black', color: 'white', marginBottom: '10px' }}
                                        >
                                            <div className={CodeSnippetsStyles.questionFlex}>
                                                <div>
                                                    <Typography sx={{ fontWeight: 'bolder' }}>{el?.title}</Typography>
                                                </div>
                                            </div>
                                        </AccordionSummary>
                                        <AccordionDetails sx={{ background: '#fcfcfc', boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px', padding: '8px 16px 30px' }}>
                                            {el?.data?.map((snippet, index) => (
                                                <div key={snippet.code + index}>
                                                    <h3><u>Code</u></h3>
                                                    <div className={CodeSnippetsStyles.codeBlock}>
                                                        <pre>
                                                            <code className={CodeSnippetsStyles.code}>{snippet?.code}</code>
                                                        </pre>
                                                    </div>
                                                    <h3><u>Code Image</u></h3>
                                                    <div className={CodeSnippetsStyles.ansImageDiv}>
                                                        {snippet.snippet.map(img => (
                                                            <Zoom>
                                                                <img src={img.url} alt={img?.url} />
                                                            </Zoom>
                                                        ))}
                                                    </div>
                                                    { snippet?.explanation?.map(( explain, idx ) => (
                                                        <div key={ explain?.value + idx }> 
                                                            <h3><u>Explanation {explain.id}</u></h3>
                                                            <Typography>{explain.value}</Typography>
                                                        </div>
                                                    )) }
                                                    {snippet?.note && <Typography sx={{ paddingTop: 3 }}><b>Note:</b> {snippet?.note}</Typography>}
                                                </div>
                                            ))}
                                            <div className={CodeSnippetsStyles.iconsDiv}>
                                                <EditIcon titleAccess='Edit' className={CodeSnippetsStyles.editQAIcon} onClick={() => handleQAEdit(el)} />
                                                {el?.bookmarked ? <BookmarkAddedIcon titleAccess='Bookmarked' className={CodeSnippetsStyles.bookmarkedIcon} /> : <BookmarkBorderIcon titleAccess='Bookmark' className={CodeSnippetsStyles.bookmarkQAIcon} onClick={() => handleBookmark(el)} />}
                                                <DeleteIcon titleAccess='Delete' className={CodeSnippetsStyles.deleteQAIcon} onClick={() => handleQADelete(el)} />
                                            </div>
                                        </AccordionDetails>
                                    </Accordion>
                                )
                            }) : <AppNoData />}
                        {totalDocs > 10 && <div className={CodeSnippetsStyles.pagination}>
                            <Pagination count={totalDocs} page={pageState} onChange={handlePageChange} color="primary" />
                        </div>}
                    </TabPanel>
                    <TabPanel value={value} index={1}>
                        <BookmarkedSnippet getBookmarkSnippet={getBookmarkSnippet} setGetBookmarkedSnippetPayload={setGetBookmarkedSnippetPayload} setBookmarkedPageState={setBookmarkedPageState} bookmarkedSnippetData={bookmarkedSnippetData} bookmarkedPageState={bookmarkedPageState} handleQAEdit={handleQAEdit} handleQADelete={handleQADelete} setcallBookmarkedSnippetApi={setcallBookmarkedSnippetApi} getSnippet={getSnippet} setValue={setValue} />
                    </TabPanel>
                    {showHiddenTab && <TabPanel value={value} index={2}>
                        {fetching ? <Skeleton variant="rectangular" width={'100%'} height={120} sx={{ marginBottom: 10 }} /> :
                            (allSnippetData && allSnippetData?.length > 0) ? allSnippetData?.map((el, i) => {
                                if (!el?.enabled) return (
                                    <Accordion key={el?.titleId}
                                        slotProps={{ transition: { timeout: 400 } }}>
                                        <AccordionSummary
                                            expandIcon={<ArrowDownwardIcon sx={{ color: 'white' }} />}
                                            aria-controls="panel1-content"
                                            id="panel1-header"
                                            sx={{ background: 'black', color: 'white', marginBottom: '10px' }}
                                        >
                                            <div className={CodeSnippetsStyles.questionFlex}>
                                                <div>
                                                    <Typography sx={{ fontWeight: 'bolder' }}>{el?.title}</Typography>
                                                </div>
                                            </div>
                                        </AccordionSummary>
                                        <AccordionDetails sx={{ background: '#fcfcfc' }}>
                                            {el?.data?.map((snippet, index) => (
                                                <div key={snippet.code + index}>
                                                    <div className={CodeSnippetsStyles.ansImageDiv}>
                                                        {snippet.snippet.map(img => (
                                                            <Zoom>
                                                                <img src={img.url} alt={img?.url} />
                                                            </Zoom>
                                                        ))}
                                                    </div>
                                                    { snippet?.explanation?.map(( explain, idx ) => (
                                                        <div key={ explain?.value + idx }> 
                                                            <Typography>Explanation {explain.id}</Typography>
                                                            <Typography>{explain.value}</Typography>
                                                        </div>
                                                    )) }
                                                    {el?.note && <Typography>Note : {el?.note}</Typography>}
                                                </div>
                                            ))}
                                            <div className={CodeSnippetsStyles.iconsDiv}>
                                                <EditIcon titleAccess='Edit' className={CodeSnippetsStyles.editQAIcon} onClick={() => handleQAEdit(el)} />
                                                <DeleteIcon titleAccess='Delete' className={CodeSnippetsStyles.deleteQAIcon} onClick={() => handleQADelete(el)} />
                                            </div>
                                        </AccordionDetails>
                                    </Accordion>
                                )
                            }) : <AppNoData />}
                        {totalDocs > 10 && <div className={CodeSnippetsStyles.pagination}>
                            <Pagination count={totalDocs} page={hiddenPageState} onChange={handleHiddenPageChange} color="primary" />
                        </div>}
                    </TabPanel>}
                </div>
                {(addSnippetClicked || editClicked) && <AddSnippet setAddSnippetClicked={setAddSnippetClicked} setEditClicked={setEditClicked} editClicked={editClicked} params={params} locationDetails={locationDetails} getSnippet={getSnippet} editItem={editItem} />}
            </div>
        </>
    )
}

export default CodeSnippets