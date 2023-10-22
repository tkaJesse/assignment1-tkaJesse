import SpreadSheetController from "../../Engine/SpreadSheetController";

import { ErrorMessages } from "../../Engine/GlobalDefinitions";

/**
 * The main object of the SpreadSheet
 * 
 * The exported methods are
 * 
 * addToken(token:string):  void
 *   This relies on the TokenProcessor class
 * 
 * getFormulaString(void): string
 *   This relies on the TokenProcessor class
 * 
 * getResultString(void): string
 *    This relies on the Recalc class
 * 
 * 
 */

describe("SpreadSheetController", () => {
  describe("accessControl", () => {
    it("should true if the user asks for access to a cell in the empty sheet", () => {
      const machine = new SpreadSheetController(5, 5);
      const view = machine.requestViewAccess("user1", "A1");
      const result = machine.requestEditAccess("user1", "A1");
      expect(result).toEqual(true);
    });

    it("should false if the user asks for access to a cell that another user owns", () => {
      const machine = new SpreadSheetController(5, 5);
      let view = machine.requestViewAccess("user1", "A1");
      const result = machine.requestEditAccess("user1", "A1");
      view = machine.requestViewAccess("user2", "A1");
      const result2 = machine.requestEditAccess("user2", "A1");
      expect(result2).toEqual(false);
    });

    it("should return true if the user has released access and another user asks for access", () => {
      const machine = new SpreadSheetController(5, 5);
      let view = machine.requestViewAccess("user1", "A1");
      const result = machine.requestEditAccess("user1", "A1");
      const result2 = machine.releaseEditAccess("user1");
      view = machine.requestViewAccess("user2", "A1");
      const result3 = machine.requestEditAccess("user2", "A1");
      expect(result3).toEqual(true);
    });
  });

  describe("editing the sheet", () => {
    it("should return two formulas for two users editing a sheet", () => {
      const machine = new SpreadSheetController(5, 5);
      let view = machine.requestViewAccess("user1", "A1");
      machine.requestEditAccess("user1", "A1");
      machine.addToken("1", "user1");
      machine.addToken("+", "user1");
      machine.addToken("7", "user1");

      view = machine.requestViewAccess("user2", "A2");
      machine.requestEditAccess("user2", "A2");
      machine.addToken("2", "user2");
      machine.addToken("+", "user2");
      machine.addToken("2", "user2");
      machine.addToken(".", "user2");
      machine.addToken("5", "user2");

      const user1Formula = machine.getFormulaStringForUser("user1");

      expect(machine.getFormulaStringForUser("user1")).toEqual("1 + 7");
      expect(machine.getFormulaStringForUser("user2")).toEqual("2 + 2.5");

    });

    it("should ignore requests to update cell from non user", () => {
      const machine = new SpreadSheetController(5, 5);
      machine.requestViewAccess("user1", "A1");
      machine.requestEditAccess("user1", "A1");
      machine.addToken("1", "user1");
      machine.addToken("+", "user1");
      machine.addToken("7", "user1");

      machine.requestViewAccess("user2", "A2");
      machine.requestEditAccess("user2", "A1");
      machine.addToken("2", "user2");
      machine.addToken("+", "user2");
      machine.addToken("2", "user2");
      machine.addToken(".", "user2");
      machine.addToken("5", "user2");

      const user1Formula = machine.getFormulaStringForUser("user1");
      const user2Formula = machine.getFormulaStringForUser("user2");

      expect(machine.getFormulaStringForUser("user1")).toEqual("1 + 7");
      expect(machine.getFormulaStringForUser("user2")).toEqual("1 + 7");

    });

    it("should add a cell to the user formula", () => {
      const machine = new SpreadSheetController(5, 5);
      let view = machine.requestViewAccess("user1", "A1");
      machine.requestEditAccess("user1", "A1");
      machine.addToken("1", "user1");
      machine.addToken("+", "user1");
      machine.addToken("7", "user1");

      view = machine.requestViewAccess("user2", "A2");
      machine.requestEditAccess("user2", "A2");
      machine.addCell("A1", "user2");

      const user1Formula = machine.getFormulaStringForUser("user1");
      const user2Formula = machine.getFormulaStringForUser("user2");
      const user1Result = machine.getResultStringForUser("user1");
      const user2Result = machine.getResultStringForUser("user2");
      expect(user1Formula).toEqual("1 + 7");
      expect(user2Formula).toEqual("A1");
      expect(user1Result).toEqual("8");
      expect(user2Result).toEqual("8");
    });

    it("should not add a cell that could produce a circular reference", () => {
      const machine = new SpreadSheetController(5, 5);
      machine.requestViewAccess("user1", "A1");
      machine.requestEditAccess("user1", "A1");
      machine.addToken("1", "user1");
      machine.addToken("+", "user1");
      machine.addCell("A2", "user1");

      machine.requestViewAccess("user2", "A2");
      const accessControl = machine.requestEditAccess("user2", "A2");
      machine.requestEditAccess("user2", "A2");
      machine.addToken("1", "user2");
      machine.addToken("+", "user2");
      machine.addCell("A1", "user2");

      const user1Formula = machine.getFormulaStringForUser("user1");
      const user2Formula = machine.getFormulaStringForUser("user2");
      const user1Result = machine.getResultStringForUser("user1");
      const user2Result = machine.getResultStringForUser("user2");
      expect(user1Formula).toEqual("1 + A2");
      expect(user2Formula).toEqual("1 +");
      expect(user1Result).toEqual("#ERR");
      expect(user2Result).toEqual("#ERR");
    });

    it("should not add a cell after the offending cell is removed.", () => {
      const machine = new SpreadSheetController(5, 5);
      let view = machine.requestViewAccess("user1", "A1");
      machine.requestEditAccess("user1", "A1");
      machine.addToken("1", "user1");
      machine.addToken("+", "user1");
      machine.addCell("A2", "user1");

      view = machine.requestViewAccess("user2", "A2");
      machine.requestEditAccess("user2", "A2");
      machine.addToken("1", "user2");
      machine.addToken("+", "user2");
      machine.addCell("A1", "user2");

      let user1Formula = machine.getFormulaStringForUser("user1");
      let user2Formula = machine.getFormulaStringForUser("user2");
      let user1Result = machine.getResultStringForUser("user1");
      let user2Result = machine.getResultStringForUser("user2");
      expect(user1Formula).toEqual("1 + A2");
      expect(user2Formula).toEqual("1 +");
      expect(user1Result).toEqual("#ERR");
      expect(user2Result).toEqual("#ERR");

      machine.removeToken("user1");
      machine.addCell("B3", "user1");
      view = machine.requestViewAccess("user1", "B3");
      machine.requestEditAccess("user1", "B3");
      machine.addToken("1", "user1");
      machine.addToken("7", "user1");

      machine.addCell("A1", "user2");
      view = machine.requestViewAccess("user1", "A1");
      machine.requestEditAccess("user1", "A1");
      user1Formula = machine.getFormulaStringForUser("user1");
      user2Formula = machine.getFormulaStringForUser("user2");
      user1Result = machine.getResultStringForUser("user1");
      user2Result = machine.getResultStringForUser("user2");
      expect(user1Formula).toEqual("1 + B3");
      expect(user2Formula).toEqual("1 + A1");
      expect(user1Result).toEqual("18");
      expect(user2Result).toEqual("19");q


    });
  });
});
