#!/usr/bin/env bash

INFILE=$1 # the original source file
NUM=$2    # how many mutated files to make
PERCENT=$3 # what percent of bits to mutate

# default percent of 0.01
if [[ -z $PERCENT ]]
then
	PERCENT="0.01"
fi

for i in $(seq 1 $NUM)
do 

	i=$(printf "%09d" $i)

	zzuf -r "$PERCENT" -b 1-1000 -s $i < "$INFILE" > "$i-$INFILE"
done
