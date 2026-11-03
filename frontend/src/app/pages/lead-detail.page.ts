import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LeadService } from '../lead.service';
import { Lead, LeadStatus } from '../models';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <header class="topbar"><div class="crumb"><a routerLink="/leads">Leads</a> <span>/</span> {{ isNew ? 'Novo negócio' : 'Detalhes do lead' }}</div></header>
    <section class="page-wrap detail-wrap">
      <a class="back-link" routerLink="/leads">← Voltar para leads</a>
      <div class="page-heading compact"><div><div class="eyebrow">{{ isNew ? 'NOVO REGISTRO' : 'ESPAÇO DO LEAD' }}</div><h1>{{ isNew ? 'Adicionar negócio' : (lead?.businessName || 'Carregando…') }}</h1><p>{{ isNew ? 'Informe os dados do negócio obtidos por uma fonte independente.' : 'Informações básicas e situação atual do negócio.' }}</p></div>@if (lead) { <span class="status-pill large" [attr.data-status]="lead.status">{{ label(lead.status) }}</span> }</div>
      @if (isNew && googlePlaceId) { <div class="policy-note linked-place">Resultados do Google Maps são temporários e não podem preencher o cadastro permanente. Preencha os dados com uma fonte independente. O place_id abaixo será associado ao lead. <strong>{{ googlePlaceId }}</strong></div> }
      @if (error) { <div class="alert">{{ error }}</div> }
      <form [formGroup]="form" (ngSubmit)="save()">
        <section class="panel form-panel"><div class="form-section-heading"><span class="section-icon">⌂</span><div><h2>Sobre o negócio</h2><p>Dados que ajudam a identificar e pesquisar este potencial cliente.</p></div></div>
          <div class="form-grid"><label class="field span-2">Nome do negócio <em>*</em><input formControlName="businessName" placeholder="Ex.: Clínica Aurora"><small>Use o nome pelo qual o negócio é conhecido.</small></label>
            <label class="field">Categoria<input formControlName="category" placeholder="Ex.: Saúde, varejo, serviços"></label>
            <label class="field">Fonte do lead @if (googlePlaceId) { <em>*</em> }<input formControlName="source" [placeholder]="googlePlaceId ? 'Informe a fonte independente' : 'Ex.: Indicação, pesquisa manual'">@if (googlePlaceId) { <small>Confirme de onde vieram os dados usados para este cadastro.</small> }</label>
            <label class="field span-2">Descrição<textarea formControlName="description" rows="3" placeholder="O que você já sabe sobre o negócio?"></textarea></label>
          </div>
        </section>
        <section class="panel form-panel"><div class="form-section-heading"><span class="section-icon contact-icon">✉</span><div><h2>Contato e localização</h2><p>Preencha os detalhes disponíveis. Você pode completá-los depois.</p></div></div>
          <div class="form-grid"><label class="field">E-mail<input formControlName="email" type="email" placeholder="contato@empresa.com"></label><label class="field">Telefone<input formControlName="phone" placeholder="+55 (11) 0000-0000"></label>
            <label class="field span-2">Site<input formControlName="website" type="url" placeholder="https://empresa.com.br"></label>
            <label class="field span-2">Endereço<input formControlName="address" placeholder="Rua, número, bairro"></label>
            <label class="field">Cidade<input formControlName="city" placeholder="São Paulo"></label><label class="field">Estado<input formControlName="state" placeholder="SP"></label><label class="field">País<input formControlName="country" placeholder="Brasil"></label>
            <label class="field span-2">Link da fonte<input formControlName="sourceUrl" type="url" placeholder="https://... (opcional)"></label>
          </div>
        </section>
        @if (lead) { <section class="panel form-panel status-section"><div class="form-section-heading"><span class="section-icon status-icon">◷</span><div><h2>Etapa do pipeline</h2><p>Avance o lead conforme a pesquisa e as conversas evoluem.</p></div></div><div class="status-actions"><label class="field">Status atual<select [value]="lead.status" (change)="changeStatus($any($event.target).value)">@for (status of availableStatuses; track status.value) { <option [value]="status.value">{{ status.label }}</option> }</select></label><span class="updated-note">Atualizado recentemente</span></div></section> }
        <div class="form-actions"><span>Campos com * são obrigatórios.</span><div><a class="button secondary" routerLink="/leads">Cancelar</a><button class="button primary" type="submit" [disabled]="form.invalid || saving">{{ saving ? 'Salvando…' : (isNew ? 'Salvar lead' : 'Salvar alterações') }} <span>→</span></button></div></div>
      </form>
      @if (lead && !isNew) { <div class="delete-row"><span>Este registro não é mais relevante?</span><button class="text-danger" type="button" (click)="remove()">Excluir lead</button></div> }
    </section>
  `,
})
export class LeadDetailPage {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(LeadService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly id = this.route.snapshot.paramMap.get('id');
  readonly isNew = this.id === 'new' || this.route.snapshot.url.at(-1)?.path === 'new';
  readonly form = this.fb.nonNullable.group({
    businessName: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(200)]], category: ['', Validators.maxLength(120)],
    description: ['', Validators.maxLength(4000)], phone: ['', Validators.maxLength(80)], email: ['', [Validators.email, Validators.maxLength(254)]],
    website: ['', [Validators.maxLength(2048), Validators.pattern(/^https?:\/\/\S+$/i)]], address: ['', Validators.maxLength(300)], city: ['', Validators.maxLength(120)],
    state: ['', Validators.maxLength(120)], country: ['', Validators.maxLength(120)], source: ['', Validators.maxLength(120)], sourceUrl: ['', [Validators.maxLength(2048), Validators.pattern(/^https?:\/\/\S+$/i)]], googlePlaceId: [this.route.snapshot.queryParamMap.get('placeId') ?? '', Validators.maxLength(255)],
  });
  readonly statuses: { value: LeadStatus; label: string }[] = [
    { value: 'New', label: 'Novo' }, { value: 'Researching', label: 'Pesquisando' }, { value: 'Qualified', label: 'Qualificado' },
    { value: 'ContactReady', label: 'Pronto para contato' }, { value: 'Contacted', label: 'Contatado' }, { value: 'Responded', label: 'Respondeu' },
    { value: 'Proposal', label: 'Proposta' }, { value: 'Won', label: 'Fechado' }, { value: 'Lost', label: 'Perdido' },
    { value: 'Disqualified', label: 'Desqualificado' }, { value: 'Archived', label: 'Arquivado' },
  ];
  lead: Lead | null = null;
  error = '';
  saving = false;
  get availableStatuses() {
    const allowed: Record<LeadStatus, LeadStatus[]> = {
      New: ['Researching','Disqualified','Archived'], Researching: ['New','Qualified','Disqualified','Archived'],
      Qualified: ['Researching','ContactReady','Disqualified','Archived'], ContactReady: ['Qualified','Contacted','Disqualified','Archived'],
      Contacted: ['Responded','Lost','Archived'], Responded: ['ContactReady','Proposal','Lost','Archived'],
      Proposal: ['Won','Lost','Archived'], Won: ['Archived'], Lost: ['Researching','Archived'],
      Disqualified: ['Researching','Archived'], Archived: ['Researching'],
    };
    return this.lead ? this.statuses.filter(s => s.value === this.lead!.status || allowed[this.lead!.status].includes(s.value)) : this.statuses;
  }
  constructor() {
    if (this.googlePlaceId) this.form.controls.source.addValidators(Validators.required);
    if (!this.isNew && this.id) this.service.get(this.id).subscribe({ next: lead => { this.lead = lead; this.form.patchValue({ businessName: lead.businessName, category: lead.category ?? '', description: lead.description ?? '', phone: lead.phone ?? '', email: lead.email ?? '', website: lead.website ?? '', address: lead.address ?? '', city: lead.city ?? '', state: lead.state ?? '', country: lead.country ?? '', source: lead.source ?? '', sourceUrl: lead.sourceUrl ?? '', googlePlaceId: lead.googlePlaceId ?? '' }); }, error: () => this.error = 'Não foi possível encontrar este lead.' });
  }
  label(value: LeadStatus) { return this.statuses.find(s => s.value === value)?.label ?? value; }
  save() {
    if (this.form.invalid) return;
    this.saving = true;
    const value = this.form.getRawValue();
    const input = Object.fromEntries(Object.entries(value).map(([key, field]) => [key, field.trim() || null])) as unknown as import('../models').LeadInput;
    const request = this.isNew ? this.service.create(input) : this.service.update(this.id!, input);
    request.subscribe({ next: lead => { this.saving = false; void this.router.navigate(['/leads', lead.id]); }, error: () => { this.saving = false; this.error = 'Não foi possível salvar. Revise os campos e tente novamente.'; } });
  }
  changeStatus(status: LeadStatus) {
    if (!this.lead) return;
    this.service.changeStatus(this.lead.id, status).subscribe({ next: value => this.lead = value, error: () => this.error = 'Esta mudança de etapa não é permitida. Atualize o pipeline em sequência.' });
  }
  remove() {
    if (!this.lead || !globalThis.confirm(`Excluir ${this.lead.businessName}? Esta ação não pode ser desfeita.`)) return;
    this.service.delete(this.lead.id).subscribe({ next: () => void this.router.navigate(['/leads']), error: () => this.error = 'Não foi possível excluir este lead.' });
  }
}

