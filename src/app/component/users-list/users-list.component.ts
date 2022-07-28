import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {Point} from 'leaflet';
import {ApproxPositionModel} from '../../model/approx-position.model';
import {toInteger} from '@ng-bootstrap/ng-bootstrap/util/util';
import {UserDataService} from '../../service/user-data.service';
import {Position} from '../../model/position';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.css']
})
export class UsersListComponent implements OnInit, OnChanges {
  message: object;
  usersList = new Map<string, object>();
  sellerUsers = new Map<string, object>();
  sellerUsersCopy = new Map<string, object>();
  n_positions = 0;
  tot_positions_user: number;
  isDrawed: boolean;
  positionPoints;
  polygonPoints: Position[];
  positionPointsInsightPolygon;
  approxPositionsList;
  @Input() positionsDrawable: Point[] = [];

  constructor(private data: UserDataService) {
  }


  ngOnInit() {
    // Registrazione sulla variabile message del service UserDataService
    // (serve per la comunicazione tra componenti, in questo caso tra componenti fratelli.
    // La user-list manda un messaggio a mappa e temporal-chart.
    this.data.currentMessage.subscribe(message => this.message = message);
    this.polygonPoints = [];
    this.positionPoints = [];
    this.positionPointsInsightPolygon = [];
  }

  // Riceve la risposta del server dal padre e stampa la lista degli utenti
  ngOnChanges(changes: SimpleChanges) {
    if (!changes.positionsDrawable.firstChange) {
      this.approxPositionsList = changes.positionsDrawable.currentValue.approxPositionsList;
      let approxPositionTimestamps = changes.positionsDrawable.currentValue.timelineList;
      this.isDrawed = changes.positionsDrawable.currentValue.isDrawed;
      this.printUserList(approxPositionTimestamps);
    }
  }

  // Stampa la lista degli utenti correnti dalla mappa usersList
  printUserList(approxPositionTimestamps: ApproxPositionModel[]): void {
    // salva nella mappa sellerUsersCopy la vecchia mappa sellerUsers
    this.sellerUsersCopy = new Map<string, object>();
    this.sellerUsers.forEach((value: object, key: string) => {
      this.sellerUsersCopy.set(key, value);
    });
    this.usersList = new Map<string, object>();
    this.sellerUsers = new Map<string, object>();
    // Recupera le informazioni per ogni posizione ricevuta;
    // se usernaneID non è presente nella mappa usersList, salva l'utente con le sue info nelle mappe usersList e sellerUsers;
    // se usernameID è già presente nella mappa usersList, sovrascrivi l'utente con le sue info e il numero delle sue posizioni + 1
    // nelle mappe usersList e sellerUsers
    if (approxPositionTimestamps != null && approxPositionTimestamps.length > 0) {
      for (let i = 0, j = 0; i < approxPositionTimestamps.length; i++, j++) {
        let usernameAlias = approxPositionTimestamps[i].alias;
        let usernameID = approxPositionTimestamps[i].subject_id;
        let toAdd = approxPositionTimestamps[i].toAdd;
        let color = approxPositionTimestamps[i].color;
        let positions = this.findUserPositions(usernameAlias);
        if (this.usersList.get(usernameID) === undefined) {
          // tslint:disable-next-line:max-line-length
          this.usersList.set(usernameID, {
            usernameAlias: usernameAlias,
            usernameID: usernameID,
            n_positions: 1,
            color: color,
            toAdd: toAdd,
            positions: positions
          });
          // tslint:disable-next-line:max-line-length
          this.sellerUsers.set(usernameID, {
            usernameAlias: usernameAlias,
            usernameID: usernameID,
            n_positions: 1,
            color: color,
            toAdd: toAdd,
            positions: positions
          });
        } else {
          let n_pos = toInteger(this.usersList.get(usernameID)['n_positions']);
          n_pos++;
          // tslint:disable-next-line:max-line-length
          this.usersList.set(usernameID, {
            usernameAlias: usernameAlias,
            usernameID: usernameID,
            n_positions: n_pos,
            color: color,
            toAdd: toAdd,
            positions: positions
          });
          // tslint:disable-next-line:max-line-length
          this.sellerUsers.set(usernameID, {
            usernameAlias: usernameAlias,
            usernameID: usernameID,
            n_positions: n_pos,
            color: color,
            toAdd: toAdd,
            positions: positions
          });
        }
      }
    }
    if (this.isDrawed === undefined || this.isDrawed === true) {
      // update list with users who are in the polygon
      this.sellerUsersCopy.forEach((value: object, key: string) => {
        this.sellerUsers.set(key, value);
      });
    }
  }

  // Restituisce le posizioni (con le coordinate) di un utente
  findUserPositions(usernameAlias: string): number[]  {
    let positions: number[];
    positions = [];
    for (let i = 0; i < this.approxPositionsList.length; i++) {
      if (this.approxPositionsList[i][0]['alias'] === usernameAlias) {
       for (let j = 0; j < this.approxPositionsList[i].length; j++) {
         positions.push(this.approxPositionsList[i][j]['position']);
       }
       break;
      }
    }
    return positions;
  }

  // Cancella la mappa usersList (lo fa il padre tramite ViewChild)
  deleteUsers() {
    this.usersList.clear();
  }

  // Quando si clicca su un utente della user-list, notifica questo utente a mappa e temporal chart e
  // notifica al padre il numero di posizioni da togliere/aggiungere
  updateMapAndChart(e, user: object) {
    let index = 9;
    let n_pos = this.usersList.get(user['usernameID'])['n_positions'];
    if (e.target.checked) {
      this.tot_positions_user = n_pos;
      // tslint:disable-next-line:max-line-length
      this.data.changeMessage({
        'usernameID': user['usernameID'],
        'usernameAlias': user['usernameAlias'],
        'toAdd': true,
        'color': user['color'],
        'index': index,
        'positions': user['positions']
      });
      // tslint:disable-next-line:max-line-length
      this.sellerUsers.set(user['usernameID'], {
        'usernameID': user['usernameID'],
        'usernameAlias': user['usernameAlias'],
        n_positions: n_pos,
        color: user['color'],
        toAdd: true,
        positions: user['positions']
      });
    } else {
      this.tot_positions_user = -n_pos;
      // tslint:disable-next-line:max-line-length
      this.data.changeMessage({
        'usernameID': user['usernameID'],
        'usernameAlias': user['usernameAlias'],
        'toAdd': false,
        'color': user['color'],
        'index': index,
        'positions': user['positions']
      });
      // tslint:disable-next-line:max-line-length
      this.sellerUsers.set(user['usernameID'], {
        'usernameID': user['usernameID'],
        'usernameAlias': user['usernameAlias'],
        n_positions: n_pos,
        color: user['color'],
        toAdd: false,
        positions: user['positions']
      });
    }
  }

  getValues(map) {
    return Array.from(map.values());
  }
}
