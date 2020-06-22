import { Component, OnInit } from '@angular/core';
import { MapService } from 'src/app/services/map.service';

@Component({
  selector: 'app-map-page',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit {
  constructor(public mapService: MapService) {}

  ngOnInit() {}

  public toggleFirstLayer() {
    const newState = !this.mapService.state.layers[0].active;
    this.mapService.state.layers[0].active = newState;
  }
}
