import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-dialogue-turn',
  templateUrl: './dialogue-turn.component.html',
  styleUrls: ['./dialogue-turn.component.scss'],
  standalone: false,
})
export class DialogueTurnComponent implements OnChanges {
  @Input()
  firstIssuedDate: string;

  @Input()
  isLastUploadDateLate = false;

  @Input()
  isSelected = false;

  @Input()
  borderColor = null;

  public mouseOver = false;

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
