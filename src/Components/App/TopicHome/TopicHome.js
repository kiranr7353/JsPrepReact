import React from 'react'
import { useLocation, useParams } from 'react-router-dom';
import ReactHome from '../React/ReactHome';
import JavascriptHome from '../Javascript/JavascriptHome';
import HTMLHome from '../HTML/HTMLHome';
import { CSSHome } from '../CSS/CSSHome';
import AWSHome from '../AWS/AWSHome';
import NextHome from '../Next/NextHome';

const TopicHome = () => {

  const location = useLocation();
  const params = useParams();

  const selectTopicToRender = () => {
    switch (params?.categoryId) {
      case 'react':
        return <ReactHome params={params} locationDetails={location} />
      case 'javascript':
        return <JavascriptHome params={params} locationDetails={location} />
      case 'html5':
        return <HTMLHome params={params} locationDetails={location} />
      case 'css3':
        return <CSSHome params={params} locationDetails={location} />
      case 'aws':
        return <AWSHome params={params} locationDetails={location} />
      case 'next':
        return <NextHome params={params} locationDetails={location} />
      default:
        return <JavascriptHome params={params} locationDetails={location} />
    }
  }

  return (
    selectTopicToRender()
  )
}

export default TopicHome