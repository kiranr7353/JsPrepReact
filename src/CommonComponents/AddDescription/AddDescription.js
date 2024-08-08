import React, { useEffect, useRef, useState } from 'react'

import { Alert, Dialog, DialogContent, Drawer, FormControl, FormControlLabel, Slide, Snackbar, TextField, Typography } from '@mui/material';
import Switch from '@mui/joy/Switch';
import AddDescriptionStyles from './AddDescriptionStyles.module.css';
import CancelIcon from '@mui/icons-material/Cancel';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { getDownloadURL, ref as storageRef, uploadBytesResumable, deleteObject } from "firebase/storage";
import { storage } from '../../firebaseConfig';
import { useFetchAPI } from '../../Hooks/useAPI';
import Loader from '../Loader/Loader';
import { CommonHeaders } from '../CommonHeaders';
import { fetchQueryParams } from '../../Hooks/fetchQueryParams';
import CommonButton from '../CommonButton';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});


const AddDescription = ({ addItem, setAddClicked, sectionId, locationDetails, categoryId, contentData, getConcepts, setSelectedIndex, setContentData, params }) => {

    const [openDrawer, setOpenDrawer] = useState(false);
    const [description, setDescription] = useState([
        { id: addItem?.description?.length + 1, header: '', data: '', snippet: [], imageUploaded: false, hasPoints: false, pointsData: [], hasTable: false, tableColumns: [], tableData: [] }
    ])
    const [payload, setPayload] = useState({});
    const [callAddDescApi, setCallAddDescApi] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [openPopup, setOpenPopup] = useState(false);
    const descInputRef = useRef([]);
    const descPointsInputRef = useRef([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setOpenDrawer(true);
    }, [])

    const handleCloseDrawer = () => {
        setOpenDrawer(false);
        setAddClicked(false)
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
        }
        else if (e.target.name === 'noOfColumns') {
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
        const path = `${`${params?.categoryId}/${params?.topicId}/${contentData.title}/section${sectionId}/description${description[i].id}/snippets/image${index + 1}.${type}`}`;
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
        const path = `${`${params?.categoryId}/${params?.topicId}/${contentData.title}/section${sectionId}/description${description[i].id}/point${description[i].pointsData[idx].id}/snippets/image${index + 1}.${type}`}`;
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

    const uploadPointsImages = async(idx, i, url, index) => {
        await uploadPointsImageToFireStore(url, i, index, idx)
    }

    const removeUploadedImage = async (i, image, imageIndex) => {
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

    const removeUploadedPointsImage = async (i, image, idx, index) => {
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

    const handleAddSave = (desc) => {
        let payload = {};
        payload.sectionId = sectionId;
        payload.categoryId = categoryId;
        payload.title = contentData?.title;
        payload.topicId = locationDetails?.state?.topicDetails?.topicId;
        contentData.data[sectionId - 1].description[addItem?.description?.length] = desc[0];
        payload.data = contentData?.data;
        setPayload(payload);
        setCallAddDescApi(true);
    }

    const onAddSuccess = res => {
        setCallAddDescApi(false);
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

    let EditDescription = useFetchAPI("EditDescription", `/concepts/section/editDescription`, "POST", payload, CommonHeaders(), fetchQueryParams("", "", "", onAddSuccess, "", callAddDescApi));

    return (
        <>
            {(EditDescription?.Loading || EditDescription?.Fetching || isLoading) && <Loader showLoader={EditDescription?.Loading || EditDescription?.Fetching || isLoading} />}
            <Drawer anchor={'right'} open={openDrawer} onClose={handleCloseDrawer}>
                <div className={AddDescriptionStyles.addConceptContainer}>
                    <div className={AddDescriptionStyles.addConceptTitle}>
                        <div>
                            <h2>Add Description</h2>
                        </div>
                        <div>
                            <CancelIcon sx={{ cursor: 'pointer' }} onClick={handleCloseDrawer} />
                        </div>
                    </div>
                    <div>
                        <div className={AddDescriptionStyles.conceptDescription}>
                            <FormControl sx={{ width: '100%' }}>
                                {description?.map((el, i) => (
                                    <div>
                                        <div className={AddDescriptionStyles.addDescriptionDiv}>
                                            <TextField
                                                className={AddDescriptionStyles.headerInput}
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
                                                className={AddDescriptionStyles.headerInput}
                                                name='data'
                                                value={el?.data || ""}
                                                onChange={(e) => handleDescriptionChange(i, e)}
                                                InputProps={{
                                                    type: 'text',
                                                }}
                                                sx={{ input: { "&::placeholder": { opacity: 0.9 } } }}
                                                placeholder={"Enter Description"} size="large"
                                            />
                                            <label className={`btn btn-primary ${AddDescriptionStyles.DocUpload}`}>Upload Code Snippet(s)</label>
                                            <input ref={el => descInputRef.current[i] = el} name='snippet' type='file' accept='.jpg,.jpeg,.png' multiple className={AddDescriptionStyles.uploadInput} onChange={(e) => handleDescriptionChange(i, e)} />
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
                                            <div className={AddDescriptionStyles.images}>
                                                {description[i]?.snippet &&
                                                    description[i]?.snippet?.map((image, index) => {
                                                        return (
                                                            <div key={image} className={AddDescriptionStyles.image}>
                                                                <img src={image?.url} className={AddDescriptionStyles.descriptionImage} alt="upload" />
                                                                <div className={AddDescriptionStyles.uploadBtnContainer}>
                                                                    <div className={AddDescriptionStyles.imageUploadBtn}>
                                                                        <button className={AddDescriptionStyles.uploadBtn} disabled={image?.imageUploaded} onClick={() => uploadImages(i, image?.url, index)}>{image?.imageUploaded ? 'Uploaded Successfully' : 'Upload'}</button>
                                                                    </div>
                                                                    <div>
                                                                        {!image?.imageUploaded ? <button className={AddDescriptionStyles.imageDelete} onClick={() => deleteImage(i, image)}>
                                                                            Remove
                                                                        </button> : <button className={AddDescriptionStyles.imageDelete} onClick={() => removeUploadedImage(i, image?.url, index)}>
                                                                            Cancel Upload
                                                                        </button>}
                                                                    </div>
                                                                </div>
                                                                {image?.imageUploadedSuccess && image?.imageUploadedSuccess === false && <div className={AddDescriptionStyles.uploadErrorAlert}>
                                                                    <Alert autoHideDuration={3000} severity="error">
                                                                        Upload Failed! Try again later.
                                                                    </Alert>
                                                                </div>}
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                            <div className={AddDescriptionStyles.points}>
                                                <FormControlLabel className={AddDescriptionStyles.switch} control={<Switch id='points' checked={el?.hasPoints} onChange={(e) => handleDescriptionChange(i, e)} />} label="Add Points" labelPlacement="start" />
                                                {description[i]?.hasPoints &&
                                                    <>
                                                        {description[i]?.pointsData?.map((point, idx) => (
                                                            <>
                                                                <div className={AddDescriptionStyles.pointsDiv}>
                                                                    {idx ? <HighlightOffIcon titleAccess='Remove' className={AddDescriptionStyles.removeIconPoint} onClick={() => removePoint(idx, i)} /> : null}
                                                                    <h4>Point {idx + 1}</h4>
                                                                    <label>Enter Point</label>
                                                                    <TextField
                                                                        className={AddDescriptionStyles.pointsInput}
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
                                                                        <label className={`btn btn-primary ${AddDescriptionStyles.DocUpload}`}>Upload Code Snippet(s)</label>
                                                                        <input ref={el => descPointsInputRef.current[idx] = el} name='snippet' type='file' accept='.jpg,.jpeg,.png' multiple className={AddDescriptionStyles.uploadInput} onChange={(e) => handlePointsChange(idx, e, i)} />
                                                                        {description[i]?.pointsData[idx]?.snippet?.length > 0 &&
                                                                            (description[i]?.pointsData[idx]?.snippet?.length > 10 ? (
                                                                                <p className="error">
                                                                                    You can't upload more than 10 images! <br />
                                                                                    <span>
                                                                                        please delete <b> {description[i]?.pointsData[idx]?.snippet.length - 10} </b> of them{" "}
                                                                                    </span>
                                                                                </p>
                                                                            ) : (
                                                                                <>
                                                                                </>
                                                                            ))}
                                                                        <div className={AddDescriptionStyles.images}>
                                                                            {description[i]?.pointsData[idx]?.snippet &&
                                                                                description[i]?.pointsData[idx]?.snippet?.map((image, index) => {
                                                                                    return (
                                                                                        <div key={image + index} className={AddDescriptionStyles.image}>
                                                                                            <img src={image?.url} className={AddDescriptionStyles.descriptionImage} alt="upload" />
                                                                                            <div className={AddDescriptionStyles.uploadBtnContainer}>
                                                                                                <div className={AddDescriptionStyles.imageUploadBtn}>
                                                                                                    <button className={AddDescriptionStyles.uploadBtn} disabled={image.imageUploaded} onClick={() => uploadPointsImages(idx, i, image?.url, index)}>{image?.imageUploaded ? 'Uploaded Successfully' : 'Upload'}</button>
                                                                                                </div>
                                                                                                <div>
                                                                                                    {!image.imageUploaded ? <button className={AddDescriptionStyles.imageDelete} onClick={() => deletePointsImage(i, image, idx)}>
                                                                                                        Delete
                                                                                                    </button> : <button className={AddDescriptionStyles.imageDelete} onClick={() => removeUploadedPointsImage(i, image?.url, idx, index)}>
                                                                                                        Cancel Upload
                                                                                                    </button>}
                                                                                                </div>
                                                                                            </div>
                                                                                            {image?.imageUploadedSuccess && image?.imageUploadedSuccess === false && <div className={AddDescriptionStyles.uploadErrorAlert}>
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
                                                        <h6 className={AddDescriptionStyles.anotherDescription}><u onClick={() => addAnotherPoint(i)}>Add Another Point</u></h6>
                                                    </>}
                                            </div>
                                            <div className={AddDescriptionStyles.table}>
                                                <FormControlLabel className={AddDescriptionStyles.switch} control={<Switch id='table' name='hasTable' checked={el?.hasTable} onChange={(e) => handleDescriptionChange(i, e)} />} label="Add Table" labelPlacement="start" />
                                                {description[i].hasTable ?
                                                    <>
                                                        <div>
                                                            <h4>Table Columns</h4>
                                                            {description[i]?.tableColumns?.map((el, index) =>
                                                                <TextField
                                                                    className={AddDescriptionStyles.columnInput}
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
                                                            <h4>Table Data</h4>
                                                            {description[i]?.tableData?.map((el, index) =>
                                                                <>
                                                                    <div className={AddDescriptionStyles.tableDataFlex}>
                                                                        <div className={AddDescriptionStyles.tableData}>
                                                                            <TextField
                                                                                className={AddDescriptionStyles.columnInput}
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
                                                                                className={AddDescriptionStyles.columnInput}
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
                                                                                    <HighlightOffIcon titleAccess='Remove' className={AddDescriptionStyles.removeIcon} onClick={() => removeRow(index, i)} />
                                                                                    : null
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </>

                                                            )}
                                                            <h6 className={AddDescriptionStyles.anotherDescription}><u onClick={() => addAnotherRow(i)}>Add Another Row</u></h6>
                                                        </div>
                                                    </> : null}

                                            </div>
                                        </div>
                                        <div className={AddDescriptionStyles.remove}>
                                            {
                                                i ?
                                                    <HighlightOffIcon titleAccess='Remove' className={AddDescriptionStyles.removeIcon} onClick={() => removeDescription(i)} />
                                                    : null
                                            }
                                        </div>
                                        <div className={AddDescriptionStyles.editBtnContainer}>
                                            <div>
                                                <CommonButton variant="contained" bgColor={'#5b67f1'} color={'white'} padding={'15px'} borderRadius={'5px'} fontWeight={'bold'} width={'100%'} height={'45px'} margin={'20px 0 0 0'} onClick={() => handleAddSave(description)}>Save</CommonButton>
                                            </div>
                                            <div>
                                                <CommonButton variant="contained" bgColor={'#f8f8f8'} color={'black'} padding={'15px'} borderRadius={'5px'} fontWeight={'bold'} width={'100%'} height={'45px'} margin={'20px 0 0 0'} border={'1px solid #ddd'} onClick={handleCloseDrawer}>Cancel</CommonButton>
                                            </div>
                                        </div>
                                    </div>

                                ))}
                            </FormControl>
                        </div>
                    </div>
                </div>
            </Drawer>
            <Dialog open={openPopup} TransitionComponent={Transition} keepMounted onClose={handleCloseDialog} aria-describedby="alert-dialog-slide-description" fullWidth={false} maxWidth="sm" >
                <div className={AddDescriptionStyles.modalinnerwrapper}>
                    <div><h4 className={AddDescriptionStyles.headerText}>{errorMessage?.length > 0 ? 'Failed' : 'Success'}</h4></div>
                    <IconButton aria-label="close" onClick={handleCloseDialog} sx={{ position: 'absolute', right: 8, top: 8, color: "#666" }}>
                        <CloseIcon />
                    </IconButton>
                    <DialogContent>
                        <Alert
                            anchorOrigin={{ vertical: "top", horizontal: "center" }}
                            severity={errorMessage?.length > 0 ? "error" : "success"}
                        >
                            {errorMessage?.length > 0 ? errorMessage : 'Added Successfully'}
                        </Alert>
                    </DialogContent>
                    <div className={AddDescriptionStyles.modalactionsection}>
                        <CommonButton variant="contained" bgColor={'white'} color={'#286ce2'} padding={'0.2rem 2.6rem'} borderRadius={'8px'} fontWeight={'bold'} border={'1px solid #286ce2'} onClick={handleCloseDialog}>Ok</CommonButton>
                    </div>
                </div>
            </Dialog>
        </>
    )
}

export default AddDescription