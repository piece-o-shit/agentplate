export interface ActivityLogDetails {
  id: string;
  user_id: string;
  action: string;
  details: string;
  timestamp: Date;
}

export type Timestamp = Date;
export type UUID = string;
