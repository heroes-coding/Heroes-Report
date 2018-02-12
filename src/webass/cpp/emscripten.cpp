#include <emscripten.h>
#include <math.h>
#include "playerparser.h"
#include "replayparser.h"
#include "kdensity.h"
#include "exponentialSmoother.h"
#include "getTalentWinrates.h"
#include <memory>
#include <iostream>

int main(int argc, char const *argv[]) {
    emscripten_run_script("typeof window!='undefined' && window.dispatchEvent(new CustomEvent('wasmLoaded'))");
    return 0;
}

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


}
