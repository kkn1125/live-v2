import { manager } from "./Manager";

describe("Manager Test Suit 1", () => {
  describe("Manager Create Test", () => {
    test("manager create check", () => {
      const room = manager.insertRoom("test");
      const findRoom = manager.findRoom("test");
      expect(room).toStrictEqual(findRoom);
    });
  });

  describe("Manager Create room manager Test", () => {
    test("manager initialize check", () => {
      expect(manager.rooms.length).toStrictEqual(0);
    });
    test("manager create check", () => {
      manager.rooms.insert("test");
      expect(manager.rooms.length).toStrictEqual(1);
    });
    test("manager initialize check", () => {
      // manager.rooms.insert("test");
      expect(manager.rooms.length).toStrictEqual(0);
    });
    test("manager update check", () => {
      manager.rooms.insert("test");
      manager.rooms.update("test", { title: "wow" });
      expect(manager.rooms.findOne("test").title).toStrictEqual("wow");
    });
    test("manager delete check", () => {
      manager.rooms.insert("test1");
      manager.rooms.delete("test1");
      expect(manager.rooms.findAll()).toStrictEqual([]);
    });
    test("manager findAll filtering check 1", () => {
      manager.rooms.insert("test1");
      manager.rooms.insert("test2");
      manager.rooms.insert("test3");
      manager.rooms.insert("test4");
      manager.rooms.insert("wow1");
      manager.rooms.insert("wow2");
      manager.rooms.insert("wow3");
      const founded = manager.rooms.findAll({ query: { id: "1" } });
      expect(founded.length).toStrictEqual(2);
    });
    test("manager findAll filtering check 2", () => {
      manager.rooms.insert("test1");
      manager.rooms.insert("test2");
      manager.rooms.insert("test3");
      manager.rooms.insert("test4");
      manager.rooms.insert("wow1");
      manager.rooms.insert("wow2");
      manager.rooms.insert("wow3");
      const founded = manager.rooms.findAll({
        query: { id: "1" },
        sort: { id: "desc" },
      });
      expect(founded.length).toStrictEqual(2);
    });
    test("manager findAll filtering check 3", () => {
      manager.rooms.insert("test1");
      manager.rooms.insert("test2");
      manager.rooms.insert("test3");
      manager.rooms.insert("test4");
      manager.rooms.insert("wow1");
      manager.rooms.insert("wow2");
      manager.rooms.insert("wow3");
      const founded = manager.rooms.findAll({ sort: { id: "desc" } });
      expect(founded.length).toStrictEqual(7);
    });
    test("manager clearEmpty check 1", () => {
      manager.rooms.insert("test");
      manager.rooms.clearEmpty();
      expect(manager.rooms.length).toStrictEqual(0);
    });
  });

  afterEach(() => {
    manager.initialize();
  });
});
