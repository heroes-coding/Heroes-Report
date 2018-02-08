## Contents
- [About Heroes Report](#about)
- [Where the replays come from](#api)
- [How is MMR calculated and grouped?](#mmr)

## <a name="about">About Heroes Report</a>

Heroes Report is striving to become a great resource for Heroes of the Storm stats.

Before this, I spent more than half a year developing HOTSHits, a standalone replay analyzer that is now deprecated because almost all of its functionality has moved online.

This site is an expensive proposition in terms of time spent (many thousands of hours for this and HOTSHits) and even server costs, for which I am already many hundreds of dollars in the red. If you appreciate what I am doing, [please become a Patreon supporter](https://www.patreon.com/heroesreport).

## <a name="api">Where the replays come from</a>

Most of the replays for the main site come from the excellent API, HOTSApi, which the community has done a good job supporting. Please check it out if you would like to contribute to the development of alternative stats sites as well as my own.

With this being said, please realize that the only thing HOTSApi does for sites like mine is to provide downloadable replays.  They are not a universal database for stats like some supporters seem to think.

## <a name="mmr">How is MMR calculated and grouped?</a>

I use the Python Trueskill plugin from trueskill.org to do mmr rankings. A separate mmr is stored and calculated for each game mode except brawl, which just pulls from the quick match mmr data for its grouping of mmr matches.  The initial settings are 4200 and 550 for the mean and standard deviation.

The actual mmr groupings you see are grouped according to the average of player mmrs in a replay by game mode and region. This replay's data is then placed into a quintile (20% group) based on the quintile cutoffs of the distribution of mmrs in that game mode / region.
