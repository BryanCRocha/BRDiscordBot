/**
 * Helper functions
 */
module.exports = {
    readModuleFile: readModuleFile,
    writeModuleFile: writeModuleFile,
    shuffle: shuffle,
    chunkify: chunkify
  };


var fs = require('fs');

/**
 * Read in contents of a file
 * @param {String} path to the file
 * @param {function} callback function
 */
function readModuleFile(path, callback) {
    try {
        let fileName = require.resolve(path);
        fs.readFile(fileName, 'utf8', callback);
    } catch (e) {
        callback(e);
    }
}

/**
 * Write contents to a file
 * @param {String} path to the file
 * @param {function} callback function
 */
function writeModuleFile(path, content, callback) {
    try {
        let fileName = require.resolve(path);
        fs.writeFile(fileName, content, callback);
    } catch (e) {
        callback(e);
    }
}

/**
 * Given an array, returns a randomized order version of that array.
 * 
 * @param {array} array is the input array/
 */
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
  }
  
  /**
   * Given an array, returns an array of arrays that break the input array into the specified
   * number of parts.
   * 
   * @param {array} a is the input array.
   * @param {number} n is the number of equal length arrays to split it into.
   * @param {boolean} balanced indicates if the output arrays should be as equal as possible (as opposed to having a smaller final array).
   */
  function chunkify(a, n, balanced) {
    if (n < 2)
        return [a];
  
    var len = a.length,
        out = [],
        i = 0,
        size;
  
    if (len % n === 0) {
        size = Math.floor(len / n);
        while (i < len) {
            out.push(a.slice(i, i += size));
        }
    }
    else if (balanced) {
        while (i < len) {
            size = Math.ceil((len - i) / n--);
            out.push(a.slice(i, i += size));
        }
    }
    else {
        n--;
        size = Math.floor(len / n);
        if (len % size === 0)
            size--;
        while (i < size * n) {
            out.push(a.slice(i, i += size));
        }
        out.push(a.slice(size * n));
    }
  
    return out;
  }
  