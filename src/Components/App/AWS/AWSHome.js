import React from 'react'
import IAM from './IAM';

const AWSHome = (props) => {

    const { params, locationDetails } = props;

    const selectSectionToRender = () => {
      switch (params?.topicId) {
        case 'awsIAM':
          return <IAM params={params} locationDetails={locationDetails} />
        default:
          return <IAM params={params} locationDetails={locationDetails} />
      }
    }
  
    return (
      selectSectionToRender()
    )
}

export default AWSHome