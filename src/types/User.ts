import _ from 'lodash';

class User {
  name: string | undefined;
  roles: string[] = [];

  public HasRole(role: string): boolean {
    return this.roles.includes(role);
  }
}

export default User;
