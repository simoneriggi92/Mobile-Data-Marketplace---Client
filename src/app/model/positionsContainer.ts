import {Archive} from './archive';

export class PositionsContainer {

  n_users: number;
  approxPositionsList: any[];  // Nel Server:  private List<List<ApproximatedPositionCoordinatesEntity>> approxPositionsList;
  timelineList: any[];         // Nel Server:  private List<ApproximatedPositionTimestampEntity>timelineList;
  archiveList: Archive[];
  total: number;
  n_positions: number;
  isDrawed: boolean;
}
