const {getImageName} = require("../helpers");
const { ethers, deployments, network, getChainId, config } = require("hardhat");
const fs = require("fs").promises;
const {create, globSource} = require('ipfs-http-client');

async function uploadToIPFS(filepath) {
    const client = create();
    // https://ipfs.io/ipfs/QmTsAwfzJLgyPQfm69W7QjH8JZegpmvB2rWkVrDrM3N84M?filename=0-PUG.json
    let templateString = "https://ipfs.io/ipfs/"
    let IPFSURIs = {};

    console.log('load to IPFS');
    for await (const file of client.addAll(globSource(filepath, "*"))) {
        const CID = file.cid.toV0().toString();
        console.log('CID: ', CID);
        IPFSURIs[file.path.split('.')?.[0]] = templateString + CID + "?filename=" + file.path;
    }

    console.log('Load successful!', IPFSURIs);
    return IPFSURIs;
}

async function createTokenMetaData(tokenId, imageName, IPFSImagesURI) {
    const path = `metadata/${network.name}/ipfs/${tokenId}-${imageName}.json`;

    const metaData = {
        description: `Description of ${imageName} #${tokenId} dog:)`,
        image: IPFSImagesURI?.[imageName.toLowerCase()],
        name: imageName,
    }

    await fs.writeFile(path, JSON.stringify(metaData, null, 4), err => {
        if(err) throw err;
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

    const imagesIpfsUri = await uploadToIPFS("./img");

    console.log("create testnet metaData...");
    for (let tokenId = 0; tokenId < numberOfNFTs; tokenId++) {
        const imageName = getImageName(await advancedCollectible.tokenIdToImage(tokenId)).replace("_", "-").toLowerCase();
        await createTokenMetaData(tokenId, imageName, imagesIpfsUri);
    }
    console.log('Meta data created!');

    console.log('Upload NFTS.json to IPFS...');
    const NftURIs = await uploadToIPFS(`./metadata/${network.name}/ipfs`);

    console.log('Save nftUris.json в metadata...');
    const uriPath = `metadata/${network.name}/ipfs/nftUris.json`;
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

