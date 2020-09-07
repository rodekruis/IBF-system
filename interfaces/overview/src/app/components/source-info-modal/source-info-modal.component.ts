import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-source-info-modal',
  templateUrl: './source-info-modal.component.html',
  styleUrls: ['./source-info-modal.component.scss'],
})
export class SourceInfoModalComponent implements OnInit {
  @Input() indicator = { label: 'label' };

  constructor() {}

  ngOnInit() {}
}
