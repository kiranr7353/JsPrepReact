import React from 'react'
import TopHeader from '../../../CommonComponents/TopHeader/TopHeader'
import InterviewQA from '../../../CommonComponents/InterviewQA/InterviewQA'

const HTMLInterviewQA = (props) => {

    const { params, locationDetails } = props;

    return (
        <>
            <TopHeader params={params} locationDetails={locationDetails} />
            <InterviewQA params={params} locationDetails={locationDetails} />
        </>
    )
}

export default HTMLInterviewQA