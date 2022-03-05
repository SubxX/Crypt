import { Component, OnInit, Output, EventEmitter, HostListener, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ethers } from 'ethers';
import { BehaviorSubject, delayWhen, interval, of, Subject, takeUntil } from 'rxjs';
import { AuthenticationService } from 'src/app/core/services/Authentication/authentication.service';
import { TransactionService } from 'src/app/core/services/Transaction/transaction.service';


@Component({
  selector: 'app-send-transaction-popup',
  templateUrl: './send-transaction-popup.component.html',
  styleUrls: ['./send-transaction-popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SendTransactionPopupComponent implements OnInit, OnDestroy {
  $destroy: Subject<any> = new Subject()
  @Output() closeHandler: EventEmitter<boolean> = new EventEmitter<boolean>()
  sendForm!: FormGroup;
  loading: BehaviorSubject<number> = new BehaviorSubject<number>(1)
  error: Subject<string> = new Subject<string>()
  // 1 - default, 2 - loading, 3 - success

  @HostListener('click', ['$event'])
  closeOverlayHandler() {
    this.closeSendPopup()
  }

  constructor(
    private fb: FormBuilder,
    private auth: AuthenticationService,
    private transaction: TransactionService
  ) {
    this.sendForm = this.fb.group({
      amount: ['', [Validators.required]],
      to: ['', [Validators.required]],
      message: ['', [Validators.required]],
    })
    this.loading
      .pipe(delayWhen((val) => val === 3 ? interval(3000) : of(val)), takeUntil(this.$destroy))
      .subscribe(state => {
        if (state === 3) this.closeSendPopup()
      })
  }

  ngOnInit(): void {
  }

  get loadingState() {
    return this.loading.getValue()
  }

  closeSendPopup() {
    if (this.loadingState === 2) return
    this.closeHandler.emit(true)
  }

  closeAlert() {
    this.error.next('')
  }

  async submitForm(e: any) {
    e.preventDefault()
    try {
      if (this.sendForm.invalid) throw new Error('Provide valid details')
      this.loading.next(2) // Loading
      const { amount, to, message } = this.sendForm.value
      const transactionHash = await this.transaction.addToBlockChain(to, this.auth.currentAccountGetter, amount, message)
      await transactionHash.wait()
      console.log('success', transactionHash)
      this.transaction.getTransactions(this.auth.currentAccountGetter, true)
      this.loading.next(3) // Success
    } catch (err: any) {
      if (this.loadingState !== 1) this.loading.next(1) // Default Form
      this.error.next(err.message)
      console.log(err)
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next('')
    this.$destroy.unsubscribe()
  }

}
