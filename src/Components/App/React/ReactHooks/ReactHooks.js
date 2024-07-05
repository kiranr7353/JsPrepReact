import React, { useRef, useState } from 'react'
import { useFetchAPI } from '../../../../Hooks/useAPI';
import { CommonHeaders } from '../../../../CommonComponents/CommonHeaders';
import { fetchQueryParams } from '../../../../Hooks/fetchQueryParams';
import Loader from '../../../../CommonComponents/Loader/Loader';
import ReactStyles from './ReactHooksStyles.module.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Mousewheel, Keyboard } from 'swiper/modules';
import CommonButton from '../../../../CommonComponents/CommonButton';
import CancelIcon from '@mui/icons-material/Cancel';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { getDownloadURL, ref as storageRef, uploadBytes, uploadBytesResumable, deleteObject } from "firebase/storage";


import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './ReactHooksSwiperStyles.css';
import { Drawer, FormControl, TextField } from '@mui/material';
import { storage } from '../../../../firebaseConfig';

const ReactHooks = (props) => {

    const { params, locationDetails } = props;

    const [hooksConceptsInfo, setHooksConceptsInfo] = useState({ data: [], error: '' });
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [contentData, setContentData] = useState({});
    const [openDrawer, setOpenDrawer] = useState(false);
    const [addConceptTitle, setAddConceptTitle] = useState("");
    const [descriptionImageUploaded, setDescriptionImageUploaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [description, setDescription] = useState([
        { id: 1, data: '', snippet: [], imageUploaded: false }
    ])
    const descInputRef = useRef([]);

    console.log(locationDetails, 'locationDetails');

    const onHooksSucess = res => {
        console.log(res);
        setHooksConceptsInfo({ data: [], error: '' });
        if ((res?.status === 200 || res?.status === 201)) {
            setHooksConceptsInfo({ data: res?.data?.concepts, error: '' });
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
                return URL.createObjectURL(file);
            });

            setDescription((prev) => ({ ...prev, snippet: [description[i]?.snippet.concat(imagesArray)] }));

            newValues[i][e.target.name] = imagesArray;
        } else {
            newValues[i][e.target.name] = e.target.value;
        }
        setDescription(newValues);
    }

    const deleteImage = (i, image) => {
        let newValues = [...description];
        const filtered = newValues[i]?.snippet?.findIndex((e) => e === image);
        newValues[i]?.snippet?.splice(filtered, 1);
        descInputRef.current[i].value = '';
        setDescription(newValues);
        URL.revokeObjectURL(image);
    }

    const addAnotherDescription = () => {
        setDescription([...description, { id: description?.length + 1, data: "", snippet: [] }])
    }

    const removeDescription = (i) => {
        let newValues = [...description];
        if(newValues[i]?.snippet?.length > 0) {
            if(newValues[i]?.imageUploaded) {
                newValues[i]?.snippet.forEach((image) => {
                    removeUploadedImage(i, image);
                });
            }
        }
        newValues.splice(i, 1);
        setDescription(newValues);
    }


    let urls = [];
    const uploadImageToFireStore = async (img, i, index) => {
        let blob = await fetch(img).then(r => r.blob());
        const type = blob?.type.split('/')[1];
        const path = `${`React/ReactHooks/${addConceptTitle}/description${description[i].id}/snippets/image${index + 1}.${type}`}`;
        const imageRef = storageRef(storage, path, { contentType: blob?.type });
        setIsLoading(true);
        uploadBytesResumable(imageRef, blob, { contentType: blob?.type })
            .then((snapshot) => {
                getDownloadURL(snapshot.ref)
                    .then((url) => {
                        setIsLoading(false);
                        let newValues = [...description];
                        urls.push(url)
                        newValues[i].snippet = urls;
                        newValues[i].imageUploaded = true;
                        setDescription(newValues);
                        return url;
                    })
                    .catch((error) => {
                        setIsLoading(false);
                    });
            })
            .catch((error) => {
                setIsLoading(false);
            });
    }

    const uploadImages = (i) => {
        description[i].snippet?.forEach(async (el, index) => {
            await uploadImageToFireStore(el, i, index)
        })
    }

    const removeUploadedImage = async (i, image) => {
        const imageRef = storageRef(storage, image);
        deleteObject(imageRef).then(() => {
            let newValues = [...description];
            const index = newValues[i].snippet.findIndex(el => el === image);
            newValues[i].snippet.splice(index, 1);
            if(newValues[i].snippet?.length === 0) {
                descInputRef.current[i].value = '';
            }
            setDescription(newValues);
        }).catch((error) => {

        });
    }

    let GetHooks = useFetchAPI("GetHooks", `/concepts/getConcepts/${params?.topicId}/${params?.categoryId}`, "GET", '', CommonHeaders(), fetchQueryParams("", "", "", onHooksSucess));

    const fetching = GetHooks?.Loading || GetHooks?.Fetching;

    console.log(description);

    return (
        <>
            {(fetching || isLoading) && <Loader showLoader={fetching} />}
            <div className={ReactStyles.banner}>
                <div className={ReactStyles.body}>
                    <div className={ReactStyles.contentFlex}>
                        <div className={ReactStyles.content}>
                            <h4 className={ReactStyles.contentHeader}>{locationDetails?.state?.topicDetails?.topicName}</h4>
                            <h5 className={ReactStyles.contentDescription}>{locationDetails?.state?.topicDetails?.description}</h5>
                        </div>
                        <div className={ReactStyles.image}>
                            <img className={ReactStyles.topicImage} src={locationDetails?.state?.topicDetails?.imageUrl} alt={locationDetails?.state?.topicDetails?.topicName} />
                        </div>
                    </div>
                    <div className={ReactStyles.addConceptsBtn}>
                        <CommonButton variant="contained" bgColor={'#5b67f1'} color={'white'} padding={'15px'} borderRadius={'5px'} fontWeight={'bold'} width={'100%'} height={'45px'} marign={'20px 0 0 0'} onClick={toggleDrawer}>Add Concept</CommonButton>
                    </div>
                    <div className={ReactStyles.concepts}>
                        <Swiper
                            slidesPerView={6}
                            spaceBetween={10}
                            cssMode={true}
                            navigation={true}
                            mousewheel={true}
                            keyboard={true}
                            modules={[Navigation, Mousewheel, Keyboard]}
                            className="mySwiper"
                        >
                            <div className={ReactStyles.grid}>
                                {
                                    hooksConceptsInfo?.data?.length > 0 ? hooksConceptsInfo?.data?.map((el, index) => (
                                        <SwiperSlide key={el?.title}>
                                            <div className={selectedIndex === index ? ReactStyles.topicCardActive : ReactStyles.topicCard} onClick={() => handleContentClick(el, index)}>
                                                <div className={ReactStyles.topicCardFlex}>
                                                    <div className={ReactStyles.card__content}>
                                                        <h1 className={selectedIndex === index ? ReactStyles.topicCard__headerActive : ReactStyles.topicCard__header}>{el?.title}</h1>
                                                        <div className={ReactStyles.card__textWrapper}>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </SwiperSlide>
                                    )) : <><h4 className={ReactStyles.topicsError}>{hooksConceptsInfo?.error}</h4></>}
                            </div>
                        </Swiper>
                        {contentData?.title && <div className={ReactStyles.conceptContent}>
                            <h4 className={ReactStyles.contentTitle}>{contentData?.title}</h4>
                        </div>}
                    </div>
                </div>
            </div>
            <Drawer anchor={'right'} open={openDrawer} onClose={handleCloseDrawer}>
                <div className={ReactStyles.addConceptContainer}>
                    <div className={ReactStyles.addConceptTitle}>
                        <div>
                            <h2>Add Concept</h2>
                        </div>
                        <div>
                            <CancelIcon onClick={handleCloseDrawer} />
                        </div>
                    </div>
                    <div className={ReactStyles.addConceptForm}>
                        <div className={ReactStyles.conceptTitle}>
                            <FormControl sx={{ width: '100%' }}>
                                <label>Title <span className={ReactStyles.required}>*</span></label>
                                <TextField
                                    name='title'
                                    value={addConceptTitle}
                                    onChange={handleTitleChange}
                                    InputProps={{
                                        type: 'text',
                                    }}
                                    sx={{ input: { "&::placeholder": { opacity: 0.9 } } }}
                                    placeholder={"Enter Concept Title"} size="large"
                                />
                            </FormControl>
                        </div>
                        <div className={ReactStyles.conceptDescription}>
                            <FormControl sx={{ width: '100%' }}>
                                <label>Description <span className={ReactStyles.required}>*</span></label>
                                {description?.map((el, i) => (
                                    <div className={ReactStyles.descriptionFlex}>
                                        <div className={ReactStyles.descriptionDiv}>
                                            <TextField
                                                name='data'
                                                value={el?.data || ""}
                                                onChange={(e) => handleDescriptionChange(i, e)}
                                                InputProps={{
                                                    type: 'text',
                                                }}
                                                sx={{ input: { "&::placeholder": { opacity: 0.9 } } }}
                                                placeholder={"Enter Description"} size="large"
                                            />
                                            <label className={`btn btn-primary ${ReactStyles.DocUpload}`}>Upload Code Snippet(s)</label>
                                            <input ref={el => descInputRef.current[i] = el} name='snippet' type='file' accept='.jpg,.jpeg,.png' multiple className={ReactStyles.uploadInput} onChange={(e) => handleDescriptionChange(i, e)} />
                                            {description[i]?.snippet?.length > 0 &&
                                                (description[i]?.snippet?.length > 10 ? (
                                                    <p className="error">
                                                        You can't upload more than 10 images! <br />
                                                        <span>
                                                            please delete <b> {description[i]?.snippet.length - 10} </b> of them{" "}
                                                        </span>
                                                    </p>
                                                ) : (
                                                    <button className={ReactStyles.uploadBtn} disabled={description[i]?.imageUploaded} onClick={() => uploadImages(i)}>
                                                        {description[i]?.imageUploaded ? 'Uploaded' : 'Upload'} {description[i]?.snippet?.length} Image
                                                        {description[i]?.snippet?.length === 1 ? "" : "s"}
                                                    </button>
                                                ))}
                                            <div className={ReactStyles.images}>
                                                {description[i]?.snippet &&
                                                    description[i]?.snippet?.map((image, index) => {
                                                        return (
                                                            <div key={image} className={ReactStyles.image}>
                                                                <img src={image} className={ReactStyles.descriptionImage} alt="upload" />
                                                                {!description[i]?.imageUploaded ? <button className={ReactStyles.imageDelete} onClick={() => deleteImage(i, image)}>
                                                                    Delete
                                                                </button> : <button className={ReactStyles.imageDelete} onClick={() => removeUploadedImage(i, image)}>
                                                                    Remove
                                                                </button>}
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        </div>

                                        <div className={ReactStyles.remove}>
                                            {
                                                i ?
                                                    <HighlightOffIcon titleAccess='Remove' className={ReactStyles.removeIcon} onClick={() => removeDescription(i)} />
                                                    : null
                                            }
                                        </div>
                                    </div>
                                ))}
                                <h6 className={ReactStyles.anotherDescription}><u onClick={addAnotherDescription}>Add Another Description</u></h6>
                            </FormControl>
                        </div>
                    </div>
                </div>
            </Drawer>
        </>
    )
}

export default ReactHooks