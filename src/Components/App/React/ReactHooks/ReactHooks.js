import React, { useRef, useState } from 'react'
import { useFetchAPI } from '../../../../Hooks/useAPI';
import { CommonHeaders } from '../../../../CommonComponents/CommonHeaders';
import { fetchQueryParams } from '../../../../Hooks/fetchQueryParams';
import Loader from '../../../../CommonComponents/Loader/Loader';
import ReactStyles from './ReactHooksStyles.module.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Mousewheel, Keyboard } from 'swiper/modules';
import Switch from '@mui/joy/Switch';
import Typography from '@mui/joy/Typography';
import { Alert, Dialog, DialogContent, Drawer, FormControl, Slide, TextField } from '@mui/material';
import { storage } from '../../../../firebaseConfig';
import CommonButton from '../../../../CommonComponents/CommonButton';
import CancelIcon from '@mui/icons-material/Cancel';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { getDownloadURL, ref as storageRef, uploadBytes, uploadBytesResumable, deleteObject } from "firebase/storage";


import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './ReactHooksSwiperStyles.css';
import DisplayContent from './DisplayContent';
import ConfirmationDialog from '../../../../CommonComponents/ConfirmationDialog/ConfirmationDialog';
import { useSelector } from 'react-redux';
import TopHeader from '../../../../CommonComponents/TopHeader/TopHeader';
import MainContent from '../../../../CommonComponents/MainContent/MainContent';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});


const ReactHooks = (props) => {

    const { params, locationDetails } = props;

    const appState = useSelector(state => state);

    const [hooksConceptsInfo, setHooksConceptsInfo] = useState({ data: [], error: '' });
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [contentData, setContentData] = useState({});
    const [openDrawer, setOpenDrawer] = useState(false);
    const [addConceptTitle, setAddConceptTitle] = useState("");
    const [addConceptPayload, setAddConceptPayload] = useState({});
    const [addConceptApi, setAddConceptApi] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [description, setDescription] = useState([
        { id: 1, header: '', data: '', snippet: [], imageUploaded: false, hasPoints: false, pointsData: [], hasTable: false, tableColumns: [], tableData: [] }
    ])
    const descInputRef = useRef([]);
    const descPointsInputRef = useRef([]);
    const deleteConceptTitle = useRef('');
    const deleteConceptInfo = useRef();
    const editConceptInfo = useRef();
    const [errorMessage, setErrorMessage] = useState("");
    const [openPopup, setOpenPopup] = useState(false);
    const [openConfirmationPopup, setOpenConfirmationPopup] = useState(false);
    const [openEditTitleModal, setOpenEditTitleModal] = useState(false);
    const [deleteConceptPayload, setDeleteConceptPayload] = useState({});
    const [callDeleteConceptApi, setCallDeleteConceptApi] = useState(false);
    const [openEditModalInfo, setOpenEditModalInfo] = useState({ open: false, success: '', error: '' });
    const [openDeleteModalInfo, setOpenDeleteModalInfo] = useState({ open: false, success: '', error: '' });
    const [editTitle, setEditTitle] = useState('');
    const [callEditConcept, setCallEditConcept] = useState(false);
    const [editConceptPayload, setEditConceptPayload] = useState({});


    const onHooksSuccess = res => {
        setHooksConceptsInfo({ data: [], error: '' });
        if ((res?.status === 200 || res?.status === 201)) {
            setHooksConceptsInfo({ data: res?.data?.concepts, error: '' });
            setContentData(res?.data?.concepts[0]);
            setSelectedIndex(0);
        } else {
            setHooksConceptsInfo({ data: [], error: res?.data?.detail ? res?.data?.detail : 'Something went wrong. Please try again later' });
        }
    }

    const handleContentClick = (el, index) => {
        setSelectedIndex(index);
        setContentData(el);
    }

    const toggleDrawer = () => {
        setOpenDrawer(true);
    }

    const handleCloseDrawer = () => {
        setOpenDrawer(false);
    }

    const handleTitleChange = (event) => {
        setAddConceptTitle(event.target.value);
    }

    const handleDescriptionChange = (i, e) => {
        let newValues = [...description];
        if (e.target.name === 'snippet') {
            const selectedFiles = e.target.files;
            const selectedFilesArray = Array.from(selectedFiles);
            const imagesArray = selectedFilesArray.map((file) => {
                return { url: URL.createObjectURL(file), imageUploaded: false };
            });
            setDescription((prev) => ({ ...prev, snippet: [description[i]?.snippet.concat(imagesArray)] }));
            newValues[i][e.target.name] = imagesArray;
        } else if (e.target.type === 'checkbox') {
            if (e.target.id === 'points') {
                newValues[i]['hasPoints'] = e.target.checked;
                if (newValues[i]['hasPoints']) {
                    newValues[i]['pointsData'].push({ id: 1, value: '', snippet: [] });
                } else {
                    newValues[i]['pointsData'] = []
                }
            } else if (e.target.id === 'table') {
                newValues[i]['hasTable'] = e.target.checked;
                if (newValues[i]['hasTable']) {
                    newValues[i]['tableColumns'].push({ value: '' }, { value: '' });
                    newValues[i]['tableData'].push({ value1: '', value2: '' });
                } else {
                    newValues[i]['noOfColumns'] = 0;
                    newValues[i]['tableColumns'] = [];
                    newValues[i]['tableData'] = [];
                }
            }
        } else if (e.target.name === 'noOfColumns') {
            newValues[i]['noOfColumns'] = parseInt(e.target.value);
        }
        else {
            newValues[i][e.target.name] = e.target.value;
        }
        setDescription(newValues);
    }

    const handlePointsChange = (idx, e, i) => {
        let pointsValues = [...description[i].pointsData];
        if (e.target.name === 'snippet') {
            const selectedFiles = e.target.files;
            const selectedFilesArray = Array.from(selectedFiles);
            const imagesArray = selectedFilesArray.map((file) => {
                return { url: URL.createObjectURL(file), imageUploaded: false };
            });
            setDescription(prev => {
                return [...prev.slice(0, i), { ...prev[i], pointsData: { ...description[i].pointsData[idx], snippet: [description[i]?.pointsData[idx]?.snippet.concat(imagesArray)] } }, ...prev.slice(i + 1)]
            })
            pointsValues[idx][e.target.name] = imagesArray;
        } else {
            pointsValues[idx][e.target.name] = e.target.value;
        }
        setDescription(prev => {
            return [...prev.slice(0, i), { ...prev[i], pointsData: pointsValues }, ...prev.slice(i + 1)]
        })
    }

    const deleteImage = (i, image) => {
        let newValues = [...description];
        const filtered = newValues[i]?.snippet?.findIndex((e) => e === image);
        newValues[i]?.snippet?.splice(filtered, 1);
        descInputRef.current[i].value = '';
        setDescription(newValues);
        URL.revokeObjectURL(image);
    }

    const deletePointsImage = (i, image, index) => {
        let pointsValues = [...description[i].pointsData];
        const filtered = pointsValues[index]?.snippet?.findIndex((e) => e === image);
        pointsValues[index]?.snippet?.splice(filtered, 1);
        descPointsInputRef.current[index].value = '';
        setDescription(prev => {
            return [...prev.slice(0, i), { ...prev[i], pointsData: pointsValues }, ...prev.slice(i + 1)]
        })
        URL.revokeObjectURL(image);
    }

    const addAnotherDescription = () => {
        setDescription([...description, { id: description?.length + 1, data: "", snippet: [], imageUploaded: false, hasPoints: false, pointsData: [], hasTable: false, tableColumns: [], tableData: [] }])
    }

    const addAnotherPoint = (i) => {
        setDescription(prev => {
            return [...prev.slice(0, i), { ...prev[i], pointsData: [...prev[i].pointsData, { id: description[i]?.pointsData?.length + 1, value: '', snippet: [], imageUploaded: false }] }, ...prev.slice(i + 1)]
        })
    }

    const removeDescription = (i) => {
        let newValues = [...description];
        if (newValues[i]?.snippet?.length > 0) {
            if (newValues[i]?.imageUploaded) {
                newValues[i]?.snippet.forEach((image) => {
                    removeUploadedImage(i, image);
                });
            }
        }
        newValues.splice(i, 1);
        setDescription(newValues);
    }

    const removePoint = (idx, i) => {
        let pointsValues = [...description[i].pointsData];
        pointsValues.splice(idx);
        setDescription(prev => {
            return [...prev.slice(0, i), { ...prev[i], pointsData: pointsValues }, ...prev.slice(i + 1)]
        })
    }

    const removeRow = (idx, i) => {
        let rowValues = [...description[i].tableData];
        rowValues.splice(idx);
        setDescription(prev => {
            return [...prev.slice(0, i), { ...prev[i], tableData: rowValues }, ...prev.slice(i + 1)]
        })
    }

    let urls = [];
    const uploadImageToFireStore = async (img, i, index) => {
        let blob = await fetch(img).then(r => r.blob());
        const type = blob?.type.split('/')[1];
        const path = `${`React/ReactHooks/${addConceptTitle}/section1/description${description[i].id}/snippets/image${index + 1}.${type}`}`;
        const imageRef = storageRef(storage, path, { contentType: blob?.type });
        setIsLoading(true);
        let newValues = [...description];
        uploadBytesResumable(imageRef, blob, { contentType: blob?.type })
            .then((snapshot) => {
                getDownloadURL(snapshot.ref)
                    .then((url) => {
                        setIsLoading(false);
                        urls.push(url)
                        newValues[i].snippet[index].url = url;
                        newValues[i].snippet[index].imageUploaded = true;
                        setDescription(newValues);
                        return url;
                    })
                    .catch((error) => {
                        setIsLoading(false);
                        newValues[i].snippet[index].imageUploadedSuccess = false;
                    });
            })
            .catch((error) => {
                setIsLoading(false);
                newValues[i].snippet[index].imageUploadedSuccess = false;
            });
    }

    const uploadImages = async (i, url, imageIndex) => {
        await uploadImageToFireStore(url, i, imageIndex)
    }

    let pointsUrls = [];
    const uploadPointsImageToFireStore = async (img, i, index, idx) => {
        let blob = await fetch(img).then(r => r.blob());
        const type = blob?.type.split('/')[1];
        const path = `${`React/ReactHooks/${addConceptTitle}/section1/description${description[i].id}/point${description[i].pointsData[idx].id}/snippets/image${index + 1}.${type}`}`;
        const imageRef = storageRef(storage, path, { contentType: blob?.type });
        setIsLoading(true);
        let pointsValues = [...description[i]?.pointsData];
        uploadBytesResumable(imageRef, blob, { contentType: blob?.type })
            .then((snapshot) => {
                getDownloadURL(snapshot.ref)
                    .then((url) => {
                        setIsLoading(false);
                        pointsUrls.push(url)
                        pointsValues[idx].snippet[index].url = url;
                        pointsValues[idx].snippet[index].imageUploaded = true;
                        setDescription(prev => {
                            return [...prev.slice(0, i), { ...prev[i], pointsData: pointsValues }, ...prev.slice(i + 1)]
                        })
                        return url;
                    })
                    .catch((error) => {
                        setIsLoading(false);
                        pointsValues[idx].snippet[index].imageUploadedSuccess = false;
                    });
            })
            .catch((error) => {
                setIsLoading(false);
                pointsValues[idx].snippet[index].imageUploadedSuccess = false;
            });
    }

    const uploadPointsImages = async (idx, i, url, index) => {
        await uploadPointsImageToFireStore(url, i, index, idx);
    }

    const removeUploadedImage = async (i, image) => {
        const imageRef = storageRef(storage, image);
        deleteObject(imageRef).then(() => {
            let newValues = [...description];
            const index = newValues[i].snippet.findIndex(el => el.url === image);
            newValues[i].snippet.splice(index, 1);
            if (newValues[i].snippet?.length === 0) {
                descInputRef.current[i].value = '';
            }
            setDescription(newValues);
        }).catch((error) => {

        });
    }

    const removeUploadedPointsImage = async (i, image, idx) => {
        const imageRef = storageRef(storage, image);
        deleteObject(imageRef).then(() => {
            let pointsValues = [...description[i].pointsData];
            const index = pointsValues[idx].snippet.findIndex(el => el.url === image);
            pointsValues[idx].snippet.splice(index, 1);
            if (pointsValues[idx].snippet?.length === 0) {
                descPointsInputRef.current[idx].value = '';
            }
            setDescription(prev => {
                return [...prev.slice(0, i), { ...prev[i], pointsData: pointsValues }, ...prev.slice(i + 1)]
            })
        }).catch((error) => {

        });
    }

    const handleTableChange = (index, e, i) => {
        let tableValues = [...description[i].tableColumns];
        tableValues[index][e.target.name] = e.target.value;
        setDescription(prev => {
            return [...prev.slice(0, i), { ...prev[i], tableColumns: tableValues }, ...prev.slice(i + 1)]
        })
    }

    const handleTableDataChange = (index, e, i) => {
        let tableDataValues = [...description[i].tableData];
        tableDataValues[index][e.target.name] = e.target.value;
        setDescription(prev => {
            return [...prev.slice(0, i), { ...prev[i], tableData: tableDataValues }, ...prev.slice(i + 1)]
        })
    }

    const addAnotherRow = (i) => {
        setDescription(prev => {
            return [...prev.slice(0, i), { ...prev[i], tableData: [...prev[i].tableData, { value1: '', value2: '' }] }, ...prev.slice(i + 1)]
        })
    }

    const handleAddConcept = () => {
        const payload = {};
        let payloadData = [{ description: [], sectionId: 1 }];
        payload.categoryId = params?.categoryId;
        payload.topicId = locationDetails?.state?.topicDetails?.topicId;
        payload.id = hooksConceptsInfo?.data?.length + 1;
        payload.title = addConceptTitle;
        payloadData[0].description = description;
        payload.data = payloadData;
        setAddConceptPayload(payload);
        setAddConceptApi(true);
    }

    const onAddConceptSuccess = (res) => {
        setAddConceptApi(false);
        setErrorMessage('')
        if ((res?.status === 200 || res?.status === 201)) {
            setErrorMessage('');
            GetHooks?.refetch();
            setSelectedIndex(contentData.id - 1);
            setOpenPopup(true);
        } else {
            setErrorMessage(res?.data?.detail ? res?.data?.detail : 'Something went wrong. Please try again later');
            setOpenPopup(true);
        }
    }

    const handleCloseDialog = () => {
        setOpenPopup(false);
        handleCloseDrawer();
        window.scroll(0, 0);
    }

    const removeConceptUploadedImage = (image) => {
        const imageRef = storageRef(storage, image);
        deleteObject(imageRef).then(() => { }).then(err => { })
    }

    const handleDeleteConceptImages = (info) => {
        info.data.forEach(el => {
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
            GetHooks?.refetch();
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
            GetHooks?.refetch();
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

    let GetHooks = useFetchAPI("GetHooks", `/concepts/getConcepts/${params?.topicId}/${params?.categoryId}`, "GET", '', CommonHeaders(), fetchQueryParams("", "", "", onHooksSuccess));
    let AddConcept = useFetchAPI("AddConcept", `/concepts/addConcepts`, "POST", addConceptPayload, CommonHeaders(), fetchQueryParams("", "", "", onAddConceptSuccess, "", addConceptApi));
    let DeleteConcept = useFetchAPI("DeleteConcept", `/concepts/deleteConcept`, "POST", deleteConceptPayload, CommonHeaders(), fetchQueryParams("", "", "", onDeleteConceptSuccess, "", callDeleteConceptApi));
    let EditConcept = useFetchAPI("EditConcept", `/concepts/editConcept`, "POST", editConceptPayload, CommonHeaders(), fetchQueryParams("", "", "", onEditConceptSuccess, "", callEditConcept));

    const fetching = GetHooks?.Loading || GetHooks?.Fetching || AddConcept?.Loading || AddConcept?.Fetching || DeleteConcept?.Loading || DeleteConcept?.Fetching || EditConcept?.Loading || EditConcept?.Fetching;

    return (
        <>
            <TopHeader params={params} locationDetails={locationDetails} />
            <MainContent params={params} locationDetails={locationDetails} />
        </>
    )
}

export default ReactHooks