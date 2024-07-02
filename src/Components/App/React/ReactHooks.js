import React, { useState } from 'react'
import { useFetchAPI } from '../../../Hooks/useAPI';
import { CommonHeaders } from '../../../CommonComponents/CommonHeaders';
import { fetchQueryParams } from '../../../Hooks/fetchQueryParams';
import Loader from '../../../CommonComponents/Loader/Loader';
import ReactStyles from './ReactStyles.module.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Mousewheel, Keyboard } from 'swiper/modules';
import CommonButton from '../../../CommonComponents/CommonButton';
import CancelIcon from '@mui/icons-material/Cancel';


import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './ReactHooksSwiperStyles.css';
import { Drawer, FormControl, TextField } from '@mui/material';

const ReactHooks = (props) => {

    const { params, locationDetails } = props;

    const [hooksConceptsInfo, setHooksConceptsInfo] = useState({ data: [], error: '' });
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [contentData, setContentData] = useState({});
    const [openDrawer, setOpenDrawer] = useState(false);
    const [addConceptTitle, setAddConceptTitle] = useState("");
    const [description, setDescription] = useState([
        { id: 1, data: '', snippet: [] }
    ])

    console.log(locationDetails, 'locationDetails');

    const onHooksSucess = res => {
        console.log(res);
        setHooksConceptsInfo({ data: [], error: '' });
        if ((res?.status === 200 || res?.status === 201)) {
            setHooksConceptsInfo({ data: res?.data?.concepts, error: '' });
        } else {
            setHooksConceptsInfo({ data: [], error: res?.data?.detail ? res?.data?.detail : 'Something went wrong. Please try again later' });
        }
    }

    const handleContentClick = (el, index) => {
        setSelectedIndex(index);
        setContentData(el);
    }

    const toggleDrawer = () => {
        setOpenDrawer(true);
    }

    const handleCloseDrawer = () => {
        setOpenDrawer(false);

    }

    const handleTitleChange = (event) => {
        setAddConceptTitle(event.target.value);
    }

    const handleDescriptionChange = (i, e) => {
        let newValues = [...description];
        newValues[i][e.target.name] = e.target.value;
        setDescription(newValues);
    }

    const addAnotherDescription = () => {
        setDescription([...description, { id: description.id++, data: "", snippet: [] }])
    }

    let GetHooks = useFetchAPI("GetHooks", `/concepts/getConcepts/${params?.topicId}/${params?.categoryId}`, "GET", '', CommonHeaders(), fetchQueryParams("", "", "", onHooksSucess));

    const fetching = GetHooks?.Loading || GetHooks?.Fetching;

    return (
        <>
            {(fetching) && <Loader showLoader={fetching} />}
            <div className={ReactStyles.banner}>
                <div className={ReactStyles.body}>
                    <div className={ReactStyles.contentFlex}>
                        <div className={ReactStyles.content}>
                            <h4 className={ReactStyles.contentHeader}>{locationDetails?.state?.topicDetails?.topicName}</h4>
                            <h5 className={ReactStyles.contentDescription}>{locationDetails?.state?.topicDetails?.description}</h5>
                        </div>
                        <div className={ReactStyles.image}>
                            <img className={ReactStyles.topicImage} src={locationDetails?.state?.topicDetails?.imageUrl} alt={locationDetails?.state?.topicDetails?.topicName} />
                        </div>
                    </div>
                    <div className={ReactStyles.addConceptsBtn}>
                        <CommonButton variant="contained" bgColor={'#5b67f1'} color={'white'} padding={'15px'} borderRadius={'5px'} fontWeight={'bold'} width={'100%'} height={'45px'} marign={'20px 0 0 0'} onClick={toggleDrawer}>Add Concept</CommonButton>
                    </div>
                    <div className={ReactStyles.concepts}>
                        <Swiper
                            slidesPerView={6}
                            spaceBetween={10}
                            cssMode={true}
                            navigation={true}
                            mousewheel={true}
                            keyboard={true}
                            modules={[Navigation, Mousewheel, Keyboard]}
                            className="mySwiper"
                        >
                            <div className={ReactStyles.grid}>
                                {
                                    hooksConceptsInfo?.data?.length > 0 ? hooksConceptsInfo?.data?.map((el, index) => (
                                        <SwiperSlide key={el?.title}>
                                            <div className={selectedIndex === index ? ReactStyles.topicCardActive : ReactStyles.topicCard} onClick={() => handleContentClick(el, index)}>
                                                <div className={ReactStyles.topicCardFlex}>
                                                    <div className={ReactStyles.card__content}>
                                                        <h1 className={selectedIndex === index ? ReactStyles.topicCard__headerActive : ReactStyles.topicCard__header}>{el?.title}</h1>
                                                        <div className={ReactStyles.card__textWrapper}>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </SwiperSlide>
                                    )) : <><h4 className={ReactStyles.topicsError}>{hooksConceptsInfo?.error}</h4></>}
                            </div>
                        </Swiper>
                        {contentData?.title && <div className={ReactStyles.conceptContent}>
                            <h4 className={ReactStyles.contentTitle}>{contentData?.title}</h4>
                        </div>}
                    </div>
                </div>
            </div>
            <Drawer anchor={'right'} open={openDrawer} onClose={handleCloseDrawer}>
                <div className={ReactStyles.addConceptContainer}>
                    <div className={ReactStyles.addConceptTitle}>
                        <div>
                            <h2>Add Concept</h2>
                        </div>
                        <div>
                            <CancelIcon onClick={handleCloseDrawer} />
                        </div>
                    </div>
                    <div className={ReactStyles.addConceptForm}>
                        <div className={ReactStyles.conceptTitle}>
                            <FormControl sx={{ width: '100%' }}>
                                <label>Title <span className={ReactStyles.required}>*</span></label>
                                <TextField
                                    name='title'
                                    value={addConceptTitle}
                                    onChange={handleTitleChange}
                                    InputProps={{
                                        type: 'text',
                                    }}
                                    sx={{ input: { "&::placeholder": { opacity: 0.9 } } }}
                                    placeholder={"Enter Concept Title"} size="large"
                                />
                            </FormControl>
                        </div>
                        <div className={ReactStyles.conceptDescription}>
                            <FormControl sx={{ width: '100%' }}>
                                <label>Description <span className={ReactStyles.required}>*</span></label>
                                { description?.map((el, i) => (
                                    <TextField
                                    name='title'
                                    value={el?.data || ""}
                                    onChange={(e) => handleDescriptionChange(i, e)}
                                    InputProps={{
                                        type: 'text',
                                    }}
                                    sx={{ input: { "&::placeholder": { opacity: 0.9 } } }}
                                    placeholder={"Enter Description"} size="large"
                                />
                                ))}
                                <h6 className={ReactStyles.anotherDescription}><u onClick={addAnotherDescription}>Add Another Description</u></h6>
                            </FormControl>
                        </div>
                    </div>
                </div>
            </Drawer>
        </>
    )
}

export default ReactHooks