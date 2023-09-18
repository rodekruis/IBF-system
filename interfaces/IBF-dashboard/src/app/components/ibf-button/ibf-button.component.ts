import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-ibf-button',
  templateUrl: './ibf-button.component.html',
  styleUrls: ['./ibf-button.component.scss'],
})
export class IbfButtonComponent implements OnInit {
  @Input()
  public backgroundColor = 'primary';

  @Input()
  public borderColor = this.backgroundColor;

  @Input()
  public textColor = 'ibf-white';

  @Input()
  public strong = 'false';

  @Input()
  public size = 'default';

  @Input()
  public disabled = false;

  @Input()
  public type = 'button';

  @Input()
  public width: string = null;

  public style = '';

  constructor() {}

  ngOnInit() {
    this.style += `
    ${this.width ? 'width: ' + this.width + ';' : ''}
    --background: var(--ion-color-${this.backgroundColor});
    --border-color: var(--ion-color-${this.borderColor});
    --border-width: 2px;
    --border-style: solid;
    --color: var(--ion-color-${this.textColor});
    --box-shadow: none;
    `;
  }
}
