import { Component, OnInit } from '@angular/core';
import { TimelineService } from 'src/app/services/timeline.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit {
  public leadTime: string;
  public trigger: boolean;

  constructor(private timelineService: TimelineService) {}

  async ngOnInit() {
    const timestep = this.timelineService.state.selectedTimeStepButtonValue;
    this.trigger = await this.timelineService.getTrigger(timestep);
    this.leadTime = timestep.replace('-day', ' days from today');
  }
}
