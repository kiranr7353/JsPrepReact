import React, { useCallback, useEffect, useRef, useState } from 'react';
import AddProgrammingQAStyles from './AddProgrammingQAStyles.module.css'
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

const AddProgrammingQA = (props) => {

    const { setAddPQAClicked, setEditClicked, editClicked, editItem, params, getPQA } = props;

    const [openDrawer, setOpenDrawer] = useState(false);
    const [title, setTitle] = useState('');
    const [titleId, setTitleId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [pQA, setPQA] = useState([
        { id: 1, approachHeader: '', approachExplain: '', approachCode: [{ id: 1, code: '', snippet: [], fileName: '', value: '', imageConverted: false }], hasNote: false, note: '' },
    ])
    const [enabled, setEnabled] = useState(true);
    const ref = useRef([]);
    const textareaRef = useRef(null);
    const [callCreatePQAApi, setCallCreatePQAApi] = useState(false);
    const [callEditPQAApi, setCallEditPQAApi] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        setOpenDrawer(true);
        const uuid = uuidv4();
        editClicked ? setTitleId(editItem?.titleId) : setTitleId(`${params?.categoryId}-${params?.topicId}-${uuid}`);
        if (editClicked) {
            setTitle(editItem?.title);
            setPQA(editItem?.data);
            setEnabled(editItem?.enabled)
        }
    }, [])

    const handleCloseDrawer = () => {
        setOpenDrawer(false);
        setAddPQAClicked(false);
        setEditClicked(false);
    }

    const addAnotherApproach = () => {
        setPQA([...pQA, { id: pQA?.length + 1, approachHeader: '', approachExplain: '', approachCode: [{ id: 1, code: '', snippet: [], fileName: '', imageConverted: false }], hasNote: false, note: '' }])
    }

    const base64toObjectUrl = (bytesBase64, i, pQA, index) => {
        let mimeType = bytesBase64.split(',')[0].split(':')[1].split(';')[0]
        var fileUrl = "data:" + mimeType + ";base64," + bytesBase64;
        let newValues = [...pQA[i].approachCode];
        fetch(bytesBase64)
            .then(response => response.blob())
            .then(blob => {
                let url = window.URL.createObjectURL(blob, { type: mimeType });
                console.log(url, 'object url');
                if (url) {
                    const image = [{ url: url, imageUploaded: false }];
                    setPQA(prev => {
                        return [...prev.slice(0, i), { ...prev[i], approachCode: { ...pQA[i].approachCode[index], snippet: [pQA[i]?.approachCode[index]?.snippet.concat(image)] } }, ...prev.slice(i + 1)]
                    })
                    newValues[index].snippet = image;
                    newValues[index].imageConverted = true;
                    setPQA(prev => {
                        return [...prev.slice(0, i), { ...prev[i], approachCode: newValues }, ...prev.slice(i + 1)]
                    })
                }
            });
    }

    console.log(pQA, 'pQA');

    const onButtonClick = useCallback((i, pQA, index) => {
        if (ref.current[index] === null) {
            return;
        }
        toPng(ref.current[index], { cacheBust: true, })
            .then((dataUrl) => {
                console.log(dataUrl);
                base64toObjectUrl(dataUrl, i, pQA, index)
            })
            .catch((err) => {
                console.log(err)
            })
    }, [ref])

    const handleSnippetChange = (i, e) => {
        let newValues = [...pQA];
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
        }
        setPQA(newValues);
    }

    const removeUploadedImage = async (i, image) => {
        const imageRef = storageRef(storage, image);
        setIsLoading(true);
        deleteObject(imageRef).then(() => {
            let newValues = [...pQA];
            const index = newValues[i].snippet.findIndex(el => el.url === image);
            newValues[i].snippet.splice(index, 1);
            setPQA(newValues);
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
        let newValues = [...pQA];
        if (newValues[i]?.approachCode?.length > 0) {
            newValues[i]?.approachCode.forEach((appCode) => {
                if (appCode?.snippet?.length > 0) {
                    appCode?.snippet?.forEach(image => {
                        if (image?.imageUploaded) {
                            genericRemoveUploadedImage(image?.url);
                        }
                    })
                }
            });
        }
        newValues.splice(i, 1);
        setPQA(newValues);
    }

    const handleCodeChange = (idx, i, e) => {
        let codeValues = [...pQA[i].approachCode];
        codeValues[idx][e.target.name] = e.target.value;
        codeValues[idx].imageConverted = false;
        setPQA(prev => {
            return [...prev.slice(0, i), { ...prev[i], approachCode: codeValues }, ...prev.slice(i + 1)]
        })
    }

    const addAnotherCode = (i) => {
        setPQA(prev => {
            return [...prev.slice(0, i), { ...prev[i], approachCode: [...prev[i].approachCode, { id: pQA[i]?.approachCode?.length + 1, code: '', snippet: [], fileName: '', imageConverted: '', value: '' }] }, ...prev.slice(i + 1)]
        })
    }

    const removeAppCode = (idx, i) => {
        let codeValues = [...pQA[i].approachCode];
        if (codeValues[idx].snippet?.length > 0) {
            codeValues[idx].snippet?.forEach(image => {
                if (image?.imageUploaded) {
                    genericRemoveUploadedImage(image?.url);
                }
            })
        }
        codeValues.splice(idx);
        setPQA(prev => {
            return [...prev.slice(0, i), { ...prev[i], approachCode: codeValues }, ...prev.slice(i + 1)]
        })
    }

    const handleCodeConvert = (i, index) => {
        onButtonClick(i, pQA, index)
    }

    const handleCancel = (i, index) => {
        let newValues = [...pQA[i].approachCode];
        newValues[index].code = '';
        newValues[index].snippet = [];
        newValues[index].imageConverted = false;
        setPQA(prev => {
            return [...prev.slice(0, i), { ...prev[i], approachCode: newValues }, ...prev.slice(i + 1)]
        })
    }

    const uploadImageToFireStore = async (img, i, index, index2) => {
        let blob = await fetch(img).then(r => r.blob());
        const type = blob?.type.split('/')[1];
        const path = `${`${params?.categoryId}/${params?.topicId}/${titleId}/approach${pQA[i].id}/code${pQA[i].approachCode[index2].id}/snippets/image${index + 1}.${type}`}`;
        const imageRef = storageRef(storage, path, { contentType: blob?.type });
        setIsLoading(true);
        let newValues = [...pQA[i].approachCode];
        uploadBytesResumable(imageRef, blob, { contentType: blob?.type })
            .then((snapshot) => {
                getDownloadURL(snapshot.ref)
                    .then((url) => {
                        setIsLoading(false);
                        newValues[index2].snippet[0].url = url;
                        newValues[index2].snippet[0].imageUploaded = true;
                        setPQA(prev => {
                            return [...prev.slice(0, i), { ...prev[i], approachCode: newValues }, ...prev.slice(i + 1)]
                        })
                        return url;
                    })
                    .catch((error) => {
                        setIsLoading(false);
                        newValues[index2].snippet[0].imageUploadedSuccess = false;
                    });
            })
            .catch((error) => {
                setIsLoading(false);
                newValues[index2].snippet[0].imageUploadedSuccess = false;
            });
    }

    const uploadImages = async (i, url, imageIndex, index) => {
        await uploadImageToFireStore(url, i, imageIndex, index)
    }

    const deleteImage = (i, image) => {
        let newValues = [...pQA];
        const filtered = newValues[i]?.snippet?.findIndex((e) => e === image);
        newValues[i]?.snippet?.splice(filtered, 1);
        setPQA(newValues);
        URL.revokeObjectURL(image);
    }

    let addPQAPayload = {
        categoryId: params?.categoryId,
        topicId: params?.topicId,
        titleId,
        title,
        data: pQA,
        enabled: editClicked ? enabled : undefined
    };

    const handleAddSnippet = () => {
        editClicked ? setCallEditPQAApi(true) : setCallCreatePQAApi(true);
    }

    const onAddPQASuccess = res => {
        editClicked ? setCallEditPQAApi(false) : setCallCreatePQAApi(false);
        setErrorMessage('');
        setSuccessMessage('')
        if ((res?.status === 200 || res?.status === 201)) {
            setOpenDrawer(false);
            setAddPQAClicked(false);
            setOpenModal(true);
            getPQA.refetch();
            setErrorMessage('');
            setSuccessMessage(editClicked ? 'Programmming QA updated successfully' : `Programmming QA added successfully`);
        } else {
            setOpenModal(true);
            setErrorMessage(res?.data?.detail ? res?.data?.detail : 'Something went wrong. Please try again later')
        }
    }

    const handleClosePopup = () => {
        setOpenModal(false);
        setEditClicked(false);
    }

    const createPQA = useFetchAPI("createPQA", `/programmingQA/addProgrammingQA`, "POST", addPQAPayload, CommonHeaders(), fetchQueryParams("", "", "", onAddPQASuccess, "", callCreatePQAApi));
    const editPQA = useFetchAPI("editPQA", `/programmingQA/updateProgrammingQA`, "POST", addPQAPayload, CommonHeaders(), fetchQueryParams("", "", "", onAddPQASuccess, "", callEditPQAApi));

    const fetching = createPQA?.Loading || createPQA?.Fetching || editPQA?.Loading || editPQA?.Fetching;

    return (
        <>
            {(fetching || isLoading) && <Loader showLoader={fetching || isLoading} />}
            <Drawer anchor={'right'} open={openDrawer} onClose={handleCloseDrawer}>
                <div className={AddProgrammingQAStyles.addQAContainer}>
                    <div className={AddProgrammingQAStyles.addQATitle}>
                        <div>
                            <h2 className={AddProgrammingQAStyles.title}>{editClicked ? 'Edit Snippet' : 'Add Snippet'}</h2>
                        </div>
                        <div>
                            <CancelIcon className={AddProgrammingQAStyles.cancelIcon} sx={{ cursor: 'pointer' }} onClick={handleCloseDrawer} />
                        </div>
                    </div>
                    <div className={AddProgrammingQAStyles.addQAForm}>
                        <div className={AddProgrammingQAStyles.QATitle}>
                            {editClicked && <Typography component="label" sx={{ float: 'right' }}>
                                Enable
                                <Switch id='enabled' name='enabled' checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
                            </Typography>}
                            <FormControl sx={{ width: '100%' }}>
                                <label>Question/Title ID</label>
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
                                <label>Question/Title <span className={AddProgrammingQAStyles.required}>*</span></label>
                                <TextField
                                    name='title'
                                    value={title}
                                    className={AddProgrammingQAStyles.headerInput}
                                    onChange={(e) => setTitle(e.target.value)}
                                    InputProps={{
                                        type: 'text',
                                    }}
                                    sx={{ input: { "&::placeholder": { opacity: 0.9 } } }}
                                    placeholder={"Enter Title"} size="large"
                                />
                            </FormControl>
                        </div>
                        <div className={AddProgrammingQAStyles.conceptDescription}>
                            <FormControl sx={{ width: '100%' }}>
                                {pQA?.map((el, i) => (
                                    <>
                                        <label>Approach {pQA[i]?.id}</label>
                                        <div className={AddProgrammingQAStyles.QAFlex}>
                                            <div className={AddProgrammingQAStyles.QADiv}>
                                                <label>Header</label>
                                                <TextField
                                                    className={AddProgrammingQAStyles.headerInput}
                                                    name='approachHeader'
                                                    value={el?.approachHeader || ""}
                                                    onChange={(e) => handleSnippetChange(i, e)}
                                                    InputProps={{
                                                        type: 'text',
                                                    }}
                                                    sx={{ input: { "&::placeholder": { opacity: 0.9 } } }}
                                                    placeholder={"Enter Header"} size="large"
                                                />
                                                <label>Approach Explanation</label>
                                                <TextField
                                                    className={AddProgrammingQAStyles.headerInput}
                                                    name='approachExplain'
                                                    value={el?.approachExplain || ""}
                                                    onChange={(e) => handleSnippetChange(i, e)}
                                                    InputProps={{
                                                        type: 'text',
                                                    }}
                                                    sx={{ input: { "&::placeholder": { opacity: 0.9 } } }}
                                                    placeholder={"Enter Explanation"} size="large"
                                                />
                                                {pQA[i]?.approachCode?.map((appCd, index) => (
                                                    <div>
                                                        {index ? <HighlightOffIcon titleAccess='Remove' className={AddProgrammingQAStyles.removeIconPoint} onClick={() => removeAppCode(index, i)} /> : null}
                                                        <label>File Name (if any)</label>
                                                        <TextField
                                                            className={AddProgrammingQAStyles.headerInput}
                                                            name='fileName'
                                                            value={appCd?.fileName || ""}
                                                            onChange={(e) => handleCodeChange(index, i, e)}
                                                            InputProps={{
                                                                type: 'text',
                                                            }}
                                                            sx={{ input: { "&::placeholder": { opacity: 0.9 } } }}
                                                            placeholder={"Enter File Name"} size="large"
                                                        />
                                                        <textarea
                                                            ref={textareaRef}
                                                            className={AddProgrammingQAStyles.headerInput}
                                                            name='code'
                                                            style={{ height: 200 }}
                                                            value={appCd?.code || ""}
                                                            onChange={(e) => handleCodeChange(index, i, e)}
                                                            placeholder={"Enter Code"} size="large"
                                                            disabled={pQA[i].approachCode[index]?.snippet[0]?.imageUploaded || pQA[i].approachCode[index]?.snippet[0]?.imageConverted}
                                                        ></textarea>
                                                        <label>Code Explanation (if any)</label>
                                                        <TextField
                                                            className={AddProgrammingQAStyles.headerInput}
                                                            name='value'
                                                            value={appCd?.value || ""}
                                                            onChange={(e) => handleCodeChange(index, i, e)}
                                                            InputProps={{
                                                                type: 'text',
                                                            }}
                                                            sx={{ input: { "&::placeholder": { opacity: 0.9 } } }}
                                                            placeholder={"Enter Explanation"} size="large"
                                                        />
                                                        {pQA[i].approachCode[index].code?.length > 0 && <div>
                                                            <h5>Output</h5>
                                                            <div className={AddProgrammingQAStyles.codeDiv} ref={els => ref.current[index] = els}>
                                                                <pre>
                                                                    <code>
                                                                        {pQA[i].approachCode[index]?.code}
                                                                    </code>
                                                                </pre>
                                                            </div>
                                                        </div>}
                                                        {pQA[i].approachCode[index].code?.length > 0 && <div style={{ marginBottom: 10 }}>
                                                            <CommonButton variant="contained" bgColor={'#5b67f1'} color={'white'} padding={'15px'} borderRadius={'5px'} fontWeight={'bold'} width={'40%'} height={'45px'} margin={'20px 0 0 0'} disabled={pQA[i]?.approachCode[index]?.imageConverted || pQA[i]?.approachCode[index]?.snippet[0]?.imageUploaded} onClick={() => handleCodeConvert(i, index)}>Convert this code to image</CommonButton>
                                                            <CommonButton variant="contained" bgColor={'#5b67f1'} color={'white'} padding={'15px'} borderRadius={'5px'} fontWeight={'bold'} width={'20%'} height={'45px'} margin={'20px 0 0 10px'} disabled={pQA[i]?.approachCode[index]?.snippet[0]?.imageUploaded} onClick={() => handleCancel(i, index)}>Cancel</CommonButton>
                                                        </div>}
                                                        <div className={AddProgrammingQAStyles.images}>
                                                            {pQA[i].approachCode[index]?.snippet &&
                                                                pQA[i].approachCode[index]?.snippet?.map((image, idx) => {
                                                                    return (
                                                                        <div key={image} className={AddProgrammingQAStyles.image}>
                                                                            <img src={image?.url} className={AddProgrammingQAStyles.QAImage} alt="upload" />
                                                                            <div className={AddProgrammingQAStyles.uploadBtnContainer}>
                                                                                <div className={AddProgrammingQAStyles.imageUploadBtn}>
                                                                                    <button className={AddProgrammingQAStyles.uploadBtn} disabled={image?.imageUploaded} onClick={() => uploadImages(i, image?.url, idx, index)}>{image?.imageUploaded ? 'Uploaded Successfully' : 'Upload'}</button>
                                                                                </div>
                                                                                <div>
                                                                                    {!image?.imageUploaded ? <button className={AddProgrammingQAStyles.imageDelete} onClick={() => deleteImage(i, image)}>
                                                                                        Remove
                                                                                    </button> : <button className={AddProgrammingQAStyles.imageDelete} onClick={() => removeUploadedImage(i, image?.url, idx)}>
                                                                                        Cancel Upload
                                                                                    </button>}
                                                                                </div>
                                                                            </div>
                                                                            {image?.imageUploadedSuccess && image?.imageUploadedSuccess === false && <div className={AddProgrammingQAStyles.uploadErrorAlert}>
                                                                                <Alert autoHideDuration={3000} severity="error">
                                                                                    Upload Failed! Try again later.
                                                                                </Alert>
                                                                            </div>}
                                                                        </div>
                                                                    );
                                                                })}
                                                        </div>
                                                    </div>
                                                ))}
                                                <h6 className={AddProgrammingQAStyles.anotherAnswer}><u onClick={() => addAnotherCode(i)}>Add Another Code</u></h6>
                                                <div className={AddProgrammingQAStyles.note}>
                                                    <Typography component="label">
                                                        Add Note
                                                        <Switch id='note' name='hasNote' checked={el?.hasNote} onChange={(e) => handleSnippetChange(i, e)} />
                                                    </Typography>
                                                    {pQA[i].hasNote ?
                                                        <>
                                                            <div>
                                                                <h4>Note</h4>
                                                                <TextField
                                                                    className={AddProgrammingQAStyles.columnInput}
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
                                            <div className={AddProgrammingQAStyles.remove}>
                                                {
                                                    i ?
                                                        <HighlightOffIcon titleAccess='Remove' className={AddProgrammingQAStyles.removeIcon} onClick={() => removeCode(i, el)} />
                                                        : null
                                                }
                                            </div>
                                        </div>

                                    </>
                                ))}
                                <h6 className={AddProgrammingQAStyles.anotherAnswer}><u onClick={addAnotherApproach}>Add Another Approach</u></h6>
                            </FormControl>
                        </div>
                        <div className={AddProgrammingQAStyles.editBtnContainer}>
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

export default AddProgrammingQA