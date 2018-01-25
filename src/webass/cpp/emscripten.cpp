#include <emscripten.h>
#include <math.h>
#include "playerparser.h"
#include "replayparser.h"
#include "getTalentWinrates.h"
#include <memory>
#include <iostream>

int main(int argc, char const *argv[]) {
    emscripten_run_script("typeof window!='undefined' && window.dispatchEvent(new CustomEvent('wasmLoaded'))");
    return 0;
}

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
uint32_t * decodeInts (
  uint32_t *buf,
  int nInts
) {
  for (int i=0;i<nInts;i++) {
    unsigned int dataInt = buf[i];
    std::cout << "Int " << i << ": " << dataInt << std::endl;
  }
  return 0;
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
