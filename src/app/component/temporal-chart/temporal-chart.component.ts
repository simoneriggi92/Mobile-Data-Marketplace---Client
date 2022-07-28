import {ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {Point} from 'leaflet';
import {UserDataService} from '../../service/user-data.service';
import {Subscription} from 'rxjs';

declare var google: any;

@Component({
  selector: 'app-temporal-chart',
  templateUrl: './temporal-chart.component.html',
  styleUrls: ['./temporal-chart.component.css']
})
export class TemporalChartComponent implements OnInit, OnDestroy, OnChanges {
  @Input() positionsDrawable: Point[] = []; // riceve la risposta del server dal padre
  timeChart;
  optionsTime2;
  noPos;
  textNoPos;
  approxPositionTimestamps;
  colorsForTemporalChart;
  userToBeUpdated: object;
  usersToBeUpdated;
  subscription: Subscription;
  dataTemp;
  drawPosTime = false;

  constructor(private data: UserDataService, private cd: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.userToBeUpdated = [];
    this.colorsForTemporalChart = new Set();
    this.usersToBeUpdated = new Map<string, object>();
    // Registrazione sulla variabile message del service UserDataService
    // (serve per la comunicazione tra componenti, in questo caso tra componenti fratelli,
    // infatti ogni comunicazione da parte di un componente registrato verrà visualizzata qui)
    this.subscription = this.data.currentMessage.subscribe(message => {
      this.userToBeUpdated = message;

      if (this.userToBeUpdated['usernameID'] !== 'all-user-dafault') {
        this.usersToBeUpdated.set(this.userToBeUpdated['usernameID'], this.userToBeUpdated);
        this.buildChart(true);
      }
    });
    google.charts.load('current', {'packages': ['corechart']});

    // rappresentazione temporale
    this.timeChart = document.getElementById('timeChart');
    this.noPos = document.createElement('h2');
    this.noPos.setAttribute('id', 'no-positions-time');
    this.noPos.setAttribute('class', 'no-positions');
    this.textNoPos = document.createTextNode('');
    this.buildChart(false);
  }

  deleteChart() {
    for (let i = 0; i < this.timeChart.childNodes.length; i++) {
      this.timeChart.removeChild(this.timeChart.childNodes[i]);
      this.noPos.appendChild(this.textNoPos);
      this.timeChart.appendChild(this.noPos);
      this.timeChart.setAttribute('style', 'height: auto');
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.colorsForTemporalChart = new Map();
    if (!changes.positionsDrawable.firstChange) {
      this.approxPositionTimestamps = changes.positionsDrawable.currentValue.timelineList;
      this.buildChart(false);
    }
  }


  // rappr temporale
  buildChart(update: boolean): void {
    let ticksAxisH = [];
    let ticksAxisV = [];
    let dates = [];

    if (this.approxPositionTimestamps != null && this.approxPositionTimestamps.length > 0) {
      if (this.approxPositionTimestamps.length === 1) {
        this.drawPosTime = false;
      }
      let maxDate;
      let minTime;
      let maxTime;
      let someDates = [];
      let j = 0;
      let n = 1;
      this.approxPositionTimestamps.forEach(p => {
        let d = new Date(p.timestamp * 1000);
        let h = d.getHours();
        let m = d.getMinutes();
        let tick = new Date(d.getTime());
        tick.setHours(0);
        tick.setMinutes(0);
        tick.setSeconds(0);

        let ok = 1;
        if (dates != null && dates.length > 0) {
          for (let z = 0; z < dates.length; z++) {
            if (dates[z].getTime() === tick.getTime()) {
              ok = 0;
              break;
            }
          }
        }
        if (ok) {
          // tslint:disable-next-line:max-line-length
          dates.push(tick);
          ticksAxisH.push({v: tick, f: tick});
        }
        // prepara l'array colors
        this.colorsForTemporalChart.set(p.subject_id, p.color);
      });


      // togli/aggiungi colore in base alla lista utenti
      this.usersToBeUpdated.forEach((value: object, key: string) => {
        let color = this.colorsForTemporalChart.get(key);
        if (color !== undefined) {
          if (value['toAdd'] === true) {
            this.colorsForTemporalChart.set(key, value['color']);
          } else {
            this.colorsForTemporalChart.set(key, 'del');
          }
        }
      });

      // crea array colori giusti
      let colors = [];
      let rightColors = [];
      colors = Array.from(this.colorsForTemporalChart.values());
      rightColors = colors.filter(c => {
        return c !== 'del';
      });

      if (rightColors.length !== 0) {
        this.optionsTime2 = {
          hAxis: {
            title: 'Dates',
            format: 'dd/MM/yyyy',
          },
          vAxis: {
            title: 'Time',
            format: 'HH:mm',
          },
          sizeAxis: {
            minSize: 10,
            maxSize: 10,
            maxValue: 3
          },
          explorer: { actions: ['dragToZoom', 'rightClickToReset'] },
          colors: rightColors
        };
        const chartFunc = () => new google.visualization.BubbleChart(this.timeChart);
        const func = (cb, opt) => {
          const data = [];
          if (this.approxPositionTimestamps != null && this.approxPositionTimestamps.length > 1) {
            this.drawPosTime = true;
            this.timeChart.setAttribute('style', 'height: 250px');
            this.dataTemp = [];
            this.approxPositionTimestamps.forEach(p => {
              let date = new Date(p.timestamp * 1000);
              let hours = date.getHours();
              let minutes = date.getMinutes();
              date.setHours(0);
              date.setMinutes(0);
              date.setSeconds(0);
              let date2 = new Date(date.getTime());

              let userToBeUpdated = this.usersToBeUpdated.get(p.subject_id);
              if (userToBeUpdated === undefined) {
                data.push(['', date, [hours, minutes, 0], p.alias]);
              } else {
                if (userToBeUpdated !== undefined && userToBeUpdated['toAdd'] === true) {
                  data.push(['', date, [hours, minutes, 0], p.alias]);
                }
              }
            });

            let headers = [];
            headers.push(['ID', 'Date', 'Rough time', 'Owner']);
            let headerAndData = headers.concat(data);
            const datatable = new google.visualization.arrayToDataTable(headerAndData);
            cb().draw(datatable, opt);
          } else {
            for (let i = 0; i < this.timeChart.childNodes.length; i++) {
              this.timeChart.removeChild(this.timeChart.childNodes[i]);
              this.noPos.appendChild(this.textNoPos);
              this.timeChart.appendChild(this.noPos);
              this.timeChart.setAttribute('style', 'height: auto');
              this.drawPosTime = false;
            }
          }
        };
        const callback = () => func(chartFunc, this.optionsTime2);
        google.charts.setOnLoadCallback(callback);
      } else {
        for (let i = 0; i < this.timeChart.childNodes.length; i++) {
          this.timeChart.removeChild(this.timeChart.childNodes[i]);
          this.noPos.appendChild(this.textNoPos);
          this.timeChart.appendChild(this.noPos);
          this.timeChart.setAttribute('style', 'height: auto');
          this.drawPosTime = false;

        }
      }
    }
  }
}
