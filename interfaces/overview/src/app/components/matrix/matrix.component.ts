import { Component, OnInit } from "@angular/core";
import { MapService } from "src/app/services/map.service";

@Component({
    selector: "app-matrix",
    templateUrl: "./matrix.component.html",
    styleUrls: ["./matrix.component.scss"],
})
export class MatrixComponent implements OnInit {
    constructor(public mapService: MapService) {}

    ngOnInit() {}

    public updateLayer(name: string, state: boolean): void {
        this.mapService.setLayerState(name, state);
    }
}
