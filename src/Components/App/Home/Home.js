import React, { useEffect, useMemo, useRef, useState } from 'react'
import HomeStyles from './HomeStyles.module.css';

import { useSelector } from 'react-redux';
import { useFetchAPI } from '../../../Hooks/useAPI';
import { fetchQueryParams } from '../../../Hooks/fetchQueryParams';
import { CommonHeaders } from '../../../CommonComponents/CommonHeaders';
import { Alert, Dialog, DialogContent, Skeleton, Slide, TextField } from '@mui/material';
import Image from '../../../Images/learning.png';
import Loader from '../../../CommonComponents/Loader/Loader';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Mousewheel, Keyboard } from 'swiper/modules';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import { storage } from '../../../firebaseConfig';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './swiperStyles.css';
import CommonButton from '../../../CommonComponents/CommonButton';
import { getDownloadURL, ref as storageRef, uploadBytes, uploadBytesResumable, deleteObject } from "firebase/storage";
import ConfirmationDialog from '../../../CommonComponents/ConfirmationDialog/ConfirmationDialog';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const Home = () => {

    const appState = useSelector(state => state);
    const navigate = useNavigate();

    const [categoriesListData, setCategoryListData] = useState([]);
    const [categoriesInfo, setCategoryInfo] = useState({ data: [], error: '' });
    const [selectedItem, setSelectedItem] = useState({});
    const [selectedItemIndex, setSelectedItemIndex] = useState(0);
    const [categoryType, setCategoryType] = useState('all');
    const [callCategoryApi, setCallCategoryApi] = useState(false);
    const [categoryId, setCategoryId] = useState('');
    const [topicDetails, setTopicDetails] = useState({});
    const [callTopicApi, setCallTopicApi] = useState(false);
    const [selectedCategoryIndex, setSelectedCategoryIndex] = useState();
    const [topicInfo, setTopicInfo] = useState({ data: [], error: '' });
    const [isFetching, setIsFetching] = useState(false);
    const [openEditTopicModal, setOpenEditTopicModal] = useState(false);
    const [editTopicInfo, setEditTopicInfo] = useState({ name: '', desc: '', image: [] });
    const [editTopicPayload, setEditTopicPayload] = useState({});
    const [openEditTopicModalInfo, setOpenEditTopicModalInfo] = useState({ open: false, success: '', error: '' });
    const [callEditTopic, setCallEditTopic] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const coverImageInput = useRef();

    const onCategoriesListSuccess = res => {
        if ((res?.status === 200 || res?.status === 201)) {
            setCategoryListData(res?.data?.categoriesList);
        } else {

        }
    }

    useEffect(() => {
        setSelectedItemIndex(0);
        setCategoryType('all');
        setCallCategoryApi(true);
        setTopicInfo({ data: [], error: '' });
    }, [])


    const handleListClick = (el, idx) => {
        console.log(el, idx);
        setSelectedItemIndex(idx)
        setSelectedItem(el);
        setCategoryType(el?.id);
        setCallCategoryApi(true);
    }

    const onCategoriesSuccess = res => {
        setCallCategoryApi(false);
        setCategoryInfo({ data: [], error: '' });
        if ((res?.status === 200 || res?.status === 201)) {
            setCategoryInfo({ data: res?.data?.categories, error: '' });
        } else {
            setCategoryInfo({ data: [], error: res?.data?.detail ? res?.data?.detail : 'Something went wrong. Please try again later' });
        }
    }

    const handleCategoryClicked = (el, idx) => {
        setSelectedCategoryIndex(idx)
        setCategoryId(el?.categoryId);
        setCallTopicApi(true);
    }

    const onTopicsSuccess = res => {
        console.log(res);
        setCallTopicApi(false);
        setTopicInfo({ data: [], error: '' });
        if ((res?.status === 200 || res?.status === 201)) {
            const sortedData = res?.data?.topics?.sort((a, b) => {
                let keyA = a?.displayOrder,
                    keyB = b?.displayOrder;
                if (keyA < keyB) return -1;
                if (keyA > keyB) return 1;
                return 0;
            })
            setTopicInfo({ data: res?.data?.topics, error: '' });
        } else {
            setTopicInfo({ data: [], error: res?.data?.detail ? res?.data?.detail : 'Something went wrong. Please try again later' });
        }
    }

    const handleTopicCardClick = (el) => {
        setTopicDetails(el)
    }

    const handleTopicClick = (el) => {
        navigate(`/home/topic/${categoryId}/${el?.topicId}`, { state: { topicDetails: el, categoryDetails: categoriesInfo?.data } })
    }

    const handleTopicEdit = (el) => {
        setOpenEditTopicModal(true);
        setEditTopicInfo({ name: el?.topicName, desc: el?.description ? el?.description : '', image: [{ url: el?.imageUrl, imageUploaded: true }] });
    }

    const handleEditTopicCloseDialog = () => {
        setOpenEditTopicModal(false);
        coverImageInput.current.value = '';
    }

    const handleEditTopicConfirm = () => {
        setEditTopicPayload({ categoryId: categoryId, topicId: topicDetails?.topicId, topicName: editTopicInfo?.name, description: editTopicInfo?.desc, imageUrl: editTopicInfo?.image[0].url  })
        setCallEditTopic(true);
        handleEditTopicCloseDialog();
    }

    const onEditTopicSuccess = (res) => {
        setCallEditTopic(false);
        if ((res?.status === 200 || res?.status === 201)) {     
            getTopics?.refetch();       
            setOpenEditTopicModalInfo({ open: true, success: `Updated Successfully`, error: '' });
            setEditTopicInfo({});
        } else {
            setOpenEditTopicModalInfo({ open: true, success: ``, error: res?.data?.detail ? res?.data?.detail : 'Something went wrong. Please try again later' });
            setEditTopicInfo({})
        }
    }

    const handleEditTopicClosePopup = () => {
        setOpenEditTopicModalInfo({ open: false, success: ``, error: '' })
    }

    const handleEditTopicChange = (e) => {
        let newValues = { ...editTopicInfo };
        if (e.target.name === 'image') {
            const selectedFiles = e.target.files;
            const selectedFilesArray = Array.from(selectedFiles);
            const imagesArray = selectedFilesArray.map((file) => {
                return { url: URL.createObjectURL(file), imageUploaded: false };
            });
            setEditTopicInfo((prev) => ({ ...prev, image: [editTopicInfo?.image.concat(imagesArray)] }));
            newValues[e.target.name] = imagesArray;
        } else {
            newValues[e.target.name] = e.target.value;
        }
        setEditTopicInfo(newValues);
    }

    const uploadTopicImages = async(image, index) => {
        let blob = await fetch(image).then(r => r.blob());
        const type = blob?.type.split('/')[1];
        const path = `${`${categoryId}/${topicDetails?.topicId}/${topicDetails?.topicId}.${type}`}`;
        const imageRef = storageRef(storage, path, { contentType: blob?.type });
        setIsLoading(true);
        let newValues = {...editTopicInfo};
        uploadBytesResumable(imageRef, blob, { contentType: blob?.type })
            .then((snapshot) => {
                getDownloadURL(snapshot.ref)
                    .then((url) => {
                        setIsLoading(false);
                        newValues.image[index].url = url;
                        newValues.image[index].imageUploaded = true;
                        setEditTopicInfo(newValues);
                        return url;
                    })
                    .catch((error) => {
                        setIsLoading(false);
                        newValues.image[index].imageUploaded = false;
                    });
            })
            .catch((error) => {
                setIsLoading(false);
                newValues.image[index].imageUploaded = false;
            });
    }

    const deleteTopicImage = (image) => {
        let newValues = {...editTopicInfo};
        const filtered = newValues?.image?.findIndex((e) => e === image);
        newValues?.image?.splice(filtered, 1);
        coverImageInput.current.value = '';
        setEditTopicInfo(newValues);
        URL.revokeObjectURL(image);
    }

    const removeUploadedTopicImage = (image, index) => {
        const imageRef = storageRef(storage, image);
        deleteObject(imageRef).then(() => {
            let newValues = {...editTopicInfo};
            const index = newValues.image.findIndex(el => el.url === image);
            newValues.image.splice(index, 1);
            if (newValues.image?.length === 0) {
                coverImageInput.current.value = '';
            }
            setEditTopicInfo(newValues);
        }).catch((error) => {

        });
    }

    console.log(editTopicInfo, 'editTopicInfo');

    let getCategoriesList = useFetchAPI("GetCategoriesList", `/categories/getCategoryList`, "GET", '', CommonHeaders(), fetchQueryParams("", "", "", onCategoriesListSuccess));
    let getCategories = useFetchAPI("GetCategories", `/categories/getCategoriesFromList/${categoryType}`, "GET", '', CommonHeaders(), fetchQueryParams("", "", "", onCategoriesSuccess, "", callCategoryApi));
    let getTopics = useFetchAPI("GetTopics", `/categories/getTopics/${categoryId}`, "GET", '', CommonHeaders(), fetchQueryParams("", "", "", onTopicsSuccess, "", callTopicApi));
    let EditTopic = useFetchAPI("EditTopic", `/categories/editTopic`, "POST", editTopicPayload, CommonHeaders(), fetchQueryParams("", "", "", onEditTopicSuccess, "", callEditTopic));

    const fetching = getCategoriesList?.Loading || getCategoriesList?.Fetching || EditTopic?.Loading || EditTopic?.Fetching;

    return (
        <>
            {(isFetching || fetching) && <Loader showLoader={fetching} />}
            <div className={HomeStyles.body}>
                <div className={HomeStyles.imageSection}>
                    <img src={Image} alt='Image' />
                </div>
                <div className={HomeStyles.categoryList}>
                    <h4 className={HomeStyles.categoriesText}>Categories</h4>
                    {categoriesListData?.length > 0 ? (
                        <>
                            <div className={HomeStyles.listFlex}>
                                {categoriesListData?.map((el, idx) => (
                                    <div key={el?.id} className={selectedItemIndex === idx ? HomeStyles.activeListData : HomeStyles.listData} onClick={() => handleListClick(el, idx)}>
                                        {el?.value}
                                    </div>
                                ))}
                            </div>
                        </>)
                        : <></>
                    }
                </div>
                <div className={HomeStyles.categories}>
                    <Swiper
                        slidesPerView={5}
                        spaceBetween={0}
                        cssMode={true}
                        navigation={true}
                        mousewheel={true}
                        keyboard={true}
                        modules={[Navigation, Mousewheel, Keyboard]}
                        className="mySwiper"
                    >
                        <div className={HomeStyles.grid}>
                            {(getCategories?.Loading || getCategories?.Fetching) ? <Skeleton variant="rectangular" width={'100%'} height={120} sx={{ marginBottom: 10 }} /> :
                                categoriesInfo?.data?.length > 0 ? categoriesInfo?.data?.map((el, index) => (
                                    <SwiperSlide key={el?.categoryId}>
                                        <div className={selectedCategoryIndex === index ? HomeStyles.activeCard : HomeStyles.card} onClick={() => handleCategoryClicked(el, index)}>
                                            <div className={HomeStyles.cardFlex}>
                                                <div>
                                                    <img className={HomeStyles.card__img} src={el?.imageUrl} alt={el?.categoryName} />
                                                </div>
                                                <div className={HomeStyles.category_card__content}>
                                                    <h1 className={HomeStyles.card__header}>{el?.categoryName}</h1>
                                                    <h6 className={HomeStyles.categoryCard__desc}>{el?.description}</h6>
                                                </div>
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                )) : <><h4 className={HomeStyles.topicsError}>{categoriesInfo?.error}</h4></>}
                        </div>
                    </Swiper>
                </div>
                <div className={HomeStyles.topics}>
                    {getTopics?.data && <h4 className={HomeStyles.categoriesText}>Topics</h4>}
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
                        <div className={HomeStyles.grid}>
                            {(getTopics?.Loading || getTopics?.Fetching) ? <Skeleton variant="rectangular" width={'100%'} height={200} sx={{ marginBottom: 10 }} /> :
                                topicInfo?.data?.length > 0 ? topicInfo?.data?.map((el, index) => (
                                    <SwiperSlide key={el?.topicId}>
                                        <div className={HomeStyles.topicCard} onClick={() => handleTopicCardClick(el)}>
                                            <div className={HomeStyles.topicCardFlex} onClick={() => handleTopicClick(el)}>
                                                <div className={HomeStyles.imageDiv}>
                                                    <img className={HomeStyles.card__imgTopic} src={el?.imageUrl} alt={el?.topicName} />
                                                </div>
                                                <div className={HomeStyles.card__content}>
                                                    <h1 className={HomeStyles.topicCard__header}>{el?.topicName}</h1>
                                                    <h6 className={HomeStyles.topicCard__desc}>{el?.description}</h6>
                                                </div>
                                            </div>
                                            <div className={HomeStyles.cardIcons}>
                                                <EditIcon titleAccess='Edit Topic' className={HomeStyles.topicEditIcon} onClick={() => handleTopicEdit(el)} />
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                )) : <><h4 className={HomeStyles.topicsError}>{topicInfo?.error}</h4></>}
                        </div>
                    </Swiper>
                </div>
            </div>
            <Dialog open={openEditTopicModal} TransitionComponent={Transition} keepMounted onClose={handleEditTopicCloseDialog} aria-describedby="alert-dialog-slide-description" fullWidth={false} maxWidth="sm" >
                <div className={HomeStyles.modalinnerwrapperTitleEdit}>
                    <div><h4 className={HomeStyles.headerText}>Edit {topicDetails?.topicName}</h4></div>
                    <IconButton aria-label="close" onClick={handleEditTopicCloseDialog} sx={{ position: 'absolute', right: 8, top: 8, color: "#666" }}>
                        <CloseIcon />
                    </IconButton>
                    <DialogContent className={HomeStyles.modelContent}>
                        <div>
                            <h4 className={HomeStyles.currentLabel}>Topic Name</h4>
                            <TextField
                                name='name'
                                className={HomeStyles.editTopicInput}
                                value={editTopicInfo.name}
                                size="small"
                                onChange={handleEditTopicChange}
                            />
                        </div>
                        <div className={HomeStyles.changeTo}>
                            <h4 className={HomeStyles.changeToLabel}>Topic Description</h4>
                            <TextField
                                name='desc'
                                multiline
                                maxRows={8}
                                className={HomeStyles.editTopicDescInput}
                                value={editTopicInfo.desc}
                                onChange={handleEditTopicChange}
                                size="small"
                            />
                        </div>
                        <div>
                            <h4 className={HomeStyles.changeToLabel}>Cover Image</h4>
                            <input ref={coverImageInput} name='image' type='file' accept='.jpg,.jpeg,.png' className={HomeStyles.uploadInput} onChange={handleEditTopicChange} />
                        </div>
                        <div className={HomeStyles.images}>
                            {editTopicInfo?.image &&
                                editTopicInfo?.image?.map((image, index) => {
                                    return (
                                        <div key={image} className={HomeStyles.image}>
                                            { image?.url && <><img src={image?.url} className={HomeStyles.descriptionImage} alt="upload" />
                                            <div className={HomeStyles.uploadBtnContainer}>
                                                <div className={HomeStyles.imageUploadBtn}>
                                                    <button className={HomeStyles.uploadBtn} disabled={image?.imageUploaded} onClick={() => uploadTopicImages(image?.url, index)}>{image?.imageUploaded ? 'Uploaded Successfully' : 'Upload'}</button>
                                                </div>
                                                <div>
                                                    {!image?.imageUploaded ? <button className={HomeStyles.imageDelete} onClick={() => deleteTopicImage(image)}>
                                                        Remove
                                                    </button> : <button className={HomeStyles.imageDelete} onClick={() => removeUploadedTopicImage(image?.url, index)}>
                                                        Cancel Upload
                                                    </button>}
                                                </div>
                                            </div></> }
                                            {image?.imageUploadedSuccess && image?.imageUploadedSuccess === false && <div className={HomeStyles.uploadErrorAlert}>
                                                <Alert autoHideDuration={3000} severity="error">
                                                    Upload Failed! Try again later.
                                                </Alert>
                                            </div>}
                                        </div>
                                    );
                                })}
                        </div>
                    </DialogContent>
                    <div className={HomeStyles.modalactionsection}>
                        <CommonButton variant="contained" bgColor={'#5b67f1'} color={'white'} padding={'0.2rem 2.6rem'} borderRadius={'8px'} fontWeight={'bold'} border={'1px solid #286ce2'} onClick={handleEditTopicConfirm} disabled={ !editTopicInfo?.name || !editTopicInfo?.desc || !editTopicInfo?.image[0]?.imageUploaded }>Edit</CommonButton>
                        <CommonButton variant="contained" bgColor={'#f8f8f8'} color={'black'} padding={'0.2rem 2.6rem'} borderRadius={'8px'} fontWeight={'bold'} border={'1px solid #ddd'} onClick={handleEditTopicCloseDialog}>Cancel</CommonButton>
                    </div>
                </div>
            </Dialog>
            <ConfirmationDialog openDialog={openEditTopicModalInfo?.open} errorMessage={openEditTopicModalInfo?.error} successMessage={openEditTopicModalInfo?.success} handleCloseDialog={handleEditTopicClosePopup} />
        </>
    )
}

export default Home