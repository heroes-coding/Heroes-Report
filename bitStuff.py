# -*- coding: utf-8 -*-
"""
Created on Thu Jan 11 08:20:44 2018

@author: Jeremy
"""

import math
def getBytes(num):
    bits = math.log(num,2)
    return (bits,bits/8,num,(2**32)/num)

def getMax(array):
    total = 0
    for n in array:
        total = (total*n)+n
    return total


replayBitDic = [
#3 Structures 1-2 / firstTo10 / firstTo20 / Player Three Percentiles 9 /Player 6 Talents 1-2
getBytes(6*6*3*5**6*100*5*5),
['pStructures[0]', 'pStructure0', 2, 6, 1],
['pStructures[1]', 'pStructure0', 2, 6, 1],
['firstTo10Result', 'FirstTo10', 2, 3, 1],
['pTalents[2][1]', 'talent21', 2, 5, 1],
['pTalents[2][2]', 'talent22', 2, 5, 1],
['pTalents[2][3]', 'talent23', 2, 5, 1],
['pTalents[2][4]', 'talent24', 2, 5, 1],
['pTalents[2][5]', 'talent25', 2, 5, 1],
['pTalents[2][6]', 'talent26', 2, 5, 1],
['mmrPercentiles[8]', 'mmrPercentiles8', 2, 100, 1],
['pTalents[5][0]', 'talent50', 2, 5, 1],
['pTalents[5][1]', 'talent51', 2, 5, 1],
#4  Mercs 1 / 2  / Player Four Talents / First Fort / Player 6 Talent 5 Player 1 Talent 6 & 7 
getBytes(12*12*5**7*3*5*5*5),
['pMercs[0]', 'mercs0', 3, 12, 1],
['pMercs[1]', 'mercs1', 3, 12, 1],
['pTalents[3][0]', 'talent30', 3, 5, 1],
['pTalents[3][1]', 'talent31', 3, 5, 1],
['pTalents[3][2]', 'talent32', 3, 5, 1],
['pTalents[3][3]', 'talent33', 3, 5, 1],
['pTalents[3][4]', 'talent34', 3, 5, 1],
['pTalents[3][5]', 'talent35', 3, 5, 1],
['pTalents[3][6]', 'talent36', 3, 5, 1],
['firstFortResult', 'FirstFort', 3, 3, 1],
['pTalents[5][4]', 'talent64', 3, 5, 1],
['pTalents[0][5]', 'talent05', 3, 5, 1],
['pTalents[0][6]', 'talent06', 3, 5, 1],
#5 Mercs  6 / Player Five Talents +strucs 5-6 
getBytes(12*5**7*5**3*6*6),
['pMercs[5]', 'mercs5', 4, 12, 1],
['pTalents[4][0]', 'talent40', 4, 5, 1],
['pTalents[4][1]', 'talent41', 4, 5, 1],
['pTalents[4][2]', 'talent42', 4, 5, 1],
['pTalents[4][3]', 'talent43', 4, 5, 1],
['pTalents[4][4]', 'talent44', 4, 5, 1],
['pTalents[4][5]', 'talent45', 4, 5, 1],
['pTalents[4][6]', 'talent46', 4, 5, 1],
['pTalents[6][0]', 'talent60', 4, 5, 1],
['pTalents[6][1]', 'talent61', 4, 5, 1],
['pTalents[6][2]', 'talent62', 4, 5, 1],
['pStructures[4]', 'pStructure4', 4, 6, 1],
['pStructures[5]', 'pStructure5', 4, 6, 1],

#9 Player 10 Talents 1-6 + Player 9 Talents 7  + Mercs 8 Globes 8 Strucs 7
getBytes(147*5**7*60*6),
['heroes[9]', 'Player9', 8, 147, 1],
['pTalents[9][0]', 'talent90', 8, 5, 1],
['pTalents[9][1]', 'talent91', 8, 5, 1],
['pTalents[9][2]', 'talent92', 8, 5, 1],
['pTalents[9][3]', 'talent93', 8, 5, 1],
['pTalents[9][4]', 'talent94', 8, 5, 1],
['pTalents[9][5]', 'talent95', 8, 5, 1],
['pTalents[8][6]', 'talent86', 8, 5, 1],
['pGlobes[7]', 'pGlobes7', 8, 60, 1],
['pStructures[6]', 'pStructure6', 8, 6, 1],


#12 KDA 3-4, Mercs 9, Struct 10, Player 2 Talents 1-6, Struct 3
getBytes(25**2*12*6*5**6*6),
['KDA[2]', 'KDA2', 11, 25, 1],
['KDA[3]', 'KDA3', 11, 25, 1],
['pMercs[8]', 'mercs8', 11, 12, 1],
['pStructures[9]', 'pStructure9', 11, 6, 1],
['pTalents[1][0]', 'talent10', 11, 5, 1],
['pTalents[1][1]', 'talent11', 11, 5, 1],
['pTalents[1][2]', 'talent12', 11, 5, 1],
['pTalents[1][3]', 'talent13', 11, 5, 1],
['pTalents[1][4]', 'talent14', 11, 5, 1],
['pTalents[1][5]', 'talent15', 11, 5, 1],
['pStructures[2]', 'pStructure2', 11, 6, 1],
#13 KDA 5-8, globes 2, struct 9 talent 7 for player 2 strucs 4 
getBytes(25**4*60*6*5*6),
['KDA[4]', 'KDA4', 12, 25, 1],
['KDA[5]', 'KDA5', 12, 25, 1],
['KDA[6]', 'KDA6', 12, 25, 1],
['KDA[7]', 'KDA7', 12, 25, 1],
['pGlobes[1]', 'Globe1', 12, 60, 1],
['pStructures[8]', 'pStructure8', 12, 6, 1],
['pTalents[1][6]', 'talent16', 12, 5, 1],
['pStructures[3]', 'pStructure3', 12, 6, 1],
#14 Globes 3-6, Build
getBytes(60**4*321),
['pGlobes[2]', 'Globe2', 13, 60, 1],
['pGlobes[3]', 'Globe3', 13, 60, 1],
['pGlobes[4]', 'Globe4', 13, 60, 1],
['pGlobes[5]', 'Globe5', 13, 60, 1],
['buildIndex', 'buildIndex', 13, 321, 1],

#1Globes 1 / Player One & Player 9 & Player ONe Talents 1-5
getBytes(60*5**5*147*147),
['pGlobes[0]', 'Globe0', 0, 60, 1],
['heroes[8]', 'Player8', 0, 147, 1],
['heroes[0]', 'Player0', 0, 147, 1],
['pTalents[0][0]', 'talent00', 0, 5, 1],
['pTalents[0][1]', 'talent01', 0, 5, 1],
['pTalents[0][2]', 'talent02', 0, 5, 1],
['pTalents[0][3]', 'talent03', 0, 5, 1],
['pTalents[0][4]', 'talent04', 0, 5, 1],

#6 Mercs 3-5, Player 7 Talents + Player 6 Talents 3-4 + Player Four
getBytes(5**4*5*5*147*12*147),
['pMercs[4]', 'mercs4', 5, 12, 1],
['heroes[2]', 'Player2', 5, 147, 1],
['pTalents[6][3]', 'talent63', 5, 5, 1],
['pTalents[6][4]', 'talent64', 5, 5, 1],
['pTalents[6][5]', 'talent65', 5, 5, 1],
['pTalents[6][6]', 'talent66', 5, 5, 1],
['pTalents[5][2]', 'talent62', 5, 5, 1],
['pTalents[5][3]', 'talent63', 5, 5, 1],
['heroes[3]', 'Player3', 5, 147, 1],


#8 Player 9 Talents 1-6 + Player Six + Mercs 7 + Player Seven
getBytes(5**6*147 * 12 * 147),
['pTalents[8][0]', 'talent80', 7, 5, 1],
['pTalents[8][1]', 'talent81', 7, 5, 1],
['pTalents[8][2]', 'talent82', 7, 5, 1],
['pTalents[8][3]', 'talent83', 7, 5, 1],
['pTalents[8][4]', 'talent84', 7, 5, 1],
['pTalents[8][5]', 'talent85', 7, 5, 1],
['heroes[5]', 'Player5', 7, 147, 1],
['pMercs[6]', 'mercs6', 7, 12, 1],
['heroes[6]', 'Player6', 7, 147, 1],


#16 Player 8 Talents + Mercs 3-4 KDA 9 
getBytes(3*12*12*5*5**7*25),
['firstTo20Result', 'FirstTo20', 15, 3, 1],
['pMercs[2]', 'mercs2', 15, 12, 1],
['pMercs[3]', 'mercs3', 15, 12, 1],
['pTalents[2][0]', 'talent20', 15, 5, 1],
['pTalents[7][0]', 'talent70', 15, 5, 1],
['pTalents[7][1]', 'talent71', 15, 5, 1],
['pTalents[7][2]', 'talent72', 15, 5, 1],
['pTalents[7][3]', 'talent73', 15, 5, 1],
['pTalents[7][4]', 'talent74', 15, 5, 1],
['pTalents[7][5]', 'talent75', 15, 5, 1],
['pTalents[7][6]', 'talent76', 15, 5, 1],
['KDA[8]', 'KDA8', 15, 25, 1],

#15 + Player Five + Player 6 Talents 6-7 percentiles 2-4 
getBytes(100**4*42),
['choppedGameLengthMinutesMinusOne', 'GameLengthMinsMinusOne', 14, 42, 1],
['mmrPercentiles[1]', 'mmrPercentiles1', 14, 100, 1],
['mmrPercentiles[2]', 'mmrPercentiles2', 14, 100, 1],
['mmrPercentiles[3]', 'mmrPercentiles3', 14, 100, 1],
['mmrPercentiles[0]', 'mmrPercentiles0', 14, 100, 1],

#11 GameLength / KDA 10-1-2 / Percentile 1 / Player 10 Globes
getBytes(25**3*60*60*12*6),
['pMercs[9]', 'mercs9', 10, 12, 1],
['pStructures[7]', 'pStructure7', 10, 6, 1],
['pGlobes[8]', 'pGlobes8', 10, 60, 1],
['KDA[9]', 'KDA9', 10, 25, 1],
['KDA[0]', 'KDA0', 10, 25, 1],
['KDA[1]', 'KDA1', 10, 25, 1],
['pGlobes[9]', 'pGlobes9', 10, 60, 1],

#2 Map /  winners / Player Two / MSD / Globes 7
getBytes(30*147*60*147*100),
['mapName', 'Map', 1, 30, 1],
['mmrPercentiles[9]', 'mmrPercentiles9', 1, 100, 1],
['heroes[1]', 'Player1', 1, 147, 1],
['heroes[7]', 'Player7', 1, 147, 1],
['pGlobes[6]', 'pGlobes6', 1, 60, 1],

#10 Player 10 Talents 7  + Globes 9, Mercs 8, 10, player8 structures 8, Percentile 10
getBytes(147*5*5*4*2*60*24*100),
['heroes[4]', 'Player4', 9, 147, 1],
['pTalents[5][5]', 'talent55', 9, 5, 1],
['pTalents[5][6]', 'talent56', 9, 5, 1],
['minusOneRegion', 'minusOneRegion', 9, 4, 1],
['winners', 'Winners', 9, 2, 1],
['minSinceDay','MSD', 9, 60,1],
['hoursSinceDay','HSD',9,24,1]
['mmrPercentiles[5]', 'mmrPercentiles5', 9, 100, 1],

#7  + Percentile 4 + avg lev diff
getBytes(100**3*70*5*12),
['pTalents[9][6]', 'talent96', 6, 5, 1],
['pMercs[7]', 'mercs7', 6, 12, 1],
['mmrPercentiles[6]', 'mmrPercentiles6', 6, 100, 1],
['mmrPercentiles[7]', 'mmrPercentiles7', 6, 100, 1],
['mmrPercentiles[4]', 'mmrPercentiles4', 6, 100, 1],
['avgLevelDifference', 'LevelDifference', 6, 70, 1],

]


import numpy as np
np.exp(np.log(your_array).sum())

def multiplyAll(array):
    return getBytes(np.exp(np.log(array).sum()))

# CHECKS
for term in 'pGlobes', 'pStructures', 'pMercs', 'heroes', 'KDA', 'mmrPercentiles':
    print([ "{}[{}]".format(term,i) in sorted([el[0] for els in replayBits.values() for el in els if term in el[0]]) for i in range(10)])
    
print([ "{}[{}][{}]".format('pTalents',i,t) in sorted([el[0] for els in replayBits.values() for el in els if 'pTalents' in el[0]]) for i in range(10) for i in range(10) for t in range(7) ])
    


# Loading up the whole thing
replayBits = {i:[el for el in replayBitDic if el[2]==i ] for i in range(16)}
# Counts
{index:multiplyAll([i[3] for i in ints])[1] for index,ints in replayBits.items()}
# Wasted total bytes - LOL HOLY CRAP LESS THAN ONE BOOL I AM AMAZING
sum([4-t[1] for t in replayBitDic if type(t)==tuple and t[1] > 3])

# Server side packing code
for i in range(16):
    print( "[{}],".format( ", ".join(
            ["[{},{},{}]".format(el[0],el[3],el[4]) for el in replayBits[i]]
            )))



ranges = {
    'heroes':range(10),
    'KDA':range(10,20),
    'pGlobes':range(20,30),
    'pStructures':range(30,40),
    'mmrPercentiles':range(40,50),
    'pMercs':range(50,60),
    'pTalents[0]':range(60,67),
    'pTalents[1]':range(67,74),
    'pTalents[2]':range(74,81),
    'pTalents[3]':range(81,88),
    'pTalents[4]':range(88,95),
    'pTalents[5]':range(95,102),
    'pTalents[6]':range(102,109),
    'pTalents[7]':range(109,116),
    'pTalents[8]':range(116,123),
    'pTalents[9]':range(123,130)  
    }


position = 130
decoderVals = []
decoderList = [ [] for i in range(16) ]

for byte, vals in replayBits.items():
    rev = vals[::-1]
    for v in rev:
        key, name, byteN, MAX, MULT = v
        if any([term in key for term in terms]):
            termy = key[:-3]
            inty = int(key[-2])
            pos = ranges[termy][inty]
        else:
            pos = position
            position += 1
        decoderList[byte].append((MAX,MULT,pos))
        decoderVals.append((name,byte,MAX,MULT,pos))


lengths = [len(r) for r in decoderList]

print("const int nInts = {};".format(len(lengths)))

print("const int nOuts = {};".format(sum(lengths)))

print ("const int intLengths[{}] = {{ {} }};".format(len(lengths),", ".join([str(l) for l in lengths])))

print ("const int decoders[{}][{}][{}] = {{ {} }};".format(len(lengths),max(lengths),3,
       ", ".join([ "{{ {} }}".format( 
               ", ".join(
    ["{{ {} }}".format(", ".join([str(x) for x in e])) for e in decoderList[i]]
)) for i in range(len(lengths))])))

decoderList

print ("[]{ {24, 25, 26, 27}, {20, 21, 22, 23} };


sorted(decoderVals,key=lambda x: x[-1])


    "pTalents[7][6]"[-2]
replayBits

terms = 'pGlobes', 'pStructures', 'pMercs', 'heroes', 'KDA', 'mmrPercentiles', "pTalents[0]", "pTalents[1]", "pTalents[2]", "pTalents[3]", "pTalents[4]", "pTalents[5]", "pTalents[6]", 



for p in range(10):
    print("'pTalents[{}]':range({},{}),".format(p,60+p*7,60+(p+1)*7))
print(", ".join(['"pTalents[{}]"'.format(p) for p in range(10)]))





import os, tqdm
files = {}
for build in tqdm.tqdm(os.listdir('H:/Archived')):
    for f in os.listdir(os.path.join('H:/Archived',build)):
        files[f] = os.path.join('H:/Archived',build,f)

import json
with open('H:/missing.json','r') as mJ:
    missing = json.load(mJ)


found = []
for f in missing:
    file = f.split('/')[-1]
    if file in files:
        found.append(files[file])

# Mode / Day / Month / Min / Heroes 1-2 / 
getBytes(6*147*4860000)
getBytes(147**4*3*3) # Heroes 3-6 1-4 # First to 20 / first Fort--> 4 Bytes / 32 Bits
getBytes(147**4*3*3) # Heroes 7-10 --> # Year / Winners / First to 10 --> 4 Bytes / 32 bits
 
getBytes()
getBytes(321*35*2520*147) 
getBytes(331*35*2520*147) 


"""
[ 11, 5, 43, 22, 59, 6 ]
vals = [ [ 11, 12, 1 ],
  [ 4, 5, 1 ],
  [ 59, 60, 1 ],
  [ 99, 100, 1 ],
  [ 99, 100, 1 ],
  [ 99, 100, 1 ] ]


total = 0
def inc(incr,mult):
    global total
    total = total*mult + incr
    print(total)
    print(getBytes(total))

total = 0
for r in vals:
    incr, mult = r[:2]
    inc(incr,mult)
        
        r[:2]
inc(5,6)
"""

def getMax(vals):
    total = 0
    for v in vals:
        total = total*v + v-1
    return total
      
2**32/
''' Individual Player stuff '''


// 0. Vengeances / K / MapStat 1 / Talents
getBytes(23  *57* 5**7*40) 
 
// 1.  Siege - 1000 / Merc Camp Captures / Watch Tower captures / EXP 1000 /  Assists / 
getBytes(307*34 *70 * 50 *  99  )


// 2.  Roots 1 / Time Spent Dead 1  / Self-Healing 1000 /Team 1 End Level / Team 2 End Level 
getBytes(91 * 646 * 69 * 30 * 30)

// 3. Damage 1000 /Structure Damage - 1000 / Feeder / TF Dam soaked 1000 / Time on Fire 10 / Big Talker
getBytes(138 * 92 * 2 * 123 * 679 *2) 


// 4.  MapStat 2 / Kill Streak / Parse Build 
getBytes(40*72*21)

// 5. Globes / ESCAPES / Heals 1000 / Silence  1  /  TF Damage 1000
getBytes(120 * 27 * 156*94 * 82 )

// 6.  Award  / Deaths / Map stat 1 Value / Map stat 2 Value  / Slot 
getBytes(40 *40* 500 * 500 * 10 )


// 7. CC 1 // Stuns / Protection Given 1000  / Outnumbered Deaths / Pinger
getBytes (4950*100*100 * 38 * 2)


8. // Team merc captures / Votes / Minion Damage - 1000/ Hero Killed Structures / Team Killed Structures / Level /  Wet Noodle / Dangerous Nurse  Voted For 
getBytes(85*11* 251 * 6 * 12 *  21 * 2 * 2 * 3 )



# Parse Build will always come at the end of the eight integer from off the top (added at the end)
", ".join(["['talent{}',5,1]".format(i) for i in range(7)])


s = """[[buildIndex,321,1], [mapName,35,1], [gameLength, 2520, 1], [heroes[0],147,1]],
  [[minSinceLaunch,5843492,1], [gameMode,5,1], [heroes[1],147,1]],
  [[heroes[2],147,1],[heroes[3],147,1],[heroes[4],147,1], [heroes[5],147,1], [firstTo10[0] || 2,2,1], [winners,2,1]],
  [[heroes[6],147,1],[heroes[7],147,1],[heroes[8],147,1], [heroes[9],147,1], [firstTo20[0] || 2,2,1], [firstFort[0] || 2 ,2,1]] """

def reverseAndStringify(s):
    start = s.index("[[") + 2
    lines = s.split("[[")[1:]
    for line in lines:
        while True:
            try:
                brackIndex = line.index('[')
                commanIndex = line.index(',')
                line.split('],')
                line[:6]
                term = 
            except:
                continue
        
        print (line)
    while True
    s[3]



statnames = {'Overall':[['Kills',9,'Blue Finisher'],['Assists',10,'Blue Hat Trick'],['Deaths',6,'Red Dominator'],['Siege Damage',17,'Blue Siege Master'],['Hero Damage',14,'Blue Painbringer'],['Healing and Shielding',[19,53,18],'Blue Clutch Healer'],['Teamfight Damage Taken',43,'Blue Guardian'],['Experience Contribution',13,'Blue Experienced']],
'Healing':[['Healing',18,'Blue Healing'],['Self Healing',19,'Troll Blood'],['Protection Given to Allies',53,'Blue Protector'],['Clutch Heals',46,'Blue Clutch Healer'],['Teamfight Damage Taken',43,'Blue Guardian'],['Damage Taken',15,'Blue Bulwark'],['Regen Globes Collected',27,'Globe Trotter']],
'Damage':[['Hero Damage',14,'Blue Painbringer'],['Teamfight Hero Damage',51,'Blue Scrapper'],['Mercenary Camp Captures',24,'Blue Headhunter'],['Seconds on Fire',59,'Blue Da Bomb'],['Structure Damage',16,'Blue Siege Master'],['Minion Damage',26,'Blue Garden Terror'],['Creep Damage',22,'Blue Master of the Curse'],['Summon Damage',23,'Blue Zerg Crusher']],
'Death':[['Deaths',6,'Red Dominator'],['Outnumbered Deaths',47,'Red Master of the Curse'],['Seconds Spent Dead',20,'Red Moneybags'],['Kills',9,'Blue Finisher'],['Highest Kill Streak',11,'Blue Dominator'],['Vengeances',50,'Blue Avenger'],['Assists',10,'Blue Hat Trick'] ],
'CC':[['Seconds of Crowd Control',21,'Blue Team Player'], ['Seconds of Silence',45,'Blue Silencer'],['Seconds of Stuns',49, 'Blue Stunner'], ['Seconds of Roots',52,'Blue Trapper'],['Escapes',48,'Blue Escape Artist'],['Teamfight Escapes',44,'Blue Daredevil']  ],
'Meta':[['Hero Level',12,'Blue Experienced'], ['Number of Pings',55,'Pinger'],['Number of Chat Characters Typed',56,'Big Talker'], ['Voted for',58,'Blue Sole Survivor'],['Silenced',28,'Red Silencer']  ]
}

names = ["stat{}".format(i) for i in range(60)] + ["mapStats"]
for i in range(7):
    names[29+i*2] = "statID{}".format(i+1)
    names[30+i*2] = "statValue{}".format(i+1)
for cat, catStats in statnames.items():
    for stat in catStats:
        if type(stat[1]) == list:
            continue
        names[stat[1]] = "".join(stat[0].split(" "))

a = [[4500, 500], [4400, 500], [4300, 500], [4200, 500], [4100, 500], [4600, 500], [4700, 500], [4300, 500], [4500, 500], [4400, 500]]
import statistics
statistics.mean([ i[0] for i in a[:5]])
statistics.mean([ i[0] for i in a[5:]])


import tqdm, os
files = os.listdir('/files/stats/players')
for f in tqdm.tqdm(files):
    os.remove(os.path.join('/files/stats/players',f))


import tqdm, os
files = os.listdir('/files/stats/compressed')
for f in tqdm.tqdm(files):
    os.remove(os.path.join('/files/stats/compressed',f))

import os
base = '/files/stats/compressed'
files = os.listdir(base)
sorted([(f,os.stat(os.path.join(base,f)).st_size/1024/1024) for f in files], key=lambda x: x[1])



