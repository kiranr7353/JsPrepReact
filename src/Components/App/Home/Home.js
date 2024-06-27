import React, { useMemo, useState } from 'react'
import HomeStyles from './HomeStyles.module.css';

import { useSelector } from 'react-redux';
import { useFetchAPI } from '../../../Hooks/useAPI';
import { fetchQueryParams } from '../../../Hooks/fetchQueryParams';
import { CommonHeaders } from '../../../CommonComponents/CommonHeaders';
import { GetCookie } from '../../../Utils/util-functions';
import { Box, InputAdornment, Tab, Tabs, TextField, styled } from '@mui/material';
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

const AntTabs = styled(Tabs)({
    borderBottom: '1px solid #e8e8e8',
    '& .MuiTabs-indicator': {
        backgroundColor: '#1890ff',
    },
});

const AntTab = styled((props) => <Tab disableRipple {...props} />)(
    ({ theme }) => ({
        textTransform: 'none',
        minWidth: 0,
        [theme.breakpoints.up('sm')]: {
            minWidth: 0,
        },
        fontWeight: theme.typography.fontWeightRegular,
        marginRight: theme.spacing(1),
        color: 'rgba(0, 0, 0, 0.85)',
        fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
        ].join(','),
        '&:hover': {
            color: '#40a9ff',
            opacity: 1,
        },
        '&.Mui-selected': {
            color: '#1890ff',
            fontWeight: theme.typography.fontWeightMedium,
        },
        '&.Mui-focusVisible': {
            backgroundColor: '#d1eaff',
        },
    }),
);

const StyledTabs = styled((props) => (
    <Tabs
        {...props}
        TabIndicatorProps={{ children: <span className="MuiTabs-indicatorSpan" /> }}
    />
))({
    '& .MuiTabs-indicator': {
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    '& .MuiTabs-indicatorSpan': {
        maxWidth: 40,
        width: '100%',
        backgroundColor: '#635ee7',
    },
});

const StyledTab = styled((props) => (
    <Tab disableRipple {...props} />
))(({ theme }) => ({
    textTransform: 'none',
    fontWeight: theme.typography.fontWeightRegular,
    fontSize: theme.typography.pxToRem(15),
    marginRight: theme.spacing(1),
    color: 'rgba(255, 255, 255, 0.7)',
    '&.Mui-selected': {
        color: '#fff',
    },
    '&.Mui-focusVisible': {
        backgroundColor: 'rgba(100, 95, 228, 0.32)',
    },
}));


const Home = () => {

    const appState = useSelector(state => state);
    console.log(appState);

    const [searchInput, setSearchInput] = useState('');
    const [detailsResponse, setDetailsResponse] = useState({});
    const [categoriesData, setCategoriesData] = useState([]);
    const [tabValue, setTabValue] = useState('');

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

    const onCategoriesSuccess = res => {
        if ((res?.status === 200 || res?.status === 201)) {
            console.log(res);
            setCategoriesData(res?.data?.categories);
            setTabValue(res?.data?.categories[0]?.categoryName);
            // setDetailsResponse(res?.data?.userInfo);
        } else {

        }
    }

    const handleLogout = () => {

    }

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    }

    let detailsApi = useFetchAPI("DetailsApi", `/user/${appState?.userInfo?.localId}`, "GET", '', CommonHeaders(), fetchQueryParams("", "", "", onDetailSuccess));
    let getCategories = useFetchAPI("GetCategories", `/categories/getCategories`, "GET", '', CommonHeaders(), fetchQueryParams("", "", "", onCategoriesSuccess));
    const fetching = detailsApi?.Loading || detailsApi?.Fetching || getCategories?.Loading || getCategories?.Fetching;

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
                    <div className={HomeStyles.categories}>
                        <h4 className={HomeStyles.categoriesText}>Categories</h4>
                        <Swiper
                            slidesPerView={4}
                            spaceBetween={0}
                            cssMode={true}
                            navigation={true}
                            pagination={{
                                clickable: true,
                            }}
                            mousewheel={true}
                            keyboard={true}
                            modules={[Navigation, Pagination, Mousewheel, Keyboard]}
                            className="mySwiper"
                        >
                            <div className={HomeStyles.grid}>
                                {categoriesData?.map((el, index) => (
                                    <SwiperSlide key={el?.categoryId}>
                                        <div className={HomeStyles.card}><img className={HomeStyles.card__img} src={el?.imageUrl} alt="Snowy Mountains" />
                                            <div className={HomeStyles.card__content}>
                                                <h1 className={HomeStyles.card__header}>{el?.categoryName}</h1>
                                                <div className={HomeStyles.card__textWrapper}>
                                                    <p className={HomeStyles.card__text}>{el?.description}</p>
                                                </div>
                                            </div>
                                            <div>
                                            <button className={HomeStyles.card__text}>Explore <span>&rarr;</span></button>
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </div>
                        </Swiper>
                        {/* <Box sx={{ maxWidth: { xs: 320, sm: 480, lg: 800, xl: 1500 }, bgcolor: 'background.paper' }}>
                            <TabContext value={tabValue}>
                                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                    <TabList onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
                                        {categoriesData?.map((el, index) => (
                                            <Tab icon={<img src={el?.imageUrl} className={HomeStyles.tabImage} />} key={el?.categoryId} label={el?.categoryName} value={el?.categoryName} />
                                        ))}
                                    </TabList>
                                </Box>
                                {categoriesData?.map((el, index) => (
                                    <TabPanel key={el?.categoryId} value={el?.categoryName}>{el?.categoryName}</TabPanel>
                                ))}
                            </TabContext>
                        </Box> */}
                    </div>
                </div>
                <div className={HomeStyles.footer}>

                </div>
            </div>
        </>
    )
}

export default Home