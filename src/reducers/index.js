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
import StatCatReducer from './stat_cat_reducer'

const rootReducer = combineReducers({
  HOTS: HOTSDictionaryReducer,
  roles: RolesActiveReducer,
  franchises: FranchisesActiveReducer,
  selectedHeroes: SelectedHeroesReducer,
  prefs: PreferencesReducer,
  main: MainDataReducer,
  status: StatusReducer,
  statCat: StatCatReducer,
  mainOrder: MainSortReducer,
  playerData: PlayerDataReducer,
  talentDic: TalentDicReducer
})

export default rootReducer
