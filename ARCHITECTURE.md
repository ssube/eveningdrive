start main:
  load config

  if master:
    start worker
    start server
  else if worker:
    bind event channels
  else if server:
    bind http

start worker:
  fork worker process

start server:
  fork server process

bind event channels:
  for each transform:
    bind queue for transform

bind http:
  set up endpoints
  launch http server
