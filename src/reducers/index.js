import { combineReducers } from 'redux'
import HOTSDictionaryReducer from './hots_dictionary_reducer'
import RolesActiveReducer from './roles_active_reducer'
import FranchisesActiveReducer from './franchises_active_reducer'
import PreferencesReducer from './preferences_reducer'
import MainDataReducer from './main_data_reducer'
import TalentDicReducer from './talent_dictionary_reducer'
import MainSortReducer from './main_sort_reducer'
import StatusReducer from './status_reducer'
import PlayerDataReducer from './player_data_reducer'
import SelectedAccount from './selected_account_reducer'
import PlayerInfoReducer from './player_info_reducer'
import StatCatReducer from './stat_cat_reducer'
import PlayerSearchList from './player_search_reducer'
import UpdateReplayPage from './replay_page_reducer'
import AddHeroFilter from './filter_heroes_reducer'
import AddHeroTalents from './player_talents_reducer'
import SelectTalent from './select_talent_reducer'
import GetFilteredTalents from './filtered_talents_reducer'
import GetTimedData from './timed_data_reducer'
import GetTimeRange from './time_range_reducer'
import UpdateTalentHero from './talent_hero_reducer'
import SearchReducer from './search_reducer'
import PlayerCoplayerReducer from './player_coplayer_reducer'
import SelectedCoplayerReducer from './selected_coplayer_reducer'
import DateRangeReducer from './date_range_reducer'
import FullModeReducer from './full_modes_reducer'

const rootReducer = combineReducers({
  HOTS: HOTSDictionaryReducer,
  searchTerm: SearchReducer,
  roles: RolesActiveReducer,
  fullModes: FullModeReducer,
  dates: DateRangeReducer,
  selectedCoplayer: SelectedCoplayerReducer,
  franchises: FranchisesActiveReducer,
  prefs: PreferencesReducer,
  main: MainDataReducer,
  status: StatusReducer,
  statCat: StatCatReducer,
  timeRange: GetTimeRange,
  yourSelectedAccount: SelectedAccount,
  filteredTalents: GetFilteredTalents,
  selectedTalents: SelectTalent,
  mainOrder: MainSortReducer,
  playerData: PlayerDataReducer,
  playerInfo: PlayerInfoReducer,
  playerCoplayerResults: PlayerCoplayerReducer,
  talentData: AddHeroTalents,
  talentDic: TalentDicReducer,
  talentHero: UpdateTalentHero,
  timedData: GetTimedData,
  filterHeroes: AddHeroFilter,
  playerSearchResults: PlayerSearchList,
  replayPage: UpdateReplayPage
})

export default rootReducer
