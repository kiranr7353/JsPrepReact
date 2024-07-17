import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import { styled } from '@mui/material/styles';
import TableRow from '@mui/material/TableRow';
import Table from '@mui/material/Table';

export const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: '#e6e6e6',
        color: theme.palette.common.black,
        fontWeight: 'bold'
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
        [theme.breakpoints.down('md')]: {
            fontSize: 13,
            padding: 10
        },
    },
}));
export const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(even)': {
        backgroundColor: theme.palette.action.hover,
    },
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));
export const CustomizedTable = styled(Table)(({ theme }) => ({
    boxShadow: '0px 0px 18px 0px #14577c'
}));