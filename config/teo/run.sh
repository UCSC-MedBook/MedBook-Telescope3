export MONGO_URL="mongodb://localhost:27017/MedBook"

if [ -z "$1" ]; then
    meteor --port 3013
else
    meteor $1 --port 3013
fi
