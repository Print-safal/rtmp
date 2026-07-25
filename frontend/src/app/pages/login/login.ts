import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {

  private authService = inject(AuthService);

  username = '';
  password = '';

  login() {

    this.authService.login({
      username: this.username,
      password: this.password
    }).subscribe({

      next: (response) => {

        console.log('Login successful');
        console.log(response);

      },

      error: (err) => {

        console.error(err);

      }

    });

  }

}