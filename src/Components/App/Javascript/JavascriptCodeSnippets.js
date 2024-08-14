import React from 'react'
import TopHeader from '../../../CommonComponents/TopHeader/TopHeader';
import CodeSnippets from '../../../CommonComponents/CodeSnippets/CodeSnippets';

const JavascriptCodeSnippets = (props) => {

  const { params, locationDetails } = props;

    return (
      <>
        <TopHeader params={params} locationDetails={locationDetails} />
        <CodeSnippets params={params} locationDetails={locationDetails} />
      </>
    )
}

export default JavascriptCodeSnippets