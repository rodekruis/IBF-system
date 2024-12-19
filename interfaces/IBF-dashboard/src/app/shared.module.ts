import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LeafletModule } from '@bluehalo/ngx-leaflet';
import { LeafletMarkerClusterModule } from '@bluehalo/ngx-leaflet-markercluster';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { AnalyticsModule } from 'src/app/analytics/analytics.module';
import { AboutBtnComponent } from 'src/app/components/about-btn/about-btn.component';
import { ActionResultPopoverComponent } from 'src/app/components/action-result-popover/action-result-popover.component';
import { ActivationLogButtonComponent } from 'src/app/components/activation-log-button/activation-log-button.component';
import { AdminLevelComponent } from 'src/app/components/admin-level/admin-level.component';
import { AggregatesComponent } from 'src/app/components/aggregates/aggregates.component';
import { AreasOfFocusSummaryComponent } from 'src/app/components/areas-of-focus-summary/areas-of-focus-summary.component';
import { ChangePasswordPopoverComponent } from 'src/app/components/change-password-popover/change-password-popover.component';
import { ChatComponent } from 'src/app/components/chat/chat.component';
import { CommunityNotificationPhotoPopupComponent } from 'src/app/components/community-notification-photo-popup/community-notification-photo-popup.component';
import { CommunityNotificationPopupComponent } from 'src/app/components/community-notification-popup/community-notification-popup.component';
import { CountrySwitcherComponent } from 'src/app/components/country-switcher/country-switcher.component';
import { DateButtonComponent } from 'src/app/components/date-button/date-button.component';
import { DialogueTurnComponent } from 'src/app/components/dialogue-turn/dialogue-turn.component';
import { DisasterTypeComponent } from 'src/app/components/disaster-type/disaster-type.component';
import { DisclaimerApproximateComponent } from 'src/app/components/disclaimer-approximate/disclaimer-approximate.component';
import { DisclaimerToolbarComponent } from 'src/app/components/disclaimer-toolbar/disclaimer-toolbar.component';
import { EventSpeechBubbleComponent } from 'src/app/components/event-speech-bubble/event-speech-bubble.component';
import { EventSwitcherComponent } from 'src/app/components/event-switcher/event-switcher.component';
import { ExportViewComponent } from 'src/app/components/export-view/export-view.component';
import { ExportViewPopoverComponent } from 'src/app/components/export-view-popover/export-view-popover.component';
import { ForgotPasswordPopoverComponent } from 'src/app/components/forgot-password-popover/forgot-password-popover.component';
import { IbfButtonComponent } from 'src/app/components/ibf-button/ibf-button.component';
import { IbfGuideButtonComponent } from 'src/app/components/ibf-guide-button/ibf-guide-button.component';
import { IbfGuidePopoverComponent } from 'src/app/components/ibf-guide-popover/ibf-guide-popover.component';
import { LayerControlInfoPopoverComponent } from 'src/app/components/layer-control-info-popover/layer-control-info-popover.component';
import { DynamicPointPopupComponent } from 'src/app/components/leaflet-popup/dynamic-point-popup/dynamic-point-popup.component';
import { GlofasStationPopupContentComponent } from 'src/app/components/leaflet-popup/glofas-station-popup-content/glofas-station-popup-content.component';
import { RiverGaugePopupContentComponent } from 'src/app/components/leaflet-popup/river-gauge-popup-content/river-gauge-popup-content.component';
import { ThresholdBarComponent } from 'src/app/components/leaflet-popup/threshold-bar/threshold-bar.component';
import { TyphoonTrackpointPopupContentComponent } from 'src/app/components/leaflet-popup/typhoon-trackpoint-popup-content/typhoon-trackpoint-popup-content.component';
import { LoginFormComponent } from 'src/app/components/login-form/login-form.component';
import { LogosComponent } from 'src/app/components/logos/logos.component';
import { MapComponent } from 'src/app/components/map/map.component';
import { MapControlsComponent } from 'src/app/components/map-controls/map-controls.component';
import { MatrixComponent } from 'src/app/components/matrix/matrix.component';
import { ScreenOrientationPopoverComponent } from 'src/app/components/screen-orientation-popover/screen-orientation-popover.component';
import { TimelineComponent } from 'src/app/components/timeline/timeline.component';
import { TimestampComponent } from 'src/app/components/timestamp/timestamp.component';
import { ToggleTriggerPopoverComponent } from 'src/app/components/toggle-trigger-popover/toggle-trigger-popover.component';
import { TooltipComponent } from 'src/app/components/tooltip/tooltip.component';
import { TooltipPopoverComponent } from 'src/app/components/tooltip-popover/tooltip-popover.component';
import { UserStateComponent } from 'src/app/components/user-state/user-state.component';
import { BackendMockScenarioComponent } from 'src/app/mocks/backend-mock-scenario-component/backend-mock-scenario.component';
import { CompactPipe } from 'src/app/pipes/compact.pipe';

@NgModule({
  imports: [
    AnalyticsModule,
    CommonModule,
    FormsModule,
    IonicModule,
    LeafletMarkerClusterModule,
    LeafletModule,
    TranslateModule,
    CompactPipe,
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
    DisclaimerApproximateComponent,
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
    DisclaimerApproximateComponent,
  ],
})
export class SharedModule {}
