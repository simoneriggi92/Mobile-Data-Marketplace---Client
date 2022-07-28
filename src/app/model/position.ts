export class Position {
  latitude: number;
  longitude: number;
  timestamp: number;

  constructor(latitude: number, longitude: number, timestamp: number){
    this.timestamp = timestamp;
    this.latitude = latitude;
    this.longitude = longitude;
  }


}
