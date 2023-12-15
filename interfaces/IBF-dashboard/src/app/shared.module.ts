import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { LeafletMarkerClusterModule } from '@asymmetrik/ngx-leaflet-markercluster';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { AnalyticsModule } from './analytics/analytics.module';
import { AboutBtnComponent } from './components/about-btn/about-btn.component';
import { ActionResultPopoverComponent } from './components/action-result-popover/action-result-popover.component';
import { ActivationLogButtonComponent } from './components/activation-log-button/activation-log-button.component';
import { AdminLevelComponent } from './components/admin-level/admin-level.component';
import { AggregatesComponent } from './components/aggregates/aggregates.component';
import { AreasOfFocusSummaryComponent } from './components/areas-of-focus-summary/areas-of-focus-summary.component';
import { ChangePasswordPopoverComponent } from './components/change-password-popover/change-password-popover.component';
import { ChatComponent } from './components/chat/chat.component';
import { CommunityNotificationPhotoPopupComponent } from './components/community-notification-photo-popup/community-notification-photo-popup.component';
import { CommunityNotificationPopupComponent } from './components/community-notification-popup/community-notification-popup.component';
import { CountrySwitcherComponent } from './components/country-switcher/country-switcher.component';
import { DateButtonComponent } from './components/date-button/date-button.component';
import { DialogueTurnComponent } from './components/dialogue-turn/dialogue-turn.component';
import { DisasterTypeComponent } from './components/disaster-type/disaster-type.component';
import { DisclaimerToolbarComponent } from './components/disclaimer-toolbar/disclaimer-toolbar.component';
import { EventSpeechBubbleComponent } from './components/event-speech-bubble/event-speech-bubble.component';
import { EventSwitcherComponent } from './components/event-switcher/event-switcher.component';
import { ExportViewPopoverComponent } from './components/export-view-popover/export-view-popover.component';
import { ExportViewComponent } from './components/export-view/export-view.component';
import { ForgotPasswordPopoverComponent } from './components/forgot-password-popover/forgot-password-popover.component';
import { IbfButtonComponent } from './components/ibf-button/ibf-button.component';
import { IbfGuideButtonComponent } from './components/ibf-guide-button/ibf-guide-button.component';
import { IbfGuidePopoverComponent } from './components/ibf-guide-popover/ibf-guide-popover.component';
import { LayerControlInfoPopoverComponent } from './components/layer-control-info-popover/layer-control-info-popover.component';
import { DynamicPointPopupComponent } from './components/leaflet-popup/dynamic-point-popup/dynamic-point-popup.component';
import { GlofasStationPopupContentComponent } from './components/leaflet-popup/glofas-station-popup-content/glofas-station-popup-content.component';
import { RiverGaugePopupContentComponent } from './components/leaflet-popup/river-gauge-popup-content/river-gauge-popup-content.component';
import { ThresholdBarComponent } from './components/leaflet-popup/threshold-bar/threshold-bar.component';
import { TyphoonTrackpointPopupContentComponent } from './components/leaflet-popup/typhoon-trackpoint-popup-content/typhoon-trackpoint-popup-content.component';
import { LoginFormComponent } from './components/login-form/login-form.component';
import { LogosComponent } from './components/logos/logos.component';
import { MapControlsComponent } from './components/map-controls/map-controls.component';
import { MapComponent } from './components/map/map.component';
import { MatrixComponent } from './components/matrix/matrix.component';
import { ScreenOrientationPopoverComponent } from './components/screen-orientation-popover/screen-orientation-popover.component';
import { TimelineComponent } from './components/timeline/timeline.component';
import { TimestampComponent } from './components/timestamp/timestamp.component';
import { ToggleTriggerPopoverComponent } from './components/toggle-trigger-popover/toggle-trigger-popover.component';
import { TooltipPopoverComponent } from './components/tooltip-popover/tooltip-popover.component';
import { TooltipComponent } from './components/tooltip/tooltip.component';
import { UserStateComponent } from './components/user-state/user-state.component';
import { BackendMockScenarioComponent } from './mocks/backend-mock-scenario-component/backend-mock-scenario.component';
@NgModule({
  imports: [
    AnalyticsModule,
    CommonModule,
    FormsModule,
    IonicModule,
    LeafletMarkerClusterModule,
    LeafletModule,
    TranslateModule,
  ],
  declarations: [
    AboutBtnComponent,
    ActionResultPopoverComponent,
    ActivationLogButtonComponent,
    AdminLevelComponent,
    AggregatesComponent,
    AreasOfFocusSummaryComponent,
    BackendMockScenarioComponent,
    ChangePasswordPopoverComponent,
    ChatComponent,
    CommunityNotificationPhotoPopupComponent,
    CommunityNotificationPopupComponent,
    CountrySwitcherComponent,
    DateButtonComponent,
    DialogueTurnComponent,
    DisasterTypeComponent,
    DisclaimerToolbarComponent,
    EventSpeechBubbleComponent,
    EventSwitcherComponent,
    ExportViewComponent,
    ExportViewPopoverComponent,
    ForgotPasswordPopoverComponent,
    IbfButtonComponent,
    IbfGuideButtonComponent,
    IbfGuidePopoverComponent,
    LayerControlInfoPopoverComponent,
    LoginFormComponent,
    LogosComponent,
    MapComponent,
    MapControlsComponent,
    MatrixComponent,
    ScreenOrientationPopoverComponent,
    TimelineComponent,
    TimestampComponent,
    ToggleTriggerPopoverComponent,
    TooltipComponent,
    TooltipPopoverComponent,
    UserStateComponent,
    RiverGaugePopupContentComponent,
    ThresholdBarComponent,
    DynamicPointPopupComponent,
    TyphoonTrackpointPopupContentComponent,
    GlofasStationPopupContentComponent,
  ],
  exports: [
    AboutBtnComponent,
    ActionResultPopoverComponent,
    ActivationLogButtonComponent,
    AdminLevelComponent,
    AggregatesComponent,
    AreasOfFocusSummaryComponent,
    BackendMockScenarioComponent,
    ChangePasswordPopoverComponent,
    ChatComponent,
    CommunityNotificationPhotoPopupComponent,
    CommunityNotificationPopupComponent,
    CountrySwitcherComponent,
    DateButtonComponent,
    DialogueTurnComponent,
    DisasterTypeComponent,
    DisclaimerToolbarComponent,
    EventSpeechBubbleComponent,
    EventSwitcherComponent,
    ExportViewComponent,
    ExportViewPopoverComponent,
    ForgotPasswordPopoverComponent,
    IbfButtonComponent,
    IbfGuideButtonComponent,
    IbfGuidePopoverComponent,
    LayerControlInfoPopoverComponent,
    LoginFormComponent,
    LogosComponent,
    MapComponent,
    MapControlsComponent,
    MatrixComponent,
    ScreenOrientationPopoverComponent,
    TimelineComponent,
    TimestampComponent,
    ToggleTriggerPopoverComponent,
    TooltipComponent,
    TooltipPopoverComponent,
    TranslateModule,
    UserStateComponent,
    RiverGaugePopupContentComponent,
    ThresholdBarComponent,
    DynamicPointPopupComponent,
    TyphoonTrackpointPopupContentComponent,
    GlofasStationPopupContentComponent,
  ],
})
export class SharedModule {}
