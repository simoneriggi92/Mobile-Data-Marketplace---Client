import {Injectable} from '@angular/core';
import {MessageService} from './message.service';

@Injectable({
  providedIn: 'root'
})
export class PositionService {

  users: string[];
  positionList: Position[] = [];
  oldestTimestamp: number;

  constructor(private messageService: MessageService) {
  }

  getPositionsInsidePolygon(positions: Position[], polygon: number [][], timestamps: number[]): string[] {
    this.positionList = [];
    this.users = new Array();
    let info: string[] = [];

    let endTimestamp = timestamps.pop();
    let startTimestamp = timestamps.pop();
    let position_number: number;
    position_number = 0;

    info.push('Number of positions: ' + position_number);
    info.push('Number of users: ' + this.users.length);
    this.messageService.add('Number of positions: ' + position_number + '   Number of users: ' + this.users.length);
    return info;
  }

  getValidPosition(): Position[] {
    return this.positionList;
  }

}
