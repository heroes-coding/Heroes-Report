#include <emscripten.h>
#include <math.h>
#include "playerparser.h"
#include "replayparser.h"
#include "kdensity.h"
#include "exponentialSmoother.h"
#include "getTalentWinrates.h"
#include <memory>
#include <numeric>
#include <iostream>

int main(int argc, char const *argv[]) {
    emscripten_run_script("typeof window!='undefined' && window.dispatchEvent(new CustomEvent('wasmLoaded'))");
    return 0;
}

extern "C" {

  EMSCRIPTEN_KEEPALIVE
  int32_t * sortArrayReturnIndices (
    int32_t *buf,
    int N,
    int Descending
  ) {
    std::vector<int> array(N);
    for (int i=0;i<N;i++) {
      array[i] = buf[i];
    }
    std::vector<int> indices(N);
    int j=0;
    std::iota(indices.begin(),indices.end(),j++); //Initializing
    for (int i=0;i<N;i++) {
      indices[i]=i;
    }
    if (Descending) {
      sort( indices.begin(),indices.end(), [&](int x,int y){return array[x]>array[y];} );
    } else {
      sort( indices.begin(),indices.end(), [&](int x,int y){return array[x]<array[y];} );
    }
    for (int i=0;i<N;i++) {
      buf[i] = indices[i];
    }
    return buf;
  }


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
