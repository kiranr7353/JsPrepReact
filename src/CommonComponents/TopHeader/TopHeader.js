import React from 'react'
import TopHeaderStyles from './TopHeaderStyles.module.css';

const TopHeader = (props) => {

    const { params, locationDetails } = props;

    return (
        <div className={TopHeaderStyles.banner}>
            <div className={TopHeaderStyles.body}>
                <div className={TopHeaderStyles.contentFlex}>
                    <div className={TopHeaderStyles.content}>
                        <h4 className={TopHeaderStyles.contentHeader}>{locationDetails?.state?.topicDetails?.topicName}</h4>
                        <h5 className={TopHeaderStyles.contentDescription}>{locationDetails?.state?.topicDetails?.description}</h5>
                    </div>
                    <div className={TopHeaderStyles.image}>
                        <img className={TopHeaderStyles.topicImage} src={locationDetails?.state?.topicDetails?.imageUrl} alt={locationDetails?.state?.topicDetails?.topicName} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TopHeader