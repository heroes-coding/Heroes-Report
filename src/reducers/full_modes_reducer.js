import { UPDATE_FULL_MODE } from "../actions";
const initialModeState = [
  { id: 1, name: "Quick Match", isActive: true },
  { id: 3, name: "Storm / Hero League", isActive: false },
  { id: 4, name: "Team League", isActive: false },
  { id: 2, name: "Unranked Draft", isActive: false },
  { id: 5, name: "Brawl", isActive: false },
];

export default function(
  state = initialModeState.map(a => {
    return { ...a };
  }),
  action
) {
  if (action.type === UPDATE_FULL_MODE) {
    if (action.payload === "A") {
      return initialModeState.map(a => {
        return { ...a };
      });
    }
    return state.map(a => {
      if (a.id === action.payload) return { ...a, isActive: !a.isActive };
      return { ...a };
    });
  }
  return state;
}
