import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LeadService } from '../lead.service';
import { PlaceCandidate } from '../models';

@Component({
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <header class="topbar"><div class="crumb">Workspace <span>/</span> Encontrar empresas</div></header>
    <section class="page-wrap">
      <div class="page-heading compact"><div><div class="eyebrow">PROSPECÇÃO</div><h1>Encontrar empresas</h1><p>Pesquise negócios por categoria, nome e localização.</p></div></div>
      <section class="panel prospect-search">
        <form (ngSubmit)="search()"><label class="field">O que você procura?<input name="query" [(ngModel)]="query" minlength="3" maxlength="200" required placeholder="Ex.: clínicas odontológicas em Campinas"></label><button class="button primary" [disabled]="loading || query.trim().length < 3">{{ loading ? 'Buscando…' : 'Buscar empresas' }} <span>→</span></button></form>
        <p class="helper">A consulta é enviada à Places API (New) pelo servidor. Cada busca pode gerar cobrança do Google Maps.</p>
      </section>
      <p class="ranking-note">A ordenação dos resultados considera principalmente relevância, distância e destaque, conforme os critérios do Google Maps.</p>
      @if (error) { <div class="alert prospect-alert">{{ error }}</div> }
      @if (searched && !loading && !error && places.length === 0) { <section class="panel empty-state"><span>◌</span><strong>Nenhuma empresa encontrada</strong><p>Tente outra categoria, nome ou cidade.</p></section> }
      @if (places.length) {
        <div class="prospect-results-heading"><div><h2>Resultados</h2><span>{{ places.length }} empresas · dados temporários do Google Maps</span></div></div>
        <section class="prospect-results">
          @for (place of places; track place.placeId) {
            <article class="panel prospect-card"><div class="prospect-main"><div class="prospect-title"><span class="prospect-mark">⌂</span><div><h3>{{ place.name || 'Nome indisponível' }}</h3><small>{{ place.category || 'Categoria não informada' }}</small></div></div>
              <dl><div><dt>Endereço</dt><dd>{{ place.address || 'Não informado' }}</dd></div><div><dt>Telefone</dt><dd>{{ place.phone || 'Não informado' }}</dd></div><div><dt>Site</dt><dd>@if (place.website) { <a [href]="place.website" target="_blank" rel="noopener noreferrer">{{ place.website }}</a> } @else { Não informado }</dd></div><div><dt>place_id</dt><dd class="place-id">{{ place.placeId }}</dd></div></dl>
            </div><div class="prospect-action"><a class="button secondary" [routerLink]="['/leads/new']" [queryParams]="{ placeId: place.placeId }">Revisar e adicionar <span>→</span></a></div>
              <div class="google-attribution" translate="no">Google Maps</div>
            </article>
          }
        </section>
      }
      <p class="policy-note">Os resultados servem apenas para consulta temporária. Para criar um lead, informe dados obtidos de uma fonte independente; somente o place_id pode ser guardado aqui.</p>
    </section>
  `,
})
export class ProspectingPage {
  private readonly service = inject(LeadService);
  query = '';
  places: PlaceCandidate[] = [];
  loading = false;
  searched = false;
  error = '';

  search() {
    const query = this.query.trim();
    if (this.loading || query.length < 3) return;
    this.loading = true; this.searched = true; this.error = ''; this.places = [];
    this.service.searchPlaces(query).subscribe({
      next: result => { this.places = result.places ?? []; this.loading = false; },
      error: (e: HttpErrorResponse) => {
        const detail = e.error?.detail || e.error?.title;
        this.error = typeof detail === 'string' ? detail : e.status === 0 ? 'Não foi possível conectar à API local.' : 'A busca falhou. Tente novamente mais tarde.';
        this.loading = false;
      },
    });
  }
}
