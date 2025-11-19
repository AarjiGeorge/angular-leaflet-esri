import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import maplibregl from 'maplibre-gl';

@Component({
  selector: 'app-maplibre-map',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './maplibre-map.component.html',
  styleUrl: './maplibre-map.component.css'
})
export class MaplibreMapComponent implements OnInit, AfterViewInit, OnDestroy {
  private map!: maplibregl.Map;
  private markers: maplibregl.Marker[] = [];

  // ESRI Service Configuration - Vector Tile Service (3857 version)
  private readonly esriVectorUrl = 'https://geotrans.itc.gov.ae/server/rest/services/Hosted/StreetMap_3857_Vector_Y_EN/VectorTileServer';
  private readonly esriToken = 'mIDXSz_8ZTzhEckOc4H8oTdsYqE2QnVuF9ukRnhajouh4jh0xs9yB4mEy3mgcp4G4ONv1xDIdTNbVHai2FXj9jUBa1M0fFCM2qn67IH6eD9ERUnoE3bg7deTGTJfCkWZJaKgA4aIIdqNkj5GHwRUIMQJvwGwwLskdQufEyPbBONVm0TV481Bj6l4Hoh-eiHa';

  // Default center coordinates (Abu Dhabi area)
  private readonly defaultCenter: [number, number] = [54.3773, 24.4539]; // [lng, lat] for MapLibre
  private readonly defaultZoom = 11;

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

  private async initializeMap(): Promise<void> {
    try {
      // Fetch the style from ESRI Vector Tile Service
      const styleUrl = `${this.esriVectorUrl}/resources/styles/root.json?token=${this.esriToken}`;
      const response = await fetch(styleUrl);
      const style = await response.json();

      // Update the style sources and sprite/glyphs URLs to include token
      if (style.sources) {
        Object.keys(style.sources).forEach(sourceName => {
          const source = style.sources[sourceName];
          if (source.tiles) {
            source.tiles = source.tiles.map((tile: string) => {
              if (tile.includes('?')) {
                return `${tile}&token=${this.esriToken}`;
              }
              return `${tile}?token=${this.esriToken}`;
            });
          }
          if (source.url) {
            if (source.url.includes('?')) {
              source.url = `${source.url}&token=${this.esriToken}`;
            } else {
              source.url = `${source.url}?token=${this.esriToken}`;
            }
          }
        });
      }

      // Update sprite URL
      if (style.sprite) {
        if (style.sprite.includes('?')) {
          style.sprite = `${style.sprite}&token=${this.esriToken}`;
        } else {
          style.sprite = `${style.sprite}?token=${this.esriToken}`;
        }
      }

      // Update glyphs URL
      if (style.glyphs) {
        if (style.glyphs.includes('?')) {
          style.glyphs = `${style.glyphs}&token=${this.esriToken}`;
        } else {
          style.glyphs = `${style.glyphs}?token=${this.esriToken}`;
        }
      }

      // Create the map
      this.map = new maplibregl.Map({
        container: 'maplibre-map',
        style: style,
        center: this.defaultCenter,
        zoom: this.defaultZoom,
        minZoom: 3,
        maxZoom: 18
      });

      // Add navigation controls
      this.map.addControl(new maplibregl.NavigationControl(), 'top-right');

      // Add scale control
      this.map.addControl(new maplibregl.ScaleControl({
        maxWidth: 200,
        unit: 'metric'
      }), 'bottom-left');

      // Add attribution
      this.map.addControl(new maplibregl.AttributionControl({
        customAttribution: 'Map data &copy; <a href="https://geotrans.itc.gov.ae">ITC GeoTrans</a>'
      }));

      // Wait for map to load then add markers
      this.map.on('load', () => {
        console.log('MapLibre GL map loaded successfully');
        this.addInitialMarkers();
      });

      this.map.on('error', (e) => {
        console.error('MapLibre GL error:', e);
      });

    } catch (error) {
      console.error('Error initializing MapLibre GL map:', error);
    }
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
      const popup = new maplibregl.Popup({ offset: 25 })
        .setHTML(`<b>Point ${index + 1}</b><br>Lat: ${point.lat.toFixed(6)}<br>Lng: ${point.lng.toFixed(6)}`);

      const marker = new maplibregl.Marker()
        .setLngLat([point.lng, point.lat])
        .setPopup(popup)
        .addTo(this.map);

      this.markers.push(marker);
    });

    // Fit bounds to show all markers
    if (points.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      points.forEach(point => {
        bounds.extend([point.lng, point.lat]);
      });
      this.map.fitBounds(bounds, { padding: 50 });
    }
  }

  // Add a marker
  addMarker(lat: number, lng: number): maplibregl.Marker {
    const marker = new maplibregl.Marker()
      .setLngLat([lng, lat])
      .addTo(this.map);
    this.markers.push(marker);
    return marker;
  }

  // Add a marker with popup
  addMarkerWithPopup(lat: number, lng: number, popupContent: string): maplibregl.Marker {
    const popup = new maplibregl.Popup({ offset: 25 })
      .setHTML(popupContent);

    const marker = new maplibregl.Marker()
      .setLngLat([lng, lat])
      .setPopup(popup)
      .addTo(this.map);

    this.markers.push(marker);
    return marker;
  }

  // Remove a marker
  removeMarker(marker: maplibregl.Marker): void {
    marker.remove();
    const index = this.markers.indexOf(marker);
    if (index > -1) {
      this.markers.splice(index, 1);
    }
  }

  // Clear all markers
  clearMarkers(): void {
    this.markers.forEach(marker => marker.remove());
    this.markers = [];
  }

  // Get all markers
  getMarkers(): maplibregl.Marker[] {
    return this.markers;
  }

  // Get map instance
  getMap(): maplibregl.Map {
    return this.map;
  }
}
