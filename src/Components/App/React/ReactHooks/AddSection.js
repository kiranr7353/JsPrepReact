import React, { useEffect, useRef, useState } from 'react';
import ReactStyles from './ReactHooksStyles.module.css';
import Switch from '@mui/joy/Switch';
import Typography from '@mui/joy/Typography';
import { Alert, Dialog, DialogContent, Drawer, FormControl, Slide, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';
import { storage } from '../../../../firebaseConfig';
import CommonButton from '../../../../CommonComponents/CommonButton';
import CancelIcon from '@mui/icons-material/Cancel';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { getDownloadURL, ref as storageRef, uploadBytesResumable, deleteObject } from "firebase/storage";
import { useFetchAPI } from '../../../../Hooks/useAPI';
import { CommonHeaders } from '../../../../CommonComponents/CommonHeaders';
import { fetchQueryParams } from '../../../../Hooks/fetchQueryParams';
import Loader from '../../../../CommonComponents/Loader/Loader';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const AddSection = ({ contentData, locationDetails, categoryId, GetHooks, setSelectedIndex, setContentData, setAddSectionClicked }) => {

    const [openDrawer, setOpenDrawer] = useState(false);
    const [description, setDescription] = useState([
        { id: 1, header: '', data: '', snippet: [], imageUploaded: false, hasPoints: false, pointsData: [], hasTable: false, tableColumns: [], tableData: [] }
    ])
    const [payload, setPayload] = useState({});
    const [callAddSectionApi, setCallAddSectionApi] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [openPopup, setOpenPopup] = useState(false);
    const descInputRef = useRef([]);
    const descPointsInputRef = useRef([]);
    const [isLoading, setIsLoading] = useState(false);

    let uploadImagesSectionId = contentData ? (contentData?.data?.length > 1 ? contentData?.data?.length + 1 : 1) : 1;

    console.log(contentData, 'contentData');

    useEffect(() => {
        setOpenDrawer(true);
    }, [])

    const handleCloseDrawer = () => {
        setOpenDrawer(false);
        setAddSectionClicked(false)
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
        const path = `${`React/ReactHooks/${contentData.title}/section${uploadImagesSectionId}/description${description[i].id}/snippets/image${index + 1}.${type}`}`;
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
        const path = `${`React/ReactHooks/${contentData.title}/section${uploadImagesSectionId}/description${description[i].id}/point${description[i].pointsData[idx].id}/snippets/image${index + 1}.${type}`}`;
        console.log(path);
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
            newValues[i].imageUploaded = false;
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
            pointsValues[idx].imageUploaded = false;
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

    const handleAddSection = () => {
        let payload = {};
        payload.sectionId = contentData ? (contentData?.data?.length > 0 ? contentData?.data?.length + 1 : 1) : 1;
        payload.categoryId = categoryId;
        payload.title = contentData?.title;
        payload.topicId = locationDetails?.state?.topicDetails?.topicId;
        let itemsToAdd = { description, sectionId: payload.sectionId };
        if(contentData?.data?.length > 0) {
            contentData.data.push(itemsToAdd)
        } else {
            contentData.data = itemsToAdd;
        }
        payload.data = contentData?.data;
        console.log(payload);
        setPayload(payload);
        setCallAddSectionApi(true);
    }

    const onAddSectionSuccess = (res) => {
        setCallAddSectionApi(false);
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

    let AddSection = useFetchAPI("AddSection", `/concepts/section/editDescription`, "POST", payload, CommonHeaders(), fetchQueryParams("", "", "", onAddSectionSuccess, "", callAddSectionApi));

    const fetching = AddSection?.Loading || AddSection?.Fetching;

    console.log(description);

    const handleCloseDialog = () => {
        setOpenPopup(false);
        handleCloseDrawer();
        window.scroll(0, 0);
    }

    return (
        <>
            {fetching && <Loader showLoader={fetching} />}
            <Drawer anchor={'right'} open={openDrawer} onClose={handleCloseDrawer}>
                <div className={ReactStyles.addConceptContainer}>
                    <div className={ReactStyles.addConceptTitle}>
                        <div>
                            <h2>Add Section</h2>
                        </div>
                        <div>
                            <CancelIcon sx={{ cursor: 'pointer' }} onClick={handleCloseDrawer} />
                        </div>
                    </div>
                    <div className={ReactStyles.addConceptForm}>
                        <div className={ReactStyles.conceptDescription}>
                            <FormControl sx={{ width: '100%' }}>
                                {description?.map((el, i) => (
                                    <>
                                        <label>Description {description[i]?.id}</label>
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
                                                            <div>
                                                                <h4>Table Columns</h4>
                                                                {description[i]?.tableColumns?.map((el, index) =>
                                                                    <TextField
                                                                        className={ReactStyles.columnInput}
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
                                                                        <div className={ReactStyles.tableDataFlex}>
                                                                            <div className={ReactStyles.tableData}>
                                                                                <TextField
                                                                                    className={ReactStyles.columnInput}
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
                                                                                    className={ReactStyles.columnInput}
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
                                                                                        <HighlightOffIcon titleAccess='Remove' className={ReactStyles.removeIcon} onClick={() => removeRow(index, i)} />
                                                                                        : null
                                                                                }
                                                                            </div>
                                                                        </div>
                                                                    </>

                                                                )}
                                                                <h6 className={ReactStyles.anotherDescription}><u onClick={() => addAnotherRow(i)}>Add Another Row</u></h6>
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
                                    </>
                                ))}
                                <h6 className={ReactStyles.anotherDescription}><u onClick={addAnotherDescription}>Add Another Description</u></h6>
                            </FormControl>
                        </div>
                    </div>
                    <div className={ReactStyles.editBtnContainer}>
                        <div>
                            <CommonButton variant="contained" bgColor={'#5b67f1'} color={'white'} padding={'15px'} borderRadius={'5px'} fontWeight={'bold'} width={'100%'} height={'45px'} marign={'20px 0 0 0'} onClick={() => handleAddSection(description)}>Save</CommonButton>
                        </div>
                        <div>
                            <CommonButton variant="contained" bgColor={'#f8f8f8'} color={'black'} padding={'15px'} borderRadius={'5px'} fontWeight={'bold'} width={'100%'} height={'45px'} marign={'20px 0 0 0'} border={'1px solid #ddd'} onClick={handleCloseDrawer}>Cancel</CommonButton>
                        </div>
                    </div>
                </div>
            </Drawer>
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
                            {errorMessage?.length > 0 ? errorMessage : 'Added Successfully'}
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

export default AddSection