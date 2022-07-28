import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {LeafletModule} from '@asymmetrik/ngx-leaflet';
import {LeafletDrawModule} from '@asymmetrik/ngx-leaflet-draw';
import {AppComponent} from './app.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {MainNavbarComponent} from './component/main-navbar/main-navbar.component';
import {MainMapComponent} from './component/main-map/main-map.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DatetimePickerComponent} from './component/datetime-picker(unused)/datetime-picker.component';
import {MessageAlertComponent} from './component/message-alert/message-alert.component';
import {FieldErrorDisplayComponent} from './component/field-error-display/field-error-display.component';
import {RouterModule} from '@angular/router';
import {LoginComponent} from './component/login/login.component';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {TokenInterceptor} from './interceptor/TokenInterceptor';
import {JwtInterceptor} from './interceptor/JwtInterceptor';
import {AuthGuard} from './auth.guard';
import {AuthService} from './service/auth.service';
import {AdminComponent} from './component/admin(unused)/admin.component';
import {SigninComponent} from './component/signin/signin.component';
import {ConfirmEqualValidatorDirective} from './directive/confirm-equal-validator.directive';
import {LoadArchiveComponent} from './component/load-archive/load-archive.component';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {BoughtArchiveComponent} from './component/bought-archive/bought-archive.component';
import {BsDatepickerModule} from 'ngx-bootstrap/datepicker';
import {InputRangeDatePickerComponent} from './component/input-range-date-picker/input-range-date-picker.component';
import {BuyArchiveComponent} from './component/buy-archive/buy-archive.component';
import {TimepickerModule} from 'ngx-bootstrap/timepicker';
import {PopoverModule} from 'ngx-bootstrap';
import {InputTimePickerComponent} from './component/input-time-picker/input-time-picker.component';
import {LeafletMarkerClusterModule} from '@asymmetrik/ngx-leaflet-markercluster';
import {TemporalChartComponent} from './component/temporal-chart/temporal-chart.component';
import {UsersListComponent} from './component/users-list/users-list.component';
import {UserDataService} from './service/user-data.service';
import {ModalComponent} from './component/modal/modal.component';
import {HomeStarterComponent} from './component/home-starter/home-starter.component';
import {FooterComponent} from './component/footer/footer.component';
import {ProfileComponent} from './component/profile/profile.component';

export function tokenGetter() {
  return localStorage.getItem('access_token');
}

// indirizzo e porta del server
// Se il server è locale (senza Docker) -> serverAddress = 'http://localhost:8080'
// Se il server è remoto (con Docker o settando le application.properties del server) -> serverAddress = 'http://IP_SERVER:8080',
// dove IP_SERVER = 192.168.99.100 (con Docker) oppure IP_SERVER = IP della scheda di rete del PC su cui gira il server)
const serverAddress = 'http://localhost:8080';

@NgModule({
  declarations: [
    AppComponent,
    MainNavbarComponent,
    MainMapComponent,
    DatetimePickerComponent,
    MessageAlertComponent,
    FieldErrorDisplayComponent,
    LoginComponent,
    AdminComponent,
    SigninComponent,
    ConfirmEqualValidatorDirective,
    LoadArchiveComponent,
    BoughtArchiveComponent,
    InputRangeDatePickerComponent,
    BuyArchiveComponent,
    InputTimePickerComponent,
    TemporalChartComponent,
    UsersListComponent,
    ModalComponent,
    HomeStarterComponent,
    FooterComponent,
    ProfileComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule.forRoot(),
    LeafletModule.forRoot(),
    LeafletDrawModule.forRoot(),
    LeafletMarkerClusterModule.forRoot(),
    TimepickerModule.forRoot(),
    PopoverModule.forRoot(),
    FontAwesomeModule,
    RouterModule.forRoot([
      {
        path: '',
        component: HomeStarterComponent
      },
      {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [AuthGuard],
        data: {
          expectedRole: ['USER', 'CUSTOMER']
        }
      },
      {
        path: 'loadArchive',
        component: LoadArchiveComponent,
        canActivate: [AuthGuard],
        data: {
          expectedRole: ['USER', 'CUSTOMER']
        }
      },
      {
        path: 'boughtArchive',
        component: BoughtArchiveComponent,
        canActivate: [AuthGuard],
        data: {
          expectedRole: ['USER', 'CUSTOMER']
        }
      },
      {
        path: 'buyArchives',
        component: BuyArchiveComponent,
        canActivate: [AuthGuard],
        data: {
          expectedRole: ['USER', 'CUSTOMER']
        }
      },
      {
        path: 'signin',
        component: SigninComponent
      },
      {
        path: 'login',
        component: LoginComponent,
        canActivate: [AuthGuard]
      },
      {
        path: '**',
        redirectTo: ''
      },
    ]),
    BsDatepickerModule.forRoot(),
    TimepickerModule.forRoot()
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    },
    {provide: 'serverAddress', useValue: serverAddress},
    AuthService,
    AuthGuard,
    UserDataService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
