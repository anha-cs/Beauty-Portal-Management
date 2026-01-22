import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemReportsComponent } from './system-reports.component';

describe('SystemReportsComponent', () => {
  let component: SystemReportsComponent;
  let fixture: ComponentFixture<SystemReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemReportsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
