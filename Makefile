all: test

deps_common:
	mkdir ./deps
	cd deps && mkdir mongodb
	cd deps && mkdir tendermint
	### Redis
	cd deps && wget http://download.redis.io/releases/redis-stable.tar.gz
	cd deps && tar -xzvf redis-stable.tar.gz
	cd deps/redis-stable && make

deps_linux: deps_common
	### MongoDB 
	cd deps && wget http://downloads.mongodb.org/linux/mongodb-linux-x86_64-ubuntu1404-v3.4-latest.tgz
	cd deps && tar -xzvf mongodb-linux-x86_64-ubuntu1404-v3.4-latest.tgz -C mongodb --strip-components=1
	### Tendermint 
	cd deps && wget https://s3-us-west-2.amazonaws.com/tendermint/binaries/tendermint/v0.10.2/tendermint_0.10.2_linux_amd64.zip
	cd deps && unzip tendermint_0.10.2_linux_amd64.zip -d tendermint
	npm install

deps_osx: deps_common
	### MongoDB 
	cd deps && wget http://downloads.mongodb.org/osx/mongodb-osx-ssl-x86_64-v3.4-latest.tgz
	cd deps && tar -xzvf mongodb-osx-ssl-x86_64-v3.4-latest.tgz -C mongodb --strip-components=1
	### Tendermint 
	cd deps && wget https://s3-us-west-2.amazonaws.com/tendermint/binaries/tendermint/v0.10.2/tendermint_0.10.2_darwin_amd64.zip
	cd deps && unzip tendermint_0.10.2_darwin_amd64.zip -d tendermint
	npm install

test: deps_osx
	npm test

linux: deps_linux
	npm test

build: deps_osx
	npm run test:es6	

nodejs6: build

clean:
	rm -rf deps/
	rm -rf node_modules/
	rm -rf ./benchmark/ipfs-benchmark-data
	rm -rf ./benchmark/mongodb-benchmark-data
	rm -rf ./benchmark/leveldb-benchmark-data
	rm -rf ./benchmark/fs-benchmark-data
	rm -rf ./benchmark/tendermint-benchmark-data
	rm -rf build/

.PHONY: test
