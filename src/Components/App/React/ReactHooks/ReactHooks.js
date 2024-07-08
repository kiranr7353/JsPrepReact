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
import { Drawer, FormControl, TextField } from '@mui/material';
import { storage } from '../../../../firebaseConfig';
import CommonButton from '../../../../CommonComponents/CommonButton';
import CancelIcon from '@mui/icons-material/Cancel';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { getDownloadURL, ref as storageRef, uploadBytes, uploadBytesResumable, deleteObject } from "firebase/storage";


import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './ReactHooksSwiperStyles.css';


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
        { id: 1, header: '', data: '', snippet: [], imageUploaded: false, hasPoints: false, pointsData: [], hasTable: false, tableCoumns: [], tableData: [], noOfColumns: 0 }
    ])
    const descInputRef = useRef([]);
    const descPointsInputRef = useRef([]);

    // console.log(locationDetails, 'locationDetails');

    const onHooksSucess = res => {
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
        } else if (e.target.type === 'checkbox') {
            if (e.target.id === 'points') {
                newValues[i]['hasPoints'] = e.target.checked;
                if (newValues[i]['hasPoints']) {
                    newValues[i]['pointsData'].push({ id: 1, value: '', snippet: [], imageUploaded: false });
                } else {
                    newValues[i]['pointsData'] = []
                }
            } else if (e.target.id === 'table') {
                newValues[i]['hasTable'] = e.target.checked;
                // if (newValues[i]['hasTable']) {
                //     newValues[i]['tableCoumns'].push([]);
                // } else {
                //     newValues[i]['tableCoumns'] = []
                // }
            }
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
                return URL.createObjectURL(file);
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
        setDescription([...description, { id: description?.length + 1, data: "", snippet: [], imageUploaded: false, hasPoints: false, pointsData: [], hasTable: false, tableCoumns: [], tableData: [], noOfColumns: 0 }])
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

    let urls = [];
    const uploadImageToFireStore = async (img, i, index) => {
        let blob = await fetch(img).then(r => r.blob());
        const type = blob?.type.split('/')[1];
        const path = `${`React/ReactHooks/${addConceptTitle}/section1/description${description[i].id}/snippets/image${index + 1}.${type}`}`;
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

    let pointsUrls = [];
    const uploadPointsImageToFireStore = async (img, i, index, idx) => {
        let blob = await fetch(img).then(r => r.blob());
        const type = blob?.type.split('/')[1];
        const path = `${`React/ReactHooks/${addConceptTitle}/section1/description${description[i].id}/point${description[i].pointsData[idx].id}/snippets/image${index + 1}.${type}`}`;
        const imageRef = storageRef(storage, path, { contentType: blob?.type });
        setIsLoading(true);
        uploadBytesResumable(imageRef, blob, { contentType: blob?.type })
            .then((snapshot) => {
                getDownloadURL(snapshot.ref)
                    .then((url) => {
                        setIsLoading(false);
                        let pointsValues = [...description[i]?.pointsData];
                        pointsUrls.push(url)
                        pointsValues[idx].snippet = pointsUrls;
                        pointsValues[idx].imageUploaded = true;
                        setDescription(prev => {
                            return [...prev.slice(0, i), { ...prev[i], pointsData: pointsValues }, ...prev.slice(i + 1)]
                        })
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

    const uploadPointsImages = (idx, i) => {
        description[i]?.pointsData[idx]?.snippet?.forEach(async (el, index) => {
            await uploadPointsImageToFireStore(el, i, index, idx)
        })
    }

    const removeUploadedImage = async (i, image) => {
        const imageRef = storageRef(storage, image);
        deleteObject(imageRef).then(() => {
            let newValues = [...description];
            const index = newValues[i].snippet.findIndex(el => el === image);
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
            const index = pointsValues[idx].snippet.findIndex(el => el === image);
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

    // const data = [
    //     { sectionId:1, description: [{ id: 1, header:'', data:"", codeSnippets: [], hasTable: true, tableColumn: [], tableData: [], hasPoints: true, pointsData: [{},{}] },{},{}] }
    // ]

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
                                                className={ReactStyles.headerInput}
                                                name='header'
                                                value={el?.header || ""}
                                                onChange={(e) => handleDescriptionChange(i, e)}
                                                InputProps={{
                                                    type: 'text',
                                                }}
                                                sx={{ input: { "&::placeholder": { opacity: 0.9 } } }}
                                                placeholder={"Enter Header"} size="large"
                                            />
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
                                            <div className={ReactStyles.points}>
                                                <Typography component="label" endDecorator={<Switch sx={{ ml: 1, mt: 1 }} id='points' name='hasPoints' checked={el?.hasPoints} onChange={(e) => handleDescriptionChange(i, e)} />}>
                                                    Add Points
                                                </Typography>
                                                {description[i]?.hasPoints &&
                                                    <>
                                                        {description[i]?.pointsData?.map((point, idx) => (
                                                            <>
                                                                <div className={ReactStyles.pointsDiv}>
                                                                    {idx ? <HighlightOffIcon titleAccess='Remove' className={ReactStyles.removeIconPoint} onClick={() => removePoint(idx, i)} /> : null}
                                                                    <h4>Point {idx + 1}</h4>
                                                                    <label>Enter Point</label>
                                                                    <TextField
                                                                        className={ReactStyles.pointsInput}
                                                                        name='value'
                                                                        value={point?.value || ""}
                                                                        onChange={(e) => handlePointsChange(idx, e, i)}
                                                                        InputProps={{
                                                                            type: 'text',
                                                                        }}
                                                                        sx={{ input: { "&::placeholder": { opacity: 0.9 } } }}
                                                                        placeholder={"Enter Value"} size="large"
                                                                    />
                                                                    <div>
                                                                        <label className={`btn btn-primary ${ReactStyles.DocUpload}`}>Upload Code Snippet(s)</label>
                                                                        <input ref={el => descPointsInputRef.current[idx] = el} name='snippet' type='file' accept='.jpg,.jpeg,.png' multiple className={ReactStyles.uploadInput} onChange={(e) => handlePointsChange(idx, e, i)} />
                                                                        {description[i]?.pointsData[idx]?.snippet?.length > 0 &&
                                                                            (description[i]?.pointsData[idx]?.snippet?.length > 10 ? (
                                                                                <p className="error">
                                                                                    You can't upload more than 10 images! <br />
                                                                                    <span>
                                                                                        please delete <b> {description[i]?.pointsData[idx]?.snippet.length - 10} </b> of them{" "}
                                                                                    </span>
                                                                                </p>
                                                                            ) : (
                                                                                <button className={ReactStyles.uploadBtn} disabled={description[i]?.pointsData[idx]?.imageUploaded} onClick={() => uploadPointsImages(idx, i)}>
                                                                                    {description[i]?.pointsData[idx]?.imageUploaded ? 'Uploaded' : 'Upload'} {description[i]?.pointsData[idx]?.snippet?.length} Image
                                                                                    {description[i]?.pointsData[idx]?.snippet?.length === 1 ? "" : "s"}
                                                                                </button>
                                                                            ))}
                                                                        <div className={ReactStyles.images}>
                                                                            {description[i]?.pointsData[idx]?.snippet &&
                                                                                description[i]?.pointsData[idx]?.snippet?.map((image, index) => {
                                                                                    return (
                                                                                        <div key={image} className={ReactStyles.image}>
                                                                                            <img src={image} className={ReactStyles.descriptionImage} alt="upload" />
                                                                                            {!description[i]?.pointsData[idx]?.imageUploaded ? <button className={ReactStyles.imageDelete} onClick={() => deletePointsImage(i, image, idx)}>
                                                                                                Delete
                                                                                            </button> : <button className={ReactStyles.imageDelete} onClick={() => removeUploadedPointsImage(i, image, idx)}>
                                                                                                Remove
                                                                                            </button>}
                                                                                        </div>
                                                                                    );
                                                                                })}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </>
                                                        ))}
                                                        <h6 className={ReactStyles.anotherDescription}><u onClick={() => addAnotherPoint(i)}>Add Another Point</u></h6>
                                                    </>}
                                            </div>
                                            <div className={ReactStyles.table}>
                                                <Typography component="label" endDecorator={<Switch sx={{ ml: 1, mt: 1 }} id='table' name='hasTable' checked={el?.hasTable} onChange={(e) => handleDescriptionChange(i, e)} />}>
                                                    Add Table
                                                </Typography>
                                                {description[i].hasTable ?
                                                    <>
                                                        <div className={ReactStyles.noOfColumns}>
                                                            <div>
                                                                <TextField
                                                                    className={ReactStyles.headerInput}
                                                                    name='noOfColumns'
                                                                    value={el?.noOfColumns || ""}
                                                                    onChange={(e) => handleDescriptionChange(i, e)}
                                                                    InputProps={{
                                                                        type: 'text',
                                                                    }}
                                                                    sx={{ input: { "&::placeholder": { opacity: 0.9 } } }}
                                                                    placeholder={"Enter Number of Columns"} size="large"
                                                                />
                                                            </div>
                                                            <div>
                                                                <CommonButton variant="contained" bgColor={'#5b67f1'} color={'white'} padding={'15px'} borderRadius={'5px'} fontWeight={'bold'} width={'100%'} height={'45px'} disabled={!description[i]?.noOfColumns}>Ok</CommonButton>
                                                            </div>
                                                        </div>
                                                    </> : null}
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