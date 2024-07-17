import React, { useRef, useState } from 'react';
import ReactStyles from './ReactHooksStyles.module.css';
import CommonButton from '../../../../CommonComponents/CommonButton';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Mousewheel, Keyboard } from 'swiper/modules';
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './HooksContentSwiperStyles.css';
import { Alert, Dialog, DialogContent, Paper, Slide, Table, TableBody, TableHead, TableRow } from '@mui/material';
import { CustomizedTable, StyledTableCell, StyledTableRow } from '../../../../CommonComponents/TableStyles';
import EditDescription from './EditDescription';
import AddDescription from './AddDescription';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { useFetchAPI } from '../../../../Hooks/useAPI';
import { CommonHeaders } from '../../../../CommonComponents/CommonHeaders';
import { fetchQueryParams } from '../../../../Hooks/fetchQueryParams';
import Loader from '../../../../CommonComponents/Loader/Loader';
import AddSection from './AddSection';
import AppNoData from '../../../../CommonComponents/AppNoData/AppNoData';
import { storage } from '../../../../firebaseConfig';
import { ref as storageRef, deleteObject } from "firebase/storage";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const DisplayContent = (props) => {

    const { contentData, locationDetails, categoryId, GetHooks, setSelectedIndex, setContentData } = props;

    const [editClicked, setEditClicked] = useState(false);
    const [addClicked, setAddClicked] = useState(false);
    const [item, setItem] = useState({});
    const [addItem, setAddItem] = useState();
    const [sectionId, setSectionId] = useState('');
    const [addSectionId, setAddSectionId] = useState('');
    const [openPopup, setOpenPopup] = useState(false);
    const [callDeleteDescApi, setCallDeleteDescApi] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [payload, setPayload] = useState({});
    const [addSectionClicked, setAddSectionClicked] = useState(false);
    const [deleteSectionPayload, setDeleteSectionPayload] = useState({});
    const [deleteSectionClicked, setDeleteSectionClicked] = useState(false);
    const [descriptionDelete, setDescriptionDelete] = useState();


    const handleEditDescription = (desc, sectionid) => {
        setEditClicked(true);
        setItem(desc);
        setSectionId(sectionid);
    }

    const handleAddDescription = (el, sectionid) => {
        setAddClicked(true);
        setAddItem(el);
        setAddSectionId(sectionid)
    }

    const handleDeleteDescription = (desc, sectionId) => {
        let payload = {};
        setDescriptionDelete(desc);
        payload.sectionId = sectionId;
        payload.categoryId = categoryId;
        payload.title = contentData?.title;
        payload.topicId = locationDetails?.state?.topicDetails?.topicId;
        let data = contentData.data[sectionId - 1].description.filter(el => el.id !== desc.id);
        contentData.data[sectionId - 1].description = data;
        payload.data = contentData.data;
        setPayload(payload);
        setCallDeleteDescApi(true);
    }

    const removeUploadedImage = async (image) => {
        const imageRef = storageRef(storage, image);
        deleteObject(imageRef).then(() => {

        }).catch((error) => {

        });
    }

    const handleDeleteImages = () => {
        descriptionDelete?.snippet?.forEach(image => {
            removeUploadedImage(image);
        })
        if (descriptionDelete?.pointsData?.length > 0) {
            descriptionDelete?.pointsData?.forEach(el => {
                el?.snippet?.forEach(image => {
                    removeUploadedImage(image);
                })
            })
        }
    }

    const onDeleteSuccess = res => {
        setCallDeleteDescApi(false);
        setDeleteSectionClicked(false);
        setErrorMessage('')
        if ((res?.status === 200 || res?.status === 201)) {
            setErrorMessage('');
            GetHooks?.refetch();
            setSelectedIndex(contentData.id - 1);
            setOpenPopup(true);
            handleDeleteImages();
        } else {
            setErrorMessage(res?.data?.detail ? res?.data?.detail : 'Something went wrong. Please try again later');
            setOpenPopup(true);
        }
    }

    const handleCloseDialog = () => {
        setOpenPopup(false);
        window.scroll(0, 0);
    }

    const handleAddSection = () => {
        setAddSectionClicked(true);
    }

    const handleDeleteSection = (el, sectionId) => {
        setDeleteSectionClicked(true);
        let deleteSectionPayload = {};
        deleteSectionPayload.sectionId = sectionId;
        deleteSectionPayload.categoryId = categoryId;
        deleteSectionPayload.title = contentData?.title;
        deleteSectionPayload.topicId = locationDetails?.state?.topicDetails?.topicId;
        let data = contentData.data.filter(el => el.sectionId !== sectionId);
        contentData.data = data;
        deleteSectionPayload.data = contentData.data;
        console.log(deleteSectionPayload);
        setDeleteSectionPayload(deleteSectionPayload);
        setCallDeleteDescApi(true);
    }

    let editDescription = useFetchAPI("EditDescription", `/concepts/section/editDescription`, "POST", deleteSectionClicked ? deleteSectionPayload : payload, CommonHeaders(), fetchQueryParams("", "", "", onDeleteSuccess, "", callDeleteDescApi));

    return (
        <>
            {(editDescription?.Loading || editDescription?.Fetching) && <Loader showLoader={editDescription?.Loading || editDescription?.Fetching} />}
            <div>
                <div className={ReactStyles.headerFlex}>
                    <div>
                        <div><h2 className={ReactStyles.contentTitle}>{contentData?.title}</h2></div>
                    </div>
                    <div>
                        <CommonButton variant="contained" bgColor={'#5b67f1'} color={'white'} padding={'15px'} borderRadius={'5px'} fontWeight={'bold'} width={'100%'} height={'45px'} marign={'20px 0 0 0'} onClick={() => handleAddSection()}>Add Section</CommonButton>
                    </div>
                </div>
                <div className={ReactStyles.contentData}>
                    {contentData?.data ? contentData?.data?.length > 0 && contentData?.data?.map((el, i) => (
                        <div className={ReactStyles.section} key={el?.sectionId + i}>
                            <div className={ReactStyles.addDescBtn}>
                                <CommonButton variant="contained" bgColor={'#5b67f1'} color={'white'} padding={'15px'} borderRadius={'5px'} fontWeight={'bold'} width={'25%'} height={'45px'} marign={'20px 0 0 0'} onClick={() => handleAddDescription(el, el?.sectionId)}>Add Description</CommonButton>
                                <CommonButton variant="contained" bgColor={'#5b67f1'} color={'white'} padding={'15px'} borderRadius={'5px'} fontWeight={'bold'} width={'25%'} height={'45px'} marign={'20px 0 0 0'} onClick={() => handleDeleteSection(el, el?.sectionId)}>Delete Section</CommonButton>
                            </div>
                            {el?.description && el?.description?.length > 0 && el?.description?.map((desc, idx) => (
                                <div className={ReactStyles.description} key={desc?.id + idx}>
                                    <h5 className={ReactStyles.descHeader}>{desc?.header && desc?.header}</h5>
                                    <h6 className={ReactStyles.descData}>{desc?.data && desc?.data}</h6>
                                    {desc?.snippet && desc?.snippet?.length > 0 && <h6 className={ReactStyles.descCodeSnippet}><u>Code Snippets</u></h6>}
                                    <Swiper
                                        slidesPerView={4}
                                        spaceBetween={0}
                                        cssMode={true}
                                        navigation={true}
                                        mousewheel={true}
                                        keyboard={true}
                                        modules={[Navigation, Mousewheel, Keyboard]}
                                        className="mySwiper"
                                    >
                                        <div className={ReactStyles.grid}>
                                            {
                                                desc?.snippet && desc?.snippet?.length > 0 && desc?.snippet?.map((img, index) => (
                                                    <SwiperSlide key={img?.url + index}>
                                                        <Zoom>
                                                            <img src={img?.url} alt={img?.url} width="500" />
                                                        </Zoom>
                                                    </SwiperSlide>
                                                ))}
                                        </div>
                                    </Swiper>
                                    {desc?.hasPoints && (
                                        <div className={ReactStyles.pointsDiv}>
                                            {desc?.pointsData && desc?.pointsData?.length > 0 && (
                                                <ul>
                                                    {desc?.pointsData?.map((point, pointIndex) => (
                                                        <div className={ReactStyles.points}>
                                                            <li className={ReactStyles.descPoint} key={point + pointIndex}>{point?.value}</li>
                                                            {point?.snippet && point?.snippet?.length > 0 && <h6 className={ReactStyles.descCodeSnippet}><u>Code Snippets</u></h6>}
                                                            <Swiper
                                                                slidesPerView={4}
                                                                spaceBetween={0}
                                                                cssMode={true}
                                                                navigation={true}
                                                                mousewheel={true}
                                                                keyboard={true}
                                                                modules={[Navigation, Mousewheel, Keyboard]}
                                                                className="mySwiper"
                                                            >
                                                                <div className={ReactStyles.grid}>
                                                                    {
                                                                        point?.snippet && point?.snippet?.length > 0 && point?.snippet?.map((img, index) => (
                                                                            <SwiperSlide key={img + index}>
                                                                                <Zoom>
                                                                                    <img src={img} alt={img} width="500" />
                                                                                </Zoom>
                                                                            </SwiperSlide>
                                                                        ))}
                                                                </div>
                                                            </Swiper>
                                                        </div>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    )}
                                    {desc?.hasTable && (
                                        <div className={ReactStyles.tableDiv}>
                                            <CustomizedTable component={Paper} elevation={6}>
                                                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                                    <TableHead>
                                                        <TableRow>
                                                            {desc?.tableColumns?.map((column, i) => (
                                                                <StyledTableCell align="center" key={i}>{column?.value}</StyledTableCell>
                                                            ))}
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {desc?.tableData?.map((res, tableIndex) => (
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
                                    <div className={ReactStyles.addDescBtn}>
                                        <CommonButton variant="contained" bgColor={'#5b67f1'} color={'white'} padding={'10px'} borderRadius={'5px'} fontWeight={'bold'} width={'25%'} height={'45px'} marign={'20px 0 0 0'} onClick={() => handleEditDescription(desc, el?.sectionId)}>Edit Description</CommonButton>
                                        <CommonButton variant="contained" bgColor={'#5b67f1'} color={'white'} padding={'10px'} borderRadius={'5px'} fontWeight={'bold'} width={'28%'} height={'45px'} marign={'20px 0 0 0'} onClick={() => handleDeleteDescription(desc, el?.sectionId)}>Delete Description</CommonButton>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )) : <AppNoData isImgRequired={false} />}
                </div>
            </div>
            {editClicked && <EditDescription desc={item} editClicked={editClicked} setEditClicked={setEditClicked} sectionId={sectionId} locationDetails={locationDetails} categoryId={categoryId} contentData={contentData} GetHooks={GetHooks} setSelectedIndex={setSelectedIndex} setContentData={setContentData} />}
            {addClicked && <AddDescription addClicked={addClicked} setAddClicked={setAddClicked} sectionId={addSectionId} locationDetails={locationDetails} categoryId={categoryId} contentData={contentData} GetHooks={GetHooks} setSelectedIndex={setSelectedIndex} setContentData={setContentData} addItem={addItem} />}
            {addSectionClicked && <AddSection addSectionClicked={addSectionClicked} setAddSectionClicked={setAddSectionClicked} contentData={contentData} locationDetails={locationDetails} categoryId={categoryId} GetHooks={GetHooks} setSelectedIndex={setSelectedIndex} setContentData={setContentData} />}
            <Dialog open={openPopup} TransitionComponent={Transition} keepMounted onClose={handleCloseDialog} aria-describedby="alert-dialog-slide-description" fullWidth={false} maxWidth="sm" >
                <div className={ReactStyles.modalinnerwrapper}>
                    <div><h4 className={ReactStyles.headerText}>{errorMessage?.length > 0 ? 'Failed' : 'Success'}</h4></div>
                    <IconButton aria-label="close" onClick={handleCloseDialog} sx={{ position: 'absolute', right: 8, top: 8, color: "#666" }}>
                        <CloseIcon />
                    </IconButton>
                    <DialogContent>
                        <Alert
                            anchorOrigin={{ vertical: "top", horizontal: "center" }}
                            severity={errorMessage?.length > 0 ? "error" : "success"}
                        >
                            {errorMessage?.length > 0 ? errorMessage : 'Deleted Successfully'}
                        </Alert>
                    </DialogContent>
                    <div className={ReactStyles.modalactionsection}>
                        <CommonButton variant="contained" bgColor={'white'} color={'#286ce2'} padding={'0.2rem 2.6rem'} borderRadius={'8px'} fontWeight={'bold'} border={'1px solid #286ce2'} onClick={handleCloseDialog}>Ok</CommonButton>
                    </div>
                </div>
            </Dialog>
        </>
    )
}

export default DisplayContent