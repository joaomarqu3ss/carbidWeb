import { Routes } from '@angular/router';
import { WelcomePage } from './components/pages/welcome-page/welcome-page';
import { RegisterPage } from './components/pages/register-page/register-page';
import { LoginPage } from './components/pages/login-page/login-page';
import { DashboardPage } from './components/pages/dashboard-page/dashboard-page';
import { AuthGuard } from './guards/auth.guard';
import { AdmController } from './components/admin/adm-controller/adm-controller';
import { ClientePage } from './components/admin/cliente-page/cliente-page';
import { MeusCarros } from './components/pages/meus-carros/meus-carros';
import { CadastrarCarro } from './components/pages/cadastrar-carro/cadastrar-carro';
import { DetalhesDoCarro } from './components/pages/detalhes-do-carro/detalhes-do-carro';
import { FavoriteCars } from './components/pages/favorite-cars/favorite-cars';

export const routes: Routes = [
    {
        path: 'welcome',
        component: WelcomePage
    },
    {
        path: 'adm-verify',
        component: AdmController,
        canActivate: [AuthGuard]
    },
    {
        path: 'register',
        component: RegisterPage
    },
    {
        path: 'login',
        component: LoginPage
    },
    {
        path:'favorite-cars',
        component:FavoriteCars,
        canActivate:[AuthGuard]
    },
    {
        path:'meus-carros',
        component:MeusCarros,
        canActivate:[AuthGuard]
    },
    {
        path:'cadastrar-carro',
        component:CadastrarCarro,
        canActivate:[AuthGuard]
    },
    {
        path:'detalhes-do-carro/:id',
        component:DetalhesDoCarro,
        canActivate:[AuthGuard]
    },
    {
        path: 'dashboard',
        component: DashboardPage,
        canActivate: [AuthGuard]
    },
    {
        path: 'adm/cliente/:id',
        component: ClientePage,
        canActivate: [AuthGuard]
    },
    {
        path: '',
        pathMatch: 'full',
        redirectTo: '/welcome'
    }
];
