#include <memory>
#include <iostream>
#include "printNumber.h"



extern "C" {

  EMSCRIPTEN_KEEPALIVE
  int32_t* get20Nums (void) {

      int32_t *values = (int32_t*) std::malloc(sizeof(*values));

      for (int i=0; i<20; i++) {
          values[i] = i+1;
          printNumber(i);
      }

      auto arrayPtr = &values[0];
      return arrayPtr;
  }

}
