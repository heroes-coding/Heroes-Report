import { ADD_HERO_FILTER, ADD_HERO_TALENT } from "../actions";

const hasHero = (state, action) => {
  for (let i = 0; i < state[action.team].length; i++) {
    if (state[action.team][i].hero === action.hero) return true;
  }
  return false;
};

export default function(state = [[], [], []], action) {
  if (action.type === ADD_HERO_TALENT) {
    const { team, index, talent, add } = action;
    let newState = state.map(x => [...x]);
    if (add) newState[team][index].talents[talent.lev][talent.talent] = talent;
    else delete newState[team][index].talents[talent.lev][talent.talent];
    return newState;
  }
  if (action.type === ADD_HERO_FILTER) {
    let newState = state.map(x => [...x]);
    if (action.team === 4) {
      // switch teams
      const team1Data = [...newState[0].map(x => x)];
      newState[0] = [...newState[1].map(x => x)];
      newState[1] = team1Data;
    } else if (action.team === "D") {
      const { id, slot } = action.hero;
      newState[id].splice(slot, 1);
    } else if (action.hero === "A") {
      newState[action.team] = [];
    } else if (state[action.team].length === 5) {
      return state;
    } else if (hasHero(state, action) && !isNaN(action.hero)) {
      return state;
    } else if (typeof action.hero === "object") {
      // not applicable
      const sameRole = newState[action.team]
        .map((x, i) => [x, i])
        .filter(
          x =>
            typeof x[0] === "object" &&
            !x[0].hasOwnProperty("hero") &&
            x[0].id.includes(action.hero.id)
        );
      if (sameRole.length)
        newState[action.team][sameRole[0][1]].count = action.hero.count;
      else newState[action.team].push(action.hero);
    } else {
      newState[action.team].push({
        hero: action.hero,
        talents: [{}, {}, {}, {}, {}, {}, {}],
      });
    }
    return newState;
  }
  return state;
}
