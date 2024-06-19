import React, { useEffect, useRef } from 'react';
import moment from 'moment';
import refreshToken from '../../Utils/refreshToken';
import { GetCookie } from '../../Utils/cookieManager';

const CountDownTimer = (props) => {

    const { hoursMinSecs, env, displayTimer = false } = props;
    const { hours = 0, minutes = 15, seconds = 0 } = hoursMinSecs;
    const hoursMinSecsObj = useRef({ hours: hours, minutes: minutes, seconds: seconds });

    const getRemainingHourMinSecs = () => {
        if(GetCookie('tokenTimeStamp')) {
            const remaingSeconds = moment(new Date()).diff(new Date(GetCookie('tokenTimeStamp')), 'seconds');
            const remaingDuration = moment.utc((remaingSeconds > 840 ? 840 : 840-remaingSeconds)*1000).format('HH:mm:ss').split(':');
            return {hours: +remaingDuration[0], minutes: +remaingDuration[1], seconds: +remaingDuration[2]};
        } else {
            return {hours: 0, minutes: 15, seconds: 0};
        }
    }

    const tick = () => {
        if (hoursMinSecsObj.current.minutes && GetCookie('tokenTimeStamp')) {
            const diffInSecs = moment(new Date()).diff(new Date(GetCookie('tokenTimeStamp')), 'seconds');
            if (diffInSecs >= getRemainingSeconds({hours: hours, minutes: minutes, seconds: seconds})) {
                refreshToken(env, (isRefreshed) => {
                    if(isRefreshed) reset();
                });
            }
        }
        if (hoursMinSecsObj.current.hours === 0 && hoursMinSecsObj.current.minutes === 0 && hoursMinSecsObj.current.seconds === 0)
            reset();
        else if (hoursMinSecsObj.current.minutes === 0 && hoursMinSecsObj.current.seconds === 0) {
            hoursMinSecsObj.current = {hours: hoursMinSecsObj.current.hours - 1, minutes: 59, seconds: 59};
        } else if (hoursMinSecsObj.current.seconds === 0) {
            hoursMinSecsObj.current = {hours: hoursMinSecsObj.current.hours, minutes: hoursMinSecsObj.current.minutes - 1, seconds: 59};
        } else {
            hoursMinSecsObj.current = {hours: hoursMinSecsObj.current.hours, minutes: hoursMinSecsObj.current.minutes, seconds: hoursMinSecsObj.current.seconds - 1};
        }
    };

    const getRemainingSeconds = (hoursMinSecs) => {
        const { hours = 0, minutes = 15, seconds = 0 } = hoursMinSecs;
        const remainingSeconds = (hours * 60 * 60) + (minutes * 60) + (seconds);
        return remainingSeconds > 840 ? 840 : remainingSeconds && remainingSeconds <= 60 ? remainingSeconds : remainingSeconds - 60;
    }

    const reset = () => {
        const { hours = 0, minutes = 15, seconds = 0 } = getRemainingHourMinSecs();
        hoursMinSecsObj.current = {hours: parseInt(hours), minutes: parseInt(minutes), seconds: parseInt(seconds)};
    }

    React.useEffect(() => {
        const timerId = setInterval(() => tick(), 1000);
        return () => clearInterval(timerId);
    });

    useEffect(() => {
        const { hours = 0, minutes = 15, seconds = 0 } = hoursMinSecs;
        hoursMinSecsObj.current = {hours: parseInt(hours), minutes: parseInt(minutes), seconds: parseInt(seconds)};
    }, [hoursMinSecs]);

    return (
        <div style={{display: displayTimer ? 'block' : 'none'}}>
            { hoursMinSecsObj && hoursMinSecsObj.current ? <p>{`${hoursMinSecsObj.current.hours.toString().padStart(2, '0')}:${hoursMinSecsObj.current.minutes.toString().padStart(2, '0')}:${hoursMinSecsObj.current.seconds.toString().padStart(2, '0')}`}</p> : null }
        </div>
    );
}

export default CountDownTimer;
