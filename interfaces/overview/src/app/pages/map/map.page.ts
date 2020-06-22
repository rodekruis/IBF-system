import { Component, OnInit } from '@angular/core';
import { MapService } from 'src/app/services/map.service';
import { Station } from 'src/app/models/station.model';

@Component({
  selector: 'app-map-page',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit {
  public stations: Station[] = [];
  
  constructor(public mapService: MapService) {}

  ngOnInit() {}

  public async toggleFirstLayer() {
    const newState = !this.mapService.state.layers[0].active;
    this.mapService.state.layers[0].active = newState;
    if (newState) {
      this.stations = await this.mapService.getStations();
    } else {
      this.stations = [];
    }
  }


}
