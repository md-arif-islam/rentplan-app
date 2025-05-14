<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command( 'sales-reports:generate' )
    ->daily();

Schedule::command( 'production-reports:generate' )
    ->daily();

Schedule::command( 'notify:sales-report-submission' )
    ->daily();

Schedule::command( 'notify:sample-dates' )
    ->daily();