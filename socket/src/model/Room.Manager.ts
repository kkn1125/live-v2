import ManagerImpl from "./ManagerImpl";
import Room from "./Room";

export default class RoomManager
  extends Array<Room>
  implements ManagerImpl<Room>
{
  initialize(): void {
    this.splice(0, this.length);
    console.log("initialize", this);
  }

  findAll({
    query,
    sort,
  }: {
    query?: { [k in keyof Room]?: Room[keyof Room] };
    sort?: { [k in keyof Room]?: "asc" | "desc" | "ASC" | "DESC" };
  } = {}) {
    let temp: Room[] = this.slice(0);

    if (query) {
      const entries = Object.entries(query);

      temp = this.filter((room) =>
        entries.find((q) =>
          new RegExp(String(q[1]), "g").test(room[q[0] as keyof Room] as any)
        )
      );
    }

    if (sort) {
      const [key, ordering] = Object.entries(sort)[0] as [
        keyof Room,
        "asc" | "desc" | "ASC" | "DESC"
      ];
      const order = ordering.toLowerCase() === "asc";

      temp = temp.sort((beforeRoom, afterRoom) => {
        return ((order ? beforeRoom : afterRoom)[key] as string).localeCompare(
          (order ? afterRoom : beforeRoom)[key] as string
        );
      });
    }
    return temp;
  }

  findOne(id: string) {
    return this.find((room) => room.id === id);
  }

  findOneUserIn(userId: string) {
    const room = this.find((room) => room.findUser(userId));
    return room;
  }

  findOneIndex(id: string) {
    return this.findIndex((room) => room.id === id);
  }

  insert(id: string) {
    const room = new Room(id);
    this.push(room);
    return room;
  }

  update(id: string, newRoom: Object) {
    const room = this.findOne(id);
    if (room) {
      Object.assign(room, { ...newRoom });
      // console.log("room update", room);
    }
    return room;
  }

  delete(id: string) {
    const index = this.findOneIndex(id);
    if (index > -1) {
      const deletedRoom = this.splice(index, 1)[0];
      // console.log("room delete", deletedRoom);
      return true;
    }
    return false;
  }

  findUser(userId: string) {
    let temp = undefined;
    for (let room of this) {
      if (room.hasUser(userId)) {
        temp = room.findUser(userId);
        break;
      }
    }
    return temp;
  }

  findEmpty() {
    return this.findAll().filter((room) => room.isEmpty());
  }

  clearEmpty() {
    this.findEmpty().forEach((room) => {
      this.delete(room.id);
    });
  }
}
