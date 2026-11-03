import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Dashboard, Lead, LeadInput, LeadStatus, PagedResult, PlaceCandidate } from './models';

@Injectable({ providedIn: 'root' })
export class LeadService {
  private readonly http = inject(HttpClient);
  private readonly api = 'http://localhost:5000/api';

  dashboard() { return this.http.get<Dashboard>(`${this.api}/dashboard`); }
  list(search = '', status = '', page = 1) {
    let params = new HttpParams().set('page', page).set('pageSize', 25);
    if (search.trim()) params = params.set('search', search.trim());
    if (status) params = params.set('status', status);
    return this.http.get<PagedResult<Lead>>(`${this.api}/leads`, { params });
  }
  get(id: string) { return this.http.get<Lead>(`${this.api}/leads/${id}`); }
  create(input: LeadInput) { return this.http.post<Lead>(`${this.api}/leads`, input); }
  update(id: string, input: LeadInput) { return this.http.put<Lead>(`${this.api}/leads/${id}`, input); }
  changeStatus(id: string, status: LeadStatus) {
    return this.http.patch<Lead>(`${this.api}/leads/${id}/status`, { status });
  }
  delete(id: string) { return this.http.delete<void>(`${this.api}/leads/${id}`); }
  searchPlaces(query: string) { return this.http.post<{ places: PlaceCandidate[] }>(`${this.api}/places/search`, { query }); }
}

