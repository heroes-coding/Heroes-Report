import { createSelector } from 'reselect'
const timedData = state => state.timedData

const getTimedData = (timedData) => {
  return timedData
}

export default createSelector(
  timedData,
  getTimedData
)
