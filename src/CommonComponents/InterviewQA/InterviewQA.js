import React, { useState } from 'react'
import InterviewQAStyles from './InterviewQAStyles.module.css'
import CommonButton from '../CommonButton'
import parse from "html-react-parser";
import AddQA from '../AddQA/AddQA';

const InterviewQA = (props) => {

    const { params, locationDetails } = props;

    const [addQAClicked, setAddQAClicked] = useState(false);

    const toggleDrawer = () => {
        setAddQAClicked(true);
    }

    let data = [
        { answer: 'There are many ways to create objects in javascript as below', snippets: [{ url:'https://firebasestorage.googleapis.com/v0/b/jsprep-ed0c8.appspot.com/o/LoginPageImages%2Flogin.jpg?alt=media&token=5612d53b-c76b-48ca-a4c5-c9ae0e5c9a48', imageUploaded: true }], hasTable: true, hasPoints: true, pointsData: [{ pointHeader: 'Object constructor:', data: 'The simplest way to create an empty object is using the Object constructor. Currently this approach is not recommended.', snippets: [{ url: 'https://firebasestorage.googleapis.com/v0/b/jsprep-ed0c8.appspot.com/o/LoginPageImages%2Flogin.jpg?alt=media&token=5612d53b-c76b-48ca-a4c5-c9ae0e5c9a48', imageUploaded: true }] },{ pointHeader:'Objects create method', data: 'The create method of Object creates a new object by passing the prototype object as a parameter', snippets: [{ url: 'https://firebasestorage.googleapis.com/v0/b/jsprep-ed0c8.appspot.com/o/LoginPageImages%2Flogin.jpg?alt=media&token=5612d53b-c76b-48ca-a4c5-c9ae0e5c9a48', imageUploaded: true }] }], hasNote: true, note: 'The create method of Object creates a new object by passing the prototype object as a parameter' },
        { answer: 'sfdfdsfsdf', snippets: [{ url:'https://firebasestorage.googleapis.com/v0/b/jsprep-ed0c8.appspot.com/o/LoginPageImages%2Flogin.jpg?alt=media&token=5612d53b-c76b-48ca-a4c5-c9ae0e5c9a48', imageUploaded: true }], hasTable: true, hasPoints: true, pointsData: [{ data: 'ssdsd', snippets: [{ url: 'https://firebasestorage.googleapis.com/v0/b/jsprep-ed0c8.appspot.com/o/LoginPageImages%2Flogin.jpg?alt=media&token=5612d53b-c76b-48ca-a4c5-c9ae0e5c9a48', imageUploaded: true }] },{ data: 'ssdsd', snippets: [{ url: 'https://firebasestorage.googleapis.com/v0/b/jsprep-ed0c8.appspot.com/o/LoginPageImages%2Flogin.jpg?alt=media&token=5612d53b-c76b-48ca-a4c5-c9ae0e5c9a48', imageUploaded: true }] }], hasNote: true, note: 'sasa' }
    ]
    let data2 = [
        { answer: '<b>Prototype</b> chaining is used to build new types of objects based on existing ones. It is similar to inheritance in a class based language.', snippets: [{ url:'https://firebasestorage.googleapis.com/v0/b/jsprep-ed0c8.appspot.com/o/LoginPageImages%2Flogin.jpg?alt=media&token=5612d53b-c76b-48ca-a4c5-c9ae0e5c9a48', imageUploaded: true }], hasTable: true, hasPoints: true, pointsData: [{ pointHeader: '', data: '', snippets: [{ url: '', imageUploaded: true }] }], hasNote: true, note: '' },
        { answer: "The prototype on object instance is available through Object.getPrototypeOf(object) or proto property whereas prototype on constructors function is available through Object.prototype.", snippets: [{ url:'https://firebasestorage.googleapis.com/v0/b/jsprep-ed0c8.appspot.com/o/LoginPageImages%2Flogin.jpg?alt=media&token=5612d53b-c76b-48ca-a4c5-c9ae0e5c9a48', imageUploaded: true }], hasTable: true, hasPoints: true, pointsData: [{ data: '', snippets: [{ url: '', imageUploaded: true }] },{ data: '', snippets: [{ url: '', imageUploaded: true }] }], hasNote: true, note: '' }
    ]

    return (
        <>
            <div className={InterviewQAStyles.mainContentContainer}>
                <div className={InterviewQAStyles.addQuestionBtn}>
                    <CommonButton variant="contained" bgColor={'#5b67f1'} color={'white'} padding={'15px'} borderRadius={'5px'} fontWeight={'bold'} width={'100%'} height={'45px'} margin={'20px 0 0 0'} onClick={toggleDrawer}>Add Question</CommonButton>
                </div>
                { addQAClicked && <AddQA setAddQAClicked={setAddQAClicked} params={params} locationDetails={locationDetails} /> }
                {/* { data2?.map((el, index) => (
                        <>
                        <p>{parse(el.answer)}</p>
                        { el.snippets.map(img => (
                            <img style={{ height: 50, width: 50 }} src={img.url} />
                        )) }
                        { el?.pointsData?.map((ele,i) => (
                           <>
                            <h1>{ele.pointHeader}</h1>
                            <p>{parse(ele.data)}</p>
                            { ele?.snippets?.map(imge => (
                                <img style={{ height: 50, width: 50 }} src={imge?.url} />
                            )) }
                           </>
                        )) }
                        {el?.note}
                        </>
                    )) } */}
            </div>
        </>
    )
}

export default InterviewQA