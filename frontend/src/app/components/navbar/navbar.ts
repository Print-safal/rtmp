import { Component, inject } from '@angular/core';
import { Router, RouterLink} from '@angular/router';

import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {

  private auth = inject(AuthService);
  private router = inject(Router);
  logout(): void {
  this.auth.logout();
  this.router.navigate(['/login']);
}

}