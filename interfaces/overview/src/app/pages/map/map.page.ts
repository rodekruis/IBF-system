import { Component, OnInit } from '@angular/core';
import { MapService } from 'src/app/services/map.service';

@Component({
  selector: 'app-map-page',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit {
  public stations = [];

  constructor(public mapService: MapService) {}

  ngOnInit() {}

  public toggleFirstLayer() {
    const newState = !this.mapService.state.layers[0].active;
    this.mapService.state.layers[0].active = newState;
  }

  public async getStations() {
    const leadTime = '7-day';
    this.stations = await this.mapService.getStations(leadTime);
  }
}
