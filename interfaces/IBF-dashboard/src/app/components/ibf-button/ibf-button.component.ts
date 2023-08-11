import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-ibf-button',
  templateUrl: './ibf-button.component.html',
  styleUrls: ['./ibf-button.component.scss'],
})
export class IbfButtonComponent implements OnInit {
  @Input()
  backgroundColor: string = 'primary';

  @Input()
  borderColor: string = this.backgroundColor;

  @Input()
  textColor: string = 'ibf-white';

  @Input()
  strong: string = 'false';

  @Input()
  size: string = 'default';

  public style: string = '';

  constructor() {}

  ngOnInit() {
    this.style += `
    display: block;
    --width: 100%;
    --background: var(--ion-color-${this.backgroundColor});
    --border-color: var(--ion-color-${this.borderColor});
    --border-width: 2px;
    --border-style: solid;
    --color: var(--ion-color-${this.textColor});
    --box-shadow: none;
    `;
  }
}
