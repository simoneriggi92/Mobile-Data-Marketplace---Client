export class Credentials {
  username: string;
  password: string;
  confirmPassword: string;

  constructor(username: string, password: string, confirmPassword: string) {
    this.username = username;
    this.password = password;
    this.confirmPassword = confirmPassword;
  }
}
