import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LeadService } from '../lead.service';
import { Dashboard } from '../models';

@Component({
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <header class="topbar"><div class="crumb">Workspace <span>/</span> Painel</div><div class="today">{{ today | date:'EEEE, d MMMM' }}</div></header>
    <section class="page-wrap">
      <div class="page-heading"><div><div class="eyebrow">VISÃO GERAL</div><h1>Bom trabalho. Vamos encontrar<br>seu próximo cliente.</h1><p>Veja o que está acontecendo com seus leads.</p></div><a class="button primary" routerLink="/leads/new">＋ Adicionar lead</a></div>
      @if (error) { <div class="alert">{{ error }}</div> }
      @if (data; as d) {
        <div class="metrics">
          <article class="metric-card"><div class="metric-label">Todos os leads <span>↗</span></div><div class="metric-value">{{ d.totalLeads }}</div><div class="metric-foot">{{ d.addedThisWeek }} adicionados nos últimos 7 dias</div></article>
          <article class="metric-card"><div class="metric-label">Novos <span class="metric-dot amber"></span></div><div class="metric-value">{{ d.newLeads }}</div><div class="metric-foot">Aguardando pesquisa</div></article>
          <article class="metric-card"><div class="metric-label">Qualificados <span class="metric-dot green"></span></div><div class="metric-value">{{ d.qualifiedLeads }}</div><div class="metric-foot">Prontos para avançar</div></article>
          <article class="metric-card"><div class="metric-label">Em acompanhamento <span class="metric-dot blue"></span></div><div class="metric-value">{{ d.requiringAttention }}</div><div class="metric-foot">Próximas ações recomendadas</div></article>
        </div>
        <div class="dashboard-grid">
          <section class="panel funnel-panel"><div class="panel-heading"><div><div class="eyebrow">PIPELINE</div><h2>Funil de leads</h2></div><a routerLink="/leads">Ver todos →</a></div>
            <div class="funnel">
              @for (step of funnelSteps; track step.key; let i = $index) {
                <div class="funnel-step"><span class="funnel-num">0{{ i + 1 }}</span><span class="funnel-label">{{ step.label }}</span><span class="funnel-bar"><i [style.width.%]="width(d.funnel[step.key] || 0, d.totalLeads)"></i></span><strong>{{ d.funnel[step.key] || 0 }}</strong></div>
              }
            </div>
          </section>
          <section class="panel focus-panel"><div class="panel-heading"><div><div class="eyebrow">PRÓXIMA AÇÃO</div><h2>Onde focar</h2></div><span class="focus-icon">✳</span></div>
            <div class="focus-content"><span class="focus-count">{{ d.newLeads }}</span><div><strong>leads esperando pesquisa</strong><p>Conheça o negócio e registre evidências antes de decidir se vale um contato.</p></div></div>
            <a class="button secondary full" routerLink="/leads">Abrir lista de leads <span>→</span></a>
          </section>
        </div>
        <section class="panel quick-panel"><div class="panel-heading"><div><div class="eyebrow">COMECE POR AQUI</div><h2>Seu espaço de prospecção</h2></div></div><div class="quick-actions"><a routerLink="/leads/new"><span class="quick-icon">＋</span><span><strong>Adicionar um negócio</strong><small>Registre um lead encontrado por você</small></span><b>→</b></a><a routerLink="/leads"><span class="quick-icon search-icon">⌕</span><span><strong>Revisar leads existentes</strong><small>Pesquise, filtre e atualize seu pipeline</small></span><b>→</b></a></div></section>
      } @else if (!error) { <div class="loading">Carregando seu painel…</div> }
      <footer class="page-footer">Feito para uma prospecção cuidadosa. Cada contato começa com você.</footer>
    </section>
  `,
})
export class DashboardPage {
  private readonly leads = inject(LeadService);
  readonly today = new Date();
  readonly funnelSteps = [
    { key: 'discovered', label: 'Descobertos' }, { key: 'qualified', label: 'Qualificados' },
    { key: 'contactReady', label: 'Prontos para contato' }, { key: 'contacted', label: 'Contatados' },
    { key: 'responded', label: 'Responderam' }, { key: 'proposal', label: 'Proposta' }, { key: 'won', label: 'Fechados' },
  ];
  data: Dashboard | null = null;
  error = '';
  constructor() {
    this.leads.dashboard().subscribe({ next: value => this.data = value, error: () => this.error = 'Não foi possível carregar os dados. Confira se a API e o PostgreSQL estão em execução.' });
  }
  width(value: number, total: number) { return total > 0 ? Math.max(4, value / total * 100) : 0; }
}

