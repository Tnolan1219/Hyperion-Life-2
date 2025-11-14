export type KPI = {
  id: string;
  label: string;
  value: string;
  delta: string;
  tone: 'success' | 'neutral' | 'danger';
};

export type Holding = {
  id: string;
  ticker: string;
  name: string;
  value: string;
  change: string;
  tone: 'success' | 'danger';
};

export type Feature = {
  id: string;
  icon: string;
  title: string;
  desc: string;
};
