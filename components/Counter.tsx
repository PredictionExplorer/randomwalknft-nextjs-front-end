import { Box, Typography } from '@mui/material'
import { isMobile } from 'react-device-detect'

import { CounterWrapper, CounterItem } from './styled'

const Counter = ({ days, hours, minutes, seconds, completed }) => {
  const padZero = (x) => x.toString().padStart(2, '0')

  if (completed) {
    return <></>
  } else {
    return (
      <CounterWrapper>
        <CounterItem>
          <Typography align="center" component="p" variant="h4" color="primary">
            {padZero(days)}
          </Typography>
          <Typography align="center" variant="body1">
            Days
          </Typography>
        </CounterItem>
        <CounterItem>
          <Typography align="center" component="p" variant="h4" color="primary">
            {padZero(hours)}
          </Typography>
          <Typography align="center" variant="body1">
            Hours
          </Typography>
        </CounterItem>
        <CounterItem>
          <Typography align="center" component="p" variant="h4" color="primary">
            {padZero(minutes)}
          </Typography>
          <Typography align="center" variant="body1">
            Minutes
          </Typography>
        </CounterItem>
        <CounterItem>
          <Typography align="center" component="p" variant="h4" color="primary">
            {padZero(seconds)}
          </Typography>
          <Typography align="center" variant="body1">
            Seconds
          </Typography>
        </CounterItem>
      </CounterWrapper>
    )
  }
}

export default Counter
