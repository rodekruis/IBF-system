import ActionsSummaryComponent from 'Pages/ActionSummaryComponent';
import AggregatesComponent from 'Pages/AggregatesComponent';
import ChatComponent from 'Pages/ChatComponent';
import DashboardPage from 'Pages/DashboardPage';
import DisasterTypeComponent from 'Pages/DisasterTypeComponent';
import LoginPage from 'Pages/LoginPage';
import MapComponent from 'Pages/MapComponent';
import TimelineComponent from 'Pages/TimelineComponent';
import UserStateComponent from 'Pages/UserStateComponent';

export interface Pages {
  login: LoginPage;
  dashboard: DashboardPage;
}

export interface Components {
  map: MapComponent;
  userState: UserStateComponent;
  aggregates: AggregatesComponent;
  chat: ChatComponent;
  disasterType: DisasterTypeComponent;
  timeline: TimelineComponent;
  actionsSummary: ActionsSummaryComponent;
}
