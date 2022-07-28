import {Component, OnInit} from '@angular/core';
import {faSlack} from '@fortawesome/free-brands-svg-icons';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  faSlack = faSlack;

  constructor() {
  }

  ngOnInit() {
  }

}
