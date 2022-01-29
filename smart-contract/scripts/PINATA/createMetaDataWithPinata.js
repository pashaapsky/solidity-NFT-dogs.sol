const {ethers, deployments, network, getChainId, config} = require("hardhat");
const fs = require("fs").promises;
const rfs = require('recursive-fs');
const basePathConverter = require('base-path-converter');
const {loadDirectory, singleImageFileLoad, singleJsonFileLoad} = require("./uploadToPinataAPI");

function getImageName(imageNumber) {
    switch (imageNumber) {
        case 0:
            return "PUG";
        case 1:
            return "SHIBA-INU";
        case 2:
            return "ST-BERNARD";

        default:
            return "";
    }
}

async function uploadImageToPinata(imagesPath, type) {
    // https://gateway.pinata.cloud/ipfs/QmUPjADFGEKmfohdTaNcWhp7VGk26h5jXDA7v3VtTnTLcW?preview=1
    let templateString = "https://gateway.pinata.cloud/ipfs/"
    let pinataURIs = {};

    const {dirs, files} = await rfs.read(imagesPath);

    for await (const filePath of files) {
        if (filePath.includes("nftUris")) {
            continue;
        }

        const convertedPath = basePathConverter(imagesPath, filePath);
        const imageName = convertedPath.slice(convertedPath.lastIndexOf("/") + 1);
        const imageNoExt = imageName.split('.')[0];

        console.log(imageName);

        if (type === "image") {
            const imageHash = await singleImageFileLoad(filePath);

            pinataURIs[imageNoExt] = templateString + imageHash + "?filename=" + imageName;
        } else if (type === "json") {
            const file = await fs.readFile(filePath);
            const imageHash = await singleJsonFileLoad(imageName, JSON.parse(file));
            pinataURIs[imageNoExt] = templateString + imageHash + "?filename=" + imageName;
        }
    }

    console.log('Load successful!', pinataURIs);
    return pinataURIs;
}

async function createTokenMetaData(tokenId, imageName, IPFSImagesURI) {
    const path = `metadata/${network.name}/pinata/${tokenId}-${imageName}.json`;

    const metaData = {
        description: `Description of ${imageName} #${tokenId} dog:)`,
        image: IPFSImagesURI?.[imageName.toLowerCase()],
        name: imageName,
    }

    await fs.writeFile(path, JSON.stringify(metaData, null, 4), err => {
        if (err) throw err;
        console.log("METADATA: ", metaData);
    });
}

async function main() {
    if (await getChainId() === "1337") {
        console.log("localhost: use fixture");
        await deployments.fixture(["main", "mocks"]);
    }

    const AdvancedCollectible = await deployments.get("AdvancedCollectible");
    const advancedCollectible = await ethers.getContractAt("AdvancedCollectible", AdvancedCollectible.address);
    console.log('advancedCollectible: ', advancedCollectible.address);

    const numberOfNFTs = await advancedCollectible.tokenCounter();
    console.log(`You have created: ${numberOfNFTs} NFTs!`);

    const imagesIpfsUri = await uploadImageToPinata('./img', 'image');

    console.log("create testnet metaData...");
    for (let tokenId = 0; tokenId < numberOfNFTs; tokenId++) {
        const imageName = getImageName(await advancedCollectible.tokenIdToImage(tokenId)).replace("_", "-").toLowerCase();
        await createTokenMetaData(tokenId, imageName, imagesIpfsUri);
    }
    console.log('Meta data created!');

    console.log('Upload NFTS.json to IPFS...');
    const NftURIs = await uploadImageToPinata(`./metadata/${network.name}/pinata`, "json");

    // console.log('Save nftUris.json в metadata...');
    const uriPath = `metadata/${network.name}/pinata/nftUris.json`;
    await fs.writeFile(uriPath, JSON.stringify(NftURIs, null, 4), err => {
        if(err) throw err;
        console.log("METADATA: ", NftURIs);
    });
    console.log("SUCCESS!");
}

//Не забыть запустить IPFS daemon для загрузки данных и генерации META данных NFT
//termina -> ipfs daemon
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

