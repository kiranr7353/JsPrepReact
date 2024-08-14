import React from 'react'
import { useLocation, useParams } from 'react-router-dom';
import ReactHome from '../React/ReactHome';
import JavascriptHome from '../Javascript/JavascriptHome';

const TopicHome = () => {

  const location = useLocation();
  const params = useParams();

  const selectTopicToRender = () => {
    switch (params?.categoryId) {
      case 'react':
        return <ReactHome params={params} locationDetails={location} />
      case 'javascript':
        return <JavascriptHome params={params} locationDetails={location} />
      default:
        return <JavascriptHome params={params} locationDetails={location} />
    }
  }

  return (
    selectTopicToRender()
  )
}

export default TopicHome