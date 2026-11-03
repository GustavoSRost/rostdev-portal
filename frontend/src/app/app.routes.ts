import { Routes } from '@angular/router';
import { DashboardPage } from './pages/dashboard.page';
import { LeadDetailPage } from './pages/lead-detail.page';
import { LeadsPage } from './pages/leads.page';
import { ProspectingPage } from './pages/prospecting.page';

export const routes: Routes = [
  { path: '', component: DashboardPage, title: 'Painel · Lead Intelligence' },
  { path: 'leads', component: LeadsPage, title: 'Leads · Lead Intelligence' },
  { path: 'prospecting', component: ProspectingPage, title: 'Encontrar empresas · Lead Intelligence' },
  { path: 'leads/new', component: LeadDetailPage, title: 'Novo lead · Lead Intelligence' },
  { path: 'leads/:id', component: LeadDetailPage, title: 'Lead · Lead Intelligence' },
  { path: '**', redirectTo: '' },
];

