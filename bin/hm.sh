#!/bin/bash

make_temp(){
    mktemp 2>/dev/null || mktemp -t $0
}

bed12_to_splicingCounts(){
    perl -ne '
    BEGIN { 
        my %junction=(); ## interaction between exons (splicing events)
    }
    chomp;
    my @a=split/\t/,$_;
    my $chr=$a[0]; my $start=$a[1]; my $end=$a[2]; my $score = $a[4]; my $strand =$a[5];
    my $n=$a[9]; my @sizes = split /,/,$a[10]; my @starts = split /,/,$a[11];
    if($n < 2){ next;}
    for(my $i=0;$i < $n-1; $i++){
        my $ss5 = $start+$starts[$i]+$sizes[$i]-1; 
        my $ss3 = $start+$starts[$i+1]+1;
        my $k = $chr."\t".$ss5."\t".$ss3;
        $junction{$k} += $score;
    }
    END { 
        foreach my $k ( keys %junction){
            print $k,"\t",$junction{$k},"\n";
        }
    }
    '
}
	

