## Obligatory Patreon Link

If you find the features of heroes.report useful, and appreciate all of the hard work that went into them, [please become a supporter through my Patreon page](https://www.patreon.com/heroesreport).  Even just looking at server costs (ignoring all of my own time put in), I am deep in the red and would really like the community to get behind and support this site.  

## Site Features
- [The Hero Page](#hero)
  - [The Talent Calculator](#calc)
- [Individual Player Replays and Statistics](#player)
  - [The Wheels](#wheels)
  - [The Stat Graphs](#graphs)
- [The Front End](#front)
- [The Back End](#back)
- [More to Come](#more)

## <a name="hero">The Hero Page</a>

The hero page currently pulls the following data about a hero:

* **Stats and matchup data** by build across all builds
* **All talent builds** from a given time frame

## <a name="calc">The Talent Calculator</a>

The talent calculator allows you to select talents and then filter for builds that include those talents or could possibly include those talents.  The latter is hard to explain, but it is why the talent win rates are more accurate than anywhere else.

Incomplete builds are factored into talent win rates by the proportion of observable complete builds that include the incomplete builds.  The wins and losses from the incomplete builds are incorporated according to the fraction of matches that they occur in complete builds with that incomplete build.

So the displayed win rates effectively factor in the information from incomplete builds.  The displayed pick rates of talents are not adjusted according to incomplete builds - they reflect actual picks only.

## <a name="player">Individual Player Replays and Statistics</a>

When you load a player's page, their entire replay history from the replays uploaded to HOTSApi is downloaded at once, with a bunch of condensed statistics, many of them for only that player but also with a lot of information from the replay itself.  They are not downloaded directly from HOTSApi, but are instead downloaded as a single extremely condensed file from

This means that a ton of a given player's statistics and replay summaries are able to be filtered in tons of different ways and displayed in real time - something no other site has done.  Instead of some summary data choices, you get exactly the data you filter for.

Player ids or battletags and a lot of additional information is not included in these condensed match statistics (coming it at only 44 bytes a piece with 86 replay statistics each), as the player ids alone would almost double the size of each matches' data.  


## <a name="wheels">The Wheels</a>

The Wheel of Death and Wheel of Murder present data that would otherwise take 24 graphs to represent (1 graph for a breakdown of each player's murders or deaths of or by players of the other team, plus two for each team).  Currently, it is only enabled to work in Chrome / Chrome based browsers, as it is otherwise either too slow (mobile) or buggy (Firefox).

Contrary to other sites' presentation of the data, there is nothing in the replay files that show who is credited with a kill - the event has the players who participated in a takedown listed in their 'slot' in the replay files' order.  I am pretty sure HOTSLogs and other sites assume the first listed player is the killer, but the players are always listed in their slot order.

## <a name="graphs">The Stat Graphs</a>
The stat graphs from player aggregate statistics use exponential smoothing of the data, which results in a lagging indicator.

## <a name="front">The Front End</a>

After the negative feedback from the original design HOTSHits Replay Analzyer and the first launch of Heroes.report (still up at /replays, but is currently a bit buggy), as well as the tepid response to the real launch of Heroes.report, I decided to redo the entire front-end the proper (and hopefully much more eye-pleasing and user-friendly) way, and learned React to do so.    

The front end has a ton of stuff going on.  You can check out the Github repository [here](https://github.com/heroes-coding/Heroes-Report).  The site is built with React and Redux as the backbone, has a good bit of d3 both fully integrated into React (for example, the graphs) or as standalone objects (for example, the wheels).  and even has a good amount of webassembly (C++) to do the heavy lifting of data manipulation and data extraction.

With all of this going on, Heroes.report might not be the fastest Heroes of the Storm stats site out there (I'm looking at you, hots.dog), but it does run pretty fast for all that it does in the background.

## <a name="back">The Back End</a>
The back end is an ever evolving system that has been simplified a couple of times.  Since currently all of the replays used to build the databases and data for the site come from HOTSApi, both my front end server (a tiny AWS Lightsail server to both integrate with the reverse proxied backend as well as save on bandwidth costs) and backend server (an AWS i3 on the spot market to save as well) are in Ireland, and part of the same region that HOTSApi is part of (otherwise I would have to pay significant download costs).

There are many scripts written in NodeJS and Python3 to get the data from HOTSApi, process it for saving to both my databases (PostgreSQL) and as individual player and overall match data (bit packed ints), and create the many aggregate statistics on the site (preprocessed in PostgreSQL and then a lot more done in Pandas and some Cython scripts for some of the heavier bits).

All of this is necessary to provide the level of detail at Heroes.report, which has a variety of stats that other sites don't.

## <a name="more">More to Come</a>

This will be expanded upon later.
