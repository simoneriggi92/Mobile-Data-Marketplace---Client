import {Component, OnInit, ViewChild} from '@angular/core';
import {faDownload, faFileUpload, faTrashAlt} from '@fortawesome/free-solid-svg-icons';
import {LoadArchiveService} from '../../service/load-archive.service';
import {Archive} from '../../model/archive';
import {saveAs} from 'file-saver';
import {Subject} from 'rxjs';
import {debounceTime} from 'rxjs/operators';
import {InputRangeDatePickerComponent} from '../input-range-date-picker/input-range-date-picker.component';


@Component({
  selector: 'app-load-archive',
  templateUrl: './load-archive.component.html',
  styleUrls: ['./load-archive.component.css']
})
export class LoadArchiveComponent implements OnInit {

  faFileUpload = faFileUpload;
  archives: Archive[];
  faTrash = faTrashAlt;
  faDownload = faDownload;
  start = -1;
  end: number;
  dangerMessage: string;
  successMessage: string;
  filter: boolean;
  reset = true;
  @ViewChild(InputRangeDatePickerComponent)
  private inputRangeDatetimePickerComponent: InputRangeDatePickerComponent;
  private _success = new Subject<string>();
  private _error = new Subject<string>();

  constructor(private loadArchiveService: LoadArchiveService) {
  }

  ngOnInit() {
    this.getArchives();
    this._success.subscribe((message) => this.successMessage = message);
    this._success.pipe(
      debounceTime(5000)
    ).subscribe(() => this.successMessage = null);
    this._error.subscribe((message) => this.dangerMessage = message);
    this._error.pipe(
      debounceTime(5000)
    ).subscribe(() => this.dangerMessage = null);
  }

  getArchives() {
    this.loadArchiveService.getArchives().subscribe(
      archives => {
        this.archives = archives;
      });
  }

  importFile(event) {

    if (event.target.files.length === 0) {
      return;
    }
    let file = event.target.files[0];
    let reader = new FileReader();
    reader.onload = (ev: any) => {
      let localUrl = ev.target.result;
      this.loadArchiveService.loadArchive(localUrl).subscribe(
        (data) => {
          /*
           * data contiene il risultato della post che è un json fatto in questo modo:
           *    [
           *      {
           *        "allPositionValid":true,
           *        "invalidList":[],
           *        "archiveIdList":["5c5db4e497de8f1b6ddc7132"]
           *      }
           *    ]
           * di cui a me interessa il campo archiveIdList
           */
          if (data !== 'archive_refused' && data !== 'error_connection') {
            const archiveIdList = data[0]['archiveIdList'];
            this.showArchives();
            // stampo messaggio di successo
            if (data[0]['allPositionValid'] === false) {
              this._success.next('Successful upload! Some positions has been refused');
            } else {
              this._success.next('Successful upload!');
            }
          } else {
            this._error.next('Sorry! Your archive has not been accepted');
          }
        }
      );
    };
    reader.readAsText(file);
  }

  showArchives() {
    this.inputRangeDatetimePickerComponent.myForm.reset();
    this.filter = false;
    this.reset = true;
    this.loadArchiveService.getArchives().subscribe(
      (archive) => {
        this.archives = archive;
      }
    );
  }

  deleteArchive(archive: Archive) {
    this.loadArchiveService.deleteArchive(archive.id);
    this.archives = this.archives.filter(a => a !== archive);
    this.loadArchiveService.deleteArchive(archive.id).subscribe();
  }

  deleteAllArchives() {
    this.loadArchiveService.deleteAllArchives();
  }


  downloadArchive(archiveId: string) {
    this.loadArchiveService.downloadLoadedArchive(archiveId).subscribe(
      (data: Archive) => {
        this.saveToFileSystem(data, data.id);
      }
    );
  }

  private saveToFileSystem(data, filename) {
    const blob = new Blob([JSON.stringify(data)], {type: 'application/json'});
    saveAs(blob, filename + '.json');
  }

  private filterArchives(start, end): any {
    let startD = new Date(start * 1000);
    let endD = new Date(end * 1000);
    let from = new Date(Date.UTC(startD.getUTCFullYear(), startD.getUTCMonth(), startD.getUTCDate(), 0, 0 ));
    let to = new Date(Date.UTC(endD.getUTCFullYear(), endD.getUTCMonth(), endD.getUTCDate(), 23, 59));
    let startTimestamp = from.getTime() / 1000;
    let endTimestamp = to.getTime() / 1000;

    this.filter = true;
    let filteredArchives: Archive[] = [];
    if (this.archives.length !== 0) {
      for (let archive of this.archives) {
        if (archive.uploadTime >= startTimestamp && archive.uploadTime <= endTimestamp) {
          filteredArchives.push(archive);
        }
      }
      this.archives = filteredArchives;
    }
  }
}
