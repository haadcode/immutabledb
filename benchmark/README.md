# orbit-db benchmarks

Test `put` performance by adding events to the database as fast as possible.

##### Hardware

Macbook Pro, early 2015, 2.9GHz Intel Core i5, 16GB RAM, APPLE SSD SM0512G, Journaled HFS+, OS X El Capitan (10.11.6)

##### Software

Node.js v8.1.4

##### Date

16.08.2017

##### Method

Run `node benchmark/benchmark-<backend>.js` and let it run for 60 seconds. Take the
second highest 10-second average.

##### Results

|Backend     |Writes/s|
|------------|-------:|
|mem         |  38 000|
|mem-ipld    |  28 000|
|leveldb     |  16 500|
|redis       |   5 300|
|mongodb     |   3 500|
|fs          |     580|
|ipfs        |      74|
|tendermint  |       1|

*IPFS and FileSystem resulted with 590 writes/s and 2300 writes/s respectively when ran with Node.js v6.10.3*
