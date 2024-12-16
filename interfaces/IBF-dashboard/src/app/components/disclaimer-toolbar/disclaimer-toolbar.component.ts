import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-disclaimer-toolbar',
  templateUrl: './disclaimer-toolbar.component.html',
  styleUrls: ['./disclaimer-toolbar.component.scss'],
})
export class DisclaimerToolbarComponent {
  public environmentConfiguration = environment.configuration;
}
