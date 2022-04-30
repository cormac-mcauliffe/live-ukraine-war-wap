// Custom data cache for 3rd party data that self-resets on the backend at a regular interval so that
// the process of fetching data from the 3rd party is always kept decoupled from the client request.
class DataCache {
    constructor(fetchFunction, minutesUntilReset = 5) {
      this.millisecondsUntilReset = minutesUntilReset * 60 * 1000;
      this.fetchFunction = fetchFunction;
      this.getData = this.getData.bind(this);
      // Initialise the cache data store and reset the cache data store at a regular interval (default to every 5 minutes) with new data request to wikipedia.
      // Throw error if cache resetting process is taking longer than 10 seconds to fetch data from wiki and parse to GeoJSON 
      // Remember: arrow functions don't have their own 'this' binding. Instead, 'this' is 
      // looked up in scope just like a normal variable. That means you don't have to call '.bind'
      // Arrow functions establish 'this' based on the scope the arrow function is defined within, not the context in which it is executed.
      this.cacheSelfReset = async () => {
        try {
          let t0 = performance.now();
          this.cache = await this.fetchFunction();
          let t1 = performance.now();
          if ( t1 - t0 > 10000 ) {
            throw new Error(`Perf issue: Backend took ${t1 - t0} milliseconds to reset the cache via network fetch request`);
          }
          setTimeout(this.cacheSelfReset, this.millisecondsUntilReset);
        } 
        catch(error) {
          console.error(error);
        }
      }
      this.cacheSelfReset();
    }
    // method always returns a promise
    getData() {
      return Promise.resolve(this.cache);
    }
  }

  module.exports = { DataCache };