const fs = require('fs');
const path = require('path');
const builder = require('./electron-builder.base.json');

const generateUpdateYml = () => {

    const updateFileName = "dev-app-update.yml";
    const updateFileNameAndPath = path.join(__dirname, updateFileName)

    if (fs.existsSync(updateFileNameAndPath) === true) {
        fs.unlinkSync(updateFileNameAndPath)
    }

    const data = `provider: "${builder.publish[0].provider}"\r\nurl: "${builder.publish[0].url}"`
    fs.writeFileSync(updateFileNameAndPath, data)
}

const chunkArray = (inputArray, size) => {
    return inputArray.reduce((resultArray, item, index) => {
        const chunkIndex = Math.floor(index / size)

        if (!resultArray[chunkIndex]) {
            resultArray[chunkIndex] = [] // start a new chunk
        }

        resultArray[chunkIndex].push(item)

        return resultArray
    }, []);
}

const closeFile = (fd, onClose) => {
    if (fd == null) {
        onClose()
        return;
    }

    fs.close(fd, (closeErr) => {

        if (closeErr) {
            onClose(closeErr)
            return
        }

        onClose()
    });
}

const isFileLocked = (filePath) => {
    return new Promise((resolve, reject) => {
        try {
            fs.open(filePath, 'r+', (err, fd) => {

                closeFile(fd, (closeError) => {

                    if (closeError) {
                        reject();
                    }

                    if (err && err.code === 'EBUSY') {
                        resolve(true);
                        return;
                    }

                    resolve(false);
                })

            });
        } catch (e) {
            reject(e)
        }
    })
}


module.exports = { generateUpdateYml, chunkArray, isFileLocked }