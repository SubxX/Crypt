import { Injectable } from '@angular/core';
import { contractAddress, contractABI } from 'src/app/utils/constant';
import { ethers } from 'ethers';
import { BehaviorSubject, take } from 'rxjs';
import { HttpClient } from '@angular/common/http'
import { environment } from 'src/environments/environment'

declare const ethereum: any

interface TransactionInterface {
  sender: string;
  receiver: string;
  amount: number;
  timestamp: number;
  message: string,
}

interface BalanceInterface {
  rate: number
  balance: string
  convertedRate: string
  lastUpdatedAt: number
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private _transactions: BehaviorSubject<undefined | any[]> = new BehaviorSubject<undefined | any[]>(undefined)
  private _balance: BehaviorSubject<BalanceInterface> = new BehaviorSubject<BalanceInterface>({ rate: 0, balance: '--', lastUpdatedAt: Date.now(), convertedRate: '--' })

  transactions = this._transactions.asObservable()
  balance = this._balance.asObservable()

  currency = 'INR'

  constructor(private http: HttpClient) {
  }

  // Balance related functions
  updateBalance(payload: Partial<BalanceInterface>) {
    this._balance.next({ ...this._balance.getValue(), ...payload, lastUpdatedAt: Date.now() })
  }

  async getBalance(address: string) {
    const provider = new ethers.providers.Web3Provider(ethereum)
    let hexBalance = await provider.getBalance(address)
    const balance = ethers.utils.formatEther(hexBalance)
    this.updateBalance({ balance })
    this.fetchConverstaionRate(balance)
  }

  fetchConverstaionRate(balance: string) {
    this.http.get('https://min-api.cryptocompare.com/data/price', {
      params: { fsym: 'ETH', tsyms: this.currency, api_key: environment.apiKey }
    })
      .pipe(take(1))
      .subscribe((data: any) => {
        const parsedBalance = parseFloat(balance)
        const rate = data[this.currency]
        this.updateBalance({ rate, convertedRate: (parsedBalance * rate).toFixed(2) })
      })
  }

  // Transaction related functions
  private get transactionsState(): TransactionInterface[] {
    return this._transactions.getValue() || []
  }

  private get transactionContract(): ethers.Contract {
    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner()
    return new ethers.Contract(contractAddress, contractABI, signer)
  }

  async addToBlockChain(to: string, from: string, amount: string, message: string): Promise<any> {
    const value = ethers.utils.parseEther(String(amount))._hex
    await ethereum.request({
      method: 'eth_sendTransaction',
      params: [{ from, to, gas: '0x5208', value }]
    })
    return this.transactionContract['addToBlockChain'](to, value, message, 'Test')
  }

  async getTransactions(current: string, fetchBalance?: boolean) {
    try {
      if (!current) throw new Error('No acount linked')
      this.transactionContract['gettAllTransactions']().then((data: any) => {
        const formattedData = data.map((d: any) => {
          const lcSender = d.sender.toLowerCase()
          const lcCurrent = current.toLowerCase()
          return ({
            sender: d.sender,
            receiver: d.receiver,
            amount: `${lcSender === lcCurrent ? '-' : '+'} ${ethers.utils.formatEther(d.amount)}`,
            timestamp: d.timestamp.toNumber() * 1000,
            message: d.message,
            sendByCurrentUser: lcSender === lcCurrent
          })
        })
        if (fetchBalance) this.getBalance(current)
        this._transactions.next(formattedData)
      })
    } catch (err) {
      console.log(err)
    }
  }

  addTransaction(transaction: TransactionInterface) {
    this._transactions.next([...this.transactionsState, transaction])
  }

  resetTransactions() {
    this._transactions.next([])
  }

}
