import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet, Platform } from '@ionic/angular/standalone';
import { OnesignalService } from './services/onesignal.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor(private platform: Platform, private onesignalService: OnesignalService) {
    this.initialize();
  }

  private initialize() {
    this.platform.ready().then(async () => {
      await this.onesignalService.init();

      // Await a second (simulating our backend check if the user is logged in)
      await new Promise(resolve => setTimeout(resolve, 1000));

      this.onesignalService.login();

      void this.onesignalService.requestPermission();
    });
  }
}
