import { Node, Edge } from 'reactflow';

const defaultNodes: Node[] = [
  {
    id: '1',
    type: 'education',
    position: { x: 50, y: 50 },
    data: { title: 'University Degree', year: 2024, amount: -60000, frequency: 'one-time', notes: '4-year public university tuition.' },
  },
  {
    id: '2',
    type: 'career',
    position: { x: 300, y: 50 },
    data: { title: 'First Job', year: 2025, amount: 65000, frequency: 'yearly', notes: 'Starting salary as a junior developer.' },
  },
  {
    id: '3',
    type: 'financial',
    position: { x: 300, y: 250 },
    data: { title: 'Emergency Fund', year: 2026, amount: 15000, frequency: 'one-time', notes: 'Save 3-6 months of expenses.' },
  },
  {
    id: '4',
    type: 'career',
    position: { x: 550, y: 50 },
    data: { title: 'Promotion to Senior', year: 2028, amount: 110000, frequency: 'yearly', notes: 'Salary increase after 3 years.' },
  },
  {
    id: '5',
    type: 'goal',
    position: { x: 800, y: 50 },
    data: { title: 'Buy a House', year: 2030, amount: -75000, frequency: 'one-time', notes: 'Down payment for a starter home.' },
  },
  {
    id: '6',
    type: 'lifeEvent',
    position: { x: 800, y: 250 },
    data: { title: 'Get Married', year: 2029, amount: -20000, frequency: 'one-time', notes: 'Wedding and honeymoon costs.' },
  }
];

const defaultEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', type: 'smoothstep', animated: true },
  { id: 'e2-3', source: '2', target: '3', type: 'smoothstep', animated: true },
  { id: 'e2-4', source: '2', target: '4', type: 'smoothstep', animated: true },
  { id: 'e4-5', source: '4', target: '5', type: 'smoothstep', animated: true },
  { id: 'e4-6', source: '4', target: '6', type: 'smoothstep', animated: true },
];

const earlyRetirementNodes: Node[] = [
    { id: 'er1', type: 'career', position: { x: 50, y: 50 }, data: { title: 'High-Income Job', year: 2025, amount: 150000, frequency: 'yearly', notes: 'Tech or finance job.' } },
    { id: 'er2', type: 'financial', position: { x: 50, y: 250 }, data: { title: 'Aggressive Savings', year: 2025, amount: -75000, frequency: 'yearly', notes: 'Save >50% of income.' } },
    { id: 'er3', type: 'financial', position: { x: 300, y: 150 }, data: { title: 'Invest in Index Funds', year: 2026, amount: 0, frequency: 'one-time', notes: 'VTI/VXUS.' } },
    { id: 'er4', type: 'goal', position: { x: 550, y: 150 }, data: { title: 'Reach FIRE Number', year: 2040, amount: 1500000, frequency: 'one-time', notes: '25x annual expenses.' } },
    { id: 'er5', type: 'goal', position: { x: 800, y: 150 }, data: { title: 'Retire Early', year: 2040, amount: 0, frequency: 'one-time', notes: 'Live off investments.' } },
];
const earlyRetirementEdges: Edge[] = [
    { id: 'ere1-2', source: 'er1', target: 'er2', type: 'smoothstep', animated: true },
    { id: 'ere1-3', source: 'er1', target: 'er3', type: 'smoothstep', animated: true },
    { id: 'ere3-4', source: 'er3', target: 'er4', type: 'smoothstep', animated: true },
    { id: 'ere4-5', source: 'er4', target: 'er5', type: 'smoothstep', animated: true },
];

const startupNodes: Node[] = [
    { id: 'su1', type: 'goal', position: { x: 50, y: 150 }, data: { title: 'Develop MVP', year: 2025, amount: -25000, frequency: 'one-time', notes: 'Initial development costs.' } },
    { id: 'su2', type: 'career', position: { x: 300, y: 150 }, data: { title: 'Launch Company', year: 2026, amount: 0, frequency: 'one-time', notes: 'Quit day job.' } },
    { id: 'su3', type: 'financial', position: { x: 550, y: 50 }, data: { title: 'Seed Funding', year: 2026, amount: 500000, frequency: 'one-time', notes: 'Raise capital from investors.' } },
    { id: 'su4', type: 'career', position: { x: 550, y: 250 }, data: { title: 'Hire Team', year: 2027, amount: -250000, frequency: 'yearly', notes: 'Salaries for first 5 employees.' } },
    { id: 'su5', type: 'goal', position: { x: 800, y: 150 }, data: { title: 'Acquisition/IPO', year: 2032, amount: 10000000, frequency: 'one-time', notes: 'Successful exit.' } },
];
const startupEdges: Edge[] = [
    { id: 'sue1-2', source: 'su1', target: 'su2', type: 'smoothstep', animated: true },
    { id: 'sue2-3', source: 'su2', target: 'su3', type: 'smoothstep', animated: true },
    { id: 'sue3-4', source: 'su3', target: 'su4', type: 'smoothstep', animated: true },
    { id: 'sue3-5', source: 'su3', target: 'su5', type: 'smoothstep', animated: true },
];


export const lifePlanTemplates = {
    default: {
        nodes: defaultNodes,
        edges: defaultEdges
    },
    earlyRetirement: {
        nodes: earlyRetirementNodes,
        edges: earlyRetirementEdges,
    },
    startup: {
        nodes: startupNodes,
        edges: startupEdges
    }
}
