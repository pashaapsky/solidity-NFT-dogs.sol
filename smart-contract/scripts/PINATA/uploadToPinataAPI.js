const axios = require('axios');
const fs = require("fs");
const rfs = require('recursive-fs');
const FormData = require('form-data');
const basePathConverter = require('base-path-converter');
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_API_SECRET_KEY = process.env.PINATA_API_SECRET_KEY;

//filePath as "./img/pug.png";
async function singleImageFileLoad(filePath) {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

    let data = new FormData();
    data.append('file', fs.createReadStream(filePath));

    try {
        const res = await axios
            .post(url, data, {
                maxBodyLength: 'Infinity',
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
                    pinata_api_key: PINATA_API_KEY,
                    pinata_secret_api_key: PINATA_API_SECRET_KEY
                }
            }).then(res => res.data);

        console.log('SingleImageFileLoad success!: ', res.IpfsHash);
        return res.IpfsHash;
    } catch (e) {
        console.log('SingleImageFileLoad FAILED!: ', e.message);
    }
}

//filename = "newPinata.png", jsonBody = {}
async function singleJsonFileLoad(fileName, jsonBody) {
    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;

    const data = {
        pinataMetadata: {
            name: fileName,
        },
        pinataContent: {
            ...jsonBody
        }

    }

    try {
        const res = await axios
            .post(url, data, {
                headers: {
                    pinata_api_key: PINATA_API_KEY,
                    pinata_secret_api_key: PINATA_API_SECRET_KEY
                }
            }).then(res => res.data);

        console.log("SingleJsonFileLoad success: ", res.IpfsHash);

        return res.IpfsHash;
    } catch (e) {
        console.log("SingleJsonFileLoad FAILED!: ", e.message);
    }

}

//src => './img'
async function loadDirectory(fileName, src) {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

    const {dirs, files} = await rfs.read(src);
    console.log(dirs, files);

    let data = new FormData();

    console.log('files: ', files);

    files.forEach((file) => {
        //for each file stream, we need to include the correct relative file path
        console.log('file: ', file);

        data.append(`file`, fs.createReadStream(file), {
            filepath: basePathConverter(src, file)
        });
    });

    const metadata = JSON.stringify({
        name: fileName
    });

    data.append('pinataMetadata', metadata);

    try {
        const res = await axios
            .post(url, data, {
                maxBodyLength: 'Infinity',
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
                    pinata_api_key: PINATA_API_KEY,
                    pinata_secret_api_key: PINATA_API_SECRET_KEY,
                }
            }).then(res => res.data);

        console.log('loadDirectory success: ', res.IpfsHash);

        return res.IpfsHash;
    } catch (e) {
        console.log('loadDirectory FAILED!: ', e.message);
    }
}

module.exports = {
    singleImageFileLoad,
    singleJsonFileLoad,
    loadDirectory,
}