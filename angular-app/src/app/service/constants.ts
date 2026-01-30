import { environment } from '../../environments/environment';

export class Constants {
  // Change the hardcoded string to use the environment variable
  public static readonly BASE_API_URL = environment.apiUrl + '/api';

  public static readonly SIGNUP_SESSION_STORAGE_ID = 'SIGNUP_DATA';
  public static readonly SIGNUP_ENDPOINT = '/signup';
  public static readonly LOGIN_ENDPOINT = '/login';

  public static readonly ROLE_CUSTOMER = 'CUSTOMER';
  public static readonly ROLE_STAFF = 'STAFF';
}
