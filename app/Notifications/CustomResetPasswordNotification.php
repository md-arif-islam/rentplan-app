<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CustomResetPasswordNotification extends Notification {
    use Queueable;

    public $token;
    public $url;

    public function __construct( $token, $url ) {
        $this->token = $token;
        $this->url = $url;
    }

    public function via( $notifiable ) {
        return ['mail'];
    }

    public function toMail( $notifiable ) {
        return ( new MailMessage )
            ->subject( 'Reset Password Notification' )
            ->view(
                'emails.custom-reset',
                ['url' => $this->url,
                    'token' => $this->token]
            );
    }
}
