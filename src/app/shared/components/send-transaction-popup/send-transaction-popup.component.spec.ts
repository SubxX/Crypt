import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendTransactionPopupComponent } from './send-transaction-popup.component';

describe('SendTransactionPopupComponent', () => {
  let component: SendTransactionPopupComponent;
  let fixture: ComponentFixture<SendTransactionPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SendTransactionPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SendTransactionPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
