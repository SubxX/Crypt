import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

declare const ethereum: any

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private _currentAccount: BehaviorSubject<string> = new BehaviorSubject<string>('')
  public currentAccount = this._currentAccount.asObservable()

  constructor() {
    // ethereum.on('accountsChanged', () => this.checkIfWalletIsConnected())
  }

  get currentAccountGetter() {
    return this._currentAccount.getValue()
  }

  metaMaskChecker() {
    if (!ethereum) throw new Error('No Etherium object | Please install Metamask to get started')
  }

  async checkIfWalletIsConnected() {
    try {
      this.metaMaskChecker()
      const accounts = await ethereum.request({ method: 'eth_accounts' })
      if (accounts.length) {
        this._currentAccount.next(accounts[0])
        // get all transactions
      } else {
        console.log('No accounts found')
      }
    } catch (err) {
      console.log(err)
      throw err
    }
  }

  async connectWallet() {
    try {
      this.metaMaskChecker()
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      this._currentAccount.next(accounts[0])
    } catch (err) {
      console.log(err)
      throw err
    }
  }

}
