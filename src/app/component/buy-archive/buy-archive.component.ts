import {Component, OnInit, ViewChild} from '@angular/core';
import {Time} from '@angular/common';
import {BuyArchiveService} from '../../service/buy-archive.service';
import {Position} from '../../model/position';
import {HttpErrorResponse} from '@angular/common/http';
import {FormBuilder} from '@angular/forms';
import {TemporalChartComponent} from '../temporal-chart/temporal-chart.component';
import {toInteger} from '@ng-bootstrap/ng-bootstrap/util/util';
import {PositionsContainer} from '../../model/positionsContainer';
import {UsersListComponent} from '../users-list/users-list.component';
import {Subject} from 'rxjs';
import {debounceTime} from 'rxjs/operators';
import {ModalComponent} from '../modal/modal.component';
import {BuyRequest} from '../../model/buyRequest';
import {MainMapComponent} from '../main-map/main-map.component';
import {UserModel} from '../../model/user.model';
import {InputRangeDatePickerComponent} from '../input-range-date-picker/input-range-date-picker.component';
import {Router} from '@angular/router';

@Component({
  selector: 'app-buy-archive',
  templateUrl: './buy-archive.component.html',
  styleUrls: ['./buy-archive.component.css']
})
export class BuyArchiveComponent implements OnInit {

  enabledGetPosition = false;
  result: PositionsContainer;
  startDate: number;
  endDate: number;
  startTime: Time;
  endTime: Time;
  pointsInPolygon: Position[];
  generalPoints: Position[];
  dangerMessage: string;
  count: number;
  isBuyable: boolean;
  isDrawed: boolean;
  hashNameMap;
  userColorMap;                    // userColorMap salva user e colore
  definitiveUserColorMap;          // definitiveUserColorMap salva user e colori vecchi e toglie gli user non più presenti
  userSet;
  randomColors;
  totPositionsSelected: number;
  oldTotPostionsSelected: number;
  showPositionsSelected: boolean;
  resetComponents: boolean;
  poligono: any;
  @ViewChild(InputRangeDatePickerComponent) inputRangeDatetimePicker: InputRangeDatePickerComponent;
  @ViewChild(UsersListComponent) listChild: UsersListComponent;
  @ViewChild(TemporalChartComponent) tempChild: TemporalChartComponent;
  @ViewChild(MainMapComponent) mainMapComponent: MainMapComponent;
  @ViewChild(ModalComponent) modalComponent: ModalComponent;
  private _error = new Subject<string>();

  constructor(private formBuilder: FormBuilder, private buyArchiveService: BuyArchiveService, private router: Router) {
    this.count = 0;
  }

  ngOnInit() {
    this.showPositionsSelected = false;
    this.totPositionsSelected = 0;
    this.randomColors = [];
    this.hashNameMap = new Map<string, string>();
    this.userColorMap = new Map<string, string>();
    this.definitiveUserColorMap = new Map<string, string>();
    this.userSet = new Set<string>();
    this._error.subscribe((message) => this.dangerMessage = message);
    this._error.pipe(
      debounceTime(3000)
    ).subscribe(() => this.dangerMessage = null);
  }

  askPositions(startDate: number, endDate: number, startTime: any, endTime: any, points: Position[], requestFromButton: boolean): any {
    // rimuovi poligono e drawControl se già esistenti e ri-aggiungi drawControl con bottoni rectangle e polygon abilitati
    if (requestFromButton === true && this.mainMapComponent.polygonID !== undefined) {
      this.mainMapComponent.map.removeLayer(this.mainMapComponent.map['_layers'][this.mainMapComponent.polygonID]);
      this.mainMapComponent.onDrawDeleted(null);
      this.mainMapComponent.map.removeControl(this.mainMapComponent.drawControl);
      this.mainMapComponent.drawControl.setDrawingOptions({
        rectangle: {},
        polygon: {}
      });
      this.mainMapComponent.drawControl.addTo(this.mainMapComponent.map);
    }

    if (startTime === undefined) {
      startTime = {hour: 14, minute: 30, second: 0};
    }
    if (endTime === undefined) {
      endTime = {hour: 14, minute: 30, second: 0};
    }
    let startD = new Date(startDate * 1000);
    let endD = new Date(endDate * 1000);
    let from = new Date(Date.UTC(startD.getUTCFullYear(), startD.getUTCMonth(), startD.getUTCDate(), startTime.hour, startTime.minute));
    let to = new Date(Date.UTC(endD.getUTCFullYear(), endD.getUTCMonth(), endD.getUTCDate(), endTime.hour, endTime.minute));
    let startTimestamp = from.getTime() / 1000;
    let endTimestamp = to.getTime() / 1000;

    this.buyArchiveService.getAllUsersPositionsInPoligon(startTimestamp, endTimestamp, points).subscribe(
      data => {
        if (data instanceof HttpErrorResponse) {
          // La richiesta ha avuto esito negativo (alert).
          if (data.status === 404) {
            this.listChild.deleteUsers();
            this.tempChild.deleteChart();
            this._error.next('Positions not founded');
            this.tempChild.drawPosTime = false;
            if (this.isDrawed === undefined || this.isDrawed === false) {
              this.totPositionsSelected = 0;
            }
            this.result = new PositionsContainer();
          }
          return null;
        } else {
          let dataWithColors = data;
          // Genera e setta i nuovi colori random per gli utenti della corrente risposta del server
          // (questi colori verrano sostuiti con i colori originali, se è il caso, cioè se un utente esisteva già, il suo colore sarà
          //  quello pre-esistente e non il nuovo colore generato randomicamente).
          this.randomColors = this.getRandomColors(dataWithColors.n_users);

          let i = 0;
          let j = 0;
          this.userSet = new Set<string>();
          dataWithColors.timelineList.forEach(p => {
            // Controlla se gli utenti nella risposta del server sono al momento presenti nella user-list e
            // per ogni utente già presente in user-list, se questo è non checkato,
            // setta l'attributo toAdd = false in modo che i figli temporal chart e mappa non visualizzino questo utente
            // e la figlia user-list visualizzi questo utente come non checkato [?]
            let userInList = this.listChild.sellerUsers.get(p.subject_id);
            if (userInList !== undefined && userInList['toAdd'] === false) {
              p.toAdd = false;
            } else {
              p.toAdd = true;
            }

            // Salvo nel set userSet tutti e soli gli id degli utenti della risposta del server attuale
            // (mi serve per impostare una successiva operazione di filtraggio dall'array colorArray ricavato
            // dalla definitiveUserColorMap).
            this.userSet.add(p.subject_id);

            // Se la userColorMap non ha l'utente corrente, se lo salva con il suo colore preso dall'array ramdomColors,
            // altrimenti non se lo salva e resta quindi salvato nella mappa l'utente con il suo colore originale
            if (this.userColorMap.get(p.subject_id) === undefined) {
              this.userColorMap.set(p.subject_id, this.randomColors[i]);
              i++; // incrementa i in modo da assegnare un altro colore al prossimo utente
            }

            // Se la definitiveUserColorMap non ha l'utente corrente, se lo salva con il suo colore, altrimenti non se lo salva
            // e resta quindi l'utente con il suo colore originale
            if (this.definitiveUserColorMap.get(p.subject_id) === undefined) {
              this.definitiveUserColorMap.set(p.subject_id, this.randomColors[j]);
              j++; // incrementa j in modo da assegnare un altro colore al prossimo utente
            }
          });

          // Sostituzione del colore nuovo con il colore originale, per ogni utente della definitiveUserColorMap.
          // Per ogni utente delle definitiveUserColorMap, se presente nella userColorMap, si sostituisce il colore nuovo
          // con quello originale derivato dalla userColorMap (re-set del colore)
          this.definitiveUserColorMap.forEach((value: string, key: string) => {
            if (this.userColorMap.get(key) !== undefined) {
              this.definitiveUserColorMap.set(key, this.userColorMap.get(key));
            }
          });

          // Se un utente della definitiveUserColorMap non è presente nell'userSet (vale a dire che non è un utente della risposta attuale),
          // associa a questo utente il colore 'delete' (questo colore verrà filtrato dall'array colorArray e potrà essere in futuro
          // resettato a un colore RGB valido con una successiva risposta dal server quando l'utente in questione farà di nuovo parte
          // della risposta del server)
          this.userColorMap.forEach((value: string, key: string) => {
            if (!this.userSet.has(key)) {
              this.definitiveUserColorMap.set(key, 'delete');
            }
          });

          // Crea un array correctColorArray che contiene tutti e soli i colori degli utenti
          // appartenenti alla risposta del server; i colori degli utenti sono quelli originali
          // per gli utenti che sono già comparsi in una o più precedenti risposte del server, e/o
          // nuovi colori assegnati per la corrente risposta dal server i cui utenti non sono mai
          // comparsi in precedenti risposte dal server (per i quali non esistono colori pre-esistenti)
          let colorArray = [];
          let correctColorArray = [];
          colorArray = Array.from(this.definitiveUserColorMap.values());
          correctColorArray = colorArray.filter(c => {
            return c !== 'delete';
          });
          this.randomColors = correctColorArray;

          // aggiungi campo color alla timelineList, prendendolo dalla definitiveUserColorMap
          dataWithColors.timelineList.forEach(p => {
            p.color = this.definitiveUserColorMap.get(p.subject_id);
          });
          // aggiungi campo color alla approxPositionList, prendendolo dalla definitiveUserColorMap
          dataWithColors.approxPositionsList.forEach(p => {
            p.forEach(q => {
              q.color = this.definitiveUserColorMap.get(q.subject_id);
            });
          });
          // aggiorna totPositionsSelected
          if (this.mainMapComponent.polygonID === undefined) {
            this.totPositionsSelected = 0;
            dataWithColors.approxPositionsList.forEach(p => {
              this.totPositionsSelected += p.length;
            });
            // recupera numero posizioni NON selezionate dalla lista utenti
            this.listChild.sellerUsers.forEach((value: object, key: string) => {
              if (value['toAdd'] === false) {
                this.totPositionsSelected -= value['n_positions'];
              }
            });
            this.oldTotPostionsSelected = this.totPositionsSelected;
            this.showPositionsSelected = true;
          }

          if (this.mainMapComponent.polygonID !== undefined && requestFromButton === false) {
            console.log('poligono trascinato');
            this.oldTotPostionsSelected = 0;
            dataWithColors.approxPositionsList.forEach(p => {
              this.oldTotPostionsSelected += p.length;
            });
          }

          // notifica ai figli che il poligono è stato disegnato
          if (this.isDrawed === undefined) {
            dataWithColors.isDrawed = false;
          } else {
            dataWithColors.isDrawed = this.isDrawed;
          }

          this.result = dataWithColors; // imposta result e sveglia i figli con ngOnChanges()
          this.isBuyable = true;
          this.mainMapComponent.enableDraw = true;
          return data;
        }
      }, error => {
        // this.result = new PositionsContainer();
      }
    );
  }

  buy(result: PositionsContainer, startDate: number, endDate: number, startTime: any, endTime: any) {
    let usersChecked: UserModel[] = [];   // creo la lista degli utenti checkati, che dovrò inserire nel bodi della richiesta
    this.listChild.sellerUsers.forEach((value: object, key: string) => {
      if (value['toAdd']) {
        usersChecked.push(new UserModel(value['usernameID']));
      }
    });

    let buyRequest;

    if (!this.isDrawed) {
      buyRequest = new BuyRequest([], this.generalPoints, usersChecked, this.result);
      // buyableArchive = new BuyRequest(result.archiveList, this.generalPoints, null);
    } else {
      buyRequest = new BuyRequest([], this.pointsInPolygon, usersChecked, this.result);
      // buyableArchive = new BuyRequest(result.archiveList, this.pointsInPolygon, null);
    }

    let FromTo = this.createTimestampFromDate(startDate, endDate, startTime, endTime);
    this.buyArchiveService.tryToBuy(buyRequest, FromTo[0], FromTo[1]).subscribe(
      (data) => {
        if (data) {
          // Show Modal
          this.modalComponent.openVertical(data);
        }
      }, (error) => {
        if (error.status === 403 || error.status === 404) {
          this._error.next('Required positions not founded, please ask for positions again, then retry buying them.');
        } else {
          this._error.next('Server Connection Failed');
        }
        this.tempChild.drawPosTime = false;
      }
    );
  }

  // Restituisce una lista di colori casuali, tanti colori (distinti) quanti sono gli utenti
  getRandomColors(numberOfClient: number): string[] {
    let colors = this.fulFillCustomersColors();
    let targetColors: string[];
    targetColors = [];

    // Togli dall'array colors i colori già presenti nella mappa definitiveUserColorMap
    // così non potranno esserci utenti diversi con lo stesso colore
    this.definitiveUserColorMap.forEach((value: string, key: string) => {
      let index = colors.indexOf(value);
      if (index !== -1) {
        colors.splice(index, 1);
      }
    });

    // Riempi l'array targetColors con un numero di colori pari a numberOfClient, presi random dall'array colors
    // e/o generati randomicamente al volo con un bell'algoritmo inventato
    for (let i = 0; i < numberOfClient; i++) {
      if (colors.length === 0) {
        let colorIndex = toInteger((i * Math.random() + 1) * (0xFFFFFF / numberOfClient) * Math.random());
        let targetColor = '#' + colorIndex.toString(16).substring(0, 6);
        while (targetColor.length <= 6) {
          targetColor += toInteger(Math.random() * 10).toString().substring(0, 1);
        }
        targetColors.push(targetColor);
      } else {
        let targetColorIndex = toInteger(Math.random() * colors.length) - 1;
        if (targetColorIndex < 0) {
          targetColorIndex = 0;
        }
        let targetColor = colors[targetColorIndex];
        colors.splice(targetColorIndex, 1);
        targetColors.push(targetColor);
      }
    }
    return targetColors;
  }

  // restituisce un array di 14 colori human-readable
  fulFillCustomersColors(): string[] {
    let colors: string [];
    colors = [
      '#00ffff',
      '#008b8b',
      '#9932cc',
      '#ff00ff',
      '#ffd700',
      '#008000',
      '#00ff00',
      '#000080',
      '#808000',
      '#F7464A',
      '#FDB45C',
      '#0971B2',
      '#ab7967'
    ];
    return colors;
  }

  // ri-setta gli angoli della mappa con quelli nuovi e, se l'utente ha cliccato almeno una volta sul bottone "Ask for Positions",
  // manda richiesta al server
  getPoints($event) {
    this.generalPoints = $event;
    if (this.count >= 1) {
      this.askPositions(this.startDate, this.endDate, this.startTime, this.endTime, $event, false);
    }
  }

  // Conta il numero di volte che l'utente ha cliccato sul bottone "Ask for Positions"
  countClick() {
    this.count++;
  }

  // Resetta il contatore del numero di volte in cui l'utente ha cliccato sul bottone "Ask for Positions"
  resetCountClick() {
    this.count = 0;
  }

  createTimestampFromDate(startDate: number, endDate: number, startTime: any, endTime: any): any[] {
    if (startTime === undefined) {
      startTime = {hour: 14, minute: 30, second: 0};
    }
    if (endTime === undefined) {
      endTime = {hour: 14, minute: 30, second: 0};
    }
    let startD = new Date(startDate * 1000);
    let endD = new Date(endDate * 1000);
    let from = new Date(Date.UTC(startD.getUTCFullYear(), startD.getUTCMonth(), startD.getUTCDate(), startTime.hour, startTime.minute));
    let to = new Date(Date.UTC(endD.getUTCFullYear(), endD.getUTCMonth(), endD.getUTCDate(), endTime.hour, endTime.minute));
    let startTimestamp = from.getTime() / 1000;
    let endTimestamp = to.getTime() / 1000;
    let FromEndTimestamp = [];
    FromEndTimestamp.push(startTimestamp);
    FromEndTimestamp.push(endTimestamp);
    return FromEndTimestamp;
  }

  // Aggiorna (setta) il contatore delle posizioni quando il poligono viene disegnato/cancellato sulla mappa
  updateCounterOnDrawDeletePolygon(p: number) {
    if (p === undefined) {    // il poligono è stato cancellato, quindi ritorna al vecchio numero delle posizioni
      this.totPositionsSelected = this.oldTotPostionsSelected;
    } else {
      this.totPositionsSelected = p;
    }
  }

  // Aggiorna (incrementa/decrementa) il contatore delle posizioni quando viene selezionato/deselezionato un utente dalla lista
  updateCounterOnCheckUncheckUser(p: number) {
    this.totPositionsSelected += p;
  }

  resetChildComponents($event) {
    this.router.navigateByUrl('/', {skipLocationChange: false}).then(() =>
      this.router.navigate(['/buyArchives']));
  }
}
