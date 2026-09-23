export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  VerifyEmail: { email: string };
};

export type DiscoverStackParamList = {
  DiscoverList: undefined;
  CandidateDetail: { candidateId: string };
  ProjectDetail: { projectId: string };
};

export type ProfileStackParamList = {
  ProfileView: undefined;
  EditProfile: undefined;
  SkillsManage: undefined;
};

export type TeamsStackParamList = {
  TeamsList: undefined;
  TeamDetail: { teamId: string };
  CreateTeam: undefined;
  QRScanner: undefined;
};

export type NotificationsStackParamList = {
  NotificationsList: undefined;
};

export type AppTabParamList = {
  DiscoverTab: undefined;
  TeamsTab: undefined;
  HackathonsTab: undefined;
  NotificationsTab: undefined;
  ProfileTab: undefined;
};

export type OrganizerTabParamList = {
  ManageTab: undefined;
  SquadsTab: undefined;
  BroadcastTab: undefined;
  OrganizerProfileTab: undefined;
};

