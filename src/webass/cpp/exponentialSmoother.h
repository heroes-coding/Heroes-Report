#include <memory>
#include <iostream>
#include <cmath>
#include <utility>
#include <algorithm>
#include <vector>
#include <numeric>
#include <math.h>

float ALPHA = 0.01;
int ALPHAcutoff = 458; // round(log(0.01)/(log(1-ALPHA)));
float expDen[458];
float expVals[458];

void populateAlphas() {
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
}

std::vector<std::pair<float,float> > getData(std::vector<std::pair<float,float> > &timedData, int nTime) {

  // timedData needs to come presorted because of bug of finding size within the function
  std::vector<std::pair<float,float> > newData;
  if (nTime>500) {
    newData.reserve(500);
    float minTime = timedData[0].first;
    float maxTime = timedData[nTime-1].first;
    float inc = (maxTime-minTime)/500;
    // std::cout << "min time " << minTime << ", maxTime " << maxTime << ", inc " << inc << std::endl;
    float bin = minTime + inc;
    float count = 0;
    float wins = 0;
    double totalMSL = 0;
    for (int t=0;t<nTime;t++) {
      float time = timedData[t].first;
      float won = timedData[t].second;
      while (time > bin) {
        bin += inc;
        if (abs(count) > 0.01) {
          std::pair <float,float> timePair;
          timePair = std::make_pair (totalMSL/count,wins/count);
          newData.push_back(timePair);
          count = 0;
          wins = 0;
          totalMSL = 0;
        }
      }
      wins += won;
      count += 1;
      totalMSL += time;
      // std::cout << "t: " << t << ", Wins: " << wins << ", Count: " << count << "\n";
    }
    if (count > 0) {
      std::pair <float,float> timePair;
      timePair = std::make_pair (totalMSL/count,wins/count);
      newData.push_back(timePair);
    }
    timedData = newData;
  }


  /*
  for (int i=0;i<nTime;i++) {
    std::cout << "[" << i << ":" << timedData[i].first << " | " << timedData[i].second << ']';
  }
  std::cout << std::endl;
  */

  int nPoints = nTime > 500 ? timedData.size() : nTime; // If you don't do this, the size of timedData is 0!!! I don't understand
  // std::cout << "\n\nnPoints inside getData: " << nTime <<"\n\n" << std::endl;
  std::vector<std::pair<float,float> > combinedData;
  combinedData.reserve(nPoints);
  int p=1;
  float curX = timedData[0].first;
  double yTotal = timedData[0].second;
  int count = 1;
  while (p<nPoints) {
    float nextX = timedData[p].first;
    if (abs(curX - nextX) < 0.001) {
      yTotal += timedData[p].second;
      count++;
      p++;
      continue;
    }
    std::pair <float,float> comboPair;
    // std::cout << "[x:" << curX << "|yTotal:" << yTotal << "|count:" << count << "]";
    comboPair = std::make_pair (curX,yTotal/count);
    combinedData.push_back(comboPair);
    yTotal = timedData[p].second;
    curX = nextX;
    count = 1;
    p++;
  }
  // std::cout << std::endl;
  std::pair <float,float> comboPair;
  comboPair = std::make_pair (curX,yTotal/count);
  combinedData.push_back(comboPair);
  nPoints = combinedData.size();
  timedData = combinedData;

  /*
  for (int i=0;i<nPoints;i++) {
    std::cout << "[" << i << ":" << timedData[i].first << " | " << timedData[i].second << ']';
  }
  std::cout << std::endl;
  */
  if (nPoints < 10) {
    // too few points for any smoothing or moving average
    return combinedData;
  }
  if (nPoints < 100) {
    std::vector<std::pair<float,float> > smoothedData;
    smoothedData.reserve(nPoints);
    // if there is not enough data for an exponential moving average (which is a lagging indicator), just use simple averages of point and left and right neighbors for a little bit of smoothing
    for (int i=0;i<nPoints;i++) {
      std::pair <float,float> smoothedPair;
      float val;
      if (i==0) {
        val = (combinedData[0].second + combinedData[1].second)/2;
      } else if (i==nPoints-1) {
        val = (combinedData[i-1].second + combinedData[i].second)/2;
      } else {
        val = (combinedData[i-1].second + combinedData[i].second + combinedData[i+1].second)/3;
      }
      smoothedPair = std::make_pair (combinedData[i].first,val);
      smoothedData.push_back(smoothedPair);
    }
    return smoothedData;
  }


  float smoothedY[nPoints];
  for (int x=1;x<nPoints;x++) {
    float num = timedData[x].second;
    float den = expDen[std::min(ALPHAcutoff,x)];
    int expo = 1;
    for (int y=x-1;y>-1;y--) {
      num += timedData[y].second*expVals[expo];
      expo += 1;
      if (expo >= ALPHAcutoff) {
        break;
      }
    }
    if (x==1) {
      continue;
    }
    float res = num/den;
    // std::cout << "[" << num << "/" << den << "(" << res << ")]";
    smoothedY[x-2] = res;
  }

  // std::cout << std::endl;

  // and now to get rid of some 'outliers' above two standard deviations (for better and clearer graphs, really)
  double sumY = 0;
  for (int i=0;i<nPoints-2;i++) {
    sumY += smoothedY[i];
  }
  float meanY = sumY/(nPoints-2);
  double sumSquares = 0;
  for (int i=0;i<nPoints-2;i++) {
    sumSquares += pow((smoothedY[i]-meanY),2);
    // std::cout << "[" << i << ":" << smoothedY[i] << "]";
  }
  float sigma = pow(sumSquares/(nPoints-2),0.5);
  // std::cout << "mean: " << meanY << ", std: " << sigma << std::endl;
  std::vector<std::pair<float,float> > theData;
  theData.reserve(nPoints-2);
  for (int p=0;p<nPoints-2;p++) {
    if (abs(smoothedY[p] - meanY) < 2*sigma) {
      std::pair <float,float> timePair;
      timePair = std::make_pair (timedData[p+2].first,smoothedY[p]);
      theData.push_back(timePair);
    }
  }
  return theData;
}


extern "C" {
  EMSCRIPTEN_KEEPALIVE
  float* getExponentiallySmoothedData (float *buf, int nTime) {
    if (!expDen[0]) {
      populateAlphas();
    }
    int z = 0;
    std::vector<std::pair<float,float> > theData;
    theData.reserve(nTime*3);
    for (int i=0;i<nTime;i++) {
      std::pair <double,float> timePair;
      timePair = std::make_pair (buf[z],buf[z+1]);
      // std::cout << "[" << timePair.first << "|" << timePair.second << "] ";
      z += 2;
      theData[i] = timePair;
    }

    for (int i=0;i<nTime;i++) {
      // std::cout << "[" << i << ":" << theData[i].first << "," << theData[i].second << ']';
    }
    // std::cout << std::endl;


    std::sort(theData.begin(),theData.begin()+nTime); // using theData.end() DOES NOT WORK! WTF IS WRONG WITH C++?  TOO MANY GOTCHYAS THAT DON'T MAKE SENSE

    theData = getData(theData, nTime);
    int nPoints = theData.size();
    float *returnees = (float*) std::malloc(nPoints*8+4);
    int r = 0;
    returnees[r++] = nPoints;
    for (int i=0;i<nPoints;i++) {
      returnees[r++] = theData[i].first;
      returnees[r++] = theData[i].second;
      // std::cout << "[" << i << ":" << theData[i].first << "," << theData[i].second << ']';
    }
    // std::cout << std::endl;
    auto arrayPtr = &returnees[0];
    return arrayPtr;
  }
}
