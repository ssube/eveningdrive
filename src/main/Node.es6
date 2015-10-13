import Step from './Step';
import Event from './Event';

class Node {
  constructor(conn, steps = []) {
    this._conn = conn;
    this._steps = steps.map(step => new Step(step));
  }

  fetch(min, max) {
    let events = [];
    for (let i = min; i < max; ++i) {
      events.push(this._conn.get('event' + i));
    }
    return events;
  }

  persist(source, data) {
    let index = this.conn.nextIndex();
    this.conn.set('event' + index, data);

    let info = new EventInfo(index, source);
    return new Event(info, data);
  }

  update() {
    let latest = this._conn.latestIndex;
    this._steps.forEach(step => {
      let recent = step.last;
      // Get at most the next 10 events
      let max = Math.min(recent + 10, latest);
      return this.fetch(recent, max)
        .filter(event => step.accept(event))        // Pick out events the step is interested in
        .map(event => step.process(event.data))     // Process each relevant event
        .map(data => this.persist(step.id, data));  // Persist each event
    })
  }
}
