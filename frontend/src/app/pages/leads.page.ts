import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LeadService } from '../lead.service';
import { Lead, LeadStatus } from '../models';

@Component({
  standalone: true,
  imports: [DatePipe, FormsModule, RouterLink],
  template: `
    <header class="topbar"><div class="crumb">Workspace <span>/</span> Leads</div></header>
    <section class="page-wrap">
      <div class="page-heading compact"><div><div class="eyebrow">PROSPECÇÃO</div><h1>Seus leads</h1><p>Negócios que podem se beneficiar do seu trabalho.</p></div><a class="button primary" routerLink="/leads/new">＋ Adicionar lead</a></div>
      <section class="panel leads-panel">
        <div class="list-toolbar"><div class="search-box"><span>⌕</span><input aria-label="Buscar leads" placeholder="Buscar por nome ou descrição…" [(ngModel)]="search" (ngModelChange)="load()"></div><select aria-label="Filtrar por status" [(ngModel)]="status" (ngModelChange)="load()"><option value="">Todos os status</option>@for (item of statuses; track item.value) { <option [value]="item.value">{{ item.label }}</option> }</select><span class="result-count">{{ total }} {{ total === 1 ? 'lead' : 'leads' }}</span></div>
        @if (error) { <div class="alert">{{ error }}</div> }
        <div class="table-scroll"><table><thead><tr><th>NEGÓCIO</th><th>CATEGORIA</th><th>LOCALIZAÇÃO</th><th>STATUS</th><th>ADICIONADO</th><th></th></tr></thead><tbody>
          @for (lead of items; track lead.id) { <tr><td><a class="business-link" [routerLink]="['/leads',lead.id]">{{ lead.businessName }}</a><small>{{ lead.email || lead.website || 'Sem contato registrado' }}</small></td><td>{{ lead.category || '—' }}</td><td>{{ location(lead) }}</td><td><span class="status-pill" [attr.data-status]="lead.status">{{ label(lead.status) }}</span></td><td class="date-cell">{{ lead.createdAt | date:'d MMM y' }}</td><td><a class="row-arrow" [routerLink]="['/leads',lead.id]">→</a></td></tr> }
          @empty { <tr><td colspan="6"><div class="empty-state"><span>◌</span><strong>{{ search || status ? 'Nenhum resultado encontrado' : 'Seu pipeline começa aqui' }}</strong><p>{{ search || status ? 'Tente ajustar os filtros.' : 'Adicione um negócio e comece a registrar oportunidades.' }}</p>@if (!search && !status) { <a class="button secondary" routerLink="/leads/new">Adicionar primeiro lead</a> }</div></td></tr> }
        </tbody></table></div>
        @if (total > pageSize) { <div class="pagination"><button class="button secondary" [disabled]="page <= 1" (click)="changePage(page-1)">← Anterior</button><span>Página {{ page }} de {{ pages }}</span><button class="button secondary" [disabled]="page >= pages" (click)="changePage(page+1)">Próxima →</button></div> }
      </section>
    </section>
  `,
})
export class LeadsPage {
  private readonly service = inject(LeadService);
  readonly statuses: { value: LeadStatus; label: string }[] = [
    { value: 'New', label: 'Novo' }, { value: 'Researching', label: 'Pesquisando' }, { value: 'Qualified', label: 'Qualificado' },
    { value: 'ContactReady', label: 'Pronto para contato' }, { value: 'Contacted', label: 'Contatado' }, { value: 'Responded', label: 'Respondeu' },
    { value: 'Proposal', label: 'Proposta' }, { value: 'Won', label: 'Fechado' }, { value: 'Lost', label: 'Perdido' },
    { value: 'Disqualified', label: 'Desqualificado' }, { value: 'Archived', label: 'Arquivado' },
  ];
  readonly pageSize = 25;
  search = '';
  status = '';
  page = 1;
  total = 0;
  items: Lead[] = [];
  error = '';
  constructor() { this.load(); }
  get pages() { return Math.max(1, Math.ceil(this.total / this.pageSize)); }
  load() {
    this.page = 1;
    this.service.list(this.search, this.status, this.page).subscribe({ next: x => { this.items = x.items; this.total = x.total; this.error = ''; }, error: () => this.error = 'Não foi possível carregar os leads. Confira se a API e o PostgreSQL estão em execução.' });
  }
  changePage(page: number) {
    this.page = page;
    this.service.list(this.search, this.status, page).subscribe({ next: x => { this.items = x.items; this.total = x.total; }, error: () => this.error = 'Não foi possível carregar esta página.' });
  }
  location(lead: Lead) { return [lead.city, lead.state].filter(Boolean).join(', ') || '—'; }
  label(status: LeadStatus) { return this.statuses.find(x => x.value === status)?.label ?? status; }
}

