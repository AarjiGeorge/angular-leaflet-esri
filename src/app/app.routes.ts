import { Routes } from '@angular/router';
import { MapComponent } from './map/map.component';
import { MaplibreMapComponent } from './maplibre-map/maplibre-map.component';
import { OpenlayersMapComponent } from './openlayers-map/openlayers-map.component';

export const routes: Routes = [
  { path: '', component: MapComponent },
  { path: 'maplibre', component: MaplibreMapComponent },
  { path: 'openlayers', component: OpenlayersMapComponent },
  { path: '**', redirectTo: '' }
];
