import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-source-info-modal',
  templateUrl: './source-info-modal.page.html',
  styleUrls: ['./source-info-modal.page.scss'],
})
export class SourceInfoModalPage implements OnInit {
  @Input() indicator = {};

  constructor() {}

  ngOnInit() {}
}
