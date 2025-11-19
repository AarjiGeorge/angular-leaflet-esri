import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import * as esri from 'esri-leaflet';

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

  // Default center coordinates (Abu Dhabi area)
  private readonly defaultCenter: L.LatLngExpression = [24.4539, 54.3773];
  private readonly defaultZoom = 12;

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
    // Create the map
    this.map = L.map('map', {
      center: this.defaultCenter,
      zoom: this.defaultZoom,
      zoomControl: true
    });

    // Add ESRI TiledMapLayer with token authentication
    const esriTiledLayer = (esri as any).tiledMapLayer({
      url: this.esriMapServerUrl,
      token: this.esriToken,
      maxZoom: 18,
      minZoom: 1
    });

    esriTiledLayer.addTo(this.map);

    // Add error handling for the layer
    esriTiledLayer.on('tileerror', (error: any) => {
      console.error('Tile loading error:', error);
    });

    // Add scale control
    L.control.scale({
      imperial: false,
      metric: true,
      position: 'bottomleft'
    }).addTo(this.map);

    // Add attribution
    this.map.attributionControl.addAttribution('Map data &copy; <a href="https://geotrans.itc.gov.ae">ITC GeoTrans</a>');
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
