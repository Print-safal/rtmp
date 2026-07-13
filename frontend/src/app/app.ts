import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface HealthResponse {
  status: string;
  message: string;
}

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {

  private http = inject(HttpClient);

  backendMessage = signal('Connecting to backend...');

  ngOnInit(): void {
    this.http
      .get<HealthResponse>('http://127.0.0.1:8000/api/health/')
      .subscribe({
        next: (response) => {
          console.log('Backend response:', response);

          this.backendMessage.set(response.message);
        },
        error: (error) => {
          console.error(error);

          this.backendMessage.set('Could not connect to backend');
        }
      });
  }
}