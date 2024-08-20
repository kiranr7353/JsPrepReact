import React, { useEffect, useMemo, useRef, useState } from 'react'
import HomeStyles from './HomeStyles.module.css';

import { useSelector } from 'react-redux';
import { useFetchAPI } from '../../../Hooks/useAPI';
import { fetchQueryParams } from '../../../Hooks/fetchQueryParams';
import { CommonHeaders } from '../../../CommonComponents/CommonHeaders';
import { Alert, Dialog, DialogContent, Drawer, FormControl, Skeleton, Slide, Stack, TextField, Typography } from '@mui/material';
import Switch from '@mui/joy/Switch';
import Image from '../../../Images/learning.png';
import Loader from '../../../CommonComponents/Loader/Loader';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Mousewheel, Keyboard } from 'swiper/modules';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CancelIcon from '@mui/icons-material/Cancel';
import { storage } from '../../../firebaseConfig';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './swiperStyles.css';
import CommonButton from '../../../CommonComponents/CommonButton';
import { getDownloadURL, ref as storageRef, uploadBytes, uploadBytesResumable, deleteObject } from "firebase/storage";
import ConfirmationDialog from '../../../CommonComponents/ConfirmationDialog/ConfirmationDialog';
import AppNoData from '../../../CommonComponents/AppNoData/AppNoData';

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
    const [categoryDetails, setCategoryDetails] = useState({});
    const [callTopicApi, setCallTopicApi] = useState(false);
    const [selectedCategoryIndex, setSelectedCategoryIndex] = useState();
    const [topicInfo, setTopicInfo] = useState({ data: [], error: '' });
    const [isFetching, setIsFetching] = useState(false);
    const [openEditTopicModal, setOpenEditTopicModal] = useState(false);
    const [openEditCategoryModal, setOpenEditCategoryModal] = useState(false);
    const [openAddTopicModal, setOpenAddTopicModal] = useState(false);
    const [editTopicInfo, setEditTopicInfo] = useState({ name: '', desc: '', image: [], enabled: true });
    const [editCategoryInfo, setEditCategoryInfo] = useState({ categoryId: '', categoryName: '', description: '', image: [], enabled: true });
    const [addTopicInfo, setAddTopicInfo] = useState({ id: '', name: '', desc: '', image: [] });
    const [editTopicPayload, setEditTopicPayload] = useState({});
    const [editCategoryPayload, setEditCategoryPayload] = useState({});
    const [addTopicPayload, setAddTopicPayload] = useState({});
    const [deleteTopicPayload, setDeleteTopicPayload] = useState({});
    const [openEditTopicModalInfo, setOpenEditTopicModalInfo] = useState({ open: false, success: '', error: '' });
    const [openEditCategoryModalInfo, setOpenEditCategoryModalInfo] = useState({ open: false, success: '', error: '' });
    const [openAddTopicModalInfo, setOpenAddTopicModalInfo] = useState({ open: false, success: '', error: '' });
    const [openDeleteTopicModalInfo, setOpenDeleteTopicModalInfo] = useState({ open: false, success: '', error: '' });
    const [callEditTopic, setCallEditTopic] = useState(false);
    const [callEditCategory, setCallEditCategory] = useState(false);
    const [callAddTopic, setCallAddTopic] = useState(false);
    const [callDeleteTopic, setCallDeleteTopic] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const coverImageInput = useRef();
    const coverAddImageInput = useRef();
    const coverEditCategoryImageInput = useRef();
    const deleteTopicInfo = useRef();
    const [openDeleteTopicPopup, setOpenDeleteTopicPopup] = useState(false);
    const [openDrawer, setOpenDrawer] = useState(false);
    const [type, setType] = useState('');
    const [hiddenData, setHiddenData] = useState([]);
    const [showCategoryHiddenBtn, setShowCategoryHiddenBtn] = useState(false);
    const [showTopicHiddenBtn, setShowTopicHiddenBtn] = useState(false);
    const [callFavTopicsApi, setCallFavTopicsApi] = useState(false);
    const [favoriteTopics, setFavoriteTopics] = useState([]);

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
            let filterHidden = res?.data?.categories?.filter(el => !el?.enabled);
            if(filterHidden && filterHidden?.length > 0) {
                setShowCategoryHiddenBtn(true);
            } else {
                setShowCategoryHiddenBtn(false);
            }
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
            let filterHidden = res?.data?.topics?.filter(el => !el?.enabled);
            if(filterHidden && filterHidden?.length > 0) {
                setShowTopicHiddenBtn(true);
            } else {
                setShowTopicHiddenBtn(false);
            }
        } else {
            setTopicInfo({ data: [], error: res?.data?.detail ? res?.data?.detail : 'Something went wrong. Please try again later' });
        }
    }

    let favoriteTopicObj = { favoriteTopic: {} };

    const handleFavoriteEdit = el => {
        favoriteTopicObj.favoriteTopic = el;
        callFavTopicsApi(true);
    }

    const handleRemoveFavoriteEdit = el => {
        
    }

    const handleTopicCardClick = (el) => {
        setTopicDetails(el)
    }

    const handleTopicClick = (el) => {
        navigate(`/home/topic/${categoryId}/${el?.topicId}`, { state: { topicDetails: el, categoryDetails: categoriesInfo?.data } })
    }

    const handleTopicEdit = (el) => {
        console.log(el);
        
        setOpenEditTopicModal(true);
        setEditTopicInfo({ name: el?.topicName, desc: el?.description ? el?.description : '', image: [{ url: el?.imageUrl, imageUploaded: true }], enabled: el?.enabled !== undefined ? el?.enabled : true });
    }

    const handleEditTopicCloseDialog = () => {
        setOpenEditTopicModal(false);
        coverImageInput.current.value = '';
    }

    const handleEditTopicConfirm = () => {
        setEditTopicPayload({ categoryId: categoryId, topicId: topicDetails?.topicId, topicName: editTopicInfo?.name, description: editTopicInfo?.desc, imageUrl: editTopicInfo?.image[0].url, enabled: editTopicInfo?.enabled })
        setCallEditTopic(true);
        handleEditTopicCloseDialog();
    }

    const onFavoriteTopicsSuccess = res => {
        if ((res?.status === 200 || res?.status === 201)) {
            setFavoriteTopics(res?.data?.favoriteTopics)
        } else {
        }
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
        } else if (e.target.id === 'enabled') {
            newValues['enabled'] = e.target.checked;
        } else {
            newValues[e.target.name] = e.target.value;
        }
        setEditTopicInfo(newValues);
    }

    const handleAddTopicChange = (e) => {
        let newValues = { ...addTopicInfo };
        if (e.target.name === 'image') {
            const selectedFiles = e.target.files;
            const selectedFilesArray = Array.from(selectedFiles);
            const imagesArray = selectedFilesArray.map((file) => {
                return { url: URL.createObjectURL(file), imageUploaded: false };
            });
            setAddTopicInfo((prev) => ({ ...prev, image: [addTopicInfo?.image.concat(imagesArray)] }));
            newValues[e.target.name] = imagesArray;
        } else {
            newValues[e.target.name] = e.target.value;
        }
        setAddTopicInfo(newValues);
    }

    const uploadAddTopicImages = async (image, index) => {
        let blob = await fetch(image).then(r => r.blob());
        const type = blob?.type.split('/')[1];
        const path = `${`${categoryId}/${addTopicInfo?.id}/${addTopicInfo?.id}.${type}`}`;
        const imageRef = storageRef(storage, path, { contentType: blob?.type });
        setIsLoading(true);
        let newValues = { ...addTopicInfo };
        uploadBytesResumable(imageRef, blob, { contentType: blob?.type })
            .then((snapshot) => {
                getDownloadURL(snapshot.ref)
                    .then((url) => {
                        setIsLoading(false);
                        newValues.image[index].url = url;
                        newValues.image[index].imageUploaded = true;
                        setAddTopicInfo(newValues);
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

    const deleteAddTopicImage = (image) => {
        let newValues = { ...addTopicInfo };
        const filtered = newValues?.image?.findIndex((e) => e === image);
        newValues?.image?.splice(filtered, 1);
        coverAddImageInput.current.value = '';
        setAddTopicInfo(newValues);
        URL.revokeObjectURL(image);
    }

    const removeUploadedAddTopicImage = (image, index) => {
        const imageRef = storageRef(storage, image);
        deleteObject(imageRef).then(() => {
            let newValues = { ...addTopicInfo };
            const index = newValues.image.findIndex(el => el.url === image);
            newValues.image.splice(index, 1);
            if (newValues.image?.length === 0) {
                coverAddImageInput.current.value = '';
            }
            setAddTopicInfo(newValues);
        }).catch((error) => {

        });
    }

    const uploadTopicImages = async (image, index) => {
        let blob = await fetch(image).then(r => r.blob());
        const type = blob?.type.split('/')[1];
        const path = `${`${categoryId}/${topicDetails?.topicId}/${topicDetails?.topicId}.${type}`}`;
        const imageRef = storageRef(storage, path, { contentType: blob?.type });
        setIsLoading(true);
        let newValues = { ...editTopicInfo };
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
        let newValues = { ...editTopicInfo };
        const filtered = newValues?.image?.findIndex((e) => e === image);
        newValues?.image?.splice(filtered, 1);
        coverImageInput.current.value = '';
        setEditTopicInfo(newValues);
        URL.revokeObjectURL(image);
    }

    const removeUploadedTopicImage = (image, index) => {
        const imageRef = storageRef(storage, image);
        deleteObject(imageRef).then(() => {
            let newValues = { ...editTopicInfo };
            const index = newValues.image.findIndex(el => el.url === image);
            newValues.image.splice(index, 1);
            if (newValues.image?.length === 0) {
                coverImageInput.current.value = '';
            }
            setEditTopicInfo(newValues);
        }).catch((error) => {

        });
    }

    const handleAddTopic = () => {
        setOpenAddTopicModal(true);
    }

    const handleAddTopicCloseDialog = () => {
        setOpenAddTopicModal(false);
        coverAddImageInput.current.value = '';
        setAddTopicInfo({});
    }

    const handleAddTopicConfirm = () => {
        setAddTopicPayload({ categoryId: categoryId, topicId: addTopicInfo?.id, topicName: addTopicInfo?.name, description: addTopicInfo?.desc, imageUrl: addTopicInfo?.image[0].url, displayOrder: (topicInfo?.data && topicInfo?.data?.length > 0) ? topicInfo.data.length + 1 : 1 })
        setCallAddTopic(true);
        handleAddTopicCloseDialog();
    }

    const onAddTopicSuccess = (res) => {
        setCallAddTopic(false);
        if ((res?.status === 200 || res?.status === 201)) {
            getTopics?.refetch();
            setOpenAddTopicModalInfo({ open: true, success: `Added Successfully`, error: '' });
            setAddTopicInfo({});
        } else {
            setOpenAddTopicModalInfo({ open: true, success: ``, error: res?.data?.detail ? res?.data?.detail : 'Something went wrong. Please try again later' });
            setAddTopicInfo({})
        }
    }

    const handleAddTopicClosePopup = () => {
        setOpenAddTopicModalInfo({ open: false, success: ``, error: '' })
        setAddTopicPayload({});
    }

    const handleTopicDelete = (el) => {
        deleteTopicInfo.current = el
        setOpenDeleteTopicPopup(true);
    }

    const handleDeleteTopicCloseDialog = () => {
        setOpenDeleteTopicPopup(false);
    }

    const handleDeleteTopicConfirm = () => {
        setDeleteTopicPayload({ categoryId: categoryId, topicId: deleteTopicInfo?.current?.topicId, topicName: deleteTopicInfo?.current?.topicName });
        setCallDeleteTopic(true);
        handleDeleteTopicCloseDialog();
    }

    const handleTopicImageDelete = () => {
        let image = deleteTopicInfo?.current?.imageUrl
        const imageRef = storageRef(storage, image);
        deleteObject(imageRef).then(() => {
        }).catch((error) => {
        });
    }

    const onDeleteTopicSuccess = (res) => {
        setCallDeleteTopic(false);
        if ((res?.status === 200 || res?.status === 201)) {
            getTopics?.refetch();
            handleTopicImageDelete();
            setOpenDeleteTopicModalInfo({ open: true, success: `Deleted Successfully`, error: '' });
            deleteTopicInfo.current = null;
        } else {
            setOpenDeleteTopicModalInfo({ open: true, success: ``, error: res?.data?.detail ? res?.data?.detail : 'Something went wrong. Please try again later' });
            deleteTopicInfo.current = null;
        }
    }

    const handleDeleteTopicClosePopup = () => {
        setOpenDeleteTopicModalInfo({ open: false, success: ``, error: '' })
    }


    const handleCategoryEdit = (el) => {
        setCategoryDetails(el);
        setOpenEditCategoryModal(true);
        setEditCategoryInfo({ categoryId: el?.categoryId, categoryName: el?.categoryName, description: el?.description ? el?.description : '', image: [{ url: el?.imageUrl, imageUploaded: true }], enabled: el?.enabled !== undefined ? el?.enabled : true });
    }

    const handleEditCategoryCloseDialog = () => {
        setOpenEditCategoryModal(false);
        coverEditCategoryImageInput.current.value = '';
    }

    const handleEditCategoryConfirm = () => {
        setEditCategoryPayload({ categoryId: editCategoryInfo?.categoryId, categoryName: editCategoryInfo?.categoryName, description: editCategoryInfo?.description, imageUrl: editCategoryInfo?.image[0].url, enabled: editCategoryInfo?.enabled })
        setCallEditCategory(true);
        handleEditCategoryCloseDialog();
    }

    const onEditCategorySuccess = (res) => {
        setCallEditCategory(false);
        if ((res?.status === 200 || res?.status === 201)) {
            getCategories?.refetch();
            setOpenEditCategoryModalInfo({ open: true, success: `Updated Successfully`, error: '' });
            setEditCategoryInfo({});
        } else {
            setOpenEditCategoryModalInfo({ open: true, success: ``, error: res?.data?.detail ? res?.data?.detail : 'Something went wrong. Please try again later' });
            setEditCategoryInfo({})
        }
    }

    const handleEditCategoryClosePopup = () => {
        setOpenEditCategoryModalInfo({ open: false, success: ``, error: '' })
    }

    const handleEditCategoryChange = (e) => {
        let newValues = { ...editCategoryInfo };
        if (e.target.name === 'image') {
            const selectedFiles = e.target.files;
            const selectedFilesArray = Array.from(selectedFiles);
            const imagesArray = selectedFilesArray.map((file) => {
                return { url: URL.createObjectURL(file), imageUploaded: false };
            });
            setEditCategoryInfo((prev) => ({ ...prev, image: [editCategoryInfo?.image.concat(imagesArray)] }));
            newValues[e.target.name] = imagesArray;
        } else if (e.target.id === 'enabled') {
            newValues['enabled'] = e.target.checked;
        } else {
            newValues[e.target.name] = e.target.value;
        }
        setEditCategoryInfo(newValues);
    }

    const uploadEditCategoryImages = async (image, index) => {
        let blob = await fetch(image).then(r => r.blob());
        const type = blob?.type.split('/')[1];
        const path = `${`${editCategoryInfo?.categoryId}/${categoryDetails?.categoryName}.${type}`}`;
        const imageRef = storageRef(storage, path, { contentType: blob?.type });
        setIsLoading(true);
        let newValues = { ...editCategoryInfo };
        uploadBytesResumable(imageRef, blob, { contentType: blob?.type })
            .then((snapshot) => {
                getDownloadURL(snapshot.ref)
                    .then((url) => {
                        setIsLoading(false);
                        newValues.image[index].url = url;
                        newValues.image[index].imageUploaded = true;
                        setEditCategoryInfo(newValues);
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

    const deleteEditCategoryImage = (image) => {
        let newValues = { ...editCategoryInfo };
        const filtered = newValues?.image?.findIndex((e) => e === image);
        newValues?.image?.splice(filtered, 1);
        coverEditCategoryImageInput.current.value = '';
        setEditCategoryInfo(newValues);
        URL.revokeObjectURL(image);
    }

    const removeUploadedEditCategoryImage = (image, index) => {
        const imageRef = storageRef(storage, image);
        deleteObject(imageRef).then(() => {
            let newValues = { ...editCategoryInfo };
            const index = newValues.image.findIndex(el => el.url === image);
            newValues.image.splice(index, 1);
            if (newValues.image?.length === 0) {
                coverEditCategoryImageInput.current.value = '';
            }
            setEditCategoryInfo(newValues);
        }).catch((error) => {

        });
    }

    const handleCloseDrawer = () => {
        setOpenDrawer(false);
    }

    const handleHiddenData = (type) => {
        setType(type);
        setOpenDrawer(true);
        if (type === 'categories') {
            setHiddenData(categoriesInfo?.data && categoriesInfo?.data?.filter(el => !el?.enabled))
        } else {
            setHiddenData(topicInfo?.data && topicInfo?.data?.filter(el => !el?.enabled))
        }
    }

    const handleShow = (el, type) => {
        if (type === 'category') {
            setEditCategoryPayload({ categoryId: el?.categoryId, categoryName: el?.categoryName, description: el?.description, imageUrl: el?.imageUrl, enabled: true });
            setCallEditCategory(true);
            handleCloseDrawer();
        } else {
            setEditTopicPayload({ categoryId: categoryId, topicId: el?.topicId, topicName: el?.topicName, description: el?.description, imageUrl: el?.imageUrl, enabled: true })
            setCallEditTopic(true);
            handleCloseDrawer();
        }
    }

    let getCategoriesList = useFetchAPI("GetCategoriesList", `/categories/getCategoryList`, "GET", '', CommonHeaders(), fetchQueryParams("", "", "", onCategoriesListSuccess));
    let favTopics = useFetchAPI("favTopics", `/user/getFavoriteTopics`, "GET", '', CommonHeaders(), fetchQueryParams("", "", "", onFavoriteTopicsSuccess));
    let getCategories = useFetchAPI("GetCategories", `/categories/getCategoriesFromList/${categoryType}`, "GET", '', CommonHeaders(), fetchQueryParams("", "", "", onCategoriesSuccess, "", callCategoryApi));
    let getTopics = useFetchAPI("GetTopics", `/categories/getTopics/${categoryId}`, "GET", '', CommonHeaders(), fetchQueryParams("", "", "", onTopicsSuccess, "", callTopicApi));
    let EditTopic = useFetchAPI("EditTopic", `/categories/editTopic`, "POST", editTopicPayload, CommonHeaders(), fetchQueryParams("", "", "", onEditTopicSuccess, "", callEditTopic));
    let EditCategory = useFetchAPI("EditCategory", `/categories/editCategory`, "POST", editCategoryPayload, CommonHeaders(), fetchQueryParams("", "", "", onEditCategorySuccess, "", callEditCategory));
    let AddTopic = useFetchAPI("AddTopic", `/categories/addTopic`, "POST", addTopicPayload, CommonHeaders(), fetchQueryParams("", "", "", onAddTopicSuccess, "", callAddTopic));
    let DeleteTopic = useFetchAPI("DeleteTopic", `/categories/deleteTopic`, "POST", deleteTopicPayload, CommonHeaders(), fetchQueryParams("", "", "", onDeleteTopicSuccess, "", callDeleteTopic));

    const fetching = getCategoriesList?.Loading || getCategoriesList?.Fetching || EditTopic?.Loading || EditTopic?.Fetching || AddTopic?.Loading || AddTopic?.Fetching || DeleteTopic?.Loading || DeleteTopic?.Fetching || EditCategory?.Loading || EditCategory?.Fetching;

    return (
        <>
            {(isFetching || fetching) && <Loader showLoader={fetching || isLoading} />}
            <div className={HomeStyles.body}>
                <div className={HomeStyles.imageSection}>
                    <img src={Image} alt='Image' />
                </div>
                { favoriteTopics && favoriteTopics?.length > 0 &&  <div className={HomeStyles.topics}>
                    {favoriteTopics && favoriteTopics?.length > 0 && <h4 className={HomeStyles.categoriesText}>Favorite Topics</h4>}
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
                            {(favTopics?.Loading || favTopics?.Fetching) ? <Skeleton variant="rectangular" width={'100%'} height={200} sx={{ marginBottom: 10 }} /> :
                                favoriteTopics?.length > 0 ? favoriteTopics?.map((el, index) => {
                                    if (el?.enabled) return (
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
                                                    <CancelIcon titleAccess='Remove Favorite' onClick={() => handleRemoveFavoriteEdit(el)} />
                                                    <EditIcon titleAccess='Edit Topic' className={HomeStyles.topicEditIcon} onClick={() => handleTopicEdit(el)} />
                                                    <DeleteIcon titleAccess='Delete Topic' onClick={() => handleTopicDelete(el)} />
                                                </div>
                                            </div>
                                        </SwiperSlide>
                                    )
                                }) : <></>}
                        </div>
                    </Swiper>
                </div> }
                <div className={HomeStyles.categoryList}>
                    <h4 className={HomeStyles.categoriesText}>Categories</h4>
                    <div className={HomeStyles.addCategoryBtn}>
                        <CommonButton variant="contained" bgColor={'#5b67f1'} color={'white'} padding={'0.2rem 2.6rem'} borderRadius={'8px'} fontWeight={'bold'} border={'1px solid #286ce2'} onClick={handleAddTopic}>Add Category</CommonButton>
                        { showCategoryHiddenBtn && <CommonButton variant="contained" bgColor={'#5b67f1'} color={'white'} padding={'0.2rem 2.6rem'} borderRadius={'8px'} fontWeight={'bold'} border={'1px solid #286ce2'} margin={'0px 12px'} onClick={() => handleHiddenData('categories')}>View Hidden Categories</CommonButton> }
                    </div>
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
                            {(getCategories?.Loading || getCategories?.Fetching) ? <Skeleton variant="rectangular" width={'100%'} height={120} sx={{ marginBottom: 10 }} /> :
                                categoriesInfo?.data?.length > 0 ? categoriesInfo?.data?.map((el, index) => {
                                    if (el?.enabled) return (
                                        <SwiperSlide key={el?.categoryId}>
                                            <div className={selectedCategoryIndex === index ? HomeStyles.activeCard : HomeStyles.card}>
                                                <div className={HomeStyles.cardFlex} onClick={() => handleCategoryClicked(el, index)}>
                                                    <div>
                                                        <img className={HomeStyles.card__img} src={el?.imageUrl} alt={el?.categoryName} />
                                                    </div>
                                                    <div className={HomeStyles.category_card__content}>
                                                        <h1 className={HomeStyles.card__header}>{el?.categoryName}</h1>
                                                        <h6 className={HomeStyles.categoryCard__desc}>{el?.description}</h6>
                                                    </div>
                                                </div>
                                                <div className={HomeStyles.cardIcons}>
                                                    <EditIcon titleAccess='Edit Category' className={HomeStyles.topicEditIcon} onClick={() => handleCategoryEdit(el)} />
                                                </div>
                                            </div>
                                        </SwiperSlide>
                                    )
                                }) : <><h4 className={HomeStyles.topicsError}>{categoriesInfo?.error}</h4></>}
                        </div>
                    </Swiper>
                </div>
                <div className={HomeStyles.topics}>
                    {getTopics?.data && <h4 className={HomeStyles.categoriesText}>Topics</h4>}
                    {getTopics?.data && <div className={HomeStyles.addTopicBtn}>
                        <CommonButton variant="contained" bgColor={'#5b67f1'} color={'white'} padding={'0.2rem 2.6rem'} borderRadius={'8px'} fontWeight={'bold'} border={'1px solid #286ce2'} onClick={handleAddTopic}>Add Topic</CommonButton>
                        { showTopicHiddenBtn && <CommonButton variant="contained" bgColor={'#5b67f1'} color={'white'} padding={'0.2rem 2.6rem'} borderRadius={'8px'} fontWeight={'bold'} border={'1px solid #286ce2'} margin={'0px 12px'} onClick={() => handleHiddenData('topics')}>View Hidden Topics</CommonButton> }
                    </div>}
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
                                topicInfo?.data?.length > 0 ? topicInfo?.data?.map((el, index) => {
                                    if (el?.enabled) return (
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
                                                    <FavoriteBorderIcon titleAccess='Set Favorite' onClick={() => handleFavoriteEdit(el)} />
                                                    <EditIcon titleAccess='Edit Topic' className={HomeStyles.topicEditIcon} onClick={() => handleTopicEdit(el)} />
                                                    <DeleteIcon titleAccess='Delete Topic' onClick={() => handleTopicDelete(el)} />
                                                </div>
                                            </div>
                                        </SwiperSlide>
                                    )
                                }) : <><h4 className={HomeStyles.topicsError}>{topicInfo?.error}</h4></>}
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
                            <h4 className={HomeStyles.changeToLabel}>Enabled</h4>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Typography>False</Typography>
                                <Switch name='enabled' id='enabled' checked={editTopicInfo.enabled} onChange={handleEditTopicChange} />
                                <Typography>True</Typography>
                            </Stack>
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
                                            {image?.url && <><img src={image?.url} className={HomeStyles.descriptionImage} alt="upload" />
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
                                                </div></>}
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
                        <CommonButton variant="contained" bgColor={'#5b67f1'} color={'white'} padding={'0.2rem 2.6rem'} borderRadius={'8px'} fontWeight={'bold'} border={'1px solid #286ce2'} onClick={handleEditTopicConfirm} disabled={!editTopicInfo?.name || !editTopicInfo?.desc || !editTopicInfo?.image[0]?.imageUploaded}>Edit</CommonButton>
                        <CommonButton variant="contained" bgColor={'#f8f8f8'} color={'black'} padding={'0.2rem 2.6rem'} borderRadius={'8px'} fontWeight={'bold'} border={'1px solid #ddd'} onClick={handleEditTopicCloseDialog}>Cancel</CommonButton>
                    </div>
                </div>
            </Dialog>
            <ConfirmationDialog openDialog={openEditTopicModalInfo?.open} errorMessage={openEditTopicModalInfo?.error} successMessage={openEditTopicModalInfo?.success} handleCloseDialog={handleEditTopicClosePopup} />
            <Dialog open={openEditCategoryModal} TransitionComponent={Transition} keepMounted onClose={handleEditCategoryCloseDialog} aria-describedby="alert-dialog-slide-description" fullWidth={false} maxWidth="sm" >
                <div className={HomeStyles.modalinnerwrapperTitleEdit}>
                    <div><h4 className={HomeStyles.headerText}>Edit {categoryDetails?.categoryName}</h4></div>
                    <IconButton aria-label="close" onClick={handleEditCategoryCloseDialog} sx={{ position: 'absolute', right: 8, top: 8, color: "#666" }}>
                        <CloseIcon />
                    </IconButton>
                    <DialogContent className={HomeStyles.modelContent}>
                        <div>
                            <h4 className={HomeStyles.currentLabel}>Category Name</h4>
                            <TextField
                                name='categoryName'
                                className={HomeStyles.editTopicInput}
                                value={editCategoryInfo.categoryName}
                                size="small"
                                onChange={handleEditCategoryChange}
                            />
                        </div>
                        <div className={HomeStyles.changeTo}>
                            <h4 className={HomeStyles.changeToLabel}>Category Description</h4>
                            <TextField
                                name='description'
                                multiline
                                maxRows={8}
                                className={HomeStyles.editTopicDescInput}
                                value={editCategoryInfo.description}
                                onChange={handleEditCategoryChange}
                                size="small"
                            />
                        </div>
                        <div>
                            <h4 className={HomeStyles.changeToLabel}>Enabled</h4>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Typography>False</Typography>
                                <Switch name='enabled' id='enabled' checked={editCategoryInfo.enabled} onChange={handleEditCategoryChange} />
                                <Typography>True</Typography>
                            </Stack>
                        </div>
                        <div>
                            <h4 className={HomeStyles.changeToLabel}>Cover Image</h4>
                            <input ref={coverEditCategoryImageInput} name='image' type='file' accept='.jpg,.jpeg,.png' className={HomeStyles.uploadInput} onChange={handleEditCategoryChange} />
                        </div>
                        <div className={HomeStyles.images}>
                            {editCategoryInfo?.image &&
                                editCategoryInfo?.image?.map((image, index) => {
                                    return (
                                        <div key={image} className={HomeStyles.image}>
                                            {image?.url && <><img src={image?.url} className={HomeStyles.descriptionImage} alt="upload" />
                                                <div className={HomeStyles.uploadBtnContainer}>
                                                    <div className={HomeStyles.imageUploadBtn}>
                                                        <button className={HomeStyles.uploadBtn} disabled={image?.imageUploaded} onClick={() => uploadEditCategoryImages(image?.url, index)}>{image?.imageUploaded ? 'Uploaded Successfully' : 'Upload'}</button>
                                                    </div>
                                                    <div>
                                                        {!image?.imageUploaded ? <button className={HomeStyles.imageDelete} onClick={() => deleteEditCategoryImage(image)}>
                                                            Remove
                                                        </button> : <button className={HomeStyles.imageDelete} onClick={() => removeUploadedEditCategoryImage(image?.url, index)}>
                                                            Cancel Upload
                                                        </button>}
                                                    </div>
                                                </div></>}
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
                        <CommonButton variant="contained" bgColor={'#5b67f1'} color={'white'} padding={'0.2rem 2.6rem'} borderRadius={'8px'} fontWeight={'bold'} border={'1px solid #286ce2'} onClick={handleEditCategoryConfirm} disabled={!editCategoryInfo?.categoryName || !editCategoryInfo?.description || !editCategoryInfo?.image[0]?.imageUploaded}>Edit</CommonButton>
                        <CommonButton variant="contained" bgColor={'#f8f8f8'} color={'black'} padding={'0.2rem 2.6rem'} borderRadius={'8px'} fontWeight={'bold'} border={'1px solid #ddd'} onClick={handleEditCategoryCloseDialog}>Cancel</CommonButton>
                    </div>
                </div>
            </Dialog>
            <ConfirmationDialog openDialog={openEditCategoryModalInfo?.open} errorMessage={openEditCategoryModalInfo?.error} successMessage={openEditCategoryModalInfo?.success} handleCloseDialog={handleEditCategoryClosePopup} />
            <Dialog open={openAddTopicModal} TransitionComponent={Transition} keepMounted onClose={handleAddTopicCloseDialog} aria-describedby="alert-dialog-slide-description" fullWidth={false} maxWidth="sm" >
                <div className={HomeStyles.modalinnerwrapperTitleEdit}>
                    <div><h4 className={HomeStyles.headerText}>Add New Topic</h4></div>
                    <IconButton aria-label="close" onClick={handleAddTopicCloseDialog} sx={{ position: 'absolute', right: 8, top: 8, color: "#666" }}>
                        <CloseIcon />
                    </IconButton>
                    <DialogContent className={HomeStyles.modelContent}>
                        <div>
                            <h4 className={HomeStyles.currentLabel}>Topic Id</h4>
                            <TextField
                                name='id'
                                className={HomeStyles.editTopicInput}
                                value={addTopicInfo.id}
                                size="small"
                                onChange={handleAddTopicChange}
                            />
                        </div>
                        <div>
                            <h4 className={HomeStyles.currentLabel}>Topic Name</h4>
                            <TextField
                                name='name'
                                className={HomeStyles.editTopicInput}
                                value={addTopicInfo.name}
                                size="small"
                                onChange={handleAddTopicChange}
                            />
                        </div>
                        <div className={HomeStyles.changeTo}>
                            <h4 className={HomeStyles.changeToLabel}>Topic Description</h4>
                            <TextField
                                name='desc'
                                multiline
                                maxRows={8}
                                className={HomeStyles.editTopicDescInput}
                                value={addTopicInfo.desc}
                                onChange={handleAddTopicChange}
                                size="small"
                            />
                        </div>
                        <div>
                            <h4 className={HomeStyles.changeToLabel}>Cover Image</h4>
                            <input ref={coverAddImageInput} name='image' type='file' accept='.jpg,.jpeg,.png' className={HomeStyles.uploadInput} onChange={handleAddTopicChange} />
                        </div>
                        <div className={HomeStyles.images}>
                            {addTopicInfo?.image &&
                                addTopicInfo?.image?.map((image, index) => {
                                    return (
                                        <div key={image} className={HomeStyles.image}>
                                            {image?.url && <><img src={image?.url} className={HomeStyles.descriptionImage} alt="upload" />
                                                <div className={HomeStyles.uploadBtnContainer}>
                                                    <div className={HomeStyles.imageUploadBtn}>
                                                        <button className={HomeStyles.uploadBtn} disabled={image?.imageUploaded} onClick={() => uploadAddTopicImages(image?.url, index)}>{image?.imageUploaded ? 'Uploaded Successfully' : 'Upload'}</button>
                                                    </div>
                                                    <div>
                                                        {!image?.imageUploaded ? <button className={HomeStyles.imageDelete} onClick={() => deleteAddTopicImage(image)}>
                                                            Remove
                                                        </button> : <button className={HomeStyles.imageDelete} onClick={() => removeUploadedAddTopicImage(image?.url, index)}>
                                                            Cancel Upload
                                                        </button>}
                                                    </div>
                                                </div></>}
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
                        <CommonButton variant="contained" bgColor={'#5b67f1'} color={'white'} padding={'0.2rem 2.6rem'} borderRadius={'8px'} fontWeight={'bold'} border={'1px solid #286ce2'} onClick={handleAddTopicConfirm} disabled={!addTopicInfo?.id || !addTopicInfo?.name || !addTopicInfo?.desc || !addTopicInfo?.image[0]?.imageUploaded}>Add</CommonButton>
                        <CommonButton variant="contained" bgColor={'#f8f8f8'} color={'black'} padding={'0.2rem 2.6rem'} borderRadius={'8px'} fontWeight={'bold'} border={'1px solid #ddd'} onClick={handleAddTopicCloseDialog}>Cancel</CommonButton>
                    </div>
                </div>
            </Dialog>
            <ConfirmationDialog openDialog={openAddTopicModalInfo?.open} errorMessage={openAddTopicModalInfo?.error} successMessage={openAddTopicModalInfo?.success} handleCloseDialog={handleAddTopicClosePopup} />
            <Dialog open={openDeleteTopicPopup} TransitionComponent={Transition} keepMounted onClose={handleDeleteTopicCloseDialog} aria-describedby="alert-dialog-slide-description" fullWidth={false} maxWidth="sm" >
                <div className={HomeStyles.modalinnerwrapper}>
                    <div><h4 className={HomeStyles.headerText}>Delete {deleteTopicInfo?.current?.topicName}</h4></div>
                    <IconButton aria-label="close" onClick={handleDeleteTopicCloseDialog} sx={{ position: 'absolute', right: 8, top: 8, color: "#666" }}>
                        <CloseIcon />
                    </IconButton>
                    <DialogContent>
                        Are you sure you want to delete {deleteTopicInfo?.current?.topicName}?
                    </DialogContent>
                    <div className={HomeStyles.modalactionsection}>
                        <CommonButton variant="contained" bgColor={'#5b67f1'} color={'white'} padding={'0.2rem 2.6rem'} borderRadius={'8px'} fontWeight={'bold'} border={'1px solid #286ce2'} onClick={handleDeleteTopicConfirm}>Delete</CommonButton>
                        <CommonButton variant="contained" bgColor={'#f8f8f8'} color={'black'} padding={'0.2rem 2.6rem'} borderRadius={'8px'} fontWeight={'bold'} border={'1px solid #ddd'} onClick={handleDeleteTopicCloseDialog}>Cancel</CommonButton>
                    </div>
                </div>
            </Dialog>
            <ConfirmationDialog openDialog={openDeleteTopicModalInfo?.open} errorMessage={openDeleteTopicModalInfo?.error} successMessage={openDeleteTopicModalInfo?.success} handleCloseDialog={handleDeleteTopicClosePopup} />
            <Drawer anchor={'right'} open={openDrawer} onClose={handleCloseDrawer}>
                <div className={HomeStyles.hideDataContainer}>
                    <div>
                        <h2>{type === 'categories' ? 'Hidden Categories' : 'Hidden Topics'}</h2>
                    </div>
                    <div>
                        <div className={HomeStyles.itemsContainer}>
                            {hiddenData?.length > 0 ? hiddenData?.map((el, i) => {
                                if (type === 'categories') {
                                    return (
                                        <div className={HomeStyles.elementContainer}>
                                            <h5>{el?.categoryName}</h5>
                                            <img src={el?.imageUrl} alt={el?.topicName} />
                                            <p>{el?.description}</p>
                                            <div className={HomeStyles.elementButton}>
                                                <CommonButton variant="contained" bgColor={'#5b67f1'} color={'white'} padding={'0.2rem 2.6rem'} borderRadius={'8px'} fontWeight={'bold'} border={'1px solid #286ce2'} onClick={() => handleShow(el, 'category')}>Show Category</CommonButton>
                                            </div>
                                        </div>
                                    )
                                } else {
                                    return (
                                        <div className={HomeStyles.elementContainer}>
                                            <h5>{el?.topicName}</h5>
                                            <img src={el?.imageUrl} alt={el?.topicName} />
                                            <p>{el?.description}</p>
                                            <div className={HomeStyles.elementButton}>
                                                <CommonButton variant="contained" bgColor={'#5b67f1'} color={'white'} padding={'0.2rem 2.6rem'} borderRadius={'8px'} fontWeight={'bold'} border={'1px solid #286ce2'} onClick={() => handleShow(el, 'topic')}>Show Topic</CommonButton>
                                            </div>
                                        </div>
                                    )
                                }
                            }) : <AppNoData/>}
                        </div>
                    </div>
                </div>
            </Drawer>
        </>
    )
}

export default Home