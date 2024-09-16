import React, { useEffect, useRef, useState } from 'react'
import AddConceptStyles from './AddConceptStyles.module.css';
import CommonButton from '../CommonButton';
import { Alert, Dialog, DialogContent, Drawer, FormControl, Slide, Switch, TextField, Typography } from '@mui/material';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import CancelIcon from '@mui/icons-material/Cancel';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { getDownloadURL, ref as storageRef, uploadBytesResumable, deleteObject } from "firebase/storage";
import { storage } from '../../firebaseConfig';
import { CommonHeaders } from '../CommonHeaders';
import { fetchQueryParams } from '../../Hooks/fetchQueryParams';
import { useFetchAPI } from '../../Hooks/useAPI';
import Loader from '../Loader/Loader';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const AddConcept = (props) => {

    const { params, locationDetails, setAddConceptClick, conceptsInfo, getConcepts, contentData, setSelectedIndex } = props

    const [addConceptTitle, setAddConceptTitle] = useState("");
    const [description, setDescription] = useState([
        { id: 1, header: '', data: '', snippet: [], imageUploaded: false, hasPoints: false, pointsData: [], hasTable: false, tableColumns: [], tableData: [] }
    ])
    const descInputRef = useRef([]);
    const descPointsInputRef = useRef([]);
    const [isLoading, setIsLoading] = useState(false);
    const [openDrawer, setOpenDrawer] = useState(false);
    const [addConceptPayload, setAddConceptPayload] = useState({});
    const [addConceptApi, setAddConceptApi] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [openPopup, setOpenPopup] = useState(false);

    useEffect(() => {
        setOpenDrawer(true);
    }, [])

    const handleCloseDrawer = () => {
        setOpenDrawer(false);
        setAddConceptClick(false);
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
        const path = `${`${params?.categoryId}/${params?.topicId}/${addConceptTitle}/section1/description${description[i].id}/snippets/image${index + 1}.${type}`}`;
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
        const path = `${`${params?.categoryId}/${params?.topicId}/${addConceptTitle}/section1/description${description[i].id}/point${description[i].pointsData[idx].id}/snippets/image${index + 1}.${type}`}`;
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
        payload.id = (conceptsInfo?.data && conceptsInfo?.data?.length > 0) ? conceptsInfo?.data?.length + 1 : 1;
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
            getConcepts?.refetch();
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

    let AddConcept = useFetchAPI("AddConcept", `/concepts/addConcepts`, "POST", addConceptPayload, CommonHeaders(), fetchQueryParams("", "", "", onAddConceptSuccess, "", addConceptApi));

    const fetching = AddConcept?.Loading || AddConcept?.Fetching;

    return (
        <>
            {(fetching || isLoading) && <Loader showLoader={fetching || isLoading} />}
            <Drawer anchor={'right'} open={openDrawer} onClose={handleCloseDrawer}>
                <div className={AddConceptStyles.addConceptContainer}>
                    <div className={AddConceptStyles.addConceptTitle}>
                        <div>
                            <h2 className={AddConceptStyles.title}>Add Concept</h2>
                        </div>
                        <div>
                            <CancelIcon sx={{ cursor: 'pointer' }} className={AddConceptStyles.cancelIcon} onClick={handleCloseDrawer} />
                        </div>
                    </div>
                    <div className={AddConceptStyles.addConceptForm}>
                        <div className={AddConceptStyles.conceptTitle}>
                            <FormControl sx={{ width: '100%' }}>
                                <label>Title <span className={AddConceptStyles.required}>*</span></label>
                                <TextField
                                    name='title'
                                    value={addConceptTitle}
                                    className={AddConceptStyles.headerInput}
                                    onChange={(e) => setAddConceptTitle(e.target.value)}
                                    InputProps={{
                                        type: 'text',
                                    }}
                                    sx={{ input: { "&::placeholder": { opacity: 0.9 } } }}
                                    placeholder={"Enter Concept Title"} size="large"
                                />
                            </FormControl>
                        </div>
                        <div className={AddConceptStyles.conceptDescription}>
                            <FormControl sx={{ width: '100%' }}>
                                {description?.map((el, i) => (
                                    <>
                                        <label>Description {description[i]?.id}</label>
                                        <div className={AddConceptStyles.descriptionFlex}>
                                            <div className={AddConceptStyles.descriptionDiv}>
                                                <TextField
                                                    className={AddConceptStyles.headerInput}
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
                                                    className={AddConceptStyles.headerInput}
                                                    name='data'
                                                    value={el?.data || ""}
                                                    onChange={(e) => handleDescriptionChange(i, e)}
                                                    InputProps={{
                                                        type: 'text',
                                                    }}
                                                    sx={{ input: { "&::placeholder": { opacity: 0.9 } } }}
                                                    placeholder={"Enter Description"} size="large"
                                                />
                                                <label className={`btn btn-primary ${AddConceptStyles.DocUpload}`}>Upload Code Snippet(s)</label>
                                                <input ref={el => descInputRef.current[i] = el} name='snippet' type='file' accept='.jpg,.jpeg,.png' multiple className={AddConceptStyles.uploadInput} onChange={(e) => handleDescriptionChange(i, e)} />
                                                {description[i]?.snippet?.length > 0 &&
                                                    (description[i]?.snippet?.length > 10 ? (
                                                        <p className="error">
                                                            You can't upload more than 10 images! <br />
                                                            <span>
                                                                please delete <b> {description[i]?.snippet.length - 10} </b> of them{" "}
                                                            </span>
                                                        </p>
                                                    ) : (
                                                        <></>
                                                    ))}
                                                <div className={AddConceptStyles.images}>
                                                    {description[i]?.snippet &&
                                                        description[i]?.snippet?.map((image, index) => {
                                                            return (
                                                                <div key={image} className={AddConceptStyles.image}>
                                                                    <img src={image?.url} className={AddConceptStyles.descriptionImage} alt="upload" />
                                                                    <div className={AddConceptStyles.uploadBtnContainer}>
                                                                        <div className={AddConceptStyles.imageUploadBtn}>
                                                                            <button className={AddConceptStyles.uploadBtn} disabled={image?.imageUploaded} onClick={() => uploadImages(i, image?.url, index)}>{image?.imageUploaded ? 'Uploaded Successfully' : 'Upload'}</button>
                                                                        </div>
                                                                        <div>
                                                                            {!image?.imageUploaded ? <button className={AddConceptStyles.imageDelete} onClick={() => deleteImage(i, image)}>
                                                                                Remove
                                                                            </button> : <button className={AddConceptStyles.imageDelete} onClick={() => removeUploadedImage(i, image?.url, index)}>
                                                                                Cancel Upload
                                                                            </button>}
                                                                        </div>
                                                                    </div>
                                                                    {image?.imageUploadedSuccess && image?.imageUploadedSuccess === false && <div className={AddConceptStyles.uploadErrorAlert}>
                                                                        <Alert autoHideDuration={3000} severity="error">
                                                                            Upload Failed! Try again later.
                                                                        </Alert>
                                                                    </div>}
                                                                </div>
                                                            );
                                                        })}
                                                </div>
                                                <div className={AddConceptStyles.points}>
                                                    <Typography component="label">
                                                        Add Points
                                                        <Switch id='points' name='hasPoints' checked={el?.hasPoints} onChange={(e) => handleDescriptionChange(i, e)} />
                                                    </Typography>
                                                    {description[i]?.hasPoints &&
                                                        <>
                                                            {description[i]?.pointsData?.map((point, idx) => (
                                                                <>
                                                                    <div className={AddConceptStyles.pointsDiv}>
                                                                        {idx ? <HighlightOffIcon titleAccess='Remove' className={AddConceptStyles.removeIconPoint} onClick={() => removePoint(idx, i)} /> : null}
                                                                        <h4 className={AddConceptStyles.pointTitle}>Point {idx + 1}</h4>
                                                                        <label>Enter Point</label>
                                                                        <TextField
                                                                            className={AddConceptStyles.pointsInput}
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
                                                                            <label className={`btn btn-primary ${AddConceptStyles.DocUpload}`}>Upload Code Snippet(s)</label>
                                                                            <input ref={el => descPointsInputRef.current[idx] = el} name='snippet' type='file' accept='.jpg,.jpeg,.png' multiple className={AddConceptStyles.uploadInput} onChange={(e) => handlePointsChange(idx, e, i)} />
                                                                            {description[i]?.pointsData[idx]?.snippet?.length > 0 &&
                                                                                (description[i]?.pointsData[idx]?.snippet?.length > 10 ? (
                                                                                    <p className="error">
                                                                                        You can't upload more than 10 images! <br />
                                                                                        <span>
                                                                                            please delete <b> {description[i]?.pointsData[idx]?.snippet.length - 10} </b> of them{" "}
                                                                                        </span>
                                                                                    </p>
                                                                                ) : (
                                                                                    <></>
                                                                                ))}
                                                                            <div className={AddConceptStyles.images}>
                                                                                {description[i]?.pointsData[idx]?.snippet &&
                                                                                    description[i]?.pointsData[idx]?.snippet?.map((image, index) => {
                                                                                        return (
                                                                                            <div key={image + index} className={AddConceptStyles.image}>
                                                                                                <img src={image?.url} className={AddConceptStyles.descriptionImage} alt="upload" />
                                                                                                <div className={AddConceptStyles.uploadBtnContainer}>
                                                                                                    <div className={AddConceptStyles.imageUploadBtn}>
                                                                                                        <button className={AddConceptStyles.uploadBtn} disabled={image.imageUploaded} onClick={() => uploadPointsImages(idx, i, image?.url, index)}>{image?.imageUploaded ? 'Uploaded Successfully' : 'Upload'}</button>
                                                                                                    </div>
                                                                                                    <div>
                                                                                                        {!image.imageUploaded ? <button className={AddConceptStyles.imageDelete} onClick={() => deletePointsImage(i, image, idx)}>
                                                                                                            Delete
                                                                                                        </button> : <button className={AddConceptStyles.imageDelete} onClick={() => removeUploadedPointsImage(i, image?.url, idx, index)}>
                                                                                                            Cancel Upload
                                                                                                        </button>}
                                                                                                    </div>
                                                                                                </div>
                                                                                                {image?.imageUploadedSuccess && image?.imageUploadedSuccess === false && <div className={AddConceptStyles.uploadErrorAlert}>
                                                                                                    <Alert autoHideDuration={3000} severity="error">
                                                                                                        Upload Failed! Try again later.
                                                                                                    </Alert>
                                                                                                </div>}
                                                                                            </div>
                                                                                        );
                                                                                    })}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            ))}
                                                            <h6 className={AddConceptStyles.anotherDescription}><u onClick={() => addAnotherPoint(i)}>Add Another Point</u></h6>
                                                        </>}
                                                </div>
                                                <div className={AddConceptStyles.table}>
                                                    <Typography component="label">
                                                        Add Table
                                                        <Switch id='table' name='hasTable' checked={el?.hasTable} onChange={(e) => handleDescriptionChange(i, e)} />
                                                    </Typography>
                                                    {description[i].hasTable ?
                                                        <>
                                                            <div>
                                                                <h4 className={AddConceptStyles.tableColHeaders}>Table Columns</h4>
                                                                {description[i]?.tableColumns?.map((el, index) =>
                                                                    <TextField
                                                                        className={AddConceptStyles.columnInput}
                                                                        name='value'
                                                                        value={el?.value || ""}
                                                                        onChange={(ev) => handleTableChange(index, ev, i)}
                                                                        InputProps={{
                                                                            type: 'text',
                                                                        }}
                                                                        sx={{ input: { "&::placeholder": { opacity: 0.9 } } }}
                                                                        placeholder={"Enter Column Name"} size="large"
                                                                    />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <h4 className={AddConceptStyles.tableDataHeaders}>Table Data</h4>
                                                                {description[i]?.tableData?.map((el, index) =>
                                                                    <>
                                                                        <div className={AddConceptStyles.tableDataFlex}>
                                                                            <div className={AddConceptStyles.tableData}>
                                                                                <TextField
                                                                                    className={AddConceptStyles.columnInput}
                                                                                    name='value1'
                                                                                    value={el?.value1 || ""}
                                                                                    onChange={(ev) => handleTableDataChange(index, ev, i)}
                                                                                    InputProps={{
                                                                                        type: 'text',
                                                                                    }}
                                                                                    sx={{ input: { "&::placeholder": { opacity: 0.9 } } }}
                                                                                    placeholder={"Enter Data"} size="large"
                                                                                />
                                                                                <TextField
                                                                                    className={AddConceptStyles.columnInput}
                                                                                    name='value2'
                                                                                    value={el?.value2 || ""}
                                                                                    onChange={(ev) => handleTableDataChange(index, ev, i)}
                                                                                    InputProps={{
                                                                                        type: 'text',
                                                                                    }}
                                                                                    sx={{ input: { "&::placeholder": { opacity: 0.9 } } }}
                                                                                    placeholder={"Enter Data"} size="large"
                                                                                />
                                                                            </div>
                                                                            <div>
                                                                                {
                                                                                    index ?
                                                                                        <HighlightOffIcon titleAccess='Remove' className={AddConceptStyles.removeIcon} onClick={() => removeRow(index, i)} />
                                                                                        : null
                                                                                }
                                                                            </div>
                                                                        </div>
                                                                    </>

                                                                )}
                                                                <h6 className={AddConceptStyles.anotherDescription}><u onClick={() => addAnotherRow(i)}>Add Another Row</u></h6>
                                                            </div>
                                                        </> : null}

                                                </div>
                                            </div>
                                            <div className={AddConceptStyles.remove}>
                                                {
                                                    i ?
                                                        <HighlightOffIcon titleAccess='Remove' className={AddConceptStyles.removeIcon} onClick={() => removeDescription(i)} />
                                                        : null
                                                }
                                            </div>

                                        </div>

                                    </>
                                ))}
                                <h6 className={AddConceptStyles.anotherDescription}><u onClick={addAnotherDescription}>Add Another Description</u></h6>
                            </FormControl>
                        </div>
                        <div className={AddConceptStyles.editBtnContainer}>
                            <div>
                                <CommonButton variant="contained" bgColor={'#5b67f1'} color={'white'} padding={'15px'} borderRadius={'5px'} fontWeight={'bold'} width={'100%'} height={'45px'} margin={'20px 0 0 0'} onClick={() => handleAddConcept()} disabled={!addConceptTitle}>Save</CommonButton>
                            </div>
                            <div>
                                <CommonButton variant="contained" bgColor={'#f8f8f8'} color={'black'} padding={'15px'} borderRadius={'5px'} fontWeight={'bold'} width={'100%'} height={'45px'} margin={'20px 0 0 0'} border={'1px solid #ddd'} onClick={handleCloseDrawer}>Cancel</CommonButton>
                            </div>
                        </div>
                    </div>
                </div>
            </Drawer>
            <Dialog open={openPopup} TransitionComponent={Transition} keepMounted onClose={handleCloseDialog} aria-describedby="alert-dialog-slide-description" fullWidth={false} maxWidth="sm" >
                <div className={AddConceptStyles.modalinnerwrapper}>
                    <div><h4 className={AddConceptStyles.headerText}>{errorMessage?.length > 0 ? 'Failed' : 'Success'}</h4></div>
                    <IconButton aria-label="close" onClick={handleCloseDialog} sx={{ position: 'absolute', right: 8, top: 8, color: "#666" }}>
                        <CloseIcon />
                    </IconButton>
                    <DialogContent>
                        <Alert
                            anchorOrigin={{ vertical: "top", horizontal: "center" }}
                            severity={errorMessage?.length > 0 ? "error" : "success"}
                        >
                            {errorMessage?.length > 0 ? errorMessage : 'Concept Added Successfully'}
                        </Alert>
                    </DialogContent>
                    <div className={AddConceptStyles.modalactionsection}>
                        <CommonButton variant="contained" bgColor={'white'} color={'#286ce2'} padding={'0.2rem 2.6rem'} borderRadius={'8px'} fontWeight={'bold'} border={'1px solid #286ce2'} onClick={handleCloseDialog}>Ok</CommonButton>
                    </div>
                </div>
            </Dialog>
        </>
    )
}

export default AddConcept