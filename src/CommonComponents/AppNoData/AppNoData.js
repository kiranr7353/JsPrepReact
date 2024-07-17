import React from 'react';
import NoDataStyle from './Styles/AppNoData.module.css';
import NoResultsImg from '../../Images/noDataFound.jpg';

const AppNoData = (props) => {

    const { message, isImgRequired = true } = props;

    return (
        <React.Fragment>
            <div className={`${NoDataStyle.noDataContainer}`}>
            {isImgRequired && <img src={NoResultsImg} className={`${NoDataStyle.noDataImg}`} alt="no-records" />}
                {!message &&
                    <div>
                        <span className={`${NoDataStyle.noDataTxt}`}>No Data Found</span>
                    </div>
                }
                {message &&
                    <div>
                        <span className={`${NoDataStyle.noDataTxt}`}>{message}</span>
                    </div>
                }
            </div>
        </React.Fragment>
    )
}

export default AppNoData;