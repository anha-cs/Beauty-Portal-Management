import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentRecordsComponent } from './appointment-records.component';

describe('AppointmentRecordsComponent', () => {
  let component: AppointmentRecordsComponent;
  let fixture: ComponentFixture<AppointmentRecordsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentRecordsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppointmentRecordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
