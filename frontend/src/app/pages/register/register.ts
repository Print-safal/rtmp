import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router , RouterLink} from '@angular/router';

import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {

  private authService = inject(AuthService);
  private router = inject(Router);

  username = '';
  email = '';
  password = '';
  displayName = '';

  errorMessage = '';
  successMessage = '';

  register(): void {

    this.errorMessage = '';
    this.successMessage = '';

    if (
      !this.username ||
      !this.email ||
      !this.password ||
      !this.displayName
    ) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    if (this.password.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters.';
      return;
    }

    this.authService.register({
      username: this.username,
      email: this.email,
      password: this.password,
      display_name: this.displayName
    }).subscribe({

      next: () => {

        this.successMessage = 'Registration successful!';

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1000);

      },

      error: (error) => {

        console.error('Registration failed:', error);

        if (error.error) {

          const errors = error.error;

          if (errors.username) {
            this.errorMessage = `Username: ${errors.username[0]}`;
          } else if (errors.email) {
            this.errorMessage = `Email: ${errors.email[0]}`;
          } else if (errors.password) {
            this.errorMessage = `Password: ${errors.password[0]}`;
          } else {
            this.errorMessage = 'Registration failed.';
          }

        } else {

          this.errorMessage = 'Registration failed.';

        }

      }

    });

  }

}
