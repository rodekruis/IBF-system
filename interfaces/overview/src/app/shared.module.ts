import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { IonicModule } from '@ionic/angular';
import { LoginFormComponent } from './components/login-form/login-form.component';
import { MapComponent } from './components/map/map.component';
import { MatrixComponent } from './components/matrix/matrix.component';
import { TimelineComponent } from './components/timeline/timeline.component';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, LeafletModule],
  declarations: [LoginFormComponent, MapComponent, MatrixComponent, TimelineComponent],
  exports: [LoginFormComponent, MapComponent, MatrixComponent, TimelineComponent],
})
export class SharedModule {}
