export class ApproxPositionModel {
  subject_id: string;
  position: Pos;
  timestamp: number;
  color: string;
  alias: string;
  toAdd: boolean;
}


class Pos {
  x: number;
  y: number;
  type: string;
  coordinates: number[][];
}
