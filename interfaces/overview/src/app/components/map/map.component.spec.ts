import { HttpClientTestingModule } from "@angular/common/http/testing";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { LeafletModule } from "@asymmetrik/ngx-leaflet";
import { IonicModule } from "@ionic/angular";
import { MapService } from "src/app/services/map.service";
import { MapComponent } from "./map.component";

describe("MapComponent", () => {
    let component: MapComponent;
    let fixture: ComponentFixture<MapComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MapComponent],
            imports: [
                IonicModule.forRoot(),
                HttpClientTestingModule,
                LeafletModule,
            ],
            providers: [{ provide: MapService }],
        }).compileComponents();

        fixture = TestBed.createComponent(MapComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
