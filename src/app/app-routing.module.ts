import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotFoundComponent } from './Components/NotFound/not-found.component';

const routes: Routes = [
  { path: 'admin-portal', loadChildren: () => import('./Module/Admin/admin.module').then(m => m.AdminModule) },
  { path: '', loadChildren: () => import('./Module/User/user.module').then(m => m.UserModule) }, 
  { path: '**', component: NotFoundComponent }
]
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
