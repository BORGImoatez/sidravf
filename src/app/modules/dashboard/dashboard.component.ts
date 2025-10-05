@@ .. @@
  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.loadStatistics();
    this.loadRecentActivity();
    this.loadPatientStatistics();
  }

  private loadPatientStatistics(): void {
    this.patientService.getPatientStatistics().subscribe({
      next: (stats) => {
        // Ajouter les statistiques des patients aux statistiques existantes
        if (this.statistics) {
          this.statistics.totalPatients = stats.totalPatients;
          this.statistics.totalFormulaires = stats.totalFormulaires;
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des statistiques des patients:', error);
      }
    });
  }

  private loadStatistics(): void {
    this.userService.getStatistics().subscribe({
      next: (stats) => {
      }
    });
  }