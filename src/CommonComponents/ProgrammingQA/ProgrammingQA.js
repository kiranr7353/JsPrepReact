import React, { useState } from 'react'
import ProgrammingStyles from './ProgrammingStyles.module.css'
import CommonButton from '../CommonButton'
import AddProgrammingQA from '../AddProgrammingQA/AddProgrammingQA';

const ProgrammingQA = (props) => {

    const { params, locationDetails } = props;

    const [addPQAClicked, setAddPQAClicked] = useState(false);
    const [editClicked, setEditClicked] = useState(false);
    const [editItem, setEditItem] = useState({});

    const toggleDrawer = () => {
        setAddPQAClicked(true);
    }

    return (
        <div className={ProgrammingStyles.mainContentContainer}>
            <div className={ProgrammingStyles.addQuestionBtn}>
                <CommonButton variant="contained" bgColor={'#5b67f1'} color={'white'} padding={'15px'} borderRadius={'5px'} fontWeight={'bold'} width={'100%'} height={'45px'} margin={'20px 0 0 0'} onClick={toggleDrawer}>Add ProgrammingQA</CommonButton>
            </div>
            {(addPQAClicked || editClicked) && <AddProgrammingQA setAddPQAClicked={setAddPQAClicked} setEditClicked={setEditClicked} editClicked={editClicked} params={params} locationDetails={locationDetails} editItem={editItem} />}
        </div>
    )
}

export default ProgrammingQA