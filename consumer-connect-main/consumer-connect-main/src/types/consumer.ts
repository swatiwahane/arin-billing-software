export interface Consumer {
  id: string;
  month: string;
  consumerName: string;
  consumerNo: string;
  capacityKW: number;
  commissionDate: string;
  importUnits: number;
  exportUnits: number;
  totalGeneration: number;
  readingDate: string;
  amount: number;
  previousUnit: number;
}

export interface ConsumerHistory {
  month: string;
  importUnits: number;
  exportUnits: number;
  totalGeneration: number;
  amount: number;
  readingDate: string;
  previousUnit: number;
}
