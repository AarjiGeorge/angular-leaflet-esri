import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  private map!: L.Map;

  // ESRI Service Configuration
  private readonly esriMapServerUrl = 'https://geotrans.itc.gov.ae/server/rest/services/Basemaps/StreetMap_3857_Raster_Y_EN/MapServer';
  private readonly esriToken = 'OOAaWoN3772PFjfCsqBuYRfRIbajgQsJEE3HKznr73STKWx_9nKBbm27vfrQsI1rW-qxdJ7P4Whe17NXoGtQruRShshij09xMcwN01LAotc9S_6VlorCKAJIZjhQZaiRWBFKIknJWnBrUDM1qwZTFCq4vEOcGkftCWdkwzvWH1zoJkEOr_-HKPQK7lIb7Xtj';

  // Custom tiling scheme from service metadata
  private readonly tileInfo = {
    origin: { x: -20037700, y: 30241100 },
    tileSize: 256,
    // LOD resolutions from service
    lods: [
      { level: 0, resolution: 1322.9193125052918 },
      { level: 1, resolution: 793.7515875031751 },
      { level: 2, resolution: 529.1677250021168 },
      { level: 3, resolution: 396.87579375158754 },
      { level: 4, resolution: 264.5838625010584 },
      { level: 5, resolution: 158.75031750063502 },
      { level: 6, resolution: 79.37515875031751 },
      { level: 7, resolution: 39.687579375158755 },
      { level: 8, resolution: 32.94069088138176 },
      { level: 9, resolution: 26.458386250105836 },
      { level: 10, resolution: 21.16670900008467 },
      { level: 11, resolution: 15.875031750063501 },
      { level: 12, resolution: 10.583354500042335 },
      { level: 13, resolution: 7.9375158750317505 },
      { level: 14, resolution: 5.291677250021167 },
      { level: 15, resolution: 3.9687579375158752 },
      { level: 16, resolution: 2.6458386250105836 },
      { level: 17, resolution: 1.9843789687579376 },
      { level: 18, resolution: 1.3229193125052918 },
      { level: 19, resolution: 1.0583354500042335 },
      { level: 20, resolution: 0.7937515875031751 },
      { level: 21, resolution: 0.6614596562526459 },
      { level: 22, resolution: 0.5291677250021167 },
      { level: 23, resolution: 0.39687579375158755 },
      { level: 24, resolution: 0.26458386250105836 },
      { level: 25, resolution: 0.13229193125052918 }
    ]
  };

  // Default center coordinates (Abu Dhabi area)
  private readonly defaultCenter: L.LatLngExpression = [24.4539, 54.3773];
  private readonly defaultZoom = 10;

  ngOnInit(): void {
    // Component initialization
  }

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private initializeMap(): void {
    // Create custom CRS with the service's resolutions
    const resolutions = this.tileInfo.lods.map(lod => lod.resolution);

    const customCRS = L.Util.extend({}, L.CRS.EPSG3857, {
      scale: (zoom: number) => {
        return 1 / resolutions[zoom];
      },
      zoom: (scale: number) => {
        const res = 1 / scale;
        for (let i = 0; i < resolutions.length - 1; i++) {
          if (res >= resolutions[i]) {
            return i;
          }
        }
        return resolutions.length - 1;
      }
    });

    // Create the map
    this.map = L.map('map', {
      center: this.defaultCenter,
      zoom: this.defaultZoom,
      zoomControl: true,
      minZoom: 0,
      maxZoom: 25,
      crs: customCRS
    });

    // Create custom tile layer for ESRI service with custom origin
    const serviceUrl = this.esriMapServerUrl;
    const serviceToken = this.esriToken;

    const CustomEsriTileLayer = L.TileLayer.extend({
      getTileUrl: function(coords: L.Coords) {
        const zoom = coords.z;
        const resolution = resolutions[zoom];
        const tileSize = 256;

        // Convert Leaflet tile coords to ESRI tile coords using custom origin
        const originX = -20037700;
        const originY = 30241100;

        // Get the tile extent in meters
        const tileExtent = tileSize * resolution;

        // Convert Leaflet tile coordinates to world coordinates
        const leafletOriginX = -20037508.342787;
        const leafletOriginY = 20037508.342787;

        const tileMinX = leafletOriginX + coords.x * tileExtent;
        const tileMaxY = leafletOriginY - coords.y * tileExtent;

        // Convert to ESRI tile coordinates
        const col = Math.floor((tileMinX - originX) / tileExtent);
        const row = Math.floor((originY - tileMaxY) / tileExtent);

        return `${serviceUrl}/tile/${zoom}/${row}/${col}?token=${serviceToken}`;
      }
    });

    const esriLayer = new (CustomEsriTileLayer as any)(null, {
      attribution: 'Map data &copy; <a href="https://geotrans.itc.gov.ae">ITC GeoTrans</a>',
      crossOrigin: 'anonymous'
    });

    esriLayer.addTo(this.map);

    // Add error handling
    esriLayer.on('tileerror', (error: any) => {
      console.error('Tile loading error:', error);
      if (error.tile && error.tile.src) {
        console.error('Failed tile URL:', error.tile.src);
      }
    });

    esriLayer.on('tileload', () => {
      console.log('Tile loaded successfully');
    });

    // Add scale control
    L.control.scale({
      imperial: false,
      metric: true,
      position: 'bottomleft'
    }).addTo(this.map);
  }

  // Public method to get map instance
  getMap(): L.Map {
    return this.map;
  }

  // Method to set map view
  setView(lat: number, lng: number, zoom?: number): void {
    if (this.map) {
      this.map.setView([lat, lng], zoom || this.map.getZoom());
    }
  }

  // Method to fit bounds
  fitBounds(bounds: L.LatLngBoundsExpression): void {
    if (this.map) {
      this.map.fitBounds(bounds);
    }
  }
}
