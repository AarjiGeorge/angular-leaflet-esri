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

  // LOD resolutions from service metadata
  private readonly resolutions = [
    1322.9193125052918,
    793.7515875031751,
    529.1677250021168,
    396.87579375158754,
    264.5838625010584,
    158.75031750063502,
    79.37515875031751,
    39.687579375158755,
    32.94069088138176,
    26.458386250105836,
    21.16670900008467,
    15.875031750063501,
    10.583354500042335,
    7.9375158750317505,
    5.291677250021167,
    3.9687579375158752,
    2.6458386250105836,
    1.9843789687579376,
    1.3229193125052918,
    1.0583354500042335,
    0.7937515875031751,
    0.6614596562526459,
    0.5291677250021167,
    0.39687579375158755,
    0.26458386250105836,
    0.13229193125052918
  ];

  // ESRI tile origin
  private readonly esriOrigin = { x: -20037700, y: 30241100 };

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
    // Create the map with standard CRS
    this.map = L.map('map', {
      center: this.defaultCenter,
      zoom: this.defaultZoom,
      zoomControl: true,
      minZoom: 0,
      maxZoom: 25
    });

    // Create custom tile layer
    const serviceUrl = this.esriMapServerUrl;
    const serviceToken = this.esriToken;
    const resolutions = this.resolutions;
    const esriOrigin = this.esriOrigin;
    const mapRef = this.map;

    const CustomEsriTileLayer = L.TileLayer.extend({
      getTileUrl: function(coords: L.Coords) {
        const zoom = coords.z;
        const tileSize = 256;

        // Get resolution for this zoom level
        const resolution = resolutions[zoom] || resolutions[resolutions.length - 1];
        const tileExtent = tileSize * resolution;

        // Get the NW corner of this tile in pixel coordinates
        const nwPoint = coords.scaleBy(L.point(tileSize, tileSize));

        // Convert to lat/lng then to Web Mercator
        const nwLatLng = mapRef.unproject(nwPoint, zoom);

        // Convert lat/lng to Web Mercator meters
        const earthRadius = 6378137;
        const x = nwLatLng.lng * Math.PI / 180 * earthRadius;
        const y = Math.log(Math.tan((90 + nwLatLng.lat) * Math.PI / 360)) * earthRadius;

        // Calculate ESRI tile row/col from Web Mercator coordinates
        const col = Math.floor((x - esriOrigin.x) / tileExtent);
        const row = Math.floor((esriOrigin.y - y) / tileExtent);

        return `${serviceUrl}/tile/${zoom}/${row}/${col}?token=${serviceToken}`;
      }
    });

    const esriLayer = new (CustomEsriTileLayer as any)(null, {
      attribution: 'Map data &copy; <a href="https://geotrans.itc.gov.ae">ITC GeoTrans</a>',
      crossOrigin: 'anonymous',
      tileSize: 256
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
