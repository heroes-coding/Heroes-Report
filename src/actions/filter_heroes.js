const FILTER_HEROES = 'filter_heroes'

function filterHeroes(store) {
  const roles = store.roles.map(x => x.selected)
  const hasRole = roles.some(x => x)

  const franchises = store.franchises.map(x => x.selected)
  const hasFranchise = franchises.some(x => x)

  const oldHeroes = store.HOTS.heroes
  const heroKeys = Object.keys(oldHeroes)
  const filteredHeroes = {}

  for (let k = 0; k < heroKeys.length; k++) {
    const key = heroKeys[k]
    if (hasRole && !roles[oldHeroes[key].role]) {
      continue
    }
    if (hasFranchise && !franchises[oldHeroes[key].franchise]) {
      continue
    }

    filteredHeroes[key] = oldHeroes[key]
  }
  return {
    type: FILTER_HEROES,
    payload: filteredHeroes
  }
}

export { FILTER_HEROES, filterHeroes }
