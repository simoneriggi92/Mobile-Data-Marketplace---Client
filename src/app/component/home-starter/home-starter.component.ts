import {Component, OnInit} from '@angular/core';
import {faCoins, faFileUpload, faMapMarkerAlt, faMobileAlt} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-home-starter',
  templateUrl: './home-starter.component.html',
  styleUrls: ['./home-starter.component.css']
})
export class HomeStarterComponent implements OnInit {
  faMapMarkerAlt = faMapMarkerAlt;
  faMobileAlt = faMobileAlt;
  faFileUpload = faFileUpload;
  faCoins = faCoins;

  constructor() {
  }

  ngOnInit() {
  }

}
