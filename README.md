# eveningdriver
### Streaming ETL using webhooks

eveningdriver is a simple ETL tool operating on JSON data, streaming events
through a series of transformation steps. Incoming data is received from
webhooks or scheduled steps and passed on, being transformed or output by
each step along the way.

eveningdriver uses redis as a backend to provide a reliable, atomic queue
of events to be processed. The event-driven model allows each step to run
independently across processes or machines, allowing the system to scale
as far as the queue will.

## Event Flow
New events are produced by the REST API, acting as a webhook, or scheduled
steps. Other steps poll for new events, transforming each as they are put
on the queue. Each step can choose to output a new event, typically based
on the incoming one, to be picked back up.
