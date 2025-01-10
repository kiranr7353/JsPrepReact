import React from 'react'
import TerraformInterviewQA from './TerraformInterviewQA';

const TerraformHome = (props) => {

    const { params, locationDetails } = props;

    const selectSectionToRender = () => {
      switch (params?.topicId) {
        case 'jenkinsQA':
          return <TerraformInterviewQA params={params} locationDetails={locationDetails} />
        default:
          return <TerraformInterviewQA params={params} locationDetails={locationDetails} />
      }
    }
  
    return (
      selectSectionToRender()
    )
}

export default TerraformHome