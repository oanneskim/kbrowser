#!/usr/bin/env bash
bam_to_bed12_interval(){
	bam=$1; interval=$2;
	samtools view -b $bam $interval | bamToBed -bed12
}
bam_to_bed12_interval $1 $2
