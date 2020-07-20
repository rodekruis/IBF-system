import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { OverviewPage } from "./overview.page";

const routes: Routes = [
    {
        path: "",
        component: OverviewPage,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class OverviewPageRoutingModule {}
