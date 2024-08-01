import React from 'react';
import Button from '@mui/material/Button';
import PropTypes from 'prop-types';

const CommonButton = (props) => {
    const { variant, onClick, disabled, type, color, padding, bgColor, borderRadius, disabledBGColor, fontSize,fontWeight,border, margin, className, width, height } = props;
    const buttonStyle = {
        textTransform: "initial",
        ...(variant === "contained"? {backgroundColor: bgColor ? bgColor : "#286ce2"} : {}) ,
        ...(disabled ? { opacity: 0.65 }: {}),
        borderRadius: borderRadius ? borderRadius : 0,
        padding: padding ? padding : "8px 34px",
        fontSize: fontSize ? fontSize : '13px',
        fontWeight: fontWeight ? fontWeight : '',
        color: color ? color : "#fff",
        cursor: disabled ? "not-allowed" : "pointer",
        pointerEvents: "auto",
        border: border? border : "",
        margin: margin,
        width: width ? width :  '',
        height: height ? height :  ''
    };
    return (
        <Button className={className} type={type} style={buttonStyle} variant={variant} onClick={onClick} disabled={disabled} width={width} height={height}>{props.children}</Button>
    )
}
CommonButton.propTypes = {
    type: PropTypes.string,
    color: PropTypes.string,
    onClick: PropTypes.func,
    disabled: PropTypes.bool,
    padding: PropTypes.string,
    bgColor: PropTypes.string,
    disabledBGColor: PropTypes.string,
    fontSize:PropTypes.string
};
export default CommonButton;