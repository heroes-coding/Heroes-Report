import { combineReducers } from 'redux'
import HOTSDictionaryReducer from './hots_dictionary_reducer'
import RolesActiveReducer from './roles_active_reducer'
import FranchisesActiveReducer from './franchises_active_reducer'
import SelectedHeroesReducer from './selected_heroes_reducer'
import PreferencesReducer from './preferences_reducer'
import MainDataReducer from './main_data_reducer'
import TalentDicReducer from './talent_dictionary_reducer'
import MainSortReducer from './main_sort_reducer'
import StatusReducer from './status_reducer'
import PlayerDataReducer from './player_data_reducer'
import PlayerInfoReducer from './player_info_reducer'
import StatCatReducer from './stat_cat_reducer'
import PlayerSearchList from './player_search_reducer'
import UpdateReplayPage from './replay_page_reducer'
import AddHeroFilter from './filter_heroes_reducer'
import AddHeroTalents from './player_talents_reducer'
import SelectTalent from './select_talent_reducer'
import GetFilteredTalents from './filtered_talents_reducer'

const rootReducer = combineReducers({
  HOTS: HOTSDictionaryReducer,
  roles: RolesActiveReducer,
  franchises: FranchisesActiveReducer,
  selectedHeroes: SelectedHeroesReducer,
  prefs: PreferencesReducer,
  main: MainDataReducer,
  status: StatusReducer,
  statCat: StatCatReducer,
  filteredTalents: GetFilteredTalents,
  selectedTalents: SelectTalent,
  mainOrder: MainSortReducer,
  playerData: PlayerDataReducer,
  playerInfo: PlayerInfoReducer,
  talentData: AddHeroTalents,
  talentDic: TalentDicReducer,
  filterHeroes: AddHeroFilter,
  playerSearchResults: PlayerSearchList,
  replayPage: UpdateReplayPage
})

export default rootReducer
