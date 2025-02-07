import React from 'react'
import IAM from './IAM';
import AWSInterviewQA from './AWSInterviewQA';
import AWSEC2InterviewQA from './AWSEC2InterviewQA';
import AWSS3InterviewQA from './AWSS3InterviewQA';
import AWSIAMInterviewQA from './AWSIAMInterviewQA';
import AWSScenarioQA from './AWSScenarioQA';
import AWSVPCInterviewQA from './AWSVPCInterviewQA';

const AWSHome = (props) => {

  const { params, locationDetails } = props;

  const selectSectionToRender = () => {
    switch (params?.topicId) {
      case 'awsIAM':
        return <IAM params={params} locationDetails={locationDetails} />
      case 'awsInterviewQA':
        return <AWSInterviewQA params={params} locationDetails={locationDetails} />
      case 'awEC2InterviewQA':
        return <AWSEC2InterviewQA params={params} locationDetails={locationDetails} />
      case 'awS3InterviewQA':
        return <AWSS3InterviewQA params={params} locationDetails={locationDetails} />
      case 'awsIAMInterviewQA':
        return <AWSIAMInterviewQA params={params} locationDetails={locationDetails} />
      case 'awsVPCInterviewQA':
        return <AWSVPCInterviewQA params={params} locationDetails={locationDetails} />
      case 'awsRoute53InterviewQA':
        return <AWSVPCInterviewQA params={params} locationDetails={locationDetails} />
      case 'awsScenarioQA':
        return <AWSScenarioQA params={params} locationDetails={locationDetails} />
      default:
        return <IAM params={params} locationDetails={locationDetails} />
    }
  }

  return (
    selectSectionToRender()
  )
}

export default AWSHome