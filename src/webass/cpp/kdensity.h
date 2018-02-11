#include <memory>
#include <iostream>
#include "printNumber.h"
#include <cmath>

float kernelEpanechnikov(float k,float v) {
    v = abs(v/k);
    float r = v <= 1 ? 0.75 * (1 - v * v) / k : 0;
    // std::cout << "[" << v << ":" << r << "]";
    return r;
}

float* kernelDensity (int k, float X[], float V[], int nX, int nV) {
  // k is the kDensity parameter / smoothing factor
  // X is the bins of X
  // V are all of the values

  // float kDensity[nX];
  float *kDensity = (float*) std::malloc(sizeof(*kDensity));
  for (int i=0;i<nX;i++) {
    float x = X[i];
    float kSum = 0;
    // std::cout << x << ":";
    for (int j=0;j<nV;j++) {
      float v = V[j];
      kSum += kernelEpanechnikov(k,x-v);
    }
    // std::cout << " ||| TOTAL: " << kSum << std::endl;
    kDensity[i] = kSum/nV;
  }
  auto arrayPtr = &kDensity[0];
  return arrayPtr;
}



extern "C" {
  EMSCRIPTEN_KEEPALIVE
  float* getKernelDensity (float *buf, int nX, int nV) {
    // see above for definitions
    int z = 0;
    int k = buf[z++];
    float totX = 0;
    float X[nX];
    float V[nV];
    for (int i=0;i<nX;i++) {
      float x = buf[z++];
      totX += x;
      X[i] = x;
    }
    float avgX = totX/nX;
    int l = 0;
    for (int j=0;j<nV;j++) {
      float v = buf[z++];
      if (v > 0.001 || avgX < 2.5) {
        V[l++] = v;
      }
    }
    return kernelDensity(k, X, V, nX, l);
  }
}
