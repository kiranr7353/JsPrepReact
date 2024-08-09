import React from 'react'
import TopHeader from '../../../CommonComponents/TopHeader/TopHeader';
import MainContent from '../../../CommonComponents/MainContent/MainContent';

const ReactRedux = (props) => {
  
  const { params, locationDetails } = props;

  return (
    <>
      <TopHeader params={params} locationDetails={locationDetails} />
      <MainContent params={params} locationDetails={locationDetails} />
    </>
  )
}

export default ReactRedux