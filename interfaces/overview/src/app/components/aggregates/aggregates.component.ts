import { Component } from '@angular/core';
import { AggregatesService } from 'src/app/services/aggregates.service';

@Component({
  selector: 'app-aggregates',
  templateUrl: './aggregates.component.html',
  styleUrls: ['./aggregates.component.scss'],
})
export class AggregatesComponent {
  constructor(public aggregatesService: AggregatesService) {}
}
