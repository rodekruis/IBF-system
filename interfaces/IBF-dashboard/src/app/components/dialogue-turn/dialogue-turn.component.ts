import { Component, Input } from '@angular/core';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-dialogue-turn',
  templateUrl: './dialogue-turn.component.html',
  styleUrls: ['./dialogue-turn.component.scss'],
})
export class DialogueTurnComponent {
  @Input()
  isSpoken = false;

  @Input()
  timestamp: DateTime;

  @Input()
  isWarn = false;

  @Input()
  isStopped = false;

  @Input()
  isTriggered = false;

  @Input()
  isNotTriggered = false;

  @Input()
  isSelected = true;

  @Input()
  isOpeningBubble = false;

  isSystem: boolean;

  animate = false;

  show() {
    this.isSpoken = true;
  }
}
