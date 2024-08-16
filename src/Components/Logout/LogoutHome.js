import React, { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom';
import { RemoveAllCookies } from '../../Utils/util-functions';
import LogoutStyles from './LogoutStyles.module.css';
import CommonButton from '../../CommonComponents/CommonButton';

const LogoutHome = () => {

  const [searchParams] = useSearchParams();
  const sessionExpired = searchParams.get("sessionExpired") || '';

  useEffect(() => {
    RemoveAllCookies();
  }, []);

  return (
    <div className={`row ${LogoutStyles.logoutMain}`}>
      <div className="col-lg-12 col-md-12 col-sm-12">
        <div className={LogoutStyles.signout}>{`${sessionExpired ? 'Session Expired' : 'You have Logged Out Successfully'}`}</div>
        <div>
          <Link to="/login"><CommonButton variant="contained" bgColor={'#5b67f1'} color={'white'} padding={'15px'} borderRadius={'5px'} fontWeight={'bold'} width={'20%'} height={'45px'} margin={'20px 0 0 0'}>Login Again</CommonButton></Link>
        </div>
      </div>
    </div>
  )
}

export default LogoutHome