import { manager } from "./Manager";

describe("Manager Test Suit 1", () => {
  describe("Manager Create Test", () => {
    test("manager create check", () => {
      const room = manager.createRoom("test");
      const findRoom = manager.findRoom("test");
      expect(room).toStrictEqual(findRoom);
    });
  });
});
