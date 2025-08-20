sudo npx prisma generate
sudo npx prisma db push

npm run migrate:test "run this set tables in test database"

docker build -t auth_service:dev -f docker/dev/Dockerfile .

docker build -t auth_service:dev -f docker/prod/Dockerfile .

docker run --rm -it -v $(pwd):/usr/src/app -v /usr/src/app/node_modules --env-file $(pwd)/.env -p 5501:5501 -e NODE_ENV=development auth_service:dev

docker run --rm -it -v $(pwd):/home/node/app -v /home/node/app/node_modules --env-file $(pwd)/.env -p 5501:5501 -e NODE_ENV=development auth_service:dev

docker run --rm -it --env-file $(pwd)/.env -p 5501:5501 -e NODE_ENV=development auth_service:dev

docker run --rm -it -p 5501:5501 -e NODE_ENV=development auth_service:dev


lets test