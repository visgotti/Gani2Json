const f = require('./lib/index.js');

const fs = require('fs');
const path = require('path');


let ganieFileName = process.argv[2];
if(!ganieFileName) {
    const ganisDirectory = path.resolve(process.cwd(), 'ganis');
    const ganisFiles = fs.readdirSync(ganisDirectory).filter(f => f.endsWith('.gani'));
    let wrote = 0;
    ganisFiles.forEach((file) => {
        const ganiFilePath = path.join(ganisDirectory, file);
        const ganiFile = fs.readFileSync(ganiFilePath, 'utf-8');
        f.parseGaniFile(ganiFile).then((parsedData) => {
            const writeToPath = path.join(process.cwd(), 'converted', file.replace('.gani', '.json'));
            fs.writeFile(writeToPath, JSON.stringify(parsedData), 'utf-8', () => {
                wrote++;
                console.log(`${wrote}/${ganisFiles.length}`, "Done, wrote to", writeToPath)
            });
        });
    });
} else {
    if(!ganieFileName.endsWith('.gani')) {
        ganieFileName = `${ganieFileName}.gani`;
    }
    const ganiFile = fs.readFileSync(path.resolve(process.cwd(), 'ganis', ganieFileName), 'utf-8');
    f.parseGaniFile(ganiFile).then((f) => {
        const writeToPath = path.join(process.cwd(), 'converted', ganieFileName.replace('.gani', '.json'));
        fs.writeFileSync(writeToPath, JSON.stringify(f), 'utf-8');
        console.log("Done, wrote to", writeToPath)
    });
}
