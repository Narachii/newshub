# newshub

Hi Developers!
This is the repository for newshub
Please follow the below instructions to start the application

### How to setup the application

#### Install the npm packages
```
npm install
```

#### Install and Start Mysql server
Install: Please follow the instruction from the mysql official document
https://dev.mysql.com/doc/refman/8.4/en/linux-installation.html

Run mysql:
```
sudo mysql
```

#### Install and Start Redis server
Install the redis server following the below commands
```bash
sudo apt-get install lsb-release curl gpg
curl -fsSL https://packages.redis.io/gpg | sudo gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg
sudo chmod 644 /usr/share/keyrings/redis-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/redis.list
sudo apt-get update
sudo apt-get install redis
```

Start the redis server once it's installed
```bash
sudo systemctl enable redis-server
sudo systemctl start redis-server
```
For more details please check the install manual:
https://redis.io/docs/latest/operate/oss_and_stack/install/install-redis/install-redis-on-linux/

### How to run the application
To launch the application, run the below forever command. The server starts running in the background process
```
forever start index.js
```
About Forever: https://www.npmjs.com/package/forever

### Secret Variables Setup
The application uses secret variables that must be initialized in a `.env` file. 
Create this file in your root directory and set up the following variables.
For the assignment evaluation, my environment settings are listed below:
```
# The api key to use the news api
# You can grant the key from https://newsapi.org/ after sign up
# For the assignment evaluation purpose, you can use my developer api key
NEWS_API_KEY=5ee7cb38f47c46c5b509253013ed2bc6
# The session secret
SESSION_SECRET=somerandomstuff
# The salt to be used for encryipting the user api key
SALT=nnara
# DB Config
DB_HOTST=localhost
DB_USER=newshub_app
DB_PASSOWRD=qwertyuiop
DB_NAME=newshub
```


### Data Setup
#### Create the source table records
By default, the source table, which is used to import news, is empty. 
You cannot import articles without any records in the source table.
To initialise the table, please call the `GET /news/import_source` API. 
This API fetches the available sources from the news API and creates the corresponding records in the source table. 
You only need to call this API once.

#### Request
```
curl localhost:8000/news/import_source
```

#### Response
```
{
	"status": "ok",
	"sources": [
		{
			"id": "abc-news",
			"name": "ABC News",
			"description": "Your trusted source for breaking news, analysis, exclusive interviews, headlines, and videos at ABCNews.com.",
			"url": "https://abcnews.go.com",
			"category": "general",
			"language": "en",
			"country": "us"
		},
		{
			"id": "abc-news-au",
			"name": "ABC News (AU)",
			"description": "Australia's most trusted source of local, national and world news. Comprehensive, independent, in-depth analysis, the latest business, sport, weather and more.",
			"url": "https://www.abc.net.au/news",
			"category": "general",
			"language": "en",
			"country": "au"
		}
	]
}
```

#### Create the news records
After setting up the source table, you are able to import articles in the application.
Please visit `localhost:8000/news/fetch` and submit the import form to see the contents.