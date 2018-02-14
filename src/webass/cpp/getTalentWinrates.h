#include <math.h>
#include <memory>
#include <iostream>
#include <vector>
#include "talentsUnpacker.h"

extern "C" {


  EMSCRIPTEN_KEEPALIVE
  int32_t * getTalentWinrates (
    int32_t *buf,
    int nFull,
    int nPartials,
    int nTalents
  ) {
    /*
    Takes in the already computed partial builds, full builds, and overall talent numbers and subtracts off the later for excluded talents
    */

    int z = 0;
    std::vector<int> ignoreCounts(7);
    int maxLevCount = 0;
    for (int l=0;l<7;l++) {
      ignoreCounts[l] = buf[z++];
    }

    std::vector< std::vector<int> > toIgnore;
    for (int l=0;l<7;l++) {
      std::vector<int> levKeys;
      toIgnore.push_back(levKeys);
      for (int t=0;t<ignoreCounts[l];t++) {
        toIgnore[l].push_back(buf[z++]);
      }
    }

    // printTwoDeep(toIgnore);

    std::vector<int> talentCounts (7);
    for (int l=0;l<7;l++) {
      talentCounts[l] = buf[z++];
    }

    std::vector< std::vector< std::vector<int> > > talentResults;

    for (int l=0;l<7;l++) {
      std::vector< std::vector<int> > levKeys;
      talentResults.push_back(levKeys);
      for (int t=0;t<talentCounts[l];t++) {
        std::vector<int> ignoreKeys(ignoreCounts[l]);
        std::vector<int> talRes(7);
        for (int type=0;type<7;type++) {
          talRes[type] = buf[z++];
        }
        talentResults[l].push_back(talRes);
      }
    }

    // printBuildKeyDic(talentResults);
    for (int b=0;b<nPartials;b++) {

      bool buildPassed = true;
      for (int t=0;t<7;t++) {
          int tal = buf[z+t];
          if (tal) {
            for (int o=0;o<toIgnore[t].size();o++) {
              if (toIgnore[t][o]==tal) {
                buildPassed = false;
                break;
              }
            }
          } else if (toIgnore[t].size() > 0) {
            buildPassed = false;
            break;
          }
          if (!buildPassed) {
            break;
          }
      }
      if (!buildPassed) {
        for (int t=0;t<7;t++) {
            int tal = buf[z+t];
            // std::cout << "TALENT " << t << ": " << tal << std::endl;
            if (tal) {
              for (int o=0;o<talentCounts[t];o++) {
                // std::cout << "[" << talentResults[t][o][0] << ":" << tal << "]";
                if (talentResults[t][o][0]==tal) {
                  // std::cout << "LEVEL " << t << "TALENT " << o << ": " << talentResults[t][o][0] << " | MATCHES: " << tal << std::endl;
                  // talentResults[t][o][1] -= buf[z+7];
                  // talentResults[t][o][2] -= buf[z+8];
                  talentResults[t][o][3] -= buf[z+7];
                  talentResults[t][o][4] -= buf[z+8];
                  break;
                }
              }
            }
          }
      }
      z += 9;
    }
    // std::cout << std::endl;

    for (int b=0;b<nFull;b++) {
      /*
      std::cout << "BUILD " << b << ": ";
      for (int q=0;q<11;q++) {
        std::cout << "[" << buf[z+q] << "]";
      }
      std::cout << std::endl;
      */

      bool buildPassed = true;
      for (int t=0;t<7;t++) {
          int tal = buf[z+t];
          for (int o=0;o<toIgnore[t].size();o++) {
            // std::cout << "[" << toIgnore[t][o] << ":" << tal << "]";
            if (toIgnore[t][o]==tal) {
              buildPassed = false;
              break;
            }
          }
          if (!buildPassed) {
            break;
          }
      }
      if (!buildPassed) {
        for (int t=0;t<7;t++) {
            int tal = buf[z+t];
            // std::cout << "TALENT " << t << ": " << tal << std::endl;
            for (int o=0;o<talentCounts[t];o++) {
              if (talentResults[t][o][0]==tal) {
                // std::cout << "LEVEL " << t << "TALENT " << o << ": " << talentResults[t][o][0] << " | MATCHES: " << tal << std::endl;
                // std::cout << "[T: " << t << "|O: " << o << "]" << std::endl;
                talentResults[t][o][1] -= buf[z+9];
                talentResults[t][o][2] -= buf[z+10];
                talentResults[t][o][3] -= buf[z+7];
                talentResults[t][o][4] -= buf[z+8];
                talentResults[t][o][5] -= buf[z+7];
                talentResults[t][o][6] -= buf[z+8];
                break;
              }
            }
          }
      }
      z += 11;
    }
    // std::cout << std::endl;

    // printBuildKeyDic(talentResults);
    int y=0;
    for (int l=0;l<7;l++) {
      for (int t=0;t<talentResults[l].size();t++) {
        for (int n=0;n<7;n++) {
          buf[y++] = talentResults[l][t][n];
        }
      }
    }

    // std::cout << "FINISHED WITH getTalentWinrates pointer: " << (uintptr_t)&buf[0]/4 << std::endl;
    return buf;


  } // End function
} // End extern C
