hasTile(tileX, tileZ, zoomLevel) {
    const zoomFactor = Math.pow(2, zoomLevel);

    const minTileX = Math.floor(this.worldMinX * zoomFactor / this.tileSize);
    const minTileZ = Math.floor(this.worldMinZ * zoomFactor / this.tileSize);
    const maxTileX = Math.ceil((this.worldMinX + this.worldWidth) * zoomFactor / this.tileSize) - 1;
    const maxTileZ = Math.ceil((this.worldMinZ + this.worldHeight) * zoomFactor / this.tileSize) - 1;

    if (
        tileX < minTileX || tileZ < minTileZ ||
        tileX > maxTileX || tileZ > maxTileZ
    ) return false;

    const blockSize = this.tileSize / zoomFactor;

    const blockX = tileX * blockSize;
    const blockZ = tileZ * blockSize;

    const regionX = Math.floor(blockX / 512);
    const regionZ = Math.floor(blockZ / 512);

    const regionSize = Math.ceil(blockSize / 512);

    for (let rx = regionX; rx <= regionX + regionSize; rx++) {
        for (let rz = regionZ; rz <= regionZ + regionSize; rz++) {

            const groupX = Math.floor(rx / 32);
            const groupZ = Math.floor(rz / 32);

            const regionMap = this.regionMap.find(e => e.x === groupX && e.z === groupZ);
            if (!regionMap) continue;

            const relX = rx - groupX * 32;
            const relZ = rz - groupZ * 32;

            const index = relZ * 32 + relX;
            const word = Math.floor(index / 32);
            const bit = index % 32;

            if (regionMap.m[word] & (1 << bit)) {
                return true;
            }
        }
    }

    return false;
}
