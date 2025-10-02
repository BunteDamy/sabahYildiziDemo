import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './pages/shared/components/header/header.component';
import { PrimeNGConfig } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/user/auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'sales management';
  showHeader = true;

  constructor(private primengConfig: PrimeNGConfig, private router: Router, private authService: AuthService) 
  {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.showHeader = !(event.url === '/auth' || event.url ==='/' || event.url ==='/register');
      }
    });
  }

  ngOnInit() {
    this.formatCalendar()

    setInterval(() => {
      this.authService.checkTokenExpiration();
    }, 60000); 

  }

  formatCalendar(){
    this.primengConfig.setTranslation({
      firstDayOfWeek: 0,
      dayNames: [ 'Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi' ],
      dayNamesShort: [ 'paz', 'pzt', 'sal', 'çar', 'per', 'cu', 'cts' ],
      dayNamesMin: [ 'P', 'P', 'S', 'Ç', 'P', 'C', 'C' ],
      monthNames: [ 'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık' ],
      monthNamesShort: [ 'jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez' ],
      today: 'Bugün',
      clear: 'Limpar',
      dateFormat: 'dd/mm/yy'
    });
  }
}