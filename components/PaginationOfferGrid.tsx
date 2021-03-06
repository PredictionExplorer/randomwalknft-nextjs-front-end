import React, { useState, useEffect } from 'react'
import {
  Grid,
  Box,
  CircularProgress,
  Typography,
  Pagination,
} from '@mui/material'

import NFTOffer from './NFTOffer'

const PaginationOfferGrid = ({ loading, data }) => {
  const [collection, setCollection] = useState([])
  const [perPage] = useState(15)
  const [curPage, setCurPage] = useState(1)

  useEffect(() => {
    setCollection(data)
  }, [data])

  return (
    <Box mt={4}>
      {loading && (
        <Box display="flex" justifyContent="center">
          <CircularProgress color="secondary" />
        </Box>
      )}
      {data.length > 0 && (
        <>
          <Grid spacing={4} container>
            {collection
              .slice((curPage - 1) * perPage, curPage * perPage)
              .map((offer, i) => (
                <Grid key={i} item xs={12} sm={6} md={4}>
                  <NFTOffer offer={offer} />
                </Grid>
              ))}
          </Grid>
          <Box display="flex" justifyContent="center" py={3}>
            <Pagination
              color="primary"
              page={curPage}
              onChange={(e, page) => setCurPage(page)}
              count={Math.ceil(collection.length / perPage)}
              showFirstButton
              showLastButton
            />
          </Box>
        </>
      )}
      {!loading && !data.length && (
        <Typography variant="h6" align="center">
          Nothing Found!
        </Typography>
      )}
    </Box>
  )
}

export default PaginationOfferGrid
