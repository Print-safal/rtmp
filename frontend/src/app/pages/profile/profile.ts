import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../services/auth';
import { User } from '../../models/user';

@Component({
  selector: 'app-profile',
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {

  private authService = inject(AuthService);

  user: User | null = null;
  loading = true;

  ngOnInit(): void {

    this.authService.me().subscribe({

      next: (user) => {
        this.user = user;
        this.loading = false;
      },

      error: (error) => {
        console.error('Failed to load profile:', error);
        this.loading = false;
      },

    });

  }

}