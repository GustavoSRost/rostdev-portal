import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { LeadService } from './lead.service';

describe('LeadService', () => {
  let service: LeadService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(LeadService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('sends trimmed search and status filters with pagination', () => {
    service.list('  clínica  ', 'Qualified', 2).subscribe();

    const request = http.expectOne(req => req.url === 'http://localhost:5000/api/leads');
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('search')).toBe('clínica');
    expect(request.request.params.get('status')).toBe('Qualified');
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('pageSize')).toBe('25');
    request.flush({ items: [], page: 2, pageSize: 25, total: 0 });
  });
});

