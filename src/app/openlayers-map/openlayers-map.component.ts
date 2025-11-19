import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
import MVTFormat from 'ol/format/MVT';
import { fromLonLat, transformExtent } from 'ol/proj';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Style, Fill, Stroke, Circle as CircleStyle, Text } from 'ol/style';
import Overlay from 'ol/Overlay';
import { ScaleLine, Attribution, Zoom } from 'ol/control';

@Component({
  selector: 'app-openlayers-map',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './openlayers-map.component.html',
  styleUrl: './openlayers-map.component.css'
})
export class OpenlayersMapComponent implements OnInit, AfterViewInit, OnDestroy {
  private map!: Map;
  private markersLayer!: VectorLayer<VectorSource>;
  private popupOverlay!: Overlay;

  // ESRI Service Configuration - Vector Tile Service (3857 version)
  private readonly esriVectorUrl = 'https://geotrans.itc.gov.ae/server/rest/services/Hosted/StreetMap_3857_Vector_Y_EN/VectorTileServer';
  private readonly esriToken = 'mIDXSz_8ZTzhEckOc4H8oTdsYqE2QnVuF9ukRnhajouh4jh0xs9yB4mEy3mgcp4G4ONv1xDIdTNbVHai2FXj9jUBa1M0fFCM2qn67IH6eD9ERUnoE3bg7deTGTJfCkWZJaKgA4aIIdqNkj5GHwRUIMQJvwGwwLskdQufEyPbBONVm0TV481Bj6l4Hoh-eiHa';

  // Default center coordinates (Abu Dhabi area)
  private readonly defaultCenter: [number, number] = [54.3773, 24.4539]; // [lng, lat]
  private readonly defaultZoom = 11;

  ngOnInit(): void {
    // Component initialization
  }

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.setTarget(undefined);
    }
  }

  private async initializeMap(): Promise<void> {
    try {
      // Create vector tile layer from ESRI service
      const vectorTileLayer = new VectorTileLayer({
        source: new VectorTileSource({
          format: new MVTFormat(),
          url: `${this.esriVectorUrl}/tile/{z}/{y}/{x}.pbf?token=${this.esriToken}`,
          maxZoom: 18
        }),
        // Basic styling for vector tiles
        style: this.createVectorStyle()
      });

      // Create markers layer
      this.markersLayer = new VectorLayer({
        source: new VectorSource(),
        style: this.createMarkerStyle()
      });

      // Create popup element
      const popupElement = document.getElementById('ol-popup');
      if (popupElement) {
        this.popupOverlay = new Overlay({
          element: popupElement,
          autoPan: {
            animation: {
              duration: 250
            }
          }
        });
      }

      // Create the map
      this.map = new Map({
        target: 'openlayers-map',
        layers: [
          vectorTileLayer,
          this.markersLayer
        ],
        view: new View({
          center: fromLonLat(this.defaultCenter),
          zoom: this.defaultZoom,
          minZoom: 3,
          maxZoom: 18
        }),
        controls: [
          new Zoom(),
          new ScaleLine({
            units: 'metric'
          }),
          new Attribution({
            collapsible: false
          })
        ]
      });

      // Add popup overlay
      if (this.popupOverlay) {
        this.map.addOverlay(this.popupOverlay);
      }

      // Add click handler for popups
      this.map.on('click', (evt) => {
        const feature = this.map.forEachFeatureAtPixel(evt.pixel, (feature) => feature);
        if (feature && feature.get('popupContent')) {
          const coordinates = (feature.getGeometry() as Point).getCoordinates();
          const popupElement = document.getElementById('ol-popup-content');
          if (popupElement) {
            popupElement.innerHTML = feature.get('popupContent');
          }
          this.popupOverlay?.setPosition(coordinates);
        } else {
          this.popupOverlay?.setPosition(undefined);
        }
      });

      // Change cursor on hover
      this.map.on('pointermove', (evt) => {
        const pixel = this.map.getEventPixel(evt.originalEvent);
        const hit = this.map.hasFeatureAtPixel(pixel);
        const target = this.map.getTarget() as HTMLElement;
        target.style.cursor = hit ? 'pointer' : '';
      });

      console.log('OpenLayers map loaded successfully');

      // Add initial markers
      this.addInitialMarkers();

    } catch (error) {
      console.error('Error initializing OpenLayers map:', error);
    }
  }

  private createVectorStyle(): Style {
    // Basic style for vector tiles - you may need to customize based on layer data
    return new Style({
      fill: new Fill({
        color: 'rgba(200, 200, 200, 0.3)'
      }),
      stroke: new Stroke({
        color: '#666',
        width: 1
      })
    });
  }

  private createMarkerStyle(): Style {
    return new Style({
      image: new CircleStyle({
        radius: 8,
        fill: new Fill({
          color: '#3388ff'
        }),
        stroke: new Stroke({
          color: '#fff',
          width: 2
        })
      })
    });
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

    // Fit view to show all markers
    if (points.length > 0) {
      const extent = this.markersLayer.getSource()?.getExtent();
      if (extent && extent[0] !== Infinity) {
        this.map.getView().fit(extent, {
          padding: [50, 50, 50, 50],
          maxZoom: 14
        });
      }
    }
  }

  // Add a marker
  addMarker(lat: number, lng: number): Feature {
    const feature = new Feature({
      geometry: new Point(fromLonLat([lng, lat]))
    });
    this.markersLayer.getSource()?.addFeature(feature);
    return feature;
  }

  // Add a marker with popup
  addMarkerWithPopup(lat: number, lng: number, popupContent: string): Feature {
    const feature = new Feature({
      geometry: new Point(fromLonLat([lng, lat])),
      popupContent: popupContent
    });
    this.markersLayer.getSource()?.addFeature(feature);
    return feature;
  }

  // Remove a marker
  removeMarker(feature: Feature): void {
    this.markersLayer.getSource()?.removeFeature(feature);
  }

  // Clear all markers
  clearMarkers(): void {
    this.markersLayer.getSource()?.clear();
  }

  // Get all markers
  getMarkers(): Feature[] {
    return this.markersLayer.getSource()?.getFeatures() || [];
  }

  // Get map instance
  getMap(): Map {
    return this.map;
  }

  // Close popup
  closePopup(): void {
    this.popupOverlay?.setPosition(undefined);
  }
}
