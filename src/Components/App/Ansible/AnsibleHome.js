import React from 'react'
import AnsibleInterviewQA from './AnsibleInterviewQA';

const AnsibleHome = (props) => {

    const { params, locationDetails } = props;

    const selectSectionToRender = () => {
      switch (params?.topicId) {
        case 'ansibleInterviewQA':
          return <AnsibleInterviewQA params={params} locationDetails={locationDetails} />
        default:
          return <AnsibleInterviewQA params={params} locationDetails={locationDetails} />
      }
    }
  
    return (
      selectSectionToRender()
    )
}

export default AnsibleHome