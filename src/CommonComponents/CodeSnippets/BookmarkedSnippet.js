import React, { useState } from 'react'
import CodeSnippetsStyles from './CodeSnippetsStyles.module.css';
import { Accordion, AccordionDetails, AccordionSummary, Pagination, Paper, Skeleton, Table, TableBody, TableHead, TableRow, Typography } from '@mui/material'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import BookmarkRemoveIcon from '@mui/icons-material/BookmarkRemove';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'
import AppNoData from '../AppNoData/AppNoData';
import { useFetchAPI } from '../../Hooks/useAPI';
import { CommonHeaders } from '../CommonHeaders';
import { fetchQueryParams } from '../../Hooks/fetchQueryParams';
import ConfirmationDialog from '../ConfirmationDialog/ConfirmationDialog';
import Loader from '../Loader/Loader';

const BookmarkedSnippet = (props) => {

  const { getBookmarkSnippet, setGetBookmarkedSnippetPayload, setBookmarkedPageState, bookmarkedSnippetData, bookmarkedPageState, setcallBookmarkedSnippetApi, getSnippet, setValue } = props;

  const [removeBookmarkPayload, setRemoveBookmarkPayload] = useState({});
  const [callRemoveBookmarkApi, setCallRemoveBookmarkApi] = useState(false);
  const [removeBookmarkInfo, setRemoveBookmarkInfo] = useState({ open: false, successMsg: '', errorMsg: '' });

  const handleBookmarkedPageChange = (event, value) => {
    setBookmarkedPageState(value);
    setGetBookmarkedSnippetPayload(prev => ({ ...prev, pageNumber: value }));
    setcallBookmarkedSnippetApi(true);
  }

  const handleRemoveBookmark = (el) => {
    setRemoveBookmarkPayload({ titleId: el?.titleId });
    setCallRemoveBookmarkApi(true);
  }

  const onRemoveBookmarkSuccess = res => {
    setCallRemoveBookmarkApi(false);
    if ((res?.status === 200 || res?.status === 201)) {
      setRemoveBookmarkInfo({ open: true, successMsg: 'Bookmarked Removed Successfully', errorMsg: '' });
      getSnippet?.refetch();
      setValue(1);
    } else {
      setRemoveBookmarkInfo({ open: true, successMsg: '', errorMsg: res?.data?.detail ? res?.data?.detail : 'Something went wrong. Please try again later' });
    }
  }

  const handleRemoveBookmarkClosePopup = () => {
    setRemoveBookmarkInfo({ open: false, successMsg: '', errorMsg: '' });
    setRemoveBookmarkPayload({});
  }

  const removeBookmark = useFetchAPI("removeBookmark", `/snippets/removeBookmark`, "POST", removeBookmarkPayload, CommonHeaders(), fetchQueryParams("", "", "", onRemoveBookmarkSuccess, "", callRemoveBookmarkApi));

  return (
    <>
      {(removeBookmark?.Loading || removeBookmark?.Fetching) && <Loader showLoader={removeBookmark?.Loading || removeBookmark?.Fetching} />}
      {(getBookmarkSnippet?.Loading || getBookmarkSnippet?.Fetching) ? <Skeleton variant="rectangular" width={'100%'} height={120} sx={{ marginBottom: 10 }} /> :
        (bookmarkedSnippetData && bookmarkedSnippetData?.data?.length > 0) ? bookmarkedSnippetData?.data?.map((el, i) => {
          if (el?.enabled) return (
            <Accordion key={el?.titleId}
              slotProps={{ transition: { timeout: 400 } }}>
              <AccordionSummary
                expandIcon={<ArrowDownwardIcon sx={{ color: 'white' }} />}
                aria-controls="panel1-content"
                id="panel1-header"
                sx={{ background: 'black', color: 'white', marginBottom: '10px' }}
              >
                <div className={CodeSnippetsStyles.questionFlex}>
                  <div>
                    <Typography sx={{ fontWeight: 'bolder' }}>{el?.title}</Typography>
                  </div>
                </div>
              </AccordionSummary>
              <AccordionDetails sx={{ background: '#fcfcfc', boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px', padding: '8px 16px 30px' }}>
                {el?.data?.map((snippet, index) => (
                  <div key={snippet.code + index}>
                    <h3><u>Code</u></h3>
                    <div className={CodeSnippetsStyles.codeBlock}>
                      <pre>
                        <code className={CodeSnippetsStyles.code}>{snippet?.code}</code>
                      </pre>
                    </div>
                    <h3><u>Code Image</u></h3>
                    <div className={CodeSnippetsStyles.ansImageDiv}>
                      {snippet?.snippet?.map(img => (
                        <Zoom>
                          <img src={img.url} alt={img?.url} />
                        </Zoom>
                      ))}
                    </div>
                    {snippet?.explanation?.map((explain, idx) => (
                      <div key={explain?.value + idx}>
                        <h3><u>Explanation {explain.id}</u></h3>
                        <Typography>{explain.value}</Typography>
                      </div>
                    ))}
                    {snippet?.note && <Typography sx={{ paddingTop: 3 }}><b>Note:</b> {snippet?.note}</Typography>}
                  </div>
                ))}
                <div className={CodeSnippetsStyles.iconsDiv}>
                  <EditIcon titleAccess='Edit' className={CodeSnippetsStyles.editQAIcon} onClick={() => props.handleSnippetEdit(el)} />
                  <BookmarkRemoveIcon titleAccess='Remove Bookmark' className={CodeSnippetsStyles.removeBookmarkIcon} onClick={() => handleRemoveBookmark(el)} />
                  <DeleteIcon titleAccess='Delete' className={CodeSnippetsStyles.deleteQAIcon} onClick={() => props.handleSnippetDelete(el)} />
                </div>
              </AccordionDetails>
            </Accordion>
          )
        }) : <AppNoData />}
      {bookmarkedSnippetData?.totalCount > 10 && <div className={CodeSnippetsStyles.pagination}>
        <Pagination count={bookmarkedSnippetData?.totalCount} page={bookmarkedPageState} onChange={handleBookmarkedPageChange} color="primary" />
      </div>}
      <ConfirmationDialog openDialog={removeBookmarkInfo?.open} errorMessage={removeBookmarkInfo?.errorMsg} successMessage={removeBookmarkInfo?.successMsg} handleCloseDialog={handleRemoveBookmarkClosePopup} />
    </>
  )
}

export default BookmarkedSnippet