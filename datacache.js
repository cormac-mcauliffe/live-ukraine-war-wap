class DataCache {
    constructor(fetchFunction, minutesUntilReset = 5) {
      this.millisecondsUntilReset = minutesUntilReset * 60 * 1000;
      this.fetchFunction = fetchFunction;
      this.getData = this.getData.bind(this);
      // Initialise the cache data store and reset the cache data store at a regular interval (default to every 5 minutes) with new data request to wikipedia
      // Remember: arrow functions don't have their own 'this' binding. Instead, 'this' is 
      // looked up in scope just like a normal variable. That means you don't have to call '.bind'
      // Arrow functions establish 'this' based on the scope the arrow function is defined within, not the context in which it is executed.
      this.cacheSelfReset = async () => {
        let t0 = performance.now();
        this.cache = await this.fetchFunction();
        let t1 = performance.now();
        console.log(`Time taken to reset cache on BE: ${t1 - t0} milliseconds.`);
        setTimeout(this.cacheSelfReset, this.millisecondsUntilReset);
      }
      this.cacheSelfReset();
    }
    // method always returns a promise
    getData() {
      console.log('cache hit');
      return Promise.resolve(this.cache);
    }
  }

  module.exports = { DataCache };