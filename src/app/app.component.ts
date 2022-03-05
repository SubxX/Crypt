import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, } from '@angular/core';
import { Observable, Subject, take, takeUntil } from 'rxjs';
import { AuthenticationService } from './core/services/Authentication/authentication.service';
import { TransactionService } from './core/services/Transaction/transaction.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit, OnDestroy {
  $destroy: Subject<any> = new Subject<any>()
  showSendForm: Subject<boolean> = new Subject<boolean>()
  currentAccount!: Observable<string>

  constructor(private auth: AuthenticationService, public ts: TransactionService) {
    this.currentAccount = this.auth.currentAccount
    this.currentAccount.pipe(takeUntil(this.$destroy))
      .subscribe(account => {
        if (account) {
          this.ts.getTransactions(account)
          this.ts.getBalance(account)
        }
      })
  }

  ngOnInit(): void {
    this.auth.checkIfWalletIsConnected()
  }

  connectWallet() {
    this.auth.connectWallet()
  }

  openSendPopup() {
    this.showSendForm.next(true)
  }

  closeSendPopup() {
    this.showSendForm.next(false)
  }

  ngOnDestroy(): void {
    this.$destroy.next('')
    this.$destroy.unsubscribe()
  }

}
