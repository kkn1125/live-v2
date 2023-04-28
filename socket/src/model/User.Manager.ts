import ManagerImpl from "./ManagerImpl";
import User from "./User";

export default class UserManager
  extends Array<User>
  implements ManagerImpl<User>
{
  initialize(): void {
    this.splice(0, this.length);
    console.log("initialize", this);
  }

  findAll({
    query,
    sort,
  }: {
    query?: { [k in keyof User]?: User[keyof User] };
    sort?: { [k in keyof User]?: "asc" | "desc" | "ASC" | "DESC" };
  }): User[] {
    let temp: User[] = this.slice(0);

    if (query) {
      const entries = Object.entries(query);

      temp = this.filter((user) =>
        entries.find((q) =>
          new RegExp(String(q[1]), "g").test(user[q[0] as keyof User] as any)
        )
      );
    }

    if (sort) {
      const [key, ordering] = Object.entries(sort)[0] as [
        keyof User,
        "asc" | "desc" | "ASC" | "DESC"
      ];
      const order = ordering.toLowerCase() === "asc";

      temp = temp.sort((beforeUser, afterUser) => {
        return ((order ? beforeUser : afterUser)[key] as string).localeCompare(
          (order ? afterUser : beforeUser)[key] as string
        );
      });
    }
    return temp;
  }

  findOne(id: string): User {
    return this.find((user) => user.id === id);
  }

  findOneIndex(id: string): number {
    return this.findIndex((user) => user.id === id);
  }

  insert(id: string): User {
    const user = new User(id);
    this.push(user);
    return user;
  }

  update(id: string, newUser: User): User {
    const user = this.find((user) => user.id === id);
    if (user) {
      Object.assign(user, newUser);
      // console.log("user update", user);
    }
    return user;
  }

  delete(id: string): boolean {
    const index = this.findIndex((user) => user.id === id);
    if (index > -1) {
      const deletedUser = this.splice(index, 1)[0];
      // console.log("user delete", deletedUser);
      return true;
    }
    return false;
  }
}
