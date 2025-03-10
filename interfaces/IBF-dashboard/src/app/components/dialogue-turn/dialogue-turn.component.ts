import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-dialogue-turn',
  templateUrl: './dialogue-turn.component.html',
  styleUrls: ['./dialogue-turn.component.scss'],
  standalone: false,
})
export class DialogueTurnComponent implements OnChanges {
  @Input()
  isSpoken = false;

  @Input()
  firstIssuedDate: string;

  @Input()
  isWarn = false;

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

  show() {
    this.isSpoken = true;
  }

  ngOnChanges(): void {
    if (!this.isSelected) {
      this.mouseOver = false;
    }
  }

  public onMouseOver() {
    this.mouseOver = true;
  }
  public onMouseOut() {
    this.mouseOver = false;
  }
}
