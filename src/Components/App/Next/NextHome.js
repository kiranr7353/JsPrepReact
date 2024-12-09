import React from 'react'
import NextFundamentals from './NextFundamentals';

const NextHome = (props) => {

    const { params, locationDetails } = props;

    const selectSectionToRender = () => {
      switch (params?.topicId) {
        case 'nextFundamentals':
          return <NextFundamentals params={params} locationDetails={locationDetails} />
        default:
          return <NextFundamentals params={params} locationDetails={locationDetails} />
      }
    }
  
    return (
      selectSectionToRender()
    )
}

export default NextHome