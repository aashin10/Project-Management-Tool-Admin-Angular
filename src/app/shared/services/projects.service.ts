import { Injectable } from '@angular/core';

export interface Project {
  id: string;
  name: string;
  projectCode: string;
  status: 'Active' | 'Inactive' | 'Completed';
  deliveryUnit: string;
  projectManager: string;
  teamSize: number;
  template: 'Scrum' | 'Kanban';
  description?: string;
  additionalInformation?: Array<{name: string, value: string}>;
  isImportedFromJira?: boolean;
  // Customer details
  organisationName: string;
  organisationDescription?: string;
  organisationWebsite?: string;
  pocEmail?: string;
  pocPhone?: string;
  // Project dates
  startDate?: string;
  endDate?: string;
  // Stats
  totalSprintCount?: number;
  // Teams
  teams?: Team[];
  teamMembers?: TeamMember[];
  // Frontend-only properties
  selected?: boolean;
}

export interface Team {
  id: string;
  name: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  team: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {
  private projects: Project[] = [
    // Some projects updated to use the new DU values (randomized sample)
    { id: '1', name: 'Atlas App', projectCode: 'PROJ-001', status: 'Active', deliveryUnit: 'DU1', projectManager: 'Asha Varma', teamSize: 12, template: 'Scrum', description: 'Cross-platform mobile application for location-based services and mapping solutions.', isImportedFromJira: false, organisationName: 'TechCorp Solutions', organisationDescription: 'Leading technology company specializing in mobile applications and cloud solutions.', organisationWebsite: 'https://techcorp.com', pocEmail: 'contact@techcorp.com', pocPhone: '+1 (555) 100-0001', startDate: 'Jan 15, 2025', endDate: 'Jun 15, 2025', totalSprintCount: 12,
      additionalInformation: [
        { name: 'Technology Stack', value: 'React Native, Node.js, MongoDB' },
        { name: 'Target Platform', value: 'iOS and Android' }
      ],
      teams: [
        { id: '1', name: 'Team 1 - Frontend' },
        { id: '2', name: 'Team 2 - Backend' },
        { id: '3', name: 'Team 3 - DevOps' },
        { id: '4', name: 'Team 4 - QA' },
        { id: '5', name: 'Team 5 - Customer' }
      ],
      teamMembers: [
        { id: '1', name: 'Asha Varma', role: 'Frontend Lead', email: 'asha.varma@company.com', team: '1' },
        { id: '2', name: 'Pranav Iyer', role: 'Senior Developer', email: 'pranav.iyer@company.com', team: '1' },
        { id: '3', name: 'Sarah Chen', role: 'UI/UX Designer', email: 'sarah.chen@company.com', team: '1' },
        { id: '4', name: 'Mike Johnson', role: 'Frontend Developer', email: 'mike.johnson@company.com', team: '1' },
        { id: '5', name: 'Lisa Wong', role: 'Frontend Developer', email: 'lisa.wong@company.com', team: '1' },
        { id: '6', name: 'David Kim', role: 'Frontend Developer', email: 'david.kim@company.com', team: '1' },
        { id: '7', name: 'Emma Wilson', role: 'UI Designer', email: 'emma.wilson@company.com', team: '1' },
        { id: '8', name: 'Alex Martinez', role: 'Frontend Developer', email: 'alex.martinez@company.com', team: '1' },
        { id: '9', name: 'John Smith', role: 'Backend Lead', email: 'john.smith@company.com', team: '2' },
        { id: '10', name: 'Maria Garcia', role: 'Backend Developer', email: 'maria.garcia@company.com', team: '2' },
        { id: '11', name: 'James Brown', role: 'DevOps Engineer', email: 'james.brown@company.com', team: '3' },
        { id: '12', name: 'Linda Davis', role: 'QA Lead', email: 'linda.davis@company.com', team: '4' },
        { id: '13', name: 'Michael Brown', role: 'QA Engineer', email: 'michael.brown@company.com', team: '4' },
        { id: '14', name: 'Sophia Lee', role: 'QA Engineer', email: 'sophia.lee@company.com', team: '4' },
        { id: '15', name: 'Olivia Harris', role: 'Client', email: 'olivia.harris@company.com', team: '5' },
        { id: '16', name: 'Liam Wilson', role: 'Client', email: 'liam.wilson@company.com', team: '5' }
      ]
    },
    { id: '2', name: 'RoadSim', projectCode: 'PROJ-002', status: 'Inactive', deliveryUnit: 'DU3', projectManager: 'Pranav Iyer', teamSize: 8, template: 'Kanban', description: 'Advanced road simulation platform for automotive testing and development.', isImportedFromJira: true, organisationName: 'AutoTech Industries', organisationDescription: 'Automotive technology company focused on simulation and testing solutions.', organisationWebsite: 'https://autotech.com', pocEmail: 'projects@autotech.com', pocPhone: '+1 (555) 100-0002', startDate: 'Feb 1, 2025', endDate: 'Aug 1, 2025', totalSprintCount: 8 },
    { id: '3', name: 'CloudSync Pro', projectCode: 'PROJ-003', status: 'Completed', deliveryUnit: 'DU2', projectManager: 'Sarah Chen', teamSize: 15, template: 'Scrum', description: 'Enterprise cloud synchronization and backup solution with real-time collaboration features.', isImportedFromJira: false, organisationName: 'CloudFirst Inc', organisationDescription: 'Cloud computing and data synchronization solutions provider.', organisationWebsite: 'https://cloudfirst.com', pocEmail: 'sarah.chen@cloudfirst.com', pocPhone: '+1 (555) 100-0003', startDate: 'Nov 1, 2024', endDate: 'Apr 1, 2025', totalSprintCount: 15 },
    { id: '4', name: 'DataViz Dashboard', projectCode: 'PROJ-004', status: 'Active', deliveryUnit: 'DU4', projectManager: 'Michael Rodriguez', teamSize: 6, template: 'Kanban', organisationName: 'DataMetrics Corp', isImportedFromJira: false },
    { id: '5', name: 'SecureAuth API', projectCode: 'PROJ-005', status: 'Active', deliveryUnit: 'DU8', projectManager: 'Emma Thompson', teamSize: 9, template: 'Scrum', organisationName: 'SecureNet Solutions', isImportedFromJira: true },
    { id: '6', name: 'E-Learning Hub', projectCode: 'PROJ-006', status: 'Active', deliveryUnit: 'DU1', projectManager: 'James Wilson', teamSize: 11, template: 'Kanban', organisationName: 'EduTech Global', isImportedFromJira: false },
    { id: '7', name: 'MarketPlace Connect', projectCode: 'PROJ-007', status: 'Completed', deliveryUnit: 'DU3', projectManager: 'Lisa Anderson', teamSize: 18, template: 'Scrum', organisationName: 'Commerce Hub Inc', isImportedFromJira: true },
    { id: '8', name: 'Mobile Banking App', projectCode: 'PROJ-008', status: 'Active', deliveryUnit: 'DU2', projectManager: 'David Kumar', teamSize: 20, template: 'Kanban', organisationName: 'FinanceFirst Bank', isImportedFromJira: false },
    { id: '9', name: 'Healthcare Portal', projectCode: 'PROJ-009', status: 'Active', deliveryUnit: 'DU5', projectManager: 'Rachel Green', teamSize: 14, template: 'Scrum', organisationName: 'MediCare Systems', isImportedFromJira: true },
    { id: '10', name: 'Inventory Management', projectCode: 'PROJ-010', status: 'Inactive', deliveryUnit: 'DU8', projectManager: 'Tom Harris', teamSize: 7, template: 'Kanban', organisationName: 'Supply Chain Pro', isImportedFromJira: false },
      { id: '11', name: 'Social Media Platform', projectCode: 'PROJ-011', status: 'Active', deliveryUnit: 'DU1', projectManager: 'Nina Patel', teamSize: 25, template: 'Scrum', organisationName: 'Social Connect Ltd', isImportedFromJira: true },
      { id: '12', name: 'CRM System', projectCode: 'PROJ-012', status: 'Completed', deliveryUnit: 'DU3', projectManager: 'Alex Johnson', teamSize: 10, template: 'Kanban', organisationName: 'CustomerFirst Technologies', isImportedFromJira: false },
      { id: '13', name: 'Analytics Dashboard', projectCode: 'PROJ-013', status: 'Active', deliveryUnit: 'DU5', projectManager: 'Sophie Turner', teamSize: 8, template: 'Scrum', organisationName: 'Insight Analytics Inc', isImportedFromJira: false },
      { id: '14', name: 'Payment Gateway', projectCode: 'PROJ-014', status: 'Active', deliveryUnit: 'DU6', projectManager: 'Robert Chen', teamSize: 12, template: 'Kanban', organisationName: 'PaySecure Global', isImportedFromJira: true },
      { id: '15', name: 'Logistics Tracker', projectCode: 'PROJ-015', status: 'Active', deliveryUnit: 'DU7', projectManager: 'Maria Garcia', teamSize: 9, template: 'Scrum', organisationName: 'LogiTrack Solutions', isImportedFromJira: false },
      { id: '16', name: 'Video Streaming Service', projectCode: 'PROJ-016', status: 'Inactive', deliveryUnit: 'DU8', projectManager: 'Kevin Lee', teamSize: 16, template: 'Kanban', organisationName: 'StreamFlix Entertainment', isImportedFromJira: true },
      { id: '17', name: 'Smart Home App', projectCode: 'PROJ-017', status: 'Active', deliveryUnit: 'DU4', projectManager: 'Laura Martinez', teamSize: 11, template: 'Scrum', organisationName: 'HomeSmart Technologies', isImportedFromJira: false },
      { id: '18', name: 'Restaurant Management', projectCode: 'PROJ-018', status: 'Completed', deliveryUnit: 'DU5', projectManager: 'Chris Brown', teamSize: 6, template: 'Kanban', organisationName: 'FoodBiz Systems', isImportedFromJira: false },
      { id: '19', name: 'Fitness Tracking App', projectCode: 'PROJ-019', status: 'Active', deliveryUnit: 'DU6', projectManager: 'Amanda White', teamSize: 8, template: 'Scrum', organisationName: 'FitLife Health', isImportedFromJira: true },
      { id: '20', name: 'Real Estate Platform', projectCode: 'PROJ-020', status: 'Active', deliveryUnit: 'DU7', projectManager: 'Daniel Kim', teamSize: 13, template: 'Kanban', organisationName: 'PropertyHub Inc', isImportedFromJira: false },
      { id: '21', name: 'Travel Booking System', projectCode: 'PROJ-021', status: 'Active', deliveryUnit: 'DU8', projectManager: 'Jessica Wang', teamSize: 15, template: 'Scrum', organisationName: 'TravelEase Ventures', isImportedFromJira: true },
      { id: '22', name: 'HR Management Portal', projectCode: 'PROJ-022', status: 'Inactive', deliveryUnit: 'DU4', projectManager: 'Michael Smith', teamSize: 7, template: 'Kanban', organisationName: 'HRTech Solutions', isImportedFromJira: false },
      { id: '23', name: 'Customer Support Chat', projectCode: 'PROJ-023', status: 'Active', deliveryUnit: 'DU1', projectManager: 'Olivia Davis', teamSize: 10, template: 'Scrum', organisationName: 'SupportDesk Pro', isImportedFromJira: true },
      { id: '24', name: 'Weather Forecast App', projectCode: 'PROJ-024', status: 'Completed', deliveryUnit: 'DU2', projectManager: 'Ryan Taylor', teamSize: 5, template: 'Kanban', organisationName: 'WeatherWise Inc', isImportedFromJira: false },
      { id: '25', name: 'Task Management Tool', projectCode: 'PROJ-025', status: 'Active', deliveryUnit: 'DU3', projectManager: 'Emily Wilson', teamSize: 12, template: 'Scrum', organisationName: 'TaskFlow Systems', isImportedFromJira: false },
      { id: '26', name: 'AI Chatbot Platform', projectCode: 'PROJ-026', status: 'Active', deliveryUnit: 'DU1', projectManager: 'Benjamin Clarke', teamSize: 18, template: 'Kanban', organisationName: 'AI Innovations Ltd', isImportedFromJira: true },
      { id: '27', name: 'Blockchain Wallet', projectCode: 'PROJ-027', status: 'Active', deliveryUnit: 'DU2', projectManager: 'Sophia Williams', teamSize: 14, template: 'Scrum', organisationName: 'CryptoSecure Inc', isImportedFromJira: false },
      { id: '28', name: 'Supply Chain Management', projectCode: 'PROJ-028', status: 'Active', deliveryUnit: 'DU1', projectManager: 'Lucas Brown', teamSize: 22, template: 'Kanban', organisationName: 'ChainLink Global', isImportedFromJira: false },
      { id: '29', name: 'Virtual Event Platform', projectCode: 'PROJ-029', status: 'Completed', deliveryUnit: 'DU3', projectManager: 'Isabella Martinez', teamSize: 9, template: 'Scrum', organisationName: 'EventSpace Digital', isImportedFromJira: true },
      { id: '30', name: 'Code Review Automation', projectCode: 'PROJ-030', status: 'Inactive', deliveryUnit: 'DU1', projectManager: 'Ethan Anderson', teamSize: 7, template: 'Kanban', organisationName: 'CodeQuality Tools', isImportedFromJira: false },
      { id: '31', name: 'Document Management System', projectCode: 'PROJ-031', status: 'Active', deliveryUnit: 'DU2', projectManager: 'Mia Thompson', teamSize: 11, template: 'Scrum', organisationName: 'DocuFlow Enterprise', isImportedFromJira: false },
      { id: '32', name: 'Fleet Management App', projectCode: 'PROJ-032', status: 'Active', deliveryUnit: 'DU3', projectManager: 'Noah Garcia', teamSize: 13, template: 'Kanban', organisationName: 'FleetTrack Systems', isImportedFromJira: false },
      { id: '33', name: 'Expense Tracking Tool', projectCode: 'PROJ-033', status: 'Active', deliveryUnit: 'DU1', projectManager: 'Ava Rodriguez', teamSize: 6, template: 'Scrum', organisationName: 'ExpenseWise Inc', isImportedFromJira: false },
      { id: '34', name: 'Network Monitoring System', projectCode: 'PROJ-034', status: 'Active', deliveryUnit: 'DU1', projectManager: 'William Lee', teamSize: 16, template: 'Kanban', organisationName: 'NetWatch Technologies', isImportedFromJira: true },
      { id: '35', name: 'Content Management CMS', projectCode: 'PROJ-035', status: 'Completed', deliveryUnit: 'DU2', projectManager: 'Charlotte Davis', teamSize: 10, template: 'Scrum', organisationName: 'ContentPro Systems', isImportedFromJira: false },
      { id: '36', name: 'Recruitment Portal', projectCode: 'PROJ-036', status: 'Active', deliveryUnit: 'DU3', projectManager: 'James Miller', teamSize: 12, template: 'Kanban', organisationName: 'TalentHunt Solutions', isImportedFromJira: false },
      { id: '37', name: 'IoT Device Manager', projectCode: 'PROJ-037', status: 'Active', deliveryUnit: 'DU1', projectManager: 'Amelia Wilson', teamSize: 19, template: 'Scrum', organisationName: 'SmartDevice Hub', isImportedFromJira: true },
      { id: '38', name: 'Email Marketing Suite', projectCode: 'PROJ-038', status: 'Completed', deliveryUnit: 'DU2', projectManager: 'Oliver Moore', teamSize: 8, template: 'Kanban', organisationName: 'MailMaster Pro', isImportedFromJira: false },
      { id: '39', name: 'Bug Tracking System', projectCode: 'PROJ-039', status: 'Active', deliveryUnit: 'DU3', projectManager: 'Emma Taylor', teamSize: 14, template: 'Scrum', organisationName: 'BugHunter Technologies', isImportedFromJira: false },
      { id: '40', name: 'Appointment Scheduler', projectCode: 'PROJ-040', status: 'Inactive', deliveryUnit: 'DU1', projectManager: 'Liam Anderson', teamSize: 5, template: 'Kanban', organisationName: 'ScheduleEase Inc', isImportedFromJira: false },
      { id: '41', name: 'Digital Asset Management', projectCode: 'PROJ-041', status: 'Active', deliveryUnit: 'DU2', projectManager: 'Harper Thomas', teamSize: 11, template: 'Scrum', organisationName: 'AssetVault Systems', isImportedFromJira: false },
      { id: '42', name: 'Knowledge Base System', projectCode: 'PROJ-042', status: 'Active', deliveryUnit: 'DU3', projectManager: 'Elijah Jackson', teamSize: 9, template: 'Kanban', organisationName: 'KnowledgeHub Pro', isImportedFromJira: false },
      { id: '43', name: 'Invoice Generator', projectCode: 'PROJ-043', status: 'Completed', deliveryUnit: 'DU1', projectManager: 'Abigail White', teamSize: 4, template: 'Scrum', organisationName: 'InvoicePro Solutions', isImportedFromJira: false },
      { id: '44', name: 'Video Conference App', projectCode: 'PROJ-044', status: 'Active', deliveryUnit: 'DU1', projectManager: 'Alexander Harris', teamSize: 21, template: 'Kanban', organisationName: 'MeetConnect Technologies', isImportedFromJira: true },
      { id: '45', name: 'Sales Forecasting Tool', projectCode: 'PROJ-045', status: 'Active', deliveryUnit: 'DU2', projectManager: 'Emily Martin', teamSize: 15, template: 'Scrum', organisationName: 'SalesVision Analytics', isImportedFromJira: false },
  ];

  getProjects(): Project[] {
    return this.projects.map(project => ({ ...project, selected: project.selected ?? false }));
  }

  getProjectById(id: string): Project | undefined {
    const project = this.projects.find(project => project.id === id);
    return project ? { ...project, selected: project.selected ?? false } : undefined;
  }

  addProject(project: Project): void {
    this.projects.push(project);
  }

  updateProject(id: string, updatedProject: Partial<Project>): boolean {
    const index = this.projects.findIndex(project => project.id === id);
    if (index !== -1) {
      this.projects[index] = { ...this.projects[index], ...updatedProject, id };
      return true;
    }
    return false;
  }

  deleteProject(id: string): boolean {
    const index = this.projects.findIndex(project => project.id === id);
    if (index !== -1) {
      this.projects.splice(index, 1);
      return true;
    }
    return false;
  }
}