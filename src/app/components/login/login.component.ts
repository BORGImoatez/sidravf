import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="login-container">
      <div class="login-card card">
        <div class="login-header">
          <div class="logo-placeholder">
            <img  src="../../../assets/logo/logoMS.png" alt="">

          </div>

          <!-- Logos des partenaires -->
          <div class="partners-logos">
            <div class="logo-placeholder">
              <img   width="80%" src="../../../assets/logo/logos.png" alt="">
            </div>
          </div>

          <h1 class="text-2xl font-bold text-center text-gray-900 mb-2">
            SIDRA
          </h1>

          <p class="text-center text-gray-600 mb-8">
            SYSTEME D'INFORMATION SUR LES DROGUES ET ADDICTIONS
          </p>
        </div>

        <form (ngSubmit)="onSubmit()" #loginForm="ngForm" class="login-form">
          <div class="form-group">
            <label for="email" class="form-label required">
              Adresse email
            </label>
            <input
                type="email"
                id="email"
                name="email"
                [(ngModel)]="loginData.email"
                class="form-input"
                [class.error]="showError && !loginData.email"
                placeholder="exemple@email.com"
                required
                [disabled]="isLoading"
            >
            <div *ngIf="showError && !loginData.email" class="form-error">
              L'adresse email est requise
            </div>
          </div>

          <div class="form-group">
            <label for="motDePasse" class="form-label required">
              Mot de passe
            </label>
            <div class="password-input-wrapper">
              <input
                  [type]="showPassword ? 'text' : 'password'"
                  id="motDePasse"
                  name="motDePasse"
                  [(ngModel)]="loginData.motDePasse"
                  class="form-input"
                  [class.error]="showError && !loginData.motDePasse"
                  placeholder="••••••••"
                  required
                  [disabled]="isLoading"
              >
              <button
                  type="button"
                  class="password-toggle"
                  (click)="togglePasswordVisibility()"
                  [disabled]="isLoading"
              >
                {{ showPassword ? '👁️' : '👁️‍🗨️' }}
              </button>
            </div>
            <div *ngIf="showError && !loginData.motDePasse" class="form-error">
              Le mot de passe est requis
            </div>
          </div>

          <div *ngIf="errorMessage" class="error-banner">
            <span>{{ errorMessage }}</span>
            <div *ngIf="remainingAttempts !== null" class="text-sm mt-1">
              Tentatives restantes: {{ remainingAttempts }}
            </div>
            <div *ngIf="blockedUntil" class="text-sm mt-1">
              Compte bloqué jusqu'à {{ blockedUntil | date:'HH:mm:ss' }}
            </div>
          </div>

          <button
              type="submit"
              class="btn btn-primary btn-lg w-full"
              [disabled]="isLoading || isBlocked"
          >
            <span *ngIf="!isLoading">Se connecter</span>
            <span *ngIf="isLoading" class="flex items-center justify-center gap-2">
              <div class="loading-spinner-sm"></div>
              Connexion...
            </span>
          </button>
        </form>

        <div class="login-footer">
          <div class="text-center mt-4 mb-4">
            <a routerLink="/forgot-password" class="text-primary-600 hover:underline">
              Mot de passe oublié ?
            </a>
          </div>

          <!-- Section inscription avec message et icône -->
          <div class="signup-section">
            <div class="signup-message">
              <span class="pointer-icon">👉</span>
              <p>Si vous n'avez pas encore un compte, veuillez créer un compte</p>
            </div>
            <a routerLink="/signup" class="btn btn-secondary btn-signup">
              S'inscrire
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .password-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .password-input-wrapper .form-input {
      padding-right: 45px;
    }

    .password-toggle {
      position: absolute;
      right: 10px;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: var(--spacing-2);
      font-size: 18px;
      color: var(--gray-500);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s;
    }

    .password-toggle:hover:not(:disabled) {
      color: var(--gray-700);
    }

    .password-toggle:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--primary-50) 0%, var(--primary-100) 100%);
      padding: var(--spacing-4);
    }

    .login-card {
      width: 100%;
      max-width: 480px;
      padding: var(--spacing-8);
      background: white;
      box-shadow: var(--shadow-xl);
      border: none;
    }

    .login-header {
      margin-bottom: var(--spacing-8);
    }

    .partners-logos {
      display: grid;
      grid-template-columns: repeat(1, 1fr);
      gap: var(--spacing-3);
      margin-bottom: var(--spacing-6);
      padding: var(--spacing-4);
      border-radius: var(--radius-md);
    }

    .logo-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 60px;
      background: white;
      text-align: center;
      transition: border-color 0.2s ease-in-out;
    }

    .login-form {
      margin-bottom: var(--spacing-6);
    }

    .error-banner {
      background-color: var(--error-50);
      border: 1px solid var(--error-200);
      color: var(--error-700);
      padding: var(--spacing-3) var(--spacing-4);
      border-radius: var(--radius-md);
      margin-bottom: var(--spacing-4);
      font-size: 14px;
    }

    .loading-spinner-sm {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .login-footer {
      border-top: 1px solid var(--gray-200);
      padding-top: var(--spacing-4);
    }

    /* Style pour la section inscription */
    .signup-section {
      margin-top: var(--spacing-4);
      padding: var(--spacing-4);
      background-color: #f0f9ff;
      border-radius: var(--radius-md);
      border: 2px dashed var(--primary-300);
    }

    .signup-message {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-2);
      margin-bottom: var(--spacing-3);
      text-align: center;
    }

    .signup-message p {
      margin: 0;
      color: var(--gray-700);
      font-size: 14px;
      font-weight: 500;
    }

    .pointer-icon {
      font-size: 24px;
      animation: point 1.5s ease-in-out infinite;
      display: inline-block;
    }

    @keyframes point {
      0%, 100% {
        transform: translateX(0) scale(1);
      }
      50% {
        transform: translateX(5px) scale(1.1);
      }
    }

    .btn-signup {
      width: 100%;
      margin-top: var(--spacing-2);
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .btn-signup:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    @media (max-width: 480px) {
      .login-card {
        padding: var(--spacing-6);
      }

      .partners-logos {
        grid-template-columns: repeat(1, 1fr);
      }

      .logo-placeholder {
        height: 50px;
      }

      .signup-message {
        flex-direction: column;
        gap: var(--spacing-1);
      }

      .pointer-icon {
        transform: rotate(90deg);
        animation: pointDown 1.5s ease-in-out infinite;
      }

      @keyframes pointDown {
        0%, 100% {
          transform: rotate(90deg) translateX(0) scale(1);
        }
        50% {
          transform: rotate(90deg) translateX(5px) scale(1.1);
        }
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  loginData: LoginRequest = {
    email: '',
    motDePasse: ''
  };
  showPassword = false;
  isLoading = false;
  showError = false;
  errorMessage = '';
  remainingAttempts: number | null = null;
  blockedUntil: Date | null = null;
  isBlocked = false;

  constructor(
      private authService: AuthService,
      private router: Router
  ) {}

  ngOnInit(): void {
    // Vérifier si l'utilisateur est déjà connecté
    this.authService.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        this.router.navigate(['/dashboard']);
      }
    });

    // Vérifier les bloquages périodiquement
    setInterval(() => {
      if (this.blockedUntil && this.blockedUntil <= new Date()) {
        this.blockedUntil = null;
        this.isBlocked = false;
        this.errorMessage = '';
      }
    }, 1000);
  }

  onSubmit(): void {
    this.showError = false;
    this.errorMessage = '';
    this.remainingAttempts = null;

    if (!this.loginData.email || !this.loginData.motDePasse) {
      this.showError = true;
      return;
    }

    this.isLoading = true;

    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        this.isLoading = false;

        if (response.success && response.requiresOtp && response.userId) {
          // Rediriger vers la page OTP
          this.router.navigate(['/otp'], {
            queryParams: { userId: response.userId }
          });
        } else if (!response.success) {
          this.errorMessage = response.message;
          this.remainingAttempts = response.remainingAttempts || null;

          if (response.blockedUntil) {
            this.blockedUntil = response.blockedUntil;
            this.isBlocked = true;
          }
        }
      },
      error: (error) => {
        this.isLoading = false;

        // Gérer les erreurs de réponse du serveur
        if (error.error && error.error.message) {
          this.errorMessage = error.error.message;
          this.remainingAttempts = error.error.remainingAttempts || null;

          if (error.error.blockedUntil) {
            this.blockedUntil = new Date(error.error.blockedUntil);
            this.isBlocked = true;
          }
        } else {
          this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
        }

        console.error('Erreur de connexion:', error);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
