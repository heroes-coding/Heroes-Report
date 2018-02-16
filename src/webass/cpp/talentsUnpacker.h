#include <math.h>
#include <memory>
#include <iostream>
#include <vector>
#include <map>


extern "C" {

  EMSCRIPTEN_KEEPALIVE
  int32_t * sortTalents (int32_t *buf, std::vector< std::vector<int> > partialBuilds, std::vector< std::vector<int> > fullBuilds, int nPartial, int nFull, std::vector< std::vector<int> > realTalents, int nTalents, int isPlayer) {

    std::vector< std::vector< std::vector<int> > > buildKeyDic;
    std::vector< std::vector< std::vector<int> > > talentResults;

    buildKeyDic.reserve(14*nFull);
    talentResults.reserve(200+nFull*6);
    for (int l=0;l<7;l++) {
      std::vector< std::vector<int> > levKeys;
      std::vector< std::vector<int> > levKeys2;
      buildKeyDic.push_back(levKeys);
      talentResults.push_back(levKeys2);
      for (int t=0;t<realTalents[l].size();t++) {
        std::vector<int> talKeys;
        std::vector<int> talRes { 0, 0, 0, 0, 0, 0};
        buildKeyDic[l].push_back(talKeys);
        talentResults[l].push_back(talRes);
      }
    }

    for (int b=0;b<nFull;b++) {
      for (int l=0;l<7;l++) {
        for (int t=0;t<realTalents[l].size();t++) {
          if (realTalents[l][t] == fullBuilds[b][l]) {
            buildKeyDic[l][t].push_back(b);
            for (int type=1;type<3;type++) {
              talentResults[l][t][type*2] +=  fullBuilds[b][7];
              talentResults[l][t][type*2+1] +=  fullBuilds[b][8];
            }
            break;
          }
        }
      }
    }

    // printBuildKeyDic(buildKeyDic);


    std::vector< std::vector<int> > partialMatches;
    std::vector<int> partialCounts;
    for (int p=0;p<nPartial;p++) {
      int indexKey;
      for (int t=0;t<realTalents[0].size();t++) {
        // std::cout << "[" << t << ":" << partialBuilds[p][0] << "]";
        if (partialBuilds[p][0] == realTalents[0][t]) {
          indexKey = t;
        }
      }
      // std::cout << "**** INDEX KEY ***** (" << indexKey << ")" << std::endl;
      std::vector<int> potentialMatches = buildKeyDic[0][indexKey];
      for (int l=0;l<7;l++) {
        int bKey = partialBuilds[p][l];
        if (bKey==0) {
          break;
        }
        for (int t=0;t<realTalents[l].size();t++) {
          if (realTalents[l][t] == bKey) {
            talentResults[l][t][2] += partialBuilds[p][7];
            talentResults[l][t][3] += partialBuilds[p][8];
            break;
          }
        }
        /*
        if (l==0) {
          // first level is only for assigning partials above
          continue;
        }
        */
        std::vector<int> potMatches;
        int nPots = potentialMatches.size();
        for (int m=0;m<nPots;m++) {
          int fIndex = potentialMatches[m];
          if (fullBuilds[fIndex][l] == bKey) {
            potMatches.push_back(fIndex);
          }
        }
        potentialMatches = potMatches;
      }
      int total = 0;
      int nPots = potentialMatches.size();
      for (int m=0;m<nPots;m++) {
        total += fullBuilds[potentialMatches[m]][8];
      }
      partialMatches.push_back(potentialMatches);
      partialCounts.push_back(total);
    }
    // std::cout << nPartial << "N PARTIAL" << std::endl;
    for (int p=0;p<nPartial;p++) {
      int total = partialCounts[p];
      float wins = partialBuilds[p][7];
      float count = partialBuilds[p][8];
      std::vector<int> potMatches = partialMatches[p];
      int nPots = potMatches.size();
      // std::cout << "p:" << p << ":" << nPots << "[" << wins << "|" << count << "]";
      for (int m=0;m<nPots;m++) {
        int bKey = potMatches[m];
        float percent = isPlayer ? 1 : 1.0*fullBuilds[bKey][8]/total;
        // std::cout << "[bKey:" << bKey << "] ";
        /*
        for (int q=0;q<11;q++) {
          std::cout << "[" << fullBuilds[bKey][q] << "]";
        }
        std::cout << std::endl;
        */
        // std::cout << " PERCENT: " << percent;
        fullBuilds[bKey][9] += int(1000*wins*percent);
        fullBuilds[bKey][10] += int(1000*count*percent);

      }

    }

    for (int b=0;b<nFull;b++) {
      for (int l=0;l<7;l++) {
        for (int t=0;t<realTalents[l].size();t++) {
          // std::cout << "RT: " << realTalents[l][t] <<  ", FB: " << fullBuilds[b][l];
          if (realTalents[l][t] == fullBuilds[b][l]) {
            talentResults[l][t][0] += fullBuilds[b][9];
            talentResults[l][t][1] += fullBuilds[b][10];
            break;
          }
        }
      }
    }

    // std::cout << std::endl;

    // printBuildKeyDic(talentResults);
    // printTwoDeep(realTalents);
    // printBuildKeyDic(buildKeyDic);

    // int32_t returneeBuilds [nFull*11+nPartial*9+nTalents*7+7];
    int o = 0;

    buf[o++] = nTalents;
    buf[o++] = nFull;
    buf[o++] = nPartial;

    // Talent counts
    for (int l=0;l<7;l++) {
      buf[o++] = realTalents[l].size();
    }

    // Talents first
    for (int l=0;l<7;l++) {
      for (int t=0;t<realTalents[l].size();t++) {
        buf[o++] = realTalents[l][t];
        for (int n=0;n<6;n++) {
          buf[o++] = talentResults[l][t][n];
        }
      }
    }
    // Then full builds
    for (int b=0;b<nFull;b++) {
      /* std::cout << "[Build:" << b << "]:::";
      for (int q=0;q<11;q++) {
        std::cout << "[" << fullBuilds[b][q] << "]";
      }
      std::cout << std::endl;
      */
      for (int k=0;k<11;k++) {
        buf[o++] = fullBuilds[b][k];
      }
    }
    // Then partial builds
    for (int b=0;b<nPartial;b++) {
      for (int k=0;k<9;k++) {
        buf[o++] = partialBuilds[b][k];
      }
    }

    // std::cout << "FINISHED WITH talents unpacker pointer: " << (uintptr_t)&buf[0]/4 << std::endl;
    return buf;
    // auto arrayPtr = &returneeBuilds[0];
    // return arrayPtr;
  }

  EMSCRIPTEN_KEEPALIVE
  int32_t * getBuilds(
    int32_t *buf,
    int nBuilds
  ) {
    /* Takes in hero builds and deconstructs them into their talents and partial and complete builds. */
    int z = 0;
    std::vector< std::vector<int> > realTalents(7);
    int nFull = 0;
    int nPartial = 0;
    int nTalents = 0;
    std::map<int,std::vector<int> > fullBuilds;
    std::map<int,std::vector<int> > partialBuilds;

    for (int b=0;b<nBuilds;b++) {
      bool isComplete = true;
      int buildInt = 0;
      int Won=buf[z++];
      // std::cout << "[WON:" << Won << "]";
      for (int t=0;t<7;t++) {
        int tal = buf[z++];
        int talIndex = realTalents[t].size();
        bool foundTal = false;
        if (tal==0) {
          buildInt*=16;
          isComplete=false;
          continue;
        }
        for (int s=0;s<talIndex;s++) {
          if (tal == realTalents[t][s]) {
            foundTal = true;
            talIndex = s;
            break;
          }
        }
        // std::cout << "[" << tal << ":" << talIndex << ":" << buf[z] << ":" << z << ":" << Won << "]";
        if (!foundTal) {
          nTalents += 1;
          realTalents[t].push_back(tal);
        }
        buildInt = buildInt*16 + talIndex+1;
      }
      if (isComplete) {
        if (!fullBuilds.count(buildInt)) {
          std::vector<int> fB(2);
          fB.push_back(0);
          fB.push_back(0);
          fullBuilds[buildInt] = fB;
          // fullBuilds[buildInt][0] = 0;
          // fullBuilds[buildInt][1] = 0;
          // std::cout << "fullBuilds[[buildInt][0]:" << fullBuilds[buildInt][0] << ",Won:" << Won << "]";
          nFull += 1;
        }
        fullBuilds[buildInt][0] += Won;
        fullBuilds[buildInt][1] += 1;
      } else {
        if (!partialBuilds.count(buildInt)) {
          std::vector<int> fB(2);
          fB.push_back(0);
          fB.push_back(0);
          partialBuilds[buildInt] = fB;
          // partialBuilds[buildInt] = {0,0};
          // partialBuilds[buildInt][0] = 0;
          // partialBuilds[buildInt][1] = 0;
          // std::cout << "partialBuilds[[buildInt][0]:" << partialBuilds[buildInt][0] << ",Won:" << Won << "]";
          nPartial += 1;
        }
        partialBuilds[buildInt][0] += Won;
        partialBuilds[buildInt][1] += 1;
      }
      // std::cout << std::endl;
    }

    // std::cout << std::endl;

    std::vector< std::vector<int> > pBuilds;
    std::vector< std::vector<int> > fBuilds;
    for (int b=0;b<nPartial;b++) {
      std::vector<int> temp(9);
      pBuilds.push_back(temp);
    }
    for (int b=0;b<nFull;b++) {
      std::vector<int> temp(11);
      fBuilds.push_back(temp);
    }
    // int pBuilds[nPartial][9];
    // int fBuilds[nFull][11];
    int fCount = 0;
    int pCount = 0;
    for( auto const& [key, val] : fullBuilds )
      {
          int buildInt = key;
          for (int t=6;t>=0;t--) {
            int talIndex = buildInt%16;
            if (talIndex) {
              fBuilds[fCount][t] = realTalents[t][talIndex-1];
            } else {
              fBuilds[fCount][t] = 0;
            }
            buildInt = buildInt/16;
          }
          fBuilds[fCount][7] = val[0];
          fBuilds[fCount][8]= val[1];
          fBuilds[fCount][9] = val[0]*1000;
          fBuilds[fCount][10]= val[1]*1000;
          fCount++;
          /*
          printArray(fBuilds[fCount],11);
          std::cout << key         // string (key)
                    << ':'
                    << val[0]        // string's value
                    << ':'
                    << val[1]
                    << std::endl ;
          */
      }
      for( auto const& [key, val] : partialBuilds )
        {
            int buildInt = key;
            for (int t=6;t>=0;t--) {
              int talIndex = buildInt%16;
              if (talIndex) {
                pBuilds[pCount][t] = realTalents[t][talIndex-1];
              } else {
                pBuilds[pCount][t] = 0;
              }
              buildInt = buildInt/16;
            }
            pBuilds[pCount][7] = val[0];
            pBuilds[pCount][8] = val[1];
            // printArray(pBuilds[pCount],9);
            pCount++;
            /* std::cout << key         // string (key)
                      << ':'
                      << val[0]        // string's value
                      << ':'
                      << val[1]
                      << std::endl ; */
        }

    // printTwoDeep(realTalents);
    // std::cout << "nFull: " << nFull << "nPartial: " << nPartial << std::endl;
    if (nPartial == 0 || nFull == 0) {
      buf[0] = 0;
      return buf;
    }
    return sortTalents(buf, pBuilds,fBuilds,nPartial,nFull, realTalents, nTalents,1);

  }



  EMSCRIPTEN_KEEPALIVE
  int32_t * decodeTalents (
    int32_t *buf,
    int nBuilds
  ) {
    /* Takes in the files you generated for all builds server side and deconstructs them into all full and partial builds.  After sending this to the function sortTalents, returns full unselected talent wins / losses for various categories as well as the original partial builds info and the modified (partial build incorporated) full builds. */
    int z = 0;
    std::vector<int> levCounts(7);
    int maxLevCount = 0;
    for (int i=0;i<7;i++) {
      int levCount = buf[z++];
      levCounts[i] = levCount;
      maxLevCount = levCount > maxLevCount ? levCount : maxLevCount;
      // std::cout << "Level " << i << " count: " << levCounts[i] << std::endl;
    }
    // std::cout << "Max Level count: " << maxLevCount << std::endl;
    std::vector< std::vector<int> > talentList;
    std::vector< std::vector<int> > realTalents;
    int nTalents = 0;
    for (int l=0;l<7;l++) {
      std::vector<int> talentTiers(levCounts[l]);
      std::vector<int> realTalentTiers;
      for (int tier=0;tier<levCounts[l];tier++) {
        int tal = buf[z++];
        talentTiers[tier] = tal;
        if (tal) {
          realTalentTiers.push_back(tal);
          nTalents += 1;
        }
        // std::cout << "Level " << l << " talent tier " << tier << ": " << talentList[l][tier]  << std::endl;
      }
      realTalents.push_back(realTalentTiers);
      talentList.push_back(talentTiers);
    }


    int nPartial = 0;
    int nFull = 0;
    std::vector< std::vector<int> > partialBuilds;
    std::vector< std::vector<int> > fullBuilds;
    for (int b=0;b<nBuilds;b++) {
      int sum = buf[z++];
      int count = buf[z++];
      int wins = buf[z++];
      // std::cout << sum << " (sum), count: " << count << ", wins: " << wins << ", z: " << z << std::endl;
      std::vector<int>temp {0,0,0,0,0,0,0,0,0};
      bool isFullBuild = true;
      for (int t=6;t>=0;t--) {
        int mult = levCounts[t];
        int tal = sum%mult;
        sum = sum/mult;
        if (talentList[t][tal] == 0) {
          isFullBuild=false;
        }
        temp[t] = talentList[t][tal];
      }

      temp[7] = wins;
      temp[8] = count;

      if (isFullBuild) {
          nFull++;
          temp.push_back(wins*1000);
          temp.push_back(count*1000);
          fullBuilds.push_back(temp);
      } else {
          nPartial++;
          partialBuilds.push_back(temp);
      }

    }

    return sortTalents(buf, partialBuilds,fullBuilds,nPartial,nFull, realTalents, nTalents,0);

  }


}
