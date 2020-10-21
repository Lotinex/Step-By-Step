const Fs = require('fs');
const Path = require('path');

let dic = process.argv[2];
if(!dic) {
    console.error('arguments for file name is not provided.')
    process.exit()
}

dic = Path.resolve(__dirname, `../dist/assets/img/${dic}`);

Fs.readdir(dic, (err, files) => {
    files.forEach(name => {
        if(/\w+-0\d/.test(name)){
            const newName = name.replace('0', ''); //removes zero
            Fs.rename(Path.resolve(dic, name), Path.resolve(dic, newName), (err) => {
                if(err) return console.error(err);
                console.log(`[SUCCESS] file: ${name}`)
            })
        } else {
            console.error(`[PASSED] file: ${name}`)
        }
    })
})

