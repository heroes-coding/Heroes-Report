#include <emscripten.h>
#include <math.h>
#include <memory>
#include <iostream>

int main(int argc, char const *argv[]) {
    emscripten_run_script("typeof window!='undefined' && window.dispatchEvent(new CustomEvent('wasmLoaded'))");
    return 0;
}

// These are constant positions for where data is returned in a given replay's data range
const int oWon= 28;
const int oWinners= 29;
const int oFirstTo10= 30;
const int oFirstTo20= 31;
const int oFirstFort= 32;
const int oHeroes [10] = { 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 };
const int oTalents [7] = { 33, 34, 35, 36, 37, 38, 39 };
const int oAllies [5] = { 10, 11, 12, 13, 14 };
const int oEnemies [5] = { 15, 16, 17, 18, 19 };
const int oRoleArray [2][4] = { {24, 25, 26, 27}, {20, 21, 22, 23} };
/*
let pointer = Module._get20Nums()
console.log(Module.HEAPU32.slice(pointer/4,pointer/4+20))
let test = new Uint32Array([1,2,3,4,5,6,7,8,9,10])
let buf = Module._malloc(10,4)
Module.HEAPU32.set(test,buf >> 2)
let res = Module._testMultiHEAPU32(buf,5,10)
console.log(Module.HEAPU32.slice(res/4,res/4+10))
console.log(Module.HEAPU32.slice(pointer/4,pointer/4+20))
*/

/*
let test = new Uint32Array([1,2,3,4,5,6,7,8,9,10])
let buf = Module._malloc(10,4)
Module.HEAPU32.set(test,buf >> 2)
let res = Module._divide(buf,5,2)
*/


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

  /*
  cout << "nPackedInts " << nPackedInts << endl;
  cout << "nDecoders " << nDecoders << endl;
  cout << "nReplays " << nReplays << endl;
  cout << "nPackedInts " << nPackedInts << endl;
  cout << "nItemsToDecode " << nItemsToDecode << endl;
  */

  int z = 0; // my real index in the buffer
  // Determine how many things are packed in each int
  int intLengths [nPackedInts];
  for (int i=0;i<nPackedInts;i++) {
    intLengths[i] = buf[z];
    z++;
  }

  // Get the actual decoders
  int decoderMaxes [nDecoders];
  int decoderMults [nDecoders];
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

  int roleList [nHeroes];
  for (int h=0;h<nHeroes;h++) {
    roleList[h] = buf[z++];
  }

  // And finally, to declare the buffer that will be pointed to when completely filled
  uint32_t replays [nItemsToDecode*nReplays];
  for (int r=0;r<nReplays;r++) {
    int slot;
    int winners;
    int heroes [10];
    int talents [7];
    int first10;
    int first20;
    int firstFORT;

    int n = 0;
    int count = 0;
    for (int i=0;i<nPackedInts;i++) {
      // HOLY CRAP THIS TOOK A LONG TIME TO FIGURE OUT.  IT WAS NEGATIVE BECAUSE I DIDN'T UNPACK IT AS USNIGNED
      unsigned int dataInt = buf[z++];
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

    // refactor firsts to mean "1" / True means that YOU were the first there, not to define which team was the first. Endless sources of confusion!
    replays[r*nItemsToDecode+oFirstTo10] = first10 == team;
    replays[r*nItemsToDecode+oFirstTo20] = first20 == team;
    replays[r*nItemsToDecode+oFirstFort] = firstFORT == team;
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
  auto arrayPtr = &replays[0];
  return arrayPtr;
}



    EMSCRIPTEN_KEEPALIVE
    int32_t* get20Nums (void) {

        int32_t *values = (int32_t*) std::malloc(sizeof(*values));

        for (int i=0; i<20; i++) {
            values[i] = i+1;
            std::cout << i << std::endl;
        }

        auto arrayPtr = &values[0];
        return arrayPtr;
    }

    EMSCRIPTEN_KEEPALIVE
    int addNums (float *buf, int bufSize) {

        int total = 0;

        for (int i=0; i<bufSize; i++) {
            total+= buf[i];
        }

        return total;
    }

    EMSCRIPTEN_KEEPALIVE
    uint32_t* testHEAPU32 (uint32_t *buf, int bufSize) {

        uint32_t values[bufSize];

        for (int i=0; i<bufSize; i++) {
            std::cout << buf[i] << std::endl;
            values[i] = buf[i] * 2;
        }

        auto arrayPtr = &values[0];
        return arrayPtr;
    }

    EMSCRIPTEN_KEEPALIVE
    uint32_t * testMultiHEAPU32 (uint32_t *buf, int firstEnd, int secondEnd) {
        uint32_t result [secondEnd];
        // cout << "first end " << firstEnd << endl;
        // cout << "second end " << secondEnd << endl;
        for (int i=0; i<secondEnd; i++) {
          if (i < firstEnd) {
              // cout << "First bunch" << i << endl;
          } else if (i < secondEnd) {
            // cout << "Second bunch" << i << endl;
          } else {
            // cout << "i is too big" << i << endl;
          }
          // cout << buf[i] *2 << endl;
          result[i] = buf[i] * 2;
        }

        auto arrayPtr = &result[0];
        return arrayPtr;
    }

}
