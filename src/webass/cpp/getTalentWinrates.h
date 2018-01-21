#include <math.h>
#include <memory>
#include <iostream>
#include <vector>


extern "C" {


  EMSCRIPTEN_KEEPALIVE
  uint32_t * getTalentWinrates (
    int32_t *buf,
    int nFull,
    int nPartials
  ) {
    int z = 0;
    int nTalents = 0;
    int levCounts [7];
    int cumCount = 0;
    int cumLevCounts [7];
    int maxLevCount = 0;
    for (int i=0;i<7;i++) {
      int levCount = buf[z++];
      levCounts[i] = levCount;
      nTalents += levCount;
      maxLevCount = levCount > maxLevCount ? levCount : maxLevCount;
      cumLevCounts[i] = cumCount;
      cumCount += levCount;
    }
    /*

    std::vector< std::vector<int> > talentList(7);
    uint32_t returneeTalents [nTalents*7];
    int o=0;

    for (int l=0;l<7;l++) {
      std::vector<int> talentTiers(levCounts[l]);
      // std::cout << "Lev: " << l << std::endl;
      for (int tier=0;tier<levCounts[l];tier++) {
        int tal = buf[z++];
        // std::cout << "Tal: " << tal << std::endl;
        returneeTalents[o++] = tal;
        // 6 slots - adjusted Wins / adjusted Count / observable WC / full WC
        for (int p=0;p<6;p++) {
          returneeTalents[o++] = 0;
        }
        talentTiers[tier] = tal;
      }
      talentList[l] = talentTiers;
    }

    std::vector<int> buildKeyDic[7][maxLevCount];
    for (int b=0;b<nFull;b++) {
      int index = z + b * 9;
      // first, gotta find out if you should skip this or not...
      bool skip = false;
      int tals [7];
      for (int l=0;l<7;l++) {
        int tal = buf[z + b * 9 + l];
        bool found = false;
        for (int t=0;t<levCounts[l];t++) {
          if (talentList[l][t] == tal) {
            found = true;
            tals[l] = t;
            break;
          }
        }
        if (!found) {
          skip = true;
          break;
        }
      }
      if (skip) {
        continue;
      }


      int wins = buf[index+7];
      int count = buf[index+8];
      for (int t=0;t<7;t++) {
        int tal = buf[index+t];
        returneeTalents[(cumLevCounts[t]+talLoc)*7+1]
        returneeTalents[]
        buildKeyDic[t][buildKeys[t]].push_back(nFull);
      }
    }
    if (isFullBuild) {
      fullBuilds.push_back(buildKeys);
      std::vector<float> fInfo { wins, count, wins, count};
      fullInfo.push_back(fInfo);
      for (int t=0;t<7;t++) {
        buildKeyDic[t][buildKeys[t]].push_back(nFull);
        // std::cout << buildKeyDic[t][buildKeys[t]].size() << std::endl;
      }
      nFull++;
    }

    std::vector< std::vector<int> > partialMatches;
    std::vector<int> partialCounts;
    for (int p=0;p<nPartials;p++) {
      std::vector<int> pBuild = partialBuilds[p];
      if (pBuild.size() == 0) {
        continue;
      }
      std::vector<int> potentialMatches = buildKeyDic[0][pBuild[0]];
      for (int t=1;t<7;t++) {
        int bKey = pBuild[t];
        if (bKey==0) {
          break;
        }
        std::vector<int> potMatches;
        int nPots = potentialMatches.size();
        for (int m=0;m<nPots;m++) {
          int fIndex = potentialMatches[m];
          std::vector<int> fBuild = fullBuilds[fIndex];
          if (fBuild[t] == bKey) {
            potMatches.push_back(fIndex);
          }
        }
        potentialMatches = potMatches;
      }
      int total = 0;
      int nPots = potentialMatches.size();
      for (int m=0;m<nPots;m++) {
        total += fullInfo[potentialMatches[m]][1];
      }
      partialMatches.push_back(potentialMatches);
      partialCounts.push_back(total);
      //std::cout << "Potential matching builds: " << potentialMatches.size() << ", total: " << total << std::endl;;
    }

    nPartials = partialMatches.size();
    for (int p=0;p<nPartials;p++) {
      int total = partialCounts[p];
      float wins = partialInfo[p][0];
      float count = partialInfo[p][1];
      std::vector<int> potMatches = partialMatches[p];
      int nPots = potMatches.size();
      for (int m=0;m<nPots;m++) {
        int bKey = potMatches[m];
        float percent = fullInfo[bKey][1]/total;
        fullInfo[bKey][0] += wins*percent;
        fullInfo[bKey][1] += count*percent;
      }
    }






    for (int b=0;b<nBuilds;b++) {
      bool skip = false;
      int tals [7];
      for (int l=0;l<7;l++) {
        int tal = buf[z++];
        bool found = false;
        for (int t=0;t<levCounts[l];t++) {
          if (talentList[l][t] == tal) {
            found = true;
            tals[l] = t;
            break;
          }
        }
        if (!found) {
          skip = true;
          break;
        }
      }
      if (skip) {
        continue;
      }
      int aWins = buf[z++];
      int aCount = buf[z++];
      int oWins = buf[z++];
      int oCount = buf[z++];
      int tWins = buf[z++];
      int tCount = buf[z++];
      for (int l=0;l<7;l++) {
        int talLoc = tals[l];
        returneeTalents[(cumLevCounts[l]+talLoc)*7+1] += pWins;
        returneeTalents[(cumLevCounts[l]+talLoc)*7+2] += pCount;
        returneeTalents[(cumLevCounts[l]+talLoc)*7+3] += tWins;
        returneeTalents[(cumLevCounts[l]+talLoc)*7+4] += tCount;
      }
    }

    for (int l=0;l<7;l++) {
      std::cout << "Level " << l << std::endl;
      for (int t=0;t<levCounts[l];t++) {
        std::cout << "Talent [" << returneeTalents[(cumLevCounts[l]+t)*5] << ": ";
        for (int i=1;i<5;i++) {
          std::cout << returneeTalents[(cumLevCounts[l]+t)*5+i] << ", ";
        }
        std::cout << '\b' << ']' << std::endl;
      }
    }
    */
    uint32_t returneeTalents [nTalents*7];
    auto arrayPtr = &returneeTalents[0];
    return arrayPtr;


  } // End function
} // End extern C
