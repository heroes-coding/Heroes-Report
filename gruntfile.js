module.exports = grunt => {
  grunt.initConfig({
    exec: {
      build: "C:/webass/emsdk_env.bat & echo Building... & emcc -o ./public/appWASM.js ./src/webass/cpp/emscripten.cpp -O3 -s ALLOW_MEMORY_GROWTH=1 -s WASM=1 -s NO_EXIT_RUNTIME=1 -std=c++1z && python C:/heroes/correctPath.py"
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
