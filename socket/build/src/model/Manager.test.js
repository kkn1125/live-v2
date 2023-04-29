"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Manager_1 = require("./Manager");
describe("Manager Test Suit 1", () => {
    describe("Manager Create Test", () => {
        test("manager create check", () => {
            const room = Manager_1.manager.rooms.insert("test");
            const findRoom = Manager_1.manager.rooms.findOne("test");
            expect(room).toStrictEqual(findRoom);
        });
    });
    describe("Manager Create room manager Test", () => {
        test("manager initialize check", () => {
            expect(Manager_1.manager.rooms.length).toStrictEqual(0);
        });
        test("manager create check", () => {
            Manager_1.manager.rooms.insert("test");
            expect(Manager_1.manager.rooms.length).toStrictEqual(1);
        });
        test("manager initialize check", () => {
            // manager.rooms.insert("test");
            expect(Manager_1.manager.rooms.length).toStrictEqual(0);
        });
        test("manager update check", () => {
            Manager_1.manager.rooms.insert("test");
            Manager_1.manager.rooms.update("test", { title: "wow" });
            expect(Manager_1.manager.rooms.findOne("test").title).toStrictEqual("wow");
        });
        test("manager delete check", () => {
            Manager_1.manager.rooms.insert("test1");
            Manager_1.manager.rooms.delete("test1");
            expect(Manager_1.manager.rooms.findAll()).toStrictEqual([]);
        });
        test("manager findAll filtering check 1", () => {
            Manager_1.manager.rooms.insert("test1");
            Manager_1.manager.rooms.insert("test2");
            Manager_1.manager.rooms.insert("test3");
            Manager_1.manager.rooms.insert("test4");
            Manager_1.manager.rooms.insert("wow1");
            Manager_1.manager.rooms.insert("wow2");
            Manager_1.manager.rooms.insert("wow3");
            const founded = Manager_1.manager.rooms.findAll({ query: { id: "1" } });
            expect(founded.length).toStrictEqual(2);
        });
        test("manager findAll filtering check 2", () => {
            Manager_1.manager.rooms.insert("test1");
            Manager_1.manager.rooms.insert("test2");
            Manager_1.manager.rooms.insert("test3");
            Manager_1.manager.rooms.insert("test4");
            Manager_1.manager.rooms.insert("wow1");
            Manager_1.manager.rooms.insert("wow2");
            Manager_1.manager.rooms.insert("wow3");
            const founded = Manager_1.manager.rooms.findAll({
                query: { id: "1" },
                sort: { id: "desc" },
            });
            expect(founded.length).toStrictEqual(2);
        });
        test("manager findAll filtering check 3", () => {
            Manager_1.manager.rooms.insert("test1");
            Manager_1.manager.rooms.insert("test2");
            Manager_1.manager.rooms.insert("test3");
            Manager_1.manager.rooms.insert("test4");
            Manager_1.manager.rooms.insert("wow1");
            Manager_1.manager.rooms.insert("wow2");
            Manager_1.manager.rooms.insert("wow3");
            const founded = Manager_1.manager.rooms.findAll({ sort: { id: "desc" } });
            expect(founded.length).toStrictEqual(7);
        });
        test("manager clearEmpty check 1", () => {
            Manager_1.manager.rooms.insert("test");
            Manager_1.manager.rooms.clearEmpty();
            expect(Manager_1.manager.rooms.length).toStrictEqual(0);
        });
    });
    afterEach(() => {
        Manager_1.manager.initialize();
    });
});
