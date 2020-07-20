import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { SharedModule } from "../../shared.module";
import { LoginPageRoutingModule } from "./login-routing.module";
import { LoginPage } from "./login.page";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        SharedModule,
        LoginPageRoutingModule,
    ],
    declarations: [LoginPage],
})
export class LoginPageModule {}
