#!/bin/bash
trap "exit" SIGINT

TIME=60

if [ $INTERVAL ]; then
	TIME=$INTERVAL
fi

if [ $# -gt 0 ]; then
	TIME=$1
fi

while :
do
	echo $(date) writing fortune to /html/index.html
	/usr/games/fortune > /html/index.html
	sleep $TIME
done