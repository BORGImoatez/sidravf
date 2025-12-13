import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { WebSocketService } from '../../services/websocket.service';
import { User, UserRole } from '../../models/user.model';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="app-layout">
      <!-- Overlay pour mobile -->
      <div
          class="sidebar-overlay"
          [class.active]="isSidebarOpen && isMobile"
          (click)="closeSidebar()"
      ></div>

      <!-- Sidebar -->
      <aside class="sidebar"
             [class.sidebar-collapsed]="isSidebarCollapsed && !isMobile"
             [class.sidebar-open]="isSidebarOpen && isMobile">
        <div class="sidebar-header">
          <div class="sidebar-logo">
            <h2 class="text-lg font-bold text-white">SIDRA</h2>
            <p class="text-xs text-blue-200" *ngIf="!isSidebarCollapsed || isMobile">
              Système d'Information<br>Drogue et Addiction
            </p>
          </div>
          <button
              class="sidebar-toggle"
              (click)="toggleSidebar()"
              type="button"
              *ngIf="!isMobile"
          >
            <span class="toggle-icon" [class.rotated]="isSidebarCollapsed">
              ‹
            </span>
          </button>
          <button
              class="mobile-close-btn"
              (click)="closeSidebar()"
              type="button"
              *ngIf="isMobile"
          >
            ✕
          </button>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-section">
            <h3 class="nav-section-title" *ngIf="!isSidebarCollapsed || isMobile">Navigation</h3>

            <a
                routerLink="/dashboard"
                routerLinkActive="active"
                class="nav-item"
                [title]="isSidebarCollapsed && !isMobile ? 'Accueil' : ''"
                (click)="onNavItemClick()"
            >
              <span class="nav-icon">📊</span>
              <span class="nav-label" *ngIf="!isSidebarCollapsed || isMobile">Accueil</span>
            </a>
            
            <a
                routerLink="/formulaire/demande/new"
                routerLinkActive="active"
                class="nav-item"
                [title]="isSidebarCollapsed && !isMobile ? 'Nouvelle demande' : ''"
                *ngIf="!isExterne() && !isSuperAdmin() && isRoleBns() && !isAdministrateurInsp() && !isUser()"
                (click)="onNavItemClick()"
            >
              <span class="nav-icon">📝</span>
              <span class="nav-label" *ngIf="!isSidebarCollapsed || isMobile">Nouvelle demande</span>
            </a>
            <a
                routerLink="/formulaire/listDemandes"
                routerLinkActive="active"
                class="nav-item"
                [title]="isSidebarCollapsed && !isMobile ? 'Liste des demandes' : ''"
                *ngIf="!isExterne() && !isSuperAdmin() && isRoleBns() && !isAdministrateurInsp() && !isUser()"
                (click)="onNavItemClick()"
            >
              <span class="nav-icon">📝</span>
              <span class="nav-label" *ngIf="!isSidebarCollapsed || isMobile">Liste des demandes</span>
            </a>

            <a
                routerLink="/formulaire"
                routerLinkActive="active"
                class="nav-item"
                [title]="isSidebarCollapsed && !isMobile ? 'Nouveau formulaire' : ''"
                *ngIf="!isExterne() && !isSuperAdmin() && !isRoleBns() && !isAdministrateurInsp()"
                (click)="onNavItemClick()"
            >
              <span class="nav-icon">📋</span>
              <span class="nav-label" *ngIf="!isSidebarCollapsed || isMobile">Nouveau formulaire</span>
            </a>

            <a
                routerLink="/mes-formulaires"
                routerLinkActive="active"
                class="nav-item"
                *ngIf="!isExterne() && !isSuperAdmin() && !isRoleBns() && !isAdministrateurInsp()"
                [title]="isSidebarCollapsed && !isMobile ? 'Mes formulaires' : ''"
                (click)="onNavItemClick()"
            >
              <span class="nav-icon">📋</span>
              <span class="nav-label" *ngIf="!isSidebarCollapsed || isMobile">Mes formulaires</span>
            </a>

            <a
                routerLink="/structures-consultation"
                routerLinkActive="active"
                class="nav-item"
                *ngIf="isSuperAdmin() || isRoleBns()"
                [title]="isSidebarCollapsed && !isMobile ? 'Consultation par structure' : ''"
                (click)="onNavItemClick()"
            >
              <span class="nav-icon">🏥</span>
              <span class="nav-label" *ngIf="!isSidebarCollapsed || isMobile">Consultation par structure</span>
            </a>

            <a
                routerLink="/offre-drogues"
                routerLinkActive="active"
                class="nav-item"
                *ngIf="isExterne() || isRoleBns() || isSuperAdmin()"
                [title]="isSidebarCollapsed && !isMobile ? 'Indicateurs offre de drogues' : ''"
                (click)="onNavItemClick()"
            >
              <span class="nav-icon">📊</span>
              <span class="nav-label" *ngIf="!isSidebarCollapsed || isMobile">
                {{ isExterne() || isRoleBns() ? 'Offre de drogues' : 'Offre de drogues' }}
              </span>
            </a>
          </div>

          <div class="nav-section" *ngIf="canAccessAdmin() || isAdministrateurInsp()">
            <h3 class="nav-section-title" *ngIf="!isSidebarCollapsed || isMobile">Administration</h3>

            <a
                routerLink="/admin/utilisateurs"
                routerLinkActive="active"
                class="nav-item"
                *ngIf="canAccessAdmin() || isAdministrateurInsp()"
                [title]="isSidebarCollapsed && !isMobile ? 'Gestion des utilisateurs' : ''"
                (click)="onNavItemClick()"
            >
              <span class="nav-icon">👥</span>
              <span class="nav-label" *ngIf="!isSidebarCollapsed || isMobile">Utilisateurs</span>
            </a>

            <a
                routerLink="/admin/structures"
                routerLinkActive="active"
                class="nav-item"
                *ngIf="isSuperAdmin() || isAdministrateurInsp()"
                [title]="isSidebarCollapsed && !isMobile ? 'Gestion des structures' : ''"
                (click)="onNavItemClick()"
            >
              <span class="nav-icon">🏢</span>
              <span class="nav-label" *ngIf="!isSidebarCollapsed || isMobile">Structures</span>
            </a>

            <a
                routerLink="/admin/rapports"
                routerLinkActive="active"
                class="nav-item"
                *ngIf="isSuperAdmin() || isUser() || isRoleBns()"
                [title]="isSidebarCollapsed && !isMobile ? 'Rapports et statistiques' : ''"
                (click)="onNavItemClick()"
            >
              <span class="nav-icon">📈</span>
              <span class="nav-label" *ngIf="!isSidebarCollapsed || isMobile">Tableau de bord national</span>
            </a>

            <a
                routerLink="/admin/pending-users"
                routerLinkActive="active"
                class="nav-item"
                *ngIf="isSuperAdmin() || isAdministrateurInsp()"
                [title]="isSidebarCollapsed && !isMobile ? 'Demandes d inscription' : ''"
                (click)="onNavItemClick()"
            >
              <span class="nav-icon">🔔</span>
              <span class="nav-label" *ngIf="!isSidebarCollapsed || isMobile">Demandes d'inscription</span>
            </a>
          </div>

          <div class="nav-section">
            <h3 class="nav-section-title" *ngIf="!isSidebarCollapsed || isMobile">Support</h3>

            <a
                routerLink="/aide"
                routerLinkActive="active"
                class="nav-item"
                [title]="isSidebarCollapsed && !isMobile ? 'Guide d utilisation' : ''"
                (click)="onNavItemClick()"
            >
              <span class="nav-icon">❓</span>
              <span class="nav-label" *ngIf="!isSidebarCollapsed || isMobile">Aide</span>
            </a>
          </div>
        </nav>

        <div class="sidebar-footer">
          <div class="user-info" *ngIf="currentUser && (!isSidebarCollapsed || isMobile)">
            <div class="user-avatar">
              {{ getUserInitials() }}
            </div>
            <div class="user-details">
              <div class="user-name">{{ currentUser.prenom }} {{ currentUser.nom }}</div>
              <div class="user-role">{{ getUserRoleLabel() }}</div>
              <div class="user-structure" *ngIf="currentUser.structure">
                {{ currentUser.structure.nom }}
              </div>
            </div>
          </div>

          <button
              class="logout-btn"
              (click)="logout()"
              type="button"
              [title]="isSidebarCollapsed && !isMobile ? 'Se déconnecter' : ''"
          >
            <span class="nav-icon">🚪</span>
            <span class="nav-label" *ngIf="!isSidebarCollapsed || isMobile">Déconnexion</span>
          </button>
        </div>
      </aside>

      <!-- Main content -->
      <main class="main-content" [class.main-content-expanded]="isSidebarCollapsed && !isMobile">
        <header class="main-header">
          <div class="header-left">
            <button
                class="mobile-menu-btn"
                (click)="openSidebar()"
                type="button"
            >
              ☰
            </button>
            <h1 class="page-title">{{ getPageTitle() }}</h1>
          </div>

          <div class="header-right">
            <div class="user-menu" *ngIf="currentUser">
              <div class="user-avatar-sm">{{ getUserInitials() }}</div>
              <div class="user-info-sm">
                <div class="user-name-sm">{{ currentUser.prenom }} {{ currentUser.nom }}</div>
                <div class="user-role-sm">{{ getUserRoleLabel() }}</div>
              </div>
            </div>
          </div>
        </header>

        <div class="main-content-area">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      height: 100vh;
      background-color: var(--gray-50);
      overflow: hidden;
    }

    /* Overlay pour mobile */
    .sidebar-overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 999;
      opacity: 0;
      transition: opacity 0.3s ease-in-out;
    }

    .sidebar-overlay.active {
      display: block;
      opacity: 1;
    }

    /* Sidebar */
    .sidebar {
      width: 280px;
      background: linear-gradient(180deg, var(--primary-600), var(--primary-800));
      color: white;
      display: flex;
      flex-direction: column;
      transition: width 0.3s ease-in-out;
      position: relative;
      box-shadow: var(--shadow-lg);
      z-index: 100;
      flex-shrink: 0;
    }

    .sidebar-collapsed {
      width: 80px;
    }

    .sidebar-header {
      padding: var(--spacing-6) var(--spacing-4);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .sidebar-logo {
      flex: 1;
    }

    .sidebar-logo h2 {
      margin: 0;
      font-size: 20px;
    }

    .sidebar-logo p {
      margin: var(--spacing-1) 0 0 0;
      opacity: 0.8;
      line-height: 1.2;
    }

    .sidebar-toggle {
      position: absolute;
      top: 50%;
      right: -12px;
      transform: translateY(-50%);
      width: 24px;
      height: 24px;
      background: var(--primary-500);
      border: 2px solid white;
      border-radius: 50%;
      color: white;
      font-size: 14px;
      font-weight: bold;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease-in-out;
    }

    .sidebar-toggle:hover {
      background: var(--primary-300);
      transform: translateY(-50%) scale(1.1);
    }

    .toggle-icon {
      transition: transform 0.3s ease-in-out;
      display: inline-block;
    }

    .toggle-icon.rotated {
      transform: rotate(180deg);
    }

    .mobile-close-btn {
      display: none;
      background: transparent;
      border: none;
      color: white;
      font-size: 24px;
      cursor: pointer;
      padding: var(--spacing-2);
      width: 32px;
      height: 32px;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-sm);
      transition: background-color 0.2s;
    }

    .mobile-close-btn:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .sidebar-nav {
      flex: 1;
      padding: var(--spacing-4) 0;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .sidebar-nav::-webkit-scrollbar {
      width: 4px;
    }

    .sidebar-nav::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.3);
      border-radius: 4px;
    }

    .nav-section {
      margin-bottom: var(--spacing-6);
    }

    .nav-section-title {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: rgba(255, 255, 255, 0.6);
      margin: 0 0 var(--spacing-3) var(--spacing-4);
    }

    .nav-item {
      display: flex;
      align-items: center;
      padding: var(--spacing-3) var(--spacing-4);
      color: rgba(255, 255, 255, 0.8);
      text-decoration: none;
      transition: all 0.2s ease-in-out;
      border-left: 3px solid transparent;
      gap: var(--spacing-3);
    }

    .nav-item:hover {
      background-color: rgba(255, 255, 255, 0.1);
      color: white;
    }

    .nav-item.active {
      background-color: rgba(255, 255, 255, 0.15);
      border-left-color: white;
      color: white;
    }

    .nav-icon {
      font-size: 18px;
      width: 24px;
      text-align: center;
      flex-shrink: 0;
    }

    .nav-label {
      font-size: 14px;
      font-weight: 500;
      white-space: nowrap;
    }

    .sidebar-footer {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding: var(--spacing-4);
      flex-shrink: 0;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
      margin-bottom: var(--spacing-4);
      padding: var(--spacing-3);
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: var(--radius-md);
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--primary-300);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 14px;
      flex-shrink: 0;
    }

    .user-details {
      flex: 1;
      min-width: 0;
    }

    .user-name {
      font-weight: 600;
      font-size: 14px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-role {
      font-size: 12px;
      opacity: 0.8;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-structure {
      font-size: 11px;
      opacity: 0.7;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .logout-btn {
      width: 100%;
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
      padding: var(--spacing-3) var(--spacing-4);
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: var(--radius-md);
      color: rgba(255, 255, 255, 0.8);
      cursor: pointer;
      transition: all 0.2s ease-in-out;
    }

    .logout-btn:hover {
      background-color: rgba(255, 255, 255, 0.1);
      color: white;
      border-color: rgba(255, 255, 255, 0.3);
    }

    /* Main content */
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      overflow: hidden;
    }

    .main-content-expanded {
      margin-left: 0;
    }

    .main-header {
      background: white;
      padding: var(--spacing-4) var(--spacing-6);
      box-shadow: var(--shadow-sm);
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--gray-200);
      flex-shrink: 0;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: var(--spacing-4);
      min-width: 0;
      flex: 1;
    }

    .mobile-menu-btn {
      display: none;
      background: transparent;
      border: none;
      font-size: 20px;
      cursor: pointer;
      padding: var(--spacing-2);
      border-radius: var(--radius-sm);
      color: var(--gray-600);
      width: 36px;
      height: 36px;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .mobile-menu-btn:hover {
      background-color: var(--gray-100);
    }

    .page-title {
      font-size: 24px;
      font-weight: 600;
      color: var(--gray-900);
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .header-right {
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }

    .user-menu {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
    }

    .user-avatar-sm {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--primary-500);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 12px;
      color: white;
      flex-shrink: 0;
    }

    .user-info-sm {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .user-name-sm {
      font-weight: 600;
      font-size: 14px;
      color: var(--gray-900);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-role-sm {
      font-size: 12px;
      color: var(--gray-500);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .main-content-area {
      flex: 1;
      padding: var(--spacing-6);
      overflow-y: auto;
      overflow-x: hidden;
    }

    /* Responsive - Tablette */
    @media (max-width: 1024px) {
      .sidebar {
        width: 260px;
      }

      .sidebar-collapsed {
        width: 70px;
      }

      .page-title {
        font-size: 20px;
      }
    }

    /* Responsive - Mobile */
    @media (max-width: 768px) {
      .sidebar {
        position: fixed;
        left: -280px;
        top: 0;
        height: 100vh;
        width: 280px;
        z-index: 1000;
        transition: left 0.3s ease-in-out;
      }

      .sidebar.sidebar-open {
        left: 0;
      }

      .sidebar-collapsed {
        width: 280px;
        left: -280px;
      }

      .sidebar-toggle {
        display: none;
      }

      .mobile-close-btn {
        display: flex;
      }

      .main-content {
        margin-left: 0;
        width: 100%;
      }

      .main-content-expanded {
        margin-left: 0;
      }

      .mobile-menu-btn {
        display: flex;
      }

      .user-info-sm {
        display: none;
      }

      .main-header {
        padding: var(--spacing-3) var(--spacing-4);
      }

      .page-title {
        font-size: 18px;
      }

      .main-content-area {
        padding: var(--spacing-4);
      }
    }

    /* Responsive - Petits mobiles */
    @media (max-width: 480px) {
      .sidebar {
        width: 260px;
        left: -260px;
      }

      .main-header {
        padding: var(--spacing-2) var(--spacing-3);
      }

      .header-left {
        gap: var(--spacing-2);
      }

      .page-title {
        font-size: 16px;
      }

      .main-content-area {
        padding: var(--spacing-3);
      }

      .user-avatar-sm {
        width: 28px;
        height: 28px;
        font-size: 11px;
      }
    }

    /* Landscape mobile */
    @media (max-height: 500px) and (max-width: 900px) {
      .sidebar {
        width: 240px;
        left: -240px;
      }

      .sidebar-header {
        padding: var(--spacing-3) var(--spacing-3);
      }

      .sidebar-logo h2 {
        font-size: 18px;
      }

      .sidebar-logo p {
        font-size: 10px;
      }

      .nav-item {
        padding: var(--spacing-2) var(--spacing-3);
      }

      .main-content-area {
        padding: var(--spacing-3);
      }
    }
  `]
})
export class LayoutComponent implements OnInit {
  currentUser: User | null = null;
  isSidebarCollapsed = false;
  isSidebarOpen = false;
  isMobile = false;

  constructor(
      private authService: AuthService,
      private router: Router,
      private webSocketService: WebSocketService
  ) {}

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkIfMobile();
  }

  ngOnInit(): void {
    this.checkIfMobile();

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        // this.connectWebSocket();
      }
    });
  }

  private checkIfMobile(): void {
    this.isMobile = window.innerWidth <= 768;
    if (!this.isMobile) {
      this.isSidebarOpen = false;
    }
  }

  private connectWebSocket(): void {
    this.webSocketService.connect().subscribe(connected => {
      if (connected) {
        if (this.canAccessAdmin()) {
          this.webSocketService.subscribe('/topic/admin/notifications', (message) => {
            // Notification visuelle
          });
        }

        const userId = this.currentUser?.id;
        if (userId) {
          this.webSocketService.subscribe(`/user/${userId}/queue/notifications`, (message) => {
            // Notification visuelle
          });
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.webSocketService.disconnect();
  }

  toggleSidebar(): void {
    if (this.isMobile) {
      this.isSidebarOpen = !this.isSidebarOpen;
    } else {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    }
  }

  openSidebar(): void {
    if (this.isMobile) {
      this.isSidebarOpen = true;
    }
  }

  closeSidebar(): void {
    if (this.isMobile) {
      this.isSidebarOpen = false;
    }
  }

  onNavItemClick(): void {
    if (this.isMobile) {
      this.closeSidebar();
    }
  }
  isUser():boolean{
    return this.authService.hasRole(UserRole.UTILISATEUR);
  }

  canAccessAdmin(): boolean {
    return this.authService.canAccessAdmin();
  }

  isSuperAdmin(): boolean {
    return this.authService.hasRole(UserRole.SUPER_ADMIN);
  }

  isAdministrateurInsp(): boolean {
    return this.authService.hasRole(UserRole.ADMINISTRATEUR_INSP);
  }

  isRoleBns(): boolean {
    return this.authService.hasRole(UserRole.ROLE_BNS);
  }

  isExterne(): boolean {
    return this.authService.hasRole(UserRole.EXTERNE);
  }

  getUserInitials(): string {
    if (!this.currentUser) return '';
    const initials = `${this.currentUser.prenom.charAt(0)}${this.currentUser.nom.charAt(0)}`;
    return initials.toUpperCase();
  }

  getUserRoleLabel(): string {
    if (!this.currentUser) return '';

    switch (this.currentUser.role) {
      case UserRole.SUPER_ADMIN:
        return 'Super Administrateur';
      case UserRole.ADMINISTRATEUR_INSP:
        return 'Administrateur INSP';
      case UserRole.ROLE_BNS:
        return 'Rôle BNS';
      case UserRole.ADMIN_STRUCTURE:
        return 'Admin Structure';
      case UserRole.UTILISATEUR:
        return 'Utilisateur';
      case UserRole.EXTERNE:
        return 'Externe';
      default:
        return '';
    }
  }

  getPageTitle(): string {
    const url = this.router.url;

    if (url.includes('/dashboard')) return 'Tableau de bord';
    if (url.includes('/formulaire')) return 'Nouveau formulaire';
    if (url.includes('/mes-formulaires')) return 'Mes formulaires';
    if (url.includes('/structures-consultation')) return 'Consultation par structure';
    if (url.includes('/admin/utilisateurs')) return 'Gestion des utilisateurs';
    if (url.includes('/admin/structures')) return 'Gestion des structures';
    if (url.includes('/admin/rapports')) return 'Rapports et statistiques';
    if (url.includes('/admin/pending-users')) return 'Demandes d\'inscription';
    if (url.includes('/offre-drogues')) return 'Offre de drogues';
    if (url.includes('/aide')) return 'Guide d\'utilisation';

    return 'SIDRA';
  }

  logout(): void {
    this.authService.logout();
    this.webSocketService.disconnect();
    this.router.navigate(['/login']);
  }
}
