import React, { useState } from 'react';
import CodeSnippetsStyles from './CodeSnippetsStyles.module.css';
import CommonButton from '../CommonButton';
import { AntTab, AntTabs } from '../InterviewQA/TabsStyles';
import PropTypes from 'prop-types';
import { Accordion, AccordionDetails, AccordionSummary, Pagination, Skeleton, Typography } from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'
import AppNoData from '../AppNoData/AppNoData';
import AddSnippet from '../AddSnippet/AddSnippet';

const CodeSnippets = (props) => {

    const { params, locationDetails } = props;

    const [value, setValue] = useState(0);
    const [addSnippetClicked, setAddSnippetClicked] = useState(false);
    const [editClicked, setEditClicked] = useState(false);


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
        setAddSnippetClicked(true);
    }

    return (
        <>
            <div className={CodeSnippetsStyles.mainContentContainer}>
                <div className={CodeSnippetsStyles.addQuestionBtn}>
                    <CommonButton variant="contained" bgColor={'#5b67f1'} color={'white'} padding={'15px'} borderRadius={'5px'} fontWeight={'bold'} width={'100%'} height={'45px'} margin={'20px 0 0 0'} onClick={toggleDrawer}>Add Snippet</CommonButton>
                </div>
                <div className={CodeSnippetsStyles.tabs}>
                    <AntTabs value={value} onChange={handleChange} aria-label="basic tabs example">
                        <AntTab label="All Snippets" {...a11yProps(0)} />
                        <AntTab label="Bookmarked Snippets" {...a11yProps(1)} />
                        {/* {showHiddenTab && <AntTab label="Hidden Interview Question and Answers" {...a11yProps(2)} />} */}
                    </AntTabs>
                    {/* <TabPanel value={value} index={0}>
                        {fetching ? <Skeleton variant="rectangular" width={'100%'} height={120} sx={{ marginBottom: 10 }} /> :
                            (allInterviewQAData && allInterviewQAData?.length > 0) ? allInterviewQAData?.map((el, i) => {
                                if (el?.enabled) return (
                                    <Accordion key={el?.questionId}
                                        slotProps={{ transition: { timeout: 400 } }}>
                                        <AccordionSummary
                                            expandIcon={<ArrowDownwardIcon sx={{ color: 'white' }} />}
                                            aria-controls="panel1-content"
                                            id="panel1-header"
                                            sx={{ background: 'black', color: 'white', marginBottom: '10px' }}
                                        >
                                            <div className={CodeSnippetsStyles.questionFlex}>
                                                <div>
                                                    <Typography sx={{ fontWeight: 'bolder' }}>{el?.question}</Typography>
                                                </div>

                                            </div>
                                        </AccordionSummary>
                                        <AccordionDetails sx={{ background: '#fcfcfc', boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px', padding: '8px 16px 30px' }}>
                                            {el?.data?.map((ans, index) => (
                                                <div key={ans.answer + index}>
                                                    <Typography>{ans.answer}</Typography>
                                                    <div className={CodeSnippetsStyles.ansImageDiv}>
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
                                                            <div className={CodeSnippetsStyles.ansImageDiv}>
                                                                {ele?.snippets?.map(imge => (
                                                                    <Zoom>
                                                                        <img src={imge?.url} alt={imge?.url} />
                                                                    </Zoom>
                                                                ))}
                                                            </div>
                                                        </>
                                                    ))}
                                                    {ans?.note && <Typography><b>Note:</b> {ans?.note}</Typography>}
                                                </div>
                                            ))}
                                            <div className={CodeSnippetsStyles.iconsDiv}>
                                                <EditIcon titleAccess='Edit' className={CodeSnippetsStyles.editQAIcon} onClick={() => handleQAEdit(el)} />
                                                {el?.bookmarked ? <BookmarkAddedIcon titleAccess='Bookmarked' className={CodeSnippetsStyles.bookmarkedIcon} /> : <BookmarkBorderIcon titleAccess='Bookmark' className={CodeSnippetsStyles.bookmarkQAIcon} onClick={() => handleBookmark(el)} />}
                                                <DeleteIcon titleAccess='Delete' className={CodeSnippetsStyles.deleteQAIcon} onClick={() => handleQADelete(el)} />
                                            </div>
                                        </AccordionDetails>
                                    </Accordion>
                                )
                            }) : <AppNoData />}
                        {totalDocs > 10 && <div className={CodeSnippetsStyles.pagination}>
                            <Pagination count={totalDocs} page={pageState} onChange={handlePageChange} color="primary" />
                        </div>}
                    </TabPanel> */}
                    {/* <TabPanel value={value} index={1}>
                        <BookmarkedTab getBookmarkQA={getBookmarkQA} setGetBookmarkedQAPayload={setGetBookmarkedQAPayload} setBookmarkedPageState={setBookmarkedPageState} bookmarkedInterviewQAData={bookmarkedInterviewQAData} bookmarkedPageState={bookmarkedPageState} handleQAEdit={handleQAEdit} handleQADelete={handleQADelete} setcallBookmarkedQAApi={setcallBookmarkedQAApi} getQA={getQA} setValue={setValue} />
                    </TabPanel> */}
                    {/* {showHiddenTab && <TabPanel value={value} index={2}>
                        {fetching ? <Skeleton variant="rectangular" width={'100%'} height={120} sx={{ marginBottom: 10 }} /> :
                            (allInterviewQAData && allInterviewQAData?.length > 0) ? allInterviewQAData?.map((el, i) => {
                                if (!el?.enabled) return (
                                    <Accordion key={el?.questionId}
                                        slotProps={{ transition: { timeout: 400 } }}>
                                        <AccordionSummary
                                            expandIcon={<ArrowDownwardIcon sx={{ color: 'white' }} />}
                                            aria-controls="panel1-content"
                                            id="panel1-header"
                                            sx={{ background: 'black', color: 'white', marginBottom: '10px' }}
                                        >
                                            <div className={CodeSnippetsStyles.questionFlex}>
                                                <div>
                                                    <Typography sx={{ fontWeight: 'bolder' }}>{el?.question}</Typography>
                                                </div>

                                            </div>
                                        </AccordionSummary>
                                        <AccordionDetails sx={{ background: '#fcfcfc' }}>
                                            {el?.data?.map((ans, index) => (
                                                <div key={ans.answer + index}>
                                                    <Typography>{ans.answer}</Typography>
                                                    <div className={CodeSnippetsStyles.ansImageDiv}>
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
                                                            <div className={CodeSnippetsStyles.ansImageDiv}>
                                                                {ele?.snippets?.map(imge => (
                                                                    <Zoom>
                                                                        <img src={imge?.url} alt={imge?.url} />
                                                                    </Zoom>
                                                                ))}
                                                            </div>
                                                        </>
                                                    ))}
                                                    {ans?.hasTable && (
                                                        <div className={CodeSnippetsStyles.tableDiv}>
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
                                            <div className={CodeSnippetsStyles.iconsDiv}>
                                                <EditIcon titleAccess='Edit' className={CodeSnippetsStyles.editQAIcon} onClick={() => handleQAEdit(el)} />
                                                <DeleteIcon titleAccess='Delete' className={CodeSnippetsStyles.deleteQAIcon} onClick={() => handleQADelete(el)} />
                                            </div>
                                        </AccordionDetails>
                                    </Accordion>
                                )
                            }) : <AppNoData />}
                        {totalDocs > 10 && <div className={CodeSnippetsStyles.pagination}>
                            <Pagination count={totalDocs} page={hiddenPageState} onChange={handleHiddenPageChange} color="primary" />
                        </div>}
                    </TabPanel>} */}
                </div>
                {(addSnippetClicked || editClicked) && <AddSnippet setAddSnippetClicked={setAddSnippetClicked} setEditClicked={setEditClicked} editClicked={editClicked} params={params} locationDetails={locationDetails} />}
            </div>
        </>
    )
}

export default CodeSnippets