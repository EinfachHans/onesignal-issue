import { Injectable } from '@angular/core';
import OneSignal, { LogLevel, PushSubscriptionChangedState } from 'onesignal-cordova-plugin';

@Injectable({
  providedIn: 'root'
})
export class OnesignalService {
  public async init() {
    OneSignal.Debug.setLogLevel(LogLevel.Verbose);

    // OPEN ISSUE (OneSignal)
    // https://github.com/OneSignal/react-native-onesignal/issues/1598
    await new Promise((resolve) => setTimeout(resolve, 250));

    OneSignal.initialize('<APP-ID>');

    void this.loadToken();

    OneSignal.Notifications.addEventListener('permissionChange', (hasPermission) => {
      console.log(`[OneSignal]: Permission change: ${hasPermission}`)
    });

    OneSignal.Notifications.addEventListener('click', (event) => {
      console.log(`[OneSignal]: Push notification clicked, notification: ${event.notification.notificationId}`);
    });
  }

  public login() {
    OneSignal.login('some-external-id')
  }

  public hasPermission(): boolean {
    return OneSignal.Notifications.hasPermission();
  }

  public async requestPermission(): Promise<boolean> {
    if (this.hasPermission()) {
      return true;
    }

    const canRequest = await OneSignal.Notifications.canRequestPermission();

    if (canRequest) {
      return OneSignal.Notifications.requestPermission();
    } else {
      return false;
    }
  }

  private async loadToken(): Promise<void> {
    let token = await OneSignal.User.pushSubscription.getIdAsync();

    if (!token) {
      console.log('[OneSignal]: No token exists, adding listener...');
      token = await this.getTokenFromListener();
    }

    console.log(`[OneSignal]: Token loaded: ${token}`);
  }

  private getTokenFromListener(): Promise<string> {
    return new Promise<string>((resolve) => {
      const listener = (change: PushSubscriptionChangedState) => {
        if (change.current.id) {
          OneSignal.User.pushSubscription.removeEventListener('change', listener);
          resolve(change.current.id);
        }
      };

      OneSignal.User.pushSubscription.addEventListener('change', listener);
    });
  }
}
