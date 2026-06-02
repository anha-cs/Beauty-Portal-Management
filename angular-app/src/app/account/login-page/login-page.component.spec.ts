import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginPageComponent } from './login-page.component';
import { ApiService } from '../../service/api.service'; 
import { AuthTimeoutService } from '../../auth-timeout.service'; // Fixed path to point inside the service folder
import { of } from 'rxjs';

describe('LoginPageComponent', () => {
  let component: LoginPageComponent;
  let fixture: ComponentFixture<LoginPageComponent>;
  
  // Create mock spy objects for dependencies
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockAuthTimeoutService: jasmine.SpyObj<AuthTimeoutService>;

  beforeEach(async () => {
    mockApiService = jasmine.createSpyObj('ApiService', ['post', 'setLoginData']);
    mockAuthTimeoutService = jasmine.createSpyObj('AuthTimeoutService', ['startTracking', 'stopTracking']);

    await TestBed.configureTestingModule({
      imports: [LoginPageComponent],
      providers: [
        // Provide both mock services so the constructor can compile cleanly
        { provide: ApiService, useValue: mockApiService },
        { provide: AuthTimeoutService, useValue: mockAuthTimeoutService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});