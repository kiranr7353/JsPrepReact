import React from 'react'
import JenkinsInterviewQA from './JenkinsInterviewQA.js';

const JenkinsHome = (props) => {

    const { params, locationDetails } = props;

    const selectSectionToRender = () => {
      switch (params?.topicId) {
        case 'jenkinsQA':
          return <JenkinsInterviewQA params={params} locationDetails={locationDetails} />
        default:
          return <JenkinsInterviewQA params={params} locationDetails={locationDetails} />
      }
    }
  
    return (
      selectSectionToRender()
    )
}

export default JenkinsHome