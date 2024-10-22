import React, { useRef, useState } from 'react'
import CommonButton from '../CommonButton'
import MainContentStyles from './MainContentStyles.module.css'
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Mousewheel, Keyboard } from 'swiper/modules';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './GetConceptsSwiperStyles.css'
import { useFetchAPI } from '../../Hooks/useAPI';
import { CommonHeaders } from '../CommonHeaders';
import { fetchQueryParams } from '../../Hooks/fetchQueryParams';
import DisplayContents from '../DisplayContents/DisplayContents';
import AddConcept from '../AddConcept/AddConcept';
import Loader from '../Loader/Loader';
import { Dialog, DialogContent, Slide, TextField } from '@mui/material';
import ConfirmationDialog from '../ConfirmationDialog/ConfirmationDialog';
import { ref as storageRef, deleteObject } from "firebase/storage";
import { storage } from '../../firebaseConfig';
import { useSelector } from 'react-redux';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const MainContent = (props) => {

    const { params, locationDetails } = props;

    const appState = useSelector(state => state);

    const [conceptsInfo, setConceptsInfo] = useState({ data: [], error: '' });
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [contentData, setContentData] = useState({});
    const [addConceptClick, setAddConceptClick] = useState(false);
    const [openConfirmationPopup, setOpenConfirmationPopup] = useState(false);
    const [openEditTitleModal, setOpenEditTitleModal] = useState(false);
    const [deleteConceptPayload, setDeleteConceptPayload] = useState({});
    const [callDeleteConceptApi, setCallDeleteConceptApi] = useState(false);
    const [openEditModalInfo, setOpenEditModalInfo] = useState({ open: false, success: '', error: '' });
    const [openDeleteModalInfo, setOpenDeleteModalInfo] = useState({ open: false, success: '', error: '' });
    const [editTitle, setEditTitle] = useState('');
    const [callEditConcept, setCallEditConcept] = useState(false);
    const [editConceptPayload, setEditConceptPayload] = useState({});
    const deleteConceptTitle = useRef('');
    const deleteConceptInfo = useRef();
    const editConceptInfo = useRef();

    const onGetConceptsSuccess = res => {
        setConceptsInfo({ data: [], error: '' });
        if ((res?.status === 200 || res?.status === 201)) {
            const sortedData = res?.data?.concepts?.sort((a, b) => {
                let keyA = a?.id,
                    keyB = b?.id;
                if (keyA < keyB) return -1;
                if (keyA > keyB) return 1;
                return 0;
            })
            setConceptsInfo({ data: res?.data?.concepts, error: '' });
            setContentData(res?.data?.concepts[0]);
            setSelectedIndex(0);
        } else {
            setConceptsInfo({ data: [], error: res?.data?.detail ? res?.data?.detail : 'Something went wrong. Please try again later' });
        }
    }

    const toggleDrawer = () => {
        setAddConceptClick(true)
    }

    const handleContentClick = (el, index) => {
        setSelectedIndex(index);
        setContentData(el);
    }

    const removeConceptUploadedImage = (image) => {
        const imageRef = storageRef(storage, image);
        deleteObject(imageRef).then(() => { }).then(err => { })
    }

    const handleDeleteConceptImages = (info) => {
        info && info?.data && info?.data?.forEach(el => {
            el.description.forEach(desc => {
                if (desc.snippet?.length > 0) {
                    desc.snippet?.forEach(img => {
                        removeConceptUploadedImage(img?.url);
                    })
                }
                if (desc.pointsData?.length > 0) {
                    desc.pointsData?.forEach(point => {
                        if (point?.snippet?.length > 0) {
                            point?.snippet?.forEach(image => {
                                removeConceptUploadedImage(image?.url);
                            })
                        }
                    })
                }
            })
        })
    }

    const handleEditConcept = (el) => {
        setOpenEditTitleModal(true);
        editConceptInfo.current = el;
    }

    const handleEditConceptConfirm = () => {
        setEditConceptPayload({ currentTitle: editConceptInfo?.current?.title, changedTitle: editTitle, categoryId: params?.categoryId, topicId: locationDetails?.state?.topicDetails?.topicId });
        setCallEditConcept(true);
        setOpenEditTitleModal(false);
    }

    const handleEditTitleCloseDialog = () => {
        setOpenEditTitleModal(false);
        editConceptInfo.current = null;
        setEditTitle('');
    }

    const onEditConceptSuccess = res => {
        setCallEditConcept(false);
        setOpenEditModalInfo({ open: false, success: ``, error: '' });
        if ((res?.status === 200 || res?.status === 201)) {
            getConcepts?.refetch();
            setSelectedIndex(contentData.id);
            handleEditTitleCloseDialog();
            setOpenEditModalInfo({ open: true, success: `Updated Successfully`, error: '' });
        } else {
            setOpenEditModalInfo({ open: true, success: ``, error: res?.data?.detail ? res?.data?.detail : 'Something went wrong. Please try again later' });
        }
    }

    const handleDeleteConcept = (title, el) => {
        deleteConceptTitle.current = title;
        deleteConceptInfo.current = el;
        setOpenConfirmationPopup(true);
    }

    const handleDeleteConceptCloseDialog = () => {
        setOpenConfirmationPopup(false);
        deleteConceptTitle.current = '';
        deleteConceptInfo.current = null;
    }

    const handleDeleteConceptConfirm = () => {
        setDeleteConceptPayload({ title: deleteConceptTitle.current, categoryId: params?.categoryId, topicId: locationDetails?.state?.topicDetails?.topicId })
        setCallDeleteConceptApi(true);
    }

    const onDeleteConceptSuccess = res => {
        setCallDeleteConceptApi(false);
        setOpenDeleteModalInfo({ open: false, success: ``, error: '' });
        if ((res?.status === 200 || res?.status === 201)) {
            handleDeleteConceptImages(deleteConceptInfo.current);
            getConcepts?.refetch();
            setSelectedIndex(contentData.id - 1);
            handleDeleteConceptCloseDialog();
            setOpenDeleteModalInfo({ open: true, success: `Deleted Successfully`, error: '' });
        } else {
            setOpenDeleteModalInfo({ open: true, success: ``, error: res?.data?.detail ? res?.data?.detail : 'Something went wrong. Please try again later' });
        }
    }

    const handleDeleteConceptClosePopup = () => {
        setOpenDeleteModalInfo({ open: false, success: ``, error: '' });
        deleteConceptTitle.current = '';
        deleteConceptInfo.current = null;
    }

    const handleEditConceptClosePopup = () => {
        setOpenEditModalInfo({ open: false, success: ``, error: '' });
        editConceptInfo.current = null;
        setEditTitle('');
    }

    let getConcepts = useFetchAPI("getConcepts", `/concepts/getConcepts/${params?.topicId}/${params?.categoryId}`, "GET", '', CommonHeaders(), fetchQueryParams("", "", "", onGetConceptsSuccess));
    let DeleteConcept = useFetchAPI("DeleteConcept", `/concepts/deleteConcept`, "POST", deleteConceptPayload, CommonHeaders(), fetchQueryParams("", "", "", onDeleteConceptSuccess, "", callDeleteConceptApi));
    let EditConcept = useFetchAPI("EditConcept", `/concepts/editConcept`, "POST", editConceptPayload, CommonHeaders(), fetchQueryParams("", "", "", onEditConceptSuccess, "", callEditConcept));

    const fetching = getConcepts?.Loading || getConcepts?.Fetching || DeleteConcept?.Loading || DeleteConcept?.Fetching || EditConcept?.Loading || EditConcept?.Fetching;

    return (
        <>
             {(fetching) && <Loader showLoader={fetching} />}
            <div className={MainContentStyles.mainContentContainer}>
                <div className={MainContentStyles.addConceptsBtn}>
                    { appState?.role !== 'user' && <CommonButton variant="contained" bgColor={'#5b67f1'} color={'white'} padding={'15px'} borderRadius={'5px'} fontWeight={'bold'} width={'100%'} height={'45px'} margin={'20px 0 0 0'} onClick={toggleDrawer}>Add Concept</CommonButton> }
                </div>
                <div className={MainContentStyles.concepts}>
                        <div className={MainContentStyles.grid}>
                            {
                                conceptsInfo?.data?.length > 0 ? conceptsInfo?.data?.map((el, index) => (
                                    <div className={MainContentStyles.conceptFlex} key={el?.title}>
                                        <div className={selectedIndex === index ? MainContentStyles.topicCardActive : MainContentStyles.topicCard} onClick={() => handleContentClick(el, index)}>
                                            <div className={MainContentStyles.topicCardFlex}>
                                                <div className={MainContentStyles.card__contentHooks}>
                                                    <h1 className={selectedIndex === index ? MainContentStyles.topicCard__headerActive : MainContentStyles.topicCard__header}>{el?.title}</h1>
                                                </div>
                                            </div>
                                            <div className={MainContentStyles.icons}>
                                            { appState?.role !== 'user' &&  <EditIcon titleAccess='Edit' className={MainContentStyles.editIcon} onClick={() => handleEditConcept(el)} /> }
                                            { appState?.role !== 'user' &&  <DeleteIcon titleAccess='Delete' className={MainContentStyles.deleteIcon} onClick={() => handleDeleteConcept(el?.title, el)} /> }
                                            </div>
                                        </div>
                                    </div>
                                )) : <><h4 className={MainContentStyles.topicsError}>{conceptsInfo?.error}</h4></>}
                        </div>
                    {contentData?.title && <div className={MainContentStyles.conceptContent}>
                        <DisplayContents contentData={contentData} params={params} locationDetails={locationDetails} categoryId={params?.categoryId} getConcepts={getConcepts} setSelectedIndex={setSelectedIndex} setContentData={setSelectedIndex} />
                    </div>}
                </div>
            </div>
            { addConceptClick && <AddConcept locationDetails={locationDetails} getConcepts={getConcepts} params={params} contentData={contentData} setAddConceptClick={setAddConceptClick} setSelectedIndex={setSelectedIndex} conceptsInfo={conceptsInfo} /> }
            <Dialog open={openEditTitleModal} TransitionComponent={Transition} keepMounted onClose={handleEditTitleCloseDialog} aria-describedby="alert-dialog-slide-description" fullWidth={false} maxWidth="sm" >
                <div className={MainContentStyles.modalinnerwrapper}>
                    <div><h4 className={MainContentStyles.headerText}>Edit {editConceptInfo?.current?.title}</h4></div>
                    <IconButton aria-label="close" onClick={handleEditTitleCloseDialog} sx={{ position: 'absolute', right: 8, top: 8, color: "#666" }}>
                        <CloseIcon />
                    </IconButton>
                    <DialogContent>
                        <div>
                            <label className={MainContentStyles.currentLabel}>Current</label>
                            <TextField
                                className={MainContentStyles.columnInput}
                                value={editConceptInfo?.current?.title}
                                size="small"
                                disabled
                            />
                        </div>
                        <div className={MainContentStyles.changeTo}>
                            <label className={MainContentStyles.changeToLabel}>Change To</label>
                            <TextField
                                name='changeTitle'
                                className={MainContentStyles.columnInput}
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                size="small"
                                placeholder='Type here.....'
                            />
                        </div>
                    </DialogContent>
                    <div className={MainContentStyles.modalactionsection}>
                        <CommonButton variant="contained" bgColor={'#5b67f1'} color={'white'} padding={'0.2rem 2.6rem'} borderRadius={'8px'} fontWeight={'bold'} border={'1px solid #286ce2'} onClick={handleEditConceptConfirm}>Edit</CommonButton>
                        <CommonButton variant="contained" bgColor={'#f8f8f8'} color={'black'} padding={'0.2rem 2.6rem'} borderRadius={'8px'} fontWeight={'bold'} border={'1px solid #ddd'} onClick={handleEditTitleCloseDialog}>Cancel</CommonButton>
                    </div>
                </div>
            </Dialog>
            <Dialog open={openConfirmationPopup} TransitionComponent={Transition} keepMounted onClose={handleDeleteConceptCloseDialog} aria-describedby="alert-dialog-slide-description" fullWidth={false} maxWidth="sm" >
                <div className={MainContentStyles.modalinnerwrapper}>
                    <div><h4 className={MainContentStyles.headerText}>Delete {deleteConceptTitle.current}</h4></div>
                    <IconButton aria-label="close" onClick={handleDeleteConceptCloseDialog} sx={{ position: 'absolute', right: 8, top: 8, color: "#666" }}>
                        <CloseIcon />
                    </IconButton>
                    <DialogContent>
                        Are you sure you want to delete {deleteConceptTitle.current}?
                    </DialogContent>
                    <div className={MainContentStyles.modalactionsection}>
                        <CommonButton variant="contained" bgColor={'#5b67f1'} color={'white'} padding={'0.2rem 2.6rem'} borderRadius={'8px'} fontWeight={'bold'} border={'1px solid #286ce2'} onClick={handleDeleteConceptConfirm}>Delete</CommonButton>
                        <CommonButton variant="contained" bgColor={'#f8f8f8'} color={'black'} padding={'0.2rem 2.6rem'} borderRadius={'8px'} fontWeight={'bold'} border={'1px solid #ddd'} onClick={handleDeleteConceptCloseDialog}>Cancel</CommonButton>
                    </div>
                </div>
            </Dialog>
            <ConfirmationDialog openDialog={openDeleteModalInfo?.open} errorMessage={openDeleteModalInfo?.error} successMessage={openDeleteModalInfo?.success} handleCloseDialog={handleDeleteConceptClosePopup} />
            <Dialog open={openEditTitleModal} TransitionComponent={Transition} keepMounted onClose={handleEditTitleCloseDialog} aria-describedby="alert-dialog-slide-description" fullWidth={false} maxWidth="sm" >
                <div className={MainContentStyles.modalinnerwrapper}>
                    <div><h4 className={MainContentStyles.headerText}>Edit {editConceptInfo?.current?.title}</h4></div>
                    <IconButton aria-label="close" onClick={handleEditTitleCloseDialog} sx={{ position: 'absolute', right: 8, top: 8, color: "#666" }}>
                        <CloseIcon />
                    </IconButton>
                    <DialogContent>
                        <div>
                            <label className={MainContentStyles.currentLabel}>Current</label>
                            <TextField
                                className={MainContentStyles.columnInput}
                                value={editConceptInfo?.current?.title}
                                size="small"
                                disabled
                            />
                        </div>
                        <div className={MainContentStyles.changeTo}>
                            <label className={MainContentStyles.changeToLabel}>Change To</label>
                            <TextField
                                name='changeTitle'
                                className={MainContentStyles.columnInput}
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                size="small"
                                placeholder='Type here.....'
                            />
                        </div>
                    </DialogContent>
                    <div className={MainContentStyles.modalactionsection}>
                        <CommonButton variant="contained" bgColor={'#5b67f1'} color={'white'} padding={'0.2rem 2.6rem'} borderRadius={'8px'} fontWeight={'bold'} border={'1px solid #286ce2'} onClick={handleEditConceptConfirm}>Edit</CommonButton>
                        <CommonButton variant="contained" bgColor={'#f8f8f8'} color={'black'} padding={'0.2rem 2.6rem'} borderRadius={'8px'} fontWeight={'bold'} border={'1px solid #ddd'} onClick={handleEditTitleCloseDialog}>Cancel</CommonButton>
                    </div>
                </div>
            </Dialog>
            <ConfirmationDialog openDialog={openEditModalInfo?.open} errorMessage={openEditModalInfo?.error} successMessage={openEditModalInfo?.success} handleCloseDialog={handleEditConceptClosePopup} />
        </>
    )
}

export default MainContent