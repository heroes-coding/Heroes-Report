with open ('C:/heroes/public/appWASM.js','r') as f:
    file = f.read()
    
file = file.replace('appWASM.wasm','../appWASM.wasm')

with open ('C:/heroes/public/appWASM.js','w') as f:
    f.write(file)





