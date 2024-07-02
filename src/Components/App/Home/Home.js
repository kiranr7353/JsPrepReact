import React, { useEffect, useMemo, useState } from 'react'
import HomeStyles from './HomeStyles.module.css';

import { useSelector } from 'react-redux';
import { useFetchAPI } from '../../../Hooks/useAPI';
import { fetchQueryParams } from '../../../Hooks/fetchQueryParams';
import { CommonHeaders } from '../../../CommonComponents/CommonHeaders';
import { Skeleton } from '@mui/material';
import Image from '../../../Images/learning.png';
import Loader from '../../../CommonComponents/Loader/Loader';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Mousewheel, Keyboard } from 'swiper/modules';
import { useNavigate } from 'react-router-dom';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './swiperStyles.css';

const Home = () => {

    const appState = useSelector(state => state);
    const navigate = useNavigate();

    console.log(appState);


    const [categoriesListData, setCategoryListData] = useState([]);
    const [categoriesInfo, setCategoryInfo] = useState({ data: [], error: '' });
    const [selectedItem, setSelectedItem] = useState({});
    const [selectedItemIndex, setSelectedItemIndex] = useState(0);
    const [categoryType, setCategoryType] = useState('all');
    const [callCategoryApi, setCallCategoryApi] = useState(false);
    const [categoryId, setCategoryId] = useState('');
    const [callTopicApi, setCallTopicApi] = useState(false);
    const [selectedCategoryIndex, setSelectedCategoryIndex] = useState();
    const [topicInfo, setTopicInfo] = useState({ data: [], error: '' });

    const [isFetching, setIsFetching] = useState(false);


    const onCategoriesListSuccess = res => {
        if ((res?.status === 200 || res?.status === 201)) {
            setCategoryListData(res?.data?.categoriesList);
        } else {

        }
    }

    useEffect(() => {
        setSelectedItemIndex(0);
        setCategoryType('all');
        setCallCategoryApi(true);
        setTopicInfo({ data: [], error: '' });
    }, [])


    const handleListClick = (el, idx) => {
        console.log(el, idx);
        setSelectedItemIndex(idx)
        setSelectedItem(el);
        setCategoryType(el?.id);
        setCallCategoryApi(true);
    }

    const onCategoriesSuccess = res => {
        setCallCategoryApi(false);
        setCategoryInfo({ data: [], error: '' });
        if ((res?.status === 200 || res?.status === 201)) {
            setCategoryInfo({ data: res?.data?.categories, error: '' });
        } else {
            setCategoryInfo({ data: [], error: res?.data?.detail ? res?.data?.detail : 'Something went wrong. Please try again later' });
        }
    }

    const handleCategoryClicked = (el, idx) => {
        setSelectedCategoryIndex(idx)
        setCategoryId(el?.categoryId);
        setCallTopicApi(true);
    }

    const onTopicsSuccess = res => {
        console.log(res);
        setCallTopicApi(false);
        setTopicInfo({ data: [], error: '' });
        if ((res?.status === 200 || res?.status === 201)) {
            const sortedData = res?.data?.topics?.sort((a, b) => {
                let keyA = a?.displayOrder,
                    keyB = b?.displayOrder;
                if (keyA < keyB) return -1;
                if (keyA > keyB) return 1;
                return 0;
            })
            setTopicInfo({ data: res?.data?.topics, error: '' });
        } else {
            setTopicInfo({ data: [], error: res?.data?.detail ? res?.data?.detail : 'Something went wrong. Please try again later' });
        }
    }

    const handleTopicClick = (el) => {
        console.log(el);
        console.log(categoryId);
        navigate(`/home/topic/${categoryId}/${el?.topicId}`, { state: { topicDetails: el, categoryDetails: categoriesInfo?.data } })
    }

    let getCategoriesList = useFetchAPI("GetCategoriesList", `/categories/getCategoryList`, "GET", '', CommonHeaders(), fetchQueryParams("", "", "", onCategoriesListSuccess));
    let getCategories = useFetchAPI("GetCategories", `/categories/getCategoriesFromList/${categoryType}`, "GET", '', CommonHeaders(), fetchQueryParams("", "", "", onCategoriesSuccess, "", callCategoryApi));
    let getTopics = useFetchAPI("GetTopics", `/categories/getTopics/${categoryId}`, "GET", '', CommonHeaders(), fetchQueryParams("", "", "", onTopicsSuccess, "", callTopicApi));
    const fetching = getCategoriesList?.Loading || getCategoriesList?.Fetching;

    return (
        <>
            {(isFetching || fetching) && <Loader showLoader={fetching} />}
            <div className={HomeStyles.body}>
                <div className={HomeStyles.imageSection}>
                    <img src={Image} alt='Image' />
                </div>
                <div className={HomeStyles.categoryList}>
                    <h4 className={HomeStyles.categoriesText}>Categories</h4>
                    {categoriesListData?.length > 0 ? (
                        <>
                            <div className={HomeStyles.listFlex}>
                                {categoriesListData?.map((el, idx) => (
                                    <div key={el?.id} className={selectedItemIndex === idx ? HomeStyles.activeListData : HomeStyles.listData} onClick={() => handleListClick(el, idx)}>
                                        {el?.value}
                                    </div>
                                ))}
                            </div>
                        </>)
                        : <></>
                    }
                </div>
                <div className={HomeStyles.categories}>
                    <Swiper
                        slidesPerView={5}
                        spaceBetween={0}
                        cssMode={true}
                        navigation={true}
                        mousewheel={true}
                        keyboard={true}
                        modules={[Navigation, Mousewheel, Keyboard]}
                        className="mySwiper"
                    >
                        <div className={HomeStyles.grid}>
                            {(getCategories?.Loading || getCategories?.Fetching) ? <Skeleton variant="rectangular" width={'100%'} height={120} sx={{ marginBottom: 10 }} /> :
                                categoriesInfo?.data?.length > 0 ? categoriesInfo?.data?.map((el, index) => (
                                    <SwiperSlide key={el?.categoryId}>
                                        <div className={selectedCategoryIndex === index ? HomeStyles.activeCard : HomeStyles.card} onClick={() => handleCategoryClicked(el, index)}>
                                            <div className={HomeStyles.cardFlex}>
                                                <div>
                                                    <img className={HomeStyles.card__img} src={el?.imageUrl} alt={el?.categoryName} />
                                                </div>
                                                <div className={HomeStyles.card__content}>
                                                    <h1 className={HomeStyles.card__header}>{el?.categoryName}</h1>
                                                    <div className={HomeStyles.card__textWrapper}>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                )) : <><h4 className={HomeStyles.topicsError}>{categoriesInfo?.error}</h4></>}
                        </div>
                    </Swiper>
                </div>
                <div className={HomeStyles.topics}>
                    {getTopics?.data && <h4 className={HomeStyles.categoriesText}>Topics</h4>}
                    <Swiper
                        slidesPerView={4}
                        spaceBetween={0}
                        cssMode={true}
                        navigation={true}
                        mousewheel={true}
                        keyboard={true}
                        modules={[Navigation, Mousewheel, Keyboard]}
                        className="mySwiper"
                    >
                        <div className={HomeStyles.grid}>
                            {(getTopics?.Loading || getTopics?.Fetching) ? <Skeleton variant="rectangular" width={'100%'} height={200} sx={{ marginBottom: 10 }} /> :
                                topicInfo?.data?.length > 0 ? topicInfo?.data?.map((el, index) => (
                                    <SwiperSlide key={el?.topicId}>
                                        <div className={HomeStyles.topicCard} onClick={() => handleTopicClick(el)}>
                                            <div className={HomeStyles.topicCardFlex}>
                                                <div>
                                                    <img className={HomeStyles.card__imgTopic} src={el?.imageUrl} alt={el?.topicName} />
                                                </div>
                                                <div className={HomeStyles.card__content}>
                                                    <h1 className={HomeStyles.topicCard__header}>{el?.topicName}</h1>
                                                    <div className={HomeStyles.card__textWrapper}>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                )) : <><h4 className={HomeStyles.topicsError}>{topicInfo?.error}</h4></>}
                        </div>
                    </Swiper>
                </div>
            </div>
        </>
    )
}

export default Home