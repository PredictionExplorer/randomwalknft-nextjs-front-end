import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Grid, Box, CircularProgress, Typography } from '@mui/material'
import Pagination from '@mui/material/Pagination'

import { SearchBox, SearchField, SearchButton } from './styled'
import NFT from './NFT'

const PaginationGrid = ({ loading, data }) => {
  const [nftId, setNftId] = useState('')
  const [searchId, setSearchId] = useState(null)
  const [searchResult, setSearchResult] = useState(false)
  const [collection, setCollection] = useState([])
  const [perPage] = useState(15)
  const [curPage, setCurPage] = useState(1)

  const router = useRouter()

  const handleNextPage = (page) => {
    router.query['page'] = page
    router.push({ pathname: router.pathname, query: router.query})
  }

  const handleSearchChange = async (e) => {
    setNftId(e.target.value)
    if (!e.target.value) {
      setSearchId(null)
      setSearchResult(false)
    }
  }

  const handleSearch = async () => {
    setSearchId(nftId)
    setSearchResult(collection.includes(nftId))
  }

  useEffect(() => {
    setCollection(data)
  }, [data])

  useEffect(() => {
    const page = parseInt(router.query['page'] as string) || 1
    setCurPage(page)
  }, [router])

  return (
    <Box mt={4}>
      <SearchBox>
        <SearchField
          variant="filled"
          placeholder="Enter NFT ID"
          color="secondary"
          value={nftId}
          onChange={handleSearchChange}
        />
        <SearchButton
          size="large"
          variant="contained"
          color="primary"
          onClick={handleSearch}
        >
          Search
        </SearchButton>
      </SearchBox>
      {loading && (
        <Box display="flex" justifyContent="center">
          <CircularProgress color="secondary" />
        </Box>
      )}
      {data.length > 0 && (
        <>
          <Grid spacing={4} container>
            {searchId ? (
              !searchResult ? (
                <Grid item>
                  <Typography variant="h6" align="center">
                    Nothing Found!
                  </Typography>
                </Grid>
              ) : (
                <Grid item xs={6} sm={4}>
                  <NFT tokenId={searchId} />
                </Grid>
              )
            ) : (
              collection
                .slice((curPage - 1) * perPage, curPage * perPage)
                .map((index) => (
                  <Grid key={index} item xs={12} sm={6} md={4}>
                    <NFT tokenId={index} />
                  </Grid>
                ))
            )}
          </Grid>
          {!searchId && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                color="primary"
                page={curPage}
                onChange={(e, page) => handleNextPage(page)}
                count={Math.ceil(collection.length / perPage)}
                showFirstButton
                showLastButton
              />
            </Box>
          )}
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

export default PaginationGrid
