import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import * as esriVector from 'esri-leaflet-vector';

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  private map!: L.Map;
  private markersLayer!: L.LayerGroup;

  // ESRI Service Configuration - Vector Tile Service (4326 version)
  private readonly esriVectorUrl = 'https://geotrans.itc.gov.ae/server/rest/services/Hosted/StreetMap_4326_Vector_Y_EN/VectorTileServer';
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
    // Create the map with constrained zoom levels to match service LODs
    this.map = L.map('map', {
      center: this.defaultCenter,
      zoom: this.defaultZoom,
      zoomControl: true,
      minZoom: 3,
      maxZoom: 18,
      // Force integer zoom levels to match service LODs
      zoomSnap: 1,
      zoomDelta: 1
    });

    // Add ESRI Vector Tile Layer
    const vectorTileLayer = (esriVector as any).vectorTileLayer(this.esriVectorUrl, {
      token: this.esriToken,
      // Fetch service style for better rendering
      style: (style: any) => {
        return style;
      }
    });

    vectorTileLayer.addTo(this.map);

    // Add error handling
    vectorTileLayer.on('tileerror', (error: any) => {
      console.error('Tile loading error:', error);
    });

    vectorTileLayer.on('load', () => {
      console.log('Vector tiles loaded successfully');
    });

    // Add scale control
    L.control.scale({
      imperial: false,
      metric: true,
      position: 'bottomleft'
    }).addTo(this.map);

    // Add attribution
    this.map.attributionControl.addAttribution('Map data &copy; <a href="https://geotrans.itc.gov.ae">ITC GeoTrans</a>');

    // Create markers layer group and add to map
    this.markersLayer = L.layerGroup().addTo(this.map);

    // Add initial markers
    this.addInitialMarkers();
  }

  private addInitialMarkers(): void {
    const points = [
      { lat: 24.343996414082213, lng: 54.5183938857978 },
      { lat: 24.39934657885083, lng: 54.51953626176326 },
      { lat: 24.374956742038435, lng: 54.475590949263186 },
      { lat: 24.368389443466242, lng: 54.54734540482967 }
    ];

    // Add markers for each point
    points.forEach((point, index) => {
      this.addMarkerWithPopup(
        point.lat,
        point.lng,
        `<b>Point ${index + 1}</b><br>Lat: ${point.lat.toFixed(6)}<br>Lng: ${point.lng.toFixed(6)}`
      );
    });

    // Fit map bounds to show all markers
    if (points.length > 0) {
      const bounds = L.latLngBounds(points.map(p => [p.lat, p.lng] as L.LatLngTuple));
      this.map.fitBounds(bounds, { padding: [50, 50] });
    }
  }

  // Get the markers layer group
  getMarkersLayer(): L.LayerGroup {
    return this.markersLayer;
  }

  // Add a marker to the markers layer
  addMarker(lat: number, lng: number, options?: L.MarkerOptions): L.Marker {
    const marker = L.marker([lat, lng], options);
    this.markersLayer.addLayer(marker);
    return marker;
  }

  // Add a marker with popup
  addMarkerWithPopup(lat: number, lng: number, popupContent: string, options?: L.MarkerOptions): L.Marker {
    const marker = this.addMarker(lat, lng, options);
    marker.bindPopup(popupContent);
    return marker;
  }

  // Remove a specific marker from the layer
  removeMarker(marker: L.Marker): void {
    this.markersLayer.removeLayer(marker);
  }

  // Clear all markers from the layer
  clearMarkers(): void {
    this.markersLayer.clearLayers();
  }

  // Get all markers in the layer
  getMarkers(): L.Marker[] {
    const markers: L.Marker[] = [];
    this.markersLayer.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        markers.push(layer);
      }
    });
    return markers;
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
