import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { IonicModule } from '@ionic/angular';
import { AggregatesComponent } from './components/aggregates/aggregates.component';
import { LoginFormComponent } from './components/login-form/login-form.component';
import { MapComponent } from './components/map/map.component';
import { MatrixComponent } from './components/matrix/matrix.component';
import { TimelineComponent } from './components/timeline/timeline.component';
import { ChatComponent } from './components/chat/chat.component';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, LeafletModule],
  declarations: [
    LoginFormComponent,
    MapComponent,
    MatrixComponent,
    TimelineComponent,
    AggregatesComponent,
    ChatComponent,
  ],
  exports: [
    LoginFormComponent,
    MapComponent,
    MatrixComponent,
    TimelineComponent,
    AggregatesComponent,
    ChatComponent,
  ],
})
export class SharedModule {}
