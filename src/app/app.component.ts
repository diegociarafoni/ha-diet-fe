import { Component, OnInit } from '@angular/core';
import { DietService } from './services/diet';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatButtonModule, RouterModule],
  selector: 'app-root',
  template: `
  <mat-toolbar color="primary">
    <span>Dieta</span>
    <span class="spacer"></span>
    <a mat-button routerLink="/week">Settimana</a>
    <a mat-button routerLink="/day">Giorno</a>
    <a mat-button routerLink="/common">Prossimi pasti</a>
    <a mat-button routerLink="/stats">Statistiche</a>
    <a mat-button routerLink="/config">Template</a>
  </mat-toolbar>
  <router-outlet></router-outlet>
  `,
  styles: [`.spacer{flex:1}`]
})
export class AppComponent implements OnInit {
  constructor(private diet: DietService) {}
  ngOnInit() {
    this.diet.connect();
  }
}
