import React, { useCallback, useEffect, useRef, useState } from 'react';
import AddSnippetStyles from './AddSnippetStyles.module.css';
import { v4 as uuidv4 } from 'uuid';
import CancelIcon from '@mui/icons-material/Cancel';
import { Alert, Drawer, FormControl, Switch, TextField, Typography } from '@mui/material';
import CommonButton from '../CommonButton';
import { toPng } from 'html-to-image';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { getDownloadURL, ref as storageRef, uploadBytesResumable, deleteObject } from "firebase/storage";
import { storage } from '../../firebaseConfig';
import Loader from '../Loader/Loader';
import { useFetchAPI } from '../../Hooks/useAPI';
import { CommonHeaders } from '../CommonHeaders';
import { fetchQueryParams } from '../../Hooks/fetchQueryParams';
import ConfirmationDialog from '../ConfirmationDialog/ConfirmationDialog';

const AddSnippet = (props) => {

    const { setAddSnippetClicked, setEditClicked, editClicked, editItem, params, getSnippet } = props;

    const [openDrawer, setOpenDrawer] = useState(false);
    const [title, setTitle] = useState('');
    const [titleId, setTitleId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [snippet, setSnippet] = useState([
        { id: 1, code: '', explanation: [{ id: 1, value: '' }], snippet: [], hasNote: false, note: '', imageConverted: false },
    ])
    const [enabled, setEnabled] = useState(true);
    const ref = useRef([]);
    const textareaRef = useRef(null);
    const [callCreateSnippetApi, setCallCreateSnippetApi] = useState(false);
    const [callEditSnippetApi, setCallEditSnippetApi] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        setOpenDrawer(true);
        const uuid = uuidv4();
        editClicked ? setTitleId(editItem?.titleId) : setTitleId(`${params?.categoryId}-${params?.topicId}-${uuid}`);
        if(editClicked) {
            setTitle(editItem?.title);
            setSnippet(editItem?.data);
            setEnabled(editItem?.enabled)
        }
    }, [])

    const handleCloseDrawer = () => {
        setOpenDrawer(false);
        setAddSnippetClicked(false);
        setEditClicked(false);
    }

    const addAnotherCode = () => {
        setSnippet([...snippet, { id: snippet?.length + 1, code: "", explanation: [{ id: 1, value: '' }], snippet: [], hasNote: false, note: '', imageConverted: false }])
    }

    const base64toObjectUrl = (bytesBase64, i, snippet) => {
        let mimeType = bytesBase64.split(',')[0].split(':')[1].split(';')[0]
        var fileUrl = "data:" + mimeType + ";base64," + bytesBase64;
        let newValues = [...snippet];
        fetch(bytesBase64)
            .then(response => response.blob())
            .then(blob => {
                let url = window.URL.createObjectURL(blob, { type: mimeType });
                console.log(url, 'object url');
                if (url) {
                    const image = [{ url: url, imageUploaded: false }];
                    setSnippet((prev) => ({ ...prev, snippet: [snippet[i]?.snippet.concat(image)] }));
                    newValues[i]['snippet'] = image;
                    newValues[i].imageConverted = true;
                    setSnippet(newValues);
                }
            });
    }

    console.log(snippet, 'snippet');

    const onButtonClick = useCallback((i, snippet) => {
        if (ref.current[i] === null) {
            return;
        }
        toPng(ref.current[i], { cacheBust: true, })
            .then((dataUrl) => {
                console.log(dataUrl);
                base64toObjectUrl(dataUrl, i, snippet)
            })
            .catch((err) => {
                console.log(err)
            })
    }, [ref])

    const handleSnippetChange = (i, e) => {
        let newValues = [...snippet];
        if (e.target.type === 'checkbox') {
            if (e.target.id === 'note') {
                newValues[i]['hasNote'] = e.target.checked;
                if (newValues[i]['hasNote']) {
                    newValues[i]['note'] = '';
                } else {
                    newValues[i]['note'] = '';
                }
            }
        }
        else {
            newValues[i][e.target.name] = e.target.value;
            newValues[i].imageConverted = false;
        }
        setSnippet(newValues);
    }

    const removeUploadedImage = async (i, image) => {
        const imageRef = storageRef(storage, image);
        setIsLoading(true);
        deleteObject(imageRef).then(() => {
            let newValues = [...snippet];
            const index = newValues[i].snippet.findIndex(el => el.url === image);
            newValues[i].snippet.splice(index, 1);
            setSnippet(newValues);
            setIsLoading(false);
        }).catch((error) => {
            setIsLoading(false);
        });
    }

    const genericRemoveUploadedImage = (image) => {
        const imageRef = storageRef(storage, image);
        deleteObject(imageRef).then(() => {
        }).catch((error) => {
        });
    }

    const removeCode = (i) => {
        let newValues = [...snippet];
        if (newValues[i]?.snippet?.length > 0) {
            if (newValues[i]?.imageUploaded) {
                newValues[i]?.snippet.forEach((image) => {
                    removeUploadedImage(i, image);
                });
            }
        }
        newValues.splice(i, 1);
        setSnippet(newValues);
    }

    const handleExplanationChange = (idx, e, i) => {
        let explainValues = [...snippet[i].explanation];
        explainValues[idx][e.target.name] = e.target.value;
        setSnippet(prev => {
            return [...prev.slice(0, i), { ...prev[i], explanation: explainValues }, ...prev.slice(i + 1)]
        })
    }

    const addAnotherExplanation = (i) => {
        setSnippet(prev => {
            return [...prev.slice(0, i), { ...prev[i], explanation: [...prev[i].explanation, { id: snippet[i]?.explanation?.length + 1, value: '' }] }, ...prev.slice(i + 1)]
        })
    }

    const removeExplanation = (idx, i, point) => {
        let explainValues = [...snippet[i].explanation];
        explainValues.splice(idx);
        setSnippet(prev => {
            return [...prev.slice(0, i), { ...prev[i], explanation: explainValues }, ...prev.slice(i + 1)]
        })
    }

    const handleCodeConvert = (i) => {
        onButtonClick(i, snippet)
    }

    const handleCancel = (i) => {
        let newValues = [...snippet];
        newValues[i].code = '';
        newValues[i].snippet = [];
        newValues[i].imageConverted = false;
        setSnippet(newValues);
    }

    const uploadImageToFireStore = async (img, i, index) => {
        let blob = await fetch(img).then(r => r.blob());
        const type = blob?.type.split('/')[1];
        const path = `${`${params?.categoryId}/${params?.topicId}/${titleId}/code${snippet[i].id}/snippets/image${index + 1}.${type}`}`;
        const imageRef = storageRef(storage, path, { contentType: blob?.type });
        setIsLoading(true);
        let newValues = [...snippet];
        uploadBytesResumable(imageRef, blob, { contentType: blob?.type })
            .then((snapshot) => {
                getDownloadURL(snapshot.ref)
                    .then((url) => {
                        setIsLoading(false);
                        newValues[i].snippet[index].url = url;
                        newValues[i].snippet[index].imageUploaded = true;
                        setSnippet(newValues);
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

    const deleteImage = (i, image) => {
        let newValues = [...snippet];
        const filtered = newValues[i]?.snippet?.findIndex((e) => e === image);
        newValues[i]?.snippet?.splice(filtered, 1);
        setSnippet(newValues);
        URL.revokeObjectURL(image);
    }

    let addSnippetPayload = {
        categoryId: params?.categoryId,
        topicId: params?.topicId,
        titleId,
        title,
        data: snippet,
        enabled: editClicked ? enabled : undefined
    };

    const handleAddSnippet = () => {
        editClicked ? setCallEditSnippetApi(true) : setCallCreateSnippetApi(true);
    }

    const onAddSnippetSuccess = res => {
        editClicked ? setCallEditSnippetApi(false) : setCallCreateSnippetApi(false);
        setErrorMessage('');
        setSuccessMessage('')
        if ((res?.status === 200 || res?.status === 201)) {
            setOpenDrawer(false);
            setAddSnippetClicked(false);
            setOpenModal(true);
            getSnippet.refetch();
            setErrorMessage('');
            setSuccessMessage(editClicked ? 'Snippet updated successfully' :`Snippet added successfully`);
        } else {
            setOpenModal(true);
            setErrorMessage(res?.data?.detail ? res?.data?.detail : 'Something went wrong. Please try again later')
        }
    }

    const handleClosePopup = () => {
        setOpenModal(false);
        setEditClicked(false);
    }

    const createSnippet = useFetchAPI("createSnippet", `/snippets/addSnippet`, "POST", addSnippetPayload, CommonHeaders(), fetchQueryParams("", "", "", onAddSnippetSuccess, "", callCreateSnippetApi));
    const editSnippet = useFetchAPI("editSnippet", `/snippets/updateSnippet`, "POST", addSnippetPayload, CommonHeaders(), fetchQueryParams("", "", "", onAddSnippetSuccess, "", callEditSnippetApi));

    const fetching = createSnippet?.Loading || createSnippet?.Fetching || editSnippet?.Loading || editSnippet?.Fetching;

    return (
        <>
            {(fetching || isLoading) && <Loader showLoader={fetching || isLoading} />}
            <Drawer anchor={'right'} open={openDrawer} onClose={handleCloseDrawer}>
                <div className={AddSnippetStyles.addQAContainer}>
                    <div className={AddSnippetStyles.addQATitle}>
                        <div>
                            <h2>{editClicked ? 'Edit Snippet' : 'Add Snippet'}</h2>
                        </div>
                        <div>
                            <CancelIcon sx={{ cursor: 'pointer' }} onClick={handleCloseDrawer} />
                        </div>
                    </div>
                    <div className={AddSnippetStyles.addQAForm}>
                        <div className={AddSnippetStyles.QATitle}>
                            {editClicked && <Typography component="label" sx={{ float: 'right' }}>
                                Enable
                                <Switch id='enabled' name='enabled' checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
                            </Typography>}
                            <FormControl sx={{ width: '100%' }}>
                                <label>Question/Title ID <span className={AddSnippetStyles.required}>*</span></label>
                                <TextField
                                    name='titleId'
                                    value={titleId}
                                    onChange={(e) => setTitleId(e.target.value)}
                                    InputProps={{
                                        type: 'text',
                                    }}
                                    sx={{ input: { "&::placeholder": { opacity: 0.9 } } }}
                                    disabled
                                />
                                <label>Question/Title <span className={AddSnippetStyles.required}>*</span></label>
                                <TextField
                                    name='title'
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    InputProps={{
                                        type: 'text',
                                    }}
                                    sx={{ input: { "&::placeholder": { opacity: 0.9 } } }}
                                    placeholder={"Enter Title"} size="large"
                                />
                            </FormControl>
                        </div>
                        <div className={AddSnippetStyles.conceptDescription}>
                            <FormControl sx={{ width: '100%' }}>
                                {snippet?.map((el, i) => (
                                    <>
                                        <label>Code {snippet[i]?.id}</label>
                                        <div className={AddSnippetStyles.QAFlex}>
                                            <div className={AddSnippetStyles.QADiv}>
                                                <textarea
                                                    ref={textareaRef}
                                                    className={AddSnippetStyles.headerInput}
                                                    name='code'
                                                    style={{ height: 200 }}
                                                    value={el?.code || ""}
                                                    onChange={(e) => handleSnippetChange(i, e)}
                                                    placeholder={"Enter Code"} size="large"
                                                    disabled={ snippet[i]?.snippet[0]?.imageUploaded }
                                                ></textarea>
                                                {snippet[i].code?.length > 0 && <div>
                                                    <h5>Output</h5>
                                                    <div className={AddSnippetStyles.codeDiv} ref={els => ref.current[i] = els}>
                                                        <pre>
                                                            <code>
                                                                {snippet[i].code}
                                                            </code>
                                                        </pre>
                                                    </div>
                                                </div>}
                                                {snippet[i].code?.length > 0 && <div style={{ marginBottom: 10 }}>
                                                     <CommonButton variant="contained" bgColor={'#5b67f1'} color={'white'} padding={'15px'} borderRadius={'5px'} fontWeight={'bold'} width={'40%'} height={'45px'} margin={'20px 0 0 0'} disabled={snippet[i]?.imageConverted || snippet[i]?.snippet[0]?.imageUploaded} onClick={() => handleCodeConvert(i)}>Convert this code to image</CommonButton>
                                                    <CommonButton variant="contained" bgColor={'#5b67f1'} color={'white'} padding={'15px'} borderRadius={'5px'} fontWeight={'bold'} width={'20%'} height={'45px'} margin={'20px 0 0 10px'} disabled={ snippet[i]?.snippet[0]?.imageUploaded } onClick={() => handleCancel(i)}>Cancel</CommonButton>
                                                </div>}
                                                <div className={AddSnippetStyles.images}>
                                                    {snippet[i]?.snippet &&
                                                        snippet[i]?.snippet?.map((image, index) => {
                                                            return (
                                                                <div key={image} className={AddSnippetStyles.image}>
                                                                    <img src={image?.url} className={AddSnippetStyles.QAImage} alt="upload" />
                                                                    <div className={AddSnippetStyles.uploadBtnContainer}>
                                                                        <div className={AddSnippetStyles.imageUploadBtn}>
                                                                            <button className={AddSnippetStyles.uploadBtn} disabled={image?.imageUploaded} onClick={() => uploadImages(i, image?.url, index)}>{image?.imageUploaded ? 'Uploaded Successfully' : 'Upload'}</button>
                                                                        </div>
                                                                        <div>
                                                                            {!image?.imageUploaded ? <button className={AddSnippetStyles.imageDelete} onClick={() => deleteImage(i, image)}>
                                                                                Remove
                                                                            </button> : <button className={AddSnippetStyles.imageDelete} onClick={() => removeUploadedImage(i, image?.url, index)}>
                                                                                Cancel Upload
                                                                            </button>}
                                                                        </div>
                                                                    </div>
                                                                    {image?.imageUploadedSuccess && image?.imageUploadedSuccess === false && <div className={AddSnippetStyles.uploadErrorAlert}>
                                                                        <Alert autoHideDuration={3000} severity="error">
                                                                            Upload Failed! Try again later.
                                                                        </Alert>
                                                                    </div>}
                                                                </div>
                                                            );
                                                        })}
                                                </div>
                                                {snippet[i]?.explanation?.map((explain, idx) => (
                                                    <>
                                                        <div className={AddSnippetStyles.pointsDiv}>
                                                            {idx ? <HighlightOffIcon titleAccess='Remove' className={AddSnippetStyles.removeIconPoint} onClick={() => removeExplanation(idx, i, explain)} /> : null}
                                                            <h4>Explanation {idx + 1}</h4>
                                                            <label>Enter Explanation</label>
                                                            <TextField
                                                                className={AddSnippetStyles.headerInput}
                                                                name='value'
                                                                value={explain?.value || ""}
                                                                onChange={(e) => handleExplanationChange(idx, e, i)}
                                                                InputProps={{
                                                                    type: 'text',
                                                                }}
                                                                sx={{ input: { "&::placeholder": { opacity: 0.9 } } }}
                                                                placeholder={"Enter Explanation"} size="large"
                                                            />
                                                        </div>
                                                    </>
                                                ))}
                                                <h6 className={AddSnippetStyles.anotherAnswer}><u onClick={() => addAnotherExplanation(i)}>Add Another Explanation</u></h6>
                                                <div className={AddSnippetStyles.note}>
                                                    <Typography component="label">
                                                        Add Note
                                                        <Switch id='note' name='hasNote' checked={el?.hasNote} onChange={(e) => handleSnippetChange(i, e)} />
                                                    </Typography>
                                                    {snippet[i].hasNote ?
                                                        <>
                                                            <div>
                                                                <h4>Note</h4>
                                                                <TextField
                                                                    className={AddSnippetStyles.columnInput}
                                                                    name='note'
                                                                    value={el?.note || ""}
                                                                    onChange={(e) => handleSnippetChange(i, e)}
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
                                            <div className={AddSnippetStyles.remove}>
                                                {
                                                    i ?
                                                        <HighlightOffIcon titleAccess='Remove' className={AddSnippetStyles.removeIcon} onClick={() => removeCode(i, el)} />
                                                        : null
                                                }
                                            </div>
                                        </div>

                                    </>
                                ))}
                                <h6 className={AddSnippetStyles.anotherAnswer}><u onClick={addAnotherCode}>Add Another Code</u></h6>
                            </FormControl>
                        </div>
                        <div className={AddSnippetStyles.editBtnContainer}>
                            <div>
                                <CommonButton variant="contained" bgColor={'#5b67f1'} color={'white'} padding={'15px'} borderRadius={'5px'} fontWeight={'bold'} width={'100%'} height={'45px'} margin={'20px 0 0 0'} onClick={() => handleAddSnippet()} disabled={!title}>Save</CommonButton>
                            </div>
                            <div>
                                <CommonButton variant="contained" bgColor={'#f8f8f8'} color={'black'} padding={'15px'} borderRadius={'5px'} fontWeight={'bold'} width={'100%'} height={'45px'} margin={'20px 0 0 0'} border={'1px solid #ddd'} onClick={handleCloseDrawer}>Cancel</CommonButton>
                            </div>
                        </div>
                    </div>
                </div>
            </Drawer>
            <ConfirmationDialog openDialog={openModal} errorMessage={errorMessage} successMessage={successMessage} handleCloseDialog={handleClosePopup} />
        </>
    )
}

export default AddSnippet