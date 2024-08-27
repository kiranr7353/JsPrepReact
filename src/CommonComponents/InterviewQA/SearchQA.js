import { InputAdornment, TextField } from '@mui/material'
import React, { useState } from 'react'
import InterviewQAStyles from './InterviewQAStyles.module.css'
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

const SearchQA = ({ tab, setGetInterviewQAPayload }) => {

    const [searchInput, setSearchInput] = useState('');

    const handleInputChange = (e) => {
       if(tab === 'AllQA') {
        setSearchInput(e.target.value)
       }
    }

    const handleKeyDown = (e) => {
        if (e.keyCode === 13 || e.key === "Enter") {
            if(tab === 'AllQA' && searchInput?.length > 0) {
                setGetInterviewQAPayload(prev => ({...prev, searchText: searchInput}))
            }
        }
    }

    const handleClear = (e) => {
        
    }

    console.log(searchInput);
    

    return (
        <>
            
        </>
    )
}

export default SearchQA