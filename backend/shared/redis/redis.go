package redis

import (
	"context"

	"github.com/redis/go-redis/v9"
)

func ConnectRedis(
	ctx context.Context,
	addr string,
	password string,
	db int,
) (*redis.Client, error) {

	rdb := redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: password,
		DB:       db,
	})

	err := rdb.Ping(ctx).Err()

	return rdb, err
}