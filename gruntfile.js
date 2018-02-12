const safePrefs = "C:/webass/emsdk_env.bat & echo Building... & emcc -o ./public/appWASM.js ./src/webass/cpp/emscripten.cpp -O1 -s ASSERTIONS=1 -s SAFE_HEAP=1 -s DEMANGLE_SUPPORT=1 --profiling-funcs -s DETERMINISTIC=1 -s TOTAL_MEMORY=256MB -s ALLOW_MEMORY_GROWTH=1 -s WASM=1 -s NO_EXIT_RUNTIME=1 -std=c++1z && python C:/heroes/correctPath.py"

const bareMetal = "C:/webass/emsdk_env.bat & echo Building... & emcc -o ./public/appWASM.js ./src/webass/cpp/emscripten.cpp -O1 -s ALLOW_MEMORY_GROWTH=1 -s WASM=1 -s NO_EXIT_RUNTIME=1 -std=c++1z && python C:/heroes/correctPath.py"


let safeAssertions = ' -s BINARYEN_ASYNC_COMPILATION=0 -s ASSERTIONS=1 -s SAFE_HEAP=1 -s DEMANGLE_SUPPORT=1 --profiling-funcs -s DETERMINISTIC=1 -s'
let test = `C:/webass/emsdk_env.bat & echo Building... & emcc ./src/webass/cpp/emscripten.cpp -o ./public/appWASM.js -O1 -s "EXTRA_EXPORTED_RUNTIME_METHODS=['ccall']" -s ALLOW_MEMORY_GROWTH=1 -s WASM=1 -s NO_EXIT_RUNTIME=1 -std=c++1z && python C:/heroes/correctPath.py -s EXPORTED_FUNCTIONS="['_getKernelDensity', '_decodeReplays', '_getExponentiallySmoothedData']"` + safeAssertions

module.exports = grunt => {
  grunt.initConfig({
    exec: {
      build: test
    },
    watch: {
      cpp: {
        files: ["src/webass/cpp/*.cpp", "src/webass/cpp/*.h"],
        tasks: ["exec:build"]
      }
    }
  })

  grunt.loadNpmTasks("grunt-contrib-watch")
  grunt.loadNpmTasks("grunt-exec")
  grunt.registerTask("default", ["watch"])
}
