import React, { useState } from 'react'
import CommonButton from '../CommonButton'
import MainContentStyles from './MainContentStyles.module.css'
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Mousewheel, Keyboard } from 'swiper/modules';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './GetConceptsSwiperStyles.css'
import { useFetchAPI } from '../../Hooks/useAPI';
import { CommonHeaders } from '../CommonHeaders';
import { fetchQueryParams } from '../../Hooks/fetchQueryParams';
import DisplayContents from '../DisplayContents/DisplayContents';
import AddConcept from '../AddConcept/AddConcept';
import Loader from '../Loader/Loader';

const MainContent = (props) => {

    const { params, locationDetails } = props;

    const [conceptsInfo, setConceptsInfo] = useState({ data: [], error: '' });
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [contentData, setContentData] = useState({});
    const [addConceptClick, setAddConceptClick] = useState(false);

    const onGetConceptsSuccess = res => {
        setConceptsInfo({ data: [], error: '' });
        if ((res?.status === 200 || res?.status === 201)) {
            setConceptsInfo({ data: res?.data?.concepts, error: '' });
            setContentData(res?.data?.concepts[0]);
            setSelectedIndex(0);
        } else {
            setConceptsInfo({ data: [], error: res?.data?.detail ? res?.data?.detail : 'Something went wrong. Please try again later' });
        }
    }

    const toggleDrawer = () => {
        setAddConceptClick(true)
    }

    const handleContentClick = () => {

    }

    const handleEditConcept = () => {

    }

    const handleDeleteConcept = () => {

    }

    let getConcepts = useFetchAPI("getConcepts", `/concepts/getConcepts/${params?.topicId}/${params?.categoryId}`, "GET", '', CommonHeaders(), fetchQueryParams("", "", "", onGetConceptsSuccess));

    const fetching = getConcepts?.Loading || getConcepts?.Fetching

    return (
        <>
             {(fetching) && <Loader showLoader={fetching} />}
            <div className={MainContentStyles.mainContentContainer}>
                <div className={MainContentStyles.addConceptsBtn}>
                    <CommonButton variant="contained" bgColor={'#5b67f1'} color={'white'} padding={'15px'} borderRadius={'5px'} fontWeight={'bold'} width={'100%'} height={'45px'} margin={'20px 0 0 0'} onClick={toggleDrawer}>Add Concept</CommonButton>
                </div>
                <div className={MainContentStyles.concepts}>
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
                        <div className={MainContentStyles.grid}>
                            {
                                conceptsInfo?.data?.length > 0 ? conceptsInfo?.data?.map((el, index) => (
                                    <SwiperSlide key={el?.title}>
                                        <div className={selectedIndex === index ? MainContentStyles.topicCardActive : MainContentStyles.topicCard} onClick={() => handleContentClick(el, index)}>
                                            <div className={MainContentStyles.topicCardFlex}>
                                                <div className={MainContentStyles.card__contentHooks}>
                                                    <h1 className={selectedIndex === index ? MainContentStyles.topicCard__headerActive : MainContentStyles.topicCard__header}>{el?.title}</h1>
                                                </div>
                                            </div>
                                            <div className={MainContentStyles.icons}>
                                                <EditIcon titleAccess='Edit' className={MainContentStyles.editIcon} onClick={() => handleEditConcept(el)} />
                                                <DeleteIcon titleAccess='Delete' className={MainContentStyles.deleteIcon} onClick={() => handleDeleteConcept(el?.title, el)} />
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                )) : <><h4 className={MainContentStyles.topicsError}>{conceptsInfo?.error}</h4></>}
                        </div>
                    </Swiper>
                    {contentData?.title && <div className={MainContentStyles.conceptContent}>
                        <DisplayContents contentData={contentData} locationDetails={locationDetails} categoryId={params?.categoryId} getConcepts={getConcepts} setSelectedIndex={setSelectedIndex} setContentData={setSelectedIndex} />
                    </div>}
                </div>
            </div>
            { addConceptClick && <AddConcept locationDetails={locationDetails} getConcepts={getConcepts} params={params} contentData={contentData} setAddConceptClick={setAddConceptClick} setSelectedIndex={setSelectedIndex} conceptsInfo={conceptsInfo} /> }
        </>
    )
}

export default MainContent