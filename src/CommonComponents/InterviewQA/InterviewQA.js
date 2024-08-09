import React, { useState } from 'react'
import InterviewQAStyles from './InterviewQAStyles.module.css'
import CommonButton from '../CommonButton'
import PropTypes from 'prop-types';
import parse from "html-react-parser";
import AddQA from '../AddQA/AddQA';
import { AntTab, AntTabs } from './TabsStyles';
import { useFetchAPI } from '../../Hooks/useAPI';
import CancelIcon from '@mui/icons-material/Cancel';
import { CommonHeaders } from '../CommonHeaders';
import { fetchQueryParams } from '../../Hooks/fetchQueryParams';
import { Accordion, AccordionDetails, AccordionSummary, Fade, Typography } from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Loader from '../Loader/Loader';

const InterviewQA = (props) => {

    const { params, locationDetails } = props;

    const [addQAClicked, setAddQAClicked] = useState(false);
    const [value, setValue] = useState(0);
    const [allInterviewQAData, setAllInterviewQAData] = useState([]);

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
        console.log(res);
        if ((res?.status === 200 || res?.status === 201)) {
            setAllInterviewQAData(res?.data?.data);
        } else {
            setAllInterviewQAData([])
        }
    }

    const getQA = useFetchAPI("createQA", `/categories/getInterviewQA/${params?.topicId}/${params?.categoryId}`, "GET", '', CommonHeaders(), fetchQueryParams("", "", "", onGetQASuccess));

    const fetching = getQA?.Loading || getQA?.Fetching;

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
                    </AntTabs>
                    <TabPanel value={value} index={0}>
                        {allInterviewQAData && allInterviewQAData?.length > 0 && allInterviewQAData?.map((el, i) => (
                            <Accordion
                            slotProps={{ transition: { timeout: 400 } }}>
                                <AccordionSummary
                                    expandIcon={<ArrowDownwardIcon />}
                                    aria-controls="panel1-content"
                                    id="panel1-header"
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
                                        <div>
                                            <Typography>{el?.question}</Typography>
                                        </div>
                                        <div>
                                            <CancelIcon />
                                        </div>
                                    </div>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Typography>
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
                                        malesuada lacus ex, sit amet blandit leo lobortis eget.
                                    </Typography>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </TabPanel>
                    <TabPanel value={value} index={1}>

                    </TabPanel>
                </div>
                {addQAClicked && <AddQA setAddQAClicked={setAddQAClicked} params={params} locationDetails={locationDetails} getQA={getQA} />}
                {/* { data2?.map((el, index) => (
                        <>
                        <p>{parse(el.answer)}</p>
                        { el.snippets.map(img => (
                            <img style={{ height: 50, width: 50 }} src={img.url} />
                        )) }
                        { el?.pointsData?.map((ele,i) => (
                           <>
                            <h1>{ele.pointHeader}</h1>
                            <p>{parse(ele.data)}</p>
                            { ele?.snippets?.map(imge => (
                                <img style={{ height: 50, width: 50 }} src={imge?.url} />
                            )) }
                           </>
                        )) }
                        {el?.note}
                        </>
                    )) } */}
            </div>
        </>
    )
}

export default InterviewQA