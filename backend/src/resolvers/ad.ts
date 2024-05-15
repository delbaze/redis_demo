import { ILike } from "typeorm";
import Ad from "../entity/ad";
import { Arg, Mutation, Query, Resolver } from "type-graphql";
import { redisClient } from "../index";

@Resolver()
class AdResolver {
  @Query(() => [Ad])
  async getAllAdsByKeyword(@Arg("keyword") keyword: string) {
    const cacheResult = await redisClient.hGetAll(keyword);
    if (Object.keys(cacheResult).length > 0) {
      return JSON.parse(cacheResult.data);
    } else {
      const dbResult = await Ad.find({
        where: { description: ILike(`%${keyword}%`) },
      });
      redisClient.hSet(keyword, {
        data: JSON.stringify(dbResult),
      });
      redisClient.expire(keyword, 10); // expire après 10 secondes
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
