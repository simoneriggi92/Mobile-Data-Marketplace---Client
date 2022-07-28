import {ApproxPositionModel} from './approx-position.model';

export class PositionsResponseContainer {
  n_users: number;
  approxPositionsList: ApproxPositionModel[][];
  timelineList: string[];
  archiveList: string[];
}
