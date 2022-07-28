export class Archive {
  id: string;
  aliasID: string;
  positions_id: string[];
  owner: string;
  n_sold: number;
  minTime: number;
  maxTime: number;
  uploadTime: number;
  positions_list: Position[];
  just_bought: boolean;
  price: number;

}
