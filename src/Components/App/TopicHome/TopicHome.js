import React from 'react'
import { useLocation, useParams } from 'react-router-dom';
import ReactHome from '../React/ReactHome';
import JavascriptHome from '../Javascript/JavascriptHome';

const TopicHome = () => {

  const location = useLocation();
  const params = useParams();
  console.log(params);
  console.log(location);

  const selectTopicToRender = () => {
    switch(params?.categoryId){
      case 'react': 
       return <ReactHome params={params} locationDetails={location} />
       case 'javascript': 
       return <JavascriptHome params={params} />
    }
  }

  return (
    selectTopicToRender()
  )
}

export default TopicHome