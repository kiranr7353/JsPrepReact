import React from 'react'
import DockerInterviewQA from './DockerInterviewQA';

const DockerHome = (props) => {

    const { params, locationDetails } = props;

    const selectSectionToRender = () => {
      switch (params?.topicId) {
        case 'dockerInterviewQA':
          return <DockerInterviewQA params={params} locationDetails={locationDetails} />
        default:
          return <DockerInterviewQA params={params} locationDetails={locationDetails} />
      }
    }
  
    return (
      selectSectionToRender()
    )
}

export default DockerHome