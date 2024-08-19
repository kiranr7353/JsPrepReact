import React from 'react'
import TopHeader from '../../../CommonComponents/TopHeader/TopHeader';
import ProgrammingQA from '../../../CommonComponents/ProgrammingQA/ProgrammingQA';

const JavascriptProgrammingQA = (props) => {
  
    const { params, locationDetails } = props;

    return (
      <>
        <TopHeader params={params} locationDetails={locationDetails} />
        <ProgrammingQA params={params} locationDetails={locationDetails} />
      </>
    )
}

export default JavascriptProgrammingQA