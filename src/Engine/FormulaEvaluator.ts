import Cell from "./Cell"
import SheetMemory from "./SheetMemory"
import { ErrorMessages } from "./GlobalDefinitions";


type TokenType = string;
type FormulaType = TokenType[];

export class FormulaEvaluator {
  // Define a function called update that takes a string parameter and returns a number
  private _errorOccured: boolean = false;
  private _errorMessage: string = "";
  private _currentFormula: FormulaType = [];
  private _lastResult: number = 0;
  private _sheetMemory: SheetMemory;
  private _result: number = 0;
  private _errorCode: number = 1;

  constructor(memory: SheetMemory) {
    this._sheetMemory = memory;
  }

  /**
   * return true if the token is an operator
   * @param token 
   * @returns Ture if the token is an operator
   */
  private isOperator(token: TokenType): boolean {
    return ["+", "-", "*", "/"].includes(token);
  }

  /**
   * get the precedence of the operator
   * @param operator 
   * @returns  return the precedence of the operator
   */
  private getOperatorPrecedence(operator: string): number {
    switch (operator) {
      case '+':
      case '-':
        return 1;
      case '*':
      case '/':
        return 2;
      default:
        return 0;
    }
  }

  /**
   * evaluate the formula
   * @param tokens 
   */
  evaluate (tokens:FormulaType):void {
    const valueStack: number[] = [];
    const operators: string[] = [];
    this._errorMessage = "";
    let parenthesisCt = 0;

    // check if tokens is vacant
    if (tokens.length === 0){
      this._errorMessage = ErrorMessages.emptyFormula;
      return;
    }

    
    for (let i = 0; i < tokens.length; i++){
      let token = tokens[i];
      // check if parenthesis are balanced
      if (token === "("){
        if (i>0){
          let previousToken = tokens[i-1];
          if (!this.isOperator(previousToken) && previousToken !== "(") {
            this._errorCode = 12;
            break;
          }
        }
        parenthesisCt +=1;
        operators.push(token);
      } else if (token === ")"){
        if(parenthesisCt === 0){
          this._errorCode = 13;
          break
        }else if (tokens[i-1] === "("){
          this._errorCode = 13;
          break;
        }else if (this.isOperator(tokens[i-1])){
          this._errorCode = 10;
          parenthesisCt -=1;
          break;
        }
        while (operators.length  && operators[operators.length - 1] !== "("){
          this.addOperator(operators.pop()!, valueStack);
        }
        operators.pop();
        parenthesisCt -=1;
      }
      // check if the formula starts with an operator
      else if (this.isOperator(token)){
        if (i === 0 || i === tokens.length - 1){
          this._errorCode = 10;
          break;
        } else {
          if (this.isOperator(tokens[i-1]) || this.isOperator(tokens[i+1])){
            this._errorCode = 12;
            break;
          }
          if (this.getOperatorPrecedence(token) <= this.getOperatorPrecedence(operators[operators.length - 1])){
              this.addOperator(operators.pop()!, valueStack);
            }
          }
          operators.push(token);
      } 

    
      
      // check when adding the normal number or cell reference
      if (this.isNumber(token)){
        valueStack.push(Number(token));
      } else if (this.isCellReference(token)){
        let [value, error] = this.getCellValue(token);
        if (error){
          this._errorMessage = error;
          return;
        }
        valueStack.push(value);
      } else if (token === "("){
        operators.push(token);
      } else if (token === ")"){
        while (operators.length  && operators[operators.length - 1] !== "("){
          this.addOperator(operators.pop()!, valueStack);
          if (this._errorMessage) return;
        }
        operators.pop();

      } 
    }
      while (operators.length > 0) {
        this.addOperator(operators.pop()!, valueStack);
        if (this._errorMessage) return;
      }
  
      if (valueStack.length > 1) {
        this._errorMessage = ErrorMessages.invalidFormula;
        return;
      }
  
      this._result = valueStack.pop() || 0;


      switch (this._errorCode) {
        case 0:
          this._errorMessage = ErrorMessages.emptyFormula;
          break;
        case 7:
          this._errorMessage = ErrorMessages.partial;
          break;
        case 8:
          this._errorMessage = ErrorMessages.divideByZero;
          this._result = Infinity;
          break;
        case 9:
          this._errorMessage = ErrorMessages.invalidCell;
          break;
        case 10:
          this._errorMessage = ErrorMessages.invalidFormula;
          break;
        case 11:
          this._errorMessage = ErrorMessages.invalidNumber;
          break;
        case 12:
          this._errorMessage = ErrorMessages.invalidOperator;
          break;
        case 13:
          this._errorMessage = ErrorMessages.missingParentheses;
          break;
        default:
          this._errorMessage = "";
          break;
      }
  }

  /**
   * 
   * @param operator operator to apply to the last two values in the stack
   * @param valueStack stack to store the result(and input)
   * @returns 
   */
  private addOperator(operator: string, valueStack:number[]):void {
    const number1 = valueStack.pop()!;
    const number2 = valueStack.pop()!;
    let result=number1;

    switch (operator){
      case "+":
        result = number2 + number1; 
        break;
      case "-":
        result = number2 - number1;
        break;
      case "*":
        result = number2 * number1;
        break;
      case "/":
        if (number1 === 0) {
          this._errorMessage = ErrorMessages.divideByZero;
          this._result = Infinity;
          return;
        } 
        result = number2 / number1;
        break;
      
      default:
        this._errorMessage = ErrorMessages.invalidOperator;
        return;
      }
      valueStack.push(result);

  }


  public get error(): string {
    return this._errorMessage
  }

  public get result(): number {
    return this._result;
  }




  /**
   * 
   * @param token 
   * @returns true if the toke can be parsed to a number
   */
  isNumber(token: TokenType): boolean {
    return !isNaN(Number(token));
  }

  /**
   * 
   * @param token
   * @returns true if the token is a cell reference
   * 
   */
  isCellReference(token: TokenType): boolean {

    return Cell.isValidCellLabel(token);
  }

  /**
   * 
   * @param token
   * @returns [value, ""] if the cell formula is not empty and has no error
   * @returns [0, error] if the cell has an error
   * @returns [0, ErrorMessages.invalidCell] if the cell formula is empty
   * 
   */
  private getCellValue(token: TokenType): [number, string] {

    let cell = this._sheetMemory.getCellByLabel(token);
    let formula = cell.getFormula();
    let error = cell.getError();

    // if the cell has an error return 0
    if (error !== "" && error !== ErrorMessages.emptyFormula) {
      return [0, error];
    }

    // if the cell formula is empty return 0
    if (formula.length === 0) {
      return [0, ErrorMessages.invalidCell];
    }


    let value = cell.getValue();
    return [value, ""];

  }


}

export default FormulaEvaluator;