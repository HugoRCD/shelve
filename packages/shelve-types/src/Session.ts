export type Session = {
  id: number;
  userId: number;
  authToken: string;
  device: string;
  location?: string;
  isCli: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type SessionWithCurrent = Session & {
  current: boolean;
};

export type DeviceInfo = {
  userAgent: string;
  location?: string;
  isCli?: boolean;
};
