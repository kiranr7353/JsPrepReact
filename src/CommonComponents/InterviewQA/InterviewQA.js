import React, { useState } from 'react'
import InterviewQAStyles from './InterviewQAStyles.module.css'
import CommonButton from '../CommonButton'
import PropTypes from 'prop-types';
import parse from "html-react-parser";
import AddQA from '../AddQA/AddQA';
import { AntTab, AntTabs } from './TabsStyles';
import { useFetchAPI } from '../../Hooks/useAPI';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { CommonHeaders } from '../CommonHeaders';
import { fetchQueryParams } from '../../Hooks/fetchQueryParams';
import { Accordion, AccordionDetails, AccordionSummary, Dialog, DialogContent, Fade, Paper, Slide, Table, TableBody, TableHead, TableRow, Typography } from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import Loader from '../Loader/Loader';
import { CustomizedTable, StyledTableCell, StyledTableRow } from '../TableStyles';
import AppNoData from '../AppNoData/AppNoData';
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'
import ConfirmationDialog from '../ConfirmationDialog/ConfirmationDialog';
import { ref as storageRef, deleteObject } from "firebase/storage";
import { storage } from '../../firebaseConfig';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const InterviewQA = (props) => {

    const { params, locationDetails } = props;

    const [addQAClicked, setAddQAClicked] = useState(false);
    const [value, setValue] = useState(0);
    const [allInterviewQAData, setAllInterviewQAData] = useState([]);
    const [editClicked, setEditClicked] = useState(false);
    const [editItem, setEditItem] = useState({});
    const [deletePayload, setDeletePayload] = useState({});
    const [deleteInfo, setDeleteInfo] = useState({});
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [callDeleteApi, setCallDeleteApi] = useState(false);
    const [deleteConfirmationInfo, setDeleteConfirmationInfo] = useState({ open: false, successMsg: '', errorMsg: '' })

    const TabPanel = (props) => {
        const { children, value, index, ...other } = props;
        return (
            <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other} style={{ marginTop: 20 }}>
                {value === index && (<>{children}</>)}
            </div>);
    }
    TabPanel.propTypes = { children: PropTypes.node, index: PropTypes.number.isRequired, value: PropTypes.number.isRequired };
    function a11yProps(index) { return { id: `simple-tab-${index}`, 'aria-controls': `simple-tabpanel-${index}`, }; }


    const handleChange = (event, newValue) => {
        setValue(newValue);
    }

    const toggleDrawer = () => {
        setAddQAClicked(true);
    }

    const onGetQASuccess = res => {
        if ((res?.status === 200 || res?.status === 201)) {
            setAllInterviewQAData(res?.data?.data);
        } else {
            setAllInterviewQAData([])
        }
    }

    const handleQAEdit = el => {
        setEditClicked(true);
        setEditItem(el);
    }

    const handleQADelete = el => {
        setOpenDeleteModal(true);
        setDeleteInfo(el);
    }

    const handleQACloseDialog = () => {
        setOpenDeleteModal(false);
    }

    const genericRemoveUploadedImage = (image) => {
        const imageRef = storageRef(storage, image);
        deleteObject(imageRef).then(() => {
        }).catch((error) => {
        });
    }

    const handleDeleteQAConfirm = () => {
        deleteInfo?.data?.forEach(el => {
            if (el?.snippets?.length > 0) {
                el?.snippets?.forEach(img => {
                    genericRemoveUploadedImage(img?.url)
                })
            }
            if (el?.pointsData?.length > 0) {
                el?.pointsData?.forEach(point => {
                    if (point?.snippets?.length > 0) {
                        point?.snippets?.forEach(image => {
                            genericRemoveUploadedImage(image?.url);
                        })
                    }
                })
            }
        })
        setDeletePayload({ questionId: deleteInfo?.questionId });
        setCallDeleteApi(true);
        handleQACloseDialog(false);
    }

    const onDeleteSuccess = (res) => {
        setCallDeleteApi(false);
        if ((res?.status === 200 || res?.status === 201)) {
            setDeleteConfirmationInfo({ open: true, successMsg: 'Deleted Successfully', errorMsg: '' })
            getQA?.refetch();
        } else {
            setDeleteConfirmationInfo({ open: true, successMsg: '', errorMsg: res?.data?.detail ? res?.data?.detail : 'Something went wrong. Please try again later' })
        }
    }

    const handleDeleteQAClosePopup = () => {
        setDeleteConfirmationInfo({ open: false, successMsg: '', errorMsg: '' });
        setDeleteInfo({});
        setDeletePayload({});
    }

    const getQA = useFetchAPI("createQA", `/categories/getInterviewQA/${params?.topicId}/${params?.categoryId}`, "GET", '', CommonHeaders(), fetchQueryParams("", "", "", onGetQASuccess));
    const deleteQA = useFetchAPI("deleteQA", `/categories/deleteInterviewQuestion`, "POST", deletePayload, CommonHeaders(), fetchQueryParams("", "", "", onDeleteSuccess, "", callDeleteApi));

    const fetching = getQA?.Loading || getQA?.Fetching || deleteQA?.Loading || deleteQA?.Fetching;

    return (
        <>
            {(fetching) && <Loader showLoader={fetching} />}
            <div className={InterviewQAStyles.mainContentContainer}>
                <div className={InterviewQAStyles.addQuestionBtn}>
                    <CommonButton variant="contained" bgColor={'#5b67f1'} color={'white'} padding={'15px'} borderRadius={'5px'} fontWeight={'bold'} width={'100%'} height={'45px'} margin={'20px 0 0 0'} onClick={toggleDrawer}>Add Question</CommonButton>
                </div>
                <div className={InterviewQAStyles.tabs}>
                    <AntTabs value={value} onChange={handleChange} aria-label="basic tabs example">
                        <AntTab label="All Interview Question and Answers" {...a11yProps(0)} />
                        <AntTab label="Bookmarked Interview Question and Answers" {...a11yProps(1)} />
                        <AntTab label="Hidden Interview Question and Answers" {...a11yProps(2)} />
                    </AntTabs>
                    <TabPanel value={value} index={0}>
                        {(allInterviewQAData && allInterviewQAData?.length > 0) ? allInterviewQAData?.map((el, i) => (
                            <Accordion key={el?.questionId}
                                slotProps={{ transition: { timeout: 400 } }}>
                                <AccordionSummary
                                    expandIcon={<ArrowDownwardIcon sx={{ color: 'white' }} />}
                                    aria-controls="panel1-content"
                                    id="panel1-header"
                                    sx={{ background: 'black', color: 'white', marginBottom: '10px' }}
                                >
                                    <div className={InterviewQAStyles.questionFlex}>
                                        <div>
                                            <Typography sx={{ fontWeight: 'bolder' }}>{el?.question}</Typography>
                                        </div>

                                    </div>
                                </AccordionSummary>
                                <AccordionDetails sx={{ background: '#fcfcfc' }}>
                                    {el?.data?.map((ans, index) => (
                                        <div key={ans.answer + index}>
                                            <Typography>{ans.answer}</Typography>
                                            <div className={InterviewQAStyles.ansImageDiv}>
                                                {ans.snippets.map(img => (
                                                    <Zoom>
                                                        <img src={img.url} alt={img?.url} />
                                                    </Zoom>
                                                ))}
                                            </div>
                                            {ans?.hasPoints && ans?.pointsData?.map((ele, i) => (
                                                <>

                                                    {ans?.showPointsStyles ? <ul style={{ listStyle: ans?.pointsStyles }}><li>{ele.pointHeader}</li></ul> : <h4>{ele.pointHeader}</h4>}
                                                    <Typography>{ele.value}</Typography>
                                                    <div className={InterviewQAStyles.ansImageDiv}>
                                                        {ele?.snippets?.map(imge => (
                                                            <Zoom>
                                                                <img src={imge?.url} alt={imge?.url} />
                                                            </Zoom>
                                                        ))}
                                                    </div>
                                                </>
                                            ))}
                                            {ans?.hasTable && (
                                                <div className={InterviewQAStyles.tableDiv}>
                                                    <CustomizedTable component={Paper} elevation={6}>
                                                        <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                                            <TableHead>
                                                                <TableRow>
                                                                    {ans?.tableColumns?.map((column, i) => (
                                                                        <StyledTableCell align="center" key={i}>{column?.value}</StyledTableCell>
                                                                    ))}
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {ans?.tableData?.map((res, tableIndex) => (
                                                                    <StyledTableRow key={tableIndex} sx={{ '&:first-of-type td, &:first-of-type th': { border: 0 } }}>
                                                                        <StyledTableCell align="center">{res.value1}</StyledTableCell>
                                                                        <StyledTableCell align="center">{res?.value2}</StyledTableCell>
                                                                    </StyledTableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </CustomizedTable>
                                                </div>
                                            )}
                                            {el?.note && <Typography>Note : {el?.note}</Typography>}
                                        </div>
                                    ))}
                                    <div className={InterviewQAStyles.iconsDiv}>
                                        <EditIcon titleAccess='Edit' className={InterviewQAStyles.editQAIcon} onClick={() => handleQAEdit(el)} />
                                        <BookmarkIcon titleAccess='Bookmark' className={InterviewQAStyles.bookmarkQAIcon} />
                                        <DeleteIcon titleAccess='Delete' className={InterviewQAStyles.deleteQAIcon} onClick={() => handleQADelete(el)} />
                                    </div>
                                </AccordionDetails>
                            </Accordion>
                        )) : <AppNoData />}
                    </TabPanel>
                    <TabPanel value={value} index={1}>

                    </TabPanel>
                </div>
                {(addQAClicked || editClicked) && <AddQA setAddQAClicked={setAddQAClicked} setEditClicked={setEditClicked} editClicked={editClicked} params={params} locationDetails={locationDetails} getQA={getQA} editItem={editItem} />}
            </div>
            <Dialog open={openDeleteModal} TransitionComponent={Transition} keepMounted onClose={handleQACloseDialog} aria-describedby="alert-dialog-slide-description" fullWidth={false} maxWidth="sm" >
                <div className={InterviewQAStyles.modalinnerwrapper}>
                    <div><h4 className={InterviewQAStyles.headerText}>Delete QA</h4></div>
                    <IconButton aria-label="close" onClick={handleQACloseDialog} sx={{ position: 'absolute', right: 8, top: 8, color: "#666" }}>
                        <CloseIcon />
                    </IconButton>
                    <DialogContent>
                        Are you sure you want to delete this QA?
                    </DialogContent>
                    <div className={InterviewQAStyles.modalactionsection}>
                        <CommonButton variant="contained" bgColor={'#5b67f1'} color={'white'} padding={'0.2rem 2.6rem'} borderRadius={'8px'} fontWeight={'bold'} border={'1px solid #286ce2'} onClick={handleDeleteQAConfirm}>Delete</CommonButton>
                        <CommonButton variant="contained" bgColor={'#f8f8f8'} color={'black'} padding={'0.2rem 2.6rem'} borderRadius={'8px'} fontWeight={'bold'} border={'1px solid #ddd'} onClick={handleQACloseDialog}>Cancel</CommonButton>
                    </div>
                </div>
            </Dialog>
            <ConfirmationDialog openDialog={deleteConfirmationInfo?.open} errorMessage={deleteConfirmationInfo?.errorMsg} successMessage={deleteConfirmationInfo?.successMsg} handleCloseDialog={handleDeleteQAClosePopup} />
        </>
    )
}

export default InterviewQA