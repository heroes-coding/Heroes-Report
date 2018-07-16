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
import AddTalentHeroFilter from './filter_hero_talents_reducer'
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
import FullMapsReducer from './full_maps_reducer'
import FullRegionsReducer from './full_regions_reducer'
import RustyStatsReducer from './rusty_stats_reducer'
import RustyGraphsReducer from './rusty_graphs_reducer'
import FullTimeDensityReducer from './full_timedensity_reducer'
import TokenReducer from './token_reducer'
import SelectTalentHeroAdvancedReducer from './advanced_talent_hero_reducer'
import talentPopupOpen from './advanced_talent_popup_reducer'
import showMirrors from './show_mirrors_reducer'
import fullDataStatus from './full_data_reducer'
import levelRange from './level_range_reducer'
import MMRRange from './mmr_range_reducer'

import { createStore, applyMiddleware } from 'redux'
import ReduxPromise from 'redux-promise'


const rootReducer = combineReducers({
  MMRRange,
  levelRange,
  fullDataStatus,
  showMirrors,
  talentPopupOpen,
  HOTS: HOTSDictionaryReducer,
  token: TokenReducer,
  searchTerm: SearchReducer,
  roles: RolesActiveReducer,
  timeDensity: FullTimeDensityReducer,
  fullModes: FullModeReducer,
  fullMaps: FullMapsReducer,
  rustyStats: RustyStatsReducer,
  rustyGraphs: RustyGraphsReducer,
  fullRegions: FullRegionsReducer,
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
  filterTalentHeroes: AddTalentHeroFilter,
  advancedTalentHero: SelectTalentHeroAdvancedReducer,
  playerSearchResults: PlayerSearchList,
  replayPage: UpdateReplayPage,
})

// making store here so I can access it outside of react components elsewhere
const createStoreWithMiddleware = applyMiddleware(ReduxPromise)(createStore)
const store = createStoreWithMiddleware(rootReducer)

export default store
