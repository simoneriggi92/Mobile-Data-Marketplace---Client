export class InvalidPosition {

  error : PositionArray[];
}

export class PositionArray {
  id: string;
  position: Pos;
  timestamp: number;
  description: string;
}

class Pos {
  x: number;
  y: number;
  type: string;
  coordinates: number[][];
}
