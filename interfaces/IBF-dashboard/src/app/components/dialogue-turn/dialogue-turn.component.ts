import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-dialogue-turn',
  templateUrl: './dialogue-turn.component.html',
  styleUrls: ['./dialogue-turn.component.scss'],
  standalone: false,
})
export class DialogueTurnComponent {
  @Input()
  firstIssuedDate: string;

  @Input()
  isLastUploadDateLate = false;

  @Input()
  isSelected = false;

  @Input()
  borderColor = null;

  public mouseOver = false;
}
