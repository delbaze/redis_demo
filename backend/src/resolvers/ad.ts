import { ILike } from "typeorm";
import Ad from "../entity/ad";
import { Arg, Mutation, Query, Resolver } from "type-graphql";
import { redisClient } from "../index";

@Resolver()
class AdResolver {
  @Query(() => [Ad])
  async getAllAdsByKeyword(@Arg("keyword") keyword: string) {
    const cacheResult = await redisClient.hGetAll(keyword);
    if (
      cacheResult !== null &&
      Number.parseInt(cacheResult.timestamp) >= Date.now() - 1000 * 10 // 10 seconds cache
    ) {
      console.log("from cache");
      return JSON.parse(cacheResult.data);
    } else {
      const dbResult = await Ad.find({
        where: { description: ILike(`%${keyword}%`) },
      });
      redisClient.hSet(keyword, {
        data: JSON.stringify(dbResult),
        timestamp: Date.now(),
      });
      return dbResult;
    }
  }

  @Mutation(() => Ad)
  async createNewAd(
    @Arg("title") title: string,
    @Arg("description") description: string
  ) {
    return await Ad.save({ title, description });
  }
}
export default AdResolver;
