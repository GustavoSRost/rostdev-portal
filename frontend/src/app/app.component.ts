import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="shell">
      <aside class="sidebar">
        <a class="brand" routerLink="/">
          <span class="brand-mark">L</span><span>lead intelligence<small>PROSPECTING WORKSPACE</small></span>
        </a>
        <div class="nav-label">WORKSPACE</div>
        <nav>
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}"><span class="nav-icon">◫</span> Painel</a>
          <a routerLink="/leads" routerLinkActive="active"><span class="nav-icon">◉</span> Leads</a>
          <a routerLink="/prospecting" routerLinkActive="active"><span class="nav-icon">⌕</span> Encontrar empresas</a>
        </nav>
        <div class="sidebar-note"><span class="local-dot"></span> Armazenamento local<br><small>Seus dados ficam no seu computador.</small></div>
        <div class="sidebar-foot">Lead Intelligence <span>v0.1 · LOCAL</span></div>
      </aside>
      <main class="main"><router-outlet /></main>
    </div>
  `,
})
export class AppComponent {}

