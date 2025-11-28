import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ManagePage } from 'src/app/pages/manage/manage.page';
import { ManagePageRoutingModule } from 'src/app/pages/manage/manage-routing.module';
import { SharedModule } from 'src/app/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    ManagePageRoutingModule,
  ],
  declarations: [ManagePage],
})
export class ManagePageModule {}
