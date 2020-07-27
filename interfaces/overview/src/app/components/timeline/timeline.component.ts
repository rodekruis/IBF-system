import { Component } from '@angular/core';
import { TimelineService } from 'src/app/services/timeline.service';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
})
export class TimelineComponent {
  constructor(public timelineService: TimelineService) {}
}
