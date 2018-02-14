#include <iostream>
#include <vector>
#include <cmath>
#include <algorithm>

std::vector< std::vector<float> > getTimedData(std::vector< std::vector<float> > timedData, int nPoints, int shouldSmooth) {
  const float multiplier = 100;
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
  // first, combine points that are the same
  float pointX = timedData[0][0];
  float sumAround = timedData[0][1];
  float sumCount = 1;
  for (int i=1;i<nPoints;i++) {
    float newX = timedData[i][0];
    float newY = timedData[i][1];
    if (abs(newX - pointX) > 0.0001) {
      timedData[n][1] = sumAround/sumCount;
      timedData[n][0] = pointX;
      sumAround = 0;
      sumCount = 0;
      pointX = newX;
      n++;
    }
    sumAround += newY;
    sumCount++;
  }
  timedData[n][1] = sumAround/sumCount;
  timedData[n][0] = pointX;

  nPoints = shouldSmooth ? n - 2 : n;
  std::vector<float> smoothedY(nPoints);
  if (shouldSmooth) {
    float num;
    float den;
    float res;
    int expo;
    for (int x=1;x<nPoints;x++) {
      num = timedData[x][1];
      den = expDen[ALPHAcutoff < x ? ALPHAcutoff : x];
      expo = 1;
      for (int y=x-1;y>-1;y--) {
        num += float(timedData[y][1]*expVals[expo]);
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
    sumAround = 0;
    sumCount = 0;
    int pointsAround = nPoints/10 > 1 ? nPoints/10 : 1;
    for (int x=0;x<nPoints;x++) {
      int min = pointsAround > 1 ? x - pointsAround : x;
      for (int i=min;i<x+pointsAround;i++) {
        if (i < 0 || i >= nPoints ) {
          continue;
        }
        sumAround += timedData[i][1];
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
  for (int p=0;p<nPoints;p++) {
    float y = smoothedY[p];
    if (abs(y-meanY) > 2*sigmaY) {
      // std::cout << y << " ignored because it is an outlier (meanY: " << meanY << ", sigmaY: " << sigmaY << std::endl;
      continue;
    }
    timedData[counter][0] = timedData[p][0];
    timedData[counter][1] = y;
    counter++;
  }

  int r = 0;
  int threshold = 25;
  int returnCount;
  if (counter < threshold) {
    returnCount = counter;
  } else {
    // just average nearby points together
    float binSize = (counter)/threshold;
    int p = 0;
    int c = 0;
    float totX = 0;
    float totY = 0;
    float prevX = timedData[0][0];
    float x;
    float y;
    float xResult;
    float yResult;
    while (p<counter) {
      x = timedData[p][0];
      y = timedData[p][1];
      if (p/binSize > r && x - prevX > 0.001) {
        prevX = x;
        xResult = totX/c;
        yResult = totY/c;
        timedData[r][0] = xResult;
        timedData[r][1] = yResult;
        // std::cout << "[XRESULT:" << xResult << "|YRESULT:" << yResult << "]";
        r++;
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
    xResult = totX/c;
    yResult = totY/c;
    timedData[r][0] = xResult;
    timedData[r][1] = yResult;
    r++;
    returnCount = r;
  }
  // std::cout << "FINISHED WITH returnees" << std::endl;
  // std::cout << std::endl;
  timedData.resize(returnCount);
  return timedData;
}

extern "C" {
  EMSCRIPTEN_KEEPALIVE
  float* getExponentiallySmoothedData (float *buf, int nTime, int shouldSmooth, int filterZeroes) {
    const float multiplier = 100; // makes this function possible.   Otherwise, the nubmers are too big -- doubles raise memory errors I could not resolve nor fully understand.
    // std::cout << "nTime: " << nTime << std::endl;
    int z = 0;
    std::vector< std::vector<float> > timedData(nTime);
    int nPoints = 0;
    for (int i=0;i<nTime;i++) {
      float x = buf[z++]/multiplier;
      float y = buf[z++]/multiplier;
      if ((filterZeroes && abs(x-0) < 0.00001) || (filterZeroes && shouldSmooth && abs(y-0) < 0.00001)) {
        // std::cout << "Skipping " << x << std::endl;
        continue;
      }
      std::vector<float> timePoint{x,y};
      timedData[nPoints++] = timePoint;
    }
    std::sort (timedData.begin(), timedData.begin()+nPoints);
    std::vector< std::vector<float> > result = getTimedData(timedData, nPoints, shouldSmooth);
    int returnCount = result.size();
    // std::cout << "returnCount: " << returnCount << ", nPoints: " << nTime << std::endl;

    buf[0] = returnCount;
    for (int i=0;i<returnCount;i++) {
      buf[i*2+1] = result[i][0]*multiplier;
      buf[i*2+2] = result[i][1]*multiplier;
      // std::cout << "[" << i << ":" << buf[i] << ']';
    }
    int pointerLoc = (uintptr_t)&buf[0]/8;
    // std::cout << "FINISHED WITH pointer: " << pointerLoc << std::endl;
    return buf;

  }
}
