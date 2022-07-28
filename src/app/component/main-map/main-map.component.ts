import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import * as L from 'leaflet';
import {LatLng, latLng, Map, Point, tileLayer} from 'leaflet';
import {Position} from '../../model/position';
import {ApproxPositionModel} from '../../model/approx-position.model';
import {PositionsResponseContainer} from '../../model/positions-response-container';
import {ResourceService} from '../../service/resource.service';
import '@asymmetrik/ngx-leaflet';
import 'leaflet.markercluster';
import {Subscription} from 'rxjs';
import {UserDataService} from '../../service/user-data.service';

@Component({
  selector: 'app-main-map',
  templateUrl: './main-map.component.html',
  styleUrls: ['./main-map.component.css']
})
export class MainMapComponent implements OnInit, OnChanges {
  map: Map;
  legend;
  subscription: Subscription;
  userToBeUpdated: object;
  usersToBeUpdated;
  approxPositionsList;
  colorsForMap;
  enableDraw: boolean;
  totPositionsSelected = 0;
  positionPoints;
  polygonPoints: Position[];
  drawControl: L.Control.Draw;
  originalDrawControl: L.Control.Draw;
  positionPointsInsightPolygon;
  polygonID;
  drawed = false;

  @Input() positionsDrawable: Point[] = []; // // riceve la risposta del server dal padre
  @Output() pointsPolygonToParent = new EventEmitter<Position[]>(); // create event that we will sent to the parent
  @Output() pointsPolygonDrawed = new EventEmitter<Position[]>();
  @Output() isDrawed = new EventEmitter<boolean>();
  @Output() sendPoints = new EventEmitter<Position[]>(); // create event that we will sent to the parent
  @Output() onDrawDeletePolygon = new EventEmitter<number>();
  @Output() onCheckUncheckUser = new EventEmitter<number>();
  @Input() totP: number;
  first: LatLng;
  second: LatLng;
  third: LatLng;
  fourth: LatLng;

  featureGroup = L.featureGroup();
  layers = [this.featureGroup];

  drawOptions = {
    position: 'topright',
    draw: {
      marker: false,
      polyline: false,
      circle: false,
      circlemarker: false
    },
    edit: {
      featureGroup: this.featureGroup,
      edit: false
    }
  };

  options = {
    layers: [
      tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        detectRetina: true
      })
    ],
    zoom: 7.5,
    center: latLng([45, 8])
  };

  markerClusterGroup = L.markerClusterGroup({});
  markerClusterData: any[] = [];
  markerClusterOptions: L.MarkerClusterGroupOptions;

  constructor(private resourceService: ResourceService, private data: UserDataService) {
  }

  markerClusterReady(group: L.MarkerClusterGroup) {
    this.markerClusterGroup = group;
  }

  ngOnInit() {
    this.legend = new (L.Control.extend({
      options: {position: 'bottomright'}
    }));
    this.polygonPoints = [];
    this.positionPoints = [];
    this.positionPointsInsightPolygon = [];
    this.totPositionsSelected = 0;
    this.colorsForMap = [];
    this.usersToBeUpdated = [];
    // Registrazione sulla variabile message del service UserDataService
    // (serve per la comunicazione tra componenti, in questo caso tra componenti fratelli,
    // infatti ogni comunicazione da parte di un componente registrato verrà visualizzata qui)
    this.subscription = this.data.currentMessage.subscribe(message => {
      this.userToBeUpdated = message;
      let found = false;
      if (this.userToBeUpdated['usernameID'] !== 'all-user-dafault') {
        for (let i = 0; i < this.usersToBeUpdated.length; i++) {
          if (this.usersToBeUpdated[i]['usernameID'] === this.userToBeUpdated['usernameID']) {
            this.usersToBeUpdated[i]['toAdd'] = this.userToBeUpdated['toAdd'];
            found = true;
            break;
          }
        }
        if (!found) {
          this.usersToBeUpdated.push(this.userToBeUpdated);
        }
        this.addApproxMarker(this.approxPositionsList, true, this.userToBeUpdated);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    // inserisci numero di posizioni selezionate su mappa come fosse legenda
    if (changes.totP !== undefined && !changes.totP.firstChange && changes.totP.currentValue !== undefined) {
      this.totP = changes.totP.currentValue;
      let that = this;
      this.legend.onAdd = function () {
        let tP = that.totP;
        let div = L.DomUtil.create('div', 'col-md-15');
        // tslint:disable-next-line:max-line-length
        div.innerHTML = '<div><span class="badge badge-primary badge-pill"><h5>Number of positions selected: <span class="badge badge-success badge-pill"><b><font size="5">' + tP + '</font></b></span></h5></span></div><br/><br/><br/>';
        return div;
      };
      this.map.removeControl(this.legend);
      this.legend.addTo(this.map);
    }
    // acquisisci nuove posizioni
    if (changes.positionsDrawable !== undefined && !changes.positionsDrawable.firstChange) {
      this.approxPositionsList = changes.positionsDrawable.currentValue.approxPositionsList;
      this.addApproxMarker(this.approxPositionsList, false, null);
    }
  }

  // Allo spostamento della mappa, setta i 4 punti angolo della mappa e li manda al padre.
  onMapMove(map: any) {
    this.first.lat = this.map.getBounds().getNorthWest().lat;
    this.first.lng = this.map.getBounds().getNorthWest().lng;
    this.second.lat = this.map.getBounds().getNorthEast().lat;
    this.second.lng = this.map.getBounds().getNorthEast().lng;
    this.third.lat = this.map.getBounds().getSouthEast().lat;
    this.third.lng = this.map.getBounds().getSouthEast().lng;
    this.fourth.lat = this.map.getBounds().getSouthWest().lat;
    this.fourth.lng = this.map.getBounds().getSouthWest().lng;

    let point0 = new Position(this.first.lat, this.first.lng, 0);
    let point1 = new Position(this.second.lat, this.second.lng, 0);
    let point2 = new Position(this.third.lat, this.third.lng, 0);
    let point3 = new Position(this.fourth.lat, this.fourth.lng, 0);

    let points: Position[] = [];
    points.push(point0);
    points.push(point1);
    points.push(point2);
    points.push(point3);

    if (!this.drawed) {
      this.polygonPoints = points;
    }
    this.sendPoints.emit(points);


  }

  // Al caricamento della mappa, setta i 4 punti angolo della mappa e li manda al padre.
  onMapReady(map: Map) {
    this.map = map;
    this.first = new LatLng(map.getBounds().getNorthWest().lat, map.getBounds().getNorthWest().lng);
    this.second = new LatLng(map.getBounds().getNorthEast().lat, map.getBounds().getNorthEast().lng);
    this.third = new LatLng(map.getBounds().getSouthEast().lat, map.getBounds().getSouthEast().lng);
    this.fourth = new LatLng(map.getBounds().getSouthWest().lat, map.getBounds().getSouthWest().lng);

    let point0 = new Position(this.first.lat, this.first.lng, 0);
    let point1 = new Position(this.second.lat, this.second.lng, 0);
    let point2 = new Position(this.third.lat, this.third.lng, 0);
    let point3 = new Position(this.fourth.lat, this.fourth.lng, 0);

    let points: Position[] = [];
    points.push(point0);
    points.push(point1);
    points.push(point2);
    points.push(point3);

    if (!this.drawed) {
      this.polygonPoints = points;
    }
    this.pointsPolygonToParent.emit(points);
  }

  // Aggiunge i marker approssimativi sulla mappa, sia quando riceve dal padre sia quando riceve dalla lista
  addApproxMarker(p: any[], update: boolean, updatedUser: object) {
    if (p === undefined) {
      this.markerClusterData = [];
    } else {
      let positions: ApproxPositionModel[];
      positions = [];
      const data: any[] = [];
      this.positionPoints = [];

      for (let i = 0; i < p.length; i++) {
        positions = p[i];

        for (let item of positions) {
          let circle = new L.CircleMarker([item.position.y, item.position.x], {color: item.color});
          // circle.addEventListener('click', function () {
            // circle.addinfowindow.open(this.map, circle);
          // });
          // tslint:disable-next-line:max-line-length
          circle.bindTooltip('Rough latitude: ' + item.position.y + '<br />' + 'Rough longitude: ' + item.position.x).openTooltip([item.position.y, item.position.x]);

          let toAdd = true;
          for (let j = 0; j < this.usersToBeUpdated.length; j++) {
            if (this.usersToBeUpdated[j]['usernameID'] === item.subject_id && this.usersToBeUpdated[j]['toAdd'] === false) {
              toAdd = false;
              break;   // ci possono essere username con più posizioni che quindi non vanno messe!
            }
          }
          if (toAdd) {
            data.push(circle);

          }
          this.positionPoints = data;
          this.markerClusterData = data; // mette i marker nel marker cluster
        }
      }
      if (update) {
        this.updateCounterOnCheckUncheckUser(updatedUser);
        this.pointsPolygonDrawed.emit(this.polygonPoints); // [?]
        this.isDrawed.emit(this.drawed);                   // [?]
      }
    }
  }

  // Funzione che intercetta il disegno del poligono sulla mappa come evento
  public onDrawCreated(e: any) {
    this.polygonID = e.layer._leaflet_id;
    this.drawControl.setDrawingOptions({
      rectangle: false,
      polygon: false
    });
    this.drawControl.addTo(this.map);
    this.polygonPoints = [];

    for (let item of e.layer._latlngs[0]) {
      let point = new Position(item.lat, item.lng, null);
      point.timestamp = 0;
      this.polygonPoints.push(point);
    }
    this.updateCounterOnDrawPolygon();
    this.pointsPolygonDrawed.emit(this.polygonPoints);
    this.drawed = true;
    this.isDrawed.emit(this.drawed);
  }

  // Funzione che intercetta la cancellazione del disegno sulla mappa  come evento
  // è responsabile del restore del contatore delle posizioni del padre al valore esistente prima della creazione del poligono
  onDrawDeleted(event: any) {
    this.polygonID = undefined;
    if (this.featureGroup.getLayers().length === 0) {
      this.drawControl.setDrawingOptions({
        rectangle: {},
        polygon: {},
      });
      this.drawControl.addTo(this.map);
    }
    this.resetTotPositionsCounter();
    this.pointsPolygonDrawed.emit([]);
    this.drawed = false;
    this.isDrawed.emit(this.drawed);
  }

  // Questo metodo viene invocato per vedere quante posizioni stanno dentro la mappa o al poligono.
  // Questo valore viene passato al padre che setterà il suo contatore delle posizioni.
  updateCounterOnDrawPolygon() {
    this.positionPointsInsightPolygon = [];
    this.totPositionsSelected = 0;

    for (let k = 0; k < this.positionPoints.length; k++) {
      let x = this.positionPoints[k]['_latlng'].lat;
      let y = this.positionPoints[k]['_latlng'].lng;

      let inside = false;
      for (let i = 0, j = this.polygonPoints.length - 1; i < this.polygonPoints.length; j = i++) {
        let xi = this.polygonPoints[i]['latitude'], yi = this.polygonPoints[i]['longitude'];
        let xj = this.polygonPoints[j]['latitude'], yj = this.polygonPoints[j]['longitude'];

        let intersect = ((yi > y) !== (yj > y))
          && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) {
          inside = !inside;
        }
      }
      if (inside) {
        this.totPositionsSelected++;
      }
    }

    this.onDrawDeletePolygon.emit(this.totPositionsSelected);
  }

  // Questo metodo viene invocato al seguito della notifica da parte della user-list ai componenti registrati al service
  // che un utente è stato selezionato/deselezionato e comunica al padre di aggiornare il contatore delle posizioni,
  // dopo aver fatto opportuni controlli.
  // Se l'utente viene selezionato/deselezionato dalla lista (check/uncheck), per ogni sua posizione dentro la mappa o il poligono,
  // il contatore della mappa viene incrementato/decrementato (il contatore del padre viene incrementato/decrementato di quel valore).
  // Se l'utente viene selezionato/deselezionato dalla lista (check/uncheck), per ogni sua posizione al di fuori della mappa o del poligono,
  // il contatore della mappa non viene incrementato (il contatore del padre viene incrementato di 0).
  updateCounterOnCheckUncheckUser(updatedUser: any) {
    let userPositions = updatedUser['positions'];
    this.positionPointsInsightPolygon = [];
    this.totPositionsSelected = 0;
    for (let k = 0; k < userPositions.length; k++) {
      let x = userPositions[k]['y']; // è giusto che x e y siano invertite
      let y = userPositions[k]['x'];
      let inside = false;
      for (let i = 0, j = this.polygonPoints.length - 1; i < this.polygonPoints.length; j = i++) {
        let xi = this.polygonPoints[i]['latitude'], yi = this.polygonPoints[i]['longitude'];
        let xj = this.polygonPoints[j]['latitude'], yj = this.polygonPoints[j]['longitude'];

        let intersect = ((yi > y) !== (yj > y))
          && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) {
          inside = !inside;
        }
      }
      if (inside && updatedUser['toAdd'] === true) {
        this.totPositionsSelected++;
      }
      if (inside && updatedUser['toAdd'] === false) {
        this.totPositionsSelected--;
      }
    }
    this.onCheckUncheckUser.emit(this.totPositionsSelected);
  }

  resetTotPositionsCounter() {
    this.totPositionsSelected = undefined;
    this.onDrawDeletePolygon.emit(this.totPositionsSelected);
  }

  onDrawReady(drawControl: L.Control.Draw) {
    this.drawControl = drawControl;
    this.originalDrawControl = drawControl;
  }

  reset() {
    this.polygonPoints = [];
    this.positionPoints = [];
    this.markerClusterData = [];
    this.onDrawDeletePolygon.emit(null);
    this.map.eachLayer(layer1 => {
      if (layer1 !== this.options.layers[0]) {
        layer1.remove();
      }
    });
  }

  private getAllApproximatePositions() {
    this.resourceService.getAllApproximatePositions().subscribe(data => {
      let s: PositionsResponseContainer;
      s = data as PositionsResponseContainer;
      data.approxPositionsList.forEach(approxPosPerUserList => {
        this.addApproxMarker(approxPosPerUserList, null, null);
      });
    }, error => {
      console.log('errore: ', error);
    });
  }
}
