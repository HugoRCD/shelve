export type Session = {
  id: number;
  userId: number;
  authToken: string;
  current?: boolean;
  device: string;
  location?: string;
  isCli: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type DeviceInfo = {
  userAgent: string;
  location?: string;
  isCli?: boolean;
};
