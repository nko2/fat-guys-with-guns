description "node server"

start on filesystem or runlevel [2345]
stop on runlevel [!2345]

respawn
respawn limit 10 5
umask 022

script
  HOME=/home/deploy
  . $HOME/.profile
  exec /usr/bin/node $HOME/app/current/app.js >> $HOME/app/shared/logs/node.log 2>&1

  exec /usr/bin/node $HOME/app/current/physicsserver.js 1337 >> $HOME/app/shared/logs/physics0.log 2>&1
  exec /usr/bin/node $HOME/app/current/physicsserver.js 1338 >> $HOME/app/shared/logs/physics1.log 2>&1
  exec /usr/bin/node $HOME/app/current/physicsserver.js 1339 >> $HOME/app/shared/logs/physics2.log 2>&1
end script

post-start script
  HOME=/home/deploy
  PID=`status node | awk '/post-start/ { print $4 }'`
  echo $PID > $HOME/app/shared/pids/node.pid
end script

post-stop script
  HOME=/home/deploy
  rm -f $HOME/app/shared/pids/node.pid
end script