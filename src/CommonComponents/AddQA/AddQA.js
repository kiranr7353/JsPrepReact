import React, { useEffect, useRef, useState } from 'react'
import AddQAStyles from './AddQAStyles.module.css'

import { Alert, Drawer, FormControl, Switch, TextField, Typography } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import CommonButton from '../CommonButton';
import { getDownloadURL, ref as storageRef, uploadBytesResumable, deleteObject } from "firebase/storage";
import { storage } from '../../firebaseConfig';

const AddQA = (props) => {

    const { setAddQAClicked, params, locationDetails } = props;

    const [openDrawer, setOpenDrawer] = useState(false);
    const [question, setQuestion] = useState('');
    const [questionId, setQuestionId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [QA, setQA] = useState([
        { id: 1, answer: '', snippets: [], hasPoints: false, pointsData: [], hasTable: false, tableColumns: [], tableData: [], hasNote: false, note: '' }
    ])
    const QAInputRef = useRef([]);
    const QAPointsInputRef = useRef([]);

    useEffect(() => {
        setOpenDrawer(true);
    }, [])

    const handleCloseDrawer = () => {
        setOpenDrawer(false);
        setAddQAClicked(false);
    }

    const handleQAChange = (i, e) => {
        let newValues = [...QA];
        if (e.target.name === 'snippets') {
            const selectedFiles = e.target.files;
            const selectedFilesArray = Array.from(selectedFiles);
            const imagesArray = selectedFilesArray.map((file) => {
                return { url: URL.createObjectURL(file), imageUploaded: false };
            });
            setQA((prev) => ({ ...prev, snippets: [QA[i]?.snippets.concat(imagesArray)] }));
            newValues[i][e.target.name] = imagesArray;
        } else if (e.target.type === 'checkbox') {
            if (e.target.id === 'points') {
                newValues[i]['hasPoints'] = e.target.checked;
                if (newValues[i]['hasPoints']) {
                    newValues[i]['pointsData'].push({ id: 1, pointHeader: '', value: '', snippets: [] });
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
            } else if (e.target.id === 'note') {
                newValues[i]['hasNote'] = e.target.checked;
                if (newValues[i]['hasNote']) {
                    newValues[i]['note'] = '';
                } else {
                    newValues[i]['note'] = '';
                }
            }
        } else if (e.target.name === 'noOfColumns') {
            newValues[i]['noOfColumns'] = parseInt(e.target.value);
        }
        else {
            newValues[i][e.target.name] = e.target.value;
        }
        setQA(newValues);
    }

    const handlePointsChange = (idx, e, i) => {
        let pointsValues = [...QA[i].pointsData];
        if (e.target.name === 'snippets') {
            const selectedFiles = e.target.files;
            const selectedFilesArray = Array.from(selectedFiles);
            const imagesArray = selectedFilesArray.map((file) => {
                return { url: URL.createObjectURL(file), imageUploaded: false };
            });
            setQA(prev => {
                return [...prev.slice(0, i), { ...prev[i], pointsData: { ...QA[i].pointsData[idx], snippets: [QA[i]?.pointsData[idx]?.snippets.concat(imagesArray)] } }, ...prev.slice(i + 1)]
            })
            pointsValues[idx][e.target.name] = imagesArray;
        } else {
            pointsValues[idx][e.target.name] = e.target.value;
        }
        setQA(prev => {
            return [...prev.slice(0, i), { ...prev[i], pointsData: pointsValues }, ...prev.slice(i + 1)]
        })
    }

    const uploadImageToFireStore = async (img, i, index) => {
        let blob = await fetch(img).then(r => r.blob());
        const type = blob?.type.split('/')[1];
        const path = `${`${params?.categoryId}/${params?.topicId}/question${questionId}/answer${QA[i].id}/snippets/image${index + 1}.${type}`}`;
        const imageRef = storageRef(storage, path, { contentType: blob?.type });
        setIsLoading(true);
        let newValues = [...QA];
        uploadBytesResumable(imageRef, blob, { contentType: blob?.type })
            .then((snapshot) => {
                getDownloadURL(snapshot.ref)
                    .then((url) => {
                        setIsLoading(false);
                        newValues[i].snippets[index].url = url;
                        newValues[i].snippets[index].imageUploaded = true;
                        QA(newValues);
                        return url;
                    })
                    .catch((error) => {
                        setIsLoading(false);
                        newValues[i].snippets[index].imageUploadedSuccess = false;
                    });
            })
            .catch((error) => {
                setIsLoading(false);
                newValues[i].snippets[index].imageUploadedSuccess = false;
            });
    }

    const uploadImages = async (i, url, imageIndex) => {
        await uploadImageToFireStore(url, i, imageIndex)
    }

    const deleteImage = (i, image) => {
        let newValues = [...QA];
        const filtered = newValues[i]?.snippets?.findIndex((e) => e === image);
        newValues[i]?.snippets?.splice(filtered, 1);
        QAInputRef.current[i].value = '';
        setQA(newValues);
        URL.revokeObjectURL(image);
    }

    const removeUploadedImage = async (i, image) => {
        const imageRef = storageRef(storage, image);
        deleteObject(imageRef).then(() => {
            let newValues = [...QA];
            const index = newValues[i].snippets.findIndex(el => el.url === image);
            newValues[i].snippets.splice(index, 1);
            if (newValues[i].snippets?.length === 0) {
                QAInputRef.current[i].value = '';
            }
            setQA(newValues);
        }).catch((error) => {

        });
    }

    const removePoint = (idx, i) => {
        let pointsValues = [...QA[i].pointsData];
        pointsValues.splice(idx);
        setQA(prev => {
            return [...prev.slice(0, i), { ...prev[i], pointsData: pointsValues }, ...prev.slice(i + 1)]
        })
    }

    const uploadPointsImageToFireStore = async (img, i, index, idx) => {
        let blob = await fetch(img).then(r => r.blob());
        const type = blob?.type.split('/')[1];
        const path = `${`${params?.categoryId}/${params?.topicId}/question${questionId}/answer${QA[i].id}/point${QA[i].pointsData[idx].id}/snippets/image${index + 1}.${type}`}`;
        const imageRef = storageRef(storage, path, { contentType: blob?.type });
        setIsLoading(true);
        let pointsValues = [...QA[i]?.pointsData];
        uploadBytesResumable(imageRef, blob, { contentType: blob?.type })
            .then((snapshot) => {
                getDownloadURL(snapshot.ref)
                    .then((url) => {
                        setIsLoading(false);
                        pointsValues[idx].snippet[index].url = url;
                        pointsValues[idx].snippet[index].imageUploaded = true;
                        setQA(prev => {
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

    const deletePointsImage = (i, image, index) => {
        let pointsValues = [...QA[i].pointsData];
        const filtered = pointsValues[index]?.snippets?.findIndex((e) => e === image);
        pointsValues[index]?.snippets?.splice(filtered, 1);
        QAPointsInputRef.current[index].value = '';
        setQA(prev => {
            return [...prev.slice(0, i), { ...prev[i], pointsData: pointsValues }, ...prev.slice(i + 1)]
        })
        URL.revokeObjectURL(image);
    }

    const removeUploadedPointsImage = async (i, image, idx) => {
        const imageRef = storageRef(storage, image);
        deleteObject(imageRef).then(() => {
            let pointsValues = [...QA[i].pointsData];
            const index = pointsValues[idx].snippets.findIndex(el => el.url === image);
            pointsValues[idx].snippets.splice(index, 1);
            if (pointsValues[idx].snippets?.length === 0) {
                QAPointsInputRef.current[idx].value = '';
            }
            setQA(prev => {
                return [...prev.slice(0, i), { ...prev[i], pointsData: pointsValues }, ...prev.slice(i + 1)]
            })
        }).catch((error) => {

        });
    }

    const addAnotherPoint = (i) => {
        setQA(prev => {
            return [...prev.slice(0, i), { ...prev[i], pointsData: [...prev[i].pointsData, { id: QA[i]?.pointsData?.length + 1, pointHeader: '', value: '', snippets: [] }] }, ...prev.slice(i + 1)]
        })
    }

    const handleTableChange = (index, e, i) => {
        let tableValues = [...QA[i].tableColumns];
        tableValues[index][e.target.name] = e.target.value;
        setQA(prev => {
            return [...prev.slice(0, i), { ...prev[i], tableColumns: tableValues }, ...prev.slice(i + 1)]
        })
    }

    const handleTableDataChange = (index, e, i) => {
        let tableDataValues = [...QA[i].tableData];
        tableDataValues[index][e.target.name] = e.target.value;
        setQA(prev => {
            return [...prev.slice(0, i), { ...prev[i], tableData: tableDataValues }, ...prev.slice(i + 1)]
        })
    }

    const addAnotherRow = (i) => {
        setQA(prev => {
            return [...prev.slice(0, i), { ...prev[i], tableData: [...prev[i].tableData, { value1: '', value2: '' }] }, ...prev.slice(i + 1)]
        })
    }

    const removeRow = (idx, i) => {
        let rowValues = [...QA[i].tableData];
        rowValues.splice(idx);
        setQA(prev => {
            return [...prev.slice(0, i), { ...prev[i], tableData: rowValues }, ...prev.slice(i + 1)]
        })
    }

    const addAnotherAnswer = () => {
        setQA([...QA, { id: QA?.length + 1, answer: "", snippets: [], hasPoints: false, pointsData: [], hasTable: false, tableColumns: [], tableData: [], hasNote: false, note: '' }])
    }

    const removeAnswer = (i) => {
        let newValues = [...QA];
        if (newValues[i]?.snippets?.length > 0) {
            if (newValues[i]?.imageUploaded) {
                newValues[i]?.snippets.forEach((image) => {
                    removeUploadedImage(i, image);
                });
            }
        }
        newValues.splice(i, 1);
        setQA(newValues);
    }

    const handleAddQuestion = () => {

    }

    console.log(QA, 'QA');
    

    return (
        <Drawer anchor={'right'} open={openDrawer} onClose={handleCloseDrawer}>
            <div className={AddQAStyles.addQAContainer}>
                <div className={AddQAStyles.addQATitle}>
                    <div>
                        <h2>Add Question</h2>
                    </div>
                    <div>
                        <CancelIcon sx={{ cursor: 'pointer' }} onClick={handleCloseDrawer} />
                    </div>
                </div>
                <div className={AddQAStyles.addQAForm}>
                    <div className={AddQAStyles.QATitle}>
                        <FormControl sx={{ width: '100%' }}>
                        <label>Question ID <span className={AddQAStyles.required}>*</span></label>
                            <TextField
                                name='questionId'
                                value={questionId}
                                onChange={(e) => setQuestionId(e.target.value)}
                                InputProps={{
                                    type: 'text',
                                }}
                                sx={{ input: { "&::placeholder": { opacity: 0.9 } } }}
                                placeholder={"Enter Question"} size="large"
                            />
                            <label>Question <span className={AddQAStyles.required}>*</span></label>
                            <TextField
                                name='question'
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                InputProps={{
                                    type: 'text',
                                }}
                                sx={{ input: { "&::placeholder": { opacity: 0.9 } } }}
                                placeholder={"Enter Question"} size="large"
                            />
                        </FormControl>
                    </div>
                    <div className={AddQAStyles.conceptDescription}>
                        <FormControl sx={{ width: '100%' }}>
                            {QA?.map((el, i) => (
                                <>
                                    <label>Answer {QA[i]?.id}</label>
                                    <div className={AddQAStyles.QAFlex}>
                                        <div className={AddQAStyles.QADiv}>
                                            <TextField
                                                className={AddQAStyles.headerInput}
                                                name='answer'
                                                value={el?.answer || ""}
                                                onChange={(e) => handleQAChange(i, e)}
                                                InputProps={{
                                                    type: 'text',
                                                }}
                                                sx={{ input: { "&::placeholder": { opacity: 0.9 } } }}
                                                placeholder={"Enter Answer"} size="large"
                                            />
                                            <label className={`btn btn-primary ${AddQAStyles.DocUpload}`}>Upload Code Snippet(s)</label>
                                            <input ref={el => QAInputRef.current[i] = el} name='snippets' type='file' accept='.jpg,.jpeg,.png' multiple className={AddQAStyles.uploadInput} onChange={(e) => handleQAChange(i, e)} />
                                            {QA[i]?.snippets?.length > 0 &&
                                                (QA[i]?.snippets?.length > 10 ? (
                                                    <p className="error">
                                                        You can't upload more than 10 images! <br />
                                                        <span>
                                                            please delete <b> {QA[i]?.snippets.length - 10} </b> of them{" "}
                                                        </span>
                                                    </p>
                                                ) : (
                                                    <></>
                                                ))}
                                            <div className={AddQAStyles.images}>
                                                {QA[i]?.snippets &&
                                                    QA[i]?.snippets?.map((image, index) => {
                                                        return (
                                                            <div key={image} className={AddQAStyles.image}>
                                                                <img src={image?.url} className={AddQAStyles.QAImage} alt="upload" />
                                                                <div className={AddQAStyles.uploadBtnContainer}>
                                                                    <div className={AddQAStyles.imageUploadBtn}>
                                                                        <button className={AddQAStyles.uploadBtn} disabled={image?.imageUploaded} onClick={() => uploadImages(i, image?.url, index)}>{image?.imageUploaded ? 'Uploaded Successfully' : 'Upload'}</button>
                                                                    </div>
                                                                    <div>
                                                                        {!image?.imageUploaded ? <button className={AddQAStyles.imageDelete} onClick={() => deleteImage(i, image)}>
                                                                            Remove
                                                                        </button> : <button className={AddQAStyles.imageDelete} onClick={() => removeUploadedImage(i, image?.url, index)}>
                                                                            Cancel Upload
                                                                        </button>}
                                                                    </div>
                                                                </div>
                                                                {image?.imageUploadedSuccess && image?.imageUploadedSuccess === false && <div className={AddQAStyles.uploadErrorAlert}>
                                                                    <Alert autoHideDuration={3000} severity="error">
                                                                        Upload Failed! Try again later.
                                                                    </Alert>
                                                                </div>}
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                            <div className={AddQAStyles.points}>
                                                <Typography component="label">
                                                    Add Points
                                                    <Switch id='points' name='hasPoints' checked={el?.hasPoints} onChange={(e) => handleQAChange(i, e)} />
                                                </Typography>
                                                {QA[i]?.hasPoints &&
                                                    <>
                                                        {QA[i]?.pointsData?.map((point, idx) => (
                                                            <>
                                                                <div className={AddQAStyles.pointsDiv}>
                                                                    {idx ? <HighlightOffIcon titleAccess='Remove' className={AddQAStyles.removeIconPoint} onClick={() => removePoint(idx, i)} /> : null}
                                                                    <h4>Point {idx + 1}</h4>
                                                                    <label>Enter Point</label>
                                                                    <TextField
                                                                        className={AddQAStyles.pointsInput}
                                                                        name='pointHeader'
                                                                        value={point?.pointHeader || ""}
                                                                        onChange={(e) => handlePointsChange(idx, e, i)}
                                                                        InputProps={{
                                                                            type: 'text',
                                                                        }}
                                                                        sx={{ input: { "&::placeholder": { opacity: 0.9 } } }}
                                                                        placeholder={"Enter Header"} size="large"
                                                                        style={{ marginBottom: 20 }}
                                                                    />
                                                                    <TextField
                                                                        className={AddQAStyles.pointsInput}
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
                                                                        <label className={`btn btn-primary ${AddQAStyles.DocUpload}`}>Upload Code Snippet(s)</label>
                                                                        <input ref={el => QAPointsInputRef.current[idx] = el} name='snippets' type='file' accept='.jpg,.jpeg,.png' multiple className={AddQAStyles.uploadInput} onChange={(e) => handlePointsChange(idx, e, i)} />
                                                                        {QA[i]?.pointsData[idx]?.snippets?.length > 0 &&
                                                                            (QA[i]?.pointsData[idx]?.snippets?.length > 10 ? (
                                                                                <p className="error">
                                                                                    You can't upload more than 10 images! <br />
                                                                                    <span>
                                                                                        please delete <b> {QA[i]?.pointsData[idx]?.snippets.length - 10} </b> of them{" "}
                                                                                    </span>
                                                                                </p>
                                                                            ) : (
                                                                                <></>
                                                                            ))}
                                                                        <div className={AddQAStyles.images}>
                                                                            {QA[i]?.pointsData[idx]?.snippets &&
                                                                                QA[i]?.pointsData[idx]?.snippets?.map((image, index) => {
                                                                                    return (
                                                                                        <div key={image + index} className={AddQAStyles.image}>
                                                                                            <img src={image?.url} className={AddQAStyles.QAImage} alt="upload" />
                                                                                            <div className={AddQAStyles.uploadBtnContainer}>
                                                                                                <div className={AddQAStyles.imageUploadBtn}>
                                                                                                    <button className={AddQAStyles.uploadBtn} disabled={image.imageUploaded} onClick={() => uploadPointsImages(idx, i, image?.url, index)}>{image?.imageUploaded ? 'Uploaded Successfully' : 'Upload'}</button>
                                                                                                </div>
                                                                                                <div>
                                                                                                    {!image.imageUploaded ? <button className={AddQAStyles.imageDelete} onClick={() => deletePointsImage(i, image, idx)}>
                                                                                                        Delete
                                                                                                    </button> : <button className={AddQAStyles.imageDelete} onClick={() => removeUploadedPointsImage(i, image?.url, idx, index)}>
                                                                                                        Cancel Upload
                                                                                                    </button>}
                                                                                                </div>
                                                                                            </div>
                                                                                            {image?.imageUploadedSuccess && image?.imageUploadedSuccess === false && <div className={AddQAStyles.uploadErrorAlert}>
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
                                                        <h6 className={AddQAStyles.anotherAnswer}><u onClick={() => addAnotherPoint(i)}>Add Another Point</u></h6>
                                                    </>}
                                            </div>
                                            <div className={AddQAStyles.table}>
                                                <Typography component="label">
                                                    Add Table
                                                    <Switch id='table' name='hasTable' checked={el?.hasTable} onChange={(e) => handleQAChange(i, e)} />
                                                </Typography>
                                                {QA[i].hasTable ?
                                                    <>
                                                        <div>
                                                            <h4>Table Columns</h4>
                                                            {QA[i]?.tableColumns?.map((el, index) =>
                                                                <TextField
                                                                    className={AddQAStyles.columnInput}
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
                                                            {QA[i]?.tableData?.map((el, index) =>
                                                                <>
                                                                    <div className={AddQAStyles.tableDataFlex}>
                                                                        <div className={AddQAStyles.tableData}>
                                                                            <TextField
                                                                                className={AddQAStyles.columnInput}
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
                                                                                className={AddQAStyles.columnInput}
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
                                                                                    <HighlightOffIcon titleAccess='Remove' className={AddQAStyles.removeIcon} onClick={() => removeRow(index, i)} />
                                                                                    : null
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </>

                                                            )}
                                                            <h6 className={AddQAStyles.anotherAnswer}><u onClick={() => addAnotherRow(i)}>Add Another Row</u></h6>
                                                        </div>
                                                    </> : null}

                                            </div>
                                            <div className={AddQAStyles.note}>
                                                <Typography component="label">
                                                    Add Note
                                                    <Switch id='note' name='hasNote' checked={el?.hasNote} onChange={(e) => handleQAChange(i, e)} />
                                                </Typography>
                                                {QA[i].hasNote ?
                                                    <>
                                                        <div>
                                                            <h4>Note</h4>
                                                            <TextField
                                                                className={AddQAStyles.columnInput}
                                                                name='note'
                                                                value={el?.note || ""}
                                                                onChange={(e) => handleQAChange(i, e)}
                                                                InputProps={{
                                                                    type: 'text',
                                                                }}
                                                                sx={{ input: { "&::placeholder": { opacity: 0.9 } } }}
                                                                placeholder={"Enter Note"} size="large"
                                                            />

                                                        </div>
                                                    </> : null}

                                            </div>
                                        </div>
                                        <div className={AddQAStyles.remove}>
                                            {
                                                i ?
                                                    <HighlightOffIcon titleAccess='Remove' className={AddQAStyles.removeIcon} onClick={() => removeAnswer(i)} />
                                                    : null
                                            }
                                        </div>

                                    </div>

                                </>
                            ))}
                            <h6 className={AddQAStyles.anotherAnswer}><u onClick={addAnotherAnswer}>Add Another Answer</u></h6>
                        </FormControl>
                    </div>
                    <div className={AddQAStyles.editBtnContainer}>
                        <div>
                            <CommonButton variant="contained" bgColor={'#5b67f1'} color={'white'} padding={'15px'} borderRadius={'5px'} fontWeight={'bold'} width={'100%'} height={'45px'} margin={'20px 0 0 0'} onClick={() => handleAddQuestion()} disabled={!question}>Save</CommonButton>
                        </div>
                        <div>
                            <CommonButton variant="contained" bgColor={'#f8f8f8'} color={'black'} padding={'15px'} borderRadius={'5px'} fontWeight={'bold'} width={'100%'} height={'45px'} margin={'20px 0 0 0'} border={'1px solid #ddd'} onClick={handleCloseDrawer}>Cancel</CommonButton>
                        </div>
                    </div>
                </div>
            </div>
        </Drawer>
    )
}

export default AddQA