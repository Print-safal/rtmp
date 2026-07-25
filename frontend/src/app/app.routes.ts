import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Chats } from './pages/chats/chats';
import { Profile } from './pages/profile/profile';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'register',
    component: Register,
  },
  {
    path: 'chats',
    component: Chats,
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    component: Profile,
    canActivate: [authGuard]
  },
];