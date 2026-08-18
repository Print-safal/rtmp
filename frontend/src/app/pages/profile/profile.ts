import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../services/auth';
import { User } from '../../models/user';
import { Navbar } from "../../components/navbar/navbar";

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule, Navbar],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {

  private authService = inject(AuthService);

  user: User | null = null;

  loading = true;
  editing = false;
  saving = false;

  displayName = '';
  bio = '';

  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {

    this.loadProfile();

  }

  loadProfile(): void {

    this.authService.me().subscribe({

      next: (user) => {

        this.user = user;

        this.displayName = user.display_name;
        this.bio = user.bio || '';

        this.loading = false;

      },

      error: (error) => {

        console.error('Failed to load profile:', error);

        this.errorMessage = 'Failed to load profile.';
        this.loading = false;

      },

    });

  }

  startEditing(): void {

    if (!this.user) {
      return;
    }

    this.displayName = this.user.display_name;
    this.bio = this.user.bio || '';

    this.errorMessage = '';
    this.successMessage = '';

    this.editing = true;

  }

  cancelEditing(): void {

    if (this.user) {

      this.displayName = this.user.display_name;
      this.bio = this.user.bio || '';

    }

    this.editing = false;
    this.errorMessage = '';

  }

  saveProfile(): void {

    this.errorMessage = '';
    this.successMessage = '';

    if (!this.displayName.trim()) {

      this.errorMessage = 'Display name cannot be empty.';
      return;

    }

    this.saving = true;

    this.authService.updateProfile({

      display_name: this.displayName.trim(),
      bio: this.bio.trim(),

    }).subscribe({

      next: (user) => {

        this.user = user;

        this.displayName = user.display_name;
        this.bio = user.bio || '';

        this.editing = false;
        this.saving = false;

        this.successMessage = 'Profile updated successfully.';

      },

      error: (error) => {

        console.error('Failed to update profile:', error);

        this.saving = false;
        this.errorMessage = 'Failed to update profile.';

      },

    });

  }

}