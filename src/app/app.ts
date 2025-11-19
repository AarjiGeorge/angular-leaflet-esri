import { Component } from '@angular/core';
import { MapComponent } from './map/map.component';

@Component({
  selector: 'app-root',
  imports: [MapComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'Leaflet ESRI Map';
}
