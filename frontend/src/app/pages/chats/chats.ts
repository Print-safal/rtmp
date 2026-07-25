import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-chats',
  imports: [],
  templateUrl: './chats.html',
  styleUrl: './chats.scss',
})
export class Chats implements OnInit {

  private auth = inject(AuthService);

  ngOnInit(): void {

    this.auth.me().subscribe({

      next: (user) => {
        console.log('Current user:', user);
      },

      error: (err) => {
        console.error(err);
      }

    });

  }

}