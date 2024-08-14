import React, { useEffect, useState } from 'react';
import AddSnippetStyles from './AddSnippetStyles.module.css';
import { v4 as uuidv4 } from 'uuid';
import CancelIcon from '@mui/icons-material/Cancel';
import { Drawer, FormControl, Switch, TextField, Typography } from '@mui/material';

const AddSnippet = (props) => {

    const { setAddSnippetClicked, setEditClicked, editClicked, editItem, params } = props;

    const [openDrawer, setOpenDrawer] = useState(false);
    const [title, setTitle] = useState('');
    const [titleId, setTitleId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [snippet, setSnippet] = useState([
        { id: 1, explanation: '', snippets: [], hasNote: false, note: '' }
    ])
    const [enabled, setEnabled] = useState(true);

    useEffect(() => {
        setOpenDrawer(true);
        const uuid = uuidv4();
        editClicked ? setTitleId(editItem?.titleId) : setTitleId(`${params?.categoryId}-${params?.topicId}-${uuid}`);
    }, [])

    const handleCloseDrawer = () => {
        setOpenDrawer(false);
        setAddSnippetClicked(false);
        setEditClicked(false);
    }

    return (
        <>
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
                            { editClicked && <Typography component="label" sx={{ float: 'right' }}>
                                Enable
                                <Switch id='enabled' name='enabled' checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
                            </Typography> }
                            <FormControl sx={{ width: '100%' }}>
                                <label>Question ID <span className={AddSnippetStyles.required}>*</span></label>
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
                                <label>Question <span className={AddSnippetStyles.required}>*</span></label>
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
                        {/* <div className={AddSnippetStyles.conceptDescription}>
                            <FormControl sx={{ width: '100%' }}>
                                {QA?.map((el, i) => (
                                    <>
                                        <label>Answer {QA[i]?.id}</label>
                                        <div className={AddSnippetStyles.QAFlex}>
                                            <div className={AddSnippetStyles.QADiv}>
                                                <TextField
                                                    className={AddSnippetStyles.headerInput}
                                                    name='answer'
                                                    value={el?.answer || ""}
                                                    onChange={(e) => handleQAChange(i, e)}
                                                    InputProps={{
                                                        type: 'text',
                                                    }}
                                                    sx={{ input: { "&::placeholder": { opacity: 0.9 } } }}
                                                    placeholder={"Enter Answer"} size="large"
                                                />
                                                <label className={`btn btn-primary ${AddSnippetStyles.DocUpload}`}>Upload Code Snippet(s)</label>
                                                <input ref={el => QAInputRef.current[i] = el} name='snippets' type='file' accept='.jpg,.jpeg,.png' multiple className={AddSnippetStyles.uploadInput} onChange={(e) => handleQAChange(i, e)} />
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
                                                <div className={AddSnippetStyles.images}>
                                                    {QA[i]?.snippets &&
                                                        QA[i]?.snippets?.map((image, index) => {
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
                                                <div className={AddSnippetStyles.points}>
                                                    <Typography component="label">
                                                        Add Points
                                                        <Switch id='points' name='hasPoints' checked={el?.hasPoints} onChange={(e) => handleQAChange(i, e)} />
                                                    </Typography>
                                                    {QA[i]?.hasPoints &&
                                                        <>
                                                            <div className={AddSnippetStyles.pointsStylesFlex}>
                                                                <div>
                                                                    <Typography component="label">
                                                                        Show Points Style
                                                                        <Switch id='showPointsStyles' name='showPointsStyles' checked={el?.showPointsStyles} onChange={(e) => handleQAChange(i, e)} />
                                                                    </Typography>
                                                                </div>
                                                                {QA[i]?.showPointsStyles && <div className={AddSnippetStyles.pointsStylesDropdown}>
                                                                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1rem' }}>Points Styles</p>
                                                                    <select name='pointsStyles' defaultValue={'none'} value={el?.pointsStyles} onChange={(e) => handleQAChange(i, e)}>
                                                                        {listStyles?.map((el, listIndex) => (
                                                                            <option key={listIndex + el}>{el}</option>
                                                                        ))}
                                                                    </select>
                                                                </div>}
                                                            </div>
                                                            {QA[i]?.pointsData?.map((point, idx) => (
                                                                <>
                                                                    <div className={AddSnippetStyles.pointsDiv}>
                                                                        {idx ? <HighlightOffIcon titleAccess='Remove' className={AddSnippetStyles.removeIconPoint} onClick={() => removePoint(idx, i, point)} /> : null}
                                                                        <h4>Point {idx + 1}</h4>
                                                                        <label>Enter Point</label>
                                                                        <TextField
                                                                            className={AddSnippetStyles.pointsInput}
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
                                                                            className={AddSnippetStyles.pointsInput}
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
                                                                            <label className={`btn btn-primary ${AddSnippetStyles.DocUpload}`}>Upload Code Snippet(s)</label>
                                                                            <input ref={el => QAPointsInputRef.current[idx] = el} name='snippets' type='file' accept='.jpg,.jpeg,.png' multiple className={AddSnippetStyles.uploadInput} onChange={(e) => handlePointsChange(idx, e, i)} />
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
                                                                            <div className={AddSnippetStyles.images}>
                                                                                {QA[i]?.pointsData[idx]?.snippets &&
                                                                                    QA[i]?.pointsData[idx]?.snippets?.map((image, index) => {
                                                                                        return (
                                                                                            <div key={image + index} className={AddSnippetStyles.image}>
                                                                                                <img src={image?.url} className={AddSnippetStyles.QAImage} alt="upload" />
                                                                                                <div className={AddSnippetStyles.uploadBtnContainer}>
                                                                                                    <div className={AddSnippetStyles.imageUploadBtn}>
                                                                                                        <button className={AddSnippetStyles.uploadBtn} disabled={image.imageUploaded} onClick={() => uploadPointsImages(idx, i, image?.url, index)}>{image?.imageUploaded ? 'Uploaded Successfully' : 'Upload'}</button>
                                                                                                    </div>
                                                                                                    <div>
                                                                                                        {!image.imageUploaded ? <button className={AddSnippetStyles.imageDelete} onClick={() => deletePointsImage(i, image, idx)}>
                                                                                                            Delete
                                                                                                        </button> : <button className={AddSnippetStyles.imageDelete} onClick={() => removeUploadedPointsImage(i, image?.url, idx, index)}>
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
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            ))}
                                                            <h6 className={AddSnippetStyles.anotherAnswer}><u onClick={() => addAnotherPoint(i)}>Add Another Point</u></h6>
                                                        </>}
                                                </div>
                                                <div className={AddSnippetStyles.table}>
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
                                                                        className={AddSnippetStyles.columnInput}
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
                                                                        <div className={AddSnippetStyles.tableDataFlex}>
                                                                            <div className={AddSnippetStyles.tableData}>
                                                                                <TextField
                                                                                    className={AddSnippetStyles.columnInput}
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
                                                                                    className={AddSnippetStyles.columnInput}
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
                                                                                        <HighlightOffIcon titleAccess='Remove' className={AddSnippetStyles.removeIcon} onClick={() => removeRow(index, i)} />
                                                                                        : null
                                                                                }
                                                                            </div>
                                                                        </div>
                                                                    </>

                                                                )}
                                                                <h6 className={AddSnippetStyles.anotherAnswer}><u onClick={() => addAnotherRow(i)}>Add Another Row</u></h6>
                                                            </div>
                                                        </> : null}

                                                </div>
                                                <div className={AddSnippetStyles.note}>
                                                    <Typography component="label">
                                                        Add Note
                                                        <Switch id='note' name='hasNote' checked={el?.hasNote} onChange={(e) => handleQAChange(i, e)} />
                                                    </Typography>
                                                    {QA[i].hasNote ?
                                                        <>
                                                            <div>
                                                                <h4>Note</h4>
                                                                <TextField
                                                                    className={AddSnippetStyles.columnInput}
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
                                            <div className={AddSnippetStyles.remove}>
                                                {
                                                    i ?
                                                        <HighlightOffIcon titleAccess='Remove' className={AddSnippetStyles.removeIcon} onClick={() => removeAnswer(i, el)} />
                                                        : null
                                                }
                                            </div>

                                        </div>

                                    </>
                                ))}
                                <h6 className={AddSnippetStyles.anotherAnswer}><u onClick={addAnotherAnswer}>Add Another Answer</u></h6>
                            </FormControl>
                        </div> */}
                        {/* <div className={AddSnippetStyles.editBtnContainer}>
                            <div>
                                <CommonButton variant="contained" bgColor={'#5b67f1'} color={'white'} padding={'15px'} borderRadius={'5px'} fontWeight={'bold'} width={'100%'} height={'45px'} margin={'20px 0 0 0'} onClick={() => handleAddQuestion()} disabled={!question}>Save</CommonButton>
                            </div>
                            <div>
                                <CommonButton variant="contained" bgColor={'#f8f8f8'} color={'black'} padding={'15px'} borderRadius={'5px'} fontWeight={'bold'} width={'100%'} height={'45px'} margin={'20px 0 0 0'} border={'1px solid #ddd'} onClick={handleCloseDrawer}>Cancel</CommonButton>
                            </div>
                        </div> */}
                    </div>
                </div>
            </Drawer>
        </>
    )
}

export default AddSnippet