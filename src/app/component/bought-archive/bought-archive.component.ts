import {Component, OnInit} from '@angular/core';
import {BuyArchiveService} from '../../service/buy-archive.service';
import {BoughtArchive} from '../../model/boughtArchive';
import {faDownload} from '@fortawesome/free-solid-svg-icons';
import {Archive} from '../../model/archive';
import {saveAs} from 'file-saver';
import {LoadArchiveService} from '../../service/load-archive.service';

@Component({
  selector: 'app-bought-archive',
  templateUrl: './bought-archive.component.html',
  styleUrls: ['./bought-archive.component.css']
})
export class BoughtArchiveComponent implements OnInit {

  faDownload = faDownload;
  boughtArchives: BoughtArchive[];

  constructor(private buyService: BuyArchiveService, private loadArchiveService: LoadArchiveService) {
  }

  ngOnInit() {
    this.showBoughtArchives();
  }

  showBoughtArchives() {
    this.buyService.getBoughtArchives().subscribe(
      (data: BoughtArchive[]) => {
        this.boughtArchives = data as BoughtArchive[];
      }
    );
  }

  downloadArchive(archiveId: string) {
    this.loadArchiveService.downloadBoughtArchive(archiveId).subscribe(
      (data: Archive) => {
        this.saveToFileSystem(data, data.aliasID);
      }
    );
  }

  private saveToFileSystem(data, filename) {
    const blob = new Blob([JSON.stringify(data)], {type: 'application/json'});
    saveAs(blob, filename + '.json');
  }

}
