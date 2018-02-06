This is the new and improved front end for heroes.report.  There are many things implemented or in the works, including "full replay data" sections of the site, where you can filter through either all of a player's replay data and most of their stats, or even through full replay data from a given time frame.  This is made possible through some crazy partial bit packing, reducing the size per replay to 64 bytes for the most important information from a full replay and 40 bytes for the most important player information and stats from a given replay.

[Site Features](src/features.md)
