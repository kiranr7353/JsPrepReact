import React from 'react'
import ReactBasics from './ReactBasics';
import ReactRouter from './ReactRouter';
import ReactRedux from './ReactRedux';
import ReactContext from './ReactContext';
import ReactHooks from './ReactHooks';
import ReactQuery from './ReactQuery';
import TrickyQuestions from './TrickyQuestions';
import ReactRoadMap from './ReactRoadMap';
import InterviewQuestions from './InterviewQuestions';
import ApiCall from './ApiCall';
import ReactAdvanced from './ReactAdvanced';
import CodeSnippets from './CodeSnippets';

const ReactHome = (props) => {

  const { params, locationDetails } = props;
  console.log(params);

  const selectSectionToRender = () => {
    switch (params?.topicId) {
      case 'reactBasics':
        return <ReactBasics params={params} locationDetails={locationDetails} />
      case 'advancedReact':
        return <ReactAdvanced params={params} locationDetails={locationDetails} />
      case 'reactRouter':
        return <ReactRouter params={params} locationDetails={locationDetails} />
      case 'reactContext':
        return <ReactContext params={params} locationDetails={locationDetails} />
      case 'reactHooks':
        return <ReactHooks params={params} locationDetails={locationDetails} />
      case 'reactQuery':
        return <ReactQuery params={params} locationDetails={locationDetails} />
      case 'reactRoadmap':
        return <ReactRoadMap params={params} locationDetails={locationDetails} />
      case 'trickySection':
        return <TrickyQuestions params={params} locationDetails={locationDetails} />
      case 'apiCallInReact':
        return <ApiCall params={params} locationDetails={locationDetails} />
      case 'reactCodeSnippets':
        return <CodeSnippets params={params} locationDetails={locationDetails} />
      case 'interviewQuestions':
        return <InterviewQuestions params={params} locationDetails={locationDetails} />
      case 'reactRedux':
        return <ReactRedux params={params} locationDetails={locationDetails} />
      default:
        return <ReactBasics params={params} locationDetails={locationDetails} />
    }
  }

  return (
    selectSectionToRender()
  )
}

export default ReactHome