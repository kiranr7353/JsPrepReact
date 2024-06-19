import React, { createContext, useState, useContext } from 'react';

export const UserContext = createContext();
export const UseAuthContext = () => useContext(UserContext);

const UserContextProvider = (props) => {

    const [infoObject, setinfoObject] = useState('');
    const [hasGbdAccess, setGbdAccess ] = useState(false);
    const [genAiEnable,setGenAiEnable] = useState(false);
    const [chatHistory,setChatHistory] = useState([]);
    const [userQuestion,setUserQuestion] = useState([]);
    const [formedUserQues,setFormedUserQuestion] = useState([]);

    const setObject = (userObj, type) => {
        
        switch (type) {
            case 'reset': {
                setinfoObject({});
                break;
            }
            case 'update': {
                setinfoObject(data => {
                    return { ...data, ...userObj }
                });
                break;
            }
            case 'add': {
                if (!infoObject) {
                    setinfoObject(userObj);
                }
                break;
            }
            default: break
        }
    }

    const setAccess = (data) => {
        
        if( data && data?.result){
            setGbdAccess(data?.result);
        }
    }

    const setGenAiEnableValue = (data) => {
        setGenAiEnable(data);
    }

    const setGenAiChatHistory = (completedata,userques,formedquestions) => {
        setChatHistory(completedata);
        setUserQuestion(userques);
        setFormedUserQuestion(formedquestions)
    }

    const value = { hasGbdAccess, setAccess, infoObject, setObject,genAiEnable,setGenAiEnableValue,chatHistory,userQuestion,formedUserQues,setGenAiChatHistory };

    return (
        <UserContext.Provider value={value}>
            {props.children}
        </UserContext.Provider>
    )
}
export default UserContextProvider