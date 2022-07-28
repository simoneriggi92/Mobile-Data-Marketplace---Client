export class UpdateCredential {
  username: string;
  oldPassword: string;
  password: string;
  confirmNewPassword: string;

  constructor(username: string, oldPassword: string, password: string, confirmNewPassword) {
    this.username = username;
    this.oldPassword = oldPassword;
    this.password = password;
    this.confirmNewPassword = confirmNewPassword;
  }
}
