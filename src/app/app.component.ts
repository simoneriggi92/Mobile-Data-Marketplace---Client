import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
// Per visualizzare l'app da un host che è connesso sulla stessa rete locale dell'host dove è stata fatta partire
// l'app, da terminale, nella directory del progetto lanciare il seguente comando:
// ng serve --host=IP_CLIENT, dove IP_CLIENT è l'IP dell'host su cui gira l'app client
export class AppComponent implements OnInit {

  constructor(public router: Router) {}

  ngOnInit(): void {
  }
}
