import React, { useEffect, useMemo, useState } from 'react'
import HomeStyles from './HomeStyles.module.css';

import { useSelector } from 'react-redux';
import { useFetchAPI } from '../../../Hooks/useAPI';
import { fetchQueryParams } from '../../../Hooks/fetchQueryParams';
import { CommonHeaders } from '../../../CommonComponents/CommonHeaders';
import { GetCookie } from '../../../Utils/util-functions';
import { Box, InputAdornment, Tab, Tabs, TextField, styled, Skeleton } from '@mui/material';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CommonButton from '../../../CommonComponents/CommonButton';
import Image from '../../../Images/learning.png';
import Loader from '../../../CommonComponents/Loader/Loader';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Mousewheel, Keyboard } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './swiperStyles.css';

const Home = () => {

    const appState = useSelector(state => state);
    console.log(appState);

    const [searchInput, setSearchInput] = useState('');
    const [detailsResponse, setDetailsResponse] = useState({});
    const [categoriesListData, setCategoryListData] = useState([]);
    const [categoriesData, setCategoryData] = useState([]);
    const [tabValue, setTabValue] = useState('');
    const [selectedItem, setSelectedItem] = useState({});
    const [selectedItemIndex, setSelectedItemIndex] = useState(0);
    const [categoryType, setCategoryType] = useState('all');
    const [callCategoryApi, setCallCategoryApi] = useState(false);
    const [categoryId, setCategoryId] = useState('');
    const [callTopicApi, setCallTopicApi] = useState(false);
    const [selectedCategoryIndex, setSelectedCategoryIndex] = useState();
    const [topicInfo, setTopicInfo] = useState({ data: [], error: '' });

    const handleChange = (e) => {
        setSearchInput(e?.target?.value);
    }

    const handleClear = () => {
        setSearchInput('');
    }

    const onDetailSuccess = res => {
        if ((res?.status === 200 || res?.status === 201)) {
            console.log(res);
            setDetailsResponse(res?.data?.userInfo);
        } else {
            // setErrorMessage(res?.data?.detail ? res?.data?.detail : 'Something went wrong. Please try again later.');
            // setOpenLoginErrorDialog(true);
        }
    }

    const onCategoriesListSuccess = res => {
        if ((res?.status === 200 || res?.status === 201)) {
            console.log(res);
            setCategoryListData(res?.data?.categoriesList);
        } else {

        }
    }

    const handleLogout = () => {

    }

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
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
        if ((res?.status === 200 || res?.status === 201)) {
            setCategoryData(res?.data?.categories);
        } else {

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
        setTopicInfo({data: [], error: ''});
        if ((res?.status === 200 || res?.status === 201)) {
            const sortedData = res?.data?.topics?.sort((a,b) => {
                let keyA = a?.displayOrder,
                    keyB = b?.displayOrder;
                // Compare the 2 dates
                if (keyA < keyB) return -1;
                if (keyA > keyB) return 1;
                return 0;
            })
            console.log(sortedData);
            setTopicInfo({data: res?.data?.topics, error: ''});
        } else {
            setTopicInfo({data: [], error: res?.data?.detail ? res?.data?.detail : 'Something went wrong. Please try again later'});
        }
    }

    const handleTopicClick = (el) => {
        
    }

    let detailsApi = useFetchAPI("DetailsApi", `/user/${appState?.userInfo?.localId}`, "GET", '', CommonHeaders(), fetchQueryParams("", "", "", onDetailSuccess));
    let getCategoriesList = useFetchAPI("GetCategoriesList", `/categories/getCategoryList`, "GET", '', CommonHeaders(), fetchQueryParams("", "", "", onCategoriesListSuccess));
    let getCategories = useFetchAPI("GetCategories", `/categories/getCategoriesFromList/${categoryType}`, "GET", '', CommonHeaders(), fetchQueryParams("", "", "", onCategoriesSuccess, "", callCategoryApi));
    let getTopics = useFetchAPI("GetTopics", `/categories/getTopics/${categoryId}`, "GET", '', CommonHeaders(), fetchQueryParams("", "", "", onTopicsSuccess, "", callTopicApi));
    const fetching = detailsApi?.Loading || detailsApi?.Fetching || getCategoriesList?.Loading || getCategoriesList?.Fetching;

    return (
        <>
            {(fetching) && <Loader showLoader={fetching} />}
            <div className={HomeStyles.container}>
                <div className={HomeStyles.topBar}>
                    <div className={HomeStyles.topBarContainer}>
                        <div className={HomeStyles.logo}>
                            <img src="logo-path.png" alt="Logo" />
                        </div>
                        <div className={HomeStyles.searchBar}>
                            <TextField
                                name='search'
                                value={searchInput}
                                onChange={handleChange}
                                InputProps={{
                                    type: 'text',
                                    startAdornment: <InputAdornment position="start"><SearchIcon className={searchInput?.length > 0 ? HomeStyles.searchIcon : HomeStyles.searchIconDisabled} /></InputAdornment>,
                                    endAdornment: <InputAdornment position="end">{searchInput?.length > 0 && <ClearIcon className={HomeStyles.clearIcon} onClick={handleClear} />}</InputAdornment>
                                }}
                                sx={{ input: { "&::placeholder": { opacity: 0.7, zIndex: 10000 } } }}
                                className={HomeStyles.textField}
                                placeholder={"Search for anything"} size="large"
                            />
                        </div>
                        <div className={HomeStyles.requestSection}>
                            <div className={HomeStyles.requestSectionContainer}>
                                <div>
                                    <h5 className={HomeStyles.requestText}>Request a Category</h5>
                                </div>
                                <div>
                                    <h5 className={HomeStyles.requestText}>Request a Topic</h5>
                                </div>
                            </div>
                        </div>
                        <div className={HomeStyles.profileSection}>
                            <div className={HomeStyles.profileSectionContainer}>
                                <div className={HomeStyles.avatar}>
                                    <h5>{detailsResponse?.firstName?.charAt(0) + detailsResponse?.lastName?.charAt(0)}</h5>
                                </div>
                                <div>
                                    <CommonButton variant="contained" bgColor={'#5b67f1'} color={'white'} padding={'15px'} borderRadius={'5px'} fontWeight={'bold'} width={'100%'} height={'37px'} onClick={handleLogout}>Log Out</CommonButton>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
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
                                    categoriesData?.map((el, index) => (
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
                                    ))}
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
                                                        <img className={HomeStyles.card__img} src={el?.imageUrl} alt={el?.topicName} />
                                                    </div>
                                                    <div className={HomeStyles.card__content}>
                                                        <h1 className={HomeStyles.topicCard__header}>{el?.topicName}</h1>
                                                        <div className={HomeStyles.card__textWrapper}>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </SwiperSlide>
                                    )) : <><h4>{topicInfo?.error}</h4></>}
                            </div>
                        </Swiper>

                    </div>
                </div>
                <div className={HomeStyles.footer}>

                </div>
            </div>
        </>
    )
}

export default Home