import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationComponent } from './shared/navigation';
import { ToastComponent } from './shared/toast';
import { ErrorBoundaryComponent } from './shared/error-boundary';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavigationComponent, ToastComponent, ErrorBoundaryComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
