function getImageName(imageNumber) {
    switch (imageNumber) {
        case 0: return "PUG";
        case 1: return "SHIBA-INU";
        case 2: return "ST-BERNARD";

        default: return "";
    }
}


module.exports = {
    getImageName
}