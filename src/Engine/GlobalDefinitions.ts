
export const ErrorMessages = {
  partial: "#ERR",
  divideByZero: "#DIV/0!",
  invalidCell: "#REF!",
  invalidFormula: "#ERR",
  invalidNumber: "#ERR",
  invalidOperator: "#ERR",
  missingParentheses: "#ERR",
  emptyFormula: "#EMPTY!", // this is not an error message but we use it to indicate that the cell is empty
  negativeRoot: "#ERR",
  outOfRange: "#ERR",
}

export const ButtonNames = {
  edit_toggle: "edit-toggle",
  edit: "edit",
  done: "=",
  allClear: "AC",
  clear: "C",
  negative: "+/-",
  rand: "Rand",
  sqrt: "\u{221A}x",
  cubeRoot: "\u{221B}x",
  sqr: "x\u{00B2}",
  cube: "x\u{00B3}",
  sin: "sin",
  cos: "cos",
  tan: "tan",
  asin: "sin\u{207B}",
  acos: "cos\u{207B}",
  atan: "tan\u{207B}",
}

export interface CellTransport {
  formula: string[];
  value: number;
  error: string;
  editing: string;
}

// add export UserEditing
export interface UserEditing {
  user: string;
  cell: string;
}

export interface CellTransportMap {
  [key: string]: CellTransport;
}
export interface DocumentTransport {
  columns: number;
  rows: number;
  cells: Map<string, CellTransport>;
  formula: string;
  result: string;
  currentCell: string;
  isEditing: boolean;
  contributingUsers: UserEditing[];
}

