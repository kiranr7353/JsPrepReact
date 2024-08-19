import React from 'react'
import JavascriptFundamentals from './JavascriptFundamentals';
import AdvancedJavascript from './AdvancedJavascript';
import JavascriptInterviewQA from './JavascriptInterviewQA';
import JavascriptCodeSnippets from './JavascriptCodeSnippets';
import JavascriptTrickyConcepts from './JavascriptTrickyConcepts';
import JavascriptProgrammingQA from './JavascriptProgrammingQA';

const JavascriptHome = (props) => {
  const { params, locationDetails } = props;

  const selectSectionToRender = () => {
    switch (params?.topicId) {
      case 'javascriptBasics':
        return <JavascriptFundamentals params={params} locationDetails={locationDetails} />
      case 'advancedJavascript':
        return <AdvancedJavascript params={params} locationDetails={locationDetails} />
      case 'javascriptinterviewQuestions':
        return <JavascriptInterviewQA params={params} locationDetails={locationDetails} />
      case 'jsCodeSnippets':
        return <JavascriptCodeSnippets params={params} locationDetails={locationDetails} />
      case 'jsTrickyConcepts':
        return <JavascriptTrickyConcepts params={params} locationDetails={locationDetails} />
      case 'jsProgrammingQA':
        return <JavascriptProgrammingQA params={params} locationDetails={locationDetails} />
      default:
        return <JavascriptFundamentals params={params} locationDetails={locationDetails} />
    }
  }

  return (
    selectSectionToRender()
  )
}

export default JavascriptHome