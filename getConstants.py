dic = {
  0: 'Hero0',
  1: 'Hero1',
  2: 'Hero2',
  3: 'Hero3',
  4: 'Hero4',
  5: 'Hero5',
  6: 'Hero6',
  7: 'Hero7',
  8: 'Hero8',
  9: 'Hero9',
  10: 'You',
  11: 'Ally1',
  12: 'Ally2',
  13: 'Ally3',
  14: 'Ally4',
  15: 'Enemy1',
  16: 'Enemy2',
  17: 'Enemy3',
  18: 'Enemy4',
  19: 'Enemy5',
  20: 'AllyWarriors',
  21: 'AllySupports',
  22: 'AllySpecialists',
  23: 'AllyAssassins',
  24: 'EnemyWarriors',
  25: 'EnemySupports',
  26: 'EnemySpecialists',
  27: 'EnemyAssassins',
  28: 'Won',
  29: 'Winners',
  30: 'FirstTo10',
  31: 'FirstTo20',
  32: 'FirstFort',
  33: 'Talent0',
  34: 'Talent1',
  35: 'Talent2',
  36: 'Talent3',
  37: 'Talent4',
  38: 'Talent5',
  39: 'Talent6',
}

oDic = {k:"o{}".format(v) for k,v in dic.items() if not 'Ally' in v and not 'Enemy' in v and not 'You' in v and not 'Hero' in v and not 'Talent' in v}

for k, v in oDic.items():
    print ("const int {}= {};".format(v,k))


for i in range(10):
    print("""      }} else if (n==iHERO{}) {{
        heroes[{}] = value;
        replays[r*nItemsToDecode+oHeroes[{}]] = value;""".format(i,i,i))
    
for i in range(7):
    print("""      }} else if (n==iTAL{}) {{
        talents[{}] = value;
        replays[r*nItemsToDecode+oTalents[{}]] = value;""".format(i,i,i))
    


heroesStart = 0
allyStart = 10
enemyStart = 15
talentStart = 33
print (	"const int oHeroes [10] = {{ {} }};".format(", ".join([str(i) for i in range(heroesStart,heroesStart+10)])))
print (	"const int oAllies [5] = {{ {} }};".format(", ".join([str(i) for i in range(allyStart,allyStart+5)])))
print (	"const int oEnemies [5] = {{ {} }};".format(", ".join([str(i) for i in range(enemyStart,enemyStart+5)])))
print (	"const int oTalents [7] = {{ {} }};".format(", ".join([str(i) for i in range(talentStart,talentStart+7)])))

roleStart = 20
print (	
"const int oRoleArray [2][4] = {{ {{{}}}, {{{}}} }};".format(
        ", ".join([str(i) for i in range(roleStart+4,roleStart+8)]),
        ", ".join([str(i) for i in range(roleStart,roleStart+4)])
        ))



"int oHeroArray [] = {{ {{{}}}, {{{}}} }};"

    