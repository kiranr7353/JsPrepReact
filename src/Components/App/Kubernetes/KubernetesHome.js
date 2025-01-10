import React from 'react'
import KubernetesInterviewQA from './KubernetesInterviewQA';

const KubernetesHome = (props) => {

    const { params, locationDetails } = props;

    const selectSectionToRender = () => {
      switch (params?.topicId) {
        case 'kubernetesInterviewQA':
          return <KubernetesInterviewQA params={params} locationDetails={locationDetails} />
        default:
          return <KubernetesInterviewQA params={params} locationDetails={locationDetails} />
      }
    }
  
    return (
      selectSectionToRender()
    )
}

export default KubernetesHome