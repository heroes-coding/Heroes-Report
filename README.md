This is the new and improved front end for heroes.report.  There are many things implemented or in the works, including "full replay data" sections of the site, where you can filter through either all of a player's replay data and most of their stats, or

## Table of Contents

- [The Hero Page](#hero)
  - [Talent Calculator](#talent-calculator)
- [More to Come](#more)

## The Hero Page

The hero page currently pulls the following data about a hero:

* `Stats and matchup data by build across all builds`
* `All talent builds from a given time frame`

## `The Talent Calculator`

The talent calculator allows you to select talents and then filter for builds that include those talents or could possibly include those talents.  The latter is hard to explain, but it is why the talent win rates are more accurate than anywhere else.

Incomplete builds are factored into talent win rates by the proportion of observable complete builds that include the incomplete builds.  The wins and losses from the incomplete builds are incorporated according to the fraction of matches that they occur in complete builds with that incomplete build.

So the displayed win rates effectively factor in the information from incomplete builds.  The displayed pick rates of talents are not adjusted according to incomplete builds - they reflect actual picks only.

## More to Come

This will be expanded upon later.
