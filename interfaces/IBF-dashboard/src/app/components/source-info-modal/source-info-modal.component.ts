import { Component, Input, OnInit } from '@angular/core';
import { Indicator } from 'src/app/types/indicator-group';

@Component({
  selector: 'app-source-info-modal',
  templateUrl: './source-info-modal.component.html',
  styleUrls: ['./source-info-modal.component.scss'],
})
export class SourceInfoModalComponent implements OnInit {
  @Input() indicator: Indicator;

  constructor() {}

  ngOnInit() {}
}
