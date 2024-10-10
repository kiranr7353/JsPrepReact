import React from 'react'
import HTMLConcepts from './HTMLConcepts';
import HTMLInterviewQA from './HTMLInterviewQA';

const HTMLHome = (props) => {

    const { params, locationDetails } = props;

    const selectSectionToRender = () => {
        switch (params?.topicId) {
            case 'htmlConcepts':
                return <HTMLConcepts params={params} locationDetails={locationDetails} />
            case 'htmlInterviewQuestions':
                return <HTMLInterviewQA params={params} locationDetails={locationDetails} />
            default:
                return <HTMLConcepts params={params} locationDetails={locationDetails} />
        }
    }

    return (
        selectSectionToRender()
    )
}

export default HTMLHome