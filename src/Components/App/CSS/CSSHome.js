import React from 'react'
import CSSConcepts from './CSSConcepts';
import CSSInterviewQA from './CSSInterviewQA';

export const CSSHome = (props) => {

    const { params, locationDetails } = props;

    const selectSectionToRender = () => {
        switch (params?.topicId) {
            case 'cSSConcepts':
                return <CSSConcepts params={params} locationDetails={locationDetails} />
            case 'cssInterviewQA':
                return <CSSInterviewQA params={params} locationDetails={locationDetails} />
            default:
                return <CSSConcepts params={params} locationDetails={locationDetails} />
        }
    }

    return (
        selectSectionToRender()
    )
}
