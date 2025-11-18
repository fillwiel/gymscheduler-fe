export interface GymClass {
  id: string;
  date: string;
  hour: string;
  title: string;
  availabilityNumber: string;
  scheduledTime?: string;
}

export interface UserTask {
  id: string;
  memberId: string;
  scheduledTime: string;
  processed: boolean;
}

export interface SignUpRequest {
  id: string;
  memberId: string;
  scheduledTime: string;
}

export interface DayData {
  date: string;
  classes: GymClass[];
}