const FILTER_HEROES = 'filter_heroes'

function filterHeroes(store) {
  console.log(store)
  const roles = store.roles.map(x => x.selected)
  const hasRole = roles.some(x => x)

  const franchises = store.franchises.map(x => x.selected)
  const hasFranchise = franchises.some(x => x)

  const oldHeroes = store.HOTS.heroes
  const heroKeys = Object.keys(oldHeroes)
  const filteredHeroes = {}
  for (let k = 0; k < heroKeys.length; k++) {
    const key = heroKeys[k]
    if ((hasRole && !roles[oldHeroes[key].role]) ||
        (hasFranchise && !franchises[oldHeroes[key].franchise])) {
      filteredHeroes[key] = oldHeroes[key]
      filteredHeroes[key].visible = false
      continue
    }
    filteredHeroes[key] = oldHeroes[key]
    filteredHeroes[key].visible = true
  }
  return {
    type: FILTER_HEROES,
    payload: filteredHeroes
  }
}

export { FILTER_HEROES, filterHeroes }
