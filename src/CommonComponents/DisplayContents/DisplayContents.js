import React, { useState } from 'react'
import DisplayContentsStyles from './DisplayContentsStyles.module.css';
import CommonButton from '../CommonButton';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Mousewheel, Keyboard } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './DisplayContentSwiperStyles.css'
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'
import AppNoData from '../AppNoData/AppNoData';
import { CustomizedTable, StyledTableCell, StyledTableRow } from '../TableStyles';
import { Alert, Dialog, DialogContent, Paper, Slide, Table, TableBody, TableHead, TableRow } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import PostAddIcon from '@mui/icons-material/PostAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { CommonHeaders } from '../CommonHeaders';
import { fetchQueryParams } from '../../Hooks/fetchQueryParams';
import { useFetchAPI } from '../../Hooks/useAPI';
import { storage } from '../../firebaseConfig';
import { ref as storageRef, deleteObject } from "firebase/storage";
import AddSection from '../AddSection/AddSection';
import AddDescription from '../AddDescription/AddDescription';
import EditDescription from '../EditDescription/EditDescription';
import Loader from '../Loader/Loader';
import { useSelector } from 'react-redux';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const DisplayContents = (props) => {

  const { contentData, locationDetails, categoryId, getConcepts, setSelectedIndex, setContentData, params } = props;

  const appState = useSelector(state => state);

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
      removeUploadedImage(image?.url);
    })
    if (descriptionDelete?.pointsData?.length > 0) {
      descriptionDelete?.pointsData?.forEach(el => {
        el?.snippet?.forEach(image => {
          removeUploadedImage(image?.url);
        })
      })
    }
  }

  const handleDeleteSectionImages = (data) => {
    data[0].description.forEach(el => {
      if (el?.snippet?.length > 0) {
        el?.snippet?.forEach(image => {
          removeUploadedImage(image?.url);
        })
      }
      if (el?.pointsData?.length > 0) {
        el?.pointsData?.forEach(point => {
          point?.snippet?.forEach(pountimage => {
            removeUploadedImage(pountimage?.url);
          })
        })
      }
    })
  }

  const onDeleteSuccess = res => {
    setCallDeleteDescApi(false);
    setErrorMessage('')
    if ((res?.status === 200 || res?.status === 201)) {
      setErrorMessage('');
      getConcepts?.refetch();
      setSelectedIndex(contentData.id - 1);
      setOpenPopup(true);
      !deleteSectionClicked && handleDeleteImages();
    } else {
      setErrorMessage(res?.data?.detail ? res?.data?.detail : 'Something went wrong. Please try again later');
      setOpenPopup(true);
      getConcepts?.refetch();
    }
    setDeleteSectionClicked(false);
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
    let deletedData = contentData.data.filter(el => el.sectionId === sectionId);
    contentData.data = data;
    deleteSectionPayload.data = contentData.data;
    setDeleteSectionPayload(deleteSectionPayload);
    handleDeleteSectionImages(deletedData);
    setCallDeleteDescApi(true);
  }

  let editDescription = useFetchAPI("EditDescription", `/concepts/section/editDescription`, "POST", deleteSectionClicked ? deleteSectionPayload : payload, CommonHeaders(), fetchQueryParams("", "", "", onDeleteSuccess, "", callDeleteDescApi));

  return (
    <>
      {(editDescription?.Loading || editDescription?.Fetching) && <Loader showLoader={editDescription?.Loading || editDescription?.Fetching} />}
      <div className={DisplayContentsStyles.headerFlex}>
        <div>
          <div><h2 className={DisplayContentsStyles.contentTitle}>{contentData?.title}</h2></div>
        </div>
        <div>
        { appState?.role !== 'user' &&  <AddIcon titleAccess='Add Section' className={DisplayContentsStyles.addSectionIcon} onClick={() => handleAddSection()} /> }
        </div>
      </div>
      <div className={DisplayContentsStyles.contentData}>
        {contentData?.data ? contentData?.data?.length > 0 && contentData?.data?.map((el, i) => (
          <div className={DisplayContentsStyles.section} key={el?.sectionId + i}>
            <div className={DisplayContentsStyles.addDescBtn}>
            { appState?.role !== 'user' && <PostAddIcon titleAccess='Add Description' onClick={() => handleAddDescription(el, el?.sectionId)} className={DisplayContentsStyles.addDescIcon} /> }
            { appState?.role !== 'user' && <DeleteIcon titleAccess='Delete Section' onClick={() => handleDeleteSection(el, el?.sectionId)} className={DisplayContentsStyles.deleteSectionIcon} /> }
            </div>
            {el?.description && el?.description?.length > 0 && el?.description?.map((desc, idx) => (
              <div className={DisplayContentsStyles.description} key={desc?.id + idx}>
                <h5 className={DisplayContentsStyles.descHeader}>{desc?.header && desc?.header}</h5>
                <h6 className={DisplayContentsStyles.descData}>{desc?.data && desc?.data}</h6>
                {desc?.snippet && desc?.snippet?.length > 0 && <h6 className={DisplayContentsStyles.descCodeSnippet}><u>Code Snippets</u></h6>}
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
                  <div className={DisplayContentsStyles.grid}>
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
                  <div className={DisplayContentsStyles.pointsDiv}>
                    {desc?.pointsData && desc?.pointsData?.length > 0 && (
                      <ul>
                        {desc?.pointsData?.map((point, pointIndex) => (
                          <div className={DisplayContentsStyles.points}>
                            <li className={DisplayContentsStyles.descPoint} key={point + pointIndex}>{point?.value}</li>
                            {point?.snippet && point?.snippet?.length > 0 && <h6 className={DisplayContentsStyles.descCodeSnippet}><u>Code Snippets</u></h6>}
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
                              <div className={DisplayContentsStyles.grid}>
                                {
                                  point?.snippet && point?.snippet?.length > 0 && point?.snippet?.map((img, index) => (
                                    <SwiperSlide key={img?.url + index}>
                                      <Zoom>
                                        <img src={img?.url} alt={img?.url} width="500" />
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
                  <div className={DisplayContentsStyles.tableDiv}>
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
                <div className={DisplayContentsStyles.addDescBtn}>
                { appState?.role !== 'user' && <EditIcon className={DisplayContentsStyles.editDescIcon} titleAccess='Edit Description' onClick={() => handleEditDescription(desc, el?.sectionId)} /> }
                { appState?.role !== 'user' && <DeleteIcon className={DisplayContentsStyles.deleteDescIcon} titleAccess='Delete Description' onClick={() => handleDeleteDescription(desc, el?.sectionId)} /> }
                </div>
              </div>
            ))}
          </div>
        )) : <AppNoData isImgRequired={false} />}
      </div>
      {editClicked && <EditDescription desc={item} editClicked={editClicked} setEditClicked={setEditClicked} sectionId={sectionId} locationDetails={locationDetails} categoryId={categoryId} contentData={contentData} getConcepts={getConcepts} setSelectedIndex={setSelectedIndex} setContentData={setContentData} params={params} />}
      {addClicked && <AddDescription addClicked={addClicked} setAddClicked={setAddClicked} sectionId={addSectionId} locationDetails={locationDetails} categoryId={categoryId} contentData={contentData} getConcepts={getConcepts} setSelectedIndex={setSelectedIndex} setContentData={setContentData} addItem={addItem} params={params} />}
      {addSectionClicked && <AddSection addSectionClicked={addSectionClicked} setAddSectionClicked={setAddSectionClicked} contentData={contentData} locationDetails={locationDetails} categoryId={categoryId} getConcepts={getConcepts} setSelectedIndex={setSelectedIndex} setContentData={setContentData} params={params} />}
      <Dialog open={openPopup} TransitionComponent={Transition} keepMounted onClose={handleCloseDialog} aria-describedby="alert-dialog-slide-description" fullWidth={false} maxWidth="sm" >
        <div className={DisplayContentsStyles.modalinnerwrapper}>
          <div><h4 className={DisplayContentsStyles.headerText}>{errorMessage?.length > 0 ? 'Failed' : 'Success'}</h4></div>
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
          <div className={DisplayContentsStyles.modalactionsection}>
            <CommonButton variant="contained" bgColor={'white'} color={'#286ce2'} padding={'0.2rem 2.6rem'} borderRadius={'8px'} fontWeight={'bold'} border={'1px solid #286ce2'} onClick={handleCloseDialog}>Ok</CommonButton>
          </div>
        </div>
      </Dialog>
    </>
  )
}

export default DisplayContents