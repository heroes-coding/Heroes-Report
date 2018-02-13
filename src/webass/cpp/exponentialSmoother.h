#include <iostream>
#include <vector>
#include <cmath>

extern "C" {
  EMSCRIPTEN_KEEPALIVE
  float* getExponentiallySmoothedData (float *buf, int nTime, int shouldSmooth) {
    const float multiplier = 100; // makes this function possible.   Otherwise, the nubmers are too big -- doubles raise memory errors I could not resolve nor fully understand.
    // std::cout << "nTime: " << nTime << std::endl;
    int z = 0;
    std::vector<float> timedData(nTime*2);
    for (int i=0;i<nTime;i++) {
      timedData[i*2] = buf[z++]/multiplier;
      timedData[i*2+1] = buf[z++]/multiplier;
    }
    int nPoints = nTime;
    float ALPHA = 0.01;
    int ALPHAcutoff = 458; // round(log(0.01)/(log(1-ALPHA)));
    std::vector<float> expDen(458);
    std::vector<float> expVals(458);

    expDen[0] = 1;
    expVals[0] = 1;
    // std::cout << "ALPHACUTOFF: " << ALPHAcutoff ;
    for (int i=1;i<=ALPHAcutoff;i++) {
      float newWeight = expVals[i-1]*(1-ALPHA);
      expVals[i] = newWeight;
      expDen[i] = expDen[i-1]+newWeight;
      // std::cout << "[" << i << ":" << newWeight << "," << expVals[i] << "," << expDen[i] << "]";
    }
    // std::cout << std::endl;
    int n = 0;
    nPoints = shouldSmooth ? nPoints - 2 : nPoints;
    std::vector<float> smoothedY(nPoints);
    if (shouldSmooth) {
      float num;
      float den;
      float res;
      int expo;
      for (int x=1;x<nPoints;x++) {
        num = timedData[x*2+1];
        den = expDen[ALPHAcutoff < x ? ALPHAcutoff : x];
        expo = 1;
        for (int y=x-1;y>-1;y--) {
          num += float(timedData[y*2+1]*expVals[expo]);
          expo += 1;
          if (expo >= ALPHAcutoff) {
            break;
          }
        }
        if (x==1) {
          continue;
        }
        res = num/den;
        smoothedY[x-2] = res;
        // std::cout << "[" << num << "/" << den << "(" << smoothedY[x-2] << ")] ";
      }
    } else {
      float sumAround = 0;
      float sumCount = 0;
      int pointsAround = 5;
      for (int x=0;x<nPoints;x++) {
        for (int i=x-pointsAround;i<x+pointsAround;i++) {
          if (i < 0 || i >= nPoints ) {
            continue;
          }
          sumAround += timedData[i*2+1];
          sumCount ++;
        }
        smoothedY[x] = sumAround/sumCount;
        sumAround = 0;
        sumCount = 0;
      }


    }

    float totY = 0;
    float nY = smoothedY.size();
    for (int p=0;p<nY;p++) {
      totY += smoothedY[p];
    }
    float meanY = totY/nY;
    float varianceTimesN = 0;
    for (int p=0;p<nY;p++) {
      varianceTimesN += std::pow(smoothedY[p]-meanY,2);
    }
    float sigmaY = std::pow(varianceTimesN/nY,0.5);

    // filter for outliers
    // std::cout << "MEAN: " << meanY << ", SIGMA: " << sigmaY << std::endl;
    int counter = 0;
    int offset = shouldSmooth ? 4 : 0;
    for (int p=0;p<nPoints-2;p++) {
      float y = smoothedY[p];
      if (abs(y-meanY) > 2*sigmaY) {
        // std::cout << y << " ignored because it is an outlier (meanY: " << meanY << ", sigmaY: " << sigmaY << std::endl;
        continue;
      }
      timedData[counter*2] = timedData[p*2+4];
      timedData[counter*2+1] = y;
      counter++;
    }


    // std::cout << "NPOINTS:::" << nPoints << std::endl;
    int r = 0;
    int threshold = 25;
    if (counter < threshold) {
      // std::cout << "TDATA SIZE: " << timedData.size() << "|nPoint: " << nPoints << "|smoothedY size: " << smoothedY.size();
      buf[r++] = counter;
      for (int i=0;i<counter;i++) {
        buf[r++] = timedData[i*2];
        buf[r++] = timedData[i*2+1];
        //std::cout << "[" << i << ":" << timedData[i*2+4] << "," << smoothedY[i] << ']';
      }
    } else {
      // just average nearby points together
      float binSize = (counter)/threshold;
      int p = 0;
      int c = 0;
      float totX = 0;
      float totY = 0;
      float prevX = timedData[0];
      float x;
      float y;
      float xResult;
      float yResult;
      while (p<counter) {
        x = timedData[p*2];
        y = timedData[p*2+1];
        if (p/binSize > r/2 && x - prevX > 0.001) {
          prevX = x;
          xResult = totX/c;
          yResult = totY/c;
          buf[r+1] = xResult;
          buf[r+2] = yResult;
          // std::cout << "[XRESULT:" << xResult << "|YRESULT:" << yResult << "]";
          r+=2;
          totX = 0;
          totY = 0;
          c = 0;
        }

        totX += x;
        totY += y;
        p++;
        c++;
        // std::cout << "[p:" << p << "|c:" << c << "|x:" << x << "|y:" << y << "|totX:" << totX << "|totY:" << totY << "] ";
      }
      buf[r+1] = totX/c;
      buf[r+2] = totY/c;
      buf[0] = r/2-1;
    }
    // std::cout << "FINISHED WITH returnees" << std::endl;
    // std::cout << std::endl;
    for (int i=1;i<r;i++) {
      buf[i] = buf[i]*multiplier;
      // std::cout << "[" << i << ":" << buf[i] << ']';
    }
    int pointerLoc = (uintptr_t)&buf[0]/8;
    // std::cout << "FINISHED WITH pointer: " << pointerLoc << std::endl;
    return buf;
  }
}
