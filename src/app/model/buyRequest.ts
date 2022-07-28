import {Archive} from './archive';
import {Position} from './position';
import {UserModel} from './user.model';
import {PositionsContainer} from './positionsContainer';

export class BuyRequest {

  archiveList: Archive[];
  polygonPoints: Position[];
  usersList: UserModel[];
  previousResponse: PositionsContainer;

  constructor(archivesList: Archive[], polygonPoints: Position[], usersList: UserModel[], previousResponse: PositionsContainer) {
    this.archiveList = archivesList;
    this.polygonPoints = polygonPoints;
    this.usersList = usersList;
    this.previousResponse = previousResponse;
  }
}
