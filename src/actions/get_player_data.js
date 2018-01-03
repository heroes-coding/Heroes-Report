import getPlayerBinary from '../helpers/binary_player_unpacker'

const GET_PLAYER_DATA = 'get_player_dta'
export { GET_PLAYER_DATA, getPlayerData }

async function getPlayerData(bnetID) {
  window.binaryData = await getPlayerBinary(bnetID)
  return {
    type: GET_PLAYER_DATA,
    playerData: window.binaryData
  }
}
