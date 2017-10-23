# ImmutableDB

ImmutableDB is an interface for content-addressed storage systems as databases.

## Table of Contents
- [Specification](#specification)
- [Interface](#interface)
  * [put (value)](#put--value-)
  * [get (key)](#get--key-)
- [Implementations](#implementations)
- [Contribute](#contribute)
- [License](#License)

## Specification

ImmutableDB is specified as:
1. ***same data always returns the same key*** (write)
2. ***same key always returns the same data*** (read)

The difference to traditional relational databases, document databases or key-value stores is that the ***key doesn't get specified explicitly*** by the user. Instead, the ***key gets calculated based on the data using a hashing function***. This is also called *[content-addressed storage](https://en.wikipedia.org/wiki/Content-addressable_storage)*.

In practice this means that saving `hello world` to an ImmutableDB will always return key `abc` regardless of which instance or location the data is saved at and saving `hello world!` will return `cba`. In turn, querying the value of key `abc` will always return `hello world`, regardless of instance and location. 

## Interface

### put (value)

Save `value` to database and return a `key`.

Example:
```js
var key = put("hello world")
console.log(key)
// "abc"
```

### get (key)

Retrieve the value of `key` from the database.

Example:
```js
var data = get("abc")
console.log(data)
// "hello world"
```

## Implementations

ImmutableDB can be used via the following implementations:
- [immutabledb-fs](https://github.com/haadcode/immutabledb/blob/master/src/immutabledb-fs.js) - Uses local file system as the storage backend
- [immutabledb-ipfs](https://github.com/haadcode/immutabledb/blob/master/src/immutabledb-ipfs.js) - Uses [IPFS](https://ipfs.io) as the storage backend
- [immutabledb-ipld](https://github.com/haadcode/immutabledb/blob/master/src/immutabledb-ipld.js) - In-memory storage that uses [IPLD](https://ipld.io/) data structures
- [immutabledb-leveldb](https://github.com/haadcode/immutabledb/blob/master/src/immutabledb-leveldb.js) - Uses [LevelDB](http://leveldb.org/) as the storage backend
- [immutabledb-mongodb](https://github.com/haadcode/immutabledb/blob/master/src/immutabledb-mongodb.js) - Uses [MongoDB](https://www.mongodb.com/) as the storage backend
- [immutabledb-redis](https://github.com/haadcode/immutabledb/blob/master/src/immutabledb-redis.js) - Uses [Redis](https://redis.io/) as the storage backend
- [immutabledb-tendermint](https://github.com/haadcode/immutabledb/blob/master/src/immutabledb-tendermint.js) - Uses [Tendermint](https://tendermint.com/) as the storage backend
- [immutabledb-mem](https://github.com/haadcode/immutabledb/blob/master/src/immutabledb-mem.js) - In-memory storage (useful eg. for testing)

## Contribute

New backend implementations, PRs and [discussion](https://github.com/haadcode/immutabledb/issues) are gladly accepted!

## License

[MIT](LICENSE) © 2017 [Haad](https://github.com/haadcode)
