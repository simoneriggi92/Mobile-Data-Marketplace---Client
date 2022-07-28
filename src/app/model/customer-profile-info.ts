export class CustomerProfileInfo {
  username: string;
  roles: JSON[];
  accountNonExpired: boolean;
  accountNonLocked: boolean;
  credentialsNonExpired: boolean;
  enabled: boolean;
  amount: number;
}

class Roles {
  name: string;
}
