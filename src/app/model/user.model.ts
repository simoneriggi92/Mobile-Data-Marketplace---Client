export class UserModel {
  id: string;
  username: string;
  roles: string[];
  accountNonExpired: boolean;
  accountNonLocked: boolean;
  credentialsNonExpired: boolean;
  enabled: boolean;
  amount: number;

  constructor(id: string) {
    this.id = id;
  }
}
