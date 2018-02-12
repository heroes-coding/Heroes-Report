#include <math.h>
#include <memory>
#include <iostream>
#include <vector>


extern "C" {


  EMSCRIPTEN_KEEPALIVE
  uint32_t * decodeReplays (
    uint32_t *buf,
    int nPackedInts,
    int nDecoders,
    int nReplays,
    int nPredefined,
    int nItemsToDecode,
    int nHeroes
  ) {

    // These are constant positions for where data is returned in a given replay's data range
    const int oWon= 28;
    const int oWinners= 29;
    const int oFirstTo10= 30;
    const int oFirstTo20= 31;
    const int oFirstFort= 32;
    std::vector<int> oHeroes{ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 };
    std::vector<int> oTalents{ 33, 34, 35, 36, 37, 38, 39 };
    std::vector<int> oAllies{ 10, 11, 12, 13, 14 };
    std::vector<int> oEnemies{ 15, 16, 17, 18, 19 };
    std::vector< std::vector<int> > oRoleArray{ {24, 25, 26, 27}, {20, 21, 22, 23} };
    /*
    cout << "nPackedInts " << nPackedInts << endl;
    cout << "nDecoders " << nDecoders << endl;
    cout << "nReplays " << nReplays << endl;
    cout << "nPackedInts " << nPackedInts << endl;
    cout << "nItemsToDecode " << nItemsToDecode << endl;
    */

    int z = 0; // my real index in the buffer
    // Determine how many things are packed in each int
    std::vector<int> intLengths (nPackedInts);
    for (int i=0;i<nPackedInts;i++) {
      intLengths[i] = buf[z];
      z++;
    }

    // Get the actual decoders
    std::vector<int> decoderMaxes(nDecoders);
    std::vector<int> decoderMults (nDecoders);
    for (int i=0;i<nDecoders;i++) {
      decoderMaxes[i] = buf[z];
      decoderMults[i] = buf[z+1];
      z += 2;
    }

    // Get the special cases
    const int iSLOT = buf[z++];
    const int iWINNERS = buf[z++];
    const int iFIRST10 = buf[z++];
    const int iFIRST20 = buf[z++];
    const int iFIRSTFORT = buf[z++];
    const int iHERO0 = buf[z++];
    const int iHERO1 = buf[z++];
    const int iHERO2 = buf[z++];
    const int iHERO3 = buf[z++];
    const int iHERO4 = buf[z++];
    const int iHERO5 = buf[z++];
    const int iHERO6 = buf[z++];
    const int iHERO7 = buf[z++];
    const int iHERO8 = buf[z++];
    const int iHERO9 = buf[z++];
    const int iTAL0 = buf[z++];
    const int iTAL1 = buf[z++];
    const int iTAL2 = buf[z++];
    const int iTAL3 = buf[z++];
    const int iTAL4 = buf[z++];
    const int iTAL5 = buf[z++];
    const int iTAL6 = buf[z++];

    std::vector<int> roleList(nHeroes);
    for (int h=0;h<nHeroes;h++) {
      roleList[h] = buf[z++];
    }

    // And finally, to declare the buffer that will be pointed to when completely filled
    // uint32_t replays [nItemsToDecode*nReplays];
    // std::unique_ptr<uint32_t> replays(new uint32_t(nItemsToDecode*nReplays));
    std::vector<unsigned int> replays(nItemsToDecode*nReplays);
    // uint32_t *replays = (uint32_t*) std::malloc(sizeof(*replays));

    for (int r=0;r<nReplays;r++) {
      int slot;
      int winners;
      std::vector<int> heroes(10);
      std::vector<int>talents(7);
      int first10;
      int first20;
      int firstFORT;

      int n = 0;
      int count = 0;
      for (int i=0;i<nPackedInts;i++) {
        // HOLY CRAP THIS TOOK A LONG TIME TO FIGURE OUT.  IT WAS NEGATIVE BECAUSE I DIDN'T UNPACK IT AS USNIGNED
        unsigned int dataInt = buf[z++];
        dataInt = ((dataInt>>24)&0xff) | // move byte 3 to byte 0
                  ((dataInt<<8)&0xff0000) | // move byte 1 to byte 2
                  ((dataInt>>8)&0xff00) | // move byte 2 to byte 1
                  ((dataInt<<24)&0xff000000);

        for (int e=0;e<intLengths[i];e++) {
          int value = dataInt % decoderMaxes[n] * decoderMults[n];
          dataInt = dataInt / decoderMaxes[n];
          if (n==iSLOT) {
            slot = value;
          } else if (n==iWINNERS) {
            winners = value;
            replays[r*nItemsToDecode+oWinners] = value;
          } else if (n==iHERO0) {
            heroes[0] = value;
            replays[r*nItemsToDecode+oHeroes[0]] = value;
          } else if (n==iHERO1) {
            heroes[1] = value;
            replays[r*nItemsToDecode+oHeroes[1]] = value;
          } else if (n==iHERO2) {
            heroes[2] = value;
            replays[r*nItemsToDecode+oHeroes[2]] = value;
          } else if (n==iHERO3) {
            heroes[3] = value;
            replays[r*nItemsToDecode+oHeroes[3]] = value;
          } else if (n==iHERO4) {
            heroes[4] = value;
            replays[r*nItemsToDecode+oHeroes[4]] = value;
          } else if (n==iHERO5) {
            heroes[5] = value;
            replays[r*nItemsToDecode+oHeroes[5]] = value;
          } else if (n==iHERO6) {
            heroes[6] = value;
            replays[r*nItemsToDecode+oHeroes[6]] = value;
          } else if (n==iHERO7) {
            heroes[7] = value;
            replays[r*nItemsToDecode+oHeroes[7]] = value;
          } else if (n==iHERO8) {
            heroes[8] = value;
            replays[r*nItemsToDecode+oHeroes[8]] = value;
          } else if (n==iHERO9) {
            heroes[9] = value;
            replays[r*nItemsToDecode+oHeroes[9]] = value;
          } else if (n==iTAL0) {
            talents[0] = value;
            replays[r*nItemsToDecode+oTalents[0]] = value;
          } else if (n==iTAL1) {
            talents[1] = value;
            replays[r*nItemsToDecode+oTalents[1]] = value;
          } else if (n==iTAL2) {
            talents[2] = value;
            replays[r*nItemsToDecode+oTalents[2]] = value;
          } else if (n==iTAL3) {
            talents[3] = value;
            replays[r*nItemsToDecode+oTalents[3]] = value;
          } else if (n==iTAL4) {
            talents[4] = value;
            replays[r*nItemsToDecode+oTalents[4]] = value;
          } else if (n==iTAL5) {
            talents[5] = value;
            replays[r*nItemsToDecode+oTalents[5]] = value;
          } else if (n==iTAL6) {
            talents[6] = value;
            replays[r*nItemsToDecode+oTalents[6]] = value;
          } else if (n==iFIRST10) {
            first10 = value;
          } else if (n==iFIRST20) {
            first20 = value;
          } else if (n==iFIRSTFORT) {
            firstFORT = value;
          } else {
            replays[r*nItemsToDecode+nPredefined+count] = value;
            count++;
          }
          n += 1;
        }
      }

      // Done with unpacking data from this replay.  Now to further refine it

      // YOU
      int team = slot/5;
      // WON
      replays[r*nItemsToDecode+oWinners] = winners;
      replays[r*nItemsToDecode+oWon] = team == winners ? 1 : 0;

      int allies [5]; // you goes / go first
      int ally = 1;
      int enemy = 0;
      int enemies [5];
      int roleCounts [2][4] = {{0}};

      for (int p=0;p<10;p++) {
        int hero = heroes[p];
        int role = roleList[hero];
        role = role == 4 ? 0 : role;
        int onYourTeam = p/5 == team ? 1 : 0;
        if (p==slot) {
          allies[0] = hero;
          roleCounts[1][role] += 1;
        } else if (onYourTeam) {
          allies[ally++] = hero;
          roleCounts[1][role] += 1;
        } else {
          enemies[enemy++] = hero;
          roleCounts[0][role] += 1;
        }
      }

      //
      replays[r*nItemsToDecode+oFirstTo10] = first10 == 2 ? 2 : first10 == team ? 1 : 0;
      replays[r*nItemsToDecode+oFirstTo20] = first20 == 2 ? 2 : first20 == team ? 1 : 0;
      replays[r*nItemsToDecode+oFirstFort] = firstFORT == 2 ? 2 : firstFORT == team ? 1 : 0;
      for (int p=0;p<5;p++) {
        replays[r*nItemsToDecode+oAllies[p]] = allies[p];
        replays[r*nItemsToDecode+oEnemies[p]] = enemies[p];
      }
      for (int role=0;role<4;role++) {
        for (int t=0;t<2;t++) {
          replays[r*nItemsToDecode+oRoleArray[t][role]] = roleCounts[t][role];
        }
      }
    }
    for (int i=0;i<nItemsToDecode*nReplays;i++) {
      buf[i] = replays[i];
    }
    return buf;

  }


}
