import { AfterViewInit, Component, Input } from '@angular/core';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-dialogue-turn',
  templateUrl: './dialogue-turn.component.html',
  styleUrls: ['./dialogue-turn.component.scss'],
})
export class DialogueTurnComponent implements AfterViewInit {
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
  isSelected = false;

  @Input()
  isOpeningBubble = false;

  @Input()
  borderColor = null;

  public isSystem: boolean;

  public animate = false;

  public mouseOver = false;

  ngAfterViewInit(): void {
    this.isSelected = false;
    this.mouseOver = false;
  }

  show() {
    this.isSpoken = true;
  }

  onMouseOver() {
    this.mouseOver = true;
  }
  onMouseOut() {
    this.mouseOver = false;
  }
}
