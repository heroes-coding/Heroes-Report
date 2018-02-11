#include <memory>
#include <iostream>
#include <cmath>
#include <utility>
#include <algorithm>
#include <vector>
#include <numeric>
#include <math.h>




float* getData(float timedData[], int nPoints) {
  // timedData needs to come presorted because of bug of finding size within the function
  double ALPHA = 0.01;
  int ALPHAcutoff = 458; // round(log(0.01)/(log(1-ALPHA)));
  double expDen[458];
  double expVals[458];
  expDen[0] = 1;
  expVals[0] = 1;
  // std::cout << "ALPHACUTOFF: " << ALPHAcutoff ;
  for (int i=1;i<=ALPHAcutoff;i++) {
    double newWeight = expVals[i-1]*(1-ALPHA);
    expVals[i] = newWeight;
    expDen[i] = expDen[i-1]+newWeight;
    // std::cout << "[" << i << ":" << newWeight << "," << expVals[i] << "," << expDen[i] << "]";
  }


  int n = 0;
  float smoothedY[nPoints-2];
  for (int x=1;x<nPoints;x++) {
    double num = timedData[x*2+1];
    double den = expDen[std::min(ALPHAcutoff,x)];
    int expo = 1;
    for (int y=x-1;y>-1;y--) {
      num += double(timedData[y*2+1]*expVals[expo]);
      expo += 1;
      if (expo >= ALPHAcutoff) {
        break;
      }
    }
    if (x==1) {
      continue;
    }
    float res = float(num/den);
    // std::cout << "[" << num << "/" << den << "(" << res << ")] ";
    smoothedY[x-2] = res;
  }
  std::cout << std::endl;

  // float returnees[(nPoints-2)*2+1]; // DON'T DO THIS!!!
  float *returnees = (float*) std::malloc(sizeof(*returnees));
  int r = 0;
  returnees[r++] = nPoints-2;
  for (int i=0;i<nPoints-2;i++) {
    returnees[r++] = timedData[i*2+4];
    returnees[r++] = smoothedY[i];
    // std::cout << "[" << i << ":" << theData[i].first << "," << theData[i].second << ']';
  }
  float* arrayPtr = &returnees[0];
  // std::free(returnees);
  return arrayPtr;
}


extern "C" {
  EMSCRIPTEN_KEEPALIVE
  float* getExponentiallySmoothedData (float *buf, int nTime) {
    // std::cout << "nTime: " << nTime << std::endl;
    int z = 0;
    float theData[nTime*2];
    for (int i=0;i<nTime;i++) {
      theData[i*2] = buf[z++];
      theData[i*2+1] = buf[z++];
    }
    return getData(theData, nTime);
  }
}
