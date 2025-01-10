import React from 'react'
import IAM from './IAM';
import AWSInterviewQA from './AWSInterviewQA';

const AWSHome = (props) => {

  const { params, locationDetails } = props;

  const selectSectionToRender = () => {
    switch (params?.topicId) {
      case 'awsIAM':
        return <IAM params={params} locationDetails={locationDetails} />
      case 'awsInterviewQA':
        return <AWSInterviewQA params={params} locationDetails={locationDetails} />
      default:
        return <IAM params={params} locationDetails={locationDetails} />
    }
  }

  return (
    selectSectionToRender()
  )
}

export default AWSHome