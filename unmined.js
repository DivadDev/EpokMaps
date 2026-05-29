class RegionMap {

    constructor(regionMap, tileSize, worldMinX, worldMinZ, worldWidth, worldHeight) {
        this.regionMap = regionMap;
        this.tileSize = tileSize;
        this.worldMinX = worldMinX;
        this.worldMinZ = worldMinZ;
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;
    }

    hasTile(tileX, tileZ, unminedZoomLevel) {
        const zoomFactor = Math.pow(2, unminedZoomLevel);

        const minTileX = Math.floor(this.worldMinX * zoomFactor / this.tileSize);
        const minTileZ = Math.floor(this.worldMinZ * zoomFactor / this.tileSize);
        const maxTileX = Math.ceil((this.worldMinX + this.worldWidth) * zoomFactor / this.tileSize) - 1;
        const maxTileZ = Math.ceil((this.worldMinZ + this.worldHeight) * zoomFactor / this.tileSize) - 1;

        if (tileX < minTileX || tileZ < minTileZ || tileX > maxTileX || tileZ > maxTileZ) {
            return false;
        }

        const tileBlockSize = this.tileSize / zoomFactor;
        const tileBlockPoint = {
            x: tileX * tileBlockSize,
            z: tileZ * tileBlockSize
        };

        const tileRegionPoint = {
            x: Math.floor(tileBlockPoint.x / 512),
            z: Math.floor(tileBlockPoint.z / 512)
        };

        const tileRegionSize = Math.ceil(tileBlockSize / 512);

        for (let x = tileRegionPoint.x; x < tileRegionPoint.x + tileRegionSize; x++) {
            for (let z = tileRegionPoint.z; z < tileRegionPoint.z + tileRegionSize; z++) {
                const group = {
                    x: Math.floor(x / 32),
                    z: Math.floor(z / 32)
                };

                const regionMap = this.regionMap.find(e => e.x == group.x && e.z == group.z);

                if (regionMap) {
                    const relX = x - group.x * 32;
                    const relZ = z - group.z * 32;
                    const inx = relZ * 32 + relX;

                    var b = regionMap.m[Math.floor(inx / 32)];
                    var bit = inx % 32;

                    if ((b & (1 << bit)) != 0) return true;
                }
            }
        }
        return false;
    }
}

class RedDotMarker {

    #source;
    #layer;
    #map;
    #dataProjection;
    #viewProjection;

    constructor(map, dataProjection, viewProjection) {
        this.#map = map;
        this.#dataProjection = dataProjection;
        this.#viewProjection = viewProjection;

        this.#source = new ol.source.Vector({ features: [] });

        this.#layer = new ol.layer.Vector({
            source: this.#source,
            zIndex: 1000
        });

        this.#map.addLayer(this.#layer);

        window.addEventListener('hashchange', () => {
            this.#hashChanged(window.location.href);
        });

        this.#hashChanged(window.location.href);
    }

    getCoordinates() {
        return RedDotMarker.getCoordinatesFromUrlHash(window.location.hash);
    }

    static getCoordinatesFromUrlHash(hash) {
        if (!hash || hash.length <= 1) return undefined;

        const q = new URLSearchParams(hash.substring(1));
        const rx = q.get('rx');
        const rz = q.get('rz');

        if (!rx || !rz) return undefined;

        return [parseInt(rx), parseInt(rz)];
    }

    setCoordinates(coordinates) {
        const url = new URL(window.location.href);

        if (!coordinates) {
            url.hash = '';
        } else {
            url.hash = `rx=${coordinates[0]}&rz=${coordinates[1]}`;
        }

        window.location.replace(url);
    }

    #hashChanged(newURL) {
        const c = RedDotMarker.getCoordinatesFromUrlHash(new URL(newURL).hash);
        this.#setRedDotMarker(c);
    }

    #setRedDotMarker(coordinates) {
        this.#source.clear();

        if (!coordinates) return;

        const marker = new ol.Feature({
            geometry: new ol.geom.Point(
                ol.proj.transform(coordinates, this.#dataProjection, this.#viewProjection)
            )
        });

        marker.setStyle(new ol.style.Style({
            image: new ol.style.Circle({
                radius: 6,
                fill: new ol.style.Fill({ color: 'red' }),
                stroke: new ol.style.Stroke({ color: '#fff', width: 2 })
            })
        }));

        this.#source.addFeature(marker);
    }
}

class Unmined {

    olMap = null;
    viewProjection = null;
    dataProjection = null;

    markersLayer = null;
    playerMarkersLayer = null;

    routeStart = null;
    routeLayer = null;

    constructor(mapElement, options, regions) {

        const worldTileSize = 256;

        this.options = options;

        const worldMinX = options.minRegionX * 512;
        const worldMinZ = options.minRegionZ * 512;
        const worldWidth = (options.maxRegionX + 1 - options.minRegionX) * 512;
        const worldHeight = (options.maxRegionZ + 1 - options.minRegionZ) * 512;

        this.regionMap = new RegionMap(
            regions,
            worldTileSize,
            worldMinX,
            worldMinZ,
            worldWidth,
            worldHeight
        );

        const dpiScale = window.devicePixelRatio ?? 1;

        this.#initProjections();

        const mapExtent = ol.proj.transformExtent(
            ol.extent.boundingExtent([
                [worldMinX, worldMinZ],
                [worldMinX + worldWidth, worldMinZ + worldHeight]
            ]),
            this.dataProjection,
            this.viewProjection
        );

        const tileGrid = new ol.tilegrid.TileGrid({
            extent: mapExtent,
            origin: [0, 0],
            resolutions: new Array(10).fill(1).map((_, i) => Math.pow(2, i)),
            tileSize: worldTileSize / dpiScale
        });

        const layer = new ol.layer.Tile({
            source: new ol.source.XYZ({
                tileUrlFunction: (coord) => {
                    return `tiles/${coord[0]}/${coord[1]}/${coord[2]}.png`;
                }
            })
        });

        this.olMap = new ol.Map({
            target: mapElement,
            layers: [layer],
            view: new ol.View({
                center: [0, 0],
                zoom: 2
            })
        });

        // ESC CLEAR ROUTE
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                this.clearRoute();
                console.log("Route cleared");
            }
        });
    }

    /* ================= ROUTE SYSTEM ================= */

    handleRouteClick(marker) {

        const coords = ol.proj.transform(
            [marker.x, marker.z],
            this.dataProjection,
            this.viewProjection
        );

        if (!this.routeStart) {
            this.routeStart = coords;
            return;
        }

        this.drawRouteAnimated(this.routeStart, coords);
        this.routeStart = null;
    }

    createRouteLayer() {

        if (this.routeLayer) {
            this.olMap.removeLayer(this.routeLayer);
        }

        const source = new ol.source.Vector();

        this.routeLayer = new ol.layer.Vector({
            source: source,
            zIndex: 9999,
            style: new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: "#4285F4",
                    width: 4
                })
            })
        });

        this.olMap.addLayer(this.routeLayer);

        return source;
    }

    drawRouteAnimated(start, end) {

        const source = this.createRouteLayer();

        const steps = 80;
        let i = 0;
        const coords = [];

        const interval = setInterval(() => {

            i++;
            const t = i / steps;

            const x = start[0] + (end[0] - start[0]) * t;
            const y = start[1] + (end[1] - start[1]) * t;

            coords.push([x, y]);

            source.clear();

            source.addFeature(new ol.Feature({
                geometry: new ol.geom.LineString(coords)
            }));

            if (i >= steps) clearInterval(interval);

        }, 10);
    }

    clearRoute() {
        this.routeStart = null;

        if (this.routeLayer) {
            this.olMap.removeLayer(this.routeLayer);
            this.routeLayer = null;
        }
    }

    /* ================= PROJECTIONS ================= */

    #initProjections() {

        this.viewProjection = new ol.proj.Projection({
            code: 'VIEW',
            units: 'degrees'
        });

        this.dataProjection = new ol.proj.Projection({
            code: 'DATA',
            units: 'pixels'
        });

        ol.proj.addCoordinateTransforms(
            this.viewProjection,
            this.dataProjection,
            c => c,
            c => c
        );
    }
}
