<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <style>
        @media only screen and (max-width: 600px) {
            .inner-body {
                width: 100% !important;
            }

            .footer {
                width: 100% !important;
            }
        }

        @media only screen and (max-width: 500px) {
            .button {
                width: 100% !important;
            }
        }

        body {
            box-sizing: border-box;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
            font-size: 16px;
            line-height: 1.4;
            margin: 0;
            padding: 0;
            text-align: left;
            width: 100% !important;
            background-color: #f8f8f8;
        }

        table {
            border-collapse: collapse;
        }

        .wrapper {
            width: 100%;
            background-color: #f8f8f8;
            margin: 0;
            padding: 0;
        }

        .content {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
        }

        .body {
            background-color: #ffffff;
            padding: 32px;
            border-radius: 16px;
        }

        .body h1 {
            color: #FF4847;
            font-size: 22px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 20px;
        }

        .body p {
            margin-bottom: 20px;
            color: #1D1E25;
        }

        .button {
            background-color: #FF4847;
            color: #ffffff !important;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 5px;
            display: inline-block;
            font-size: 16px;
            font-weight: bold;
        }

        .footer {
            text-align: center;
            padding: 20px;
            border-top: 1px solid #f8f8f8;
            font-size: 12px;
            color: #666666;
        }
    </style>
</head>

<body>
    <table class="wrapper" cellpadding="0" cellspacing="0">
        <tr>
            <td>
                <table class="content" cellpadding="0" cellspacing="0">
                    <!-- Header with logo -->
                    <tr>
                        <td align="center" style="padding: 20px 0;">
                            <img src="https://app.rentplan.nl/rentplan.png"
                                 alt="Rentplan Logo"
                                 width="200"
                                 style="display: block; width: 200px; height: auto;" />
                        </td>
                    </tr>

                    <!-- Body content -->
                    <tr>
                        <td class="body">
                            <h1>Reset Your Password</h1>
                            <p><strong>Hello!</strong></p>
                            <p>
                                You are receiving this email because we received a password reset request for your
                                account.
                            </p>
                            <p>To reset your password, click the button below:</p>

                            <!-- Reset button -->
                            <table cellpadding="0" cellspacing="0" align="center" style="margin-bottom: 20px;">
                                <tr>
                                    <td align="center">
                                        <a href="{{ $url }}" class="button" target="_blank">
                                            Reset Password
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p>
                                If the button doesn't work, copy and paste the following link into your browser:
                            </p>
                            <p>
                                <a href="{{ $url }}" style="color: #FF4847; text-decoration: none;">
                                    {{ $url }}
                                </a>
                            </p>
                            <p>
                                If you need further assistance, please don't hesitate to contact our support team.
                            </p>
                            <p>
                                Best regards,<br>
                                Rentplan Team
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td class="footer">
                            &copy; {{ date('Y') }} Rentplan. All Rights Reserved.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>

</html>
