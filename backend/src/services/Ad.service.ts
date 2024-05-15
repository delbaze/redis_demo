import Ad from "../entity/ad";
import dataSource from "../lib/dataSource";
import { ILike, Repository } from "typeorm";

export default class AdService {
  db: Repository<Ad>;
  constructor() {
    this.db = dataSource.getRepository(Ad);
  }

  async numberOfAds(): Promise<number> {
    return await this.db.count();
  }

  async findByDescription(keyword: string): Promise<Ad[]> {
    const dbResult = await this.db.find({
      where: { description: ILike(`%${keyword}%`) },
    });
    return dbResult;
  }

  async createAd({
    title,
    description,
  }: {
    title: string;
    description: string;
  }): Promise<Ad> {
    return await this.db.save({ title, description });
  }
}
