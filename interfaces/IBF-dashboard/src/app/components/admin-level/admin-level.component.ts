import { Component } from '@angular/core';
import {
  AnalyticsEvent,
  AnalyticsPage,
} from 'src/app/analytics/analytics.enum';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { AdminLevelService } from 'src/app/services/admin-level.service';
import { EventService } from 'src/app/services/event.service';
import { MapService } from 'src/app/services/map.service';
import { AdminLevel } from 'src/app/types/admin-level';
import { IbfLayerGroup, IbfLayerName } from 'src/app/types/ibf-layer';

@Component({
  selector: 'app-admin-level',
  templateUrl: './admin-level.component.html',
  styleUrls: ['./admin-level.component.scss'],
})
export class AdminLevelComponent {
  public adminLevel = AdminLevel;

  constructor(
    public adminLevelService: AdminLevelService,
    private mapService: MapService,
    private analyticsService: AnalyticsService,
    private eventService: EventService,
  ) {}

  setAdminLevelClick(adminLevel: number, state: boolean): void {
    this.analyticsService.logEvent(AnalyticsEvent.adminLevel, {
      adminLevel,
      adminLevelState: state,
      page: AnalyticsPage.dashboard,
      isActiveEvent: this.eventService.state.activeEvent,
      isActiveTrigger: this.eventService.state.activeTrigger,
      component: this.constructor.name,
    });

    this.setAdminLevel(adminLevel, state);
  }

  setAdminLevel(adminLevel: number, state: boolean): void {
    if (this.adminLevelService.adminLevel === adminLevel) {
      this.mapService.updateLayer(IbfLayerName.adminRegions, state, true);
      const activeLayerName = this.mapService.layers.find(
        (l) => l.active && l.group === IbfLayerGroup.aggregates,
      )?.name;
      if (activeLayerName) {
        this.mapService.updateLayer(IbfLayerName[activeLayerName], state, true);
        this.mapService.activeLayerName = activeLayerName;
      } else if (this.mapService.activeLayerName) {
        this.mapService.updateLayer(
          IbfLayerName[this.mapService.activeLayerName],
          state,
          true,
        );
      }
      this.adminLevelService.adminLayerState = !this.adminLevelService
        .adminLayerState;
    } else {
      this.adminLevelService.setAdminLevel(adminLevel);
    }
  }

  getSelectedAdminLevel() {
    return this.adminLevelService.adminLevel;
  }

  public getAdminLevelLabel(adminLevel: AdminLevel): string {
    return this.adminLevelService.adminLevelLabel
      ? this.adminLevelService.adminLevelLabel[AdminLevel[adminLevel]]
      : `Admin Level ${adminLevel}`;
  }
}
