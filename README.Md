sudo npx prisma generate
sudo npx prisma db push

npm run migrate:test "run this set tables in test database"

https://accounts.google.com/o/oauth2/auth/oauthchooseaccount?client_id=1053607870191-1ik0cjr00t8p1hjiljqef53r5vfk13t1.apps.googleusercontent.com&response_type=code&redirect_uri=https%3A%2F%2Fcodedamn.com%2Fapi%2Fauthorize%2Fgoogle&scope=email%20profile&state=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXBsb3ltZW50QXJlYSI6InByb2R1Y3Rpb24iLCJzdGFnaW5nT25seUZpbmFsUmVkaXJlY3RIb3N0bmFtZSI6ImxlYXJuLmNvZGVyc2d5YW4uY29tIiwidHlwZSI6ImZlcm1pb24tc2Nob29sIiwiZmVybWlvblNjaG9vbElkIjoiNjY1NGFmNTQ0MmNjNzk3NjU0OTgwNTc4IiwiaWF0IjoxNzMwODMxMzY1LCJleHAiOjE3MzA4MzMxNjV9.kEfTuspYYjEGJY1HTyVNgouUrC6MFl-xRWd_odqjRF0&service=lso&o2v=1&ddm=1&flowName=GeneralOAuthFlow

fermion ka oauth

docker build -t auth_service:dev -f docker/dev/Dockerfile .

docker build -t auth_service:dev -f docker/prod/Dockerfile .

docker run --rm -it -v $(pwd):/usr/src/app -v /usr/src/app/node_modules --env-file $(pwd)/.env -p 5501:5501 -e NODE_ENV=development auth_service:dev

docker run --rm -it -v $(pwd):/home/node/app -v /home/node/app/node_modules --env-file $(pwd)/.env -p 5501:5501 -e NODE_ENV=development auth_service:dev

docker run --rm -it --env-file $(pwd)/.env -p 5501:5501 -e NODE_ENV=development auth_service:dev

docker run --rm -it -p 5501:5501 -e NODE_ENV=development auth_service:dev

