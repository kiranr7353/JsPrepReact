import React from 'react'
import SearchStyles from './HeaderStyles.module.css';
import { useLocation, useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';

const SearchResults = () => {

    const location = useLocation();
    const navigate = useNavigate();

    const locationInfo = location?.state;

    const handleTopicClick = (el) => {
        navigate(`/home/topic/${el?.topicCategoryId}/${el?.topicId}`, { state: { topicDetails: el } })
    }

    return (
        <>
            <div className={SearchStyles.header}>
                <h2>Search Results for '{locationInfo?.inputText}'</h2>
            </div>
            <div className={SearchStyles.topicsInfo}>
                <div className={SearchStyles.grid}>
                    {locationInfo?.topics?.length > 0 ? locationInfo?.topics?.map((el, index) => {
                        if (el?.enabled) return (
                            <div className={SearchStyles.topicCard} onClick={() => handleTopicClick(el)}>
                                <div className={SearchStyles.topicCardFlex}>
                                    <div className={SearchStyles.imageDiv}>
                                        <img className={SearchStyles.card__imgTopic} src={el?.imageUrl} alt={el?.topicName} />
                                    </div>
                                    <div className={SearchStyles.card__content}>
                                        <h1 className={SearchStyles.topicCard__header}>{el?.topicName}</h1>
                                        <h6 className={SearchStyles.topicCard__desc}>{el?.description}</h6>
                                    </div>
                                </div>
                            </div>
                        )
                    }) : <><h4 className={SearchStyles.topicsError}>{locationInfo?.errorMsg}</h4></>}
                </div>
            </div>
        </>
    )
}

export default SearchResults